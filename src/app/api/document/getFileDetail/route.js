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

    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { message: "fileId is required" },
        { status: 400 },
      );
    }

    const pool = await getConnection();
    const selectReq = pool.request();
    const selectRes = await selectReq
      .input("file_id", sql.VarChar(255), fileId)
      .execute("dbo.getFileDetail");

    return NextResponse.json({
      message: "File details retrieved successfully",
      body: selectRes.recordset[0],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error", error: getErrorMessage(err) },
      { status: 500 },
    );
  }
}
