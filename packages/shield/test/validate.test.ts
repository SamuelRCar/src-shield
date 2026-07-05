import { describe, expect, it } from "vitest";
import { z } from "zod";
import { parseOrThrow, validate, ValidationError } from "../src/validate.js";

const schema = z.object({
  email: z.string().email().max(200),
  quantidade: z.number().int().min(1).max(100),
});

describe("validate (A05/A10 — entrada nunca é confiável)", () => {
  it("aceita entrada válida", () => {
    const r = validate(schema, { email: "a@b.com", quantidade: 2 });
    expect(r.ok).toBe(true);
  });

  it("rejeita tipo/formato errado apontando só os campos", () => {
    const r = validate(schema, { email: "<script>alert(1)</script>", quantidade: 9999 });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.status).toBe(400);
      expect(r.error.fields).toEqual(["email", "quantidade"]);
    }
  });

  it("não vaza o valor recebido na mensagem de erro", () => {
    const payloadMalicioso = "'; DROP TABLE users; --";
    const r = validate(schema, { email: payloadMalicioso, quantidade: 1 });
    if (!r.ok) {
      expect(r.error.message).not.toContain(payloadMalicioso);
      expect(r.error.publicMessage).toBe("Dados inválidos.");
    }
    expect(r.ok).toBe(false);
  });

  it("parseOrThrow lança ValidationError", () => {
    expect(() => parseOrThrow(schema, {})).toThrow(ValidationError);
  });
});
