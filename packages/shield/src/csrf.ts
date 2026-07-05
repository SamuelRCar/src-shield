import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Proteção CSRF (AT-04): token HMAC vinculado à sessão, com expiração.
 * Emitir no render do formulário, verificar em toda mutação (POST/PUT/DELETE).
 * Complementa (não substitui) cookies SameSite — defesa em profundidade.
 */

export interface CsrfOptions {
  /** Segredo do servidor, mínimo 32 caracteres — vem de variável de ambiente. */
  secret: string;
  /** Validade do token (padrão: 4h). */
  ttlMs?: number;
  /** Injetável para testes. */
  now?: () => number;
}

export interface Csrf {
  issue(sessionId: string): string;
  verify(sessionId: string, token: string | null | undefined): boolean;
}

function sign(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createCsrf(options: CsrfOptions): Csrf {
  const { secret, ttlMs = 4 * 60 * 60 * 1000, now = Date.now } = options;
  if (typeof secret !== "string" || secret.length < 32) {
    throw new Error("CSRF: secret precisa ter ao menos 32 caracteres (usar variável de ambiente)");
  }

  return {
    issue(sessionId: string): string {
      const expiresAt = now() + ttlMs;
      const nonce = randomBytes(16).toString("base64url");
      const mac = sign(secret, `${sessionId}.${expiresAt}.${nonce}`);
      return `${expiresAt}.${nonce}.${mac}`;
    },

    // Falha fechando: ausente, malformado, expirado, adulterado ou de outra sessão → inválido
    verify(sessionId: string, token: string | null | undefined): boolean {
      if (!sessionId || !token) {
        return false;
      }
      const parts = token.split(".");
      if (parts.length !== 3) {
        return false;
      }
      const [expiresRaw, nonce, mac] = parts as [string, string, string];
      const expiresAt = Number(expiresRaw);
      if (!Number.isFinite(expiresAt) || expiresAt < now()) {
        return false;
      }
      const expected = sign(secret, `${sessionId}.${expiresAt}.${nonce}`);
      const a = Buffer.from(mac);
      const b = Buffer.from(expected);
      return a.length === b.length && timingSafeEqual(a, b);
    },
  };
}

/** Preset de cookie de sessão seguro (A02/A04/AT-04). */
export const secureSessionCookie = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
} as const;
