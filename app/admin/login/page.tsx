"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string>("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const result = await signIn("credentials", {
      password,
      redirect: false,
    })
    if (result?.ok) {
      router.push("/admin")
    } else {
      setError("Wrong password")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2e3440]">
      <div className="bg-[#3b4252] p-8 rounded-lg border border-[#4c566a] w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#eceff4]">Admin Login</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className="w-full border border-[#4c566a] rounded p-2 mb-4 bg-[#434c5e] text-[#eceff4] placeholder:text-[#4c566a]"
          />
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-[#5e81ac] text-white py-2 rounded hover:bg-[#81a1c1]"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
