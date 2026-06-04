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
    const deleteReq = pool.request();
    const deleteRes = await deleteReq
      .input("file_id", sql.VarChar(255), fileId)
      .query(
        "DELETE FROM tbl_file WHERE id = @file_id; SELECT @@ROWCOUNT AS affectedRows;",
      );

    return NextResponse.json({
      message: "File deleted successfully",
      body: deleteRes.recordset,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error", error: getErrorMessage(err) },
      { status: 500 },
    );
  }
}
