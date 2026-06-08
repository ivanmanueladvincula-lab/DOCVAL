import { getConnection } from "@/app/api/helper/db";
import sql from "mssql";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

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

    if (!userRes.recordset || userRes.recordset.length === 0) {
      return NextResponse.json({ message: "Invalid email" }, { status: 404 });
    }

    const user = userRes.recordset[0];


    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expires_at = new Date();
    expires_at.setHours(expires_at.getHours() + 24); // Valid for 24 hours

    // Save new OTP
    await pool.request()
      .input("otp", sql.VarChar(255), hashedOtp)
      .input("user_id", sql.UniqueIdentifier, user.id)
      .input("expires_at", sql.DateTime, expires_at)
      .execute("dbo.createOtp");

    // Send email via Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"DocVal System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "DocVal Account Activation",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Activate your DocVal Account</h2>
            <p>Your new OTP is: <strong style="font-size: 24px;">${otp}</strong></p>
            <p>This code is valid for 24 hours.</p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: "OTP sent successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Resend OTP Error:", err);
    return NextResponse.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}