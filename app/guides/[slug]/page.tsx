import { notFound } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import Nav from "../../components/Nav"
import Footer from "../../components/Footer"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { categorySlug } from "../_lib"

export const revalidate = 3600

async function getData(slug: string) {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  const [guide, specialtyRows, navGuideRows] = await Promise.all([
    prisma.guide.findUnique({ where: { slug, published: true } }),
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
  if (!guide) return null
  return { guide, specialties: specialtyRows.map((r) => r.specialty), navGuides: navGuideRows }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getData(slug)
  if (!data) return {}
  return {
    title: `${data.guide.title} | fightfor.you`,
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

  const { guide, specialties, navGuides } = data

  return (
    <div className="public">
      <Nav specialties={specialties} guides={navGuides} />

      <div className="guide-page">
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
              {guide.authorName && guide.authorSlug ? (
                <>
                  <Link href={`/guides/author/${guide.authorSlug}`} className="guide-author-link">By {guide.authorName}</Link>
                  <span className="guide-meta-sep">·</span>
                </>
              ) : null}
              <span>{guide.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
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
      </div>

      <Footer />
    </div>
  )
}