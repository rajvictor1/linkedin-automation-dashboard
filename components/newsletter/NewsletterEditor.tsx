"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Send } from "lucide-react";
import type { NewsletterResult, RankedArticle } from "@/lib/shared";
import { downloadFile } from "@/lib/shared";

interface NewsletterEditorProps {
  result: NewsletterResult;
}

export function NewsletterEditor({ result }: NewsletterEditorProps) {
  const [subject, setSubject] = useState(result.subject);
  const [preview, setPreview] = useState(result.preview);
  const [body, setBody] = useState(result.body);
  const [cta, setCta] = useState(result.cta);
  const [publishStatus, setPublishStatus] = useState<{ ok: boolean; message: string } | null>(null);

  function exportNewsletter() {
    const content = `Subject: ${subject}\n\nPreview: ${preview}\n\n---\n\n${body}\n\n---\n\nCTA: ${cta}`;
    downloadFile("newsletter.md", content, "text/markdown");
  }

  async function publishToLinkedIn() {
    const confirmed = window.confirm(
      "This will publish your newsletter as a LinkedIn text post now. Continue?"
    );
    if (!confirmed) return;

    const text = `${subject}\n\n${body}\n\n${cta}`;
    setPublishStatus(null);
    try {
      const res = await fetch("/api/linkedin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await res.json()) as { success?: boolean; postId?: string; error?: string };
      if (res.ok && data.success) {
        setPublishStatus({ ok: true, message: `Published. Post ID: ${data.postId}` });
      } else {
        setPublishStatus({ ok: false, message: data.error || "Publish failed" });
      }
    } catch (err) {
      setPublishStatus({ ok: false, message: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Research summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-mono text-muted-foreground mb-1">Selected source</p>
              <p className="font-medium">{result.selectedArticle?.title}</p>
              <p className="text-sm text-muted-foreground">{result.selectedArticle?.source}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-muted-foreground mb-1">Top articles</p>
              <ul className="text-sm space-y-1 list-disc pl-5">
                {result.articles.map((a: RankedArticle) => (
                  <li key={a.url}>
                    <a href={a.url} target="_blank" rel="noreferrer" className="underline">
                      {a.title}
                    </a>
                    {" "}
                    <span className="text-muted-foreground">({a.source}, score {a.score}) — {a.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Edit newsletter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground">Subject line</label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground">LinkedIn preview text</label>
              <Input value={preview} onChange={(e) => setPreview(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground">Body (Markdown)</label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={14}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-muted-foreground">Call to action</label>
              <Input value={cta} onChange={(e) => setCta(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={exportNewsletter}>
                <Download className="w-4 h-4 mr-2" />
                Export newsletter
              </Button>
              <Button onClick={publishToLinkedIn}>
                <Send className="w-4 h-4 mr-2" />
                Publish to LinkedIn
              </Button>
            </div>
            {publishStatus && (
              <span className={`text-xs ${publishStatus.ok ? "text-green-600" : "text-destructive"}`}>
                {publishStatus.message}
              </span>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Preview</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <div className="border-b pb-4 mb-4">
            <p className="text-xs font-mono text-muted-foreground mb-1">Subject</p>
            <p className="font-medium">{subject}</p>
            <p className="text-xs font-mono text-muted-foreground mt-2 mb-1">Preview</p>
            <p className="text-sm text-muted-foreground">{preview}</p>
          </div>
          <div className="whitespace-pre-wrap">{body}</div>
          <div className="mt-6 pt-4 border-t">
            <span className="font-medium">CTA:{" "}</span>
            {cta}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
