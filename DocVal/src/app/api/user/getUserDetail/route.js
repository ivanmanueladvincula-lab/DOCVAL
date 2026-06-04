import { authenticateToken } from "../../helper/authenticateToken";
import { getConnection } from "../../helper/db";
import sql from "mssql";
import { NextResponse } from "next/server";
import { getErrorMessage } from "../../helper/errorHandler";

export async function POST(request) {
  try {
    // authenticate request
    const auth = await authenticateToken(request);
    if (auth.error) {
      return auth.error;
    }

    const { userId } = await request.json();

    const pool = await getConnection();
    const selectReq = pool.request();
    const selectRes = await selectReq
      .input("userId", sql.UniqueIdentifier, userId)
      .execute("dbo.getUserDetail");

    const user = selectRes.recordset[0] || null;

    return NextResponse.json({
      message: "User details retrieved successfully",
      body: user,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error", error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
