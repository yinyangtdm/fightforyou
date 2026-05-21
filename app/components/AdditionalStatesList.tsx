"use client"

import { useRef, useLayoutEffect, useState, useCallback } from "react"
import { STATE_NAMES } from "../lib/slugs"

export default function AdditionalStatesList({ states }: { states: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = useState(0)
  const lastWidth = useRef(0)

  const measure = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const currentWidth = container.getBoundingClientRect().width
    if (Math.abs(currentWidth - lastWidth.current) < 1 && lastWidth.current !== 0) return
    lastWidth.current = currentWidth

    const items = Array.from(container.querySelectorAll<HTMLElement>("[data-item]"))
    if (!items.length) return

    const containerRect = container.getBoundingClientRect()

    items.forEach(el => {
      el.style.display = ""
      el.style.flexShrink = "0"
    })
    container.style.overflow = "visible"
    void container.offsetHeight

    const rects = items.map(el => el.getBoundingClientRect())

    container.style.overflow = ""
    items.forEach(el => { el.style.flexShrink = "" })

    let cutoff = items.length
    for (let i = 0; i < items.length; i++) {
      if (rects[i].right > containerRect.right - 12) {
        cutoff = i
        break
      }
    }

    if (cutoff < items.length) {
      const MORE_WIDTH = 72
      while (cutoff > 0 && containerRect.right - rects[cutoff - 1].right < MORE_WIDTH) {
        cutoff--
      }
    }

    items.forEach((el, i) => {
      if (i >= cutoff) el.style.display = "none"
    })

    setVisibleCount(cutoff)
  }, [])

  useLayoutEffect(() => {
    lastWidth.current = 0

    const container = containerRef.current
    if (!container) return

    setVisibleCount(states.length)
    void container.offsetHeight
    measure()

    document.fonts.ready.then(() => {
      requestAnimationFrame(() => { lastWidth.current = 0; measure() })
    })

    const observer = new ResizeObserver(() => { lastWidth.current = 0; requestAnimationFrame(() => requestAnimationFrame(measure)) })
    observer.observe(container)
    return () => observer.disconnect()
  }, [measure, states.length])

  const hidden = states.length - visibleCount

  return (
    <div ref={containerRef} className="profile-specialties-row">
      <span className="profile-specialty-item profile-also-serves-label">Also serves:&nbsp;</span>
      {states.map((abbr, i) => {
        const isHidden = i >= visibleCount
        return (
          <span
            key={abbr}
            data-item
            className="profile-specialty-item"
            style={isHidden ? { display: "none" } : undefined}
            aria-hidden={isHidden || undefined}
          >
            {i > 0 && <span className="profile-specialty-sep" aria-hidden>, </span>}
            {STATE_NAMES[abbr] ?? abbr}
          </span>
        )
      })}
      {hidden > 0 && (
        <span className="profile-specialty-more">+{hidden} more</span>
      )}
    </div>
  )
}
