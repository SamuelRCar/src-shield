import { randomBytes } from "node:crypto";

/**
 * Tratamento de erros "falha fechando" (A10): o usuário recebe mensagem
 * genérica + id de correlação; o detalhe real (stack, caminhos, queries)
 * vai só para o log interno.
 */

export class AppError extends Error {
  readonly status: number;
  readonly publicMessage: string;

  constructor(message: string, options: { status?: number; publicMessage?: string } = {}) {
    super(message);
    this.name = "AppError";
    this.status = options.status ?? 500;
    this.publicMessage = options.publicMessage ?? "Erro interno.";
  }
}

export interface PublicErrorResponse {
  status: number;
  body: { error: string; id: string };
}

interface SafeErrorShape {
  status: number;
  publicMessage: string;
}

// Reconhece por forma (status + publicMessage) os erros do próprio kit:
// AppError, AuthnError, AuthzError, ValidationError
function isSafeError(err: unknown): err is SafeErrorShape {
  return (
    typeof err === "object" &&
    err !== null &&
    typeof (err as SafeErrorShape).status === "number" &&
    typeof (err as SafeErrorShape).publicMessage === "string"
  );
}

/**
 * Converte qualquer erro em resposta pública segura. Passar `log`
 * (ex.: logger.error) para registrar o detalhe, correlacionado pelo `id`.
 */
export function toPublicError(
  err: unknown,
  log?: (event: string, data: Record<string, unknown>) => void,
): PublicErrorResponse {
  const id = randomBytes(6).toString("hex");
  const safe = isSafeError(err);
  const status = safe ? err.status : 500;
  const message = safe ? err.publicMessage : "Erro interno.";
  log?.("unhandled_error", {
    id,
    status,
    detail:
      err instanceof Error
        ? { name: err.name, message: err.message, stack: err.stack }
        : String(err),
  });
  return { status, body: { error: message, id } };
}
