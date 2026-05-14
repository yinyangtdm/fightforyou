const path = require("path")
require("dotenv").config({ path: path.join(__dirname, "..", ".env") })
const { PrismaClient } = require("@prisma/client")
const { PrismaPg } = require("@prisma/adapter-pg")

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

// Complete merge history — all rounds combined.
// Chains are flattened: if A→B and B→C, A is mapped directly to C.
const MERGES = {
  // Round 1 — initial cleanup
  "Appellate Litigation":         "Appellate Law",
  "Catastrophic Personal Injury": "Catastrophic Injury",
  "In-Custody Death":             "Death in Custody",
  "Jail Death":                   "Death in Custody",
  "Wrongful Incarceration":       "Wrongful Imprisonment",
  "Jail Medical Neglect":         "Medical Neglect",
  "Government Liability":         "Monell Claims",
  "Police Accountability":        "Police Misconduct",
  "Government Accountability":    "Government Misconduct",

  // Into Police Brutality
  "Taser Abuse":                  "Police Brutality",
  "K-9 Attacks":                  "Police Brutality",
  "Restraint Asphyxia":           "Police Brutality",
  "Excessive Force":              "Police Brutality",
  "Police Shootings":             "Police Brutality",

  // Into Police Misconduct (chains flattened)
  "Fourth Amendment":             "Police Misconduct",
  "Illegal Searches":             "Police Misconduct",
  "Illegal Search and Seizure":   "Police Misconduct",
  "Police Pursuit":               "Police Misconduct",
  "Police Retaliation":           "Police Misconduct",
  "Racial Profiling":             "Police Misconduct",
  "Unlawful Stops":               "Police Misconduct",
  "Evidence Planting":            "Police Misconduct",
  "Police Framing":               "Police Misconduct",

  // Into Police Negligence
  "Vehicular Negligence":         "Police Negligence",

  // Into Prison Reform (chains flattened)
  "Prisoner Rights":              "Prison Reform",
  "Jail Neglect":                 "Prison Reform",
  "Jail Conditions":              "Prison Reform",

  // Into Medical Neglect
  "Deliberate Indifference":      "Medical Neglect",

  // Into Activist Rights
  "Protester Rights":             "Activist Rights",

  // Into Bivens Actions
  "Federal Agents":               "Bivens Actions",

  // Into Civil Rights
  "Section 1983":                 "Civil Rights",

  // Into Government Misconduct
  "DOJ Investigations":           "Government Misconduct",

  // Into Monell Claims
  "Municipal Oversight":          "Monell Claims",

  // Into Systemic Reform
  "Institutional Accountability": "Systemic Reform",

  // Into Class Action
  "Mass Litigation":              "Class Action",

  // Into Wrongful Conviction
  "Exoneration":                  "Wrongful Conviction",

  // Round 2 — consolidate variants from auto-fill
  // Section 1983 variants → Civil Rights
  "42 U.S.C. § 1983 Claims":                  "Civil Rights",
  "42 U.S.C. § 1983 Litigation":              "Civil Rights",
  "Section 1983 Claims":                       "Civil Rights",
  "Section 1983 Litigation":                   "Civil Rights",
  "Section 1983 Civil Rights Claims":          "Civil Rights",
  "Section 1983 Civil Rights Litigation":      "Civil Rights",
  "Section 1983 Federal Civil Rights Claims":  "Civil Rights",

  // Civil Rights variants → Civil Rights
  "Civil Rights Claims":             "Civil Rights",
  "Civil Rights Litigation":         "Civil Rights",
  "Civil Rights Violations":         "Civil Rights",
  "Civil Rights Defense":            "Civil Rights",

  // Constitutional Law variants
  "Constitutional Rights Violations": "Constitutional Law",
  "Constitutional Violations":        "Constitutional Law",

  // False Arrest variants
  "False Arrest and Imprisonment":       "False Arrest",
  "False Arrest and Unlawful Detention": "False Arrest",

  // Unlawful Detention variants
  "False Imprisonment":          "Unlawful Detention",
  "Unconstitutional Detention":  "Unlawful Detention",

  // Wrongful Death / Police Misconduct variants
  "Wrongful Death Defense":   "Wrongful Death",
  "Police Misconduct Defense": "Police Misconduct",

  // Monell / Government variants
  "Governmental Liability":  "Monell Claims",
  "Municipal Liability":     "Monell Claims",
  "Government Negligence":   "Government Misconduct",

  // Prison / Custody variants → Prison Reform
  "In-custody death":               "Death in Custody",
  "In-custody Death":               "Death in Custody",
  "Correctional Officer Abuse":     "Prison Reform",
  "Custodial Abuse":                "Prison Reform",
  "Jail and Detention Facility Abuse": "Prison Reform",
  "Jail and Prison Civil Rights":   "Prison Reform",
  "Pretrial Justice":               "Prison Reform",

  // Medical Neglect variants
  "Custodial Neglect":         "Medical Neglect",
  "Institutional Abuse & Neglect": "Medical Neglect",

  // Social / First Amendment variants
  "First Amendment Rights":    "First Amendment",
  "First Amendment Violations": "First Amendment",
  "Racial Discrimination":     "Discrimination",

  // Search and seizure variants
  "Fourth Amendment Violations": "Unlawful Search and Seizure",
  "Unlawful Surveillance":       "Unlawful Search and Seizure",

  // Police Brutality variants
  "Excessive force":            "Police Brutality",
  "Officer-Involved Shootings": "Police Brutality",

  // Sexual assault variants
  "Sexual Abuse by Law Enforcement": "Sexual Assault by Law Enforcement",

  // Wrongful Conviction variants
  "Exoneration Cases": "Wrongful Conviction",
}

const REMOVE = new Set([
  "Immigration Rights",
  "LGBTQ Rights",
  "Reproductive Rights",
  "Tribal Rights",
  "Qualified Immunity",
  "Mental Health Crisis",
  "Appellate Litigation",
  "Trial Advocacy",
])

async function main() {
  const listings = await prisma.listing.findMany({
    select: { id: true, name: true, specialties: true },
  })

  let updated = 0

  for (const listing of listings) {
    const merged = listing.specialties
      .filter((s) => !REMOVE.has(s))
      .map((s) => MERGES[s] ?? s)

    const deduped = [...new Set(merged)]

    const changed =
      deduped.length !== listing.specialties.length ||
      deduped.some((s, i) => s !== listing.specialties[i])

    if (changed) {
      await prisma.listing.update({
        where: { id: listing.id },
        data: { specialties: deduped },
      })
      console.log(`Updated: ${listing.name}`)
      console.log(`  Before: ${listing.specialties.join(", ")}`)
      console.log(`  After:  ${deduped.join(", ")}`)
      updated++
    }
  }

  console.log(`\nDone. ${updated} listing(s) updated.`)
}

main().finally(() => prisma.$disconnect())
