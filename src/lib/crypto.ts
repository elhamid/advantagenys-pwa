/**
 * AES-256-GCM field-level encryption for sensitive PII (SSN/ITIN).
 *
 * Format: `enc:v1:<iv-hex>:<authTag-hex>:<ciphertext-hex>`
 *
 * Key: `FIELD_ENCRYPTION_KEY` env var — hex-encoded 32-byte (64 hex chars).
 * If the key is missing, functions degrade gracefully (pass-through + warn).
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12; // GCM recommended
const PREFIX = "enc:v1:";

function getKey(): Buffer | null {
  const hex = process.env.FIELD_ENCRYPTION_KEY;
  if (!hex) {
    console.warn(
      "[crypto] FIELD_ENCRYPTION_KEY not set — field encryption disabled (plaintext pass-through)"
    );
    return null;
  }
  const buf = Buffer.from(hex, "hex");
  if (buf.length !== 32) {
    console.error(
      `[crypto] FIELD_ENCRYPTION_KEY must be 32 bytes (64 hex chars), got ${buf.length} bytes`
    );
    return null;
  }
  return buf;
}

/**
 * Encrypt a plaintext string with AES-256-GCM.
 * Returns `enc:v1:<iv>:<authTag>:<ciphertext>` (all hex).
 * If the encryption key is unavailable, returns the plaintext as-is.
 */
export function encryptField(plaintext: string): string {
  const key = getKey();
  if (!key) return plaintext;

  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypt a value previously encrypted by `encryptField`.
 * If the value doesn't carry the `enc:v1:` prefix, returns it as-is.
 * If the encryption key is unavailable, returns the raw string unchanged.
 */
export function decryptField(encrypted: string): string {
  if (!encrypted.startsWith(PREFIX)) return encrypted;

  const key = getKey();
  if (!key) {
    console.warn("[crypto] Cannot decrypt — FIELD_ENCRYPTION_KEY not set");
    return encrypted;
  }

  const parts = encrypted.slice(PREFIX.length).split(":");
  if (parts.length !== 3) {
    console.error(
      "[crypto] Malformed encrypted value — expected 3 hex segments"
    );
    return encrypted;
  }

  const [ivHex, authTagHex, ciphertextHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
