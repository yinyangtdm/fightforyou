"use client"

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

  function handleChange(value: string) {
    if (!value) return
    if (type === "state") {
      router.push(`/${toSlug(value)}/${currentSlug}`)
    } else {
      const stateAbbr = STATE_ABBRS[value]
      if (!stateAbbr) return
      router.push(`/${currentSlug}/${stateAbbr}`)
    }
  }

  if (options.length === 0) return null

  const label = type === "state" ? "Filter by practice area" : "Filter by state"

  return (
    <div className="filter-dropdown">
      <select defaultValue="" onChange={(e) => handleChange(e.target.value)}>
        <option value="" disabled>{label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <svg className="filter-dropdown-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  )
}
