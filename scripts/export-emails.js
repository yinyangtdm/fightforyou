"use strict";

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL_PROD }),
});

async function main() {
  const listings = await prisma.listing.findMany({
    where: { email: { not: null, notIn: [""] } },
    select: { name: true, email: true },
    orderBy: { name: "asc" },
  });

  const lines = listings.map((l) => `${l.name},${l.email}`).join("\n");
  const out = path.join(__dirname, "emails.csv");
  fs.writeFileSync(out, "name,email\n" + lines + "\n");
  console.log(`Wrote ${listings.length} emails to scripts/emails.csv`);
}

main().finally(() => prisma.$disconnect());
