"use strict";

const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const listings = await prisma.listing.findMany({
    where: { description: { not: null } },
    select: { id: true, name: true, slug: true, description: true, website: true },
    orderBy: { name: "asc" },
  });

  console.log(`Total listings with descriptions: ${listings.length}\n`);
  console.log("=".repeat(80));

  for (const l of listings) {
    console.log(`\nID: ${l.id}`);
    console.log(`Name: ${l.name}`);
    console.log(`Slug: ${l.slug}`);
    console.log(`Website: ${l.website || "(none)"}`);
    console.log(`Description:\n${l.description}`);
    console.log("-".repeat(80));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
