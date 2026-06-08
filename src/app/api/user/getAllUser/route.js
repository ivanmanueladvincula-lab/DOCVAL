import { NextResponse } from "next/server";
import sql from "mssql";
import { getConnection } from "@/app/api/helper/db";
import { authenticateToken } from "@/app/api/helper/authenticateToken";
import { getErrorMessage } from "@/app/api/helper/errorHandler";

/**
 * GET /api/user/getAllUser
 * Retrieves all users from the database
 * Requires: Bearer token in Authorization header
 */
export async function GET(request) {
  try {
    // Authenticate request
    const auth = await authenticateToken(request);
    if (auth.error) {
      return auth.error;
    }

    // Fetch users from database
    const pool = await getConnection();
    const selectReq = pool.request();
    const selectRes = await selectReq.execute("dbo.getAllUser");

    return NextResponse.json({
      message: "Users retrieved successfully",
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
