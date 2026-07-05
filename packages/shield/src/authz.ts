/**
 * Autorização por menor privilégio — a defesa contra o risco nº 1 (A01).
 * Verificar em CADA requisição; estar logado não basta. Sempre falha fechando.
 */

export class AuthnError extends Error {
  readonly status = 401;
  readonly publicMessage = "Autenticação necessária.";

  constructor(message = "Usuário não autenticado") {
    super(message);
    this.name = "AuthnError";
  }
}

export class AuthzError extends Error {
  readonly status = 403;
  readonly publicMessage = "Acesso negado.";

  constructor(message = "Acesso negado ao recurso") {
    super(message);
    this.name = "AuthzError";
  }
}

export interface ShieldUser {
  id: string | number;
  roles?: readonly string[];
}

/** Garante usuário autenticado; usar no início de toda rota protegida. */
export function requireUser<T extends ShieldUser>(user: T | null | undefined): T {
  if (!user || user.id === null || user.id === undefined || user.id === "") {
    throw new AuthnError();
  }
  return user;
}

export function requireRole(user: ShieldUser | null | undefined, role: string): void {
  const u = requireUser(user);
  if (!u.roles?.includes(role)) {
    throw new AuthzError(`Papel "${role}" necessário`);
  }
}

/**
 * Garante que o recurso pertence ao usuário (teste cross-usuário do checklist).
 * Recurso sem dono definido é negado — falha fechando.
 * `allowRoles`: papéis que atravessam a checagem (ex.: ["admin"]).
 */
export function requireOwner(
  user: ShieldUser | null | undefined,
  resourceOwnerId: string | number | null | undefined,
  options: { allowRoles?: readonly string[] } = {},
): void {
  const u = requireUser(user);
  if (options.allowRoles?.some((role) => u.roles?.includes(role))) {
    return;
  }
  if (resourceOwnerId === null || resourceOwnerId === undefined || resourceOwnerId === "") {
    throw new AuthzError("Recurso sem dono definido");
  }
  if (String(u.id) !== String(resourceOwnerId)) {
    throw new AuthzError();
  }
}
