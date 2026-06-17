export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { prisma } from "./lib/prisma"
import NavServer from "./components/NavServer"
import Footer from "./components/Footer"
import SearchBar from "./components/SearchBar"
import Link from "next/link"
import Image from "next/image"
import { deriveExcerpt, PINNED_GUIDES } from "./guides/_lib"
import { STATE_NAMES } from "./lib/slugs"
import { isDbUnavailable } from "./lib/db-errors"
import DbUnavailableNotice from "./components/DbUnavailableNotice"

export const metadata: Metadata = {
  title: "Find Attorneys Who Fight Law Enforcement",
  description: "When law enforcement causes harm, the odds are stacked against you — qualified immunity, police unions, city lawyers. Find the attorneys who know how to level the playing field.",
}

async function getSearchData() {
  try {
    const [guides, specialtyRows] = await Promise.all([
      prisma.guide.findMany({
        where: { published: true },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        select: { id: true, title: true, slug: true, excerpt: true, body: true, categories: true, coverImageUrl: true, authorName: true, authorSlug: true, createdAt: true, featured: true },
      }),
      prisma.$queryRaw<{ specialty: string }[]>`
        SELECT DISTINCT UNNEST(specialties) AS specialty
        FROM "Listing"
        WHERE array_length(specialties, 1) > 0
        ORDER BY specialty
      `,
    ])

    const states = Object.values(STATE_NAMES).sort()
    const practices = specialtyRows.map((r) => r.specialty).filter(Boolean)

    return { states, guides, practices, dbUnavailable: false as const }
  } catch (error) {
    if (!isDbUnavailable(error)) throw error
    return {
      states: Object.values(STATE_NAMES).sort(),
      guides: [],
      practices: [],
      dbUnavailable: true as const,
    }
  }
}

export default async function HomePage() {
  const { states, guides, practices, dbUnavailable } = await getSearchData()
  const featured = guides.filter((g) => g.featured)
  const rest = guides.filter((g) => !g.featured)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "fightfor.you",
    "url": "https://fightfor.you",
    "description": "Free civil rights attorney directory — attorneys who fight police misconduct, excessive force, and government abuse.",
  }

  return (
    <div className="public">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <NavServer />

      <main className="home-page" id="main-content">
        {dbUnavailable && <DbUnavailableNotice />}
        {/* Search */}
        <section className="hero-section">
          <div className="hero">
            <SearchBar states={states} practices={practices} />
          </div>
        </section>

        {/* Intro */}
        <section className="about-section">
          <div className="about-inner">
            <p>
              Police departments do not fight fair. They have city attorneys, union lawyers, and qualified
              immunity on their side — and filing deadlines as short as 90 days working against you. By the
              time most people know they need help, the clock is already running.
            </p>
            <p>
              fightfor.you lists civil rights attorneys with real wins against law enforcement — vetted,
              not bought. Free to search. No account required. Find someone who has done this before.
            </p>
            <Link href="/about" className="home-about-link">
              Read our full story →
            </Link>
          </div>
        </section>

        {/* Know Your Rights */}
        <section className="rights-section">
          <div className="rights-inner">
            <div className="section-header">
              <h2 className="section-title">Know Your Rights</h2>
              <Link href="/guides" className="section-link">View all guides</Link>
            </div>

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

            <div className="guides-pinned">
              {PINNED_GUIDES.map((p) => (
                <Link key={p.slug} href={p.href} className="guide-pinned-card">
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

            {rest.length > 0 && (
              <div className="guides-grid">
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
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
