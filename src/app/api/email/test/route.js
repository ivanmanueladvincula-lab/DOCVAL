import { Resend } from "resend";
import { authenticateToken } from "../../helper/authenticateToken";
import EmailTemplateTest from "@/helper/emailTemplates/test";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) {
      return auth.error;
    }

    const { name } = await request.json();

    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: ["redochavillo@gmail.com"],
      subject: "DocVal Test Email",
      react: EmailTemplateTest({ name: "Red" }),
    });

    if (error) {
      return NextResponse.json(
        { message: "Failed to send email", error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Email sent successfully", data },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
