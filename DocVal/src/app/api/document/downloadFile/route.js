import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { authenticateToken } from "@/app/api/helper/authenticateToken";
import { getErrorMessage } from "@/app/api/helper/errorHandler";

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) {
      return auth.error;
    }

    const { fileName } = await request.json();

    if (!fileName) {
      return NextResponse.json(
        { message: "File name is required" },
        { status: 400 },
      );
    }

    // ✅ Check if it's a Cloudinary public_id or old local filename
    const isCloudinary = fileName.startsWith("docval/");

    if (isCloudinary) {
      // ✅ Generate a signed URL from Cloudinary
      const signedUrl = cloudinary.url(fileName, {
        resource_type: "auto",
        sign_url: true,
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
      });

      // Fetch the file from Cloudinary and return it
      const response = await fetch(signedUrl);
      if (!response.ok) {
        return NextResponse.json(
          { message: "File not found on Cloudinary" },
          { status: 404 },
        );
      }

      const fileBuffer = await response.arrayBuffer();
      const nextResponse = new NextResponse(fileBuffer);
      nextResponse.headers.set(
        "Content-Disposition",
        `attachment; filename="${fileName.split("/").pop()}.pdf"`,
      );
      nextResponse.headers.set("Content-Type", "application/pdf");
      return nextResponse;

    } else {
      // ✅ Fallback for old local files
      const fs = await import("fs");
      const path = await import("path");

      if (
        fileName.includes("..") ||
        fileName.includes("/") ||
        fileName.includes("\\")
      ) {
        return NextResponse.json(
          { message: "Invalid file name" },
          { status: 400 },
        );
      }

      const filePath = path.join(
        process.cwd(),
        "public",
        "uploaded_files",
        fileName,
      );

      if (!fs.existsSync(filePath)) {
        return NextResponse.json(
          { message: "File not found" },
          { status: 404 },
        );
      }

      const fileBuffer = fs.readFileSync(filePath);
      const response = new NextResponse(fileBuffer);
      response.headers.set(
        "Content-Disposition",
        `attachment; filename="${fileName}"`,
      );
      response.headers.set("Content-Type", "application/pdf");
      return response;
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error", error: getErrorMessage(err) },
      { status: 500 },
    );
  }
}