/**
 * Rate limiting com janela deslizante — corta força bruta no login (AT-01)
 * e abuso de API/bots (AT-11).
 *
 * Tentativas acima do limite também contam: quem continua martelando
 * permanece bloqueado até parar (comportamento estilo fail2ban).
 *
 * MemoryStore serve para dev e instância única. Em produção serverless
 * (várias instâncias), implementar RateLimitStore com Redis/Upstash.
 */

export interface RateLimitStore {
  /** Registra uma tentativa e devolve o total na janela + timestamp da mais antiga. */
  hit(key: string, windowMs: number, now: number): Promise<{ count: number; oldest: number }>;
}

export class MemoryStore implements RateLimitStore {
  private hits = new Map<string, number[]>();

  async hit(key: string, windowMs: number, now: number): Promise<{ count: number; oldest: number }> {
    const cutoff = now - windowMs;
    const list = (this.hits.get(key) ?? []).filter((t) => t > cutoff);
    list.push(now);
    this.hits.set(key, list);
    return { count: list.length, oldest: list[0] ?? now };
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Epoch ms em que a janela volta a abrir. */
  resetAt: number;
  /** Valor pronto para o header Retry-After da resposta 429. */
  retryAfterSeconds: number;
}

export interface RateLimitOptions {
  /** Janela em ms (padrão: 60s). */
  windowMs?: number;
  /** Máximo de tentativas por janela (padrão: 10). */
  max?: number;
  store?: RateLimitStore;
  /** Injetável para testes. */
  now?: () => number;
}

export function createRateLimiter(options: RateLimitOptions = {}) {
  const { windowMs = 60_000, max = 10, store = new MemoryStore(), now = Date.now } = options;

  /** `key` identifica o cliente: IP, conta, ou combinação (ex.: `login:${ip}`). */
  return async function limit(key: string): Promise<RateLimitResult> {
    const ts = now();
    const { count, oldest } = await store.hit(key, windowMs, ts);
    const resetAt = oldest + windowMs;
    return {
      allowed: count <= max,
      remaining: Math.max(0, max - count),
      resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((resetAt - ts) / 1000)),
    };
  };
}
