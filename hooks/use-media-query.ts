"use client"

import { useEffect, useState } from "react"

/**
 * Returns true when the provided media query matches the current viewport.
 */
export function useMediaQuery(query: string, defaultValue = false) {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return defaultValue
    }

    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const mediaQueryList = window.matchMedia(query)
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", handleChange)
    } else {
      mediaQueryList.addListener(handleChange)
    }

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener("change", handleChange)
      } else {
        mediaQueryList.removeListener(handleChange)
      }
    }
  }, [query])

  return matches
}
