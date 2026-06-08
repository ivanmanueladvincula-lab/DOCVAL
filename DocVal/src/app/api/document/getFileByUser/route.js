import { NextResponse } from "next/server";
import sql from "mssql";
import { getConnection } from "@/app/api/helper/db";
import { authenticateToken } from "@/app/api/helper/authenticateToken";
import { getErrorMessage } from "@/app/api/helper/errorHandler";

export async function GET(request) {
  try {
    const auth = await authenticateToken(request);
    
    // Stop crash if auth fails
    if (auth.error) {
      return NextResponse.json(
        { message: "Authentication failed", error: auth.error }, 
        { status: 401 }
      );
    }

    // THE CRITICAL FIX: It must be .uid based on your generateToken.js payload
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