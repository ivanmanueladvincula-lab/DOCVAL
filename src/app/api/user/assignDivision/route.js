import { getConnection } from "@/app/api/helper/db";
import sql from "mssql";
import { NextResponse } from "next/server";
// import { getErrorMessage } from "@/app/api/helper/errorHandler"; // Optional, depending on if you still use it

export async function POST(request) {
  try {
    const { user_id, division_id } = await request.json();

    if (!user_id || !division_id) {
      return NextResponse.json(
        { message: "User ID and Division are required" },
        { status: 400 }
      );
    }

    const pool = await getConnection();
    
    // THE FIX: Execute a direct SQL UPDATE query instead of a missing stored procedure
    await pool.request()
      .input("user_id", sql.UniqueIdentifier, user_id)
      .input("division_id", sql.UniqueIdentifier, division_id)
      .query("UPDATE tbl_user SET division = @division_id WHERE id = @user_id");

    return NextResponse.json(
      { message: "Division assigned successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Assign Division Error:", err);
    return NextResponse.json(
      { message: "Server error", error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}