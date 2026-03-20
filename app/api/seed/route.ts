import { NextResponse } from "next/server";
import { initDB } from "@/lib/initDB";

export async function GET() {
  try {
    await initDB();
    return NextResponse.json({ message: "Database seeded successfully." });
  } catch (err: any) {
    console.error("Seed error:", err);
    return NextResponse.json({ error: err?.message ?? "Seed failed." }, { status: 500 });
  }
}
