import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  const conn = await getConnection();
  try {
    const [rows] = email
      ? await conn.query(`
          SELECT a.*,
            JSON_ARRAYAGG(
              IF(d.id IS NOT NULL,
                JSON_OBJECT('name', d.name, 'type', d.type, 'uploadedAt', DATE_FORMAT(d.uploaded_at,'%Y-%m-%d')),
                NULL)
            ) AS documents
          FROM applications a
          LEFT JOIN documents d ON d.application_id = a.id
          WHERE a.email = ?
          GROUP BY a.id
          ORDER BY a.submitted_at DESC
        `, [email.toLowerCase()])
      : await conn.query(`
          SELECT a.*,
            JSON_ARRAYAGG(
              IF(d.id IS NOT NULL,
                JSON_OBJECT('name', d.name, 'type', d.type, 'uploadedAt', DATE_FORMAT(d.uploaded_at,'%Y-%m-%d')),
                NULL)
            ) AS documents
          FROM applications a
          LEFT JOIN documents d ON d.application_id = a.id
          GROUP BY a.id
          ORDER BY a.submitted_at DESC
        `) as any[];

    return NextResponse.json((rows as any[]).map(mapApp));
  } finally {
    await conn.end();
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const conn = await getConnection();
  try {
    const [countRows] = await conn.query("SELECT COUNT(*) as cnt FROM applications") as any[];
    const next = String((countRows as any[])[0].cnt + 1).padStart(4, "0");
    const id = `LS-${new Date().getFullYear()}-${next}`;
    const today = new Date().toISOString().split("T")[0];

    await conn.query(
      `INSERT INTO applications (id,first_name,last_name,dob,gender,district,village,phone,email,id_type,status,notes,submitted_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,'Pending','',?)`,
      [id, body.firstName, body.lastName, body.dob, body.gender, body.district, body.village, body.phone, body.email, body.idType, today]
    );

    if (body.documents?.length) {
      for (const doc of body.documents) {
        await conn.query(
          "INSERT INTO documents (application_id, name, type, uploaded_at) VALUES (?,?,?,?)",
          [id, doc.name, doc.type, doc.uploadedAt ?? today]
        );
      }
    }

    const notifId = `n${Date.now()}`;
    await conn.query(
      "INSERT INTO notifications (id, citizen_email, message, channel, is_read, created_at) VALUES (?,?,?,?,?,?)",
      [notifId, body.email, `Your application ${id} has been received and is now Pending review.`, "portal", 0, today]
    );

    const [appRows] = await conn.query(`
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

    return NextResponse.json(mapApp((appRows as any[])[0]), { status: 201 });
  } finally {
    await conn.end();
  }
}

function mapApp(row: any) {
  const docs = (row.documents ?? []).filter(Boolean);
  return {
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
    assignedOfficer: row.assigned_officer ?? null,
    submittedAt: row.submitted_at instanceof Date ? row.submitted_at.toISOString().split("T")[0] : row.submitted_at,
    documents: docs,
  };
}
