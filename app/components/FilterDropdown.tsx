"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toSlug, STATE_ABBRS } from "../lib/slugs"

export default function FilterDropdown({
  type,
  options,
  currentSlug,
}: {
  type: "state" | "specialty"
  options: string[]
  currentSlug: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const label = type === "state" ? "Filter by practice area" : "Filter by state"

  function handleSelect(value: string) {
    setOpen(false)
    if (type === "state") {
      router.push(`/${toSlug(value)}/${currentSlug}`)
    } else {
      const stateAbbr = STATE_ABBRS[value]
      if (!stateAbbr) return
      router.push(`/${currentSlug}/${stateAbbr}`)
    }
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  if (options.length === 0) return null

  return (
    <div ref={containerRef} className="filter-dropdown">
      <button
        className="filter-dropdown-btn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        type="button"
      >
        {label}
        <svg className="filter-dropdown-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <ul className="filter-dropdown-list">
          {options.map((opt) => (
            <li
              key={opt}
              className="filter-dropdown-option"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(opt) }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
