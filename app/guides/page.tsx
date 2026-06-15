import { prisma } from "../lib/prisma"
import NavServer from "../components/NavServer"
import Footer from "../components/Footer"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { deriveExcerpt, PINNED_GUIDES } from "./_lib"
import { isDbUnavailable } from "../lib/db-errors"
import DbUnavailableNotice from "../components/DbUnavailableNotice"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Know Your Rights — Civil Rights Guides",
  description: "Plain-language guides on civil rights law, police misconduct, qualified immunity, search and seizure, and how to pursue a case against law enforcement.",
}

async function getData() {
  try {
    const guides = await prisma.guide.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      select: { id: true, title: true, slug: true, excerpt: true, body: true, categories: true, coverImageUrl: true, authorName: true, authorSlug: true, createdAt: true, featured: true },
    })
    return { guides, dbUnavailable: false as const }
  } catch (error) {
    if (!isDbUnavailable(error)) throw error
    return { guides: [], dbUnavailable: true as const }
  }
}

export default async function GuidesPage() {
  const { guides, dbUnavailable } = await getData()

  const featured = guides.filter((g) => g.featured)
  const rest = guides.filter((g) => !g.featured)

  return (
    <div className="public">
      <NavServer />

      <main className="guides-index" id="main-content">
        <div className="guides-header">
          <h1>Guides &amp; Resources</h1>
          <p className="guides-subheading">
            Plain-language explanations of the laws, rights, and legal processes that matter when police misconduct affects your life.
          </p>
        </div>

        {dbUnavailable && <DbUnavailableNotice />}

        {featured.length > 0 && (
          <div className="guides-featured">
            {featured.map((g) => (
              <Link key={g.slug} href={`/guides/${g.slug}`} className="guide-card guide-card--featured">
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
          {rest.map((g) => (
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
          <Link href="/justice/login" className="btn-primary">Submit a Guide</Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
