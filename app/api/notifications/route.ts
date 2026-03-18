import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
  const conn = await getConnection();
  try {
    const [rows] = await conn.query(
      "SELECT * FROM notifications WHERE citizen_email = ? ORDER BY created_at DESC",
      [email]
    ) as any[];
    return NextResponse.json((rows as any[]).map(mapNotif));
  } finally {
    await conn.end();
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = `n${Date.now()}`;
  const today = new Date().toISOString().split("T")[0];
  const conn = await getConnection();
  try {
    await conn.query(
      "INSERT INTO notifications (id, citizen_email, message, channel, is_read, created_at) VALUES (?,?,?,?,?,?)",
      [id, body.citizenEmail, body.message, body.channel ?? "portal", 0, today]
    );
    const [rows] = await conn.query("SELECT * FROM notifications WHERE id = ?", [id]) as any[];
    return NextResponse.json(mapNotif((rows as any[])[0]), { status: 201 });
  } finally {
    await conn.end();
  }
}

export async function PATCH(req: NextRequest) {
  const { id } = await req.json();
  const conn = await getConnection();
  try {
    const [existing] = await conn.query("SELECT * FROM notifications WHERE id = ?", [id]) as any[];
    if (!(existing as any[])[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await conn.query("UPDATE notifications SET is_read = 1 WHERE id = ?", [id]);
    const [rows] = await conn.query("SELECT * FROM notifications WHERE id = ?", [id]) as any[];
    return NextResponse.json(mapNotif((rows as any[])[0]));
  } finally {
    await conn.end();
  }
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
