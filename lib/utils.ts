import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function downloadFile(name: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export function formatNewsletter(run: {
  topic: string
  sources: { title: string; url: string }[]
  draft: {
    subject: string
    previewText: string
    title: string
    dek: string
    introduction: string
    sections: { heading: string; body: string; citations: number[] }[]
    closing: string
  }
}): string {
  const sections = run.draft.sections
    .map(
      (s) =>
        `## ${s.heading}\n\n${s.body}\n\n*Sources: ${s.citations.map((c) => `[${c}]`).join(", ")}*`,
    )
    .join("\n\n")

  const sources = run.sources
    .slice(0, 8)
    .map((s, i) => `[${i + 1}] ${s.title} — ${s.url}`)
    .join("\n")

  return `# ${run.draft.title}\n\n_${run.draft.dek}_\n\n${run.draft.introduction}\n\n${sections}\n\n${run.draft.closing}\n\n---\n\n## Sources\n\n${sources}`
}
