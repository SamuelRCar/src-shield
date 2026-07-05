import { createRateLimiter, type RateLimitOptions, type RateLimitResult } from "@src/shield";

/**
 * Guarda de força bruta do login (AT-01, checklist item 2):
 * 5 tentativas por 15 minutos por par IP+e-mail. Tentativas durante o
 * bloqueio também contam — martelar mantém bloqueado.
 */
export interface LoginGuard {
  check(ip: string, email: string): Promise<RateLimitResult>;
}

export function createLoginGuard(options: RateLimitOptions = {}): LoginGuard {
  const limit = createRateLimiter({ windowMs: 15 * 60_000, max: 5, ...options });
  return {
    check(ip: string, email: string) {
      return limit(`login:${ip}:${email.trim().toLowerCase()}`);
    },
  };
}
