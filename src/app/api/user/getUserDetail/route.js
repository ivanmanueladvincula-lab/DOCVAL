import { NextResponse } from "next/server";
import sql from "mssql";
import { getConnection } from "@/app/api/helper/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const targetUserId = body.userId || body.id;

    if (!targetUserId) {
      return NextResponse.json(
        { message: "Missing User ID in request payload" },
        { status: 400 }
      );
    }

    const pool = await getConnection();
    
    // 1. Try the main stored procedure
    const req = pool.request();
    req.input("userId", sql.UniqueIdentifier, targetUserId);
    const result = await req.execute("dbo.getUserDetail");

    // 2. If it succeeds, return the data!
    if (result.recordset && result.recordset.length > 0) {
      return NextResponse.json({
        message: "User details retrieved successfully",
        body: result.recordset[0], 
      });
    }

    // 3. 🚨 SQL BUG BYPASS 🚨
    // If the SP returns 0 rows, it is usually because the user has a NULL division, 
    // causing the SP's "CROSS APPLY" to fail and hide the user. 
    // We rescue the data using a direct fallback query!
    const fallbackReq = pool.request();
    fallbackReq.input("userId", sql.UniqueIdentifier, targetUserId);
    const fallbackResult = await fallbackReq.query(`
        SELECT 
            u.id AS user_id,
            u.f_name,
            u.m_name,
            u.l_name,
            u.email,
            u.division AS division_id,
            ofc.name AS division_name,
            ofc.abrv AS division_abrv,
            (
                SELECT rol2.id, rol2.name
                FROM tbl_user_role AS urol2
                JOIN tbl_role AS rol2 ON urol2.role_id = rol2.id
                WHERE urol2.user_id = u.id
                FOR JSON PATH
            ) AS role,
            CASE WHEN u.division IS NULL THEN 'Pending' ELSE 'Active' END AS status
        FROM tbl_user u
        LEFT JOIN tbl_office ofc ON u.division = ofc.id
        WHERE u.id = @userId
    `);

    // Return the rescued data!
    if (fallbackResult.recordset && fallbackResult.recordset.length > 0) {
         return NextResponse.json({
            message: "User details retrieved via fallback",
            body: fallbackResult.recordset[0], 
          });
    }

    // 4. If both queries fail, the user genuinely does not exist.
    return NextResponse.json(
      { message: "User not found in the database." },
      { status: 404 }
    );

  } catch (err) {
    console.error("getUserDetail Error:", err);
    return NextResponse.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}