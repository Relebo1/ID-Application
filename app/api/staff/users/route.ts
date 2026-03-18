import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { dbReady } from "@/lib/dbInit";

export async function GET() {
  await dbReady;
  const [rows] = await pool.query(
    "SELECT id, name, email, role, district, created_at FROM staff ORDER BY created_at ASC"
  ) as any[];
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  await dbReady;
  const body = await req.json();
  const { name, email, password, role, district } = body;
  if (!name || !email || !password || !role || !district) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  const id = `s${Date.now()}`;
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    "INSERT INTO staff (id, name, email, password, role, district) VALUES (?,?,?,?,?,?)",
    [id, name, email, hash, role, district]
  );
  return NextResponse.json({ id, name, email, role, district }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  await dbReady;
  const { id } = await req.json();
  await pool.query("DELETE FROM staff WHERE id = ?", [id]);
  return NextResponse.json({ success: true });
}
