"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"

const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_ICON = "3rem"

type SidebarContext = {
  open: boolean
  setOpen: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider.")
  return context
}

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  return isMobile
}

export function SidebarProvider({ children, defaultOpen = true, className, style }: { children: React.ReactNode; defaultOpen?: boolean; className?: string; style?: React.CSSProperties }) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(defaultOpen)
  const value = React.useMemo(() => ({ open, setOpen, isMobile, toggleSidebar: () => setOpen((o) => !o) }), [open, isMobile])
  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

export function Sidebar({ className, children, ...props }: React.ComponentProps<"div"> & { side?: "left" | "right"; variant?: "sidebar" | "floating" | "inset"; collapsible?: "offcanvas" | "icon" | "none" }) {
  const { open, isMobile, setOpen } = useSidebar()

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen} {...props}>
        <SheetContent side="left" className="w-64 p-0" aria-describedby="">
          <div className="sr-only">Sidebar</div>
          <div className="flex h-full flex-col bg-[var(--card)] border-r border-[var(--border)]">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className={cn("hidden md:flex flex-col h-screen border-r border-[var(--border)] bg-[var(--card)] transition-all duration-200", open ? "w-64" : "w-14", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarTrigger({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()
  return (
    <Button variant="ghost" size="icon" className={cn("h-7 w-7", className)} onClick={toggleSidebar} {...props}>
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

export function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-4", className)} {...props} />
}

export function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mt-auto p-4", className)} {...props} />
}

export function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex-1 overflow-auto px-2 py-4", className)} {...props} />
}

export function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />
}

export function SidebarGroupLabel({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-3 text-xs font-medium text-[var(--muted-foreground)]", className)} {...props} />
}

export function SidebarGroupContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1", className)} {...props} />
}

export function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul className={cn("flex flex-col gap-1", className)} {...props} />
}

export function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={className} {...props} />
}

const sidebarMenuButtonVariants = cva(
  "flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm transition-colors hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
  {
    variants: {
      isActive: { true: "bg-[var(--accent)] text-[var(--accent-foreground)] font-medium", false: "" },
    },
  }
)

export function SidebarMenuButton({
  asChild,
  isActive,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean; isActive?: boolean }) {
  const { open } = useSidebar()
  const classes = cn(sidebarMenuButtonVariants({ isActive }), className)
  if (asChild) {
    return (
      <Slot className={classes} {...props}>
        {React.Children.only(children)}
      </Slot>
    )
  }
  return (
    <button className={classes} {...props}>
      {children}
      {!open && <span className="sr-only">{children}</span>}
    </button>
  )
}

export function SidebarInset({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-1 flex-col min-h-screen", className)} {...props} />
}
