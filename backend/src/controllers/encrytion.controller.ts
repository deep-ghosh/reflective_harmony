import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { generateEncrytionDecrytionKeys } from "../utils/crypto.js";
import { submitDecryptionRequest } from "../services/encrytion.service.js";

export const getEncrytion = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.user.uuid) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const userId = req.user.uuid;

    const { encryptionKey, decryptionKey } = generateEncrytionDecrytionKeys({});

    await submitDecryptionRequest(decryptionKey, userId);

    res.status(200).json({
      encryptionKey: encryptionKey,
      message: "Encryption key generated successfully",
    });
  } catch (error) {
    console.error("Encryption error:", error);
    res.status(500).json({ error: "Failed to generate encryption key" });
  }
};
