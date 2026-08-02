import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { text, visibility = "PUBLIC" } = await req.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Post text is required" }, { status: 400 })
    }

    const token = process.env.LINKEDIN_ACCESS_TOKEN
    if (!token || token.startsWith("**")) {
      return NextResponse.json(
        { error: "LinkedIn access token is not configured" },
        { status: 503 }
      )
    }

    // 1. Fetch LinkedIn profile ID (urn) from the userinfo endpoint
    const userinfoRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${token}`,
        "LinkedIn-Version": "202410",
      },
    })

    if (!userinfoRes.ok) {
      const body = await userinfoRes.text()
      return NextResponse.json(
        { error: `LinkedIn auth failed: ${body}` },
        { status: 401 }
      )
    }

    const userinfo = (await userinfoRes.json()) as { sub?: string }
    const profileUrn = userinfo.sub
    if (!profileUrn) {
      return NextResponse.json(
        { error: "Could not get LinkedIn profile ID" },
        { status: 500 }
      )
    }

    // 2. Publish simple text post to LinkedIn
    const postBody = {
      author: `urn:li:person:${profileUrn}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": visibility,
      },
    }

    const publishRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": "202410",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postBody),
    })

    if (!publishRes.ok) {
      const body = await publishRes.text()
      return NextResponse.json(
        { error: `LinkedIn publish failed: ${body}` },
        { status: publishRes.status }
      )
    }

    const postId = publishRes.headers.get("x-restli-id") || "published"
    return NextResponse.json({ success: true, postId })
  } catch (error) {
    console.error("LinkedIn publisher error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
