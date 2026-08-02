export async function linkedinStatus() {
  const token = process.env.LINKEDIN_ACCESS_TOKEN?.trim()
  if (!token) {
    return { connected: false, message: "LINKEDIN_ACCESS_TOKEN is not configured." }
  }

  const res = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${token}`, "X-Restli-Protocol-Version": "2.0.0" },
  })

  if (!res.ok) {
    return { connected: false, message: "LinkedIn token is invalid or expired." }
  }

  const data = (await res.json()) as { name?: string; email?: string }
  return { connected: true, name: data.name, email: data.email }
}
