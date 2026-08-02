export interface CarouselSource {
  title: string
  url: string
  summary: string
  source: string
  score: number
  reason: string
}

export interface CarouselSlide {
  index: number
  kind: "content" | "cta"
  title: string
  body: string
  imagePrompt: string
  imageDataUrl?: string
  watermark: string
}

export interface CarouselRun {
  id: string
  topic: string
  createdAt: string
  keywords: string[]
  sources: CarouselSource[]
  selectedArticle: CarouselSource
  slides: CarouselSlide[]
}

export type CarouselProgressEvent =
  | { type: "progress"; node: string; status: "running" | "done" | "error"; message: string }
  | { type: "complete"; data: CarouselRun }
  | { type: "error"; error: { code: string; message: string } }

export interface NewsletterSource {
  title: string
  url: string
  summary: string
  source: string
}

export interface NewsletterSection {
  heading: string
  body: string
  citations: number[]
}

export interface NewsletterDraft {
  subject: string
  previewText: string
  title: string
  dek: string
  introduction: string
  sections: NewsletterSection[]
  closing: string
}

export interface NewsletterRun {
  id: string
  topic: string
  createdAt: string
  sources: NewsletterSource[]
  draft: NewsletterDraft
  leadVisual?: { dataUrl: string; prompt: string }
}

export type NewsletterProgressEvent =
  | { type: "progress"; node: string; status: "running" | "done" | "error"; message: string }
  | { type: "complete"; data: NewsletterRun }
  | { type: "error"; error: { code: string; message: string } }
