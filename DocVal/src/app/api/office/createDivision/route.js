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

    const { name, abrv, office_type, parent_office } = await request.json();

    if (!name || !abrv) {
      return NextResponse.json(
        { message: "name and abrv are required" },
        { status: 400 },
      );
    }

    const pool = await getConnection();
    const sqlReq = pool.request();

    if (parent_office !== "") {
      sqlReq.input("parent_office", sql.UniqueIdentifier, parent_office);
    }

    const sqlRes = await sqlReq
      .input("name", sql.VarChar(255), name)
      .input("abrv", sql.VarChar(50), abrv)
      .input("office_type", sql.VarChar(50), office_type)
      .execute("dbo.createDivision");

    return NextResponse.json(
      {
        message: "Division created successfully",
        body: sqlRes.recordset,
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
