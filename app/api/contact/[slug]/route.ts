import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const body = await req.json()
  const { name, email, phone, city, state, message, attorneyName, turnstileToken } = body

  if (!name || !email || !phone || !city || !state || !message) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 })
  }

  if (process.env.TURNSTILE_SECRET_KEY) {
    const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: turnstileToken }),
    })
    const result = await verification.json() as { success: boolean }
    if (!result.success) {
      return NextResponse.json({ error: "Human verification failed. Please try again." }, { status: 400 })
    }
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })

  await prisma.contactLead.create({
    data: { listingSlug: slug, name, email, phone, city, state, message },
  })

  if (process.env.RESEND_API_KEY) {
    await resend.emails.send({
      from: "FightFor.you <noreply@fightfor.you>",
      to: "yinyangthetwin@gmail.com",
      subject: `New contact: ${name} → ${attorneyName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Attorney:</strong> ${attorneyName} (<a href="https://fightfor.you/lawyers/${slug}">/lawyers/${slug}</a>)</p>
        <hr />
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Location:</strong> ${city}, ${state}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap">${message}</p>
      `,
    })
  }

  return NextResponse.json({ ok: true })
}
