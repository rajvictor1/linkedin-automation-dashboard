import OpenAI from "openai"
import FirecrawlApp from "firecrawl"

export class ConfigurationError extends Error {
  constructor(public readonly missing: string) {
    super(`Missing required environment variable: ${missing}`)
    this.name = "ConfigurationError"
  }
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new ConfigurationError(name)
  return value
}

export function getOpenAI() {
  return new OpenAI({ apiKey: requireEnv("OPENAI_API_KEY") })
}

export function getFirecrawl() {
  return new FirecrawlApp({ apiKey: requireEnv("FIRECRAWL_API_KEY") })
}
