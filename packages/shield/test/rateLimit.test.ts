import { describe, expect, it } from "vitest";
import { createRateLimiter } from "../src/rateLimit.js";

describe("rateLimit (AT-01 força bruta, AT-11 abuso de API)", () => {
  it("permite até o limite e bloqueia a tentativa seguinte", async () => {
    let t = 1_000;
    const limit = createRateLimiter({ windowMs: 60_000, max: 10, now: () => t });

    for (let i = 0; i < 10; i++) {
      expect((await limit("login:1.2.3.4")).allowed).toBe(true);
    }
    const blocked = await limit("login:1.2.3.4");
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("clientes diferentes têm janelas independentes", async () => {
    let t = 1_000;
    const limit = createRateLimiter({ windowMs: 60_000, max: 2, now: () => t });
    await limit("ip:a");
    await limit("ip:a");
    await limit("ip:a");
    expect((await limit("ip:a")).allowed).toBe(false);
    expect((await limit("ip:b")).allowed).toBe(true);
  });

  it("a janela desliza: passado o período, volta a permitir", async () => {
    let t = 1_000;
    const limit = createRateLimiter({ windowMs: 60_000, max: 3, now: () => t });
    for (let i = 0; i < 4; i++) {
      await limit("k");
    }
    expect((await limit("k")).allowed).toBe(false);

    t = 1_000 + 61_000;
    expect((await limit("k")).allowed).toBe(true);
  });
});
