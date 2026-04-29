import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth-options";
import { connectToDatabase } from "@/lib/mongodb";
import Client from "@/lib/models/Client";
import User from "@/lib/models/User";
import Lead from "@/lib/models/Lead";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createClientSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().regex(/^[0-9]{10,15}$/),
  services: z.array(z.string().trim().min(1)).min(1),
  requirement: z.string().trim().max(3000).optional().default(""),
  budget: z.string().trim().max(120).optional().default(""),
  source: z.string().trim().max(120).optional().default("manual-admin"),
  validFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  validTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const clients = await Client.find({})
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email role")
      .populate("convertedFromLead", "name email")
      .populate("convertedBy", "name email")
      .lean();

    // Include client-role users created from User Management that don't have a Client profile yet.
    const clientUsersWithoutProfile = await User.find(
      {
        role: "client",
        $or: [{ clientProfile: null }, { clientProfile: { $exists: false } }],
      },
      {
        name: 1,
        email: 1,
        isActive: 1,
        createdAt: 1,
      }
    )
      .sort({ createdAt: -1 })
      .lean();

    const existingClientEmails = new Set(
      clients.map((client) => String(client.email || "").toLowerCase()).filter(Boolean)
    );

    const mappedUserClients = clientUsersWithoutProfile
      .filter((user) => !existingClientEmails.has(String(user.email || "").toLowerCase()))
      .map((user) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: "",
        services: [],
        budget: "",
        requirement: "",
        validFrom: null,
        validTo: null,
        convertedFromLead: null,
        convertedFromLeadDate: null,
        convertedBy: null,
        source: "manual-admin",
        status: user.isActive ? "active" : "inactive",
        createdBy: null,
        linkedUser: user._id,
        createdAt: user.createdAt,
      }));

    const mergedClients = [...clients, ...mappedUserClients].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    return Response.json({ clients: mergedClients }, { status: 200 });
  } catch (error) {
    console.error("GET clients error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createClientSchema.parse(body);

    await connectToDatabase();

    // Check if email already exists as client
    const existingClient = await Client.findOne({ email: validated.email });
    if (existingClient) {
      return Response.json({ error: "Client with this email already exists" }, { status: 400 });
    }

    const client = await Client.create({
      ...validated,
      validFrom: new Date(validated.validFrom),
      validTo: new Date(validated.validTo),
      source: validated.source || "manual-admin",
      createdBy: session.user.id,
    });

    return Response.json(
      { client, message: "Client created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST client error:", error);

    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors[0].message }, { status: 400 });
    }

    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { clientId, ...updateData } = body;

    if (!clientId) {
      return Response.json({ error: "Client ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const client = await Client.findById(clientId);
    if (!client) {
      return Response.json({ error: "Client not found" }, { status: 404 });
    }

    // Update allowed fields
    const allowedFields = [
      "name",
      "email",
      "phone",
      "services",
      "budget",
      "requirement",
      "validFrom",
      "validTo",
      "finalBudget",
      "projectName",
      "projectDescription",
      "source",
      "status",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (field in updateData) {
        if (field === "validFrom" || field === "validTo") {
          updates[field] = new Date(updateData[field]);
        } else {
          updates[field] = updateData[field];
        }
      }
    }

    const updated = await Client.findByIdAndUpdate(clientId, updates, { new: true });

    return Response.json(
      { client: updated, message: "Client updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH client error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
