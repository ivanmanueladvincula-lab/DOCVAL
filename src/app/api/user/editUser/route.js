import { NextResponse } from "next/server";
import sql from "mssql";
import { getConnection } from "@/app/api/helper/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, newFName, newMName, newLName, newEmail, newDiv, newRole } = body;

    const pool = await getConnection();
    const req = pool.request();

    req.input("userId", sql.UniqueIdentifier, userId);
    if (newFName) req.input("newFName", sql.VarChar, newFName);
    if (newMName) req.input("newMName", sql.VarChar, newMName);
    if (newLName) req.input("newLName", sql.VarChar, newLName);
    if (newEmail) req.input("newEmail", sql.VarChar, newEmail);
    if (newDiv) req.input("newDiv", sql.UniqueIdentifier, newDiv);

    // ✅ THE FIX: Create a proper SQL Table object for the RoleIdList
    const tvp = new sql.Table("dbo.RoleIdList");
    tvp.columns.add("role_id", sql.UniqueIdentifier);
    
    // Add each selected role to the table rows
    if (newRole && Array.isArray(newRole)) {
        newRole.forEach(id => tvp.rows.add(id));
    }
    
    // Pass the formatted table to the stored procedure
    req.input("newRole", tvp);

    const result = await req.execute("dbo.editUser");

    return NextResponse.json({ 
        message: "User updated successfully", 
        body: result.recordset[0] 
    });
  } catch (error) {
    console.error("Edit User Error:", error);
    return NextResponse.json({ 
        message: "Server error", 
        error: error.message 
    }, { status: 500 });
  }
}