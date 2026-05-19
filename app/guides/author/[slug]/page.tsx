import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import Nav from "../../../components/Nav"
import Footer from "../../../components/Footer"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { deriveExcerpt, categorySlug, PINNED_GUIDES } from "../../_lib"

export const dynamic = "force-dynamic"

async function getData(authorSlug: string) {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  const [guides, specialtyRows] = await Promise.all([
    prisma.guide.findMany({
      where: { published: true, authorSlug },
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { guides } = await getData(slug)
  const authorName = slug === "fight-for-you" ? "fightfor.you" : (guides[0]?.authorName ?? slug)
  return {
    title: `Guides by ${authorName}`,
    description: `Civil rights guides and resources written by ${authorName}.`,
  }
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { guides, specialties } = await getData(slug)

  const authorName = slug === "fight-for-you" ? "fightfor.you" : (guides[0]?.authorName ?? slug)
  const navGuides = guides.slice(0, 8).map((g) => ({ title: g.title, slug: g.slug }))
  const showPinned = slug === "fight-for-you"

  return (
    <div className="public">
      <Nav specialties={specialties} guides={navGuides} />

      <main id="main-content">
      <div className="guide-back-container">
        <Link href="/guides" className="guide-back">← All Guides</Link>
      </div>

      <div className="guides-page">
        <h1>Guides by {authorName}</h1>

        {showPinned && (
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
          </div>
        )}

        {guides.length > 0 && (
          <div className="guides-grid">
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
        )}

        {guides.length === 0 && !showPinned && (
          <p className="guides-empty">No guides found.</p>
        )}
      </div>
      </main>

      <Footer />
    </div>
  )
}
