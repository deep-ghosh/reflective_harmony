import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { sendEncrytedData } from "../services/submit.service.js";

export const getSubmit = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { encryptedData } = req.body;

    if (!encryptedData) {
      res.status(400).json({ error: "encryptedData is required" });
      return;
    }

    if (!req.user || !req.user.uuid) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const userId = req.user.uuid;

    // Add job to queue with encrypted data and decryption key
    await sendEncrytedData({
      userId,
      encryptedData
    });

    res.status(202).json({
      message: "Request queued successfully"
    });
  } catch (error) {
    console.error("Submit error:", error);
    res.status(500).json({ error: "Failed to queue request" });
  }
};
