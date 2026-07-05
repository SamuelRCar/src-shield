# @src/shield

Controles de segurança padronizados da SRC — o código da **Etapa 2** do SRC Shield.
Cada módulo fecha um ataque da matriz do [PLANO-MESTRE.md](../../PLANO-MESTRE.md).

```bash
npm test        # 31 testes — cada um simula o cenário de ataque correspondente
npm run build   # gera dist/ (ESM + tipos)
```

## Módulos

### `securityHeaders` / `nextSecurityHeaders` — A02, XSS, MitM

```ts
// next.config.ts
import { nextSecurityHeaders } from "@src/shield";

const nextConfig = {
  async headers() {
    return nextSecurityHeaders({ preset: "saas" }); // institucional | saas | ecommerce
  },
};
```

HSTS (2 anos, preload), CSP por preset, `nosniff`, `X-Frame-Options: DENY`,
Referrer-Policy e Permissions-Policy. O preset `ecommerce` já libera só o Stripe.
CSP estrita com nonce é ajuste por projeto (`csp: "..."`).

### `createRateLimiter` — força bruta (AT-01) e abuso de API (AT-11)

```ts
import { createRateLimiter } from "@src/shield";

const loginLimit = createRateLimiter({ windowMs: 60_000, max: 10 });

const r = await loginLimit(`login:${ip}`);
if (!r.allowed) {
  return new Response("Muitas tentativas.", {
    status: 429,
    headers: { "Retry-After": String(r.retryAfterSeconds) },
  });
}
```

Janela deslizante; tentativas bloqueadas também contam (estilo fail2ban).
`MemoryStore` para dev/instância única — produção serverless implementa
`RateLimitStore` com Redis/Upstash.

### `validate` / `parseOrThrow` — injeção e entrada hostil (A05)

```ts
import { z } from "zod";
import { parseOrThrow } from "@src/shield";

const NovoPedido = z.object({ produtoId: z.string().uuid(), qtd: z.number().int().min(1).max(100) });
const body = parseOrThrow(NovoPedido, await req.json()); // lança ValidationError (400)
```

O erro aponta só os **campos** inválidos — nunca ecoa o valor recebido.

### `requireUser` / `requireOwner` / `requireRole` — controle de acesso (A01, risco nº 1)

```ts
import { requireOwner } from "@src/shield";

const user = requireUser(await getSession());        // 401 se não autenticado
const pedido = await db.pedido.findUnique({ where: { id } });
requireOwner(user, pedido?.userId);                   // 403 se for de outro usuário
requireOwner(user, pedido?.userId, { allowRoles: ["admin"] }); // admin atravessa
```

Falha fechando: recurso sem dono definido também é negado.

### `createLogger` — registro sem vazar dados (A09)

```ts
import { createLogger } from "@src/shield";

const log = createLogger({ service: "api" });
log.security("login_falhou", { email, password }); // password sai como [REDACTED]
```

JSON estruturado; redige automaticamente senha/token/cookie/cartão/CPF etc.
(exato para chaves curtas, substring para longas — pega `X-Api-Key`, `clientSecret`).
Nível `security` marca os eventos que geram alerta (Etapa 5).

### `createCsrf` / `secureSessionCookie` — falsificação de requisição (AT-04)

```ts
import { createCsrf } from "@src/shield";

const csrf = createCsrf({ secret: process.env.CSRF_SECRET! }); // >= 32 chars
const token = csrf.issue(sessionId);            // no render do formulário
if (!csrf.verify(sessionId, tokenRecebido)) {   // em toda mutação
  return new Response("Requisição inválida.", { status: 403 });
}
```

HMAC vinculado à sessão, com expiração e comparação em tempo constante.

### `toPublicError` / `AppError` — erros que não vazam (A10)

```ts
import { toPublicError } from "@src/shield";

try { ... } catch (err) {
  const { status, body } = toPublicError(err, log.error); // detalhe só no log
  return Response.json(body, { status });                  // { error, id }
}
```

Erros do kit (401/403/400) mantêm a mensagem pública controlada; o resto vira
500 "Erro interno." com id de correlação para achar o detalhe no log.

## Publicação

O pacote ainda é `private` (consumido via monorepo/git). Decisão de registro
(GitHub Packages exige escopo `@samuelrcar/...`) fica para a Etapa 3.
