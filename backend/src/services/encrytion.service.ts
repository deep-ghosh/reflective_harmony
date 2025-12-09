import { connectToDB } from "../db/connect.js";
import { grpcClient } from "./grpc.client.js";

export interface DecryptionKeyRecord {
  key: string;
  expiary: string;
  userId: string;
}

export async function submitDecryptionRequest(key: string, userId: string) {
  try {
    const timeout = 10 * 60 * 1000; // 10 minutes in milliseconds
    const db = await connectToDB();

    // pick one:
    const ts = new Date(Date.now() + timeout).toISOString();

    if (db.driver === "postgres") {
      await db.query(
        `INSERT INTO decryptionWindow (key, expiary, userId) VALUES ($1, $2, $3)`,
        [key, ts, userId]
      );
    } else if (db.driver === "sqlite") {
      await db.run(
        `INSERT INTO decryptionWindow (key, expiary, userId) VALUES (?, ?, ?)`,
        [key, ts, userId]
      );
    }

    // Send to gRPC service
    await new Promise((resolve, reject) => {
      grpcClient.SendDecryptionKey({ uid: userId, key: key }, (err: any, response: any) => {
        if (err) {
          console.error("gRPC SendDecryptionKey Error:", err);
          // We might want to throw here if it's critical, or just log it.
          // Given "submitDecryptionRequest", failure to send to the model worker might be critical.
          reject(err);
        } else {
          console.log("gRPC SendDecryptionKey Response:", response);
          resolve(response);
        }
      });
    });
  } catch (err) {
    console.error("Failed to submit decryption request:", err);
  }
}

export async function getDecryptionKey(
  userId: string
): Promise<DecryptionKeyRecord | null> {
  try {
    const db = await connectToDB();

    if (db.driver === "postgres") {
      const result = await db.query(
        `SELECT key, expiary, userId FROM decryptionWindow WHERE userId = $1 ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );
      return result.rows && result.rows.length > 0 ? result.rows[0] : null;
    } else if (db.driver === "sqlite") {
      const result = await db.query(
        `SELECT key, expiary, userId FROM decryptionWindow WHERE userId = ? ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );
      return result && result.length > 0 ? result[0] : null;
    }
    return null;
  } catch (err) {
    console.error("Failed to get decryption key:", err);
    return null;
  }
}
