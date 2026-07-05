# Receita de borda — Netlify

> Etapa 4 do SRC Shield. Equivalentes Netlify da receita Vercel.
> Fonte de verdade: docs oficiais da Netlify (Environment variables / Security / Rate limiting).

## 1. Segredos

- **Site configuration → Environment variables**: `DATABASE_URL`, `AUTH_SECRET`, `CSRF_SECRET`, `SENTRY_DSN`.
- Usar **Secret values** (write-only) quando disponível no plano.
- Escopo por contexto: **Production / Deploy previews / Branch deploys** com valores diferentes.

## 2. HTTPS e cabeçalhos

- TLS automático (Let's Encrypt) com renovação gerenciada; **Force TLS/HTTPS** deve estar ativo no domínio.
- Os cabeçalhos vêm do template via `next.config.ts` (o runtime Next da Netlify respeita `headers()`).
- Fallback/reforço opcional em `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

(HSTS e CSP ficam só no app para não divergirem em dois lugares.)

## 3. Proteção de borda

1. **DDoS**: mitigação automática na edge da Netlify — nada a configurar.
2. **Firewall Traffic Rules** (planos pagos): bloqueio/challenge por IP, faixa CIDR ou geografia. Criar regra para painéis internos se existirem.
3. **Rate limiting** (planos pagos): regra para `/api/auth/*` (ex.: 20 req/min por IP) e `/api/*` (ex.: 120 req/min).
4. Sem plano pago: os controles do app (`@src/shield`) são a linha de rate limit — registrar a limitação no checklist do projeto, ou colocar **Cloudflare na frente** (receita `cloudflare.md`).

## 4. Higiene de projeto (AT-10)

- **Deploy Previews** protegidos por senha/SSO (Site protections) — não deixar preview público.
- MFA na conta Netlify; membros com papel mínimo.
- Build hooks e tokens com escopo e rotação.
- Formulários Netlify: se não usar, desativar a detecção (reduz superfície de spam).

## 5. Como verificar

| Teste | Esperado |
|---|---|
| `curl -sI http://SEU-DOMINIO` | redirect para `https://` |
| securityheaders.com | **Nota A** |
| Teste de carga leve no próprio endpoint (com aviso) | `429` quando a regra de rate limit dispara |
| Deploy preview aberto em aba anônima | pede senha/login |
