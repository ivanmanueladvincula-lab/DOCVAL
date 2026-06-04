import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

/**
 * Authenticates a request by validating the Authorization header
 * Works with Next.js API routes
 *
 * @param {Request} request - Next.js request object
 * @returns {Object} { user: decodedToken } on success, or { error: NextResponse } on failure
 */
export async function authenticateToken(request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return {
        error: NextResponse.json(
          { message: "Authorization header missing" },
          { status: 401 },
        ),
      };
    }

    const parts = authHeader.split(/\s+/);
    if (parts.length < 2) {
      return {
        error: NextResponse.json(
          { message: "Malformed Authorization header" },
          { status: 401 },
        ),
      };
    }

    const scheme = parts[0];
    const token = parts.slice(1).join(" ");

    if (!/^Bearer$/i.test(scheme)) {
      return {
        error: NextResponse.json(
          { message: "Authorization scheme must be Bearer" },
          { status: 401 },
        ),
      };
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT secret not configured");
      return {
        error: NextResponse.json(
          { message: "Server configuration error" },
          { status: 500 },
        ),
      };
    }

    return new Promise((resolve) => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          return resolve({
            error: NextResponse.json(
              { message: "Invalid or expired token", error: err.message },
              { status: 403 },
            ),
          });
        }
        resolve({ user: decoded });
      });
    });
  } catch (error) {
    return {
      error: NextResponse.json(
        { message: "Authentication error", error: error.message },
        { status: 500 },
      ),
    };
  }
}
