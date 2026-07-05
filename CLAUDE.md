# SRC Shield — instruções do repositório

> Repositório do **SRC Shield**, o sistema padronizado de segurança da SRC.

## Sobre

Sistema padronizado de segurança da SRC (empresa de cibersegurança): um **baseline reutilizável** — regras, pacote compartilhado, repo-modelo, pipeline CI e playbooks — aplicado a todo projeto novo (sites institucionais, SaaS, e-commerce e softwares) para protegê-los contra ataques e roubo de dados. Base normativa: **OWASP Top 10:2025** e **NIST CSF 2.0**.

## Entregas

- Documentação de planejamento (`PLANO-MESTRE.md`, `briefing.md`)
- Governança versionada (`governanca/` — regras de segurança e checklist baseline)
- Playbooks de operação (`operacao/` — resposta a incidentes e rotina mensal)
- Pipeline CI, pacote `@src/shield`, repo-modelo Next.js (ver etapas no plano mestre)

## Onde salvar o que

- Contexto e planejamento: raiz do repositório
- Regras e checklists: `governanca/`
- Playbooks e rotinas: `operacao/`

## Regras do projeto

- **Nunca colar segredos reais** (chaves de API, senhas, tokens) em chats, commits ou exemplos — usar sempre placeholders (`SUA_CHAVE_AQUI`).
- Toda decisão técnica segue `governanca/SEGURANCA.md` e o checklist `governanca/checklist-baseline.md`.
- Todo resultado gerado por IA passa por revisão humana antes de virar padrão.
- Afirmações técnicas ancoradas em fontes reconhecidas (OWASP, NIST, MDN, docs oficiais Vercel/Cloudflare) — evitar conselhos sem procedência.
- O sistema **não é** um software-escudo que roda na frente dos sites; a proteção ao vivo vem dos serviços gerenciados (WAF/CDN, provedor de auth, banco gerenciado) que o kit configura corretamente.
