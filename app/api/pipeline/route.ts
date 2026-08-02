import { NextResponse } from "next/server"
import { getOpenAI } from "@/lib/openai"
import { getFirecrawl } from "@/lib/firecrawl"

export async function POST(req: Request) {
  try {
    const { topic, mode = "both" } = await req.json()

    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 })
    }

    const openai = getOpenAI()

    // 1. Research: try Firecrawl if topic looks like a URL, otherwise skip live scraping
    let researchSummary = ""
    const isUrl = topic.startsWith("http://") || topic.startsWith("https://")
    if (isUrl) {
      try {
        const firecrawl = getFirecrawl()
        const result = await firecrawl.scrapeUrl(topic, { formats: ["markdown"] })
        researchSummary =
          (result as { markdown?: string }).markdown?.slice(0, 4000) ||
          JSON.stringify(result).slice(0, 4000)
      } catch (err) {
        researchSummary = `Could not scrape ${topic}. Falling back to topic-only generation.`
      }
    } else {
      researchSummary = `Topic: ${topic}`
    }

    // 2. Ideation
    const ideasCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a LinkedIn content strategist. Given a topic or research summary, generate exactly 3 content angles for a personal brand. Return ONLY a JSON object with a key 'ideas' containing an array of objects with fields: title, hook, format (carousel, newsletter, or both).",
        },
        {
          role: "user",
          content: `Topic/research: ${researchSummary}\n\nReturn 3 angles as JSON.`,
        },
      ],
      response_format: { type: "json_object" },
    })

    const ideasRaw = ideasCompletion.choices[0].message.content || "{\"ideas\":[]}"
    const ideasParsed = JSON.parse(ideasRaw) as {
      ideas?: { title: string; hook: string; format: string }[]
    }
    const ideas = ideasParsed.ideas || []
    const selected = ideas[0] || { title: topic, hook: "", format: "both" }

    // 3. Outline + Writing (carousel)
    let carouselSlides: { headline: string; body: string }[] = []
    let carouselCaption = ""

    if (
      mode === "carousel" ||
      mode === "both" ||
      selected.format === "carousel" ||
      selected.format === "both"
    ) {
      const carouselCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a LinkedIn carousel writer. Given a topic and hook, write a 5-slide carousel. Return ONLY JSON with fields: slides (array of {headline, body}) and caption (string). Keep each body under 25 words.",
          },
          {
            role: "user",
            content: `Topic: ${topic}\nHook: ${selected.hook || selected.title}`,
          },
        ],
        response_format: { type: "json_object" },
      })

      const carouselRaw =
        carouselCompletion.choices[0].message.content || "{\"slides\":[],\"caption\":\"\"}"
      const carouselParsed = JSON.parse(carouselRaw) as {
        slides?: { headline: string; body: string }[]
        caption?: string
      }
      carouselSlides = carouselParsed.slides || []
      carouselCaption = carouselParsed.caption || ""
    }

    // 4. Outline + Writing (newsletter)
    let newsletter = ""
    if (
      mode === "newsletter" ||
      mode === "both" ||
      selected.format === "newsletter" ||
      selected.format === "both"
    ) {
      const newsletterCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a LinkedIn newsletter writer. Given a topic and hook, write a short professional newsletter in Markdown. Include a headline, 3-5 sections, and a clear CTA. Keep it under 400 words.",
          },
          {
            role: "user",
            content: `Topic: ${topic}\nHook: ${selected.hook || selected.title}`,
          },
        ],
      })

      newsletter = newsletterCompletion.choices[0].message.content || ""
    }

    // 5. Visual prompts for each slide
    const visualPrompts = carouselSlides.map(
      (slide, i) =>
        `Minimal professional LinkedIn carousel slide ${i + 1} of ${carouselSlides.length}. Warm beige background, charcoal text, soft shadows. Headline: "${slide.headline}". Clean, zen, no clutter.`
    )

    return NextResponse.json({
      topic,
      mode,
      research: researchSummary,
      ideas,
      selected,
      carousel: {
        slides: carouselSlides,
        caption: carouselCaption,
      },
      newsletter,
      visuals: visualPrompts,
    })
  } catch (error) {
    console.error("Pipeline error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
