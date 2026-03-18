import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { dbReady } from "@/lib/dbInit";

export async function GET(req: NextRequest) {
  await dbReady;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Application ID required" }, { status: 400 });

  const [rows] = await pool.query(`
    SELECT a.*,
      JSON_ARRAYAGG(
        IF(d.id IS NOT NULL,
          JSON_OBJECT('name', d.name, 'type', d.type, 'uploadedAt', DATE_FORMAT(d.uploaded_at,'%Y-%m-%d')),
          NULL)
      ) AS documents
    FROM applications a
    LEFT JOIN documents d ON d.application_id = a.id
    WHERE a.id = ?
    GROUP BY a.id
  `, [id.toUpperCase()]) as any[];

  const app = (rows as any[])[0];
  if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  return NextResponse.json({
    id: app.id,
    firstName: app.first_name,
    lastName: app.last_name,
    dob: app.dob instanceof Date ? app.dob.toISOString().split("T")[0] : app.dob,
    gender: app.gender,
    district: app.district,
    village: app.village,
    phone: app.phone,
    email: app.email,
    idType: app.id_type,
    status: app.status,
    notes: app.notes ?? "",
    submittedAt: app.submitted_at instanceof Date ? app.submitted_at.toISOString().split("T")[0] : app.submitted_at,
    documents: (app.documents ?? []).filter(Boolean),
  });
}
