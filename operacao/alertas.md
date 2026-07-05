# Monitoramento e alertas — SRC Shield (Etapa 5)

> Perceber o ataque enquanto acontece, não semanas depois (OWASP A09 / NIST: Detectar).
> Duas camadas: **logs estruturados** (no app, via o logger do kit) e **alertas**
> (Sentry para erros + notificações da borda para tráfego). Copiar por projeto.

## 1. Logs estruturados (já no código)

O logger do kit emite JSON com redação automática de PII/segredos. Todo projeto
registra, no mínimo:

- **Autenticação**: login ok / falho / bloqueado por rate limit (nível `security`)
- **Autorização**: acesso negado (403) a recurso de outro usuário
- **Rate limit**: disparo (nível `security`)
- **Erros**: qualquer erro não tratado, com `id` de correlação (nunca PII em texto puro)

No app: `src/lib/security.ts` → `log.security(...)` / `log.error(...)`.

## 2. Sentry (alertas de erro)

Ativação (precisa do DSN do projeto real):

```bash
npx @sentry/wizard@latest -i nextjs   # gera instrumentation + configs
```

- Guardar o DSN em `SENTRY_DSN` (variável de ambiente — nunca no código).
- Ambiente `production` separado de `preview`/`development`.
- Regra de alerta: notificar por e-mail/Slack **na hora** em erro novo e em pico de erros.

**Enquanto o DSN não existe:** os `log.error` já saem em JSON no stdout da
hospedagem (Vercel Logs), que é o mínimo viável. O Sentry entra quando o projeto
tiver conta — a troca é só o wizard + a env.

## 3. Alertas de tráfego (borda)

Configurar no painel da hospedagem (ver `receitas/`):

- **Vercel**: notificações de uso/erros; eventos do Firewall.
- **Cloudflare**: Security → Events + notificação de spike de ameaças.

## 4. Os 5 alertas obrigatórios (todo projeto)

Cada um precisa chegar a uma pessoa (e-mail/celular), não só ficar no log:

| # | Gatilho | De onde | Por quê |
|---|---|---|---|
| 1 | Pico de logins falhos (mesmo IP/conta) | logs `security` + regra Sentry/borda | força bruta em andamento (AT-01) |
| 2 | Erros 500 em série | Sentry | app quebrando ou sob exploração |
| 3 | Rate limit disparando de forma sustentada | logs `security` + borda | abuso de API / scraping (AT-11) |
| 4 | Alteração de configuração de produção | painel da hospedagem/GitHub | mudança não planejada = possível comprometimento |
| 5 | Dependência crítica vulnerável | Dependabot/CI | cadeia de suprimentos (A03) |

## 5. Validação (teste de fogo da Etapa 5)

Provocar um erro de teste em produção/staging e confirmar que o alerta **chega**
em minutos. Sem Sentry ainda: confirmar que o `log.error` aparece nos logs da
hospedagem (ex.: Vercel Logs) com o `id` de correlação.
