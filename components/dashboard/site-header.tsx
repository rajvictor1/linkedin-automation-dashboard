"use client"

import { LayoutGrid, Newspaper } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

export function SiteHeader({ workflow }: { workflow: string }) {
  const isNewsletter = workflow === "newsletter"
  return (
    <header className="flex h-14 items-center gap-4 border-b border-[var(--border)] bg-[var(--card)] px-6">
      <SidebarTrigger />
      <div className="flex flex-1 items-center gap-3">
        {isNewsletter ? <Newspaper className="h-5 w-5 text-[var(--muted-foreground)]" /> : <LayoutGrid className="h-5 w-5 text-[var(--muted-foreground)]" />}
        <h1 className="font-semibold text-lg">{isNewsletter ? "Newsletter Studio" : "Carousel Studio"}</h1>
        <Badge variant="secondary" className="text-xs">{isNewsletter ? "Long-form" : "5-slide visual"}</Badge>
      </div>
    </header>
  )
}
