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

    const { docTypeId } = await request.json();

    if (!docTypeId) {
      return NextResponse.json(
        { message: "Document type ID is required" },
        { status: 400 },
      );
    }

    const pool = await getConnection();
    const deleteReq = pool.request();
    const deleteRes = await deleteReq
      .input("docTypeId", sql.UniqueIdentifier, docTypeId)
      .execute("dbo.deleteDocType");

    return NextResponse.json({
      message: "Document type deleted successfully",
      body: deleteRes.recordset,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error", error: getErrorMessage(err) },
      { status: 500 },
    );
  }
}
