import { prisma } from "../../../../lib/prisma"
import { auth } from "../../../../../auth"
import { redirect, notFound } from "next/navigation"
import EditGuideForm from "./EditGuideForm"

export default async function EditGuidePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/justice/login")

  const id = parseInt((await params).id)
  if (isNaN(id)) notFound()

  const guide = await prisma.guide.findUnique({ where: { id } })
  if (!guide) notFound()

  return <EditGuideForm guide={guide} />
}
