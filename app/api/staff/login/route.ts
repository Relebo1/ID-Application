import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { dbReady } from "@/lib/dbInit";

export async function POST(req: NextRequest) {
  await dbReady;
  const { email, password } = await req.json();
  const [rows] = await pool.query("SELECT * FROM staff WHERE email = ?", [email]) as any[];
  const user = (rows as any[])[0];
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role, district: user.district });
}
