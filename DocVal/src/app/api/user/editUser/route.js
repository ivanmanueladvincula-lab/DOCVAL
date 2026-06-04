import { authenticateToken } from "../../helper/authenticateToken";
import { getConnection } from "../../helper/db";
import sql from "mssql";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // validate berear
    const auth = await authenticateToken(request);
    if (auth.error) {
      return auth.error;
    }

    const { userId, newFName, newMName, newLName, newEmail, newDiv, newRole } =
      await request.json();

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 },
      );
    }

    const updatedFields = [];

    const pool = await getConnection();
    const updateReq = pool.request();
    updateReq.input("userId", sql.UniqueIdentifier, userId);

    if (newFName?.trim()) {
      updatedFields.push("First Name");
      updateReq.input("newFName", sql.VarChar(255), newFName.trim());
    }
    if (newMName?.trim()) {
      updatedFields.push("Middle Name");
      updateReq.input("newMName", sql.VarChar(255), newMName.trim());
    }
    if (newLName?.trim()) {
      updatedFields.push("Last Name");
      updateReq.input("newLName", sql.VarChar(255), newLName.trim());
    }
    if (newEmail?.trim()) {
      updatedFields.push("Email");
      updateReq.input("newEmail", sql.VarChar(255), newEmail.trim());
    }
    if (newDiv?.trim()) {
      updatedFields.push("Division");
      updateReq.input("newDiv", sql.UniqueIdentifier, newDiv.trim());
    }
    if (newRole) {
      const roleTable = new sql.Table();
      roleTable.columns.add("RoleIdList", sql.UniqueIdentifier);
      (newRole || []).forEach((r) => roleTable.rows.add(r));
      updatedFields.push("Role");
      updateReq.input("newRole", roleTable);
    } else {
      const roleTable = new sql.Table();
      roleTable.columns.add("RoleIdList", sql.UniqueIdentifier);
      updateReq.input("newRole", roleTable);
    }

    // console.log("Executing stored procedure with inputs:", updatedFields);
    const updateRes = await updateReq.execute("dbo.editUser");
    const updatedUser = updateRes.recordset?.[0] || null;

    const message = updatedFields.length
      ? `Updated fields: ${updatedFields.join(", ")}`
      : "No fields were updated";

    return NextResponse.json(
      {
        message,
        body: updatedUser,
        newData: {
          firstName: newFName,
          middleName: newMName,
          lastName: newLName,
          email: newEmail,
          divisionId: newDiv,
          role: newRole,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
