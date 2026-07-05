# Como aplicar o SRC Shield no seu projeto

Guia prático de adoção. Escolha o seu caso abaixo. Se só quiser o mínimo que já
protege, faça a **Parte 1** — leva 5 minutos e vale para qualquer linguagem.

---

## Parte 1 — O essencial (qualquer projeto, ~5 min)

Isto liga o "vigia automático" no GitHub. Vale para qualquer stack.

### Passo 1 — Adicionar o pipeline de segurança

Crie o arquivo `.github/workflows/security.yml` no seu repositório com:

```yaml
name: Segurança
on:
  push: { branches: [main] }
  pull_request:
permissions:
  contents: read
jobs:
  shield:
    uses: SamuelRCar/src-shield/.github/workflows/security.yml@v1
    with:
      run-npm: true           # tem package.json? mantenha. Senão → false
      run-pip: false          # tem requirements.txt/pyproject? → true
      dependency-review: true # PRIVADO sem GitHub Advanced Security? → false
    secrets: inherit
```

O que cada job faz:
- **Segredos (gitleaks)** — procura chaves/senhas no código e no histórico.
- **SAST (Semgrep)** — procura padrões inseguros (injeção, XSS, etc.).
- **Dependências (npm/pip audit)** — reprova bibliotecas com falha conhecida.
- **Revisão de dependências** — em PRs, bloqueia dependência nova vulnerável.

### Passo 2 — Ligar o Dependabot

Copie [`templates/consumer/.github/dependabot.yml`](templates/consumer/.github/dependabot.yml)
para `.github/dependabot.yml` e remova os ecossistemas que não usa.

### Passo 3 — Segredos fora do Git

Garanta que o `.gitignore` tem `.env*` (com exceção de `.env.example`) e que nenhuma
chave está commitada. O pipeline vai reclamar se achar — é para isso que ele serve.

### Passo 4 — Commit e PR

Faça commit e abra um PR. O pipeline roda sozinho. **PR verde = passou.**

> **Atalho:** em vez dos passos 1–3, rode o instalador a partir da raiz do seu projeto:
> `bash ../src-shield/scripts/instalar.sh` (ou `instalar.ps1` no Windows). Ele cria os
> arquivos, o `SEGURANCA.md` e o `checklist-baseline.md` sem sobrescrever o que já existe.

---

## Parte 2 — Projeto novo (Node/Next.js)

Comece já seguro, a partir do template `templates/next-hardened`, que traz:
login por Auth.js (argon2 + MFA + rate limit), autorização por dono em cada rota,
Prisma com privilégio mínimo, cabeçalhos de segurança e testes de segurança.

```bash
# copie o template para o seu novo projeto
cp -r src-shield/templates/next-hardened meu-projeto && cd meu-projeto
cp .env.example .env && npx auth secret       # gere os segredos
npm install && npx prisma migrate dev
npm run dev
npm test                                       # 10 testes de segurança
```

Depois faça a **Parte 1** para ligar o CI. Detalhes no
[README do template](templates/next-hardened/README.md).

---

## Parte 3 — Projeto que já existe (auditoria + reforço)

1. **Copie as regras**: `SEGURANCA.md` e `checklist-baseline.md` para a raiz do projeto
   (o instalador faz isso). Preencha o inventário: o que o projeto tem a proteger.
2. **Ligue o CI** (Parte 1) — a partir daí, nada regride.
3. **Rode a auditoria** contra as regras. Se você usa o Claude Code, um bom pedido é:
   > "Revise este repositório contra o SEGURANCA.md e o OWASP Top 10:2025; liste cada
   > achado com severidade, arquivo e correção sugerida."
4. **Corrija na ordem dos 8 essenciais** (ver `checklist-baseline.md`): HTTPS+cabeçalhos,
   login forte, segredos fora do código, consultas parametrizadas, validação de entrada,
   Dependabot+audit, backups testados, alertas de erro.
5. **Configure a borda** conforme a sua hospedagem em [`receitas/`](receitas/).
6. **Entre na rotina mensal** ([`operacao/rotina-mensal.md`](operacao/rotina-mensal.md)).

> Exemplo real de projeto existente reforçado (4 falhas encontradas e corrigidas):
> [`PILOTO-CASACONTA.md`](PILOTO-CASACONTA.md).

---

## Parte 4 — Usar os controles de código (apps Node/Next)

O pacote [`@src/shield`](packages/shield/) traz os controles prontos (cabeçalhos,
rate limit, validação, autorização, logger, CSRF, erros).

- **Publicado no npm** (recomendado): `npm install @src/shield` e
  `import { ... } from "@src/shield"`. Sem autenticação. Como publicar: [docs/publicar.md](docs/publicar.md).
- **Enquanto não publicado — vendorizar**: copiar o que usa para `src/lib/security.ts`
  do seu projeto (veja como no [piloto](PILOTO-CASACONTA.md)). Simples e deployável.

Uso de cada módulo: [README do pacote](packages/shield/README.md).

---

## Parâmetros do pipeline

| Input | Padrão | Para quê |
|---|---|---|
| `run-npm` | `true` | Liga/desliga `npm audit` |
| `run-pip` | `false` | Liga/desliga `pip-audit` |
| `working-directory` | `.` | Pasta do app em monorepos |
| `audit-level` | `high` | Severidade que reprova o audit |
| `semgrep-rules` | `p/owasp-top-ten p/secrets` | Regras SAST (ex.: add `p/react`, `p/python`) |
| `dependency-review` | `true` | `false` em repo privado sem GitHub Advanced Security |

Referência completa e o "teste de fogo" (como validar que o pipeline funciona):
[`docs/ci.md`](docs/ci.md).

---

## Perguntas comuns

**Preciso saber de segurança para usar?** Não. O mínimo (Parte 1) são 2 arquivos. O kit
foi feito para ser o "básico que todo projeto tem".

**Funciona com qualquer linguagem?** O CI (segredos, SAST, dependências) funciona para
qualquer stack. Os controles de código e o template são específicos de Node/Next.js.

**Meu repositório é privado.** O pipeline funciona; só passe `dependency-review: false`
(esse job específico exige repo público ou GitHub Advanced Security). E lembre: para
**outros** consumirem o `uses:` do src-shield, o repo do src-shield precisa ser público.

**Isso me deixa 100% seguro?** Não — nada deixa. Ele elimina a maioria do risco
automatizado e cria disciplina. Segurança é processo contínuo.
