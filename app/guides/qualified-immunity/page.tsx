import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import Nav from "../../components/Nav"
import Footer from "../../components/Footer"
import Link from "next/link"
import type { Metadata } from "next"
import QIStatePicker from "./StatePicker"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Qualified Immunity by State | fightfor.you",
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

      <div className="guide-page">
        <div className="guide-page-inner">
          <div className="guide-article">
            <Link href="/guides" className="guide-back">← All guides</Link>

            <span className="guide-card-category">Legal Reference</span>
            <h1 className="guide-title">Qualified Immunity by State</h1>
            <p className="guide-lead">
              Qualified immunity is one of the most significant legal obstacles in civil rights cases. Understanding
              how it works — and how your state has responded to it — is essential before pursuing a claim against
              a government official.
            </p>

            <QIStatePicker />

            <div className="guide-body">
              <h3 className="guide-body-h3">What Is Qualified Immunity?</h3>
              <p>
                Qualified immunity is a judicially created doctrine that protects government officials — including
                police officers — from personal civil liability unless they violated a &ldquo;clearly established&rdquo;
                constitutional right. It was developed by the Supreme Court in <em>Harlow v. Fitzgerald</em> (1982)
                and has been significantly expanded through subsequent decisions.
              </p>
              <p>
                The doctrine does not appear anywhere in the text of 42 U.S.C. § 1983, the federal statute that
                provides a cause of action for civil rights violations by government actors. The Supreme Court created
                it as a policy measure to protect officials from frivolous suits and allow them to act decisively.
                Critics argue it has grown far beyond that purpose and now shields officers from accountability even
                in egregious cases.
              </p>
            </div>

            <div className="guide-body">
              <h3 className="guide-body-h3">The &ldquo;Clearly Established&rdquo; Standard</h3>
              <p>
                To overcome qualified immunity, a plaintiff must show not only that their constitutional rights were
                violated, but that the right was &ldquo;clearly established&rdquo; at the time of the conduct — meaning a
                prior court decision addressed nearly identical facts. Courts have interpreted this requirement
                extremely narrowly. If no prior case involved the exact same scenario, the officer receives immunity
                regardless of how obvious the constitutional violation was.
              </p>
              <p>
                This creates a circular problem: because officers receive immunity when there is no prior case on
                point, it becomes nearly impossible to establish the precedent needed to overcome immunity in future
                cases. The result is that many clear constitutional violations go unredressed in federal court.
              </p>

              <h3 className="guide-body-h3">State-Level Reform</h3>
              <p>
                Because qualified immunity is a federal doctrine, states cannot eliminate it for federal § 1983
                claims. However, states can — and some have — abolished or limited qualified immunity for civil
                rights claims brought under <em>state</em> law. This provides an alternative path to accountability
                that runs through state court rather than federal court.
              </p>
              <p>
                A small but growing number of states have enacted legislation restricting qualified immunity.
                Colorado was the first in 2020 with its Law Enforcement Integrity Act. New Mexico, New York City,
                and a handful of others have followed. In these jurisdictions, officers can be held personally
                liable for constitutional violations under state law without needing to satisfy the &ldquo;clearly
                established&rdquo; standard. Most states, however, still apply the federal doctrine to state claims
                as well.
              </p>

              <h3 className="guide-body-h3">What This Means for Your Case</h3>
              <p>
                If you are in a state that has reformed or abolished qualified immunity, your attorney may be able
                to bring parallel claims under state law that bypass the federal immunity barrier. This can
                significantly improve your chances of reaching a jury. If your state applies the federal doctrine,
                your attorney will need to identify prior cases establishing the right at issue with sufficient
                specificity — a demanding but not impossible standard, particularly in cases involving excessive
                force, unlawful arrest, or illegal searches.
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
