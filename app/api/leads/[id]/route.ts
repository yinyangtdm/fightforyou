import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { auth } from "../../../../auth"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })

  const data: { contacted?: boolean; handedOver?: boolean } = {}
  if (typeof body.contacted === "boolean") data.contacted = body.contacted
  if (typeof body.handedOver === "boolean") data.handedOver = body.handedOver

  const lead = await prisma.contactLead.update({
    where: { id: Number(id) },
    data,
  })

  return NextResponse.json(lead)
}
