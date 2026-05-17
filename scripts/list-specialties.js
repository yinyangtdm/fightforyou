const path = require("path")
require("dotenv").config({ path: path.join(__dirname, "..", ".env") })
const { PrismaClient } = require("@prisma/client")
const { PrismaPg } = require("@prisma/adapter-pg")

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL_PROD, ssl: { rejectUnauthorized: false } }),
})

prisma.$queryRaw`SELECT DISTINCT UNNEST(specialties) AS specialty FROM "Listing" ORDER BY specialty`
  .then((rows) => rows.forEach((r) => console.log(r.specialty)))
  .finally(() => prisma.$disconnect())
