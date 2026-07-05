import { describe, expect, it } from "vitest";
import { createLogger } from "../src/logger.js";

function capture() {
  const lines: string[] = [];
  const logger = createLogger({
    service: "teste",
    sink: (l) => lines.push(l),
    now: () => new Date("2026-07-02T12:00:00Z"),
  });
  return { lines, logger, last: () => JSON.parse(lines.at(-1)!) };
}

describe("logger (A09 — sem PII/segredo em texto puro)", () => {
  it("emite JSON estruturado com ts, level, service e event", () => {
    const { logger, last } = capture();
    logger.info("login_ok", { userId: "u1" });
    const entry = last();
    expect(entry).toMatchObject({
      ts: "2026-07-02T12:00:00.000Z",
      level: "info",
      service: "teste",
      event: "login_ok",
      data: { userId: "u1" },
    });
  });

  it("redige senha, token e cartão — inclusive aninhados e com variações de caixa", () => {
    const { logger, last } = capture();
    logger.security("login_falhou", {
      email: "a@b.com",
      password: "hunter2",
      headers: { Authorization: "Bearer abc123", "X-Api-Key": "k-999" },
      pagamento: { creditCard: "4111111111111111", cvv: "123" },
    });
    const data = last().data;
    expect(data.password).toBe("[REDACTED]");
    expect(data.headers.Authorization).toBe("[REDACTED]");
    expect(data.headers["X-Api-Key"]).toBe("[REDACTED]");
    expect(data.pagamento.creditCard).toBe("[REDACTED]");
    expect(data.pagamento.cvv).toBe("[REDACTED]");
    expect(data.email).toBe("a@b.com");
    expect(JSON.stringify(last())).not.toContain("hunter2");
  });

  it("aceita chaves extras de redação e sobrevive a referência circular", () => {
    const lines: string[] = [];
    const logger = createLogger({ service: "t", redactKeys: ["matricula"], sink: (l) => lines.push(l) });
    const circular: Record<string, unknown> = { matricula: "999", nome: "ana" };
    circular.self = circular;
    logger.warn("evento", { obj: circular });
    const entry = JSON.parse(lines[0]!);
    expect(entry.data.obj.matricula).toBe("[REDACTED]");
    expect(entry.data.obj.self).toBe("[CIRCULAR]");
    expect(entry.data.obj.nome).toBe("ana");
  });

  it("nível security existe para eventos que geram alerta", () => {
    const { logger, last } = capture();
    logger.security("rate_limit_disparado", { ip: "1.2.3.4" });
    expect(last().level).toBe("security");
  });
});
