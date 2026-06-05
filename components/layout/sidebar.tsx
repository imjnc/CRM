"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useLayoutEffect, useRef } from "react"
import type { ReactNode } from "react";
import gsap from "gsap";
import {
  Bell,
  Users,
  Briefcase,
  ContactRound,
  Building2,
  StickyNote,
  CheckSquare,
  Phone,
  Mail,
  Package,
  ChevronDown,
  ChevronLeft,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "./sidebar-context"
import { NotificationsSheet } from "./notifications-sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type NavItem = {
  href: string
  icon: LucideIcon
  label: string
  badge?: string
}

const primaryNavItems: NavItem[] = [
  { href: "/leads", icon: Users, label: "Leads" },
  { href: "/deals", icon: Briefcase, label: "Deals" },
  { href: "/contacts", icon: ContactRound, label: "Contacts" },
  { href: "/organizations", icon: Building2, label: "Organizations" },
  { href: "/products", icon: Package, label: "Products" },
  { href: "/notes", icon: StickyNote, label: "Notes" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/call-logs", icon: Phone, label: "Call Logs" },
  { href: "/email-templates", icon: Mail, label: "Email Templates" },
]

const publicViews: NavItem[] = [
  { href: "/leads?view=my", icon: Users, label: "My Leads" },
  { href: "/deals?view=my", icon: Briefcase, label: "My Deals" },
]

const pinnedViews: NavItem[] = [
  { href: "/call-logs?incoming=true", icon: Phone, label: "Incoming calls" },
]



const SIDEBAR_WIDTH = {
  expanded: 264,
  collapsed: 72,
} as const

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user
  const { isCollapsed, isMobile, isMobileOpen, toggleCollapsed, toggleMobile, closeMobile } =
    useSidebar()
  const asideRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isCompact = isCollapsed && !isMobile

  function isActive(href: string) {
    const base = href.split("?")[0]
    return pathname === base || (base !== "/" && pathname.startsWith(base))
  }

  useLayoutEffect(() => {
    const aside = asideRef.current
    const container = containerRef.current
    if (!aside || !container) return

    gsap.to(aside, {
      width: isCollapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded,
      duration: 0.25,
      ease: "power2.out",
    })

    const labels = container.querySelectorAll<HTMLElement>("[data-sidebar-label]")
    if (labels.length > 0) {
      gsap.to(labels, {
        opacity: isCollapsed ? 0 : 1,
        x: isCollapsed ? -8 : 0,
        duration: 0.2,
        ease: "power2.out",
        stagger: 0.01,
      })
    }
  }, [isCollapsed])

  useLayoutEffect(() => {
    const aside = asideRef.current
    if (!aside) return

    if (!isMobile) {
      gsap.set(aside, { xPercent: 0, autoAlpha: 1 })
      return
    }

    gsap.set(aside, { xPercent: isMobileOpen ? 0 : -100, autoAlpha: isMobileOpen ? 1 : 0 })
    gsap.to(aside, {
      xPercent: isMobileOpen ? 0 : -100,
      autoAlpha: isMobileOpen ? 1 : 0,
      duration: 0.25,
      ease: "power2.out",
    })
  }, [isMobile, isMobileOpen])

  const userInitials = (() => {
    if (!user?.name) return "U"
    return user.name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .join("")
      .slice(0, 2)
  })()

  const handleNavClick = () => {
    if (isMobile) {
      closeMobile()
    }
  }

  return (
    <>
      {isMobile && isMobileOpen ? (
        <div
          className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-[1px] md:hidden"
          onClick={closeMobile}
          role="presentation"
        />
      ) : null}

      {isMobile && !isMobileOpen ? (
        <button
          type="button"
          onClick={toggleMobile}
          aria-label="Open sidebar"
          className="fixed left-3 top-3 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/60"
        >
          <Menu size={18} />
        </button>
      ) : null}

      <aside
        ref={asideRef}
        id="crm-sidebar"
        className={cn(
          "fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-[#E5E7EB] bg-white text-slate-900 shadow-sm transition-colors",
          "md:sticky md:top-0 md:h-dvh md:shrink-0 md:self-start"
        )}
        data-collapsed={isCollapsed ? "true" : "false"}
        style={{ width: SIDEBAR_WIDTH.expanded }}
      >
        <div ref={containerRef} className="flex h-full flex-col">

        {/* Logo + controls */}
        <div className={cn("flex items-center border-b border-gray-100 transition-all", isCompact ? "justify-center px-2 py-3" : "justify-between px-3 py-3")}>
          <div
            className={cn("flex items-center gap-2 overflow-hidden", isCompact && "cursor-pointer justify-center group/logo")}
            onClick={isCompact ? toggleCollapsed : undefined}
            title={isCompact ? "Click to expand sidebar" : undefined}
          >
            <div
              className={cn(
                "flex shrink-0 h-8 w-8 items-center justify-center rounded-lg bg-gray-900 shadow-sm shadow-slate-900/20 transition-all",
                isCompact &&
                  "group-hover/logo:bg-slate-800 group-hover/logo:shadow-md group-hover/logo:shadow-slate-900/30 group-hover/logo:scale-110"
              )}
            >
              <svg
                viewBox="0 0 64 64"
                className="h-4 w-4 fill-none stroke-white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* V */}
                <path d="M10 14L22 50L34 14" />

                {/* O */}
                <circle cx="46" cy="32" r="10" />

                {/* Small accent dot */}
                <circle cx="52" cy="20" r="2" className="fill-white stroke-none" />
              </svg>
            </div>
            <div className={cn("transition-all", isCompact ? "hidden" : "block")}>
              <p
                className="text-[13px] font-semibold leading-tight text-slate-900"
                data-sidebar-label
              >
                Voro
              </p>
              <p className="text-[11px] leading-tight text-slate-500" data-sidebar-label>
                Workspace
              </p>
            </div>
          </div>
          {!isMobile && !isCompact ? (
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label="Collapse sidebar"
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          ) : null}

            {isMobile ? (
              <button
                type="button"
                onClick={closeMobile}
                aria-label="Close sidebar"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/60"
              >
                <X size={16} />
              </button>
            ) : null}
          </div>

          {/* User info */}
          <div className="border-b border-gray-100 px-3 py-4">
            <div className={cn("flex gap-2", isCompact ? "flex-col items-center" : "items-center")}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-3 rounded-md p-1 hover:bg-slate-50 transition-colors outline-none",
                      isCompact ? "w-10 justify-center p-0" : "flex-1"
                    )}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-600 overflow-hidden">
                      {user?.image ? (
                        <img src={user.image} alt={user?.name ?? "User"} className="h-full w-full object-cover" />
                      ) : (
                        userInitials
                      )}
                    </div>
                    <div className={cn("flex flex-1 items-center justify-between overflow-hidden", isCompact && "hidden")}>
                      <div className="space-y-0.5 text-left">
                        <p className="text-[13px] font-medium text-slate-900 truncate">
                          {user?.name ?? "CRM User"}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {user?.role ?? "Workspace"}
                        </p>
                      </div>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="cursor-pointer flex items-center">
                    <span className="mr-2 flex h-4 w-4 items-center justify-center">⚙️</span>
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })} className="cursor-pointer flex items-center text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <NotificationsSheet>
                <button
                  type="button"
                  aria-label="Notifications"
                  onClick={() => {
                    if (isMobile) closeMobile()
                  }}
                  className="relative rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  <Bell size={16} />
                  <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-red-500"></span>
                </button>
              </NotificationsSheet>
            </div>
          </div>

          {/* Nav */}
          <nav className={cn("flex-1 space-y-2 px-2 py-3", isCompact ? "overflow-hidden" : "overflow-y-auto")} aria-label="Primary">
            <div className="space-y-1">
              {primaryNavItems.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  isActive={isActive(item.href)}
                  isCollapsed={isCollapsed}
                  onClick={handleNavClick}
                />
              ))}
            </div>

            <SidebarSection label="Public views" isCollapsed={isCollapsed}>
              {publicViews.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  isActive={isActive(item.href)}
                  isCollapsed={isCollapsed}
                  onClick={handleNavClick}
                />
              ))}
            </SidebarSection>



            <SidebarSection label="Pinned views" isCollapsed={isCollapsed}>
              {pinnedViews.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  isActive={isActive(item.href)}
                  isCollapsed={isCollapsed}
                  onClick={handleNavClick}
                />
              ))}
            </SidebarSection>
          </nav>
        </div>
      </aside>
    </>
  )
}

type SidebarLinkProps = {
  item: NavItem
  isActive: boolean
  isCollapsed: boolean
  onClick: () => void
}

function SidebarLink({ item, isActive, isCollapsed, onClick }: SidebarLinkProps) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      prefetch
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      aria-label={item.label}
      title={isCollapsed ? item.label : undefined}
      className={cn(
        "group flex items-center rounded-md px-2 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/60",
        isCollapsed ? "justify-center" : "gap-2",
        isActive
          ? "bg-[#F3F4F6] text-[#111827] border-l-2 border-gray-900"
          : "text-[#6B7280] hover:bg-gray-50 hover:text-[#111827] border-l-2 border-transparent"
      )}
    >
      <Icon
        size={16}
        className={cn(
          "shrink-0 text-[#9CA3AF] transition-colors",
          isActive ? "text-[#374151]" : "group-hover:text-[#6B7280]"
        )}
      />
      <span className={cn("flex-1 truncate", isCollapsed && "hidden")} data-sidebar-label>
        {item.label}
      </span>
      {item.badge && !isCollapsed ? (
        <span
          className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500"
          data-sidebar-label
        >
          {item.badge}
        </span>
      ) : null}
    </Link>
  )
}

type SidebarSectionProps = {
  label: string
  isCollapsed: boolean
  variant?: "default" | "divider"
  children: ReactNode
}

function SidebarSection({ label, isCollapsed, variant = "default", children }: SidebarSectionProps) {
  return (
    <div className={cn("space-y-1", variant === "divider" && "border-t border-gray-100 pt-4")}>
      <div className={cn("flex items-center gap-1 px-2", isCollapsed && "justify-center")}>
        <ChevronDown size={12} className="text-[#9CA3AF]" />
        <span
          className={cn("text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]", isCollapsed && "hidden")}
          data-sidebar-label
        >
          {label}
        </span>
      </div>
      {children}
    </div>
  )
}
