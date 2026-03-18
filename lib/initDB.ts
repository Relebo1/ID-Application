import pool from "./db";
import bcrypt from "bcryptjs";

export async function initDB() {
  const conn = await pool.getConnection();
  try {
    // Citizens table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS citizens (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        must_change_password TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Staff table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS staff (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('officer','supervisor','admin','support') NOT NULL,
        district VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Applications table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id VARCHAR(30) PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        dob DATE NOT NULL,
        gender VARCHAR(20) NOT NULL,
        district VARCHAR(100) NOT NULL,
        village VARCHAR(100) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        email VARCHAR(255) NOT NULL,
        id_type VARCHAR(50) NOT NULL,
        status ENUM('Pending','Under Review','Approved','Rejected','Ready for Collection') NOT NULL DEFAULT 'Pending',
        notes TEXT,
        assigned_officer VARCHAR(255),
        submitted_at DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Documents table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        application_id VARCHAR(30) NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        uploaded_at DATE NOT NULL,
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Notifications table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(36) PRIMARY KEY,
        citizen_email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        channel ENUM('portal','email','sms') NOT NULL DEFAULT 'portal',
        is_read TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATE NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Migration: add must_change_password if missing
    const [cols] = await conn.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'citizens' AND COLUMN_NAME = 'must_change_password'"
    ) as any[];
    if ((cols as any[]).length === 0) {
      await conn.query("ALTER TABLE citizens ADD COLUMN must_change_password TINYINT(1) NOT NULL DEFAULT 0");
    }

    // Seed citizens if empty
    const [citizenRows] = await conn.query("SELECT COUNT(*) as cnt FROM citizens") as any[];
    if (citizenRows[0].cnt === 0) {
      const hash = await bcrypt.hash("password123", 10);
      await conn.query(
        "INSERT INTO citizens (id, name, email, password) VALUES (?, ?, ?, ?)",
        ["c1", "Demo Citizen", "citizen@example.com", hash]
      );
    }

    // Seed staff if empty
    const [staffRows] = await conn.query("SELECT COUNT(*) as cnt FROM staff") as any[];
    if (staffRows[0].cnt === 0) {
      const seeds = [
        ["s1", "Nthabiseng Molapo",    "officer@homeaffairs.ls",    "officer123",  "officer",    "Maseru"],
        ["s2", "Retselisitsoe Phiri",  "supervisor@homeaffairs.ls", "super123",    "supervisor", "Maseru"],
        ["s3", "System Administrator", "admin@homeaffairs.ls",      "admin123",    "admin",      "All"],
        ["s4", "Teboho Leseli",        "support@homeaffairs.ls",    "support123",  "support",    "Maseru"],
      ];
      for (const [id, name, email, pw, role, district] of seeds) {
        const hash = await bcrypt.hash(pw, 10);
        await conn.query(
          "INSERT INTO staff (id, name, email, password, role, district) VALUES (?, ?, ?, ?, ?, ?)",
          [id, name, email, hash, role, district]
        );
      }
    }

    // Seed applications if empty
    const [appRows] = await conn.query("SELECT COUNT(*) as cnt FROM applications") as any[];
    if (appRows[0].cnt === 0) {
      const apps = [
        ["LS-2025-0001","Thabo","Mokoena","1990-05-12","Male","Maseru","Ha Thetsane","+26658001234","thabo@example.com","New ID","Under Review","","officer@homeaffairs.ls","2025-06-01"],
        ["LS-2025-0002","Palesa","Letsie","1995-11-20","Female","Leribe","Hlotse","+26658005678","palesa@example.com","Replacement ID","Approved","Ready for collection at Leribe office.",null,"2025-05-28"],
        ["LS-2025-0003","Motlatsi","Nkosi","1988-03-07","Male","Berea","Teyateyaneng","+26658009999","motlatsi@example.com","New ID","Pending","",null,"2025-06-05"],
        ["LS-2025-0004","Lineo","Tau","2000-08-15","Female","Maseru","Mazenod","+26658001111","lineo@example.com","Renewal","Rejected","Proof of residence document is expired. Please resubmit.",null,"2025-05-20"],
      ];
      for (const a of apps) {
        await conn.query(
          "INSERT INTO applications (id,first_name,last_name,dob,gender,district,village,phone,email,id_type,status,notes,assigned_officer,submitted_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
          a
        );
      }

      // Seed documents
      const docs = [
        ["LS-2025-0001","birth_certificate.pdf","birth_certificate","2025-06-01"],
        ["LS-2025-0001","photo.jpg","photo","2025-06-01"],
        ["LS-2025-0002","birth_certificate.pdf","birth_certificate","2025-05-28"],
        ["LS-2025-0002","photo.jpg","photo","2025-05-28"],
        ["LS-2025-0002","proof_of_residence.pdf","proof_of_residence","2025-05-28"],
        ["LS-2025-0003","birth_certificate.pdf","birth_certificate","2025-06-05"],
        ["LS-2025-0004","birth_certificate.pdf","birth_certificate","2025-05-20"],
        ["LS-2025-0004","photo.jpg","photo","2025-05-20"],
        ["LS-2025-0004","proof_of_residence.pdf","proof_of_residence","2025-05-20"],
      ];
      for (const [appId, name, type, uploadedAt] of docs) {
        await conn.query(
          "INSERT INTO documents (application_id, name, type, uploaded_at) VALUES (?,?,?,?)",
          [appId, name, type, uploadedAt]
        );
      }

      // Seed notifications
      await conn.query(
        "INSERT INTO notifications (id, citizen_email, message, channel, is_read, created_at) VALUES (?,?,?,?,?,?)",
        ["n1","palesa@example.com","Your application LS-2025-0002 has been approved. Please collect your ID at the Leribe office.","portal",0,"2025-06-02"]
      );
      await conn.query(
        "INSERT INTO notifications (id, citizen_email, message, channel, is_read, created_at) VALUES (?,?,?,?,?,?)",
        ["n2","lineo@example.com","Your application LS-2025-0004 was rejected. Reason: Proof of residence document is expired. Please resubmit.","portal",0,"2025-05-22"]
      );
    }

    console.log("✅ Database initialised successfully.");
  } finally {
    conn.release();
  }
}
