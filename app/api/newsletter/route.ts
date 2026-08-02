import { NextResponse } from "next/server"
import { getOpenAI } from "@/lib/openai"
import { getFirecrawl } from "@/lib/firecrawl"
import type { NewsletterResult, RankedArticle } from "@/lib/shared"

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

    // 1. Keywords
    const keywordCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a research strategist for a LinkedIn newsletter. Given a topic, generate 5-8 specific search keywords across AI, enterprise tech, automation, and emerging technology. Return ONLY JSON with key "keywords" as array of strings.`,
        },
        { role: "user", content: `Topic: ${topic}` },
      ],
      response_format: { type: "json_object" },
    })

    const keywordsRaw =
      keywordCompletion.choices[0].message.content || "{\"keywords\":[]}"
    const { keywords = [] } = JSON.parse(keywordsRaw) as { keywords?: string[] }

    // 2. Discover articles
    let rawArticles: { title: string; url: string; source: string; snippet?: string }[] = []
    if (firecrawl) {
      for (const term of keywords.slice(0, 8)) {
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
          // ignore
        }
      }
    }

    const seen = new Set<string>()
    rawArticles = rawArticles.filter((a) => {
      if (seen.has(a.url)) return false
      seen.add(a.url)
      return true
    })

    // 3. Rank
    let rankedArticles: RankedArticle[] = []
    if (rawArticles.length > 0) {
      const rankCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Rank recent tech articles for a LinkedIn newsletter. Return ONLY JSON with key "ranked" containing up to 5 objects: title, url, source, summary, score (1-100), reason. Prefer reputable sources and strong narrative potential.`,
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

    if (rankedArticles.length === 0) {
      rankedArticles = [
        {
          title: `Latest developments in ${topic}`,
          url: "https://example.com/research-fallback",
          source: "Research fallback",
          summary: "No live articles found. Generating from topic knowledge.",
          score: 60,
          reason: "Fallback",
        },
      ]
    }

    const selectedArticle = rankedArticles[0]

    // 4. Write newsletter
    const newsletterCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an elite LinkedIn newsletter writer. Turn a topic/article into a 400-600 word professional newsletter in Markdown. Return ONLY JSON with keys: subject, preview (1-sentence LinkedIn preview), body (Markdown string), cta. Include a headline, 3-5 sections, a real example or data point, and a clear CTA. Tone: insightful, concise, executive-friendly.`,
        },
        {
          role: "user",
          content: `Topic: ${topic}\nSelected article: ${selectedArticle.title}\nSummary: ${selectedArticle.summary}`,
        },
      ],
      response_format: { type: "json_object" },
    })

    const newsletterRaw =
      newsletterCompletion.choices[0].message.content || "{\"subject\":\"\",\"body\":\"\"}"
    const newsletter = JSON.parse(newsletterRaw) as {
      subject?: string
      preview?: string
      body?: string
      cta?: string
    }

    const result: NewsletterResult = {
      topic,
      articles: rankedArticles,
      selectedArticle,
      subject: newsletter.subject || `${topic}: what leaders need to know`,
      preview: newsletter.preview || "",
      body: newsletter.body || "",
      cta: newsletter.cta || "Reply with your take.",
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Newsletter pipeline error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
