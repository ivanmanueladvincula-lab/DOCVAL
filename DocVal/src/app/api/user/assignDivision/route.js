import { getConnection } from "@/app/api/helper/db";
import sql from "mssql";
import { NextResponse } from "next/server";
import { getErrorMessage } from "@/app/api/helper/errorHandler";

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
    await pool.request()
      .input("user_id", sql.UniqueIdentifier, user_id)
      .input("division", sql.UniqueIdentifier, division_id)
      .execute("dbo.assignDivision");

    return NextResponse.json(
      { message: "Division assigned successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error", error: getErrorMessage(err) },
      { status: 500 }
    );
  }
}