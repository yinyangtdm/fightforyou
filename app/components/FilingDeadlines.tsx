import { STATE_LEGAL_DATA } from "../lib/state-legal-data"

const QI_LABELS = {
  abolished: { label: "Abolished (State Claims)", className: "qi-abolished" },
  limited: { label: "Limited by State Law", className: "qi-limited" },
  "federal-doctrine": { label: "Federal Doctrine Applies", className: "qi-federal" },
}

export default function FilingDeadlines({ stateAbbr }: { stateAbbr: string }) {
  const data = STATE_LEGAL_DATA[stateAbbr]
  if (!data) return null

  const { sol, noticeOfClaim, qualifiedImmunity } = data
  const qi = QI_LABELS[qualifiedImmunity.status]

  return (
    <div className="filing-deadlines">
      <h2 className="filing-deadlines-title">State Filing Deadlines &amp; Legal Limits</h2>
      <p className="filing-deadlines-disclaimer">
        For general reference only — not legal advice. Deadlines may vary based on facts and should be verified with an attorney.
      </p>

      <div className="deadline-grid">
        <div className="deadline-card">
          <div className="deadline-card-header">
            <span className="deadline-label">Civil Rights &amp; Personal Injury</span>
            <span className="deadline-years">{sol.years} {sol.years === 1 ? "year" : "years"}</span>
          </div>
          <p className="deadline-code">{sol.stateStatute}</p>
          <p className="deadline-note">
            Federal § 1983 civil rights claims borrow the state personal injury statute of limitations.{" "}
            {sol.personalInjuryYears && sol.personalInjuryYears !== sol.years && (
              <>
                Note: the general personal injury SOL in this state is {sol.personalInjuryYears}{" "}
                {sol.personalInjuryYears === 1 ? "year" : "years"} ({sol.personalInjuryStatute}), but federal courts
                apply the longer catch-all period for § 1983 claims.
              </>
            )}
          </p>
        </div>

        <div className="deadline-card">
          <div className="deadline-card-header">
            <span className="deadline-label">Notice of Claim Against Government</span>
            <span className="deadline-years">
              {noticeOfClaim.days
                ? `${noticeOfClaim.days} days`
                : "No general requirement"}
            </span>
          </div>
          {noticeOfClaim.statute && (
            <p className="deadline-code">{noticeOfClaim.statute}</p>
          )}
          <p className="deadline-note">{noticeOfClaim.note}</p>
        </div>

        <div className="deadline-card">
          <div className="deadline-card-header">
            <span className="deadline-label">Qualified Immunity</span>
            <span className={`deadline-qi-badge ${qi.className}`}>{qi.label}</span>
          </div>
          {(qualifiedImmunity.law || qualifiedImmunity.statute) && (
            <p className="deadline-code">
              {qualifiedImmunity.law}
              {qualifiedImmunity.law && qualifiedImmunity.statute && " — "}
              {qualifiedImmunity.statute}
            </p>
          )}
          <p className="deadline-note">{qualifiedImmunity.summary}</p>
        </div>
      </div>
    </div>
  )
}
