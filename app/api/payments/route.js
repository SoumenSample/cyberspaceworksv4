import { NextResponse } from "next/server"
import mongoose from "mongoose"
import Payment from "../../../lib/models/Payment"

async function connectDB() {
  if (mongoose.connection.readyState === 1) return
  await mongoose.connect(process.env.MONGODB_URI)
}

// GET (admin + client filter)
export async function GET(req) {
  await connectDB()

  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")

  const query = email ? { clientEmail: email } : {}

  const payments = await Payment.find(query).sort({ createdAt: -1 })

  return NextResponse.json({ payments })
}

// POST (create)
export async function POST(req) {
  await connectDB()

  const body = await req.json()

  const payment = await Payment.create(body)

  return NextResponse.json({ payment })
}