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

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { message: "User account is required" },
        { status: 400 },
      );
    }

    const pool = await getConnection();
    
    // 1. CHECK FOR DOCUMENTS: Prevent deletion if they own official files
    const checkReq = pool.request();
    checkReq.input("userId", sql.UniqueIdentifier, userId);
    const checkRes = await checkReq.query("SELECT COUNT(*) AS docCount FROM tbl_file WHERE created_by = @userId");
    
    if (checkRes.recordset[0].docCount > 0) {
        return NextResponse.json(
            { message: "Cannot delete user: This account has created official documents. Please edit the account and remove their roles/division to disable them instead." },
            { status: 409 } // 409 Conflict
        );
    }

    // 2. SAFE DELETE: Clean up roles and OTPs before deleting the user
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
        const txReq = new sql.Request(transaction);
        txReq.input("userId", sql.UniqueIdentifier, userId);
        
        // Delete dependent records first to satisfy Foreign Key constraints
        await txReq.query("DELETE FROM tbl_user_role WHERE user_id = @userId");
        await txReq.query("DELETE FROM tbl_otp WHERE user_id = @userId");
        
        // Finally, safely delete the user
        await txReq.query("DELETE FROM tbl_user WHERE id = @userId");

        await transaction.commit();

        return NextResponse.json({
            message: "User account safely deleted",
        });
    } catch (txErr) {
        await transaction.rollback();
        throw txErr;
    }

  } catch (err) {
    console.error("Delete User Error:", err);
    return NextResponse.json(
      { message: "Server error", error: getErrorMessage(err) },
      { status: 500 },
    );
  }
}