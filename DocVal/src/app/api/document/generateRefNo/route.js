import { NextResponse } from "next/server";
import { getConnection } from "@/app/api/helper/db";
import { authenticateToken } from "@/app/api/helper/authenticateToken";

export async function GET(request) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) return auth.error;

    const pool = await getConnection();

    // Get current year and month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    // Count documents created this month to get next sequence
    const countRes = await pool.request().query(`
      SELECT COUNT(*) as total
      FROM dbo.tbl_file
      WHERE YEAR(date_created) = ${year}
      AND MONTH(date_created) = ${now.getMonth() + 1}
    `);

    const nextSequence = (countRes.recordset[0].total + 1)
      .toString()
      .padStart(4, "0");

    const referenceNo = `REF-${year}-${month}-${nextSequence}`;

    return NextResponse.json({
      message: "Reference number generated successfully",
      body: referenceNo,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 },
    );
  }
}