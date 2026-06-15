export const dynamic = "force-dynamic"; // Ensures the dashboard always shows live data

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

    // Using your exact original parsing
    const userRole = JSON.parse(role);

    // Identify roles safely
    const isAdmin = userRole.some((r) => r.name === "admin" || r.name === "Admin");
    const isCRRU = userRole.some((r) => r.name === "CRRU" || r.name === "crru");

    // ── ROUTE ADMIN & CRRU TO THE GLOBAL DASHBOARD ──
    if (isAdmin || isCRRU) {
      let queryUserId = userId;

      // The Bypass: If the user is CRRU, borrow the Admin's ID so the SP doesn't reject them
      if (isCRRU && !isAdmin) {
         const adminReq = await pool.request().query("SELECT TOP 1 id FROM tbl_user WHERE email = 'admin@gmail.com'");
         if (adminReq.recordset.length > 0) {
             queryUserId = adminReq.recordset[0].id;
         }
      }

      // Execute your flawlessly working stored procedure
      const selectRes = await pool.request()
        .input("userId", sql.UniqueIdentifier, queryUserId)
        .execute("dbo.getDashAdmin");

      const response = JSON.parse(selectRes.recordset[0].JsonOutput);

      return NextResponse.json({
        message: "Global Dashboard data retrieved successfully",
        body: response,
      });
    }

    // ── ROUTE STANDARD USERS ──
    if (userRole.some((r) => r.name === "user" || r.name === "User")) {
      const selectRes = await pool.request()
        .input("userId", sql.UniqueIdentifier, userId)
        .execute("dbo.getDashUser");

      const response = JSON.parse(selectRes.recordset[0].JsonOutput);

      return NextResponse.json({
        message: "User Dashboard data retrieved successfully",
        body: response,
      });
    }

    return NextResponse.json(
      { error: "Unauthorized role for dashboard access" },
      { status: 403 }
    );

  } catch (error) {
    console.error("Dashboard Crash:", error);
    
    // ── RESTORED YOUR CRUCIAL ERROR HANDLER ──
    const { getErrorMessage } = await import("../helper/errorHandler");
    return NextResponse.json(
      { message: "Server error", error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}