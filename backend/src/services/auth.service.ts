import type { user } from "../types/auth.types.js";
import { connectToDB } from "../db/connect.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import crypto from "crypto";

// Mock users for development (fallback if no DB)
const mockUsers = new Map<string, user>();
const refreshTokens = new Map<string, { userId: string; expiresAt: Date }>();

// Seed one user for testing
mockUsers.set("123e4567-e89b-12d3-a456-426614174000", {
  uuid: "123e4567-e89b-12d3-a456-426614174000",
  id: "demoUser",
  userId: "demoUser",
  password: "$2b$10$rZ5xVq8J5vZ5xVq8J5vZ5uKW5xVq8J5vZ5xVq8J5vZ5xVq8J5vZ5x", // "demoPass" hashed
  email: "demo@example.com",
});

// 1) Verify User Credentials
async function verifyUserCredentials(
  userId: string,
  userPass: string
): Promise<user | null> {
  try {
    const db = await connectToDB();

    let result;
    if (db.driver === "postgres") {
      result = await db.query("SELECT * FROM users WHERE username = $1", [
        userId,
      ]);
    } else if (db.driver === "sqlite") {
      result = await db.query("SELECT * FROM users WHERE username = ?", [userId]);
    }

    if (
      !result ||
      (Array.isArray(result.rows)
        ? result.rows.length === 0
        : result.length === 0)
    ) {
      // Fallback to mock users
      const user = Array.from(mockUsers.values()).find(
        (u) => u.userId === userId
      );

      if (!user) return null;

      // For mock users, compare plain text (in production this should never happen)
      const isValid = await comparePassword(userPass, user.password);
      return isValid ? user : null;
    }

    const userData = Array.isArray(result.rows) ? result.rows[0] : result[0];

    // Compare password with hashed password
    const isPasswordValid = await comparePassword(
      userPass,
      userData.password_hash || userData.password
    );

    if (!isPasswordValid) {
      return null;
    }

    // Map database fields to user type
    const user: user = {
      uuid: userData.uuid,
      id: userData.username,
      userId: userData.username,
      password: userData.password_hash || userData.password,
      email: userData.email,
    };

    return user;
  } catch (error) {
    console.error("Error verifying user credentials:", error);

    // Fallback to mock users
    const user = Array.from(mockUsers.values()).find(
      (u) => u.userId === userId
    );

    if (!user) return null;

    const isValid = await comparePassword(userPass, user.password);
    return isValid ? user : null;
  }
}

// 2) Register New User
async function registerUser(
  userId: string,
  userPass: string
): Promise<user | null> {
  try {
    const db = await connectToDB();

    // Check if user already exists
    let existingUser;
    if (db.driver === "postgres") {
      existingUser = await db.query("SELECT * FROM users WHERE username = $1", [
        userId,
      ]);
    } else if (db.driver === "sqlite") {
      existingUser = await db.query("SELECT * FROM users WHERE username = ?", [
        userId,
      ]);
    }

    if (
      existingUser &&
      (Array.isArray(existingUser.rows)
        ? existingUser.rows.length > 0
        : existingUser.length > 0)
    ) {
      return null; // User already exists
    }

    // Hash password
    const hashedPassword = await hashPassword(userPass);
    const uuid = crypto.randomUUID();

    // Insert new user
    if (db.driver === "postgres") {
      await db.query(
        "INSERT INTO users (uuid, username, password_hash) VALUES ($1, $2, $3)",
        [uuid, userId, hashedPassword]
      );
    } else if (db.driver === "sqlite") {
      await db.run(
        "INSERT INTO users (uuid, username, password_hash) VALUES (?, ?, ?)",
        [uuid, userId, hashedPassword]
      );
    }

    const newUser: user = {
      uuid,
      id: userId,
      userId,
      password: hashedPassword,
      createdAt: new Date(),
    };

    return newUser;
  } catch (error) {
    console.error("Error registering user:", error);
    return null;
  }
}

// 3) Save Refresh Token
async function saveRefreshToken(
  token: string,
  userId: string,
  expiresAt: Date
): Promise<void> {
  try {
    const db = await connectToDB();

    // First, get user UUID from userId
    let userResult;
    if (db.driver === "postgres") {
      userResult = await db.query(
        "SELECT uuid FROM users WHERE username = $1",
        [userId]
      );
    } else if (db.driver === "sqlite") {
      userResult = await db.query("SELECT uuid FROM users WHERE username = ?", [
        userId,
      ]);
    }

    if (
      !userResult ||
      (Array.isArray(userResult.rows)
        ? userResult.rows.length === 0
        : userResult.length === 0)
    ) {
      // Fallback to in-memory storage
      refreshTokens.set(token, { userId, expiresAt });
      return;
    }

    const userUuid = Array.isArray(userResult.rows)
      ? userResult.rows[0].uuid
      : userResult[0].uuid;

    // Save refresh token
    if (db.driver === "postgres") {
      await db.query(
        "INSERT INTO refresh_tokens (token, user_uuid, expires_at) VALUES ($1, $2, $3) ON CONFLICT (token) DO UPDATE SET expires_at = $3",
        [token, userUuid, expiresAt]
      );
    } else if (db.driver === "sqlite") {
      await db.run(
        "INSERT OR REPLACE INTO refresh_tokens (token, user_uuid, expires_at) VALUES (?, ?, ?)",
        [token, userUuid, expiresAt.toISOString()]
      );
    }
  } catch (error) {
    console.error("Error saving refresh token:", error);
    // Fallback to in-memory storage
    refreshTokens.set(token, { userId, expiresAt });
  }
}

// 4) Invalidate Refresh Token
async function invalidateRefreshToken(token: string): Promise<void> {
  try {
    const db = await connectToDB();

    if (db.driver === "postgres") {
      await db.query("DELETE FROM refresh_tokens WHERE token = $1", [token]);
    } else if (db.driver === "sqlite") {
      await db.run("DELETE FROM refresh_tokens WHERE token = ?", [token]);
    }
  } catch (error) {
    console.error("Error invalidating refresh token:", error);
    // Fallback to in-memory storage
    refreshTokens.delete(token);
  }
}

// 5) Find user by refresh token
async function findUserByRefreshToken(token: string): Promise<user | null> {
  try {
    const db = await connectToDB();

    let result;
    if (db.driver === "postgres") {
      result = await db.query(
        `SELECT u.* FROM users u
         INNER JOIN refresh_tokens rt ON u.uuid = rt.user_uuid
         WHERE rt.token = $1 AND rt.expires_at > NOW()`,
        [token]
      );
    } else if (db.driver === "sqlite") {
      result = await db.query(
        `SELECT u.* FROM users u
         INNER JOIN refresh_tokens rt ON u.uuid = rt.user_uuid
         WHERE rt.token = ? AND rt.expires_at > datetime('now')`,
        [token]
      );
    }

    if (
      !result ||
      (Array.isArray(result.rows)
        ? result.rows.length === 0
        : result.length === 0)
    ) {
      // Fallback to in-memory storage
      const entry = refreshTokens.get(token);
      if (!entry || entry.expiresAt < new Date()) return null;

      const user = Array.from(mockUsers.values()).find(
        (u) => u.userId === entry.userId
      );
      return user || null;
    }

    const userData = Array.isArray(result.rows) ? result.rows[0] : result[0];

    const user: user = {
      uuid: userData.uuid,
      id: userData.username,
      userId: userData.username,
      password: userData.password_hash || userData.password,
      email: userData.email,
    };

    return user;
  } catch (error) {
    console.error("Error finding user by refresh token:", error);

    // Fallback to in-memory storage
    const entry = refreshTokens.get(token);
    if (!entry || entry.expiresAt < new Date()) return null;

    const user = Array.from(mockUsers.values()).find(
      (u) => u.userId === entry.userId
    );
    return user || null;
  }
}

// 6) Get user by UUID
async function getUserByUuid(uuid: string): Promise<user | null> {
  try {
    const db = await connectToDB();

    let result;
    if (db.driver === "postgres") {
      result = await db.query("SELECT * FROM users WHERE uuid = $1", [uuid]);
    } else if (db.driver === "sqlite") {
      result = await db.query("SELECT * FROM users WHERE uuid = ?", [uuid]);
    }

    if (
      !result ||
      (Array.isArray(result.rows)
        ? result.rows.length === 0
        : result.length === 0)
    ) {
      // Fallback to mock users
      return mockUsers.get(uuid) || null;
    }

    const userData = Array.isArray(result.rows) ? result.rows[0] : result[0];

    const user: user = {
      uuid: userData.uuid,
      id: userData.username,
      userId: userData.username,
      password: userData.password_hash || userData.password,
      email: userData.email,
    };

    return user;
  } catch (error) {
    console.error("Error getting user by UUID:", error);
    // Fallback to mock users
    return mockUsers.get(uuid) || null;
  }
}

// 7) Get refresh token info (used by JWT verification)
async function getRefreshToken(token: string): Promise<{
  user_id: string;
  expires_at: Date;
} | null> {
  try {
    const db = await connectToDB();

    let result;
    if (db.driver === "postgres") {
      result = await db.query(
        "SELECT user_uuid as user_id, expires_at FROM refresh_tokens WHERE token = $1",
        [token]
      );
    } else if (db.driver === "sqlite") {
      result = await db.query(
        "SELECT user_uuid as user_id, expires_at FROM refresh_tokens WHERE token = ?",
        [token]
      );
    }

    if (
      !result ||
      (Array.isArray(result.rows)
        ? result.rows.length === 0
        : result.length === 0)
    ) {
      // Fallback to in-memory storage
      const entry = refreshTokens.get(token);
      if (!entry) return null;

      return {
        user_id: entry.userId,
        expires_at: entry.expiresAt,
      };
    }

    const data = Array.isArray(result.rows) ? result.rows[0] : result[0];

    return {
      user_id: data.user_id,
      expires_at: new Date(data.expires_at),
    };
  } catch (error) {
    console.error("Error getting refresh token:", error);

    // Fallback to in-memory storage
    const entry = refreshTokens.get(token);
    if (!entry) return null;

    return {
      user_id: entry.userId,
      expires_at: entry.expiresAt,
    };
  }
}

export {
  verifyUserCredentials,
  registerUser,
  saveRefreshToken,
  invalidateRefreshToken,
  findUserByRefreshToken,
  getUserByUuid,
  getRefreshToken,
};
