import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import Nav from "../components/Nav"
import Footer from "../components/Footer"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Know Your Rights — Guides | fightfor.you",
  description: "Plain-language guides on civil rights, police misconduct, search and seizure, and how to pursue a case.",
}

async function getData() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  const [guides, specialtyRows] = await Promise.all([
    prisma.guide.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      select: { id: true, title: true, slug: true, excerpt: true, categories: true, coverImageUrl: true, authorName: true, createdAt: true, featured: true },
    }),
    prisma.$queryRaw<{ specialty: string }[]>`
      SELECT DISTINCT UNNEST(specialties) AS specialty FROM "Listing" ORDER BY specialty
    `,
  ])
  await prisma.$disconnect()
  return { guides, specialties: specialtyRows.map((r) => r.specialty) }
}

export default async function GuidesPage() {
  const { guides, specialties } = await getData()

  const featured = guides.filter((g) => g.featured)
  const rest = guides.filter((g) => !g.featured)
  const navGuides = guides.slice(0, 8).map((g) => ({ title: g.title, slug: g.slug }))
  return (
    <div className="public">
      <Nav specialties={specialties} guides={navGuides} />

      <div className="guides-page">
        <div className="guides-header">
          <h1>Guides &amp; Resources</h1>
          <p className="guides-subheading">
            Plain-language explanations of the laws, rights, and legal processes that matter when police misconduct affects your life.
          </p>
        </div>

        <div className="guides-pinned">
          <Link href="/guides/filing-deadlines-by-state" className="guide-pinned-card">
            <span className="guide-card-category">Legal Reference</span>
            <h2 className="guide-card-title">Filing Deadlines by State</h2>
            <p className="guide-card-excerpt">
              State-by-state statutes of limitations and notice-of-claim deadlines for civil rights cases. Missing a deadline permanently bars your claim.
            </p>
            <span className="guide-card-read">Look up your state →</span>
          </Link>
          <Link href="/guides/qualified-immunity" className="guide-pinned-card">
            <span className="guide-card-category">Legal Reference</span>
            <h2 className="guide-card-title">Qualified Immunity by State</h2>
            <p className="guide-card-excerpt">
              How qualified immunity shields officers from personal liability, which states have reformed or abolished it, and what it means for your case.
            </p>
            <span className="guide-card-read">Look up your state →</span>
          </Link>
        </div>

        {featured.length > 0 && (
          <div className="guides-featured">
            {featured.map((g) => (
              <Link key={g.slug} href={`/guides/${g.slug}`} className="guide-card guide-card--featured">
                {g.coverImageUrl && (
                  <Image src={g.coverImageUrl} alt={g.title} width={600} height={180} className="guide-card-cover" />
                )}
                <span className="guide-card-category">{g.categories[0] ?? ""}</span>
                <h2 className="guide-card-title">{g.title}</h2>
                {g.excerpt && <p className="guide-card-excerpt">{g.excerpt}</p>}
                <span className="guide-card-read">Read guide →</span>
              </Link>
            ))}
          </div>
        )}

        {rest.length > 0 && (
          <div className="guides-grid">
            {rest.map((g) => (
              <Link key={g.slug} href={`/guides/${g.slug}`} className="guide-card">
                {g.coverImageUrl && (
                  <Image src={g.coverImageUrl} alt={g.title} width={600} height={180} className="guide-card-cover" />
                )}
                <span className="guide-card-category">{g.categories[0] ?? ""}</span>
                <h2 className="guide-card-title">{g.title}</h2>
                {g.excerpt && <p className="guide-card-excerpt">{g.excerpt}</p>}
                <span className="guide-card-read">Read guide →</span>
              </Link>
            ))}
          </div>
        )}

        {guides.length === 0 && (
          <p className="guides-empty">No guides published yet.</p>
        )}

        <div className="guides-cta">
          <h2>Are you an attorney?</h2>
          <p>Share your expertise by contributing a guide. Attorney submissions are reviewed before publishing.</p>
          <Link href="/admin/login" className="btn-primary">Submit a Guide</Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
