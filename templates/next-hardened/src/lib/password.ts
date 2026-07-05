import argon2 from "argon2";

// Parâmetros recomendados pela OWASP Password Storage Cheat Sheet para argon2id.
// Nunca MD5/SHA1, nunca texto puro (A04 / SEGURANCA.md).
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19_456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
} as const;

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false; // hash corrompido/formato inválido → falha fechando
  }
}
