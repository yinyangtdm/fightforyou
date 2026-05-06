"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toSlug, STATE_ABBRS } from "../lib/slugs"

function highlight(text: string, query: string): string {
  if (!query) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return text.replace(new RegExp(`(${escaped})`, "gi"), "<mark>$1</mark>")
}

function AutocompleteField({
  placeholder,
  data,
  icon,
  value,
  onChange,
}: {
  placeholder: string
  data: string[]
  icon: "search" | "location"
  value: string
  onChange: (val: string) => void
}) {
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
    onChange(val)
    const filtered = val
      ? data.filter((d) => d.toLowerCase().includes(val.toLowerCase()))
      : []
    setResults(filtered)
    setOpen(filtered.length > 0)
    setActiveIndex(-1)
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
      onChange(visible[activeIndex])
      setOpen(false)
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  function selectItem(label: string) {
    onChange(label)
    setOpen(false)
  }

  const visible = results.slice(0, 7)

  return (
    <div className="search-field" ref={containerRef}>
      {icon === "search" ? (
        <svg className="search-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx={11} cy={11} r={8} />
          <line x1={21} y1={21} x2={16.65} y2={16.65} />
        </svg>
      ) : (
        <svg className="search-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx={12} cy={10} r={3} />
        </svg>
      )}
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => value && results.length && setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {open && (
        <div className="autocomplete-dropdown">
          {visible.map((item, i) => (
            <div
              key={item}
              className={`autocomplete-item${i === activeIndex ? " highlighted" : ""}`}
              onMouseDown={(e) => { e.preventDefault(); selectItem(item) }}
            >
              <span dangerouslySetInnerHTML={{ __html: highlight(item, value) }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SearchBar({
  states,
  practices,
}: {
  states: string[]
  practices: string[]
}) {
  const router = useRouter()
  const [practice, setPractice] = useState("")
  const [state, setState] = useState("")

  function handleSearch() {
    const matchedPractice = practices.find(
      (p) => p.toLowerCase() === practice.trim().toLowerCase()
    )
    const matchedState = states.find(
      (s) => s.toLowerCase() === state.trim().toLowerCase()
    )
    const practiceSlug = matchedPractice ? toSlug(matchedPractice) : null
    const stateSlug = matchedState ? STATE_ABBRS[matchedState] : null

    if (practiceSlug && stateSlug) {
      router.push(`/${practiceSlug}/${stateSlug}`)
    } else if (practiceSlug) {
      router.push(`/${practiceSlug}`)
    } else if (stateSlug) {
      router.push(`/${stateSlug}`)
    }
  }

  return (
    <div className="search-bar" style={{ maxWidth: 760 }}>
      <AutocompleteField
        placeholder="Practice Area"
        data={practices}
        icon="search"
        value={practice}
        onChange={setPractice}
      />
      <AutocompleteField
        placeholder="State"
        data={states}
        icon="location"
        value={state}
        onChange={setState}
      />
      <button className="search-btn" onClick={handleSearch}>Search</button>
    </div>
  )
}
