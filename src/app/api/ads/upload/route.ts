import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSessionUser } from "@/lib/auth";
import { Role } from "@/lib/constants";

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || ![Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Staff login required." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided in request." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type: ${file.type}. Allowed: JPG, PNG, WEBP, GIF, SVG.`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "File exceeds 5MB size limit." },
        { status: 400 }
      );
    }

    // Determine extension
    const originalName = file.name || "ad_image";
    const extension = path.extname(originalName) || `.${file.type.split("/")[1] || "png"}`;
    const cleanBaseName = path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30);
    const uniqueFileName = `${Date.now()}_${cleanBaseName}${extension}`;

    // Target directory: public/uploads/ads
    const uploadDir = path.join(process.cwd(), "public", "uploads", "ads");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueFileName);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/ads/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: uniqueFileName,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error: any) {
    console.error("Ad image upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to upload ad image.",
      },
      { status: 500 }
    );
  }
}
