import { NextResponse } from "next/server";
import { getConnection } from "../helper/db";
import { authenticateToken } from "../helper/authenticateToken";

export async function GET(request) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) {
      return auth.error;
    }

    return NextResponse.json({
      message: "GET request received successfully",
      data: auth,
    });
  } catch (error) {
    console.error("Error handling GET request:", error);
    return NextResponse.json(
      {
        message: "Error processing request",
        error: error.message,
        status: "error",
      },
      { status: 500 },
    );
  }
}

/**
 * Protected endpoint that requires Bearer token
 * Test with: Authorization: Bearer <your_jwt_token>
 */
export async function POST(request) {
  // Authenticate first
  const auth = await authenticateToken(request);

  // If authentication fails, return error response
  if (auth.error) {
    return auth.error;
  }

  try {
    const payload = await request.json();
    const user = auth.user;

    return NextResponse.json({
      message: "Protected endpoint accessed successfully",
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
      receivedData: payload,
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error processing request",
        error: error.message,
        status: "error",
      },
      { status: 500 },
    );
  }
}
