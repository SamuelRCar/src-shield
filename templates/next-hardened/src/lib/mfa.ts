import { authenticator } from "otplib";

/**
 * MFA por TOTP (AT-01/AT-06): opcional por usuário, obrigatório para admins
 * (política do checklist item 2). Segredo fica em User.mfaSecret; só vale
 * depois de confirmado (mfaEnabled=true).
 */

export function generateMfaSecret(): string {
  return authenticator.generateSecret();
}

export function mfaEnrollUrl(email: string, secret: string, issuer = "SRC"): string {
  return authenticator.keyuri(email, issuer, secret);
}

export function verifyMfaCode(secret: string, code: string | null | undefined): boolean {
  if (!secret || !code) {
    return false; // falha fechando
  }
  try {
    return authenticator.check(code.trim(), secret);
  } catch {
    return false;
  }
}
