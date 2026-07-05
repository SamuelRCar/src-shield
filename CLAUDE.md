# SRC Shield

> Projeto criado em 2026-07-02. Pasta dedicada — instruções aqui sobrescrevem as da raiz quando relevantes.

## Sobre

Sistema padronizado de segurança da SRC (empresa de cibersegurança): um **baseline reutilizável** — regras, pacote compartilhado, repo-modelo, pipeline CI e playbooks — aplicado a todo projeto novo (sites institucionais, SaaS, e-commerce e softwares) para protegê-los contra ataques e roubo de dados. Baseado no `Guia de Cibersegurança Cloud.pdf` (OWASP Top 10:2025 + NIST CSF 2.0).

## Tipo

Projeto interno (SRC Ltda. — não é um projeto NEXO/CasaConta).

## Entregas previstas

- Documentação de planejamento (`PLANO-MESTRE.md`, `briefing.md`)
- Governança versionada (`governanca/` — regras de segurança e checklist baseline)
- Playbooks de operação (`operacao/` — resposta a incidentes e rotina mensal)
- Nas próximas sessões: pipeline CI, pacote `@src/shield`, repo-modelo Next.js (ver etapas no plano mestre)

## Onde salvar o que

- Briefings e contexto: nesta pasta na raiz
- Regras e checklists: `governanca/`
- Playbooks e rotinas: `operacao/`

## Contexto que herda da raiz

Herda o **modo de trabalho** NEXO (draft primeiro, versionar via `/salvar`, rotina repetida vira skill). **Não herda** identidade visual nem tom de voz do CasaConta — este projeto é da SRC; linguagem técnica e sóbria.

## Específico desse projeto

- **Nunca colar segredos reais** (chaves de API, senhas, tokens) em chats, commits ou exemplos — usar sempre placeholders (`SUA_CHAVE_AQUI`).
- Toda decisão técnica segue `governanca/SEGURANCA.md` e o checklist `governanca/checklist-baseline.md`.
- Todo resultado gerado por IA passa por revisão humana antes de virar padrão (limite explícito da Seção 08 do guia).
- Afirmações técnicas ancoradas nas fontes do guia (OWASP, NIST, MDN, docs oficiais Vercel/Cloudflare) — evitar conselhos sem procedência.
- O sistema **não é** um software-escudo que roda na frente dos sites; a proteção ao vivo vem dos serviços gerenciados (WAF/CDN, provedor de auth, banco gerenciado) que o kit configura corretamente.
