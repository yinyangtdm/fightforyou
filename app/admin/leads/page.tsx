import Link from "next/link"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { auth } from "../../../auth"
import { redirect } from "next/navigation"
import LeadCheckbox from "./LeadCheckbox"

export const dynamic = "force-dynamic"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

export default async function LeadsPage() {
  const session = await auth()
  if (!session) redirect("/admin/login")

  const [leads, listings, clickEvents] = await Promise.all([
    prisma.contactLead.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.listing.findMany({ select: { slug: true, name: true, photoUrl: true } }),
    prisma.clickEvent.findMany({ select: { listingSlug: true, eventType: true } }),
  ])

  const listingBySlug = Object.fromEntries(listings.map(l => [l.slug, l]))

  // Handed-over leads per attorney
  const handedOverBySlug: Record<string, number> = {}
  for (const lead of leads) {
    if (lead.handedOver) {
      handedOverBySlug[lead.listingSlug] = (handedOverBySlug[lead.listingSlug] ?? 0) + 1
    }
  }

  // Click stats per attorney
  type Stats = { call: number; website: number; contact: number; forms: number }
  const statsBySlug: Record<string, Stats> = {}
  for (const e of clickEvents) {
    if (!statsBySlug[e.listingSlug]) statsBySlug[e.listingSlug] = { call: 0, website: 0, contact: 0, forms: 0 }
    if (e.eventType === "call") statsBySlug[e.listingSlug].call++
    if (e.eventType === "website") statsBySlug[e.listingSlug].website++
    if (e.eventType === "contact") statsBySlug[e.listingSlug].contact++
  }
  // Form submissions from ContactLead table
  for (const lead of leads) {
    if (!statsBySlug[lead.listingSlug]) statsBySlug[lead.listingSlug] = { call: 0, website: 0, contact: 0, forms: 0 }
    statsBySlug[lead.listingSlug].forms++
  }

  // All slugs that have any activity
  const activeSlugs = Array.from(new Set([
    ...Object.keys(handedOverBySlug),
    ...Object.keys(statsBySlug),
  ])).sort((a, b) => {
    const aTotal = (statsBySlug[a]?.forms ?? 0)
    const bTotal = (statsBySlug[b]?.forms ?? 0)
    return bTotal - aTotal
  })

  return (
    <div className="min-h-screen bg-[#2e3440] p-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="text-[#88c0d0] hover:text-[#8fbcbb] text-sm mb-2 inline-block">
              ← Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-[#eceff4]">Leads</h1>
          </div>
          <div className="text-right">
            <p className="text-[#9aa5b4] text-sm">{leads.length} total lead{leads.length !== 1 ? "s" : ""}</p>
            <p className="text-[#9aa5b4] text-sm">{leads.filter(l => l.handedOver).length} handed over</p>
          </div>
        </div>

        {/* Per-attorney stats */}
        {activeSlugs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#d8dee9] mb-3">Activity by Attorney</h2>
            <div className="bg-[#3b4252] rounded-lg border border-[#4c566a] overflow-x-auto">
              <table className="w-full text-sm text-left text-[#eceff4]">
                <thead className="bg-[#434c5e] border-b border-[#4c566a]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Attorney</th>
                    <th className="px-4 py-3 font-medium text-center">📞 Call clicks</th>
                    <th className="px-4 py-3 font-medium text-center">🌐 Website clicks</th>
                    <th className="px-4 py-3 font-medium text-center">✉️ Contact clicks</th>
                    <th className="px-4 py-3 font-medium text-center">📋 Form submissions</th>
                    <th className="px-4 py-3 font-medium text-center">🤝 Handed over</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#4c566a]">
                  {activeSlugs.map(slug => {
                    const listing = listingBySlug[slug]
                    const s = statsBySlug[slug] ?? { call: 0, website: 0, contact: 0, forms: 0 }
                    return (
                      <tr key={slug} className="hover:bg-[#434c5e]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {listing?.photoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={listing.photoUrl} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded bg-[#4c566a] shrink-0" />
                            )}
                            <Link href={`/lawyers/${slug}`} target="_blank" className="text-[#88c0d0] hover:text-[#8fbcbb] font-medium">
                              {listing?.name ?? slug}
                            </Link>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-[#eceff4] font-medium">{s.call || "—"}</td>
                        <td className="px-4 py-3 text-center text-[#eceff4] font-medium">{s.website || "—"}</td>
                        <td className="px-4 py-3 text-center text-[#eceff4] font-medium">{s.contact || "—"}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold ${s.forms > 0 ? "text-[#a3be8c]" : "text-[#4c566a]"}`}>{s.forms || "—"}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold ${(handedOverBySlug[slug] ?? 0) > 0 ? "text-[#88c0d0]" : "text-[#4c566a]"}`}>
                            {handedOverBySlug[slug] || "—"}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* All leads table */}
        <h2 className="text-lg font-semibold text-[#d8dee9] mb-3">All Leads</h2>
        {leads.length === 0 ? (
          <p className="text-[#9aa5b4]">No leads yet.</p>
        ) : (
          <div className="bg-[#3b4252] rounded-lg border border-[#4c566a] overflow-x-auto">
            <table className="w-full text-sm text-left text-[#eceff4]">
              <thead className="bg-[#434c5e] border-b border-[#4c566a]">
                <tr>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Attorney</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Name</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Email</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Phone</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Location</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Message</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap text-center">Contacted</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap text-center">Handed Over</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4c566a]">
                {leads.map((lead) => {
                  const listing = listingBySlug[lead.listingSlug]
                  return (
                    <tr key={lead.id} className={`hover:bg-[#434c5e] ${lead.handedOver ? "opacity-60" : ""}`}>
                      <td className="px-4 py-3 text-[#9aa5b4] whitespace-nowrap">
                        {lead.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link href={`/lawyers/${lead.listingSlug}`} target="_blank" className="text-[#88c0d0] hover:text-[#8fbcbb]">
                          {listing?.name ?? lead.listingSlug}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{lead.name}</td>
                      <td className="px-4 py-3 text-[#9aa5b4]">
                        <a href={`mailto:${lead.email}`} className="hover:text-[#88c0d0]">{lead.email}</a>
                      </td>
                      <td className="px-4 py-3 text-[#9aa5b4] whitespace-nowrap">
                        <a href={`tel:${lead.phone}`} className="hover:text-[#88c0d0]">{lead.phone}</a>
                      </td>
                      <td className="px-4 py-3 text-[#9aa5b4] whitespace-nowrap">{lead.city}, {lead.state}</td>
                      <td className="px-4 py-3 text-[#9aa5b4] max-w-xs">
                        <p className="truncate" title={lead.message}>{lead.message}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <LeadCheckbox leadId={lead.id} field="contacted" initialValue={lead.contacted} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <LeadCheckbox leadId={lead.id} field="handedOver" initialValue={lead.handedOver} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
