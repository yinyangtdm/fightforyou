import Link from "next/link"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { auth } from "../../../auth"
import { redirect } from "next/navigation"
import DeleteGuideButton from "./DeleteGuideButton"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

export default async function GuidesAdminPage() {
  const session = await auth()
  if (!session) redirect("/admin/login")

  const guides = await prisma.guide.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true, categories: true, published: true, featured: true, createdAt: true },
  })

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-500 hover:text-black text-sm">← Dashboard</Link>
            <h1 className="text-3xl font-bold">Guides</h1>
          </div>
          <Link href="/admin/guides/new" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
            Add New
          </Link>
        </div>

        {guides.length === 0 ? (
          <p className="text-gray-500">No guides yet.</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Categories</th>
                  <th className="px-4 py-3 font-medium">Published</th>
                  <th className="px-4 py-3 font-medium">Featured</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {guides.map((guide) => (
                  <tr key={guide.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{guide.title}</td>
                    <td className="px-4 py-3 text-gray-500">{guide.slug}</td>
                    <td className="px-4 py-3 text-gray-500">{guide.categories.join(", ") || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${guide.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {guide.published ? "Yes" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${guide.featured ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                        {guide.featured ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-4">
                      <Link href={`/admin/guides/${guide.id}/edit`} className="text-blue-600 hover:text-blue-800">
                        Edit
                      </Link>
                      <DeleteGuideButton id={guide.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
