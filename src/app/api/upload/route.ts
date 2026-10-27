import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

import { auth } from "@/lib/auth";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) return NextResponse.json({ error: "No files provided" }, { status: 400 });
  if (files.length > 10) return NextResponse.json({ error: "Too many files" }, { status: 400 });

  const uploadDir = path.join(process.cwd(), "public", "uploads", "posts");
  const urls: string[] = [];
  // Serverless platforms (e.g. Vercel) ship a read-only filesystem, so disk
  // writes fail there. Fall back to data URLs instead of crashing; swap in
  // Vercel Blob / S3 / Cloudinary behind this route for real production use.
  let diskWritable = true;

  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (diskWritable) {
      try {
        const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
        const filename = `${randomUUID()}.${ext}`;
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), buffer);
        urls.push(`/uploads/posts/${filename}`);
        continue;
      } catch {
        diskWritable = false;
      }
    }

    urls.push(`data:${file.type};base64,${buffer.toString("base64")}`);
  }

  return NextResponse.json({ urls });
}
