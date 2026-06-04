import { NextResponse } from "next/server";
import sql from "mssql";
import { getConnection } from "@/app/api/helper/db";
import { authenticateToken } from "@/app/api/helper/authenticateToken";
import { getErrorMessage } from "@/app/api/helper/errorHandler";

export async function GET(request) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) {
      return auth.error;
    }

    const pool = await getConnection();
    const selectReq = pool.request();
    const selectRes = await selectReq.query("SELECT * FROM vw_getAllDocType");

    return NextResponse.json({
      message: "Document types retrieved successfully",
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
