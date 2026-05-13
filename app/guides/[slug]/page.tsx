import { notFound } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import Nav from "../../components/Nav"
import Footer from "../../components/Footer"
import Breadcrumb from "../../components/Breadcrumb"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"

export const revalidate = 3600

async function getData(slug: string) {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  const [guide, related, specialtyRows, navGuideRows] = await Promise.all([
    prisma.guide.findUnique({ where: { slug, published: true } }),
    prisma.guide.findMany({
      where: { published: true, slug: { not: slug } },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { title: true, slug: true, excerpt: true, categories: true },
    }),
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
  return { guide, related, specialties: specialtyRows.map((r) => r.specialty), navGuides: navGuideRows }
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

function renderBody(body: string) {
  const sections = body.split(/\n\n+/)
  return sections.map((block, i) => {
    if (block.startsWith("## ")) {
      return <h3 key={i} className="guide-body-h3">{block.slice(3)}</h3>
    }
    if (block.startsWith("### ")) {
      return <h4 key={i} className="guide-body-h4">{block.slice(4)}</h4>
    }
    if (block.startsWith("- ")) {
      const items = block.split("\n").filter((l) => l.startsWith("- "))
      return (
        <ul key={i} className="guide-body-list">
          {items.map((item, j) => <li key={j}>{item.slice(2)}</li>)}
        </ul>
      )
    }
    // inline image: ![alt](url)
    const imgMatch = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (imgMatch) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img key={i} src={imgMatch[2]} alt={imgMatch[1]} className="guide-body-img" />
    }
    return <p key={i}>{block.trim()}</p>
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

  const { guide, related, specialties, navGuides } = data

  return (
    <div className="public">
      <Nav specialties={specialties} guides={navGuides} />

      <div className="breadcrumb-container">
        <Breadcrumb items={[{ label: "← All guides", href: "/guides" }]} />
      </div>

      <div className="guide-page">
        <div className="guide-page-inner">
          <div className="guide-article">
            {guide.coverImageUrl && (
              <Image src={guide.coverImageUrl} alt={guide.title} width={900} height={420} className="guide-hero-img" />
            )}

            <h1 className="guide-title">{guide.title}</h1>

            {guide.excerpt && (
              <p className="guide-lead">{guide.excerpt}</p>
            )}

            <div className="guide-meta">
              {guide.authorName ? (
                <>
                  <span>By </span>
                  {guide.authorSlug ? (
                    <Link href={`/lawyers/${guide.authorSlug}`} className="guide-author-link">{guide.authorName}</Link>
                  ) : (
                    <span className="guide-author-name">{guide.authorName}</span>
                  )}
                  <span className="guide-meta-sep">·</span>
                </>
              ) : null}
              <span>{guide.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              {guide.categories.length > 0 && (
                <>
                  <span className="guide-meta-sep">·</span>
                  <span>{guide.categories.join(", ")}</span>
                </>
              )}
            </div>

            <div className="guide-body">
              {renderBody(guide.body)}
            </div>

            <div className="guide-disclaimer">
              This guide is for general informational purposes only and does not constitute legal advice. Laws vary by state and circumstances differ. Consult a qualified civil rights attorney for advice specific to your situation.
            </div>
          </div>

          {related.length > 0 && (
            <aside className="guide-sidebar">
              <h3 className="guide-sidebar-heading">More Guides</h3>
              <div className="guide-sidebar-list">
                {related.map((g) => (
                  <Link key={g.slug} href={`/guides/${g.slug}`} className="guide-sidebar-item">
                    <span className="guide-sidebar-category">{g.categories[0] ?? ""}</span>
                    <span className="guide-sidebar-title">{g.title}</span>
                  </Link>
                ))}
              </div>
              <div className="guide-sidebar-cta">
                <p>Were your rights violated?</p>
                <Link href="/" className="btn-primary">Find an Attorney</Link>
              </div>
            </aside>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
