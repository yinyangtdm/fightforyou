import React from 'react'
import Link from "next/link"
import Image from "next/image"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { auth } from "../../../auth"
import { redirect } from "next/navigation"
import DeleteButton from "./DeleteButton"
import BulkPhotoUpload from "./BulkPhotoUpload"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string }>
}) {
  const session = await auth()
  if (!session) redirect("/admin/login")

  const { sort, dir } = await searchParams

  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
  })

  function getType(l: (typeof listings)[0]) {
    return l.isNonprofit ? "Nonprofit" : l.isFirm ? "Firm" : "Attorney"
  }

  const sorted = [...listings]
  if (sort === "name") {
    sorted.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name)
      return dir === "desc" ? -cmp : cmp
    })
  } else if (sort === "type") {
    sorted.sort((a, b) => {
      const cmp = getType(a).localeCompare(getType(b))
      return dir === "desc" ? -cmp : cmp
    })
  }

  function sortHref(col: string) {
    const nextDir = sort === col && dir !== "desc" ? "desc" : "asc"
    return `/admin/listings?sort=${col}&dir=${nextDir}`
  }

  function sortIndicator(col: string) {
    if (sort !== col) return ""
    return dir === "desc" ? " ↓" : " ↑"
  }

  return (
    <div className="min-h-screen bg-[#2e3440] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#eceff4]">Listings</h1>
          <Link
            href="/admin/listings/new"
            className="bg-[#5e81ac] text-white px-4 py-2 rounded hover:bg-[#81a1c1]"
          >
            Add New
          </Link>
        </div>

        {listings.length === 0 ? (
          <p className="text-[#9aa5b4]">No listings yet.</p>
        ) : (
          <div className="bg-[#3b4252] rounded-lg border border-[#4c566a] overflow-x-auto">
            <table className="w-full text-sm text-left text-[#eceff4]">
              <thead className="bg-[#434c5e] border-b border-[#4c566a]">
                <tr>
                  <th className="px-4 py-3 font-medium">Photo</th>
                  <th className="px-4 py-3 font-medium">
                    <a href={sortHref("name")} className="hover:text-[#88c0d0] flex items-center">
                      Name{sortIndicator("name")}
                    </a>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <a href={sortHref("type")} className="hover:text-[#88c0d0] flex items-center">
                      Type{sortIndicator("type")}
                    </a>
                  </th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Approved</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4c566a]">
                {sorted.map((listing) => (
                  <tr key={listing.id} className="hover:bg-[#434c5e]">
                    <td className="px-4 py-3">
                      {listing.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={listing.photoUrl} alt="" className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-[#4c566a]" />
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{listing.name}</td>
                    <td className="px-4 py-3 text-[#9aa5b4]">
                      {listing.isNonprofit ? "Nonprofit" : listing.isFirm ? "Firm" : "Attorney"}
                    </td>
                    <td className="px-4 py-3 text-[#9aa5b4]">
                      {[listing.city, listing.state].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-[#9aa5b4]">{listing.email || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          listing.approved
                            ? "bg-[rgba(163,190,140,0.15)] text-[#a3be8c]"
                            : "bg-[rgba(235,203,139,0.15)] text-[#ebcb8b]"
                        }`}
                      >
                        {listing.approved ? "Yes" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-4">
                      <a
                        href={`/admin/listings/${listing.id}/edit`}
                        className="text-[#88c0d0] hover:text-[#8fbcbb]"
                      >
                        Edit
                      </a>
                      <DeleteButton id={listing.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <BulkPhotoUpload listings={listings.map(l => ({ id: l.id, name: l.name, slug: l.slug, photoUrl: l.photoUrl }))} />
      </div>
    </div>
  )
}
