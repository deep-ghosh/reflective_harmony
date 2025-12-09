import crypto from "crypto";

type KeyFormat = BufferEncoding; // "hex" | "base64" | "utf8" | etc.

interface KeyOptions {
  size?: number; // bytes
  format?: KeyFormat; // valid buffer encoding
}

export function generateEncrytionDecrytionKeys({
  size = 32,
  format = "hex",
}: KeyOptions = {}) {
  const key = crypto.randomBytes(size).toString(format);

  return {
    encryptionKey: key,
    decryptionKey: key,
  };
}
