import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendCredentialsEmail } from "@/lib/mailer";

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pw = "";
  for (let i = 0; i < 8; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

export async function POST(req: NextRequest) {
  const { name, email } = await req.json();

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  let conn: any;
  try {
    conn = await getConnection();

    const [existing] = await conn.query("SELECT id FROM citizens WHERE email = ?", [email]) as any[];
    if ((existing as any[]).length > 0) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const tempPassword = generateTempPassword();
    const hash = await bcrypt.hash(tempPassword, 10);
    const id = `c${Date.now()}`;

    await conn.query(
      "INSERT INTO citizens (id, name, email, password, must_change_password) VALUES (?,?,?,?,1)",
      [id, name.trim(), email.trim().toLowerCase(), hash]
    );

    const previewUrl = await sendCredentialsEmail(email.trim(), name.trim(), tempPassword);

    return NextResponse.json({
      message: "Account created. Check your email for login credentials.",
      ...(process.env.NODE_ENV !== "production" && { previewUrl, tempPassword }),
    }, { status: 201 });

  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json({
      error: err?.message ?? "Internal server error",
      code: err?.code ?? null,
    }, { status: 500 });
  } finally {
    if (conn) await conn.end();
  }
}
