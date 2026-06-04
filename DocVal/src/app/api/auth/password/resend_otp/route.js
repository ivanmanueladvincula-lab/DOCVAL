import { getConnection } from "@/app/api/helper/db";
import sql from "mssql";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { Resend } from "resend";
import ResetOTPEmail from "@/helper/emailTemplates/reset_otp";

export async function POST(request) {
  try {
    const { user_id } = await request.json();

    const pool = await getConnection();

    // get email
    const selectReq = pool.request();
    const selectRes = await selectReq
      .input("userId", sql.UniqueIdentifier, user_id)
      .execute("dbo.getEmail");

    const email = selectRes.recordset[0]?.email;

    // create otp
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // hash otp
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expires_at = new Date();
    expires_at.setMinutes(expires_at.getMinutes() + 10); // otp valid for 10 minutes

    // store otp hash in db
    const storeOtpReq = pool.request();
    await storeOtpReq
      .input("otp", sql.VarChar(255), hashedOtp)
      .input("user_id", sql.UniqueIdentifier, user_id)
      .input("expires_at", sql.DateTime, expires_at)
      .execute("dbo.createOtp");

    // send otp to email
    // kunyari email muna  to

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [email],
      subject: "DocVal Reset Password OTP",
      react: ResetOTPEmail({ otp, expiryTime: `10 minutes` }),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // console.log(`Sending OTP ${otp}`);

    return NextResponse.json(
      {
        message: `OTP succcessfully resent`,
        body: { user_id }, // remove otp in production
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error checking email:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
