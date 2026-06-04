import { NextResponse } from "next/server";
import { authenticateToken } from "../helper/authenticateToken";
import { getConnection } from "../helper/db";
import sql from "mssql";

export async function GET(request) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) {
      return auth.error;
    }
    const role = auth.user.rol;
    const userId = auth.user.uid;
    const pool = await getConnection();
    const selectReq = pool.request();

    const userRole = JSON.parse(role);

    if (userRole.some((r) => r.name === "admin")) {
      const selectRes = await selectReq
        .input("userId", sql.UniqueIdentifier, userId)
        .execute("dbo.getDashAdmin");

      const response = JSON.parse(selectRes.recordset[0].JsonOutput);

      return NextResponse.json({
        message: "Dashboard data retrieved successfully",
        body: response,
      });
    }

    if (userRole.some((r) => r.name === "user" || r.name === "CRRU")) {
      const selectRes = await selectReq
        .input("userId", sql.UniqueIdentifier, userId)
        .execute("dbo.getDashUser");

      const response = JSON.parse(selectRes.recordset[0].JsonOutput);

      return NextResponse.json({
        message: "Dashboard data retrieved successfully",
        body: response,
      });
    }

    return NextResponse.json(
      {
        error: "Unauthorized role for dashboard access",
      },
      {
        status: 403,
      },
    );
  } catch (error) {
    console.error(error);
    const { getErrorMessage } = await import("../helper/errorHandler");
    return NextResponse.json(
      { message: "Server error", error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
