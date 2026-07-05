# Checklist Baseline — SRC Shield

> **O "sistema padrão" em forma de checklist** (Seção 10 do guia). Copiar este arquivo para
> cada projeto, preencher o cabeçalho e marcar item a item. **Nenhum item aberto = pode
> publicar.** Revisar a cada release relevante e na rotina mensal.

**Projeto:** ____________________  **Hospedagem:** ____________________
**Responsável:** ____________________  **Data da última revisão:** ____ / ____ / ______

## 1. Borda e transporte (Proteger — AT-05, AT-09)

- [ ] HTTPS forçado (redirect HTTP→HTTPS) + **HSTS** ativo
      *Validar: acessar via http:// redireciona; header `Strict-Transport-Security` presente.*
- [ ] **CSP** e demais cabeçalhos de segurança (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`)
      *Validar: nota A em securityheaders.com.*
- [ ] **WAF + proteção DDoS** ativos na borda (Vercel/Cloudflare, conforme `receitas/`)
      *Validar: painel da plataforma mostra WAF/DDoS habilitados.*
- [ ] **Rate limiting** nas rotas de API e login
      *Validar: exceder o limite retorna 429.*

## 2. Autenticação e acesso (Proteger — AT-01, A01, A07)

- [ ] Login por **provedor comprovado** (Auth.js/Clerk/Supabase Auth) — nada feito do zero
- [ ] **MFA** disponível (obrigatório para contas admin)
- [ ] Rate limit + **bloqueio após N falhas** no login
      *Validar: 10 senhas erradas seguidas → bloqueio.*
- [ ] **Autorização por menor privilégio em toda rota** — usuário só acessa os próprios dados
      *Validar: teste cross-usuário retorna 403.*
- [ ] Sessão com expiração; logout revoga no servidor

## 3. Código e segredos (Proteger — AT-07, A03)

- [ ] **Segredos só em variáveis de ambiente**; `.env*` no `.gitignore`; `.env.example` atualizado
      *Validar: gitleaks limpo no código e no histórico.*
- [ ] **Validação de entrada no servidor** (Zod/Pydantic) em todo endpoint
      *Validar: entrada inválida → 400 genérico, sem vazamento de detalhe.*
- [ ] **Dependabot + npm/pip audit no CI**, falhando em severidade alta
      *Validar: CI vermelho com dependência vulnerável plantada.*
- [ ] **SAST (Semgrep)** no pipeline
- [ ] Lockfile commitado; deploy só via pipeline

## 4. Dados e banco (Proteger — AT-02, A04, A05)

- [ ] **Consultas parametrizadas / ORM** — zero SQL concatenado
      *Validar: busca por concatenação de SQL no código não retorna nada.*
- [ ] **Usuário de banco com privilégio mínimo** (nunca root/postgres)
- [ ] Conexão ao banco via **TLS**; criptografia em repouso (padrão do banco gerenciado)
- [ ] **Backups automáticos e testados** (point-in-time quando disponível)
      *Validar: última restauração de teste documentada em < 90 dias.*

## 5. Detecção (Detectar — A09)

- [ ] **Logs estruturados** de login, erros e ações sensíveis (sem PII em texto puro)
- [ ] **Sentry** (ou equivalente) com alerta imediato de erro
      *Validar: erro de teste dispara alerta em minutos.*
- [ ] Alertas de tráfego anômalo na borda configurados

## 6. Resposta e recuperação (Responder/Recuperar — AT-08)

- [ ] **Plano de resposta a incidentes** preenchido (contatos, revogação, restore) e acessível
- [ ] Procedimento de **revogação rápida** de chaves/sessões/tokens documentado
- [ ] Teste de **restauração de backup** executado e registrado

## 7. Governança (Governar)

- [ ] `SEGURANCA.md` copiado na raiz do repo (regras OWASP do projeto)
- [ ] Inventário preenchido: pontos de entrada, dependências, segredos, dados sensíveis
- [ ] **Revisão OWASP mensal** do código novo agendada (rotina mensal)
- [ ] E-commerce: pagamento **via provedor** (Stripe/Mercado Pago) — dado de cartão nunca tocado diretamente (PCI DSS)

---
*16 controles do baseline (Seção 10 do guia) + validações objetivas. Versão 1.0 — 2026-07-02.*
