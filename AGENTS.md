# LinkedIn Content Studio — Dashboard

This is the Next.js application for the LinkedIn Content Studio.

## Local development

```bash
cd dashboard
npm install
npm run dev
```

Open http://localhost:3000.

## Agent notes

See `../AGENTS.md` for product instructions and guardrails.

## Environment variables

```
OPENAI_API_KEY=          # required
FIRECRAWL_API_KEY=        # required
LINKEDIN_ACCESS_TOKEN=    # required for LinkedIn publishing
```

## Routes

- `/dashboard?workflow=carousel` — carousel workflow
- `/dashboard?workflow=newsletter` — newsletter workflow
- `/api/carousels/generate` — streaming carousel generation
- `/api/newsletters/generate` — streaming newsletter generation
- `/api/linkedin/publish` — manual LinkedIn text publishing
- `/api/linkedin/status` — LinkedIn auth status
