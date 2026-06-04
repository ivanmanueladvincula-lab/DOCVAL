import { NextResponse } from "next/server";
import sql from "mssql";
import { v2 as cloudinary } from "cloudinary";
import { getConnection } from "@/app/api/helper/db";
import { authenticateToken } from "@/app/api/helper/authenticateToken";
import { getErrorMessage } from "@/app/api/helper/errorHandler";

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: "dxxmliars",
  api_key: "617841799943226",
  api_secret: "x6vVuAqAMdvMbyrObYiYEASDzoQ",
});

export async function POST(request) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) {
      return auth.error;
    }

    const userId = auth.user.uid;
    const {
      reference_no,
      title,
      doc_type,
      doc_class,
      sender_office,
      sender_person,
      sender_email,
      sender_phone,
      base64_data,
      report,
      receiving_office,
      office_type,
    } = await request.json();

    // Basic validation
    if (
      !reference_no ||
      !title ||
      !doc_type ||
      !doc_class ||
      !sender_office ||
      !sender_person ||
      !sender_email ||
      !sender_phone ||
      !base64_data ||
      !office_type
    ) {
      return NextResponse.json(
        {
          message: "All fields are required",
          error: "All fields are required",
        },
        { status: 400 },
      );
    }

    // ✅ Upload to Cloudinary instead of local storage
    const fileName = `${Date.now()}_${reference_no}`;
    const base64String = base64_data.split(";base64,").pop();

    const uploadResult = await cloudinary.uploader.upload(
      `data:application/pdf;base64,${base64String}`,
      {
        public_id: fileName,
        folder: "docval/documents",
        resource_type: "auto", // required for non-image files like PDF
        format: "pdf",
      }
    );

    console.log("Cloudinary upload result:", uploadResult.secure_url);

    // Save the Cloudinary URL/public_id to database
    const cloudinaryUrl = uploadResult.secure_url;
    const cloudinaryPublicId = uploadResult.public_id;

    // Insert to database
    const pool = await getConnection();
    const insertReq = pool.request();
    const insertRes = await insertReq
      .input("reference_no", sql.VarChar(100), reference_no)
      .input("title", sql.VarChar(255), title)
      .input("doc_type", sql.UniqueIdentifier, doc_type)
      .input("doc_class", sql.UniqueIdentifier, doc_class)
      .input("sender_office", sql.UniqueIdentifier, sender_office)
      .input("sender_person", sql.VarChar(255), sender_person)
      .input("sender_email", sql.VarChar(255), sender_email)
      .input("sender_phone", sql.VarChar(50), sender_phone)
      .input("created_by", sql.UniqueIdentifier, userId)
      .input("url", sql.VarChar(255), cloudinaryPublicId) // ✅ store public_id
      .input("report", sql.NVarChar(sql.MAX), JSON.stringify(report) || null)
      .input("receiving_office", sql.UniqueIdentifier, receiving_office || null)
      .input("origin", sql.VarChar(20), office_type)
      .execute("dbo.createFile");

    return NextResponse.json(
      {
        message: "File created successfully",
        body: insertRes.recordset,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error", error: getErrorMessage(err) },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) {
      return auth.error;
    }

    const { fileId, report, status } = await request.json();

    if (!fileId || !report || !status) {
      return NextResponse.json(
        {
          error: "All fields are required",
        },
        { status: 400 },
      );
    }

    const pool = await getConnection();
    const updateReq = pool.request();
    const updateRes = await updateReq
      .input("fileId", sql.UniqueIdentifier, fileId)
      .input("report", sql.NVarChar(sql.MAX), JSON.stringify(report))
      .input("status", sql.VarChar(50), status)
      .execute("dbo.updateExternalFile");

    return NextResponse.json(
      {
        message: "File updated successfully",
        body: updateRes.recordset,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}