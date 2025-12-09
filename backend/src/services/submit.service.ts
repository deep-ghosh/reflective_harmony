import { grpcClient } from "./grpc.client.js";

export async function sendEncrytedData(
   { userId, encryptedData }: { userId: string, encryptedData: string }
) {
  return new Promise((resolve, reject) => {
    // Assuming encryptedData is a string that needs to be sent as bytes.
    // If it's base64, Buffer.from(encryptedData, 'base64') would be better,
    // but without knowing the format, Buffer.from(encryptedData) is a safe default for string-to-bytes.
    // encryptedData is a Base64 string from the client (CryptoJS.toString() returns Base64).
    // We must decode it to get the raw ciphertext bytes.
    const imageBuffer = Buffer.from(encryptedData, 'base64'); 

    grpcClient.SendEncryptedImage({ uid: userId, encrypted_image: imageBuffer }, (err: any, response: any) => {
      if (err) {
        console.error("gRPC SendEncryptedImage Error:", err);
        reject(err);
      } else {
        console.log("gRPC SendEncryptedImage Response:", response);
        resolve(response);
      }
    });
  });
}
