"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"

type SidebarContextValue = {
  isCollapsed: boolean
  isMobile: boolean
  isMobileOpen: boolean
  toggleCollapsed: () => void
  toggleMobile: () => void
  openMobile: () => void
  closeMobile: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

/**
 * Provides sidebar state (collapse + mobile drawer) to layout components.
 */
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const effectiveCollapsed = isMobile ? false : isCollapsed
  const effectiveMobileOpen = isMobile ? isMobileOpen : false

  const toggleCollapsed = useCallback(() => {
   setIsCollapsed((prev) => !prev)
  }, [])

  const toggleMobile = useCallback(() => {
    setIsMobileOpen((prev) => !prev)
  }, [])

  const openMobile = useCallback(() => {
    setIsMobileOpen(true)
  }, [])

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false)
  }, [])

  const value = useMemo(
    () => ({
      isCollapsed: effectiveCollapsed,
      isMobile,
      isMobileOpen: effectiveMobileOpen,
      toggleCollapsed,
      toggleMobile,
      openMobile,
      closeMobile,
    }),
    [
      effectiveCollapsed,
      effectiveMobileOpen,
      isMobile,
      toggleCollapsed,
      toggleMobile,
      openMobile,
      closeMobile,
    ]
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

/**
 * Access sidebar state and actions.
 */
export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
