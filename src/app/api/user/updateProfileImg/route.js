import { getConnection } from "@/app/api/helper/db";
import sql from "mssql";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const user_id = formData.get("user_id");

    if (!file || !user_id) {
      return NextResponse.json(
        { message: "File and user ID are required" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "docval/profiles", resource_type: "image" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Save URL to DB
    const pool = await getConnection();
    
    // THE FIX: Use a direct SQL query instead of a missing stored procedure
    await pool.request()
      .input("user_id", sql.UniqueIdentifier, user_id)
      .input("profile_img", sql.VarChar(500), uploadResult.secure_url)
      .query("UPDATE tbl_user SET profile_img = @profile_img WHERE id = @user_id");

    return NextResponse.json(
      { message: "Profile image updated!", url: uploadResult.secure_url },
      { status: 200 }
    );
  } catch (err) {
    // THE FIX: Safe error logging that won't crash the server
    console.error("Profile Upload Error:", err);
    return NextResponse.json(
      { message: "Server error", error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}