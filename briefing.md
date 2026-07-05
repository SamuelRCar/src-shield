# Briefing — SRC Shield

**Tipo:** Projeto interno da SRC (empresa de cibersegurança)
**Base normativa:** OWASP Top 10:2025 e NIST CSF 2.0.

## Objetivo

Construir o **sistema de segurança padronizado da SRC**: um baseline reutilizável, extremamente competente na função de proteger sites, softwares e projetos futuros contra ataques (força bruta, injeção, XSS, DDoS, cadeia de suprimentos, ransomware etc.) e tentativas de roubo de dados — aplicável a diversos tipos de projeto e a diferentes locais de hospedagem.

## Entendimento acordado (expectativa realista)

O sistema **não é um software-escudo único** instalável. É um **kit padronizado** — regras + pacote de código compartilhado + repo-modelo + pipeline CI automatizado + playbooks — que a SRC aplica a cada projeto. A proteção "ao vivo" vem de serviços gerenciados (WAF/CDN da Vercel/Cloudflare, provedor de autenticação, banco gerenciado) configurados corretamente pelo kit. Nada é 100% seguro; o objetivo é fechar as portas óbvias (que eliminam a grande maioria do risco automatizado) e manter disciplina de manutenção.

## Decisões

| Decisão | Escolha |
|---|---|
| Nome do sistema | **SRC Shield** (repositório `src-shield`, pacote `@src/shield`) |
| Esqueleto organizacional | NIST CSF 2.0 — as 6 funções |
| Stack alvo | Next.js/React · Node · Python · SQL · Vercel/Netlify · Cloudflare |
| Piloto | `casaconta-app` (Next.js + Supabase) na Etapa 7 |

## Restrições e notas

- E-commerce com pagamento: usar provedor (Stripe/Mercado Pago) para reduzir o escopo PCI DSS — nunca tocar no dado de cartão diretamente.

## Entregável principal

`PLANO-MESTRE.md` — plano de execução em 8 etapas (0–7), com tarefas específicas, ferramentas, prompts prontos, entregáveis e critérios de validação por etapa.
