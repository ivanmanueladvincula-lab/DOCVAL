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

    const { divId, newName, newAbrv } = await request.json();

    if (!divId) {
      return NextResponse.json(
        { message: "Please supply missing fields" },
        { status: 400 },
      );
    }

    if (!newName?.trim() && !newAbrv?.trim()) {
      return NextResponse.json(
        {
          message: "At least a new name or new abbreviation is required",
        },
        { status: 400 },
      );
    }

    const pool = await getConnection();
    const updateReq = pool.request();
    updateReq.input("divisionId", sql.UniqueIdentifier, divId);

    if (newName?.trim()) {
      updateReq.input("newName", sql.VarChar(255), newName.trim());
    }
    if (newAbrv?.trim()) {
      updateReq.input("newAbrv", sql.VarChar(255), newAbrv.trim());
    }

    const updateRes = await updateReq.execute("dbo.editDivision");
    const updatedDivision = updateRes.recordset?.[0] || null;

    return NextResponse.json(
      {
        message: "Division updated successfully",
        body: updatedDivision,
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
