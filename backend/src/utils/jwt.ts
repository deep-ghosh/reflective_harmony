import jwt from "jsonwebtoken";
import crypto from "crypto";
import fs from "fs";
import path from "path";

import { getRefreshToken } from "../services/auth.service.js";
import { fileURLToPath } from "url";

//
// PATH SETUP
//
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keysDir = path.join(__dirname, "../../keys");

//
// SAFE LOAD FUNCTIONS (NO TOP-LEVEL READS)
//
const loadPrivateKey = () => {
  return fs.readFileSync(path.join(keysDir, "private.key"), "utf8");
};

const loadPublicKey = () => {
  return fs.readFileSync(path.join(keysDir, "public.key"), "utf8");
};

//
// TOKEN LIFETIMES
//
const ACCESS_TOKEN_EXP = "10m";
const REFRESH_TOKEN_EXP_DAYS = 14;

//
// PAYLOAD TYPE
//
export interface JWTPayload {
  sub: string;
  uuid: string;
  jti: string;
  iat?: number;
  exp?: number;
}

//
// ACCESS TOKEN GENERATION
//
export const generateAccessToken = (UUID: string): string => {
  const jti = crypto.randomUUID();

  const payload: JWTPayload = {
    sub: UUID,
    uuid: UUID,
    jti,
  };

  return jwt.sign(payload, loadPrivateKey(), {
    algorithm: "RS256",
    expiresIn: ACCESS_TOKEN_EXP,
  });
};

//
// ACCESS TOKEN VERIFICATION
//
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, loadPublicKey(), {
      algorithms: ["RS256"],
    }) as JWTPayload;
  } catch (err) {
    throw new Error("Invalid or expired access token");
  }
};

//
// REFRESH TOKEN GENERATION
//
export const generateRefreshToken = (): {
  token: string;
  expiresAt: Date;
} => {
  const token = crypto.randomBytes(64).toString("hex");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXP_DAYS);

  return { token, expiresAt };
};

//
// REFRESH TOKEN VERIFICATION
//
export const verifyRefreshToken = async (
  token: string
): Promise<{ valid: boolean; userId?: string }> => {
  try {
    const record = await getRefreshToken(token);

    if (!record) return { valid: false };

    const expiresAt = new Date(record.expires_at);
    if (expiresAt < new Date()) return { valid: false };

    return { valid: true, userId: record.user_id };
  } catch (error) {
    return { valid: false };
  }
};
