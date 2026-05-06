export interface StateDeadlineData {
  sol: {
    years: number
    stateStatute: string
    // Only populated for WI and MN where § 1983 borrows a different SOL than personal injury
    personalInjuryYears?: number
    personalInjuryStatute?: string
  }
  noticeOfClaim: {
    days: number | null
    statute: string | null
    note: string
  }
  qualifiedImmunity: {
    status: "abolished" | "limited" | "federal-doctrine"
    summary: string
    law?: string
    statute?: string
  }
}

// sol.years = the § 1983 limitations period (borrows state personal injury SOL per Wilson v. Garcia, 471 U.S. 261 (1985))
// noticeOfClaim.days = pre-suit notice deadline for tort claims against local government / municipalities
// All data should be independently verified before relying on it for legal advice.
export const STATE_LEGAL_DATA: Record<string, StateDeadlineData> = {
  AL: {
    sol: { years: 2, stateStatute: "Ala. Code § 6-2-38(l)" },
    noticeOfClaim: {
      days: 180,
      statute: "Ala. Code § 11-47-23",
      note: "Written notice of injury must be filed with the municipality within 6 months of the injury or it is barred.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Alabama has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  AK: {
    sol: { years: 2, stateStatute: "Alaska Stat. § 09.10.070(a)" },
    noticeOfClaim: {
      days: 120,
      statute: "Alaska Stat. § 09.50.250",
      note: "Notice of claim against the State must be filed within 120 days of accrual.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Alaska has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  AZ: {
    sol: { years: 2, stateStatute: "Ariz. Rev. Stat. § 12-542" },
    noticeOfClaim: {
      days: 180,
      statute: "Ariz. Rev. Stat. § 12-821.01",
      note: "Notice of claim must be filed within 180 days of the event giving rise to the claim. Failure to comply is a complete bar.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Arizona has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  AR: {
    sol: { years: 3, stateStatute: "Ark. Code Ann. § 16-56-105" },
    noticeOfClaim: {
      days: null,
      statute: null,
      note: "No general pre-suit notice requirement for tort claims against local government under Arkansas law.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Arkansas has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  CA: {
    sol: { years: 2, stateStatute: "Cal. Civ. Proc. Code § 335.1" },
    noticeOfClaim: {
      days: 180,
      statute: "Cal. Gov. Code § 911.2",
      note: "A government tort claim must be presented to the public entity within 6 months of the incident. Suit is barred without timely presentment.",
    },
    qualifiedImmunity: {
      status: "limited",
      summary: "The California Bane Act creates a state cause of action for civil rights violations that does not provide a qualified immunity defense, allowing plaintiffs to pursue claims against government officials under state law without the QI barrier.",
      law: "Tom Bane Civil Rights Act",
      statute: "Cal. Civ. Code § 52.1",
    },
  },
  CO: {
    sol: { years: 2, stateStatute: "Colo. Rev. Stat. § 13-80-102(1)(a)" },
    noticeOfClaim: {
      days: 182,
      statute: "Colo. Rev. Stat. § 24-10-109",
      note: "Notice of claim required within 182 days under the Colorado Governmental Immunity Act (CGIA). Failure to file is jurisdictional.",
    },
    qualifiedImmunity: {
      status: "abolished",
      summary: "Colorado abolished qualified immunity for state-level civil rights claims. Law enforcement officers may be held personally liable for constitutional violations under state law without the QI defense.",
      law: "Law Enforcement Integrity Act (SB 217, 2020)",
      statute: "Colo. Rev. Stat. § 13-21-131",
    },
  },
  CT: {
    sol: { years: 3, stateStatute: "Conn. Gen. Stat. § 52-577" },
    noticeOfClaim: {
      days: 180,
      statute: "Conn. Gen. Stat. § 7-101a",
      note: "Notice of intent to commence an action against a municipality or its employees must be filed within 6 months.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Connecticut has not abolished qualified immunity. The 2020 Police Accountability Act (PA 20-1) enacted significant reforms — including decertification and transparency measures — but did not eliminate the QI defense.",
    },
  },
  DE: {
    sol: { years: 2, stateStatute: "Del. Code Ann. tit. 10, § 8119" },
    noticeOfClaim: {
      days: 365,
      statute: "Del. Code Ann. tit. 10, § 4012",
      note: "Notice of claim required within 1 year under the Delaware Tort Claims Act.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Delaware has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  DC: {
    sol: { years: 3, stateStatute: "D.C. Code § 12-301(8)" },
    noticeOfClaim: {
      days: 180,
      statute: "D.C. Code § 12-309",
      note: "Written notice of the injury must be provided to the Mayor within 6 months of the injury. Actual or constructive knowledge by the District may substitute.",
    },
    qualifiedImmunity: {
      status: "limited",
      summary: "The D.C. Human Rights Act does not provide a qualified immunity defense, allowing civil rights suits against District government employees without the QI barrier for claims brought under that act.",
      statute: "D.C. Code § 2-1403.16",
    },
  },
  FL: {
    sol: { years: 2, stateStatute: "Fla. Stat. § 95.11(3)(a)" },
    noticeOfClaim: {
      days: null,
      statute: "Fla. Stat. § 768.28(6)(a)",
      note: "Written notice of the claim must be presented to the agency and the Department of Financial Services before filing suit. The agency then has 6 months to respond before suit may be brought.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Florida has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims. Note: Florida's personal injury SOL was reduced from 4 years to 2 years effective March 24, 2023 (HB 837).",
    },
  },
  GA: {
    sol: { years: 2, stateStatute: "Ga. Code Ann. § 9-3-33" },
    noticeOfClaim: {
      days: 180,
      statute: "Ga. Code Ann. § 36-33-5",
      note: "Ante litem (pre-suit) notice required within 6 months for municipal claims. State claims require notice within 12 months under Ga. Code Ann. § 50-21-26.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Georgia has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  HI: {
    sol: { years: 2, stateStatute: "Haw. Rev. Stat. § 657-7" },
    noticeOfClaim: {
      days: 365,
      statute: "Haw. Rev. Stat. § 661-5",
      note: "Notice of claim against the State must be filed within 2 years. County and municipal claims may have shorter notice periods under local ordinances.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Hawaii has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  ID: {
    sol: { years: 2, stateStatute: "Idaho Code § 5-219(4)" },
    noticeOfClaim: {
      days: 180,
      statute: "Idaho Code § 6-906",
      note: "Notice of tort claim must be filed within 180 days of the act or omission under the Idaho Tort Claims Act. Failure is an absolute bar.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Idaho has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  IL: {
    sol: { years: 2, stateStatute: "735 Ill. Comp. Stat. 5/13-202" },
    noticeOfClaim: {
      days: 365,
      statute: "745 Ill. Comp. Stat. 10/8-102",
      note: "Notice of injury to a local public entity or its employee must be filed within 1 year of the date of injury under the Local Governmental and Governmental Employees Tort Immunity Act.",
    },
    qualifiedImmunity: {
      status: "limited",
      summary: "The Illinois Human Rights Act does not provide a qualified immunity defense for state civil rights claims against government employees. The SAFE-T Act (HB 3653, 2021) also enacted significant police accountability reforms.",
      law: "SAFE-T Act / Pretrial Fairness Act (HB 3653, 2021)",
      statute: "775 Ill. Comp. Stat. 5/1-101 et seq.",
    },
  },
  IN: {
    sol: { years: 2, stateStatute: "Ind. Code § 34-11-2-4" },
    noticeOfClaim: {
      days: 180,
      statute: "Ind. Code § 34-13-3-8",
      note: "Notice of tort claim must be filed within 180 days of the loss under the Indiana Tort Claims Act.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Indiana has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  IA: {
    sol: { years: 2, stateStatute: "Iowa Code § 614.1(2)" },
    noticeOfClaim: {
      days: 60,
      statute: "Iowa Code § 670.5",
      note: "Notice of claim against a municipality must be filed within 60 days of the act, event, or condition giving rise to the claim.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Iowa has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  KS: {
    sol: { years: 2, stateStatute: "Kan. Stat. Ann. § 60-513(a)(4)" },
    noticeOfClaim: {
      days: 120,
      statute: "Kan. Stat. Ann. § 12-105b",
      note: "Notice of claim must be filed with the municipality within 120 days of the injury. State claims are governed separately under § 75-6103.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Kansas has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  KY: {
    sol: { years: 1, stateStatute: "Ky. Rev. Stat. Ann. § 413.140(1)(a)" },
    noticeOfClaim: {
      days: null,
      statute: null,
      note: "No general pre-suit notice requirement for tort claims against local governments in Kentucky.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Kentucky has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  LA: {
    sol: { years: 1, stateStatute: "La. Civ. Code art. 3492" },
    noticeOfClaim: {
      days: 90,
      statute: "La. Rev. Stat. § 13:5107",
      note: "Notice requirements vary by entity. Claims against many Louisiana political subdivisions require notice; consult counsel promptly given the 1-year prescriptive period.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Louisiana has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  ME: {
    sol: { years: 6, stateStatute: "Me. Rev. Stat. tit. 14, § 752" },
    noticeOfClaim: {
      days: 180,
      statute: "Me. Rev. Stat. tit. 14, § 8107",
      note: "Notice of claim against a governmental entity must be filed within 180 days of the act or omission under the Maine Tort Claims Act.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Maine has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  MD: {
    sol: { years: 3, stateStatute: "Md. Code Ann., Cts. & Jud. Proc. § 5-101" },
    noticeOfClaim: {
      days: 180,
      statute: "Md. Code Ann., Cts. & Jud. Proc. § 5-304",
      note: "Notice of claim required within 180 days for local government tort claims. State claims require notice within 1 year under State Gov't § 12-106.",
    },
    qualifiedImmunity: {
      status: "limited",
      summary: "The Maryland Police Accountability Act of 2021 expanded civil liability for law enforcement misconduct and limited certain officer protections under state law, creating accountability mechanisms beyond the federal § 1983 framework.",
      law: "Maryland Police Accountability Act of 2021",
      statute: "Md. Code Ann., Pub. Safety §§ 3-501 et seq.",
    },
  },
  MA: {
    sol: { years: 3, stateStatute: "Mass. Gen. Laws ch. 260, § 2A" },
    noticeOfClaim: {
      days: null,
      statute: "Mass. Gen. Laws ch. 258, § 4",
      note: "A presentment of claim to the executive officer of the public employer is required. The public employer then has 6 months to act before suit may be brought.",
    },
    qualifiedImmunity: {
      status: "limited",
      summary: "Massachusetts enacted landmark police accountability legislation in 2020 establishing a Peace Officer Standards and Training (POST) Commission and expanding accountability mechanisms. The federal QI doctrine continues to apply to § 1983 claims, but state-level reforms have broadened oversight.",
      law: "An Act Relative to Justice, Equity and Accountability in Law Enforcement (2020)",
      statute: "Mass. Gen. Laws ch. 6E",
    },
  },
  MI: {
    sol: { years: 3, stateStatute: "Mich. Comp. Laws § 600.5805(2)" },
    noticeOfClaim: {
      days: 180,
      statute: "Mich. Comp. Laws § 691.1404",
      note: "Notice of injury must be served on the governmental agency within 180 days of the accident under the Michigan Governmental Tort Liability Act.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Michigan has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  MN: {
    sol: {
      years: 6,
      stateStatute: "Minn. Stat. § 541.05(1)(5)",
      personalInjuryYears: 2,
      personalInjuryStatute: "Minn. Stat. § 541.07(1)",
    },
    noticeOfClaim: {
      days: 180,
      statute: "Minn. Stat. § 466.05",
      note: "Notice of claim against a political subdivision must be served within 180 days of the event. Note: § 1983 borrows Minnesota's 6-year catch-all SOL, not the 2-year personal injury period.",
    },
    qualifiedImmunity: {
      status: "limited",
      summary: "The Minnesota Human Rights Act does not provide a qualified immunity defense for state civil rights claims. Following the murder of George Floyd, Minnesota enacted significant police accountability legislation expanding officer liability.",
      law: "Public Safety and Community Resilience Act (2023); Minnesota Human Rights Act",
      statute: "Minn. Stat. § 363A.13",
    },
  },
  MS: {
    sol: { years: 3, stateStatute: "Miss. Code Ann. § 15-1-49" },
    noticeOfClaim: {
      days: 90,
      statute: "Miss. Code Ann. § 11-46-11",
      note: "Notice of claim must be filed within 90 days of the tortious act or omission under the Mississippi Tort Claims Act. Failure bars the suit.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Mississippi has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  MO: {
    sol: { years: 5, stateStatute: "Mo. Rev. Stat. § 516.120(4)" },
    noticeOfClaim: {
      days: 90,
      statute: "Mo. Rev. Stat. § 537.625",
      note: "Notice of claim against a governmental entity may be required within 90 days under the Missouri Sovereign Immunity Act. Requirements vary by entity.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Missouri has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  MT: {
    sol: { years: 3, stateStatute: "Mont. Code Ann. § 27-2-204(1)" },
    noticeOfClaim: {
      days: 180,
      statute: "Mont. Code Ann. § 2-9-301",
      note: "Notice of claim against a governmental entity must be filed within 6 months of the act or omission under the Montana Tort Claims Act.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Montana has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  NE: {
    sol: { years: 4, stateStatute: "Neb. Rev. Stat. § 25-207" },
    noticeOfClaim: {
      days: 365,
      statute: "Neb. Rev. Stat. § 13-919",
      note: "Notice of claim must be filed within 1 year under the Nebraska Political Subdivisions Tort Claims Act.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Nebraska has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  NV: {
    sol: { years: 2, stateStatute: "Nev. Rev. Stat. § 11.190(4)(e)" },
    noticeOfClaim: {
      days: 90,
      statute: "Nev. Rev. Stat. § 41.036",
      note: "Written notice of claim must be filed with the Attorney General or appropriate political subdivision. File promptly — do not wait for the full SOL period.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Nevada has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  NH: {
    sol: { years: 3, stateStatute: "N.H. Rev. Stat. Ann. § 508:4" },
    noticeOfClaim: {
      days: null,
      statute: null,
      note: "No general pre-suit notice requirement for tort claims against municipalities. Claims against the State are governed by the New Hampshire Claims Against the State Act (RSA 541-B).",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "New Hampshire has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  NJ: {
    sol: { years: 2, stateStatute: "N.J. Stat. Ann. § 2A:14-2" },
    noticeOfClaim: {
      days: 90,
      statute: "N.J. Stat. Ann. § 59:8-8",
      note: "Notice of claim must be filed within 90 days of accrual under the New Jersey Tort Claims Act. Failure to file is generally fatal to the claim.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "New Jersey has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  NM: {
    sol: { years: 3, stateStatute: "N.M. Stat. Ann. § 37-1-8" },
    noticeOfClaim: {
      days: 90,
      statute: "N.M. Stat. Ann. § 41-4-16",
      note: "Notice of claim must be filed within 90 days of the date of loss under the New Mexico Tort Claims Act.",
    },
    qualifiedImmunity: {
      status: "abolished",
      summary: "New Mexico abolished qualified immunity for state constitutional rights claims. Individuals may sue government employees directly for civil rights violations under state law without the qualified immunity barrier.",
      law: "New Mexico Civil Rights Act (HB 4, 2021)",
      statute: "N.M. Stat. Ann. § 41-4A-1 et seq.",
    },
  },
  NY: {
    sol: { years: 3, stateStatute: "N.Y. C.P.L.R. § 214(5)" },
    noticeOfClaim: {
      days: 90,
      statute: "N.Y. Gen. Mun. Law § 50-e",
      note: "Notice of claim must be served within 90 days of the event for suits against municipalities and their employees. This is strictly enforced.",
    },
    qualifiedImmunity: {
      status: "limited",
      summary: "New York City abolished qualified immunity for NYPD officers via Local Law 44 of 2021, allowing civil rights suits without the QI defense at the city level. Statewide QI reform has been debated but not fully enacted.",
      law: "Local Law 44 of 2021 (New York City)",
      statute: "N.Y.C. Admin. Code § 8-803",
    },
  },
  NC: {
    sol: { years: 3, stateStatute: "N.C. Gen. Stat. § 1-52(5)" },
    noticeOfClaim: {
      days: 365,
      statute: "N.C. Gen. Stat. § 143-299.1",
      note: "Claims against State agencies under the North Carolina Tort Claims Act must be filed within 3 years. Municipal tort claims follow general SOL with no separate shorter notice period.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "North Carolina has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  ND: {
    sol: { years: 6, stateStatute: "N.D. Cent. Code § 28-01-16(5)" },
    noticeOfClaim: {
      days: 180,
      statute: "N.D. Cent. Code § 32-12.1-04",
      note: "Notice of claim against the State must be filed within 180 days. Claims against political subdivisions are governed by § 32-12.2-04.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "North Dakota has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  OH: {
    sol: { years: 2, stateStatute: "Ohio Rev. Code Ann. § 2305.10" },
    noticeOfClaim: {
      days: null,
      statute: null,
      note: "No general pre-suit notice requirement. Political subdivision immunity is governed by Ohio Rev. Code Ann. § 2744, which sets conditions for suit rather than a notice-of-claim period.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Ohio has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  OK: {
    sol: { years: 2, stateStatute: "Okla. Stat. tit. 12, § 95(A)(3)" },
    noticeOfClaim: {
      days: 365,
      statute: "Okla. Stat. tit. 51, § 156",
      note: "Notice of claim must be filed within 1 year under the Oklahoma Governmental Tort Claims Act.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Oklahoma has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  OR: {
    sol: { years: 2, stateStatute: "Or. Rev. Stat. § 12.110(1)" },
    noticeOfClaim: {
      days: 180,
      statute: "Or. Rev. Stat. § 30.275",
      note: "Notice of claim must be filed within 180 days of the alleged loss under the Oregon Tort Claims Act. Failure is a complete bar.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Oregon has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  PA: {
    sol: { years: 2, stateStatute: "42 Pa. Cons. Stat. § 5524(2)" },
    noticeOfClaim: {
      days: 180,
      statute: "42 Pa. Cons. Stat. § 5522(a)",
      note: "Written notice of intent to bring suit must be filed within 6 months for claims against local agencies under the Pennsylvania Political Subdivision Tort Claims Act.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Pennsylvania has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  RI: {
    sol: { years: 3, stateStatute: "R.I. Gen. Laws § 9-1-14(b)" },
    noticeOfClaim: {
      days: null,
      statute: null,
      note: "No general pre-suit notice requirement for tort claims against municipalities in Rhode Island.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Rhode Island has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  SC: {
    sol: { years: 3, stateStatute: "S.C. Code Ann. § 15-3-530(5)" },
    noticeOfClaim: {
      days: null,
      statute: "S.C. Code Ann. § 15-78-110",
      note: "The South Carolina Tort Claims Act sets a 2-year limitations period for claims against government entities. No separate pre-suit notice period is required.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "South Carolina has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  SD: {
    sol: { years: 3, stateStatute: "S.D. Codified Laws § 15-2-14(3)" },
    noticeOfClaim: {
      days: 180,
      statute: "S.D. Codified Laws § 3-21-2",
      note: "Notice of claim against the State must be filed within 180 days. Claims against municipalities may require notice within 30 days under § 3-21-1.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "South Dakota has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  TN: {
    sol: { years: 1, stateStatute: "Tenn. Code Ann. § 28-3-104(a)(1)" },
    noticeOfClaim: {
      days: 365,
      statute: "Tenn. Code Ann. § 29-20-305",
      note: "Under the Tennessee Governmental Tort Liability Act, suits must be filed within 1 year. No separate shorter notice period; the SOL itself serves as the deadline.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Tennessee has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  TX: {
    sol: { years: 2, stateStatute: "Tex. Civ. Prac. & Rem. Code § 16.003" },
    noticeOfClaim: {
      days: 180,
      statute: "Tex. Civ. Prac. & Rem. Code § 101.101",
      note: "Notice of claim must be filed within 6 months of the incident under the Texas Tort Claims Act. Failure to provide timely notice bars the claim.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Texas has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  UT: {
    sol: { years: 4, stateStatute: "Utah Code Ann. § 78B-2-307(3)" },
    noticeOfClaim: {
      days: 365,
      statute: "Utah Code Ann. § 63G-7-401",
      note: "Notice of claim must be filed within 1 year under the Utah Governmental Immunity Act. Failure to file is jurisdictional.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Utah has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  VT: {
    sol: { years: 3, stateStatute: "Vt. Stat. Ann. tit. 12, § 512(4)" },
    noticeOfClaim: {
      days: null,
      statute: null,
      note: "No general pre-suit notice requirement for tort claims against municipalities in Vermont.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Vermont has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  VA: {
    sol: { years: 2, stateStatute: "Va. Code Ann. § 8.01-243(A)" },
    noticeOfClaim: {
      days: 365,
      statute: "Va. Code Ann. § 8.01-222",
      note: "Notice of claim must be filed within 1 year for tort claims against cities, towns, and counties in Virginia.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Virginia has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  WA: {
    sol: { years: 3, stateStatute: "Wash. Rev. Code § 4.16.080(2)" },
    noticeOfClaim: {
      days: 60,
      statute: "Wash. Rev. Code § 4.96.020",
      note: "Written notice of claim must be filed within 60 days for claims against political subdivisions. This is one of the shortest notice windows in the country.",
    },
    qualifiedImmunity: {
      status: "limited",
      summary: "Washington enacted a sweeping police accountability package in 2021 (SB 5066, HB 1054, HB 1310) establishing new use-of-force standards and duty-to-intervene requirements. The Washington Law Against Discrimination does not provide a QI defense for state civil rights claims.",
      law: "Washington Police Reform Package (2021)",
      statute: "Wash. Rev. Code § 43.101.450 et seq.",
    },
  },
  WV: {
    sol: { years: 2, stateStatute: "W. Va. Code § 55-2-12(b)" },
    noticeOfClaim: {
      days: null,
      statute: null,
      note: "No general pre-suit notice requirement under the West Virginia Governmental Tort Claims and Insurance Reform Act. Claims must be filed within the 2-year SOL.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "West Virginia has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  WI: {
    sol: {
      years: 6,
      stateStatute: "Wis. Stat. § 893.53",
      personalInjuryYears: 3,
      personalInjuryStatute: "Wis. Stat. § 893.54(1m)",
    },
    noticeOfClaim: {
      days: 120,
      statute: "Wis. Stat. § 893.80",
      note: "Notice of claim must be served within 120 days of the event for claims against governmental subdivisions and their employees. Note: § 1983 borrows Wisconsin's 6-year catch-all SOL, not the 3-year personal injury period.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Wisconsin has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
  WY: {
    sol: { years: 4, stateStatute: "Wyo. Stat. Ann. § 1-3-106" },
    noticeOfClaim: {
      days: 730,
      statute: "Wyo. Stat. Ann. § 1-39-113",
      note: "Notice of claim must be filed within 2 years under the Wyoming Governmental Claims Act, which mirrors the SOL.",
    },
    qualifiedImmunity: {
      status: "federal-doctrine",
      summary: "Wyoming has not modified the federal qualified immunity doctrine. Federal standards apply to § 1983 claims.",
    },
  },
}
