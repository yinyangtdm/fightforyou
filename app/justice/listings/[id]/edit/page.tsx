import { prisma } from "../../../../lib/prisma"
import { auth } from "../../../../../auth"
import { redirect, notFound } from "next/navigation"
import EditForm from "./EditForm"

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/justice/login")

  const id = parseInt((await params).id)
  if (isNaN(id)) notFound()

  const listing = await prisma.listing.findUnique({ where: { id } })
  if (!listing) notFound()

  return <EditForm listing={listing} />
}
