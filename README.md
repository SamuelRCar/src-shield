# 🛡️ SRC Shield

**Um sistema-base de cibersegurança para adicionar a qualquer site ou software.**
Você liga uma vez, e todo projeto passa a nascer com uma linha de defesa padrão —
baseada no **OWASP Top 10:2025** e no **NIST CSF 2.0**.

> Pense nele como o "cinto de segurança" dos seus projetos: algo básico que todo
> projeto deveria ter. Não substitui uma auditoria completa, mas fecha as portas
> óbvias que respondem pela maioria dos ataques automatizados.

---

## O que você adiciona ao seu projeto

Ao adotar o SRC Shield, o seu repositório ganha, de imediato:

- **🔍 Um vigia automático no GitHub (CI)** — a cada push/PR, procura **segredos vazados**
  (senhas, chaves de API), **código inseguro** (padrões OWASP) e **dependências
  vulneráveis**. Se achar, o PR fica vermelho antes de virar problema em produção.
- **🔁 Atualização de dependências (Dependabot)** — avisa e abre PRs quando uma
  biblioteca sua tem falha conhecida.
- **📋 Regras e checklist** — um `SEGURANCA.md` com as regras de segurança do projeto
  (em linguagem simples) e um checklist para conferir antes de publicar.
- **🧩 Controles de código prontos** (para apps Node/Next.js) — cabeçalhos de segurança,
  rate limiting, validação de entrada, autorização por dono, logs sem vazar dados e
  tratamento de erros que "falha fechando". Tudo testado.
- **🚀 Um template Next.js "já seguro"** — para começar projetos novos que já nascem
  com login forte (Auth.js + argon2 + MFA), banco protegido e monitoramento.
- **📓 Playbooks de operação** — o que fazer quando algo dá errado (resposta a incidentes),
  como configurar a borda (Vercel/Cloudflare/Netlify) e uma rotina mensal de manutenção.

Nada disso exige que você seja especialista em segurança. A ideia é justo o contrário:
tornar o básico de cibersegurança **fácil de aplicar** e igual em todos os seus projetos.

---

## Começar em 3 passos (qualquer projeto)

**A forma mais simples — copie 2 arquivos:**

1. Crie no seu projeto o arquivo `.github/workflows/security.yml`:

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
      run-npm: true          # projeto Node? mantenha; sem package.json → false
      run-pip: false         # projeto Python? → true
      dependency-review: true # false se o repo for PRIVADO sem GitHub Advanced Security
    secrets: inherit
```

2. Copie o [`templates/consumer/.github/dependabot.yml`](templates/consumer/.github/dependabot.yml) para o seu `.github/dependabot.yml`.

3. Commit + PR. Pronto: o pipeline já está protegendo o repositório. ✅

**Ou use o instalador** (copia os arquivos + regras + checklist de uma vez):

```bash
git clone https://github.com/SamuelRCar/src-shield
cd meu-projeto
bash ../src-shield/scripts/instalar.sh        # Windows: powershell -File ..\src-shield\scripts\instalar.ps1
```

👉 Passo a passo detalhado (projeto novo e projeto existente): **[COMO-APLICAR.md](COMO-APLICAR.md)**

---

## O que tem dentro (mapa do repositório)

| Pasta / arquivo | O que é | Para quem |
|---|---|---|
| [`.github/workflows/security.yml`](.github/workflows/security.yml) | **O pipeline reutilizável** que os projetos consomem | todos |
| [`templates/consumer/`](templates/consumer/) | Os 2 arquivos prontos para copiar no seu projeto | quem adota |
| [`scripts/`](scripts/) | Instalador (`instalar.sh` / `instalar.ps1`) | quem adota |
| [`governanca/SEGURANCA.md`](governanca/SEGURANCA.md) | Regras de segurança (OWASP) para copiar no projeto | todos |
| [`governanca/checklist-baseline.md`](governanca/checklist-baseline.md) | Checklist antes de publicar | todos |
| [`packages/shield/`](packages/shield/) | Pacote `@src/shield` — controles de código com testes | apps Node/Next |
| [`templates/next-hardened/`](templates/next-hardened/) | Template Next.js já seguro para projetos novos | apps Next |
| [`receitas/`](receitas/) | Configurar a borda: Vercel, Netlify, Cloudflare, banco | quem faz deploy |
| [`operacao/`](operacao/) | Playbook de incidentes, alertas, rotina mensal | operação |
| [`docs/ci.md`](docs/ci.md) | Referência completa do pipeline e parâmetros | quem adota |
| [`PLANO-MESTRE.md`](PLANO-MESTRE.md) | O plano completo (8 etapas, OWASP/NIST, matriz de ataques) | referência |

---

## Como ele protege (as camadas)

Defesa em profundidade — cada camada cobre as falhas da outra:

1. **Borda** (Vercel/Cloudflare): HTTPS, WAF, proteção DDoS, rate limit → `receitas/`
2. **Aplicação**: cabeçalhos de segurança, CSP, validação de entrada → `packages/shield`
3. **Código e dependências**: segredos fora do Git, SAST, varredura de dependências → CI
4. **Autenticação**: login por provedor, MFA, rate limit no login → `templates/next-hardened`
5. **Dados**: consultas parametrizadas, privilégio mínimo, backups testados → `receitas/banco.md`
6. **Monitoramento e resposta**: logs, alertas, playbook de incidentes → `operacao/`

Mapeamento completo ataque → defesa na [matriz do plano mestre](PLANO-MESTRE.md#31--matriz-ataque--defesa--onde-o-kit-resolve).

---

## O que ele NÃO é (importante)

- **Não é** um antivírus/firewall mágico que roda sozinho na frente do site. A proteção
  "ao vivo" vem dos serviços gerenciados (Vercel/Cloudflare, provedor de login, banco)
  que o kit ajuda a configurar corretamente.
- **Não garante 100% de segurança** — nada garante. Ele elimina a grande maioria do risco
  automatizado e ajuda a detectar e responder ao resto.
- **Não substitui revisão humana** nem uma auditoria dedicada para projetos críticos.

Segurança é processo, não produto: a força está na soma das camadas + disciplina de manutenção.

---

## Fontes

Toda regra do kit é ancorada em referências públicas e reconhecidas:
[OWASP Top 10:2025](https://owasp.org) · [NIST CSF 2.0](https://www.nist.gov/cyberframework) ·
[MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security) ·
docs oficiais Vercel/Next.js e Cloudflare · [CIS Benchmarks](https://www.cisecurity.org) ·
[PCI DSS](https://www.pcisecuritystandards.org) (pagamentos).

## Licença

[MIT](LICENSE) — use, copie e adapte livremente nos seus projetos, mantendo o aviso de copyright.
Encontrou uma falha de segurança? Veja [SECURITY.md](SECURITY.md).
