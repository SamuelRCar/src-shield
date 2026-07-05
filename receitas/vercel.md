# Receita de borda — Vercel

> Etapa 4 do SRC Shield. Resolve AT-05 (DDoS), AT-10 (config de nuvem) e A02.
> Fonte de verdade: docs oficiais da Vercel (Security / Firewall / Environment Variables).
> Se o painel mudar de nome, procurar pelos mesmos conceitos.

## 1. Segredos (antes do primeiro deploy)

- **Project → Settings → Environment Variables**: criar `DATABASE_URL`, `AUTH_SECRET`, `CSRF_SECRET` (e depois `SENTRY_DSN`).
- Marcar como **Sensitive** quando disponível (valor não reexibível).
- Separar valores por ambiente: **Production / Preview / Development** — o preview nunca usa o banco de produção.
- Proibido: segredo em `NEXT_PUBLIC_*` (vai para o navegador) ou commitado.

## 2. HTTPS e cabeçalhos

- TLS é automático (certificado emitido/renovado pela Vercel) e HTTP redireciona para HTTPS por padrão — nada a fazer.
- HSTS/CSP/etc. já vêm do template (`nextSecurityHeaders` no `next.config.ts`).

## 3. Firewall / WAF

No painel do projeto, aba **Firewall**:

1. **DDoS mitigation** — automática em todos os planos; conferir que está ativa.
2. **Attack Challenge Mode** — conhecer o botão: liga desafio para TODO tráfego durante um ataque (usar junto com o playbook de incidentes, cenário DDoS).
3. **Custom rules** (planos pagos) — criar no mínimo:
   - *Rate limit de login*: se caminho é `/api/auth/*` → limitar (ex.: 20 req/60s por IP) → ação `Challenge` ou `Deny`. Reforça na borda o login-guard do app.
   - *Rate limit de API*: caminho `/api/*` → ex.: 120 req/60s por IP.
   - Bloqueio por país/ASN se o projeto tiver escopo geográfico claro.
4. **Managed Rulesets (OWASP Core)** — habilitar se o plano incluir.

Plano Hobby: fica a mitigação automática de DDoS + os controles do app (`@src/shield`). Documentar a limitação no checklist do projeto.

## 4. Higiene de projeto (AT-10)

- **Deployment Protection**: previews protegidos (Vercel Authentication) — preview público expõe features não lançadas.
- Membros do time com papel mínimo; MFA obrigatório na conta Vercel.
- Tokens de deploy/integramento com escopo por projeto e expiração.
- Domínios: remover previews `*.vercel.app` do ar quando o domínio final assumir (ou proteger).

## 5. Como verificar (validação da Etapa 4)

| Teste | Esperado |
|---|---|
| `curl -sI http://SEU-DOMINIO` | `301/308` para `https://` |
| securityheaders.com | **Nota A** |
| `npx autocannon -c 20 -d 10 https://SEU-DOMINIO/api/notes` (endpoint próprio, com aviso ao time) | respostas `429`/challenge quando a regra dispara |
| Painel Firewall durante o teste | eventos de rate limit registrados |
| Env vars | nenhuma sensível em `NEXT_PUBLIC_*`; valores de preview ≠ produção |
