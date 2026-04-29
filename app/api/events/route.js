import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/lib/models/Event";

// =========================
// CREATE EVENT (POST)
// =========================
export async function POST(req) {
  try {
    await connectToDatabase();

    const body = await req.json();

    const newEvent = await Event.create({
      title: body.title,
      date: new Date(body.date),
      time: body.time,
      duration: body.duration,
      type: body.type,
      location: body.location,
      description: body.description,
      attendees: body.attendees || [],
      allDay: body.allDay,
      reminder: body.reminder,
      color: body.color,
    });

    return NextResponse.json(
      { message: "Event created", event: newEvent },
      { status: 201 }
    );
  } catch (error) {
  console.error("🔥 FULL ERROR:", error);

  return Response.json(
    { error: error.message, full: error },
    { status: 500 }
  );
}
}

// =========================
// GET EVENTS
// =========================
export async function GET() {
  try {
    await connectToDatabase();

    const events = await Event.find().sort({ date: 1 });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("GET EVENT ERROR:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// =========================
// DELETE EVENT
// =========================
export async function DELETE(req) {
  try {
    await connectToDatabase();

    const { id } = await req.json();

    await Event.findByIdAndDelete(id);

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// =========================
// UPDATE EVENT
// =========================
export async function PUT(req) {
  try {
    await connectToDatabase();

    const body = await req.json();

    const updated = await Event.findByIdAndUpdate(
      body.id,
      {
        ...body,
        date: new Date(body.date),
      },
      { new: true }
    );

    return NextResponse.json({ event: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}