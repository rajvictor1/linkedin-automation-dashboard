import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-svh bg-background p-6 lg:p-12">
      <header className="max-w-5xl mx-auto mb-10">
        <h1 className="font-serif text-4xl lg:text-5xl text-foreground">
          LinkedIn Content Studio
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Two isolated workstreams: research-backed carousel posts and long-form
          newsletters. Each runs its own pipeline, data, and workspace.
        </p>
      </header>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/carousel" className="group">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="font-serif text-2xl">Carousel Studio</CardTitle>
                <Badge variant="outline">Visual</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Firecrawl research across AI, LLMs, cybersecurity, robotics, and more</li>
                <li>Rank articles and pick a strong story</li>
                <li>Generate 5-slide visual narrative</li>
                <li>Create branded slide images</li>
                <li>Export caption + slide deck</li>
              </ul>
              <p className="text-sm font-medium group-hover:underline">Open Carousel Studio →</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/newsletter" className="group">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="font-serif text-2xl">Newsletter Studio</CardTitle>
                <Badge variant="outline">Long-form</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Separate research and writing pipeline</li>
                <li>Rank best sources automatically</li>
                <li>Write executive-ready newsletter in Markdown</li>
                <li>Interactive editor with live preview</li>
                <li>Export subject, preview, body, and CTA</li>
              </ul>
              <p className="text-sm font-medium group-hover:underline">Open Newsletter Studio →</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
