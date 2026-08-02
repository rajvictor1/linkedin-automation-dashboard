import { NextResponse } from "next/server"
import { getOpenAI } from "@/lib/openai"
import { getFirecrawl } from "@/lib/firecrawl"
import type { CarouselResult, RankedArticle } from "@/lib/shared"

export async function POST(req: Request) {
  try {
    const { topic } = await req.json()
    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 })
    }

    const openai = getOpenAI()
    let firecrawl: ReturnType<typeof getFirecrawl> | null = null
    try {
      firecrawl = getFirecrawl()
    } catch {
      firecrawl = null
    }

    // 1. Generate 5-10 search keywords across tech categories
    const keywordCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a research strategist for a LinkedIn content studio. Given a topic, generate 5-10 specific search keywords that would surface recent, reputable articles about AI, agentic AI, automation, enterprise IT, AI agents, LLMs, robotics, cybersecurity, developer tools, and emerging technology. Return ONLY a JSON object with a key "keywords" containing an array of strings.`,
        },
        { role: "user", content: `Topic: ${topic}` },
      ],
      response_format: { type: "json_object" },
    })

    const keywordsRaw =
      keywordCompletion.choices[0].message.content || "{\"keywords\":[]}"
    const { keywords = [] } = JSON.parse(keywordsRaw) as { keywords?: string[] }
    const searchTerms = keywords.slice(0, 10)

    // 2. Discover articles via Firecrawl search
    let rawArticles: { title: string; url: string; source: string; snippet?: string }[] = []
    if (firecrawl) {
      for (const term of searchTerms) {
        try {
          const result = await firecrawl.search(term, { limit: 5 })
          const hits = ((result as { data?: unknown[] }).data || []).filter(
            (hit): hit is { title: string; url: string; source?: string; snippet?: string } =>
              typeof (hit as { url?: string }).url === "string" &&
              typeof (hit as { title?: string }).title === "string"
          )
          for (const hit of hits) {
            rawArticles.push({
              title: hit.title,
              url: hit.url,
              source: hit.source || new URL(hit.url).hostname.replace(/^www\./, ""),
              snippet: hit.snippet || "",
            })
          }
        } catch {
          // ignore per-keyword failures
        }
      }
    }

    // Deduplicate by URL
    const seen = new Set<string>()
    rawArticles = rawArticles.filter((a) => {
      if (seen.has(a.url)) return false
      seen.add(a.url)
      return true
    })

    // 3. Rank articles using OpenAI
    let rankedArticles: RankedArticle[] = []
    if (rawArticles.length > 0) {
      const rankCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You rank recent tech articles for LinkedIn storytelling. Given a topic and article list, return ONLY JSON with key "ranked" containing up to 5 objects: title (string), url (string), source (string), summary (string), score (number 1-100), reason (string). Prefer reputable sources, recency, and strong narrative potential.`,
          },
          {
            role: "user",
            content: `Topic: ${topic}\nArticles:\n${JSON.stringify(rawArticles.slice(0, 15), null, 2)}`,
          },
        ],
        response_format: { type: "json_object" },
      })

      const rankRaw = rankCompletion.choices[0].message.content || "{\"ranked\":[]}"
      const parsed = JSON.parse(rankRaw) as { ranked?: RankedArticle[] }
      rankedArticles = (parsed.ranked || []).slice(0, 5)
    }

    // Fallback article if Firecrawl returned nothing
    if (rankedArticles.length === 0) {
      rankedArticles = [
        {
          title: `Latest developments in ${topic}`,
          url: "https://example.com/research-fallback",
          source: "Research fallback",
          summary: "No live articles found. Generating from topic knowledge.",
          score: 60,
          reason: "Fallback when Firecrawl search returns no results",
        },
      ]
    }

    const selectedArticle = rankedArticles[0]

    // 4. Build five-slide narrative
    const storyCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an elite LinkedIn carousel writer. Turn an article/topic into a 5-slide visual narrative. Return ONLY JSON:
{
  "headline": "short scroll-stopping hook",
  "slides": [
    { "headline": "Slide 1: big hook", "body": "1-2 punchy sentences" },
    { "headline": "Slide 2: the problem or trend", "body": "..." },
    { "headline": "Slide 3: the insight or data point", "body": "..." },
    { "headline": "Slide 4: proof or example", "body": "..." },
    { "headline": "Slide 5: CTA", "body": "..." }
  ],
  "caption": "LinkedIn caption with line breaks",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}
Each headline must be catchy (not generic). Each body must be under 25 words.`,
        },
        {
          role: "user",
          content: `Topic: ${topic}\nSelected article: ${selectedArticle.title}\nSummary: ${selectedArticle.summary}`,
        },
      ],
      response_format: { type: "json_object" },
    })

    const storyRaw = storyCompletion.choices[0].message.content || "{\"slides\":[],\"caption\":\"\"}"
    const story = JSON.parse(storyRaw) as {
      headline?: string
      slides?: { headline: string; body: string }[]
      caption?: string
      hashtags?: string[]
    }

    const slides = (story.slides || []).slice(0, 5).map((s, i) => ({
      index: i + 1,
      headline: s.headline,
      body: s.body,
      visualPrompt: createVisualPrompt(i + 1, 5, s.headline, s.body),
    }))

    const caption =
      story.caption ||
      `${story.headline || topic}\n\nSave this carousel and share your thoughts.\n\n${(story.hashtags || []).join(" ")}`

    const result: CarouselResult = {
      topic,
      keywords: searchTerms,
      articles: rankedArticles,
      selectedArticle,
      slides,
      caption,
      hashtags: story.hashtags || [],
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Carousel pipeline error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

function createVisualPrompt(
  index: number,
  total: number,
  headline: string,
  body: string
): string {
  return `
Clean, premium LinkedIn carousel slide ${index} of ${total}.
Style: modern editorial SaaS, warm beige/cream background (#EAE5D8), charcoal text (#1F1F1F), muted brown accents (#8B7E6A), generous whitespace, thin subtle dividers.
Headline: "${headline}". Supporting idea: "${body}".
Include a soft abstract gradient or minimal icon/illustration in the background, not cartoonish, no UI chrome, no watermark.
Square 1:1 format, polished and ready for LinkedIn.
`.trim()
}
