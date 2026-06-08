import { getConnection } from "@/app/api/helper/db";
import sql from "mssql";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { file_id } = await request.json();

    const pool = await getConnection();
    await pool.request()
      .input("id", sql.UniqueIdentifier, file_id)
      .execute("dbo.removeDocPassword");

    return NextResponse.json({ message: "Password removed successfully." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}