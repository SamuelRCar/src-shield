import { describe, expect, it } from "vitest";
import { AuthnError, AuthzError, requireOwner, requireRole, requireUser } from "../src/authz.js";

describe("authz (A01 — risco nº 1: quebra de controle de acesso)", () => {
  const alice = { id: "user-1", roles: ["member"] };
  const admin = { id: "user-9", roles: ["admin"] };

  it("teste cross-usuário do checklist: acessar recurso de outro é negado", () => {
    expect(() => requireOwner(alice, "user-2")).toThrow(AuthzError);
  });

  it("dono do recurso passa (inclusive com tipos id diferentes)", () => {
    expect(() => requireOwner(alice, "user-1")).not.toThrow();
    expect(() => requireOwner({ id: 7 }, "7")).not.toThrow();
  });

  it("sem usuário autenticado → 401, não 403", () => {
    expect(() => requireOwner(null, "user-1")).toThrow(AuthnError);
    expect(() => requireUser(undefined)).toThrow(AuthnError);
  });

  it("falha fechando: recurso sem dono definido é negado", () => {
    expect(() => requireOwner(alice, null)).toThrow(AuthzError);
    expect(() => requireOwner(alice, undefined)).toThrow(AuthzError);
  });

  it("papel permite atravessar a checagem de dono (admin)", () => {
    expect(() => requireOwner(admin, "user-2", { allowRoles: ["admin"] })).not.toThrow();
    expect(() => requireOwner(alice, "user-2", { allowRoles: ["admin"] })).toThrow(AuthzError);
  });

  it("requireRole nega quem não tem o papel", () => {
    expect(() => requireRole(admin, "admin")).not.toThrow();
    expect(() => requireRole(alice, "admin")).toThrow(AuthzError);
    expect(() => requireRole({ id: "x" }, "admin")).toThrow(AuthzError);
  });
});
