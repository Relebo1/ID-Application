import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { dbReady } from "@/lib/dbInit";

export async function GET(req: NextRequest) {
  await dbReady;
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
  const [rows] = await pool.query(
    "SELECT * FROM notifications WHERE citizen_email = ? ORDER BY created_at DESC",
    [email]
  ) as any[];
  return NextResponse.json((rows as any[]).map(mapNotif));
}

export async function POST(req: NextRequest) {
  await dbReady;
  const body = await req.json();
  const id = `n${Date.now()}`;
  const today = new Date().toISOString().split("T")[0];
  await pool.query(
    "INSERT INTO notifications (id, citizen_email, message, channel, is_read, created_at) VALUES (?,?,?,?,?,?)",
    [id, body.citizenEmail, body.message, body.channel ?? "portal", 0, today]
  );
  const [rows] = await pool.query("SELECT * FROM notifications WHERE id = ?", [id]) as any[];
  return NextResponse.json(mapNotif((rows as any[])[0]), { status: 201 });
}

export async function PATCH(req: NextRequest) {
  await dbReady;
  const { id } = await req.json();
  const [existing] = await pool.query("SELECT * FROM notifications WHERE id = ?", [id]) as any[];
  if (!(existing as any[])[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await pool.query("UPDATE notifications SET is_read = 1 WHERE id = ?", [id]);
  const [rows] = await pool.query("SELECT * FROM notifications WHERE id = ?", [id]) as any[];
  return NextResponse.json(mapNotif((rows as any[])[0]));
}

function mapNotif(row: any) {
  return {
    id: row.id,
    citizenEmail: row.citizen_email,
    message: row.message,
    channel: row.channel,
    read: row.is_read === 1,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString().split("T")[0] : row.created_at,
  };
}
