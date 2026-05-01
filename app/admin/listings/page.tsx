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
    if (sort !== col) return <span className="ml-1 text-gray-300">↕</span>
    return <span className="ml-1">{dir === "desc" ? "↓" : "↑"}</span>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Listings</h1>
          <a
            href="/admin/listings/new"
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Add New
          </a>
        </div>

        {listings.length === 0 ? (
          <p className="text-gray-500">No listings yet.</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Photo</th>
                  <th className="px-4 py-3 font-medium">
                    <a href={sortHref("name")} className="hover:text-black flex items-center">
                      Name{sortIndicator("name")}
                    </a>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <a href={sortHref("type")} className="hover:text-black flex items-center">
                      Type{sortIndicator("type")}
                    </a>
                  </th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Approved</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sorted.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {listing.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={listing.photoUrl} alt="" className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-200" />
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{listing.name}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {listing.isNonprofit ? "Nonprofit" : listing.isFirm ? "Firm" : "Attorney"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {[listing.city, listing.state].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{listing.email || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          listing.approved
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {listing.approved ? "Yes" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-4">
                      <a
                        href={`/admin/listings/${listing.id}/edit`}
                        className="text-blue-600 hover:text-blue-800"
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
