import FirecrawlApp from "firecrawl"

export function getFirecrawl() {
  if (!process.env.FIRECRAWL_API_KEY) {
    throw new Error("Missing FIRECRAWL_API_KEY")
  }
  return new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY })
}
