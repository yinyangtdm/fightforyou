import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { auth } from "../../../../../auth"
import { redirect, notFound } from "next/navigation"
import EditGuideForm from "./EditGuideForm"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

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
