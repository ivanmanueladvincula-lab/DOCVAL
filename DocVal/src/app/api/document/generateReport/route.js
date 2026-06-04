import { NextResponse } from "next/server";
import { authenticateToken } from "@/app/api/helper/authenticateToken";
import { generateAIReport } from "./helper/gemini";

/**
 * POST /api/document/generateReport
 * Generates an AI report for a document
 * NOTE: Requires implementation of generateAIReport function
 */
export async function POST(request) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) {
      return auth.error;
    }

    const { base64_data, document_type } = await request.json();

    if (!base64_data) {
      return NextResponse.json(
        { message: "File is required" },
        { status: 400 },
      );
    }

    // TODO: Implement generateAIReport function
    const report = await generateAIReport(base64_data, {
      documentType: document_type,
    });

    return NextResponse.json(
      {
        message: "AI report generated successfully",
        body: report, // Replace with actual report
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error", error: error },
      { status: 500 },
    );
  }
}
