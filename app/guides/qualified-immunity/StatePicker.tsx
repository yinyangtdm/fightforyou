"use client"
import { useState, useRef, useEffect } from "react"
import { STATE_NAMES } from "../../lib/slugs"
import { STATE_LEGAL_DATA } from "../../lib/state-legal-data"

const STATE_LIST = Object.entries(STATE_NAMES)
  .map(([abbr, name]) => ({ abbr, name }))
  .sort((a, b) => a.name.localeCompare(b.name))

const QI_LABELS = {
  abolished: { label: "Abolished (State Claims)", className: "qi-abolished" },
  limited: { label: "Limited by State Law", className: "qi-limited" },
  "federal-doctrine": { label: "Federal Doctrine Applies", className: "qi-federal" },
}

export default function QIStatePicker() {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<{ abbr: string; name: string } | null>(null)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = STATE_LIST.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  )

  function select(state: { abbr: string; name: string }) {
    setSelected(state)
    setQuery(state.name)
    setOpen(false)
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

  const data = selected ? STATE_LEGAL_DATA[selected.abbr] : null

  return (
    <div className="state-picker-section">
      <h2 className="state-picker-heading">Look Up Your State</h2>
      <p className="state-picker-subheading">
        Select a state to see its qualified immunity status for civil rights claims.
      </p>

      <div ref={containerRef} className="state-picker-input-wrap">
        <input
          type="text"
          className="state-picker-input"
          placeholder="Type a state name…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setSelected(null) }}
          onFocus={() => setOpen(true)}
          aria-label="Select a state"
        />
        {open && filtered.length > 0 && (
          <ul className="state-picker-dropdown">
            {filtered.map((s) => (
              <li
                key={s.abbr}
                className="state-picker-option"
                onMouseDown={(e) => { e.preventDefault(); select(s) }}
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

          <div className="deadline-grid deadline-grid--two">
            <div className="deadline-card">
              <div className="deadline-card-header">
                <span className="deadline-label">Qualified Immunity Status</span>
                <span className={`deadline-qi-badge ${QI_LABELS[data.qualifiedImmunity.status].className}`}>
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
        </div>
      )}
    </div>
  )
}
