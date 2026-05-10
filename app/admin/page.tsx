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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <h2 className="text-lg font-semibold text-gray-700 mb-3">Listings</h2>
        <div className="grid grid-cols-2 gap-6 mb-10">
          <Link href="/admin/listings" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-xl font-bold mb-2">Manage Listings</h3>
            <p className="text-gray-500">View and edit existing listings</p>
          </Link>
          <Link href="/admin/listings/new" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-xl font-bold mb-2">Add New Listing</h3>
            <p className="text-gray-500">Create a new lawyer or firm listing</p>
          </Link>
        </div>

        <h2 className="text-lg font-semibold text-gray-700 mb-3">Guides</h2>
        <div className="grid grid-cols-2 gap-6">
          <Link href="/admin/guides" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-xl font-bold mb-2">Manage Guides</h3>
            <p className="text-gray-500">View and edit existing guides</p>
          </Link>
          <Link href="/admin/guides/new" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-xl font-bold mb-2">New Guide</h3>
            <p className="text-gray-500">Write a new know-your-rights guide</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
