
import { NextResponse } from "next/server"
import mongoose from "mongoose"
import Quotation from "../../../lib/models/Quotation"
import path from "path"
import { writeFile } from "fs/promises"

async function connectDB() {
  try {
    if (mongoose.connection.readyState === 1) return
    await mongoose.connect(process.env.MONGODB_URI)
  } catch (err) {
    console.error("DB ERROR:", err)
    throw err
  }
}

export async function GET() {
  try {
    await connectDB()

    const quotations = await Quotation.find().sort({ createdAt: -1 })

    return NextResponse.json({ quotations })

  } catch (error) {
    console.error("🔥 GET ERROR:", error)

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
// ✅ CREATE
export async function POST(req) {
  try {
    await connectDB()

    const formData = await req.formData()

    const title = formData.get("title")
    const description = formData.get("description")
    const file = formData.get("file")

    let fileUrl = ""

    if (file) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const fileName = Date.now() + "-" + file.name
      const filePath = path.join(process.cwd(), "public/uploads", fileName)

      await writeFile(filePath, buffer)

      fileUrl = `/uploads/${fileName}`
    }

    const newData = await Quotation.create({
      title,
      description,
      fileUrl,
    })

    return NextResponse.json({ success: true, data: newData })

  } catch (err) {
  console.error("🔥 POST ERROR:", err)

  return NextResponse.json(
    { error: err.message },
    { status: 500 }
  )
}
}