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

Secret opcional: `GITLEAKS_LICENSE` — só é exigida se o repo pertencer a uma **organização** GitHub (conta pessoal não precisa).

## 3. Pré-requisitos no GitHub (uma vez)

1. **Acesso ao workflow:** se o repo `src-shield` for privado, em `src-shield → Settings → Actions → General → Access` marcar *"Accessible from repositories owned by [usuário]"*. (Alternativa: tornar o `src-shield` público — ele não contém segredos.)
2. **Tag de versão:** os projetos consomem `@v1`. Criar/mover a tag ao publicar: `git tag -f v1 && git push -f origin v1`.
3. **`dependency-review`** roda só em PRs e, em repos **privados**, exige GitHub Advanced Security; em repos públicos é grátis. Se o projeto for privado sem GHAS, o job vai falhar — nesse caso remova o gatilho de PR ou ignore o job (documentar a exceção no checklist do projeto).
4. **Proteção da branch `main`** (em cada projeto e no src-shield): `Settings → Branches → Add branch ruleset`: exigir PR com 1 aprovação + status checks verdes (selecionar os jobs do workflow de segurança).

## 4. Teste de fogo (validação da Etapa 1 — obrigatório)

O pipeline só é considerado entregue quando **ficar vermelho** nos dois testes abaixo (fazer num branch de teste, nunca na `main`):

**a) Segredo plantado (gitleaks):**
```bash
git checkout -b teste-de-fogo
# criar um arquivo com uma chave falsa no formato real da AWS:
echo 'aws_access_key_id = AKIAIOSFODNN7EXAMPLE' > config-teste.txt
echo 'aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY' >> config-teste.txt
git add . && git commit -m "teste de fogo gitleaks" && git push -u origin teste-de-fogo
# abrir PR → job "Segredos (gitleaks)" deve FALHAR
```

**b) Dependência vulnerável (npm audit / dependency-review)** — em um projeto Node consumidor:
```bash
npm install lodash@4.17.15   # versão com CVEs conhecidas (prototype pollution)
git commit -am "teste de fogo audit" && git push
# → jobs "Dependências Node" e "Revisão de dependências" devem FALHAR
```

**Limpeza:** fechar o PR sem merge e apagar o branch (`git push origin --delete teste-de-fogo`). Como o segredo era falso (exemplo público da AWS), não há nada a revogar. Registrar o resultado no checklist do projeto.

## 5. Hardening futuro (backlog da Etapa 7)

- **Fixar actions por SHA** (em vez de `@v4`): proteção máxima contra tag hijacking (A08). O Dependabot já mantém as tags atualizadas semanalmente; a migração para SHA entra na revisão da Etapa 7.
- **Imagem do Semgrep**: hoje usa `semgrep/semgrep` (latest). Fixar por digest na mesma revisão.
- **CodeQL** como segundo SAST em projetos públicos (grátis) — avaliar na Etapa 7.
