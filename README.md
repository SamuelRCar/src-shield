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
| 1 — Pipeline CI | `security.yml` + Dependabot + docs | 🔨 construído — falta push no GitHub + teste de fogo |
| 2 — Pacote `@src/shield` | headers, rateLimit, validate, authz, logger, csrf, errors | 🔨 construído — 31 testes ✅ |
| 3 — Repo-modelo Next.js | [templates/next-hardened](templates/next-hardened/) | 🔨 construído — 10 testes de segurança ✅, build ✅, headers verificados ao vivo ✅; nota A em securityheaders.com valida no 1º deploy |
| 4 — Borda e dados | [receitas/](receitas/) Vercel · Netlify · Cloudflare · banco · config | 🔨 escritas — validação ao vivo no 1º deploy (cada receita tem a tabela "Como verificar") |
| 5 — Monitoramento | logger + Sentry + alertas | ⬜ |
| 6 — Resposta/recuperação | playbook preenchido + restore testado | ⬜ |
| 7 — Manutenção + piloto | rotina ativa + piloto casaconta-app | ⬜ |

## Uso rápido (projeto consumidor)

```yaml
jobs:
  shield:
    uses: SamuelRCar/src-shield/.github/workflows/security.yml@v1
    with: { run-npm: true }
    secrets: inherit
```

Ver [docs/ci.md](docs/ci.md).
