# LinkedIn Content Studio

A world-class personal-brand dashboard for LinkedIn. It runs two isolated workstreams:

- **Carousel Studio** — discovers timely AI/enterprise stories, selects the best, writes a 5-slide visual narrative, and renders each slide as artwork.
- **Newsletter Studio** — researches a topic, writes a structured, cited newsletter, and generates a lead visual.

Both workstreams have a **manual "Publish to LinkedIn"** button. Nothing posts until you review the output, type `PUBLISH TO LINKEDIN`, and click the button.

## Live demo

- **Dashboard:** https://dashboard-nine-dun-83.vercel.app/dashboard?workflow=carousel
- **GitHub:** https://github.com/rajvictor1/linkedin-automation-dashboard

## Tech stack

- Next.js 16 app router
- shadcn/ui components
- OpenAI GPT-4o-mini + gpt-image-1-mini
- Firecrawl search
- LinkedIn OAuth2 userinfo + UGC Posts API

## Environment variables

Create `.env.local`:

```env
OPENAI_API_KEY=
FIRECRAWL_API_KEY=
LINKEDIN_ACCESS_TOKEN=
```

Get a LinkedIn test token from your app on https://developer.linkedin.com/ with the `w_member_social` scope.

## Local development

```bash
cd dashboard
npm install
npm run dev
```

Open http://localhost:3000/dashboard?workflow=carousel

## License

MIT © Rajesh Kumar
