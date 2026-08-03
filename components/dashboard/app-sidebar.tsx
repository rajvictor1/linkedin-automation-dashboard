"use client"

import Link from "next/link"
import { LayoutGrid, Newspaper, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

export function AppSidebar({ activeWorkflow }: { activeWorkflow: string }) {
  const items = [
    { title: "Carousel", workflow: "carousel", icon: LayoutGrid },
    { title: "Newsletter", workflow: "newsletter", icon: Newspaper },
  ]

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-[var(--border)] bg-[var(--card)]">
      <div className="p-4">
        <Link href="/dashboard?workflow=carousel" className="flex items-center gap-2 font-semibold text-sm">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">
            <FileText className="h-4 w-4" />
          </div>
          <span>RK Studio</span>
        </Link>
      </div>

      <div className="flex-1 overflow-auto px-3 py-2">
        <div className="px-3 pb-2 text-xs font-medium text-[var(--muted-foreground)]">Workstreams</div>
        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const isActive = activeWorkflow === item.workflow
            return (
              <Link
                key={item.title}
                href={`/dashboard?workflow=${item.workflow}`}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)] font-medium"
                    : "text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 text-xs text-[var(--muted-foreground)]">
        Rajesh Kumar © 2026
      </div>
    </aside>
  )
}
