"use client"

import { useRef, useLayoutEffect, useState, useCallback } from "react"
import Link from "next/link"
import { toSlug } from "../lib/slugs"

export default function SpecialtyList({ specialties }: { specialties: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = useState(specialties.length)

  const measure = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    // All items are always in the DOM — query in DOM order
    const items = Array.from(container.querySelectorAll<HTMLElement>("[data-item]"))
    if (!items.length) return

    const containerRight = container.getBoundingClientRect().right - 64

    let cutoff = specialties.length
    for (let i = 0; i < items.length; i++) {
      if (items[i].getBoundingClientRect().right > containerRight) {
        cutoff = i
        break
      }
    }

    setVisibleCount(cutoff)
  }, [specialties])

  useLayoutEffect(() => {
    measure()

    const container = containerRef.current
    if (!container) return

    // Toggling opacity/order on hidden items doesn't change container width,
    // so the observer only fires on genuine layout changes (window resize, etc.)
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [measure])

  const hidden = specialties.length - visibleCount

  return (
    <div ref={containerRef} className="profile-specialties-row">
      {specialties.map((s, i) => {
        const isHidden = i >= visibleCount
        return (
          <span
            key={s}
            data-item
            className="profile-specialty-item"
            style={isHidden
              ? { order: 3, opacity: 0, pointerEvents: "none" }
              : { order: 1 }}
            aria-hidden={isHidden || undefined}
          >
            {i > 0 && <span className="profile-specialty-sep" aria-hidden>·</span>}
            <Link href={`/${toSlug(s)}`} tabIndex={isHidden ? -1 : undefined}>{s}</Link>
          </span>
        )
      })}
      {hidden > 0 && (
        <span className="profile-specialty-more" style={{ order: 2 }}>+{hidden} more</span>
      )}
    </div>
  )
}
