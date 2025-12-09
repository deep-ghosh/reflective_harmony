import type { driver } from "../types/db.connect";
import { Pool } from "pg";
import { createClient } from "@libsql/client";

let cachedConnection: any = null;

function checkDriver(): driver {
  let driver: driver = { name: null };

  if (process.env.DB_DRIVER === "postgres") {
    driver.name = "postgres";

    if (
      !process.env.DB_HOST ||
      !process.env.DB_PORT ||
      !process.env.DB_USER ||
      !process.env.DB_PASSWORD ||
      !process.env.DB_NAME
    ) {
      throw new Error("Missing PostgreSQL environment variables");
    }
  } else if (process.env.DB_DRIVER === "sqlite") {
    driver.name = "sqlite";
  } else {
    throw new Error("Unsupported or missing DB_DRIVER");
  }

  return driver;
}

export async function connectToDB() {
  try {
    if (cachedConnection) return cachedConnection;

    const driver = checkDriver();

    switch (driver.name) {
      case "postgres": {
        const pool = new Pool({
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT),
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
        });

        cachedConnection = {
          driver: "postgres",
          client: pool,
          query: (text: string, params?: any[]) => pool.query(text, params),
        };

        return cachedConnection;
      }

      case "sqlite": {
        const sqlitePath = process.env.SQLITE_PATH || "database.sqlite";

        const client = createClient({
          url: `file:${sqlitePath}`,
        });

        cachedConnection = {
          driver: "sqlite",
          client: client,
          query: async (sql: string, params?: any[]) => {
            const result = await client.execute({ sql, args: params || [] });
            // Map LibSQL ResultSet to a structure compatible with existing code if needed.
            // Existing code expects an array of rows for query results.
            return result.rows;
          },
          run: async (sql: string, params?: any[]) => {
             return await client.execute({ sql, args: params || [] });
          },
        };

        return cachedConnection;
      }

      default:
        throw new Error("Unknown driver");
    }
  } catch (error) {
    throw error;
  }
}
