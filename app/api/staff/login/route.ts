import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const conn = await getConnection();
  try {
    const [rows] = await conn.query("SELECT * FROM staff WHERE email = ?", [email]) as any[];
    const user = (rows as any[])[0];
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role, district: user.district });
  } finally {
    await conn.end();
  }
}
