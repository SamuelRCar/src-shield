import { describe, expect, it } from "vitest";
import { AuthzError } from "../src/authz.js";
import { ValidationError } from "../src/validate.js";
import { AppError, toPublicError } from "../src/errors.js";

describe("errors (A10 — falhar fechando, sem vazar detalhe interno)", () => {
  it("erro desconhecido vira 500 genérico com id de correlação", () => {
    const interno = new Error("ECONNREFUSED postgres://usuario@10.0.0.5/app");
    const r = toPublicError(interno);
    expect(r.status).toBe(500);
    expect(r.body.error).toBe("Erro interno.");
    expect(r.body.id).toMatch(/^[0-9a-f]{12}$/);
    expect(JSON.stringify(r.body)).not.toContain("postgres");
  });

  it("erros do kit mantêm status e mensagem pública controlada", () => {
    expect(toPublicError(new AuthzError()).status).toBe(403);
    expect(toPublicError(new AuthzError()).body.error).toBe("Acesso negado.");
    expect(toPublicError(new ValidationError(["email"])).status).toBe(400);
    expect(
      toPublicError(new AppError("estoque negativo id=77", { status: 409, publicMessage: "Conflito." }))
        .body.error,
    ).toBe("Conflito.");
  });

  it("registra o detalhe real no log, correlacionado pelo id", () => {
    const registros: Array<{ event: string; data: Record<string, unknown> }> = [];
    const r = toPublicError(new Error("detalhe secreto"), (event, data) => {
      registros.push({ event, data });
    });
    expect(registros).toHaveLength(1);
    expect(registros[0]!.event).toBe("unhandled_error");
    expect(registros[0]!.data.id).toBe(r.body.id);
    expect(JSON.stringify(registros[0]!.data.detail)).toContain("detalhe secreto");
  });

  it("valores não-Error também falham fechando", () => {
    const r = toPublicError("string jogada");
    expect(r.status).toBe(500);
    expect(r.body.error).toBe("Erro interno.");
  });
});
