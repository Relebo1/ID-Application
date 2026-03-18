import { initDB } from "./initDB";

const globalForDB = global as typeof global & { dbReady?: Promise<void> };

if (!globalForDB.dbReady) {
  globalForDB.dbReady = initDB().catch((err) => {
    console.error("DB init failed:", err);
  });
}

export const dbReady = globalForDB.dbReady!;
