import { NextResponse } from "next/server";
import { authenticateToken } from "../../helper/authenticateToken";
import { getConnection } from "../../helper/db";
import { getErrorMessage } from "../../helper/errorHandler";

export async function GET(request) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) {
      return auth.error;
    }
    const pool = await getConnection();
    const selectReq = pool.request();
    const selectRes = await selectReq.execute("dbo.getAllRoles");
    return NextResponse.json({
      message: "Roles retrieved successfully",
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
