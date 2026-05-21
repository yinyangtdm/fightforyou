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
  if (!session) redirect("/justice/login")

  const guides = await prisma.guide.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true, categories: true, published: true, featured: true, createdAt: true },
  })

  return (
    <div className="min-h-screen bg-[#2e3440] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/justice" className="text-[#9aa5b4] hover:text-[#eceff4] text-sm">← Dashboard</Link>
            <h1 className="text-3xl font-bold text-[#eceff4]">Guides</h1>
          </div>
          <Link href="/justice/guides/new" className="bg-[#5e81ac] text-white px-4 py-2 rounded hover:bg-[#81a1c1]">
            Add New
          </Link>
        </div>

        {guides.length === 0 ? (
          <p className="text-[#9aa5b4]">No guides yet.</p>
        ) : (
          <div className="bg-[#3b4252] rounded-lg border border-[#4c566a] overflow-x-auto">
            <table className="w-full text-sm text-left text-[#eceff4]">
              <thead className="bg-[#434c5e] border-b border-[#4c566a]">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Categories</th>
                  <th className="px-4 py-3 font-medium">Published</th>
                  <th className="px-4 py-3 font-medium">Featured</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4c566a]">
                {guides.map((guide) => (
                  <tr key={guide.id} className="hover:bg-[#434c5e]">
                    <td className="px-4 py-3 font-medium">{guide.title}</td>
                    <td className="px-4 py-3 text-[#9aa5b4]">{guide.slug}</td>
                    <td className="px-4 py-3 text-[#9aa5b4]">{guide.categories.join(", ") || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${guide.published ? "bg-[rgba(163,190,140,0.15)] text-[#a3be8c]" : "bg-[rgba(235,203,139,0.15)] text-[#ebcb8b]"}`}>
                        {guide.published ? "Yes" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${guide.featured ? "bg-[rgba(136,192,208,0.15)] text-[#88c0d0]" : "bg-[#434c5e] text-[#9aa5b4]"}`}>
                        {guide.featured ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-4">
                      <Link href={`/justice/guides/${guide.id}/edit`} className="text-[#88c0d0] hover:text-[#8fbcbb]">
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
