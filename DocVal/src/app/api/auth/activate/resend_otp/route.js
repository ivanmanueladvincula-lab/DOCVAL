import { getConnection } from "@/app/api/helper/db";
import sql from "mssql";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import ActivateAccountEmail from "@/helper/emailTemplates/active_account";
import { getErrorMessage } from "@/app/api/helper/errorHandler";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const pool = await getConnection();

    const userRes = await pool.request()
      .input("email", sql.VarChar(255), email)
      .execute("dbo.checkEmail");

    if (userRes.recordset.length === 0) {
      return NextResponse.json({ message: "Invalid email" }, { status: 404 });
    }

    const user = userRes.recordset[0];

    if (user.status === "Active") {
      return NextResponse.json(
        { message: "Account is already active" },
        { status: 400 }
      );
    }

    await pool.request()
  .input("user_id", sql.UniqueIdentifier, user.id)
  .execute("dbo.deleteOtpByUser");  // ✅ correct

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expires_at = new Date();
    expires_at.setHours(expires_at.getHours() + 24);

    await pool.request()
      .input("otp", sql.VarChar(255), hashedOtp)
      .input("user_id", sql.UniqueIdentifier, user.id)
      .input("expires_at", sql.DateTime, expires_at)
      .execute("dbo.createOtp");

    // Send email
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [email],
      subject: "DocVal Account Activation",
      react: ActivateAccountEmail({
        name: email,
        otp,
        email,
        activateLink: `http://localhost:3000/auth/activate?email=${encodeURIComponent(email)}&otp=${otp}`,
        expiryTime: "24 hours",
      }),
    });

    if (error) {
      return NextResponse.json(
        { message: "Failed to send email", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "OTP sent successfully" },
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