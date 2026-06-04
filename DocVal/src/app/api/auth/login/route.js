import { NextResponse } from "next/server";
import sql from "mssql";
import bcrypt from "bcrypt";
import { getConnection } from "@/app/api/helper/db";
import {
  gen_access_JWT,
  gen_refresh_JWT,
} from "@/app/api/helper/generateToken";
import { getErrorMessage } from "@/app/api/helper/errorHandler";

/**
 * POST /api/auth/login
 * Authenticates a user and returns tokens
 */
export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    // Fetch user from database
    const pool = await getConnection();
    const dbRequest = pool.request();
    const selectResult = await dbRequest
      .input("email", sql.VarChar(255), email)
      .execute("dbo.vw_userDetails");
    if (selectResult.recordset.length === 0) {
      return NextResponse.json(
        { message: "No user found with this email" },
        { status: 400 },
      );
    }
    const user = selectResult.recordset[0];
    // console.log("User found:", user);

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 400 },
      );
    }

    // Generate tokens
    const refreshToken = gen_refresh_JWT(user);
    const accessToken = gen_access_JWT(user);

    // Respond with user details and tokens
    return NextResponse.json({
      message: "Login successful",
      body: {
        id: user.id,
        f_name: user.f_name,
        m_name: user.m_name,
        l_name: user.l_name,
        full_name: user.full_name,
        email: user.email,
        role: JSON.parse(user.role),
        division_id: user.division_id,
        division: user.division,
        division_abrv: user.division_abrv,
        profile_img: user.profile_img || null,
      },
      refresh_token: refreshToken,
      access_token: accessToken,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error", error: getErrorMessage(err) },
      { status: 500 },
    );
  }
}
