import { NextResponse } from "next/server";
import sql from "mssql";
import bcrypt from "bcrypt";
import { getConnection } from "@/app/api/helper/db";
import { Resend } from "resend";
import ActivateAccountEmail from "@/helper/emailTemplates/active_account";
import { getErrorMessage } from "@/app/api/helper/errorHandler";

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

    if (selectRes.recordset.length > 0) {
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
    (role || []).forEach((r) => roleTable.rows.add(r));

    // Register user with Pending status, division = NULL
    const insertRes = await pool.request()
      .input("f_name", sql.VarChar(100), f_name || "")
      .input("m_name", sql.VarChar(100), m_name || "")
      .input("l_name", sql.VarChar(100), l_name || "")
      .input("email", sql.VarChar(255), email)
      .input("password", sql.VarChar(255), placeholderPassword)
      .input("role", roleTable)
      .input("division", sql.UniqueIdentifier, null) // ✅ always NULL on register
      .execute("dbo.registerUser");

    const user_id = insertRes.recordset[0]?.id;

    // Store OTP (expires in 24 hours)
    const expires_at = new Date();
    expires_at.setHours(expires_at.getHours() + 24);

    await pool.request()
      .input("otp", sql.VarChar(255), hashedOtp)
      .input("user_id", sql.UniqueIdentifier, user_id)
      .input("expires_at", sql.DateTime, expires_at)
      .execute("dbo.createOtp");

    // Send activation email
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [email],
      subject: "DocVal Account Activation",
      react: ActivateAccountEmail({
        name: `${f_name} ${l_name}`,
        otp,
        email: email,
        activateLink: `http://localhost:3000/auth/activate?email=${encodeURIComponent(email)}&otp=${otp}`,
        expiryTime: "24 hours",
      }),
    });

    if (error) {
      return NextResponse.json(
        { message: "User created, but failed to send email" },
        { status: 210 }
      );
    }

    return NextResponse.json(
      { message: "User registered successfully. Activation email sent.", body: insertRes.recordset },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error", error: getErrorMessage(err) },
      { status: 500 }
    );
  }
}