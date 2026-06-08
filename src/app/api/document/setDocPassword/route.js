import { getConnection } from "@/app/api/helper/db";
import sql from "mssql";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    const { file_id, password } = await request.json();

    const hashedPassword = await bcrypt.hash(password, 10);

    const pool = await getConnection();
    await pool.request()
      .input("id", sql.UniqueIdentifier, file_id)
      .input("doc_password", sql.VarChar(255), hashedPassword)
      .execute("dbo.setDocPassword");

    return NextResponse.json({ message: "Password set successfully." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}