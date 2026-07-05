# Receita de borda — Cloudflare (na frente de qualquer host)

> Etapa 4 do SRC Shield. A Cloudflare entra NA FRENTE de qualquer hospedagem
> (Vercel, Netlify, VPS) quando o plano da hospedagem não cobre WAF/rate limit,
> ou quando o projeto precisa de bot management e regras mais finas.
> Fonte de verdade: docs oficiais da Cloudflare (SSL/TLS, WAF, Rate limiting, Bots).

## 1. Ligar o domínio

1. Adicionar o site na Cloudflare e apontar os nameservers do registrador para os da CF.
2. Registros DNS do site com **proxy ativado** (nuvem laranja) — registro cinza = sem proteção.
3. **DNSSEC** ativado no painel DNS + registrador.

## 2. TLS correto (AT-09 — o erro mais comum)

- **SSL/TLS → Overview**: modo **Full (Strict)** — SEMPRE.
  - `Flexible` é proibido: a perna Cloudflare→origem fica sem criptografia (exatamente o MitM que queremos matar).
- **Edge Certificates**: *Always Use HTTPS* ativado; *Minimum TLS Version* = 1.2.
- HSTS já vem do app — não duplicar na CF (duas fontes divergem com o tempo).

## 3. WAF e rate limiting

**Security → WAF**:

1. **Managed rules**: ativar o *Cloudflare Free Managed Ruleset* (free) ou o *OWASP Core Ruleset* (Pro+) em modo `Managed Challenge` primeiro; subir para `Block` após uma semana sem falso positivo.
2. **Rate limiting rules** (1 regra no free):
   - Prioridade: `/api/auth/*` e `/login` → ex.: 20 req/60s por IP → `Managed Challenge`.
   - Com plano pago, segunda regra para `/api/*` (ex.: 120 req/60s).
3. **Custom rules**: bloquear métodos não usados (`TRACE`), user-agents vazios em rotas de API, países fora do escopo (se aplicável).

## 4. Bots e abuso (AT-11)

- **Bot Fight Mode** (free) ativado — challenge para bots conhecidos maliciosos.
- Formulários públicos (contato, cadastro): **Turnstile** (CAPTCHA invisível da CF) no lugar de reCAPTCHA.
- E-commerce/SaaS com abuso real: avaliar *Super Bot Fight Mode* (Pro+).

## 5. Não deixar a porta dos fundos aberta (AT-10)

A borda só protege se o tráfego passar por ela:

- **Hospedagem própria (VPS/servidor)**: firewall da origem aceita tráfego **só dos IPs da Cloudflare** (lista oficial publicada) e/ou **Authenticated Origin Pulls (mTLS)** — senão o atacante bate direto no IP de origem e ignora tudo isso.
- **Vercel/Netlify atrás da CF**: não dá para esconder a origem por IP; o ganho da CF é WAF/rate-limit/bots na frente. Verificar que o domínio `*.vercel.app`/`*.netlify.app` não vaza conteúdo de produção sem proteção (redirect para o domínio final).
- Cache: nunca cachear rota autenticada (`Cache Rules`: bypass em `/api/*` — o Next já manda `no-store` em rotas dinâmicas; a regra é cinto e suspensório).

## 6. Durante um ataque (ligação com o playbook)

- **Under Attack Mode** (Security → Settings): challenge JS para todo mundo — ligar no cenário DDoS do `operacao/playbook-incidentes.md`, desligar depois.
- **Security → Events**: é aqui que se vê o que está sendo bloqueado e por quê (alimenta a rotina mensal).

## 7. Como verificar

| Teste | Esperado |
|---|---|
| `dig SEU-DOMINIO` | IPs da Cloudflare (proxy ativo), não a origem |
| SSL Labs (ssllabs.com/ssltest) | **A** ou A+; TLS 1.2+ apenas |
| `curl -sI http://SEU-DOMINIO` | redirect https + header `server: cloudflare` |
| Teste de carga leve em endpoint próprio (com aviso) | challenge/429 registrado em Security → Events |
| Acesso direto ao IP/hostname de origem (quando aplicável) | recusado ou exige mTLS |
