# SRC Shield

**Sistema padronizado de segurança da SRC** — um baseline reutilizável aplicado a todo
projeto (sites, SaaS, e-commerce) para proteger contra ataques e roubo de dados.
Baseado em **OWASP Top 10:2025** e organizado pelo **NIST CSF 2.0**.

> Não é um "software-escudo" que roda na frente dos sites: é o conjunto de regras,
> código compartilhado, pipeline e playbooks que faz cada projeto nascer e permanecer
> seguro — com a proteção ao vivo vinda da borda gerenciada (WAF/CDN) que ele configura.

## Estrutura

| Pasta/arquivo | O que é |
|---|---|
| [PLANO-MESTRE.md](PLANO-MESTRE.md) | O plano completo: visão, arquitetura, 8 etapas, matriz de ataques |
| [governanca/SEGURANCA.md](governanca/SEGURANCA.md) | Regras de segurança (copiar em todo projeto) |
| [governanca/checklist-baseline.md](governanca/checklist-baseline.md) | Os 16 controles do baseline, com validação |
| [operacao/playbook-incidentes.md](operacao/playbook-incidentes.md) | Resposta a incidentes (template por projeto) |
| [operacao/rotina-mensal.md](operacao/rotina-mensal.md) | Rotina mensal de manutenção |
| [.github/workflows/security.yml](.github/workflows/security.yml) | **Pipeline reutilizável**: gitleaks + Semgrep + npm/pip audit + dependency-review |
| [docs/ci.md](docs/ci.md) | Como ligar o pipeline num projeto + teste de fogo |
| [templates/dependabot.yml](templates/dependabot.yml) | Dependabot modelo para projetos |

## Status das etapas

| Etapa | Entrega | Status |
|---|---|---|
| 0 — Fundação e governança | Docs desta pasta | ✅ 2026-07-02 |
| 1 — Pipeline CI | `security.yml` + Dependabot + docs | ✅ 2026-07-04 — teste de fogo aprovado (gitleaks+Semgrep vermelhos no PR); 2 achados corrigidos (ver docs/ci.md §4) |
| 2 — Pacote `@src/shield` | headers, rateLimit, validate, authz, logger, csrf, errors | ✅ 31 testes — verdes também no Actions |
| 3 — Repo-modelo Next.js | [templates/next-hardened](templates/next-hardened/) | 🔨 construído — 10 testes de segurança ✅ (local e Actions), build ✅, headers verificados ao vivo ✅; nota A em securityheaders.com valida no 1º deploy |
| 4 — Borda e dados | [receitas/](receitas/) Vercel · Netlify · Cloudflare · banco · config | 🔨 escritas — validação ao vivo no 1º deploy (cada receita tem a tabela "Como verificar") |
| 5 — Monitoramento | [operacao/alertas.md](operacao/alertas.md) — logger + Sentry + 5 alertas | 🔨 logs estruturados ✅ (verificados no piloto); Sentry aguarda DSN |
| 6 — Resposta/recuperação | playbook preenchido no piloto | 🔨 playbook do CasaConta preenchido ✅; restore testável ao ligar o Supabase |
| 7 — Manutenção + piloto | [PILOTO-CASACONTA.md](PILOTO-CASACONTA.md) | ✅ 2026-07-05 — kit aplicado ao casaconta-app, 4 achados reais corrigidos e validados ao vivo |

## Uso rápido (projeto consumidor)

```yaml
jobs:
  shield:
    uses: SamuelRCar/src-shield/.github/workflows/security.yml@v1
    with: { run-npm: true }
    secrets: inherit
```

Ver [docs/ci.md](docs/ci.md).
