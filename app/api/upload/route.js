import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth-options";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await req.formData();
    const file = data.get("file");

    if (!file || typeof file.arrayBuffer !== "function") {
      return Response.json({ error: "No file received" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });

    const sanitizedName = String(file.name || "document")
      .trim()
      .replace(/[^a-zA-Z0-9._-]+/g, "-");
    const name = `${Date.now()}_${sanitizedName}`;
    const filePath = path.join(uploadDir, name);

    await writeFile(filePath, buffer);

    return Response.json({ url: `/uploads/${name}` });
  } catch (error) {
    return Response.json({ error: error?.message || "Upload failed" }, { status: 500 });
  }
}