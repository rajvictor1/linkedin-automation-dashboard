import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const slideSchema = z.object({
  index: z.number().int().min(1).max(5),
  kind: z.enum(["content", "cta"]),
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(300),
  imageDataUrl: z.string().startsWith("data:image/png;base64,").max(20_000_000).optional(),
  imagePrompt: z.string().max(1000).optional(),
  watermark: z.literal("rajeshkumar.com/subscribe"),
});

const requestSchema = z.object({
  confirmation: z.literal("PUBLISH TO LINKEDIN"),
  commentary: z.string().trim().min(1).max(3000),
  run: z.object({
    id: z.string().uuid(),
    topic: z.string().min(1).max(180),
    createdAt: z.string(),
    keywords: z.array(z.string()).max(20),
    sources: z.array(z.object({ title: z.string(), url: z.string().url(), summary: z.string() })).max(20),
    slides: z.array(slideSchema).length(5),
  }),
}).strict();

function isLocalSameOrigin(request: Request) {
  const requestUrl = new URL(request.url);
  const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
  if (!localHosts.has(requestUrl.hostname)) return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === requestUrl.origin;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isLocalSameOrigin(request)) {
    return Response.json({ error: { code: "LOCAL_ONLY", message: "LinkedIn publishing is only allowed from localhost in this demo." } }, { status: 403 });
  }

  const token = process.env.LINKEDIN_ACCESS_TOKEN?.trim();
  if (!token) {
    return Response.json({ error: { code: "TOKEN_MISSING", message: "LINKEDIN_ACCESS_TOKEN is not configured." } }, { status: 503 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: { code: "INVALID_REQUEST", message: "Request failed validation." } }, { status: 400 });
    }

    const { commentary } = parsed.data;

    const meRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${token}`, "X-Restli-Protocol-Version": "2.0.0" },
    });
    if (!meRes.ok) {
      return Response.json({ error: { code: "AUTH_FAILED", message: "LinkedIn token is invalid or expired." } }, { status: 401 });
    }
    const me = (await meRes.json()) as { sub?: string };
    const authorUrn = `urn:li:person:${me.sub}`;
    if (!me.sub) {
      return Response.json({ error: { code: "AUTH_FAILED", message: "Could not determine LinkedIn profile." } }, { status: 401 });
    }

    const postBody = {
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: commentary },
          shareMediaCategory: "NONE",
        },
      },
      visibility: { "com.linkedin.ugc.MemberVisibility": "PUBLIC" },
    };

    const publishRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(postBody),
    });

    if (!publishRes.ok) {
      const err = await publishRes.text();
      return Response.json({ error: { code: "PUBLISH_FAILED", message: `LinkedIn API error: ${err}` } }, { status: publishRes.status });
    }

    const location = publishRes.headers.get("location") || "published";
    return Response.json({ success: true, postUrn: location });
  } catch (error) {
    return Response.json({ error: { code: "PUBLISH_FAILED", message: error instanceof Error ? error.message : String(error) } }, { status: 500 });
  }
}
