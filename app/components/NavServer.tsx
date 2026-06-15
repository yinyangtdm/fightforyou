import { prisma } from "../lib/prisma"
import { isDbUnavailable } from "../lib/db-errors"
import Nav from "./Nav"

async function getNavData() {
  try {
    const [specialtyRows, guideRows] = await Promise.all([
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
    return {
      specialties: specialtyRows.map((r) => r.specialty),
      guides: guideRows,
    }
  } catch (error) {
    if (isDbUnavailable(error)) {
      return { specialties: [], guides: [] }
    }
    throw error
  }
}

export default async function NavServer() {
  const { specialties, guides } = await getNavData()
  return <Nav specialties={specialties} guides={guides} />
}
