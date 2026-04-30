import { PrismaClient } from "../../../../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { auth } from "../../../../../auth"
import { redirect, notFound } from "next/navigation"
import EditForm from "./EditForm"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
})

export default async function EditListingPage({ params }) {
  const session = await auth()
  if (!session) redirect("/admin/login")

  const id = parseInt((await params).id)
  if (isNaN(id)) notFound()

  const listing = await prisma.listing.findUnique({ where: { id } })
  if (!listing) notFound()

  return <EditForm listing={listing} />
}
