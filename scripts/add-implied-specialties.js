const path = require("path")
require("dotenv").config({ path: path.join(__dirname, "..", ".env") })
const { PrismaClient } = require("@prisma/client")
const { PrismaPg } = require("@prisma/adapter-pg")

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

// If a profile has the key specialty, also add all values in the array.
// Rules are one-directional — the reverse is NOT applied.
const IMPLIES = {
  "Catastrophic Injury":  ["Personal Injury"],
  "False Arrest":         ["Police Misconduct"],
  "Police Brutality":     ["Police Misconduct", "Civil Rights"],
  "Wrongful Death":       ["Personal Injury"],
  "Due Process":          ["Constitutional Law", "Civil Rights"],
  "Activist Rights":      ["Constitutional Law", "Civil Rights"],
  "First Amendment":      ["Constitutional Law"],
}

async function main() {
  const listings = await prisma.listing.findMany({
    select: { id: true, name: true, specialties: true },
  })

  let updated = 0

  for (const listing of listings) {
    const toAdd = new Set()

    for (const specialty of listing.specialties) {
      const implied = IMPLIES[specialty]
      if (implied) {
        for (const s of implied) {
          if (!listing.specialties.includes(s)) toAdd.add(s)
        }
      }
    }

    if (toAdd.size === 0) continue

    const newSpecialties = [...listing.specialties, ...toAdd]

    await prisma.listing.update({
      where: { id: listing.id },
      data: { specialties: newSpecialties },
    })

    console.log(`Updated: ${listing.name}`)
    console.log(`  Added: ${[...toAdd].join(", ")}`)
    updated++
  }

  console.log(`\nDone. ${updated} listing(s) updated.`)
}

main().finally(() => prisma.$disconnect())
