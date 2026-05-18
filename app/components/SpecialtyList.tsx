"use client"

import { useRef, useLayoutEffect, useState, useCallback } from "react"
import Link from "next/link"
import { toSlug } from "../lib/slugs"

export default function SpecialtyList({ specialties }: { specialties: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = useState(specialties.length)
  const lastWidth = useRef(0)

  const measure = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const currentWidth = container.getBoundingClientRect().width
    if (Math.abs(currentWidth - lastWidth.current) < 1 && lastWidth.current !== 0) return
    lastWidth.current = currentWidth

    const items = Array.from(container.querySelectorAll<HTMLElement>("[data-item]"))
    if (!items.length) return

    // Show all items for measurement
    items.forEach(el => { el.style.display = "" })
    void container.offsetHeight

    const containerRect = container.getBoundingClientRect()
    const rects = items.map(el => el.getBoundingClientRect())

    // Collect distinct line tops (4px tolerance for subpixel)
    const lineTops: number[] = []
    for (const r of rects) {
      if (!lineTops.some(t => Math.abs(t - r.top) < 4)) lineTops.push(r.top)
    }
    lineTops.sort((a, b) => a - b)

    const maxTop = lineTops.length >= 2 ? lineTops[1] : (lineTops[0] ?? 0)

    // Cut items that fall on line 3+
    let cutoff = items.length
    for (let i = 0; i < items.length; i++) {
      if (rects[i].top > maxTop + 4) {
        cutoff = i
        break
      }
    }

    // Also cut items that overflow the container's right edge
    for (let i = 0; i < cutoff; i++) {
      if (rects[i].right > containerRect.right + 1) {
        cutoff = i
        break
      }
    }

    // If there are hidden items, walk back until "+N more" fits
    if (cutoff < items.length) {
      const MORE_WIDTH = 80
      while (cutoff > 0 && containerRect.right - rects[cutoff - 1].right < MORE_WIDTH) {
        cutoff--
      }
    }

    setVisibleCount(cutoff)
  }, [specialties])

  useLayoutEffect(() => {
    lastWidth.current = 0

    const container = containerRef.current
    if (!container) return

    document.fonts.ready.then(() => {
      requestAnimationFrame(() => { lastWidth.current = 0; measure() })
    })

    const observer = new ResizeObserver(() => requestAnimationFrame(measure))
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
            style={isHidden ? { display: "none" } : undefined}
            aria-hidden={isHidden || undefined}
          >
            {i > 0 && <span className="profile-specialty-sep" aria-hidden>·</span>}
            <Link href={`/${toSlug(s)}`} tabIndex={isHidden ? -1 : undefined}>{s}</Link>
          </span>
        )
      })}
      {hidden > 0 && (
        <span className="profile-specialty-more">+{hidden} more</span>
      )}
    </div>
  )
}
