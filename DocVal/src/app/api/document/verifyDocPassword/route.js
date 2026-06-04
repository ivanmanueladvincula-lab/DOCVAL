import { getConnection } from "@/app/api/helper/db";
import sql from "mssql";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    const { file_id, password } = await request.json();

    const pool = await getConnection();
    const result = await pool.request()
      .input("id", sql.UniqueIdentifier, file_id)
      .execute("dbo.getDocPassword");

    const file = result.recordset[0];

    if (!file || !file.doc_password) {
      return NextResponse.json({ verified: true, message: "No password set." }, { status: 200 });
    }

    const match = await bcrypt.compare(password, file.doc_password);

    if (!match) {
      return NextResponse.json({ verified: false, message: "Incorrect password." }, { status: 401 });
    }

    return NextResponse.json({ verified: true, message: "Password verified." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}