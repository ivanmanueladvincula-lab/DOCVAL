import { getConnection } from "@/app/api/helper/db";
import sql from "mssql";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    const { user_id, new_pass } = await request.json();

    // check if userId and newPass are provided
    if (!user_id || !new_pass) {
      return NextResponse.json(
        { message: "User ID and new password are required" },
        { status: 400 },
      );
    }

    // encrypt the new password
    const hashedPassword = await bcrypt.hash(new_pass, 10);

    const pool = await getConnection();
    const updateReq = pool.request();
    await updateReq
      .input("userId", sql.UniqueIdentifier, user_id)
      .input("newPass", sql.VarChar(255), hashedPassword)
      .execute("dbo.resetPassword");

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
