import { NextResponse } from "next/server";
import sql from "mssql";
import { getConnection } from "@/app/api/helper/db";
import { authenticateToken } from "@/app/api/helper/authenticateToken";

export async function POST(request) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) {
      return auth.error;
    }

    const { name, abrv, office_type, parent_office } = await request.json();

    if (!name || !abrv) {
      return NextResponse.json(
        { message: "Name and abbreviation are required" },
        { status: 400 },
      );
    }

    const pool = await getConnection();
    const sqlReq = pool.request();

    // 1. Safely add standard inputs (Defaulting to 'internal' if omitted)
    sqlReq.input("name", sql.VarChar(255), name);
    sqlReq.input("abrv", sql.VarChar(50), abrv);
    sqlReq.input("office_type", sql.VarChar(50), office_type || "internal");

    // 2. Handle empty parent_offices perfectly by forcing them to NULL
    if (parent_office && parent_office.trim() !== "") {
      sqlReq.input("parent_office", sql.UniqueIdentifier, parent_office);
    } else {
      sqlReq.input("parent_office", sql.UniqueIdentifier, null);
    }

    // 3. THE FIX: Use a direct query with OUTPUT instead of a stored procedure
    const sqlRes = await sqlReq.query(`
      INSERT INTO tbl_office (name, abrv, office_type, parent_office)
      OUTPUT 
        inserted.id, 
        inserted.name as division_name, 
        inserted.abrv as division_abrv, 
        inserted.office_type as office_type, 
        inserted.parent_office as parent_id
      VALUES (@name, @abrv, @office_type, @parent_office);
    `);

    return NextResponse.json(
      {
        message: "Division created successfully",
        body: sqlRes.recordset,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Create Division Error:", err);
    
    // 4. Safe Error Handling: Catch duplicate names cleanly
    if (err.message && err.message.includes("Violation of UNIQUE KEY constraint")) {
        return NextResponse.json(
            { message: "An office or division with this exact name already exists." },
            { status: 409 }
        );
    }

    return NextResponse.json(
      { message: "Server error", error: err?.message || "Unknown error" },
      { status: 500 },
    );
  }
}