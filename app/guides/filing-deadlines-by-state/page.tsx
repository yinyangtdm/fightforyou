import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import Nav from "../../components/Nav"
import Footer from "../../components/Footer"
import Breadcrumb from "../../components/Breadcrumb"
import Link from "next/link"
import type { Metadata } from "next"
import StatePicker from "./StatePicker"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "State Filing Deadlines | fightfor.you",
  description: "State-by-state statutes of limitations and notice-of-claim deadlines for civil rights cases. Missing a deadline permanently bars your claim.",
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

export default async function FilingDeadlinesPage() {
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
            <h1 className="guide-title">State Filing Deadlines</h1>
            <div className="guide-meta">
              <Link href="/guides/author/fight-for-you" className="guide-author-link">By fightfor.you</Link>
              <span className="guide-meta-sep">·</span>
              <span>May 9, 2026</span>
              <span className="guide-meta-categories">
                <Link href="/guides/category/legal-reference" className="guide-category-link">Legal Reference</Link>
              </span>
            </div>
            <p className="guide-lead">
              In civil rights cases, missing a deadline doesn&apos;t just hurt your case — it permanently ends it.
              No matter how strong the facts are, a court will dismiss a claim filed one day too late. Here is what
              you need to know before that clock runs out.
            </p>

            <StatePicker />

            <div className="guide-body">
              <h3 className="guide-body-h3">Statute of Limitations</h3>
              <p>
                A statute of limitations (SOL) is the window of time you have to file a lawsuit after an injury occurs.
                Once it expires, you lose the right to sue — permanently. For federal civil rights claims under 42 U.S.C. § 1983,
                courts borrow the statute of limitations from the state where the violation occurred, specifically the
                state&apos;s personal injury SOL. This means the deadline varies by state, ranging from one to six years,
                with most states falling in the two-to-three year range.
              </p>
              <p>
                The clock typically starts running on the date the constitutional violation occurs — or, in some cases,
                when you discovered (or reasonably should have discovered) the injury. Tolling rules can pause the
                clock in limited circumstances, such as when the victim is a minor or is incapacitated, but you should
                never rely on tolling without consulting an attorney. When in doubt, assume the clock is running.
              </p>
            </div>

            <div className="guide-body">
              <h3 className="guide-body-h3">Notice of Claim</h3>
              <p>
                Separate from the statute of limitations, many states require you to file a formal &ldquo;notice of claim&rdquo;
                with the government entity before you can sue. This is a pre-lawsuit written notice that must be served
                on the city, county, or other public body within a short window — often 60 to 180 days of the incident.
                This is a different and much shorter deadline than the SOL.
              </p>
              <p>
                Failing to serve a timely notice of claim is an absolute bar in many jurisdictions. Courts will dismiss
                your case even if the SOL has not expired, and even if your underlying civil rights claim is strong.
                Some states have no general notice requirement for federal § 1983 claims, but state law tort claims
                (which are often brought alongside § 1983 claims) usually do require notice.
              </p>

              <h3 className="guide-body-h3">The Bottom Line</h3>
              <p>
                Two deadlines can kill your case independently of one another: the notice-of-claim deadline and the
                statute of limitations. The notice deadline is usually the shorter of the two and the easiest to miss.
                If you believe your civil rights were violated, contact a qualified civil rights attorney as soon as
                possible. Many work on contingency, meaning no upfront cost to you.
              </p>
            </div>

            <div className="guide-disclaimer">
              This page is for general informational purposes only and does not constitute legal advice. Laws change
              and circumstances vary. Always verify current deadlines with a qualified civil rights attorney before
              taking any action.
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
