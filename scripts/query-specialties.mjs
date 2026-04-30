import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: "postgresql://postgres:MQSFLiQjrLvGYFnfAWegffwQpOlQJJJY@switchback.proxy.rlwy.net:31851/railway" })
const prisma = new PrismaClient({ adapter })

const rows = await prisma.$queryRawUnsafe('SELECT DISTINCT unnest(specialties) AS specialty FROM "Listing" ORDER BY specialty')
rows.forEach(r => console.log(r.specialty))
await prisma.$disconnect()
