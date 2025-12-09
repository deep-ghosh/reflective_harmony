from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend
import base64
import io
from PIL import Image
import binascii

def decrypt_image(encrypted_data: bytes, key: str) -> Image.Image:
    """
    Decrypts the encrypted image data using AES-CBC.
    Expects encrypted_data to be IV (16 bytes) + Ciphertext.
    Expects key to be a hex string (32 bytes / 64 hex chars).
    """
    try:
        # Convert hex key to bytes
        try:
            key_bytes = binascii.unhexlify(key)
        except binascii.Error:
            # Fallback if key is somehow raw bytes or other format, but we expect hex from backend
            if len(key) == 32:
                key_bytes = key.encode('utf-8') # Unlikely but safe fallback
            else:
                raise ValueError("Invalid key format. Expected 32-byte hex string.")

        if len(key_bytes) != 32:
             raise ValueError(f"Invalid key length: {len(key_bytes)} bytes. Expected 32 bytes.")

        # Extract IV and Ciphertext
        iv = encrypted_data[:16]
        ciphertext = encrypted_data[16:]

        # Decrypt
        cipher = Cipher(algorithms.AES(key_bytes), modes.CBC(iv), backend=default_backend())
        decryptor = cipher.decryptor()
        padded_data = decryptor.update(ciphertext) + decryptor.finalize()

        # Unpad
        unpadder = padding.PKCS7(128).unpadder()
        data = unpadder.update(padded_data) + unpadder.finalize()
        
        # Parse JSON payload
        import json
        try:
            json_str = data.decode('utf-8')
            payload = json.loads(json_str)
            # Check if it's the expected payload format
            if 'image' in payload:
                image_b64 = payload['image']
                # The image might be raw base64 or data URI
                if ',' in image_b64:
                    image_b64 = image_b64.split(',')[1]
                image_bytes = base64.b64decode(image_b64)
                image = Image.open(io.BytesIO(image_bytes))
                return image
            else:
                # Fallback for backward compatibility or if raw image was sent
                print("Warning: 'image' field not found in payload, attempting to treat as raw image bytes.")
                image = Image.open(io.BytesIO(data))
                return image
        except (json.JSONDecodeError, UnicodeDecodeError):
             # Fallback if not JSON
            print("Warning: Failed to decode as JSON, treating as raw image bytes.")
            image = Image.open(io.BytesIO(data))
            return image
    except Exception as e:
        print(f"Decryption failed: {e}")
        raise e

