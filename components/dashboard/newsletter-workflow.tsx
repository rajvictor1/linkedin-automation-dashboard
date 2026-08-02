"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2, RefreshCw, Download, Send, ExternalLink } from "lucide-react"
import type { NewsletterProgressEvent, NewsletterRun } from "@/lib/types"
import { downloadFile, formatNewsletter } from "@/lib/utils"

export function NewsletterWorkflow() {
  const [topic, setTopic] = useState("")
  const [includeVisual, setIncludeVisual] = useState(true)
  const [run, setRun] = useState<NewsletterRun | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<{ node: string; message: string; percent: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [publishLoading, setPublishLoading] = useState(false)
  const [publishStatus, setPublishStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [confirmText, setConfirmText] = useState("")

  async function start() {
    if (!topic.trim()) return
    setRun(null)
    setError(null)
    setProgress({ node: "research", message: "Starting research...", percent: 5 })
    setLoading(true)
    setPublishStatus(null)

    try {
      const res = await fetch("/api/newsletters/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, includeLeadVisual: includeVisual }),
      })

      const reader = res.body?.getReader()
      if (!reader) throw new Error("No response stream")

      const decoder = new TextDecoder()
      let buffer = ""
      let percent = 5

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const event = JSON.parse(line) as NewsletterProgressEvent
            if (event.type === "progress") {
              percent = Math.min(percent + 20, 95)
              setProgress({ node: event.node, message: event.message, percent })
            } else if (event.type === "complete") {
              setRun(event.data)
              setProgress({ node: "review", message: "Ready for review", percent: 100 })
            } else if (event.type === "error") {
              setError(event.error.message)
            }
          } catch {
            // ignore malformed lines
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  function exportNewsletter() {
    if (!run) return
    const md = formatNewsletter(run)
    downloadFile("newsletter.md", md)
  }

  async function publish() {
    if (!run) return
    if (confirmText !== "PUBLISH TO LINKEDIN") {
      setPublishStatus({ type: "error", message: 'Type "PUBLISH TO LINKEDIN" to confirm.' })
      return
    }
    setPublishLoading(true)
    setPublishStatus(null)
    try {
      const md = formatNewsletter(run)
      const commentary = `${run.draft.title}\n\n${run.draft.dek}\n\nRead the full newsletter: ${md.slice(0, 1500)}`
      const payload = {
        confirmation: "PUBLISH TO LINKEDIN",
        commentary: commentary.slice(0, 2800),
        run: {
          id: run.id,
          topic: run.topic,
          createdAt: run.createdAt,
          sources: run.sources.map((s) => ({ title: s.title, url: s.url, summary: s.summary })),
          slides: run.sources.slice(0, 5).map((_, i) => ({
            index: i + 1,
            kind: "content" as const,
            title: run.draft.title,
            body: run.draft.dek,
            watermark: "rajeshkumar.com/subscribe",
          })),
        },
      }
      const res = await fetch("/api/linkedin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setPublishStatus({ type: "error", message: data.error?.message || "Publish failed" })
      } else {
        setPublishStatus({ type: "success", message: `Published to LinkedIn: ${data.postUrn}` })
      }
    } catch (err) {
      setPublishStatus({ type: "error", message: err instanceof Error ? err.message : String(err) })
    } finally {
      setPublishLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-[var(--card)] border-[var(--border)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Generate newsletter from research</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Research topic</label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. AI agents in enterprise IT" />
          </div>

          <div className="flex items-center gap-3">
            <Switch id="visual" checked={includeVisual} onCheckedChange={setIncludeVisual} />
            <Label htmlFor="visual" className="text-sm">Include lead visual</Label>
          </div>

          <Button onClick={start} disabled={loading || !topic.trim()} className="w-fit">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            {loading ? "Generating..." : "Run newsletter pipeline"}
          </Button>

          {progress && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
                <span className="capitalize">{progress.node}</span>
                <span>{progress.percent}%</span>
              </div>
              <Progress value={progress.percent} className="h-2" />
              <p className="text-xs text-[var(--muted-foreground)]">{progress.message}</p>
            </div>
          )}

          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        </CardContent>
      </Card>

      {run && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Card className="overflow-hidden bg-[var(--card)] border-[var(--border)]">
              {run.leadVisual?.dataUrl && <img src={run.leadVisual.dataUrl} alt="Lead visual" className="w-full aspect-video object-cover" />}
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Badge variant="secondary">{run.draft.subject}</Badge>
                  <h2 className="text-2xl font-bold">{run.draft.title}</h2>
                  <p className="text-[var(--muted-foreground)]">{run.draft.dek}</p>
                </div>
                <p>{run.draft.introduction}</p>
                {run.draft.sections.map((section, idx) => (
                  <div key={idx} className="space-y-2">
                    <h3 className="text-lg font-semibold">{section.heading}</h3>
                    <p className="text-[var(--muted-foreground)]">{section.body}</p>
                    <p className="text-xs">Sources: {section.citations.map((c) => `[${c}]`).join(", ")}</p>
                  </div>
                ))}
                <p className="font-medium">{run.draft.closing}</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <Card className="bg-[var(--card)] border-[var(--border)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Sources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {run.sources.map((s, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-sm font-medium">[{i + 1}] {s.title}</p>
                    <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                      {s.url.slice(0, 40)}... <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-[var(--card)] border-[var(--border)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Publish</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" onClick={exportNewsletter} className="w-full">
                  <Download className="mr-2 h-4 w-4" /> Export Markdown
                </Button>

                <div className="space-y-2">
                  <p className="text-xs text-[var(--muted-foreground)]">Type PUBLISH TO LINKEDIN to confirm:</p>
                  <Textarea value={confirmText} onChange={(e) => setConfirmText(e.target.value)} rows={2} />
                  <Button onClick={publish} disabled={publishLoading} className="w-full">
                    {publishLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Publish to LinkedIn
                  </Button>
                  {publishStatus && (
                    <div className={`rounded-md p-3 text-xs ${publishStatus.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                      {publishStatus.message}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
