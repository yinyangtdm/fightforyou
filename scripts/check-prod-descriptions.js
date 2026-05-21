"use strict";

const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL_PROD }),
});

async function main() {
  const total = await prisma.listing.count();
  const withDesc = await prisma.listing.count({ where: { description: { not: null } } });

  console.log(`Total listings: ${total}`);
  console.log(`With descriptions: ${withDesc}`);
  console.log("=".repeat(80));

  const listings = await prisma.listing.findMany({
    where: { description: { not: null } },
    select: { id: true, name: true, slug: true, description: true, website: true },
    orderBy: { name: "asc" },
  });

  for (const l of listings) {
    console.log(`\nID: ${l.id} | ${l.name}`);
    console.log(`Website: ${l.website || "(none)"}`);
    console.log(`Description:\n${l.description}`);
    console.log("-".repeat(80));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
