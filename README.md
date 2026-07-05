# SRC Shield 🛡️

Pipeline de segurança reutilizável para todos os projetos SRC. Etapa 1 do PLANO-MESTRE.

## O que faz

| Job | Ferramenta | Finalidade |
|---|---|---|
| Segredos | gitleaks | Detecta chaves, tokens e senhas no histórico git |
| Dependências Node | npm audit | CVEs em pacotes npm |
| Dependências Python | pip-audit | CVEs em pacotes pip |
| SAST | Semgrep | Análise estática (OWASP Top 10 + secrets) |
| Revisão de dependências | dependency-review | Bloqueia PRs com dependências vulneráveis |

## Como usar em um projeto

### 1. Workflow (`.github/workflows/security.yml`)

```yaml
name: Segurança
on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

jobs:
  shield:
    uses: SamuelRCar/src-shield/.github/workflows/security.yml@v1
    with:
      run-npm: true
      run-pip: false
    secrets: inherit
```

### 2. Dependabot (`.github/dependabot.yml`)

Copie `templates/dependabot.yml` deste repo e remova os ecossistemas que o projeto não usa.

## Parâmetros

| Input | Padrão | Para quê |
|---|---|---|
| `run-npm` | `true` | Liga/desliga npm audit |
| `run-pip` | `false` | Liga/desliga pip-audit |
| `working-directory` | `.` | Pasta do app em monorepos |
| `audit-level` | `high` | Severidade que reprova o build |
| `pip-requirements` | `requirements.txt` | Caminho do requirements |
| `semgrep-rules` | `p/owasp-top-ten p/secrets` | Regras SAST |

## Teste de fogo

Ver `ci.md` — o pipeline só é entregue quando falhar nos dois testes de segurança.
