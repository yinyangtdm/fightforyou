import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import Nav from "../../components/Nav"
import Footer from "../../components/Footer"
import Breadcrumb from "../../components/Breadcrumb"
import Link from "next/link"
import type { Metadata } from "next"
import QIStatePicker from "./StatePicker"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Qualified Immunity Laws | fightfor.you",
  description: "How qualified immunity works, which states have reformed or abolished it, and what it means for your civil rights case.",
}

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

export default async function QualifiedImmunityPage() {
  const { specialties, guides } = await getNavData()

  return (
    <div className="public">
      <Nav specialties={specialties} guides={guides} />

      <div className="breadcrumb-container">
        <Breadcrumb items={[{ label: "← All guides", href: "/guides" }]} />
      </div>

      <div className="guide-page">
        <div className="guide-page-inner">
          <div className="guide-article">
            <h1 className="guide-title">Qualified Immunity Laws</h1>
            <div className="guide-meta">
              <Link href="/guides/author/fight-for-you" className="guide-author-link">By fightfor.you</Link>
              <span className="guide-meta-sep">·</span>
              <span>May 9, 2026</span>
              <span className="guide-meta-categories">
                <Link href="/guides/category/legal-reference" className="guide-category-link">Legal Reference</Link>
              </span>
            </div>
            <p className="guide-lead">
              Qualified immunity is one of the most significant legal obstacles in civil rights cases. Understanding
              how it works — and how your state has responded to it — is essential before pursuing a claim against
              a government official.
            </p>

            <QIStatePicker />

            <div className="guide-body">
              <h2 className="guide-body-h2">What Is Qualified Immunity?</h2>
              <p>
                Qualified immunity is a judicially created legal doctrine that protects government officials &mdash; most commonly police officers &mdash; from personal civil liability for constitutional violations unless the violated right was &ldquo;clearly established&rdquo; at the time of the conduct.
              </p>
              <p>
                The doctrine was not created by Congress. It was invented by the <strong>U.S. Supreme Court</strong> through a series of decisions beginning in the 1960s and significantly expanded in 1982. Critics argue the Court invented it out of thin air, without a basis in the text of the law it was supposed to interpret.
              </p>
              <p>
                In plain terms: even if a police officer violates your constitutional rights, they can avoid being personally sued if no prior court has ruled that the <em>exact same conduct</em>, in nearly identical circumstances, was unconstitutional. This &ldquo;find a case on all fours&rdquo; requirement has resulted in perverse outcomes &mdash; officers escaping liability not because they acted reasonably, but because no prior case had the same unusual facts.
              </p>

              <h2 className="guide-body-h2">How Qualified Immunity Works in Practice</h2>
              <p>
                Under current law, when a plaintiff sues a police officer and the officer claims qualified immunity, the court must ask two questions:
              </p>
              <ol>
                <li>Did the officer&apos;s conduct violate a constitutional right?</li>
                <li>Was that right &ldquo;clearly established&rdquo; at the time of the violation?</li>
              </ol>
              <p>
                If the answer to either question is &ldquo;no,&rdquo; the case is dismissed.
              </p>
              <p>
                The &ldquo;clearly established&rdquo; prong is where most cases die. Courts interpret this standard extremely narrowly, requiring near-identical precedent. Officers have received immunity for:
              </p>
              <ul>
                <li>Shooting a fleeing, non-threatening suspect</li>
                <li>Using excessive force on a compliant person</li>
                <li>Holding a prisoner in cells covered in human waste (until the Supreme Court drew the line in <em>Taylor v. Riojas</em>)</li>
                <li>Sexual assault during a traffic stop</li>
              </ul>
              <p>
                Even when courts find that an officer&apos;s conduct was constitutionally questionable, they frequently still grant immunity because no prior case addressed that specific situation.
              </p>

              <h2 className="guide-body-h2">The Current Legal and Political Landscape</h2>
              <p>
                Qualified immunity has become a flashpoint in the national debate over police accountability, and the landscape is shifting &mdash; though unevenly.
              </p>
              <p>
                <strong>At the federal level,</strong> momentum has been slow. Congress has repeatedly considered the <em>George Floyd Justice in Policing Act</em> and the <em>Ending Qualified Immunity Act</em>, both of which would have abolished or significantly curtailed the doctrine. Neither has become law. In contrast, Senate Republicans introduced the <em>Qualified Immunity Act of 2025</em>, which would <strong>codify</strong> the current doctrine into federal statute, making it even harder to reform through court decisions. As of 2026, no legislation on either side has passed.
              </p>
              <p>
                The Trump administration has taken a broadly pro-law enforcement stance &mdash; ending consent decrees that held police departments accountable, eliminating the Biden-era national law enforcement misconduct database, and directing the Justice Department to provide legal support for officers facing civil liability.
              </p>
              <p>
                <strong>At the state level,</strong> the picture is more encouraging for victims of misconduct. Four states &mdash; <strong>Colorado, Montana, Nevada, and New Mexico</strong> &mdash; have completely banned police officers from using qualified immunity as a defense in state court. Several others, including Connecticut and Massachusetts, have taken steps to limit the doctrine or create new state-level paths to accountability.
              </p>

              <h2 className="guide-body-h2">Can You Still Sue the Police Even With Qualified Immunity?</h2>
              <p>Yes &mdash; and here is how:</p>

              <h3 className="guide-body-h3">1. Sue the Municipality (<em>Monell</em> Claims)</h3>
              <p>
                Under <em>Monell v. Department of Social Services</em> (1978), you can sue a city, county, or government agency directly if the constitutional violation resulted from an <strong>official policy, widespread custom, or deliberate indifference</strong> by the municipality. Qualified immunity does not apply to municipalities themselves &mdash; only to individual officers.
              </p>
              <p>
                Monell claims are powerful but require evidence that the misconduct was not an isolated incident, but rather a pattern the department knew about and failed to address.
              </p>

              <h3 className="guide-body-h3">2. File in States That Have Abolished or Limited Qualified Immunity</h3>
              <p>
                If you live in Colorado, Montana, Nevada, or New Mexico, or if the incident occurred there, you can bring state civil rights claims without the qualified immunity defense. This is a significant strategic advantage that civil rights attorneys increasingly leverage.
              </p>

              <h3 className="guide-body-h3">3. Argue the Conduct Was Obviously Unconstitutional</h3>
              <p>
                Some courts have found that certain conduct is so clearly wrong that no specific precedent is required. The Supreme Court itself acknowledged this in <em>Taylor v. Riojas</em> (2020), denying immunity to officers who held a prisoner in a cell covered in sewage and feces. If the officer&apos;s conduct was extreme, a court may find it falls within the &ldquo;obvious case&rdquo; exception.
              </p>

              <h3 className="guide-body-h3">4. Pursue Criminal Charges</h3>
              <p>
                Civil and criminal liability are separate tracks. Even if a civil case is dismissed on qualified immunity grounds, the officer may still face state criminal charges for assault, excessive force, or other crimes, or federal civil rights charges under 18 U.S.C. &sect; 242.
              </p>

              <h2 className="guide-body-h2">Off-Duty Officers and Qualified Immunity: A Growing Problem</h2>
              <p>
                A recent joint investigation by the Howard Center for Investigative Journalism and CBS News identified more than 40 cases over the past decade in which off-duty police officers &mdash; working as private security guards &mdash; successfully claimed qualified immunity to avoid civil lawsuits. In most of these cases, courts granted full or partial immunity even when the officer was being paid by a private business, not a government agency.
              </p>
              <p>
                This extension of qualified immunity into purely private conduct has drawn sharp criticism from legal scholars, who argue it distorts the doctrine&apos;s original purpose and shields officers from accountability for actions that have nothing to do with government policing.
              </p>

              <h2 className="guide-body-h2">The Bottom Line</h2>
              <p>
                Qualified immunity is a serious obstacle, but it is not an impenetrable wall. The doctrine has been criticized by legal scholars across the political spectrum &mdash; from the ACLU to the Cato Institute &mdash; as an invention that lacks statutory basis and systematically denies justice to victims of police abuse.
              </p>
              <p>
                If you believe your civil rights have been violated by law enforcement, an experienced civil rights attorney can evaluate whether qualified immunity applies in your case, identify alternative legal theories, and advise you on whether a state-level claim in a reform state offers a better path to justice.
              </p>
              <p>
                The law is changing. States are acting. And courts are beginning to narrow the doctrine&apos;s most extreme applications. Your case may be stronger than you think.
              </p>
            </div>

            <div className="guide-disclaimer">
              This page is for general informational purposes only and does not constitute legal advice. Laws change
              and circumstances vary. Always consult a qualified civil rights attorney for advice specific to your situation.
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
