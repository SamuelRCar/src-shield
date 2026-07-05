import { z } from "zod";

/**
 * Validação de entrada no servidor (A05/A10): rejeita cedo, sem vazar
 * os valores recebidos nem detalhes internos na resposta.
 */

export class ValidationError extends Error {
  readonly status = 400;
  readonly publicMessage = "Dados inválidos.";
  /** Caminhos dos campos inválidos — nunca os valores recebidos. */
  readonly fields: string[];

  constructor(fields: string[]) {
    super(`Entrada inválida nos campos: ${fields.join(", ") || "(raiz)"}`);
    this.name = "ValidationError";
    this.fields = fields;
  }
}

export type Validated<T> = { ok: true; data: T } | { ok: false; error: ValidationError };

export function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): Validated<z.infer<S>> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { ok: true, data: result.data };
  }
  const fields = [...new Set(result.error.issues.map((i) => i.path.join(".") || "(raiz)"))];
  return { ok: false, error: new ValidationError(fields) };
}

export function parseOrThrow<S extends z.ZodTypeAny>(schema: S, data: unknown): z.infer<S> {
  const result = validate(schema, data);
  if (!result.ok) {
    throw result.error;
  }
  return result.data;
}
