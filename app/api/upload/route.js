import { v2 as cloudinary } from "cloudinary"
import { auth } from "../../../auth"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request) {
  const session = await auth()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file")
    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`

    const result = await cloudinary.uploader.upload(dataUrl, {
      transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
    })

    return Response.json({ url: result.secure_url })
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Upload failed" }, { status: 500 })
  }
}
