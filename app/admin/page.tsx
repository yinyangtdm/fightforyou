import Link from "next/link"
import { auth } from "../../auth"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const session = await auth()
  console.log("SESSION:", session)

  if (!session) {
    redirect("/admin/login")
  }

  return (
    <div className="min-h-screen bg-[#2e3440] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[#eceff4]">Admin Dashboard</h1>

        <h2 className="text-lg font-semibold text-[#d8dee9] mb-3">Listings</h2>
        <div className="grid grid-cols-2 gap-6 mb-10">
          <Link href="/admin/listings" className="bg-[#3b4252] p-6 rounded-lg border border-[#4c566a] hover:border-[#88c0d0] transition">
            <h3 className="text-xl font-bold mb-2 text-[#eceff4]">Manage Listings</h3>
            <p className="text-[#9aa5b4]">View and edit existing listings</p>
          </Link>
          <Link href="/admin/listings/new" className="bg-[#3b4252] p-6 rounded-lg border border-[#4c566a] hover:border-[#88c0d0] transition">
            <h3 className="text-xl font-bold mb-2 text-[#eceff4]">Add New Listing</h3>
            <p className="text-[#9aa5b4]">Create a new lawyer or firm listing</p>
          </Link>
        </div>

        <h2 className="text-lg font-semibold text-[#d8dee9] mb-3">Guides</h2>
        <div className="grid grid-cols-2 gap-6">
          <Link href="/admin/guides" className="bg-[#3b4252] p-6 rounded-lg border border-[#4c566a] hover:border-[#88c0d0] transition">
            <h3 className="text-xl font-bold mb-2 text-[#eceff4]">Manage Guides</h3>
            <p className="text-[#9aa5b4]">View and edit existing guides</p>
          </Link>
          <Link href="/admin/guides/new" className="bg-[#3b4252] p-6 rounded-lg border border-[#4c566a] hover:border-[#88c0d0] transition">
            <h3 className="text-xl font-bold mb-2 text-[#eceff4]">New Guide</h3>
            <p className="text-[#9aa5b4]">Write a new know-your-rights guide</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
