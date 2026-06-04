import { getConnection } from "@/app/api/helper/db";
import sql from "mssql";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { otp, user_id } = await request.json();

    // check if otp and user_id are provided
    if (!otp || !user_id) {
      return NextResponse.json(
        { message: "OTP and User ID are required" },
        { status: 400 },
      );
    }

    // fetch otp from db
    const pool = await getConnection();
    const selectReq = pool.request();
    const selectRes = await selectReq
      .input("user_id", sql.UniqueIdentifier, user_id)
      .execute("dbo.getOtp");

    const record = selectRes.recordset[0];

    if (!record) {
      return NextResponse.json(
        { message: "Invalid OTP or User ID" },
        { status: 400 },
      );
    }

    // compare otp
    const isMatch = await bcrypt.compare(otp, record.otp);

    if (!isMatch) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    // if match and not expired
    const now = new Date();
    if (now > record.expires_at) {
      return NextResponse.json({ message: "OTP has expired" }, { status: 400 });
    }

    // if success, delete otp from db
    const deleteReq = pool.request();
    await deleteReq
      .input("otp_id", sql.UniqueIdentifier, record.id)
      .execute("dbo.deleteOtp");

    return NextResponse.json(
      { message: "OTP verified successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
