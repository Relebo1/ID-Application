import { getConnection } from "./db";
import bcrypt from "bcryptjs";

export async function initDB() {
  const conn = await getConnection();
  try {
    // Seed default staff if empty
    const [staffRows] = await conn.query("SELECT COUNT(*) as cnt FROM staff") as any[];
    if ((staffRows as any[])[0].cnt === 0) {
      const seeds = [
        ["s1", "Nthabiseng Molapo",    "officer@homeaffairs.ls",    "officer123",  "officer",    "Maseru"],
        ["s2", "Retselisitsoe Phiri",  "supervisor@homeaffairs.ls", "super123",    "supervisor", "Maseru"],
        ["s3", "System Administrator", "admin@homeaffairs.ls",      "admin123",    "admin",      "All"],
        ["s4", "Teboho Leseli",        "support@homeaffairs.ls",    "support123",  "support",    "Maseru"],
      ];
      for (const [id, name, email, pw, role, district] of seeds) {
        const hash = await bcrypt.hash(pw, 10);
        await conn.query(
          "INSERT INTO staff (id, name, email, password, role, district) VALUES (?,?,?,?,?,?)",
          [id, name, email, hash, role, district]
        );
      }
      console.log("✅ Default staff seeded.");
    }

    // Seed default citizen if empty
    const [citizenRows] = await conn.query("SELECT COUNT(*) as cnt FROM citizens") as any[];
    if ((citizenRows as any[])[0].cnt === 0) {
      const hash = await bcrypt.hash("password123", 10);
      await conn.query(
        "INSERT INTO citizens (id, name, email, password, must_change_password) VALUES (?,?,?,?,0)",
        ["c1", "Demo Citizen", "citizen@example.com", hash]
      );
      console.log("✅ Default citizen seeded.");
    }
  } finally {
    await conn.end();
  }
}
