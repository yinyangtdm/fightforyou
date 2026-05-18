import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import Nav from "../components/Nav"
import Footer from "../components/Footer"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { deriveExcerpt, PINNED_GUIDES } from "./_lib"

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
      select: { id: true, title: true, slug: true, excerpt: true, body: true, categories: true, coverImageUrl: true, authorName: true, authorSlug: true, createdAt: true, featured: true },
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

        <div className="guides-grid">
          {PINNED_GUIDES.map((p) => (
            <Link key={p.slug} href={p.href} className="guide-card">
              <h2 className="guide-card-title">{p.title}</h2>
              <div className="guide-card-meta">
                <span className="guide-card-author">{p.authorName}</span>
                <span className="guide-card-meta-sep">·</span>
                <span className="guide-card-date">{p.date}</span>
              </div>
              <p className="guide-card-excerpt">{p.excerpt}</p>
              <span className="guide-card-read">{p.readLabel}</span>
            </Link>
          ))}
          {guides.map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="guide-card">
              {g.coverImageUrl && (
                <Image src={g.coverImageUrl} alt={g.title} width={600} height={180} className="guide-card-cover" />
              )}
              <h2 className="guide-card-title">{g.title}</h2>
              <div className="guide-card-meta">
                {g.authorName && g.authorSlug && (
                  <>
                    <span className="guide-card-author">{g.authorName}</span>
                    <span className="guide-card-meta-sep">·</span>
                  </>
                )}
                <span className="guide-card-date">{g.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
              {(g.excerpt || deriveExcerpt(g.body)) && <p className="guide-card-excerpt">{g.excerpt || deriveExcerpt(g.body)}</p>}
              <span className="guide-card-read">Read guide →</span>
            </Link>
          ))}
        </div>

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
