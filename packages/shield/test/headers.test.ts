import { describe, expect, it } from "vitest";
import { nextSecurityHeaders, securityHeaders } from "../src/headers.js";

describe("securityHeaders (A02, AT-03, AT-09)", () => {
  it("inclui os cabeçalhos obrigatórios do checklist baseline", () => {
    const h = securityHeaders();
    expect(h["Strict-Transport-Security"]).toContain("max-age=63072000");
    expect(h["Strict-Transport-Security"]).toContain("includeSubDomains");
    expect(h["X-Content-Type-Options"]).toBe("nosniff");
    expect(h["X-Frame-Options"]).toBe("DENY");
    expect(h["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["Permissions-Policy"]).toContain("camera=()");
    expect(h["Content-Security-Policy"]).toContain("default-src 'self'");
    expect(h["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
    expect(h["Content-Security-Policy"]).toContain("object-src 'none'");
  });

  it("preset ecommerce libera apenas o provedor de pagamento", () => {
    const csp = securityHeaders({ preset: "ecommerce" })["Content-Security-Policy"]!;
    expect(csp).toContain("script-src 'self' https://js.stripe.com");
    expect(csp).toContain("frame-src https://js.stripe.com");
  });

  it("aceita CSP customizada e permite omitir explicitamente", () => {
    expect(securityHeaders({ csp: "default-src 'none'" })["Content-Security-Policy"]).toBe(
      "default-src 'none'",
    );
    expect(securityHeaders({ csp: false })["Content-Security-Policy"]).toBeUndefined();
  });

  it("nextSecurityHeaders devolve o formato do next.config", () => {
    const [rule] = nextSecurityHeaders();
    expect(rule!.source).toBe("/(.*)");
    expect(rule!.headers).toContainEqual({ key: "X-Content-Type-Options", value: "nosniff" });
  });
});
