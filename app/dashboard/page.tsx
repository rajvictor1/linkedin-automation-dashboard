import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import { CarouselWorkflow } from "@/components/dashboard/carousel-workflow"
import { NewsletterWorkflow } from "@/components/dashboard/newsletter-workflow"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ workflow?: string }>
}) {
  const params = await searchParams
  const workflow = params.workflow === "newsletter" ? "newsletter" : "carousel"

  return (
    <div className="flex min-h-screen">
      <AppSidebar activeWorkflow={workflow} />
      <div className="flex flex-1 flex-col">
        <SiteHeader workflow={workflow} />
        <main className="flex flex-1 flex-col gap-6 bg-[var(--background)] p-6">
          {workflow === "newsletter" ? <NewsletterWorkflow /> : <CarouselWorkflow />}
        </main>
      </div>
    </div>
  )
}
