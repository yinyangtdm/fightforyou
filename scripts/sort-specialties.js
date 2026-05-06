const path = require("path")
require("dotenv").config({ path: path.join(__dirname, "..", ".env") })
const { PrismaClient } = require("@prisma/client")
const { PrismaPg } = require("@prisma/adapter-pg")

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

async function main() {
  const listings = await prisma.listing.findMany({
    select: { id: true, name: true, specialties: true },
  })

  let updated = 0

  for (const listing of listings) {
    const sorted = [...listing.specialties].sort((a, b) => a.localeCompare(b))
    const alreadySorted = sorted.every((s, i) => s === listing.specialties[i])
    if (alreadySorted) continue

    await prisma.listing.update({
      where: { id: listing.id },
      data: { specialties: sorted },
    })
    updated++
  }

  console.log(`Done. ${updated} listing(s) updated.`)
}

main().finally(() => prisma.$disconnect())
