"use strict";

const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL_PROD }),
});

const updates = [
  {
    id: 93,
    name: "Al Gerhardstein",
    description: `Al Gerhardstein is one of Ohio's most prominent civil rights attorneys, with over four decades of experience litigating cases against law enforcement agencies, correctional institutions, and government entities. Based in Cincinnati, he has built a national reputation for holding police departments and public officials accountable for unconstitutional conduct, excessive force, and systemic civil rights violations. His work has shaped civil rights law not only in Ohio but across the country through landmark federal court decisions.

Gerhardstein & Branch Co. LPA has been at the forefront of some of the most significant civil rights battles in the greater Cincinnati region, including cases arising from the Cincinnati police shootings of Black men in the late 1990s and early 2000s that sparked widespread civil unrest. He served as lead counsel in the groundbreaking 2002 class-action lawsuit against the City of Cincinnati, resulting in a $4.5 million settlement and the creation of the Cincinnati Collaborative Agreement — a nationally cited model for police reform. In 2016, he led the legal effort on behalf of the Estate of Sam DuBose against University of Cincinnati officer Ray Tensing, securing a $4.85 million settlement that included an apology, a university tuition and fee waiver for 12 of DuBose's children, a campus memorial, and a commitment to ongoing police reform.

Beyond police misconduct, Gerhardstein has litigated extensively on behalf of prisoners subjected to inhumane conditions, individuals with disabilities, and LGBTQ individuals in landmark marriage equality cases. His record includes a $3.75 million settlement in Culberson v. Doan — which produced sweeping regional reforms for the protection of battered women — and an $8 million class-action recovery in Chesher v. Neyer against the Hamilton County Coroner's office. He has represented clients in the Sixth Circuit Court of Appeals and has argued cases that have produced enduring precedents in civil rights law.

Recognized by peers and civil rights organizations alike, Gerhardstein has received numerous honors for his decades of advocacy. He is a fellow of the American College of Trial Lawyers and has been consistently listed among Ohio's top attorneys. His firm continues to accept cases involving police brutality, wrongful death, false arrest, and other civil rights violations throughout Ohio and the Sixth Circuit.`,
  },
  {
    id: 14,
    name: "Gonzalo Fernandez",
    description: `Gonzalo Fernandez is a civil rights attorney and founder of Fernandez Law, LLC, dedicated to representing individuals whose constitutional rights have been violated by law enforcement and government actors. His work centers on holding police departments and municipalities accountable for misconduct, excessive force, and unlawful conduct carried out under color of law, with a particular focus on advocating for communities disproportionately impacted by police abuse and governmental overreach.

Throughout his career, Fernandez has represented clients in cases involving excessive force, false arrest, unlawful detention, and civil rights violations brought under 42 U.S.C. § 1983. His litigation approach combines thorough factual investigation with aggressive courtroom advocacy, seeking both compensatory and punitive damages against officers and the agencies that employ them.

Fernandez Law, LLC secured a landmark $150,000 settlement against St. Louis County in a First Amendment case involving a homeless man targeted by a local panhandling ordinance — with a federal ruling striking down the ordinance as an unconstitutional restriction on free speech. The firm also secured a $260,000 settlement from Lincoln County on behalf of the family of a jail inmate who died by suicide while in custody, highlighting systemic negligence in the county's detention facilities. Fernandez works on a contingency fee basis to ensure that financial barriers do not prevent victims from seeking justice.`,
  },
  {
    id: 30,
    name: "Bhavani Raveendran",
    description: `Bhavani Raveendran is a Chicago-based civil rights attorney and founder of Raveendran Law, LLC, dedicated to holding law enforcement agencies, municipalities, and correctional institutions accountable for misconduct, excessive force, wrongful death, and constitutional violations. Her practice is grounded in a commitment to vindicating the rights of individuals who have suffered harm at the hands of those in positions of public trust.

Raveendran has played a pivotal role in some of the most consequential police misconduct cases in recent history. She served as counsel in Jean v. Guyger, the wrongful death shooting of 26-year-old Botham Jean in his own home, which resulted in a $98,650,000 verdict. She also served as co-counsel in the $27,000,000 settlement arising from the murder of George Floyd, and as co-trial counsel in a $21,300,000 verdict against the City of Chicago stemming from a 2019 police chase.

Beyond her headline cases, Raveendran has delivered multi-million-dollar results across a wide range of matters including positional asphyxia deaths, jail suicides, failures to provide medical aid, and shootings involving individuals experiencing mental health crises. Her work spans Illinois, Texas, North Carolina, Indiana, and Oklahoma. In one jail suicide case, she negotiated a $2,000,000 settlement alongside agreed changes to jail and medical processes. Her firm has also successfully defeated qualified immunity at both the district court and Seventh Circuit levels, demonstrating a sophisticated command of federal civil rights law and appellate strategy.`,
  },
  {
    id: 65,
    name: "Sean L. Walton",
    description: `Sean Walton is a prominent civil rights and personal injury attorney based in Columbus, Ohio, and a founding partner of Walton + Brown, LLP. Since 2018, he has been consistently recognized as a Rising Star in Ohio by Super Lawyers — an honor reserved for only 2.5% of attorneys statewide — and Columbus Business First named him one of the ten "People to Know in the Law." He has dedicated his legal career to representing individuals whose constitutional rights have been violated by law enforcement and government entities, with a particular emphasis on cases involving excessive force, wrongful arrest, and police misconduct.

Walton has litigated cases against municipal police departments, county sheriff offices, and state agencies throughout Ohio, holding law enforcement accountable for unconstitutional conduct. His work has earned national recognition, with his insights featured in The Washington Post, NBC Nightly News, and CNN. He earned his B.A. from the University of Cincinnati as a Coca-Cola Darwin T. Turner Scholar and his J.D. from Capital University Law School as a Presidential Merit Scholar, where he was later honored as the 2020 Graduate of the Last Decade and continues to teach civil rights law as an adjunct professor.

Sean's community and professional leadership is extensive. He received the 2023 Poindexter Award from Columbus City Council and the 2021 Barrister's Salute from the John Mercer Langston Bar Association. He serves on the Board of Trustees for the Ohio Association for Justice — where he founded the civil rights section — and represents Ohio on the Board of Trustees of the American Association for Justice. He also serves on the Axon Ethics & Equity Advisory Council, advising the company from a racial equity and ethics perspective.

Beyond individual case representation, Walton has worked alongside community organizations and activists to push for broader police reform and accountability measures, reflecting a deep commitment to ensuring that marginalized communities have access to skilled legal representation when confronting governmental misconduct.`,
  },
  {
    id: 45,
    name: "Stritmatter Kessler Koehler Moore",
    description: `Stritmatter Kessler Koehler Moore is a prominent plaintiffs' civil rights and personal injury law firm based in Hoquiam, Washington, with decades of experience holding government entities and law enforcement agencies accountable for misconduct and abuse of power. The firm has built a distinguished reputation across the Pacific Northwest for its tenacious advocacy on behalf of individuals whose constitutional rights have been violated by police officers, correctional officers, and other government officials.

The firm's civil rights practice encompasses a broad range of cases involving excessive force, unlawful detention, false arrest, malicious prosecution, and wrongful death at the hands of law enforcement. Attorneys at the firm have litigated landmark civil rights matters in both state and federal courts, earning significant verdicts and settlements that have compelled reforms within law enforcement agencies throughout Washington State. Their work reflects a deep commitment to systemic accountability alongside individual client representation.

Stritmatter Kessler Koehler Moore has been recognized among the most respected plaintiffs' firms in Washington, with attorneys holding memberships in prestigious legal organizations including the Washington State Association for Justice and the American Association for Justice. The firm combines extensive trial experience with sophisticated legal strategy to pursue justice for victims of police brutality, wrongful incarceration, and government overreach, making it a go-to resource for individuals who have suffered serious civil rights violations in the region.`,
  },
  {
    id: 139,
    name: "Northern Justice Project",
    description: `The Northern Justice Project (NJP) is Alaska's premier private civil rights law firm, known for its aggressive and uncompromising litigation against government overreach. Since its inception, NJP has served as a critical check on state and local law enforcement, specializing in cases that other firms often find too politically sensitive or complex. Their history is defined by a commitment to the marginalized, ensuring that constitutional protections apply equally in Alaska's most urban centers and its most remote villages.

NJP's legal team is composed of seasoned litigators who treat civil rights violations as systemic failures rather than isolated incidents. They are particularly effective at navigating Section 1983 claims in federal court, where they have successfully challenged the "qualified immunity" often used to shield police officers from liability. By focusing on issues such as the use of excessive force, illegal searches, and racial profiling, NJP has become the primary legal adversary for departments that ignore established constitutional boundaries.

What distinguishes NJP is their "fearless advocate" philosophy. They have a documented history of taking on the Alaska State Troopers and the Anchorage Police Department in high-stakes jury trials. Their work does not merely seek financial compensation; it seeks to drive structural reform by exposing patterns of misconduct and forcing municipalities to recognize the high cost of violating civil liberties. This relentless pursuit of justice has made them the leading voice for police accountability in Alaska.`,
  },
  {
    id: 145,
    name: "Neufeld Scheck Brustin Hoffmann & Freudenberger, LLP",
    description: `Neufeld Scheck Brustin Hoffmann & Freudenberger, LLP (NSBHF) is widely regarded as the preeminent civil rights firm in the United States for exonerations and systemic police accountability. Founded by the pioneers of the Innocence Project, the firm specializes in dismantling cases where government misconduct has led to catastrophic injustice.

NSBHF operates on a high-resource, low-volume model, investing heavily in forensic experts, private investigators, and data analysts to prove that convictions resulted from suppressed evidence, coerced confessions, and fabricated police reports. Their advocacy extends beyond the courtroom, with partners frequently consulted on legislative reform and credited with exposing systemic pattern and practice failures within major police departments.

NSBHF is arguably the most prestigious wrongful conviction firm in the United States. Founded by the creators of the Innocence Project — Peter Neufeld and Barry Scheck — the firm essentially invented the legal framework used to sue the government for decades of wrongful imprisonment. They do not take a high volume of cases; instead, they embed deep into a few "unwinnable" cases, often using DNA evidence and forensic science to prove innocence and then dismantling the police department's official story in civil court.

The firm is famous for uncovering systemic corruption within crime labs and police internal affairs units. Their work has forced cities to adopt mandatory videotaped interrogations and independent audits of forensic departments. They are the only firm with a dedicated social worker on staff to help exonerees transition back to society, reflecting their human-first approach to civil rights.`,
  },
];

async function main() {
  console.log(`Updating ${updates.length} listings...\n`);

  for (const u of updates) {
    await prisma.listing.update({
      where: { id: u.id },
      data: { description: u.description },
    });
    console.log(`✓ Updated: ${u.name} (ID ${u.id})`);
  }

  console.log("\nDone.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
