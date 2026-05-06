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
        <div className="grid grid-cols-2 gap-6">
          <Link href="/admin/listings?browse=state" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h2 className="text-xl font-bold mb-2">Browse by State</h2>
            <p className="text-gray-500">View lawyers and firms by state</p>
          </Link>
          <Link href="/admin/listings?browse=specialty" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h2 className="text-xl font-bold mb-2">Browse by Specialty</h2>
            <p className="text-gray-500">View lawyers and firms by specialty</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
