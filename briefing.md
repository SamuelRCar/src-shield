# Briefing — SRC Shield

**Data:** 2026-07-02
**Tipo:** Projeto interno da SRC (empresa de cibersegurança)
**Origem:** `Guia de Cibersegurança Cloud.pdf` (SRC Ltda. — Portfólio S.R.C, Cibersegurança Cloud V1.0), baseado em OWASP Top 10:2025 e NIST CSF 2.0.

## Objetivo

Construir o **sistema de segurança padronizado da SRC**: um baseline reutilizável, extremamente competente na função de proteger sites, softwares e projetos futuros contra ataques (força bruta, injeção, XSS, DDoS, cadeia de suprimentos, ransomware etc.) e tentativas de roubo de dados — aplicável a diversos tipos de projeto e a diferentes locais de hospedagem.

## Entendimento acordado (expectativa realista)

Conforme a Seção 08 do guia: o sistema **não é um software-escudo único** instalável. É um **kit padronizado** — regras + pacote de código compartilhado + repo-modelo + pipeline CI automatizado + playbooks — que a SRC aplica a cada projeto. A proteção "ao vivo" vem de serviços gerenciados (WAF/CDN da Vercel/Cloudflare, provedor de autenticação, banco gerenciado) configurados corretamente pelo kit. Nada é 100% seguro; o objetivo é fechar as portas óbvias (que eliminam a grande maioria do risco automatizado) e manter disciplina de manutenção.

## Decisões tomadas (2026-07-02)

| Decisão | Escolha |
|---|---|
| Nome do sistema | **SRC Shield** (pasta `src-shield`, pacote `@src/shield`) |
| Local do projeto | `E:\NEXO Studio\projetos\src-shield\` |
| Esqueleto organizacional | NIST CSF 2.0 (Seção 05 do guia) — as 6 funções |
| Escopo da 1ª entrega | Documentação completa primeiro; código do kit nas próximas sessões, etapa por etapa |
| Stack alvo | Next.js/React · Node · Python · SQL · Vercel/Netlify · Cloudflare |
| Piloto | `casaconta-app` (Next.js + Supabase) na Etapa 7 |

## Restrições e notas

- GitHub CLI (`gh`) não está instalado nesta máquina — quando as etapas de código começarem, criar o repo manualmente no site do GitHub ou instalar o `gh`.
- E-commerce com pagamento: usar provedor (Stripe/Mercado Pago) para reduzir o escopo PCI DSS — nunca tocar no dado de cartão diretamente.
- Documento-fonte fica na raiz do workspace: `E:\NEXO Studio\Guia de Cibersegurança Cloud.pdf`.

## Entregável principal

`PLANO-MESTRE.md` — plano de execução em 8 etapas (0–7), com tarefas específicas, ferramentas, prompts prontos, entregáveis e critérios de validação por etapa.
