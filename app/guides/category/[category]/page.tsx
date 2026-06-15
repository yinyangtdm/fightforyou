import { prisma } from "../../../lib/prisma"
import NavServer from "../../../components/NavServer"
import Footer from "../../../components/Footer"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { deriveExcerpt, categoryFromSlug, PINNED_GUIDES } from "../../_lib"
import { isDbUnavailable } from "../../../lib/db-errors"
import DbUnavailableNotice from "../../../components/DbUnavailableNotice"

export const dynamic = "force-dynamic"

async function getData(category: string) {
  try {
    const guides = await prisma.guide.findMany({
      where: { published: true, categories: { has: category } },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      select: { id: true, title: true, slug: true, excerpt: true, body: true, categories: true, coverImageUrl: true, authorName: true, authorSlug: true, createdAt: true, featured: true },
    })
    return { guides, dbUnavailable: false as const }
  } catch (error) {
    if (!isDbUnavailable(error)) throw error
    return { guides: [], dbUnavailable: true as const }
  }
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params
  const displayCategory = categoryFromSlug(category)
  return {
    title: `Guides tagged "${displayCategory}"`,
    description: `Civil rights guides and resources tagged "${displayCategory}".`,
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const displayCategory = categoryFromSlug(category)
  const { guides, dbUnavailable } = await getData(displayCategory)

  const showPinned = category === "legal-reference"

  return (
    <div className="public">
      <NavServer />

      <main id="main-content">
      <div className="guide-back-container">
        <Link href="/guides" className="guide-back">← All Guides</Link>
      </div>

      <div className="guides-page">
        <h1>Guides tagged &ldquo;{displayCategory}&rdquo;</h1>

        {dbUnavailable && <DbUnavailableNotice />}

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
