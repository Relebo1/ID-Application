import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const conn = await getConnection();
  try {
    const [existing] = await conn.query("SELECT * FROM applications WHERE id = ?", [id]) as any[];
    const app = (existing as any[])[0];
    if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const newStatus = body.status ?? app.status;
    const newNotes  = body.notes !== undefined ? body.notes : app.notes;

    await conn.query(
      "UPDATE applications SET status = ?, notes = ? WHERE id = ?",
      [newStatus, newNotes, id]
    );

    if (body.status && body.status !== app.status) {
      const today = new Date().toISOString().split("T")[0];
      await conn.query(
        "INSERT INTO notifications (id, citizen_email, message, channel, is_read, created_at) VALUES (?,?,?,?,?,?)",
        [
          `n${Date.now()}`,
          app.email,
          `Your application ${id} status has been updated to: ${newStatus}.${newNotes ? " Note: " + newNotes : ""}`,
          "portal", 0, today,
        ]
      );
    }

    const [updated] = await conn.query(`
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
    `, [id]) as any[];

    const row = (updated as any[])[0];
    return NextResponse.json({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      dob: row.dob instanceof Date ? row.dob.toISOString().split("T")[0] : row.dob,
      gender: row.gender,
      district: row.district,
      village: row.village,
      phone: row.phone,
      email: row.email,
      idType: row.id_type,
      status: row.status,
      notes: row.notes ?? "",
      submittedAt: row.submitted_at instanceof Date ? row.submitted_at.toISOString().split("T")[0] : row.submitted_at,
      documents: (row.documents ?? []).filter(Boolean),
    });
  } finally {
    await conn.end();
  }
}
