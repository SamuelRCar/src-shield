/**
 * Logs estruturados (JSON) com redação automática de segredos e PII (A09).
 * Regra do SEGURANCA.md: registrar login, erros e ações sensíveis —
 * nunca dado sensível em texto puro.
 */

const DEFAULT_REDACT_KEYS = [
  "password", "senha", "pass", "passwd",
  "token", "accesstoken", "refreshtoken", "idtoken", "jwt",
  "secret", "apikey", "apisecret", "privatekey",
  "authorization", "cookie", "setcookie", "session",
  "creditcard", "cartao", "cvv", "cvc", "pan",
  "cpf", "cnpj", "rg",
];

const REDACTED = "[REDACTED]";
const MAX_DEPTH = 8;

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Exata para chaves curtas (evita "rg" casar com "organization");
// substring para chaves >= 5 (pega "X-Api-Key", "clientSecret", "sessionId")
function isSensitiveKey(normalized: string, keys: Set<string>): boolean {
  if (keys.has(normalized)) {
    return true;
  }
  for (const k of keys) {
    if (k.length >= 5 && normalized.includes(k)) {
      return true;
    }
  }
  return false;
}

function redact(value: unknown, keys: Set<string>, depth: number, seen: WeakSet<object>): unknown {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  if (depth >= MAX_DEPTH) {
    return "[TRUNCATED]";
  }
  if (seen.has(value)) {
    return "[CIRCULAR]";
  }
  seen.add(value);
  if (Array.isArray(value)) {
    return value.map((v) => redact(v, keys, depth + 1, seen));
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) {
    out[k] = isSensitiveKey(normalizeKey(k), keys) ? REDACTED : redact(v, keys, depth + 1, seen);
  }
  return out;
}

export type LogLevel = "debug" | "info" | "warn" | "error" | "security";

export interface LoggerOptions {
  service: string;
  /** Chaves extras a redigir, além das padrão. */
  redactKeys?: readonly string[];
  /** Destino da linha JSON (padrão: console). Injetável para testes/transporte. */
  sink?: (line: string) => void;
  now?: () => Date;
}

export interface ShieldLogger {
  debug(event: string, data?: Record<string, unknown>): void;
  info(event: string, data?: Record<string, unknown>): void;
  warn(event: string, data?: Record<string, unknown>): void;
  error(event: string, data?: Record<string, unknown>): void;
  /** Eventos de segurança (login, bloqueio, acesso negado) — os que geram alerta (Etapa 5). */
  security(event: string, data?: Record<string, unknown>): void;
}

export function createLogger(options: LoggerOptions): ShieldLogger {
  const {
    service,
    redactKeys = [],
    sink = (line) => console.log(line),
    now = () => new Date(),
  } = options;
  const keys = new Set([...DEFAULT_REDACT_KEYS, ...redactKeys.map(normalizeKey)]);

  const emit = (level: LogLevel, event: string, data?: Record<string, unknown>): void => {
    sink(
      JSON.stringify({
        ts: now().toISOString(),
        level,
        service,
        event,
        ...(data ? { data: redact(data, keys, 0, new WeakSet()) } : {}),
      }),
    );
  };

  return {
    debug: (event, data) => emit("debug", event, data),
    info: (event, data) => emit("info", event, data),
    warn: (event, data) => emit("warn", event, data),
    error: (event, data) => emit("error", event, data),
    security: (event, data) => emit("security", event, data),
  };
}
