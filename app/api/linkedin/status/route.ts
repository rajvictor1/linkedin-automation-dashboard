export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = process.env.LINKEDIN_ACCESS_TOKEN?.trim();
    if (!token) {
      return Response.json({ connected: false, message: "LINKEDIN_ACCESS_TOKEN is not configured." }, { headers: { "Cache-Control": "no-store" } });
    }

    const res = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${token}`, "X-Restli-Protocol-Version": "2.0.0" },
    });

    if (!res.ok) {
      return Response.json({ connected: false, message: "LinkedIn token is invalid or expired." }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }

    const data = (await res.json()) as { name?: string; email?: string };
    return Response.json({ connected: true, name: data.name, email: data.email }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ connected: false, message: "Could not reach LinkedIn." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
