"use strict";

const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const listing = await prisma.listing.upsert({
    where: { slug: "jane-a-doe" },
    update: {},
    create: {
      name: "Jane A. Doe",
      slug: "jane-a-doe",
      firm: "Doe & Associates",
      tagline: "Fighting for justice since 2005",
      description:
        "Jane Doe is a civil rights attorney with nearly two decades of experience holding law enforcement accountable.\n\nShe has successfully litigated dozens of police misconduct cases, securing millions of dollars in verdicts and settlements for her clients.\n\nJane is committed to ensuring that victims of police brutality have a strong voice in court.",
      email: "jane@doelaw.example",
      phone: "(555) 867-5309",
      website: "https://example.com",
      streetAddress: "123 Liberty Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90001",
      specialties: ["Civil Rights", "Police Misconduct", "Wrongful Death", "Excessive Force"],
      notableResults: [
        "7-figure settlement against LAPD for wrongful shooting",
        "$2.3M verdict in excessive force case",
      ],
      keyCharacteristics: ["Former public defender", "Board certified in civil rights law"],
      approved: true,
    },
  });
  console.log("Upserted:", listing.slug);
}

main().catch(console.error).finally(() => prisma.$disconnect());
