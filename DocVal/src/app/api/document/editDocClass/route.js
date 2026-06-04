import { NextResponse } from "next/server";
import sql from "mssql";
import { getConnection } from "@/app/api/helper/db";
import { authenticateToken } from "@/app/api/helper/authenticateToken";
import { getErrorMessage } from "@/app/api/helper/errorHandler";

export async function POST(request) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) {
      return auth.error;
    }

    const { docClassId, newName } = await request.json();

    if (!docClassId || !newName) {
      return NextResponse.json(
        { message: "Document class ID and new name are required" },
        { status: 400 },
      );
    }

    const pool = await getConnection();
    const updateReq = pool.request();
    const updateRes = await updateReq
      .input("docClassId", sql.UniqueIdentifier, docClassId)
      .input("newName", sql.VarChar(255), newName.trim())
      .execute("dbo.editDocClass");

    const updatedDocClass = updateRes.recordset?.[0] || null;

    return NextResponse.json(
      {
        message: "Document classification updated successfully",
        body: updatedDocClass,
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
