import { describe, expect, it } from "vitest";
import { createCsrf, secureSessionCookie } from "../src/csrf.js";

const SECRET = "segredo-de-teste-com-tamanho-suficiente-123456";

describe("csrf (AT-04 — falsificação de requisição)", () => {
  it("token emitido para a sessão verifica com sucesso", () => {
    const csrf = createCsrf({ secret: SECRET });
    const token = csrf.issue("sessao-1");
    expect(csrf.verify("sessao-1", token)).toBe(true);
  });

  it("token de outra sessão é rejeitado", () => {
    const csrf = createCsrf({ secret: SECRET });
    const token = csrf.issue("sessao-1");
    expect(csrf.verify("sessao-2", token)).toBe(false);
  });

  it("token adulterado, malformado ou ausente é rejeitado (falha fechando)", () => {
    const csrf = createCsrf({ secret: SECRET });
    const token = csrf.issue("s");
    expect(csrf.verify("s", token.slice(0, -2) + "xx")).toBe(false);
    expect(csrf.verify("s", "abc")).toBe(false);
    expect(csrf.verify("s", null)).toBe(false);
    expect(csrf.verify("s", undefined)).toBe(false);
    expect(csrf.verify("", token)).toBe(false);
  });

  it("token expirado é rejeitado", () => {
    let t = 1_000;
    const csrf = createCsrf({ secret: SECRET, ttlMs: 1_000, now: () => t });
    const token = csrf.issue("s");
    expect(csrf.verify("s", token)).toBe(true);
    t = 3_000;
    expect(csrf.verify("s", token)).toBe(false);
  });

  it("recusa segredo fraco na construção", () => {
    expect(() => createCsrf({ secret: "curto" })).toThrow();
  });

  it("preset de cookie de sessão é seguro por padrão", () => {
    expect(secureSessionCookie).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
  });
});
