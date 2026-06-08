import { NextResponse } from "next/server";
import sql from "mssql";
import bcrypt from "bcrypt";
import { getConnection } from "@/app/api/helper/db";
import { getErrorMessage } from "@/app/api/helper/errorHandler";
import nodemailer from "nodemailer"; // 1. Swapped Resend for Nodemailer

export async function POST(request) {
  try {
    const { f_name, m_name, l_name, email, role } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const pool = await getConnection();

    // Check if user already exists
    const selectRes = await pool.request()
      .input("email", sql.VarChar(255), email)
      .execute("dbo.checkEmail");

    if (selectRes.recordset && selectRes.recordset.length > 0) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Use placeholder password since user hasn't set one yet
    const placeholderPassword = await bcrypt.hash("PENDING_ACTIVATION", 10);

    // Prepare role table-valued parameter
    const roleTable = new sql.Table();
    roleTable.columns.add("RoleIdList", sql.UniqueIdentifier);
    if (role && role.length > 0) {
        role.forEach((r) => roleTable.rows.add(r));
    }

    // Register user with Pending status, division = NULL
    await pool.request()
      .input("f_name", sql.VarChar(100), f_name || "")
      .input("m_name", sql.VarChar(100), m_name || "")
      .input("l_name", sql.VarChar(100), l_name || "")
      .input("email", sql.VarChar(255), email)
      .input("password", sql.VarChar(255), placeholderPassword)
      .input("role", roleTable)
      .input("division", sql.UniqueIdentifier, null)
      .execute("dbo.registerUser");

    // 2. FIX: Safely fetch the newly generated User ID 
    const newUserCheck = await pool.request()
      .input("email", sql.VarChar(255), email)
      .execute("dbo.checkEmail");

    if (!newUserCheck.recordset || newUserCheck.recordset.length === 0) {
        throw new Error("Failed to retrieve new user ID after registration.");
    }

    const user_id = newUserCheck.recordset[0].id;

    // Store OTP (expires in 24 hours)
    const expires_at = new Date();
    expires_at.setHours(expires_at.getHours() + 24);

    await pool.request()
      .input("otp", sql.VarChar(255), hashedOtp)
      .input("user_id", sql.UniqueIdentifier, user_id)
      .input("expires_at", sql.DateTime, expires_at)
      .execute("dbo.createOtp");

    // 3. FIX: Send activation email using Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const activateLink = `http://localhost:3000/auth/activate?email=${encodeURIComponent(email)}`;

    await transporter.sendMail({
      from: `"DocVal System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "DocVal Account Activation",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to DocVal, ${f_name}!</h2>
          <p>Your account has been successfully created. Please activate it using the OTP code below:</p>
          <div style="margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
            ${otp}
          </div>
          <p>You can activate your account here: <br>
            <a href="${activateLink}" style="color: #1d4ed8;">${activateLink}</a>
          </p>
          <p style="color: #666; font-size: 14px;">This code will expire in 24 hours.</p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: "User registered successfully. Activation email sent." },
      { status: 201 }
    );
  } catch (err) {
    console.error("Registration Error:", err);
    return NextResponse.json(
      { message: "Server error", error: getErrorMessage(err) },
      { status: 500 }
    );
  }
}