import { getConnection } from "@/app/api/helper/db";
import sql from "mssql";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { getErrorMessage } from "@/app/api/helper/errorHandler";

export async function POST(request) {
  try {
    const { email, otp, password } = await request.json();

    if (!email || !otp || !password) {
      return NextResponse.json(
        { message: "Email, OTP, and password are required" },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    // Get user by email
    const userRes = await pool.request()
      .input("email", sql.VarChar(255), email)
      .execute("dbo.checkEmail");

    if (userRes.recordset.length === 0) {
      return NextResponse.json({ message: "Invalid email" }, { status: 404 });
    }

    const user = userRes.recordset[0];

    // Check if already active
    if (user.status === "Active") {
      return NextResponse.json(
        { message: "Account is already active" },
        { status: 400 }
      );
    }

    // Get OTP from DB
    const otpRes = await pool.request()
      .input("user_id", sql.UniqueIdentifier, user.id)
      .execute("dbo.getOtp");

    const record = otpRes.recordset[0];

    if (!record) {
      return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 });
    }

    // Verify OTP
    const isMatch = await bcrypt.compare(otp, record.otp);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    // Check expiry
    if (new Date() > new Date(record.expires_at)) {
      return NextResponse.json({ message: "OTP has expired" }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Activate account
    await pool.request()
      .input("email", sql.VarChar(255), email)
      .input("password", sql.VarChar(255), hashedPassword) 
      .query("UPDATE tbl_user SET password = @password WHERE email = @email");

    // Delete used OTP
    await pool.request()
      .input("otp_id", sql.UniqueIdentifier, record.id)
      .execute("dbo.deleteOtp");

    return NextResponse.json(
      { message: "Account activated successfully! You can now log in." },
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