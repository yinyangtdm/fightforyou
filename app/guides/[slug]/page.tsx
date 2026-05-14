import { notFound } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import Nav from "../../components/Nav"
import Footer from "../../components/Footer"
import Breadcrumb from "../../components/Breadcrumb"
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

  const { guide, specialties, navGuides } = data

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