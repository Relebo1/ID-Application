import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  const conn = await getConnection();
  try {
    const [rows] = await conn.query(
      "SELECT id, name, email, role, district, created_at FROM staff ORDER BY created_at ASC"
    ) as any[];
    return NextResponse.json(rows);
  } finally {
    await conn.end();
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, password, role, district } = body;
  if (!name || !email || !password || !role || !district) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  const conn = await getConnection();
  try {
    const id = `s${Date.now()}`;
    const hash = await bcrypt.hash(password, 10);
    await conn.query(
      "INSERT INTO staff (id, name, email, password, role, district) VALUES (?,?,?,?,?,?)",
      [id, name, email, hash, role, district]
    );
    return NextResponse.json({ id, name, email, role, district }, { status: 201 });
  } finally {
    await conn.end();
  }
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const conn = await getConnection();
  try {
    await conn.query("DELETE FROM staff WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } finally {
    await conn.end();
  }
}
