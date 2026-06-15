import { notFound } from "next/navigation"
import { prisma } from "../../lib/prisma"
import NavServer from "../../components/NavServer"
import Footer from "../../components/Footer"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { categorySlug } from "../_lib"
import { isDbUnavailable } from "../../lib/db-errors"

export const revalidate = 3600

async function getData(slug: string) {
  try {
    const guide = await prisma.guide.findUnique({ where: { slug, published: true } })
    if (!guide) return null
    return { guide }
  } catch (error) {
    if (isDbUnavailable(error)) return { type: "unavailable" as const }
    throw error
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getData(slug)
  if (!data || ("type" in data && data.type === "unavailable")) return {}
  return {
    title: data.guide.title,
    description: data.guide.excerpt ?? undefined,
  }
}

function inlineFormat(text: string): React.ReactNode {
  const regex = /(\*\*[^*\n]+\*\*|\*(?!\*)[^*\n]+\*(?!\*))/g
  const parts: React.ReactNode[] = []
  let last = 0
  let idx = 0
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const m = match[0]
    if (m.startsWith("**")) {
      parts.push(<strong key={idx++}>{m.slice(2, -2)}</strong>)
    } else {
      parts.push(<em key={idx++}>{m.slice(1, -1)}</em>)
    }
    last = match.index + m.length
  }
  if (last < text.length) parts.push(text.slice(last))
  if (parts.length === 0) return text
  if (parts.length === 1 && typeof parts[0] === "string") return parts[0]
  return <>{parts}</>
}

function renderBody(body: string) {
  const sections = body.split(/\n\n+/)
  return sections.map((block, i) => {
    const trimmed = block.trim()

    if (trimmed === "---") {
      return <hr key={i} className="guide-body-hr" />
    }
    if (trimmed.startsWith("# ") && !trimmed.startsWith("## ")) {
      return <h2 key={i} className="guide-body-h2">{inlineFormat(trimmed.slice(2))}</h2>
    }
    if (trimmed.startsWith("## ") && !trimmed.startsWith("### ")) {
      return <h3 key={i} className="guide-body-h3">{inlineFormat(trimmed.slice(3))}</h3>
    }
    if (trimmed.startsWith("### ")) {
      return <h4 key={i} className="guide-body-h4">{inlineFormat(trimmed.slice(4))}</h4>
    }
    if (trimmed.startsWith("> ")) {
      const lines = trimmed.split("\n").map(l => l.replace(/^>\s?/, ""))
      return (
        <blockquote key={i} className="guide-body-blockquote">
          {lines.map((l, j) => <p key={j}>{inlineFormat(l)}</p>)}
        </blockquote>
      )
    }
    if (trimmed.startsWith("- ")) {
      const items = trimmed.split("\n").filter((l) => l.startsWith("- "))
      return (
        <ul key={i} className="guide-body-list">
          {items.map((item, j) => <li key={j}>{inlineFormat(item.slice(2))}</li>)}
        </ul>
      )
    }
    if (/^\d+\.\s/.test(trimmed)) {
      const items = trimmed.split("\n").filter((l) => /^\d+\.\s/.test(l))
      return (
        <ol key={i} className="guide-body-list guide-body-list--ol">
          {items.map((item, j) => <li key={j}>{inlineFormat(item.replace(/^\d+\.\s/, ""))}</li>)}
        </ol>
      )
    }
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (imgMatch) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img key={i} src={imgMatch[2]} alt={imgMatch[1]} className="guide-body-img" />
    }
    return <p key={i}>{inlineFormat(trimmed)}</p>
  })
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getData(slug)
  if (!data) notFound()
  if ("type" in data && data.type === "unavailable") {
    return (
      <div className="public">
        <NavServer />
        <main className="guide-page" id="main-content">
          <div className="guide-back-container">
            <Link href="/guides" className="guide-back">← All Guides</Link>
          </div>
          <div className="guide-page-inner">
            <h1 className="guide-title">Guide temporarily unavailable</h1>
            <p>We could not reach the database. Check your connection and try again.</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const { guide } = data

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": guide.title,
    ...(guide.excerpt && { "description": guide.excerpt }),
    "author": { "@type": "Organization", "name": guide.authorName ?? "fightfor.you", "url": "https://fightfor.you" },
    "publisher": { "@type": "Organization", "name": "fightfor.you", "url": "https://fightfor.you" },
    "datePublished": guide.createdAt.toISOString(),
    "url": `https://fightfor.you/guides/${guide.slug}`,
    ...(guide.coverImageUrl && { "image": guide.coverImageUrl }),
  }

  return (
    <div className="public">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <NavServer />

      <main className="guide-page" id="main-content">
        <div className="guide-back-container">
          <Link href="/guides" className="guide-back">← All Guides</Link>
        </div>
        <div className="guide-page-inner">
          <div className="guide-article">
            {guide.coverImageUrl && (
              <Image src={guide.coverImageUrl} alt={guide.title} width={900} height={420} className="guide-hero-img" />
            )}

            <h1 className="guide-title">{guide.title}</h1>


            <div className="guide-meta">
              <span className="guide-meta-byline">
                {guide.authorName && guide.authorSlug ? (
                  <>
                    <Link href={`/guides/author/${guide.authorSlug}`} className="guide-author-link">By {guide.authorName}</Link>
                    <span className="guide-meta-sep">·</span>
                  </>
                ) : null}
                <span>{guide.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              </span>
              {guide.categories.length > 0 && (
                <span className="guide-meta-categories">
                  {guide.categories.map((cat, i) => (
                    <span key={cat}>
                      {i > 0 && <span className="guide-meta-sep">, </span>}
                      <Link href={`/guides/category/${categorySlug(cat)}`} className="guide-category-link">{cat}</Link>
                    </span>
                  ))}
                </span>
              )}
            </div>

            <div className="guide-body">
              {renderBody(guide.body)}
            </div>

            <div className="guide-disclaimer">
              This guide is for general informational purposes only and does not constitute legal advice. Laws vary by state and circumstances differ. Consult a qualified civil rights attorney for advice specific to your situation.
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}