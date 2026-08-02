import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { CarouselWorkflow } from "@/components/dashboard/carousel-workflow"
import { NewsletterWorkflow } from "@/components/dashboard/newsletter-workflow"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ workflow?: string }>
}) {
  const params = await searchParams
  const workflow = params.workflow === "newsletter" ? "newsletter" : "carousel"

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar activeWorkflow={workflow} />
      <SidebarInset className="bg-[var(--background)]">
        <SiteHeader workflow={workflow} />
        <main className="flex flex-1 flex-col gap-6 p-6">
          {workflow === "newsletter" ? <NewsletterWorkflow /> : <CarouselWorkflow />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
