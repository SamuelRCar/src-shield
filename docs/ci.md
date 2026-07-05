# Como usar o pipeline de segurança do SRC Shield

> Etapa 1 do PLANO-MESTRE.md. O workflow reutilizável vive em
> `.github/workflows/security.yml` deste repo e é consumido por qualquer projeto da SRC.

## 1. Ligar num projeto (2 arquivos)

**`.github/workflows/security.yml` do projeto:**

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
      run-npm: true        # projeto Node
      run-pip: false       # true se houver Python
      # working-directory: "apps/web"   # em monorepo
      # audit-level: "high"             # padrão
    secrets: inherit
```

**`.github/dependabot.yml` do projeto:** copiar de `templates/dependabot.yml` (deste repo) e remover os ecossistemas que o projeto não usa.

## 2. Parâmetros disponíveis

| Input | Padrão | Para quê |
|---|---|---|
| `run-npm` | `true` | Liga/desliga `npm audit` |
| `run-pip` | `false` | Liga/desliga `pip-audit` |
| `working-directory` | `.` | Pasta do app em monorepos |
| `audit-level` | `high` | Severidade que reprova o npm audit |
| `pip-requirements` | `requirements.txt` | Caminho do requirements |
| `semgrep-rules` | `p/owasp-top-ten p/secrets` | Regras SAST (adicionar ex.: `p/react`, `p/python`) |
| `dependency-review` | `true` | Desligar (`false`) em repo **privado sem GHAS** — senão o job sempre falha |

O gitleaks roda via CLI pinado (imagem oficial), varrendo o **histórico completo** em
qualquer evento — não precisa de licença nem de token. Allowlist opcional em
`.gitleaks.toml` na raiz do repo consumidor.

## 3. Pré-requisitos no GitHub (uma vez)

1. **Acesso ao workflow:** se o repo `src-shield` for privado, em `src-shield → Settings → Actions → General → Access` marcar *"Accessible from repositories owned by [usuário]"*. (Alternativa: tornar o `src-shield` público — ele não contém segredos.)
2. **Tag de versão:** os projetos consomem `@v1`. Criar/mover a tag ao publicar: `git tag -f v1 && git push -f origin v1`.
3. **`dependency-review`** roda só em PRs e, em repos **privados**, exige GitHub Advanced Security; em repos públicos é grátis. Projeto privado sem GHAS: passar `dependency-review: false` na chamada (confirmado no teste de fogo de 2026-07-04) e registrar a exceção no checklist do projeto.
4. **Proteção da branch `main`** (em cada projeto e no src-shield): `Settings → Branches → Add branch ruleset`: exigir PR com 1 aprovação + status checks verdes (selecionar os jobs do workflow de segurança).

## 4. Teste de fogo (validação da Etapa 1 — obrigatório)

O pipeline só é considerado entregue quando **ficar vermelho** nos dois testes abaixo (fazer num branch de teste, nunca na `main`):

**a) Segredo plantado (gitleaks):**
```bash
git checkout -b teste-de-fogo
# Montar uma chave FALSA que casa com o padrão AKIA[0-9A-Z]{16} apenas no
# arquivo plantado (montada em partes para os scanners não acusarem este doc).
# NÃO usar as chaves de exemplo da documentação AWS — elas estão na allowlist
# do .gitleaks.toml e passariam batido.
printf 'aws_access_key_id = AKIA%s\n' 'FIRETESTSRCSHIEL' > config-teste.txt
printf 'aws_secret_access_key = %s%s\n' 'wJalrXUtnFEMI/K7MDENG/' 'bPxRfiCYFIRETEST0' >> config-teste.txt
git add . && git commit -m "teste de fogo gitleaks" && git push -u origin teste-de-fogo
# abrir PR → job "Segredos (gitleaks)" deve FALHAR (no push do branch E no PR)
```

**b) Dependência vulnerável (npm audit / dependency-review)** — em um projeto Node consumidor:
```bash
npm install lodash@4.17.15   # versão com CVEs conhecidas (prototype pollution)
git commit -am "teste de fogo audit" && git push
# → jobs "Dependências Node" e "Revisão de dependências" devem FALHAR
```

**Limpeza:** fechar o PR sem merge e apagar o branch (`git push origin --delete teste-de-fogo`). Como o segredo era falso, não há nada a revogar. Registrar o resultado no checklist do projeto.

> **Resultado de 2026-07-04 (primeiro teste de fogo):** gitleaks e Semgrep vermelhos no PR ✅.
> Dois achados corrigidos: (1) a gitleaks-action v2 pulava o primeiro push de branch novo —
> trocada por CLI pinado com varredura de histórico completo; (2) dependency-review falha em
> repo privado sem GHAS — virou input desligável.

## 5. Hardening futuro (backlog da Etapa 7)

- **Fixar actions por SHA** (em vez de `@v4`): proteção máxima contra tag hijacking (A08). O Dependabot já mantém as tags atualizadas semanalmente; a migração para SHA entra na revisão da Etapa 7.
- **Imagem do Semgrep**: hoje usa `semgrep/semgrep` (latest). Fixar por digest na mesma revisão (o gitleaks já está pinado em `v8.18.4`).
- **CodeQL** como segundo SAST em projetos públicos (grátis) — avaliar na Etapa 7.
