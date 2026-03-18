import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, currentPassword, newPassword } = await req.json();

  if (!email || !currentPassword || !newPassword) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }

  const conn = await getConnection();
  try {
    const [rows] = await conn.query("SELECT * FROM citizens WHERE email = ?", [email]) as any[];
    const user = (rows as any[])[0];
    if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });

    const hash = await bcrypt.hash(newPassword, 10);
    await conn.query(
      "UPDATE citizens SET password = ?, must_change_password = 0 WHERE email = ?",
      [hash, email]
    );

    return NextResponse.json({ message: "Password changed successfully." });
  } finally {
    await conn.end();
  }
}
