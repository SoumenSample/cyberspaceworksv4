import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Conversation from "@/lib/models/Conversation";
import Message from "@/lib/models/Message";
import { emitToUsers } from "@/lib/socket/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { receiverId, text } = await req.json();

  if (!receiverId || !text?.trim()) {
    return Response.json({ error: "receiverId and text are required" }, { status: 400 });
  }

  await connectToDatabase();

  const sender = await User.findById(session.user.id);
  const receiver = await User.findById(receiverId);

  if (!sender || !receiver) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  // Block only client <-> employee direct chats.
  if (
    (sender.role === "client" && receiver.role === "employee") ||
    (sender.role === "employee" && receiver.role === "client")
  ) {
    return Response.json({ error: "Not allowed" }, { status: 403 });
  }

  let convo = await Conversation.findOne({
    participants: { $all: [sender._id, receiver._id] },
  });

  if (!convo) {
    convo = await Conversation.create({
      participants: [sender._id, receiver._id],
    });
  }

 
  const message = await Message.create({
    conversationId: convo._id,
    sender: sender._id,
    receiver: receiver._id,
    text: text.trim(),
  });

  emitToUsers([receiver._id], "receive-message", message);
  emitToUsers([receiver._id], "notification", {
    type: "chat",
    text: "New message",
  });

  return Response.json({ message });
}