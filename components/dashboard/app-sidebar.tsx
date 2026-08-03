"use client"

import Link from "next/link"
import { LayoutGrid, Newspaper, FileText } from "lucide-react"
import { useSidebar, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function AppSidebar({ activeWorkflow }: { activeWorkflow: string }) {
  const { open } = useSidebar()
  const items = [
    { title: "Carousel", href: "/dashboard?workflow=carousel", icon: LayoutGrid, active: activeWorkflow === "carousel" },
    { title: "Newsletter", href: "/dashboard?workflow=newsletter", icon: Newspaper, active: activeWorkflow === "newsletter" },
  ]

  return (
    <Sidebar className="border-r border-[var(--border)]">
      <SidebarHeader className={cn("p-4", !open && "px-2")}>
        <Link href="/" className="flex items-center gap-2 font-semibold text-sm">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">
            <FileText className="h-4 w-4" />
          </div>
          {open && <span>RK Studio</span>}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className={cn("px-3", !open && "px-2")}>
          {open && <SidebarGroupLabel>Workstreams</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.href} className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
                    <SidebarMenuButton isActive={item.active} className="w-full">
                      <item.icon className="h-4 w-4 shrink-0" />
                      {open && <span>{item.title}</span>}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={cn("p-4 text-xs text-[var(--muted-foreground)]", !open && "px-2")}>
        {open && <div>Rajesh Kumar © 2026</div>}
      </SidebarFooter>
    </Sidebar>
  )
}
