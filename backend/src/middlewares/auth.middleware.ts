import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JWTPayload } from "../utils/jwt.js";

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];

    // Verify and decode token (throws on failure)
    const decoded = verifyAccessToken(token);

    // Attach decoded user info to request
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
