"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

interface LinkedInPublisherProps {
  text: string;
  label?: string;
}

export function LinkedInPublisher({ text, label = "Publish to LinkedIn" }: LinkedInPublisherProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  async function publish() {
    const confirmed = window.confirm(
      "This will publish to your LinkedIn profile now. Are you sure?"
    );
    if (!confirmed) return;

    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/linkedin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await res.json()) as { success?: boolean; postId?: string; error?: string };
      if (res.ok && data.success) {
        setStatus({ ok: true, message: `Published. Post ID: ${data.postId}` });
      } else {
        setStatus({ ok: false, message: data.error || "Publish failed" });
      }
    } catch (err) {
      setStatus({ ok: false, message: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <Button onClick={publish} disabled={loading || !text.trim()}>
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        <Send className="w-4 h-4 mr-2" />
        {label}
      </Button>
      {status && (
        <span
          className={`text-xs ${status.ok ? "text-green-600" : "text-destructive"}`}
        >
          {status.message}
        </span>
      )}
    </div>
  );
}
