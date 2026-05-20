import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import Nav from "./Nav"

async function getNavData() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
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
  await prisma.$disconnect()
  return {
    specialties: specialtyRows.map((r) => r.specialty),
    guides: guideRows,
  }
}

export default async function NavServer() {
  const { specialties, guides } = await getNavData()
  return <Nav specialties={specialties} guides={guides} />
}
