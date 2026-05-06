"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toSlug, STATE_ABBRS } from "../lib/slugs"

export default function InlineSearch({
  type,
  options,
  currentSlug,
}: {
  type: "state" | "specialty"
  options: string[]
  currentSlug: string
}) {
  const router = useRouter()
  const [value, setValue] = useState("")
  const [results, setResults] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  function handleChange(val: string) {
    setValue(val)
    const filtered = val
      ? options.filter((o) => o.toLowerCase().includes(val.toLowerCase()))
      : []
    setResults(filtered)
    setOpen(filtered.length > 0)
    setActiveIndex(-1)
  }

  function handleSelect(option: string) {
    setValue(option)
    setOpen(false)
    if (type === "state") {
      router.push(`/${toSlug(option)}/${currentSlug}`)
    } else {
      const stateAbbr = STATE_ABBRS[option]
      router.push(`/${currentSlug}/${stateAbbr}`)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const visible = results.slice(0, 7)
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, visible.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(visible[activeIndex])
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  const visible = results.slice(0, 7)
  const placeholder = type === "state" ? "Filter by practice area…" : "Filter by state…"

  return (
    <div className="inline-search" ref={containerRef}>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => value && results.length && setOpen(true)}
        onKeyDown={handleKeyDown}
        className="inline-search-input"
      />
      {open && (
        <div className="inline-search-dropdown">
          {visible.map((item, i) => (
            <div
              key={item}
              className={`inline-search-item${i === activeIndex ? " highlighted" : ""}`}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(item) }}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
