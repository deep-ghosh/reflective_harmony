import { Request, Response } from "express";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

import {
  saveRefreshToken,
  verifyUserCredentials,
  invalidateRefreshToken,
  findUserByRefreshToken,
  getUserByUuid,
  registerUser,
} from "../services/auth.service.js";

import type { user as userType } from "../types/auth.types.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

// LOGIN
async function getLogin(req: Request, res: Response): Promise<void> {
  try {
    const { userId, userPass } = req.body;

    if (!userId || !userPass) {
      res.status(400).json({ error: "userId and userPass are required" });
      return;
    }

    const user: userType | null = await verifyUserCredentials(userId, userPass);

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const accessToken = generateAccessToken(user.uuid);
    const { token: refreshToken, expiresAt } = generateRefreshToken();

    await saveRefreshToken(refreshToken, user.userId, expiresAt);

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        uuid: user.uuid,
        userId: user.userId,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
}

// REGISTER
async function getRegister(req: Request, res: Response): Promise<void> {
  try {
    const { userId, userPass } = req.body;

    if (!userId || !userPass) {
      res.status(400).json({ error: "userId and userPass are required" });
      return;
    }
    const user = await registerUser(userId, userPass);

    if (!user) {
      res.status(409).json({ error: "User already exists" });
      return;
    }

    // Generate tokens for the new user
    const accessToken = generateAccessToken(user.uuid);
    const { token: refreshToken, expiresAt } = generateRefreshToken();

    await saveRefreshToken(refreshToken, user.userId, expiresAt);

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
      user: {
        uuid: user.uuid,
        userId: user.userId,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
}

// REFRESH ACCESS TOKEN
async function getRefresh(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: "refreshToken is required" });
      return;
    }

    const verified = await verifyRefreshToken(refreshToken);

    if (!verified.valid) {
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }

    const user = await findUserByRefreshToken(refreshToken);

    if (!user) {
      res.status(401).json({ error: "Refresh token not recognized" });
      return;
    }

    const accessToken = generateAccessToken(user.uuid);

    res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ error: "Failed to refresh token" });
  }
}

// LOGOUT
async function getLogout(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: "refreshToken is required" });
      return;
    }

    await invalidateRefreshToken(refreshToken);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
}

// ME (uses auth middleware)
async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user || !req.user.uuid) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await getUserByUuid(req.user.uuid);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({
      uuid: user.uuid,
      userId: user.userId,
      email: user.email,
    });
  } catch (error) {
    console.error("Get user info error:", error);
    res.status(500).json({ error: "Failed to get user info" });
  }
}

export { getLogin, getRegister, getRefresh, getLogout, getMe };
