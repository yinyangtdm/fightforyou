"use client"

import { useState } from "react"

interface Question {
  key: string
  pts: number
  dealbreaker?: number
  label: string
  tag?: "critical" | "key"
}

interface Section {
  id: "liability" | "damages" | "procedure"
  title: string
  maxPts: number
  questions: Question[]
}

const SECTIONS: Section[] = [
  {
    id: "liability",
    title: "Part 1 — Liability",
    maxPts: 10,
    questions: [
      { key: "govt", pts: 0, dealbreaker: 1, tag: "critical", label: "A government actor was involved — police officer, corrections officer, or other agency employee" },
      { key: "capacity", pts: 0, dealbreaker: 2, tag: "critical", label: "They were acting in their official capacity at the time of the incident" },
      { key: "violation", pts: 3, tag: "key", label: "You can identify a specific constitutional violation — unlawful search, excessive force, false arrest, denial of due process, etc." },
      { key: "evidence", pts: 3, tag: "key", label: "Evidence exists to support the violation — video footage, photos, witness accounts, or medical records" },
      { key: "clear", pts: 2, label: "The conduct was clearly unlawful — not a borderline judgment call a reasonable officer could defend" },
      { key: "pattern", pts: 2, label: "There is evidence of a broader policy or pattern of misconduct by the department (prior complaints, similar incidents, internal records)" },
    ],
  },
  {
    id: "damages",
    title: "Part 2 — Damages",
    maxPts: 17,
    questions: [
      { key: "death", pts: 3, tag: "key", label: "Someone died as a result of the incident — a surviving family member may bring a wrongful death and/or Section 1983 claim on the decedent's behalf" },
      { key: "physical", pts: 2, tag: "key", label: "You (or the victim) suffered physical injury and sought medical treatment — documented in records" },
      { key: "disability", pts: 2, tag: "key", label: "The incident caused a permanent or long-term disability — loss of mobility, chronic pain, cognitive impairment, or other lasting physical limitation" },
      { key: "incarceration", pts: 2, tag: "key", label: "You were wrongfully held in jail or prison as a result of the incident — time served that would not have occurred absent the misconduct" },
      { key: "economic", pts: 2, tag: "key", label: "You experienced economic harm — lost wages, lost employment, or other quantifiable financial loss" },
      { key: "psych", pts: 1, label: "You have documented psychological or emotional harm — therapy records, PTSD diagnosis, anxiety, depression, or similar" },
      { key: "property", pts: 1, label: "Personal property was damaged, destroyed, or unlawfully seized and not returned — vehicle, phone, cash, belongings" },
      { key: "reputation", pts: 1, label: "You suffered reputational harm — a public arrest record, mug shot publication, false statements made by officers, or community/employer notification" },
      { key: "career", pts: 1, label: "You lost or were denied a professional license, security clearance, government job, or specific career opportunity as a direct result of the incident" },
      { key: "family", pts: 1, label: "You experienced family separation or loss of custody of a child as a result of the incident or resulting charges" },
      { key: "charges", pts: 1, label: "Criminal charges were filed against you and later dropped or resolved in your favor" },
    ],
  },
  {
    id: "procedure",
    title: "Part 3 — Procedure & Timing",
    maxPts: 6,
    questions: [
      { key: "sol", pts: 0, dealbreaker: 3, tag: "critical", label: "The incident occurred within the applicable statute of limitations — typically 2–3 years for Section 1983 claims" },
      { key: "notice", pts: 3, tag: "key", label: "You filed (or can still file) a timely Notice of Claim with the municipality — windows can be as short as 60–90 days" },
      { key: "preserved", pts: 2, label: "Video, body camera footage, or documentary evidence has been preserved or formally requested" },
      { key: "witnesses", pts: 1, label: "You have identified and have contact information for at least one independent witness" },
    ],
  },
]

const ALL_QUESTIONS = SECTIONS.flatMap(s => s.questions)

const DEALBREAKER_MSGS: Record<number, string> = {
  1: "No government actor identified — Section 1983 only applies to officials acting under color of state law.",
  2: "The actor was not in their official capacity — off-duty conduct without connection to their authority is typically not actionable under Section 1983.",
  3: "Statute of limitations has likely expired — this permanently bars your federal civil rights claim regardless of its merit.",
}

const VERDICTS = [
  { min: 22, label: "You likely have a strong case", color: "#A3BE8C", sub: "Your responses indicate substantial liability, documented damages, and sound procedural footing. A civil rights attorney will likely be very interested in these facts. You should consult one as soon as possible to evaluate your specific circumstances." },
  { min: 13, label: "You may have a viable case", color: "#81A1C1", sub: "Your situation has meaningful strengths but also areas that may complicate litigation. A civil rights attorney can assess whether the gaps are bridgeable. Many of these cases settle before trial — even with imperfect facts." },
  { min: 5, label: "Your case has significant weaknesses", color: "#EBCB8B", sub: "There are elements here worth discussing with an attorney, but important factors are missing — particularly around evidence, damages, or procedure. Your attorney may advise the case is difficult to pursue without more documentation." },
  { min: 0, label: "A case is unlikely based on these factors", color: "#BF616A", sub: "Based on your responses, the foundational elements for a viable civil rights lawsuit appear to be lacking. Individual circumstances always vary — a free consultation with a civil rights attorney can confirm this assessment." },
]

const SECTION_ICON_STYLES = {
  liability: { background: "rgba(94, 129, 172, 0.2)", color: "#81A1C1" },
  damages:   { background: "rgba(163, 190, 140, 0.2)", color: "#A3BE8C" },
  procedure: { background: "rgba(235, 203, 139, 0.2)", color: "#EBCB8B" },
}

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

const SECTION_ICONS = {
  liability: <ShieldIcon />,
  damages:   <HeartIcon />,
  procedure: <ClockIcon />,
}

const LIABILITY_KEYS  = ["violation", "evidence", "clear", "pattern"]
const DAMAGES_KEYS    = ["death", "physical", "disability", "incarceration", "economic", "psych", "property", "reputation", "career", "family", "charges"]
const PROCEDURE_KEYS  = ["notice", "preserved", "witnesses"]

export default function CaseEvaluator() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [hasInteracted, setHasInteracted] = useState(false)

  const toggle = (key: string) => {
    setHasInteracted(true)
    setChecked(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const pts = (k: string) => ALL_QUESTIONS.find(q => q.key === k)?.pts ?? 0
  const sum = (keys: string[]) => keys.reduce((s, k) => s + (checked[k] ? pts(k) : 0), 0)

  const liability  = sum(LIABILITY_KEYS)
  const damages    = sum(DAMAGES_KEYS)
  const procedure  = sum(PROCEDURE_KEYS)
  const total      = liability + damages + procedure

  let dealbreaker: number | null = null
  for (const db of [1, 2, 3]) {
    const q = ALL_QUESTIONS.find(q => q.dealbreaker === db)
    if (q && !checked[q.key]) dealbreaker = db
  }

  const flags: { text: string; color: string }[] = []
  if (hasInteracted) {
    if (!checked["evidence"])
      flags.push({ text: "No evidence identified — without documentation, even valid claims are very hard to win.", color: "#BF616A" })
    const hasSignificantDamage = ["death", "physical", "disability", "incarceration", "economic"].some(k => checked[k])
    if (!hasSignificantDamage)
      flags.push({ text: "No significant documented harm identified — courts award limited damages without tangible physical, financial, or fatal injury.", color: "#EBCB8B" })
    if (!checked["notice"])
      flags.push({ text: "Notice of claim status unclear — missing this short window can bar your state law claims entirely.", color: "#EBCB8B" })
    if (!checked["preserved"])
      flags.push({ text: "Evidence not yet preserved — body camera and security footage is often deleted within 30–90 days. Act immediately.", color: "#EBCB8B" })
  }

  const sectionScore = (id: string) =>
    id === "liability" ? liability : id === "damages" ? damages : procedure

  let verdictLabel = "Check the boxes above that apply to your situation."
  let verdictColor = "var(--text-muted)"
  let verdictSub   = ""
  let meterPct     = 0

  if (hasInteracted) {
    if (dealbreaker) {
      verdictLabel = "Case not viable — critical requirement unmet"
      verdictColor = "#BF616A"
      verdictSub   = DEALBREAKER_MSGS[dealbreaker]
      meterPct     = 5
    } else {
      const verdict = VERDICTS.find(v => total >= v.min) ?? VERDICTS[VERDICTS.length - 1]
      verdictLabel  = verdict.label
      verdictColor  = verdict.color
      verdictSub    = verdict.sub
      meterPct      = Math.max(4, Math.round((total / 33) * 100))
    }
  }

  return (
    <div className="evaluator">
      {SECTIONS.map(section => (
        <div key={section.id} className="eval-section">
          <div className="eval-section-head">
            <div className="eval-section-icon" style={SECTION_ICON_STYLES[section.id]}>
              {SECTION_ICONS[section.id]}
            </div>
            <span className="eval-section-title">{section.title}</span>
            <span className="eval-section-score">{sectionScore(section.id)} / {section.maxPts} pts</span>
          </div>
          <div className="eval-q-list">
            {section.questions.map((q, i) => (
              <div key={q.key}>
                {i > 0 && <div className="eval-divider" />}
                <label className="eval-q-item">
                  <input
                    type="checkbox"
                    checked={!!checked[q.key]}
                    onChange={() => toggle(q.key)}
                  />
                  <span className="eval-q-label">
                    {q.label}
                    {q.tag === "critical" && <span className="eval-q-tag eval-tag-critical">required</span>}
                    {q.tag === "key" && <span className="eval-q-tag eval-tag-key">high value</span>}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="eval-verdict">
        <div className="eval-verdict-label" style={{ color: verdictColor }}>{verdictLabel}</div>
        <div className="eval-tier-guide">
          <span className="eval-tier-pip" style={{ background: "#A3BE8C", color: "#2e3440" }}>22+ strong</span>
          <span className="eval-tier-pip" style={{ background: "#81A1C1", color: "#2e3440" }}>13–21 viable</span>
          <span className="eval-tier-pip" style={{ background: "#EBCB8B", color: "#2e3440" }}>5–12 weak</span>
          <span className="eval-tier-pip" style={{ background: "#BF616A", color: "#2e3440" }}>0–4 unlikely</span>
        </div>
        <div className="eval-meter-track">
          <div className="eval-meter-fill" style={{ width: `${meterPct}%`, background: verdictColor }} />
        </div>
        <div className="eval-score-row">
          {[
            { val: `${liability}/10`, lbl: "Liability" },
            { val: `${damages}/17`,   lbl: "Damages" },
            { val: `${procedure}/6`,  lbl: "Procedure" },
            { val: `${total}/33`,     lbl: "Total" },
          ].map(p => (
            <div key={p.lbl} className="eval-score-pill">
              <div className="eval-score-pill-val">{p.val}</div>
              <div className="eval-score-pill-lbl">{p.lbl}</div>
            </div>
          ))}
        </div>
        {verdictSub && <p className="eval-verdict-sub">{verdictSub}</p>}
        {hasInteracted && !dealbreaker && flags.length > 0 && (
          <div className="eval-flags">
            {flags.map((f, i) => (
              <div key={i} className="eval-flag-item">
                <div className="eval-flag-dot" style={{ background: f.color }} />
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        )}
        <div className="guide-disclaimer">
          This tool is for general educational purposes only and does not constitute legal advice.
          Laws vary by jurisdiction and change over time. Consult a licensed civil rights attorney
          for guidance specific to your situation.
        </div>
      </div>
    </div>
  )
}
