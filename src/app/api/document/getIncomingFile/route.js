import { NextResponse } from "next/server";
import sql from "mssql";
import { getConnection } from "@/app/api/helper/db";
import { authenticateToken } from "@/app/api/helper/authenticateToken";
import { getErrorMessage } from "@/app/api/helper/errorHandler";

export async function GET(request) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) {
      return auth.error;
    }

    const userId = auth.user.uid;
    const pool = await getConnection();
    const selectReq = pool.request();
    const selectRes = await selectReq
      .input("user_id", sql.UniqueIdentifier, userId)
      .execute("dbo.getIncomingFileByUser");

    return NextResponse.json({
      message: "Files retrieved successfully",
      body: selectRes.recordset,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error", error: getErrorMessage(err) },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) {
      return auth.error;
    }

    const body = await request.json();
    const { id, title } = body;

    if (!id || !title || !title.trim()) {
      return NextResponse.json(
        { message: "Document ID and title are required" },
        { status: 400 },
      );
    }

    const pool = await getConnection();
    await pool
      .request()
      .input("id", sql.UniqueIdentifier, id)
      .input("title", sql.VarChar(255), title.trim())
      .query(
        "UPDATE dbo.tbl_file SET title = @title WHERE id = @id",
      );

    return NextResponse.json({
      message: "Title updated successfully",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error", error: getErrorMessage(err) },
      { status: 500 },
    );
  }
}