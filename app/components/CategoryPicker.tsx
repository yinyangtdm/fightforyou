"use client"
import { useState, useRef, useEffect } from "react"
import { specialtyDescriptions } from "../lib/specialty-descriptions"
import { STATE_NAMES } from "../lib/slugs"

const ALL_OPTIONS: string[] = [
  "General",
  "Other",
  ...Object.keys(specialtyDescriptions),
  ...Object.values(STATE_NAMES),
].sort()

interface CategoryPickerProps {
  value: string[]
  onChange: (v: string[]) => void
}

export default function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = ALL_OPTIONS
    .filter(o => !value.includes(o))
    .filter(o => o.toLowerCase().includes(query.toLowerCase()))

  function add(option: string) {
    onChange([...value, option])
    setQuery("")
  }

  function remove(option: string) {
    onChange(value.filter(v => v !== option))
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const showDropdown = open && filtered.length > 0

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          padding: "6px 8px",
          border: "1px solid #4c566a",
          borderRadius: "4px",
          background: "#2e3440",
          minHeight: "42px",
          alignItems: "center",
          cursor: "text",
        }}
        onClick={() => { setOpen(true) }}
      >
        {value.map(tag => (
          <span
            key={tag}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              background: "#434c5e",
              borderRadius: "4px",
              padding: "2px 8px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#eceff4",
            }}
          >
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); remove(tag) }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0 2px",
                lineHeight: 1,
                color: "#9aa5b4",
                fontSize: "15px",
              }}
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={value.length === 0 ? "Type to search practice areas or states…" : ""}
          style={{
            border: "none",
            outline: "none",
            flexGrow: 1,
            minWidth: "160px",
            fontSize: "14px",
            padding: "2px 0",
            background: "transparent",
            color: "#eceff4",
          }}
        />
      </div>

      {showDropdown && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            margin: "4px 0 0",
            padding: 0,
            listStyle: "none",
            background: "#3b4252",
            border: "1px solid #4c566a",
            borderRadius: "4px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            zIndex: 50,
            maxHeight: "240px",
            overflowY: "auto",
            color: "#eceff4",
          }}
        >
          {filtered.map(option => (
            <li
              key={option}
              onMouseDown={(e) => { e.preventDefault(); add(option) }}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: "14px",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#434c5e")}
              onMouseLeave={e => (e.currentTarget.style.background = "")}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
