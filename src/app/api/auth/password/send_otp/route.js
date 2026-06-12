import { getConnection } from "@/app/api/helper/db";
import sql from "mssql";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { email } = await request.json();

    const pool = await getConnection();
    
    // 1. Direct SQL check (bypassing missing stored procedure)
    const selectRes = await pool.request()
      .input("email", sql.VarChar(255), email)
      .query("SELECT id FROM tbl_user WHERE email = @email");

    const user_id = selectRes.recordset[0]?.id;

    if (selectRes.recordset.length > 0) {
      // create otp
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // hash otp
      const hashedOtp = await bcrypt.hash(otp, 10);
      const expires_at = new Date();
      expires_at.setMinutes(expires_at.getMinutes() + 10); // otp valid for 10 minutes

      // 2. Direct SQL OTP insert/update
      await pool.request()
        .input("otp", sql.VarChar(255), hashedOtp)
        .input("user_id", sql.UniqueIdentifier, user_id)
        .input("expires_at", sql.DateTime, expires_at)
        .query(`
            IF NOT EXISTS (SELECT 1 FROM tbl_otp WHERE user_id = @user_id)
            BEGIN
                INSERT INTO tbl_otp(otp, user_id, expires_at) VALUES (@otp, @user_id, @expires_at)
            END
            ELSE
            BEGIN
                UPDATE tbl_otp SET otp = @otp, expires_at = @expires_at WHERE user_id = @user_id
            END
        `);

      // 3. ✅ THE FIX: Send via Gmail using Nodemailer
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Professional HTML Email Template
      const mailOptions = {
        from: `"DocVal System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "DocVal Reset Password OTP",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #002868; text-align: center; margin-bottom: 5px;">DocVal Account Security</h2>
            <p style="color: #334155; font-size: 15px; text-align: center;">You requested a password reset. Please use the following One-Time Password (OTP) to proceed.</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0; border: 1px dashed #cbd5e1;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #0f172a;">${otp}</span>
            </div>
            
            <p style="color: #64748b; font-size: 14px; text-align: center;">This code will expire in <strong>10 minutes</strong>.</p>
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
              If you did not request this password reset, please ignore this email or contact your system administrator.
            </p>
          </div>
        `,
      };

      // Send the email
      await transporter.sendMail(mailOptions);

      return NextResponse.json(
        {
          message: `OTP sent to ${email}`,
          body: { user_id }, 
        },
        { status: 200 },
      );
    } else {
      return NextResponse.json({ error: "Invalid Email" }, { status: 403 });
    }
  } catch (error) {
    console.error("Nodemailer Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email. Check your Gmail credentials." },
      { status: 500 },
    );
  }
}