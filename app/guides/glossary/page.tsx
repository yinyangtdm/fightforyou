import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import Nav from "../../components/Nav"
import Footer from "../../components/Footer"
import Link from "next/link"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Legal Glossary | fightfor.you",
  description: "Plain-language definitions of legal terms used in civil rights cases — from qualified immunity to Section 1983.",
}

const TERMS: { term: string; definition: string }[] = [
  { term: "42 U.S.C. § 1983", definition: "The primary federal law used to sue state and local government officials for civil rights violations. It creates a right of action when someone acting \"under color of law\" deprives you of a constitutional right." },
  { term: "Affirmative defense", definition: "A legal defense that, if proven, defeats or limits the plaintiff's claim even if the underlying allegations are true. Qualified immunity is the most common affirmative defense in civil rights cases." },
  { term: "Appeal", definition: "A request to a higher court to review and reverse a lower court's decision. An appeal is not a new trial — it reviews whether legal errors were made." },
  { term: "Arraignment", definition: "The first court appearance in a criminal case, where the defendant is formally charged and enters a plea. Relevant to civil rights cases involving false arrest or malicious prosecution." },
  { term: "Attorney", definition: "A licensed legal professional authorized to represent clients in court and provide legal advice. Also called a lawyer." },
  { term: "Attorneys' fees", definition: "Under 42 U.S.C. § 1988, a plaintiff who wins a civil rights case can recover their attorney's fees from the defendant. This is critical to making civil rights cases economically viable for lawyers and clients alike." },
  { term: "Battery (civil)", definition: "Intentional harmful or offensive physical contact with another person without consent. When committed by police, it may support civil rights and state tort claims." },
  { term: "Brady violation", definition: "A prosecutor's failure to disclose evidence favorable to the defendant, as required by Brady v. Maryland (1963). Can be grounds for overturning a conviction and may support a civil rights claim." },
  { term: "Cause of action", definition: "The legal basis for a lawsuit — the specific right that was violated and the law that provides a remedy. In civil rights cases, the primary cause of action is typically a § 1983 claim." },
  { term: "Civil rights", definition: "Rights guaranteed by the U.S. Constitution and federal law that protect individuals from unlawful conduct by government actors — including police, prison officials, and other state employees." },
  { term: "Civil rights claim", definition: "A lawsuit alleging that a government actor violated your constitutional rights. Most civil rights claims are brought under 42 U.S.C. § 1983 in federal court." },
  { term: "Class action", definition: "A lawsuit filed by a group of people with similar claims against the same defendant. One or more plaintiffs represent the entire group." },
  { term: "Color of law", definition: "Acting with the authority or apparent authority of the government. A required element of any § 1983 claim — the defendant must have been acting under color of state law, not as a private individual." },
  { term: "Compensatory damages", definition: "Money awarded to compensate for actual harm — medical bills, lost wages, pain and suffering, and emotional distress." },
  { term: "Complaint", definition: "The initial document filed in court that sets out the plaintiff's legal claims and the facts supporting them. Filing a complaint formally starts a lawsuit." },
  { term: "Consent (to search)", definition: "Voluntarily agreeing to allow police to conduct a search. Consent is a complete defense to a Fourth Amendment search and seizure claim. Consent given under coercion or duress may be invalid." },
  { term: "Consent decree", definition: "A court-approved settlement between the government and a defendant — often a police department — that requires specific reforms and ongoing court oversight. The DOJ has used consent decrees to reform major police departments." },
  { term: "Contempt of court", definition: "Willful disobedience of a court order. Courts can impose fines or imprisonment. Relevant when a government entity refuses to comply with an injunction or consent decree." },
  { term: "Contingency fee", definition: "A payment arrangement where the attorney's fee is a percentage of the recovery. No fee is owed if the case is lost. Common in civil rights cases because clients often cannot pay hourly rates." },
  { term: "Continuance", definition: "A postponement of a court hearing or deadline. Either party can request one; courts may grant or deny based on the circumstances." },
  { term: "Counterclaim", definition: "A claim made by a defendant against the plaintiff in the same lawsuit. Police and municipalities sometimes file counterclaims in civil rights cases." },
  { term: "Damages", definition: "Money awarded by a court to a plaintiff. Includes compensatory damages (for actual harm) and punitive damages (to punish egregious conduct)." },
  { term: "Death in custody", definition: "The death of a person while detained by law enforcement or held in a jail, prison, or detention facility. May give rise to civil rights claims if caused by excessive force or deliberate indifference." },
  { term: "Declaratory relief", definition: "A court ruling that declares the legal rights of the parties without ordering anyone to pay money or take action. Often sought alongside injunctive relief." },
  { term: "Default judgment", definition: "A ruling in favor of one party when the opposing party fails to appear or respond in court. Rare in civil rights cases but can occur when defendants ignore lawsuits." },
  { term: "Defendant", definition: "The person or entity being sued. In civil rights cases, defendants are typically individual officers, supervisors, municipalities, or government agencies." },
  { term: "Deliberate indifference", definition: "A legal standard requiring proof that a government official consciously disregarded a substantial risk of serious harm. Required to establish certain civil rights claims, such as those involving prison medical care." },
  { term: "Deposition", definition: "An out-of-court sworn statement taken during discovery. Attorneys question witnesses and the testimony is recorded and can be used at trial. A key tool in civil rights cases involving police officers." },
  { term: "Discovery", definition: "The pre-trial process where parties exchange evidence, documents, and information. Includes depositions, interrogatories, and document requests." },
  { term: "Due process (procedural)", definition: "The constitutional requirement that the government follow fair procedures before depriving a person of life, liberty, or property. Protected by the Fifth and Fourteenth Amendments." },
  { term: "Due process (substantive)", definition: "The constitutional principle that certain fundamental rights cannot be taken away by the government regardless of what procedure is used. Governs claims of conscience-shocking government conduct." },
  { term: "Eighth Amendment", definition: "The constitutional amendment prohibiting cruel and unusual punishment. Governs conditions of confinement, use of force against convicted prisoners, and denial of medical care." },
  { term: "Equal protection", definition: "The constitutional guarantee that the government must treat similarly situated people equally. The basis for claims of racial profiling, discriminatory policing, and selective enforcement." },
  { term: "Excessive force", definition: "The use of more physical force than is objectively reasonable under the circumstances. Claims against police are evaluated under the Fourth Amendment's reasonableness standard." },
  { term: "Exhaustion of remedies", definition: "A requirement to pursue all available administrative or internal remedies before filing a lawsuit. Prisoners must typically exhaust prison grievance procedures before suing under federal law (PLRA)." },
  { term: "Failure to intervene", definition: "A civil rights claim against an officer who witnessed another officer use excessive force and did nothing to stop it. Officers have an affirmative duty to intervene when they see a constitutional violation occurring." },
  { term: "Failure to train", definition: "A theory of municipal liability under Monell holding that a city's inadequate training of officers amounts to deliberate indifference and caused the constitutional violation." },
  { term: "False arrest", definition: "Detaining or arresting a person without legal justification or probable cause. A common civil rights claim under the Fourth Amendment." },
  { term: "Filing deadline", definition: "The date by which a lawsuit must be filed. Missing it permanently bars the claim, regardless of how strong the facts are. Determined by the applicable statute of limitations." },
  { term: "First Amendment", definition: "The constitutional amendment protecting freedom of speech, religion, assembly, and the right to petition the government. Relevant to retaliation claims when police arrest or harass people for filming officers or protesting." },
  { term: "Fourteenth Amendment", definition: "The constitutional amendment that applies constitutional protections to state governments and guarantees due process and equal protection. Most civil rights claims against state and local officials rely on it." },
  { term: "Fourth Amendment", definition: "The constitutional amendment protecting against unreasonable searches and seizures. It governs police stops, arrests, searches of homes and vehicles, and use of force." },
  { term: "Fruit of the poisonous tree", definition: "Evidence obtained as a result of an unlawful search or seizure that must be excluded at trial. A criminal law doctrine relevant when challenging the legality of an arrest or prosecution." },
  { term: "Grand jury", definition: "A group of citizens who review evidence in secret to determine whether criminal charges should be filed. Grand juries decide whether to indict officers in police misconduct cases, and their decisions are often controversial." },
  { term: "Habeas corpus", definition: "A court order requiring the government to justify why a person is being detained. A fundamental tool to challenge unlawful imprisonment, especially in wrongful conviction cases." },
  { term: "Immunity (absolute)", definition: "Complete protection from civil liability afforded to certain officials — such as judges and prosecutors acting in their official roles — regardless of the conduct. Unlike qualified immunity, absolute immunity has no exceptions." },
  { term: "In forma pauperis", definition: "A legal status allowing a person who cannot afford court filing fees to proceed without paying them. From Latin, meaning \"in the form of a pauper.\" Commonly used by incarcerated plaintiffs." },
  { term: "Indemnification", definition: "When an employer agrees to pay any judgment or settlement on behalf of an employee. Most police officers are indemnified by their department or city, meaning taxpayers often pay civil rights judgments rather than officers personally." },
  { term: "Injunctive relief", definition: "A court order requiring a party to do something or stop doing something. In civil rights cases, often sought to halt ongoing unconstitutional policies or practices." },
  { term: "Interrogatories", definition: "Written questions sent to the opposing party during discovery that must be answered under oath. Used to gather facts, identify witnesses, and learn what evidence the other side has." },
  { term: "Judgment", definition: "A court's final decision on the claims in a lawsuit. May award damages, declaratory relief, injunctive relief, or a combination." },
  { term: "Jurisdiction", definition: "A court's authority to hear a particular case. Federal courts have jurisdiction over civil rights claims under § 1983. State courts may also hear some civil rights claims." },
  { term: "Jury trial", definition: "A trial in which a jury of citizens decides the facts and renders a verdict. Civil rights plaintiffs have a right to a jury trial in federal court under the Seventh Amendment." },
  { term: "Laches", definition: "An equitable defense arguing that the plaintiff unreasonably delayed bringing a claim, causing prejudice to the defendant. Distinct from a statute of limitations — courts apply it on a case-by-case basis." },
  { term: "Law firm", definition: "A business entity formed by one or more attorneys to practice law. Law firms may handle individual civil rights cases or focus on institutional reform litigation." },
  { term: "Malicious prosecution", definition: "Initiating a criminal or civil case without probable cause and with malice, which is later resolved in the target's favor. A cognizable civil rights claim under the Fourth and Fourteenth Amendments." },
  { term: "Miranda rights", definition: "Rights that must be read to a person before a custodial interrogation — including the right to remain silent and the right to an attorney. Named after Miranda v. Arizona (1966). Failure to Mirandize may affect the admissibility of statements." },
  { term: "Monell claim", definition: "A civil rights claim against a local government entity based on an unconstitutional policy, custom, or practice. Named after Monell v. Dept. of Social Services (1978). Required to hold a city or county liable under § 1983." },
  { term: "Motion", definition: "A formal request asking a court to take a specific action — such as dismissing a case, excluding evidence, or compelling discovery. Civil rights cases involve many motions before trial." },
  { term: "Motion to dismiss", definition: "A request by the defendant to end the case before trial, arguing that even if the plaintiff's allegations are true, there is no valid legal claim. Qualified immunity is often raised at this stage." },
  { term: "Municipal liability", definition: "The legal responsibility of a city, county, or other local government for civil rights violations caused by its policies, customs, or practices. Established through a Monell claim." },
  { term: "No-knock warrant", definition: "A search warrant that authorizes police to enter a premises without first knocking and announcing their presence. Associated with high-profile deaths and Fourth Amendment challenges." },
  { term: "Nominal damages", definition: "A small, symbolic sum — often $1 — awarded when a constitutional right was violated but no actual monetary harm is proven. Still legally significant because it confirms the violation occurred." },
  { term: "Nonprofit", definition: "A non-profit legal organization that provides civil rights representation, often at reduced or no cost to clients who cannot otherwise afford an attorney." },
  { term: "Notice of claim", definition: "A formal document that must be filed with a government entity before you can sue it. Deadlines are typically very short — often 90 days from the incident. Failure to file may permanently bar your lawsuit." },
  { term: "Pattern or practice", definition: "A recurring course of conduct by a police department or government entity that violates constitutional rights. The Department of Justice can investigate and sue under 42 U.S.C. § 14141 to force systemic reforms." },
  { term: "Perjury", definition: "The crime of lying under oath. Evidence of perjury by police officers can support civil rights claims and form the basis for overturning a criminal conviction." },
  { term: "Plaintiff", definition: "The person or party who brings a lawsuit. In civil rights cases, the plaintiff is typically the person whose rights were violated." },
  { term: "Police misconduct", definition: "Improper or illegal conduct by a law enforcement officer, including excessive force, false arrest, malicious prosecution, fabrication of evidence, and racial profiling." },
  { term: "Preliminary injunction", definition: "A court order issued before trial to prevent ongoing harm or maintain the status quo while the case is pending. Requires showing likelihood of success on the merits and irreparable harm." },
  { term: "Prison Litigation Reform Act (PLRA)", definition: "A federal law imposing procedural requirements on incarcerated people filing civil rights lawsuits, including mandatory exhaustion of all administrative remedies before going to court." },
  { term: "Pro bono", definition: "Legal work done for free or at significantly reduced cost. Many civil rights attorneys take cases on contingency (a percentage of any recovery) rather than charging by the hour." },
  { term: "Pro se", definition: "Representing yourself in court without an attorney. From Latin, meaning \"for oneself.\" Courts give pro se litigants some procedural leniency but it is difficult to litigate a civil rights case without counsel." },
  { term: "Probable cause", definition: "A legal standard requiring a reasonable basis to believe a crime has been or is being committed. Required before police can make a lawful arrest or obtain a search warrant." },
  { term: "Prosecutorial misconduct", definition: "Improper or illegal actions by a prosecutor — such as withholding evidence, suborning perjury, or making improper arguments — that violate a defendant's constitutional rights." },
  { term: "Punitive damages", definition: "Money awarded to punish a defendant for particularly egregious or malicious conduct. Available in some civil rights cases against individual officers, but not against municipalities." },
  { term: "Qualified immunity", definition: "A legal doctrine that shields government officials from civil liability unless they violated a \"clearly established\" constitutional right. Widely criticized as a barrier to civil rights accountability." },
  { term: "Racial profiling", definition: "The use of race, ethnicity, or national origin as the basis for suspecting someone of criminal activity. A violation of the Equal Protection Clause and the subject of ongoing legislative reform." },
  { term: "Reasonable suspicion", definition: "A legal standard lower than probable cause that allows police to briefly stop and question a person based on specific, articulable facts suggesting criminal activity. The basis for a Terry stop." },
  { term: "Retaliation", definition: "Taking adverse action against someone for exercising a constitutional right — such as filing a complaint, speaking to the press, or recording police. A cognizable First Amendment civil rights claim." },
  { term: "Search and seizure", definition: "The legal framework under the Fourth Amendment governing when and how police can search persons, homes, and vehicles, and seize evidence or property." },
  { term: "Section 1983", definition: "Shorthand for 42 U.S.C. § 1983 — the federal statute that allows people to sue state and local government officials for civil rights violations." },
  { term: "Section 1985", definition: "A federal law prohibiting conspiracies to deprive people of their civil rights. Applies when multiple actors coordinate to violate rights, such as in a cover-up of police misconduct." },
  { term: "Section 1988", definition: "A federal law allowing a prevailing plaintiff in a civil rights case to recover attorney's fees from the defendant. Critical to making civil rights litigation economically viable for both clients and attorneys." },
  { term: "Settlement", definition: "An agreement between parties to resolve a lawsuit without trial. Most civil rights cases settle. Settlements may include monetary compensation and, in some cases, policy changes." },
  { term: "Sovereign immunity", definition: "A doctrine protecting the government from being sued without its consent. States have broad immunity; local governments (cities and counties) have more limited immunity and can be sued under Monell." },
  { term: "Standing", definition: "The legal requirement that a plaintiff have suffered a real, concrete injury in order to bring a lawsuit. You must have personally been harmed to have standing to sue." },
  { term: "Statute of limitations", definition: "The time limit within which a lawsuit must be filed after the harm occurred. For § 1983 claims, courts apply the state's personal injury statute of limitations, which varies by state." },
  { term: "Stop and frisk", definition: "A brief police detention and pat-down search based on reasonable suspicion. Governed by Terry v. Ohio. Large-scale stop-and-frisk programs have been successfully challenged as unconstitutional." },
  { term: "Subpoena", definition: "A court order requiring a person to testify or produce documents. Failure to comply can result in contempt of court. Used in civil rights cases to obtain police records, body camera footage, and other evidence." },
  { term: "Summary judgment", definition: "A court ruling that resolves a case without a full trial when there are no disputed facts and one party is entitled to win as a matter of law. A major hurdle in civil rights cases, often used to enforce qualified immunity." },
  { term: "Terry stop", definition: "A brief investigatory detention by police based on reasonable suspicion. Named after Terry v. Ohio (1968). Police may pat down outer clothing for weapons during a Terry stop." },
  { term: "Testimony", definition: "Sworn statements given by a witness in a deposition, hearing, or trial. Lying in testimony is perjury." },
  { term: "Tort", definition: "A civil wrong that causes harm to another person and gives rise to a legal claim. Civil rights violations are a form of constitutional tort, giving plaintiffs the right to sue for damages." },
  { term: "Use of force", definition: "The degree of force applied by law enforcement. Evaluated under the Fourth Amendment's objective reasonableness standard. Police departments typically have use-of-force policies covering a spectrum from verbal commands to lethal force." },
  { term: "Venue", definition: "The geographic location where a lawsuit is filed. Civil rights cases are typically filed in the federal district court where the events occurred." },
  { term: "Warrant", definition: "A court order authorizing police to conduct a search or make an arrest. Warrants require a showing of probable cause and must describe the place to be searched or the person to be arrested." },
  { term: "Whistleblower", definition: "A person who reports misconduct by a government entity or employer. May have First Amendment and statutory protections against retaliation, including civil rights claims if punished for speaking out." },
  { term: "Witness", definition: "A person with relevant knowledge who provides testimony in a deposition or at trial. Witness testimony is often central to civil rights cases involving disputed accounts of police conduct." },
  { term: "Wrongful conviction", definition: "A conviction of a person who is actually innocent, or whose conviction was obtained through misconduct, suppression of evidence, false testimony, or other violations of constitutional rights." },
  { term: "Wrongful death", definition: "A civil claim brought by the surviving family members or estate of a person who was killed due to another's wrongful conduct. In civil rights cases, wrongful death claims arise when someone dies as a result of excessive force, deliberate indifference, or other constitutional violations." },
  { term: "Wrongful imprisonment", definition: "Civil claims brought by people who were unlawfully or unjustly incarcerated — whether due to false arrest, malicious prosecution, wrongful conviction, or systemic failure. Wrongful imprisonment attorneys fight for their clients' freedom and pursue compensation for the devastating personal, economic, and social harm of being imprisoned without just cause." },
  { term: "ADA Litigation", definition: "Legal cases brought under the Americans with Disabilities Act against government agencies or law enforcement that failed to accommodate a person's disability. If a government entity denied equal access or caused harm by ignoring its ADA obligations, an ADA litigation attorney can pursue a civil rights claim on your behalf." },
  { term: "Activist rights", definition: "Legal representation for people targeted by police or government officials because of their political beliefs, protest activity, or exercise of First Amendment rights. Activist rights attorneys handle arrests, surveillance, and civil rights violations arising from demonstrations, organizing, and other protected speech or assembly." },
  { term: "Appellate law", definition: "A legal practice focused on appealing court decisions to higher courts. An appellate attorney reviews lower court rulings for legal errors and argues for reversal or modification. Relevant in civil rights cases when a trial court dismisses a claim or grants qualified immunity." },
  { term: "Bivens action", definition: "A civil rights lawsuit against a federal government employee — such as an FBI agent, DEA officer, Border Patrol agent, or U.S. Marshal — for constitutional violations. Named after Bivens v. Six Unknown Named Agents (1971), these claims allow individuals to sue federal officers personally when no federal statute creates a direct remedy." },
  { term: "Catastrophic injury", definition: "A practice area covering cases where someone suffered life-altering physical harm — such as paralysis, traumatic brain injury, or permanent disability — as a result of police or government misconduct. These cases seek compensation for long-term medical costs and the permanent impact on quality of life." },
  { term: "Constitutional law", definition: "Legal practice focused on cases where government officials violated rights guaranteed by the U.S. Constitution — including free speech, protection from unreasonable searches, and equal protection. Constitutional law attorneys argue that government conduct was not merely harmful but unconstitutional." },
  { term: "Criminal defense", definition: "Legal representation for people charged with crimes, particularly where charges arise from police misconduct, false arrests, or government overreach. Criminal defense attorneys challenge the government's evidence and protect defendants' constitutional rights at every stage of prosecution." },
  { term: "Custodial abuse", definition: "Legal representation for people who were physically, sexually, or psychologically abused while in government custody — including jails, prisons, and immigration detention centers. Custodial abuse claims target both individual officers and the institutions responsible for oversight and supervision." },
  { term: "Discrimination (law enforcement)", definition: "Legal claims based on unequal treatment by law enforcement or government officials because of a person's race, sex, religion, national origin, disability, or other protected characteristic. These attorneys handle racial profiling, selective enforcement, and violations of the Equal Protection Clause and federal anti-discrimination statutes." },
  { term: "Failure to protect", definition: "A civil rights claim against a law enforcement officer or government official who had a duty to protect someone and deliberately failed to act. Courts recognize an affirmative duty to protect people in government custody — when officials stand by while someone in their care is seriously harmed, they may be held liable." },
  { term: "Government misconduct", definition: "Legal claims against government officials who abused their authority, engaged in corruption, covered up wrongdoing, or took illegal actions while in office. Government misconduct attorneys pursue accountability for public officials who misuse the power entrusted to them, including cases that attract DOJ oversight." },
  { term: "Medical neglect (incarceration)", definition: "Civil rights claims arising from the denial of adequate medical or mental health care to people in jail, prison, or other government facilities, resulting in serious injury or death. Under the Eighth Amendment, deliberate indifference to a serious medical need is unconstitutional — these attorneys hold facilities accountable when they knowingly ignore a person's health needs." },
  { term: "Personal injury (police/government)", definition: "Civil cases seeking compensation for physical harm caused by a law enforcement officer's negligence or intentional misconduct — including injuries from government vehicles, dangerous conditions created by government entities, or officer actions that caused bodily harm outside the context of a formal arrest." },
  { term: "Police brutality", definition: "A category of excessive force cases involving particularly severe or egregious physical violence by law enforcement — including beatings, chokeholds, shootings, Taser deployments, K-9 attacks, and dangerous restraint techniques. Police brutality attorneys pursue both individual officer liability and Monell claims against the department." },
  { term: "Police negligence", definition: "Civil cases arising from careless or reckless officer conduct that caused harm without necessarily being intentional — including negligent vehicle operation during patrols or pursuits. Police negligence attorneys establish liability when officers failed to follow proper procedure and someone was injured or killed as a result." },
  { term: "Pretrial justice", definition: "Legal representation for people subjected to unconstitutional detention before trial — including those held because they cannot afford bail, denied timely hearings, or subjected to due process violations before conviction. Being jailed before trial can cost people their jobs, housing, and family stability." },
  { term: "Prison reform", definition: "Litigation challenging unconstitutional conditions, abusive practices, and the systemic denial of rights in jails and state or federal prisons. Cases cover cruel and unusual punishment, overcrowding, denial of medical care, and access to courts. Prison reform cases often result in court-ordered reforms and consent decrees." },
  { term: "Sexual harassment (government)", definition: "Civil rights and tort claims against government officials — including law enforcement officers — who used their position of authority to engage in sexual coercion, harassment, or assault. These attorneys pursue civil liability and accountability for government employees who exploit the power of their office." },
  { term: "Systemic reform", definition: "Litigation aimed at changing the policies, training, and institutional culture of entire government agencies — rather than pursuing compensation for individual victims alone. Systemic reform cases may result in court orders, federal oversight, and lasting policy changes affecting entire communities for years to come." },
]

async function getNavData() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  const [specialtyRows, guideRows] = await Promise.all([
    prisma.$queryRaw<{ specialty: string }[]>`
      SELECT DISTINCT UNNEST(specialties) AS specialty FROM "Listing" ORDER BY specialty
    `,
    prisma.guide.findMany({
      where: { published: true },
      select: { title: true, slug: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ])
  await prisma.$disconnect()
  return {
    specialties: specialtyRows.map((r) => r.specialty),
    guides: guideRows,
  }
}

const PAGES = [
  { keys: ["#", "A", "B", "C"] },
  { keys: ["D", "E", "F", "G", "H"] },
  { keys: ["I", "J", "K", "L", "M", "N"] },
  { keys: ["O", "P", "Q", "R"] },
  { keys: ["S", "T", "U", "V", "W", "X", "Y", "Z"] },
]

export default async function GlossaryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { specialties, guides } = await getNavData()
  const { page: pageParam } = await searchParams
  const currentPage = Math.min(Math.max(parseInt(pageParam ?? "1") || 1, 1), PAGES.length)
  const pageKeys = PAGES[currentPage - 1].keys

  const grouped = TERMS.reduce<Record<string, typeof TERMS>>((acc, t) => {
    const first = t.term[0].toUpperCase()
    const letter = /[A-Z]/.test(first) ? first : "#"
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(t)
    return acc
  }, {})

  const pageLetters = pageKeys.filter((k) => grouped[k])

  const pagination = (
    <nav className="glossary-pagination" aria-label="Glossary pages">
      {PAGES.map((p, i) => {
        const pageNum = i + 1
        const activeKeys = p.keys.filter((k) => grouped[k])
        const label = activeKeys.length
          ? `${activeKeys[0]}–${activeKeys[activeKeys.length - 1]}`
          : p.keys[0]
        return (
          <a
            key={pageNum}
            href={`/guides/glossary?page=${pageNum}#top`}
            className={`glossary-page-btn${currentPage === pageNum ? " glossary-page-btn--active" : ""}`}
          >
            {label}
          </a>
        )
      })}
    </nav>
  )

  return (
    <div className="public">
      <Nav specialties={specialties} guides={guides} />

      <div className="guide-page" id="top">
        <div className="guide-back-container">
          <Link href="/guides" className="guide-back">← All Guides</Link>
        </div>
        <div className="guide-page-inner">
          <div className="guide-article">
            <h1 className="guide-title" style={{ paddingTop: 25 }}>Legal Glossary</h1>
            <p className="guide-lead">
              Plain-language definitions of legal terms that come up in civil rights cases. If you&apos;re reading about a case, talking to an attorney, or trying to understand your rights, start here.
            </p>

            {pagination}

            <div className="guide-body glossary-body">
              {pageLetters.map((letter) => (
                <div key={letter} className="glossary-section" id={`letter-${letter}`}>
                  <h2 className="glossary-letter">{letter}</h2>
                  <dl className="glossary-list">
                    {grouped[letter].map((t) => (
                      <div key={t.term} className="glossary-entry" id={`term-${t.term.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                        <dt className="glossary-term">{t.term}</dt>
                        <dd className="glossary-def">{t.definition}</dd>
                      </div>
                    ))}
                  </dl>
                  <a href="#top" className="glossary-top-link">↑ Back to top</a>
                </div>
              ))}
            </div>

            {pagination}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
