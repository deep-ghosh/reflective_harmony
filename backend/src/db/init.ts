import { connectToDB } from "./connect.js";
import fs from "fs";
import path from "path";

/**
 * Initialize database tables by running SQL schema files
 */
export async function initializeDatabase(): Promise<void> {
  try {
    const db = await connectToDB();

    console.log("Initializing database...");

    // Read SQL schema files
    const userSchema = fs.readFileSync(
      path.join(process.cwd(), "src", "schemas", "user.sql"),
      "utf8"
    );

    const refreshTokenSchema = fs.readFileSync(
      path.join(process.cwd(), "src", "schemas", "refresh-token.sql"),
      "utf8"
    );

    const decryptionWindowSchema = fs.readFileSync(
      path.join(process.cwd(), "src", "schemas", "decryption-window.sql"),
      "utf8"
    );

    // Execute schema creation
    if (db.driver === "postgres") {
      await db.query(userSchema);
      console.log("✓ Users table created/verified");

      await db.query(refreshTokenSchema);
      console.log("✓ Refresh tokens table created/verified");

      await db.query(decryptionWindowSchema);
      console.log("✓ Decryption window table created/verified");
    } else if (db.driver === "sqlite") {
      // Split by semicolon for multiple statements
      const userStatements = userSchema
        .split(";")
        .filter((stmt) => stmt.trim().length > 0);

      for (const stmt of userStatements) {
        await db.run(stmt);
      }
      console.log("✓ Users table created/verified");

      const refreshTokenStatements = refreshTokenSchema
        .split(";")
        .filter((stmt) => stmt.trim().length > 0);

      for (const stmt of refreshTokenStatements) {
        await db.run(stmt);
      }
      console.log("✓ Refresh tokens table created/verified");

      const decryptionWindowStatements = decryptionWindowSchema
        .split(";")
        .filter((stmt) => stmt.trim().length > 0);

      for (const stmt of decryptionWindowStatements) {
        await db.run(stmt);
      }
      console.log("✓ Decryption window table created/verified");
    }

    console.log("Database initialization completed successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

