import { NextResponse } from "next/server";
import sql from "mssql";
import { getConnection } from "@/app/api/helper/db";
import { authenticateToken } from "@/app/api/helper/authenticateToken";
import { getErrorMessage } from "@/app/api/helper/errorHandler";

export async function POST(request) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) {
      return auth.error;
    }

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { message: "name is required" },
        { status: 400 },
      );
    }

    const pool = await getConnection();
    const insertReq = pool.request();
    const insertRes = await insertReq
      .input("name", sql.VarChar(255), name)
      .execute("dbo.createDocType");

    return NextResponse.json(
      {
        message: "Document type created successfully",
        body: insertRes.recordset,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error", error: getErrorMessage(err) },
      { status: 500 },
    );
  }
}
