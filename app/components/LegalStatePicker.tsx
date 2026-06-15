"use client"

import { useState, useRef, useEffect } from "react"
import { STATE_NAMES } from "../lib/slugs"
import { STATE_LEGAL_DATA } from "../lib/state-legal-data"

const STATE_LIST = Object.entries(STATE_NAMES)
  .map(([abbr, name]) => ({ abbr, name }))
  .sort((a, b) => a.name.localeCompare(b.name))

const QI_LABELS = {
  abolished: { label: "Abolished (State Claims)", className: "qi-abolished" },
  limited: { label: "Limited by State Law", className: "qi-limited" },
  "federal-doctrine": { label: "Federal Doctrine Applies", className: "qi-federal" },
} as const

type Variant = "deadlines" | "qualified-immunity"

const VARIANT_COPY: Record<
  Variant,
  { subheading: string }
> = {
  deadlines: {
    subheading: "Select a state to see its statute of limitations and notice-of-claim deadline.",
  },
  "qualified-immunity": {
    subheading: "Select a state to see its qualified immunity status for civil rights claims.",
  },
}

export default function LegalStatePicker({ variant }: { variant: Variant }) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<{ abbr: string; name: string } | null>(null)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = STATE_LIST.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = (state: { abbr: string; name: string }) => {
    setSelected(state)
    setQuery(state.name)
    setOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const data = selected ? STATE_LEGAL_DATA[selected.abbr] : null

  return (
    <div className="state-picker-section">
      <h2 className="state-picker-heading">Look Up Your State</h2>
      <p className="state-picker-subheading">{VARIANT_COPY[variant].subheading}</p>

      <div ref={containerRef} className="state-picker-input-wrap">
        <input
          type="text"
          className="state-picker-input"
          placeholder="Type a state name…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setSelected(null)
          }}
          onFocus={() => setOpen(true)}
          aria-label="Select a state"
        />
        {open && filtered.length > 0 && (
          <ul className="state-picker-dropdown">
            {filtered.map((s) => (
              <li
                key={s.abbr}
                className="state-picker-option"
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelect(s)
                }}
              >
                {s.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {data && selected && (
        <div className="state-picker-result">
          <h3 className="state-picker-result-heading">{selected.name}</h3>

          {variant === "deadlines" ? (
            <div className="deadline-grid deadline-grid--two">
              <div className="deadline-card">
                <div className="deadline-card-header">
                  <span className="deadline-label">Civil Rights &amp; Personal Injury SOL</span>
                  <span className="deadline-years">
                    {data.sol.years} {data.sol.years === 1 ? "year" : "years"}
                  </span>
                </div>
                <p className="deadline-code">{data.sol.stateStatute}</p>
                <p className="deadline-note">
                  Federal § 1983 civil rights claims borrow the state personal injury statute of limitations.{" "}
                  {data.sol.personalInjuryYears && data.sol.personalInjuryYears !== data.sol.years && (
                    <>
                      Note: the general personal injury SOL in this state is {data.sol.personalInjuryYears}{" "}
                      {data.sol.personalInjuryYears === 1 ? "year" : "years"} ({data.sol.personalInjuryStatute}),
                      but federal courts apply the longer catch-all period for § 1983 claims.
                    </>
                  )}
                </p>
              </div>

              <div className="deadline-card">
                <div className="deadline-card-header">
                  <span className="deadline-label">Notice of Claim Against Government</span>
                  <span className="deadline-years">
                    {data.noticeOfClaim.days ? `${data.noticeOfClaim.days} days` : "No general requirement"}
                  </span>
                </div>
                {data.noticeOfClaim.statute && (
                  <p className="deadline-code">{data.noticeOfClaim.statute}</p>
                )}
                <p className="deadline-note">{data.noticeOfClaim.note}</p>
              </div>
            </div>
          ) : (
            <div className="deadline-grid deadline-grid--two">
              <div className="deadline-card">
                <div className="deadline-card-header">
                  <span className="deadline-label">Qualified Immunity Status</span>
                  <span
                    className={`deadline-qi-badge ${QI_LABELS[data.qualifiedImmunity.status].className}`}
                  >
                    {QI_LABELS[data.qualifiedImmunity.status].label}
                  </span>
                </div>
                {(data.qualifiedImmunity.law || data.qualifiedImmunity.statute) && (
                  <p className="deadline-code">
                    {data.qualifiedImmunity.law}
                    {data.qualifiedImmunity.law && data.qualifiedImmunity.statute && " — "}
                    {data.qualifiedImmunity.statute}
                  </p>
                )}
                <p className="deadline-note">{data.qualifiedImmunity.summary}</p>
              </div>

              <div className="deadline-card">
                <div className="deadline-card-header">
                  <span className="deadline-label">§ 1983 Statute of Limitations</span>
                  <span className="deadline-years">
                    {data.sol.years} {data.sol.years === 1 ? "year" : "years"}
                  </span>
                </div>
                <p className="deadline-code">{data.sol.stateStatute}</p>
                <p className="deadline-note">
                  Shown for reference — even if QI is abolished for state claims, the federal § 1983 SOL still applies to federal claims.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
