import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { gen_access_JWT } from "@/app/api/helper/generateToken";

/**
 * POST /api/auth/refresh
 * Refreshes an access token using a valid refresh token
 *
 * Request body:
 * {
 *   "refreshToken": "jwt_refresh_token"
 * }
 *
 * Response:
 * {
 *   "access_token": "new_jwt_access_token",
 *   "body": {
 *     "access_token": "new_jwt_access_token"
 *   }
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { message: "Refresh token is required" },
        { status: 401 },
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT secret not configured");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 },
      );
    }

    // Verify and decode the refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, secret);
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid or expired refresh token", error: error.message },
        { status: 403 },
      );
    }

    // Generate new access token with the same user data
    const newAccessToken = gen_access_JWT({
      id: decoded.uid,
      email: decoded.eml,
      role: decoded.rol,
    });

    return NextResponse.json({
      access_token: newAccessToken,
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return NextResponse.json(
      { message: "Error refreshing token", error: error.message },
      { status: 500 },
    );
  }
}
