export interface CarouselSlide {
  index: number
  headline: string
  body: string
  visualPrompt: string
  imageUrl?: string
}

export interface CarouselResult {
  topic: string
  keywords: string[]
  articles: RankedArticle[]
  selectedArticle: RankedArticle | null
  slides: CarouselSlide[]
  caption: string
  hashtags: string[]
}

export interface RankedArticle {
  title: string
  url: string
  source: string
  summary: string
  score: number
  reason: string
}

export interface NewsletterResult {
  topic: string
  articles: RankedArticle[]
  selectedArticle: RankedArticle | null
  subject: string
  preview: string
  body: string
  cta: string
}

export interface GeneratedImage {
  slide: number
  prompt: string
  url: string | null
  loading: boolean
  error?: string
}

export const CATEGORIES = [
  "AI",
  "Agentic AI",
  "Automation",
  "Enterprise IT",
  "AI agents",
  "LLMs",
  "Robotics",
  "Cybersecurity",
  "Developer tools",
  "Emerging technology",
]

export const DEFAULT_TOPIC = "AI agents transforming enterprise automation"

export function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export function createCarouselPrompt(
  index: number,
  total: number,
  headline: string,
  body: string,
  brand: "zen" = "zen"
): string {
  const palette =
    brand === "zen"
      ? "warm beige/cream background (#EAE5D8), charcoal text (#1F1F1F), muted brown accents (#8B7E6A)"
      : ""

  return `
Create a clean, professional LinkedIn carousel slide ${index} of ${total}.

Theme: modern, editorial, Zen SaaS aesthetic.
Color palette: ${palette}.
Layout: generous whitespace, centered or left-aligned composition, thin subtle dividers.
Typography: large elegant serif headline, smaller sans-serif supporting text, no body text smaller than 20pt feel.
Imagery: soft abstract gradient or minimal icon/illustration in the background, not cartoonish.

Headline on slide: "${headline}"
Supporting idea: "${body}"

No UI chrome, no browser window, no watermark, no device mockup.
Output as a polished 1:1 square image ready for LinkedIn.
`.trim()
}
