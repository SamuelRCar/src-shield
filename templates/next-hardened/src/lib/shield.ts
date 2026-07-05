import { createCsrf, createLogger, createRateLimiter, type Csrf } from "@src/shield";
import { createLoginGuard } from "./login-guard";

// Instâncias únicas dos controles do @src/shield usadas pelo app.

// e-mail é dado pessoal — não vai em texto puro no log (A09)
export const log = createLogger({ service: "app", redactKeys: ["email"] });

export const loginGuard = createLoginGuard();

// Limite geral de API por IP — abuso de bots/scraping (AT-11)
export const apiLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });

let csrfInstance: Csrf | undefined;
/** CSRF para formulários próprios (fora do Auth.js, que já tem o seu). */
export function getCsrf(): Csrf {
  if (!csrfInstance) {
    csrfInstance = createCsrf({ secret: requiredEnv("CSRF_SECRET") });
  }
  return csrfInstance;
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}

/** IP do cliente atrás do proxy da hospedagem (Vercel/Cloudflare). */
export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
