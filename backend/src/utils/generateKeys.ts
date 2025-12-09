import { existsSync, writeFileSync } from "fs";
import { generateKeyPairSync } from "crypto";
import path from "path";
import { fileURLToPath } from "url";

export function generateKeys() {
  // Recreate __dirname in ESM
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const keysDir = path.join(__dirname, "../../keys");

  const privateKeyPath = path.join(keysDir, "private.key");
  const publicKeyPath = path.join(keysDir, "public.key");

  if (existsSync(privateKeyPath) && existsSync(publicKeyPath)) {
    return;
  }
  console.log("RSA keys not found. Generating new key pair...");
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  writeFileSync(privateKeyPath, privateKey);
  writeFileSync(publicKeyPath, publicKey);

  console.log("Generated successfully. Dont share these keys publicly!");
}
