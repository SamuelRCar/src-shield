# Piloto do SRC Shield — CasaConta (Etapa 7)

> Aplicação do baseline ao primeiro projeto real (`casaconta-app`, Next.js 16 +
> Supabase + Anthropic + Belvo), puxando as Etapas 5 (monitoramento) e 6
> (resposta/recuperação). Data: 2026-07-05.

## Contexto do projeto piloto

CasaConta é um **protótipo**: store em memória, sem autenticação nem banco
conectado (modo mock). Isso definiu o escopo: aplicaram-se os controles que já
fazem sentido hoje; os de auth/banco ficam documentados para quando o Supabase
for ligado (seguindo o repo-modelo `templates/next-hardened`).

## O que foi aplicado

| Controle | Resultado |
|---|---|
| Cabeçalhos de segurança (HSTS, CSP, nosniff, frame DENY) | ✅ verificado ao vivo (curl) |
| Validação de entrada (Zod) nas 4 rotas de API | ✅ 400 genérico, sem ecoar payload |
| Rate limit por IP nas rotas que custam $ (OCR/IA/Belvo) | ✅ 429 na 61ª req (verificado) |
| Erros que falham fechando (`toPublicError`) | ✅ detalhe só no log, id de correlação |
| Logs estruturados com redação de PII | ✅ JSON com `[REDACTED]` |
| CVE moderada (postcss) via overrides | ✅ 0 vulnerabilidades |
| Pipeline CI de segurança + Dependabot | ✅ consome `security.yml@v1` |
| Playbook de incidentes preenchido | ✅ `casaconta-app/PLAYBOOK-INCIDENTES.md` |
| Gap analysis vs checklist | ✅ `casaconta-app/SEGURANCA.md` |

**4 achados reais corrigidos** (o valor do piloto): vazamento de erro (A10),
ausência de validação (A05), ausência de rate limit nas rotas de IA (AT-11) e
CVE transitiva do postcss (A03).

## Lições que retroalimentam o kit (backlog Etapa 7)

1. **Consumo do `@src/shield` exige publicação.** Um projeto em repo separado não
   consegue `import` do pacote sem ele estar num registry. No piloto, os controles
   foram **vendorizados** em `casaconta-app/src/lib/security.ts` (cópia enxuta e
   marcada). **Ação:** publicar `@src/shield` no GitHub Packages e trocar o vendor
   pela dependência real. Até lá, vendorizar é o padrão documentado.
2. **Rate limit em memória não serve produção serverless.** No CasaConta (instância
   única/protótipo) funciona; ao escalar na Vercel, plugar o store de Redis/Upstash
   previsto no módulo `rateLimit` do pacote.
3. **`dependency-review` sempre off em repo privado sem GHAS** — confirmado de novo;
   já é o padrão nos callers.
4. **CVE do postcss aparece em todo projeto Next** — considerar deixar o `overrides`
   no `templates/next-hardened` (já está) e citar no checklist de projeto novo.

## Validação (critério da Etapa 7)

- CasaConta passa os itens **aplicáveis** do `checklist-baseline.md` (ver gap analysis).
- Itens não aplicáveis (auth/banco) documentados com o caminho de fechamento.
- `next build` limpo; defesas verificadas ao vivo (headers, 400, 429, erro sem vazamento).

## Próximo salto (quando o Supabase for ligado)

Migrar o CasaConta para o padrão do `templates/next-hardened`: Supabase Auth por
morador, `requireOwner` em cada acesso, usuário de banco mínimo + RLS + TLS,
backups testados, e ativar o Sentry (DSN) com os 5 alertas de `operacao/alertas.md`.
