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

    const userId = auth.user.uid;
    const pool = await getConnection();
    const selectReq = pool.request();
    const selectRes = await selectReq
      .input("user_id", sql.UniqueIdentifier, userId)
      .execute("dbo.getFileByUser");

    return NextResponse.json({
      message: "Files retrieved successfully",
      body: selectRes.recordset,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error", error: getErrorMessage(err) },
      { status: 500 },
    );
  }
}
