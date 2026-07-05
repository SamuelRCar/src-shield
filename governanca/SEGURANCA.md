# SEGURANCA.md — Regras de Segurança SRC Shield

> **Modelo para copiar na raiz de todo projeto da SRC.** Baseado no OWASP Top 10:2025.
> Estas regras valem para todo código escrito ou revisado no projeto — por humanos ou por IA.
> Quando o Claude Code trabalhar no repositório, este arquivo é parte do contexto obrigatório.

## Regras gerais (valem sempre)

1. **Segredos nunca no código nem no Git.** Chaves, senhas e tokens só em variáveis de ambiente; `.env*` no `.gitignore`; usar `.env.example` com placeholders. Nunca colar segredo real em chat, log ou exemplo.
2. **Nunca confiar em entrada do usuário.** Toda entrada é validada **no servidor** (tipo, tamanho, formato) — validação no navegador é cortesia, não defesa.
3. **Menor privilégio em tudo:** usuários, chaves de API, usuário de banco, permissões cloud. Dar só o acesso mínimo necessário.
4. **Reduzir superfície:** não expor rota, painel, porta ou serviço que não esteja em uso. Desligar o que não usa.
5. **Falhar fechando:** em caso de erro ou dúvida, negar acesso — nunca liberar.
6. **Dependência nova só com revisão:** verificar procedência, manutenção e alertas antes de instalar qualquer pacote npm/pip.

## Regras por risco (OWASP Top 10:2025)

### A01 — Quebra de Controle de Acesso (risco nº 1)
- **Toda** rota de API verifica, **em cada requisição**, se o usuário autenticado pode acessar **aquele** recurso (ownership/role) — nunca confiar só no fato de estar logado.
- IDs previsíveis não são proteção: `/pedidos/123` deve negar acesso se o pedido 123 não for do usuário.
- Teste obrigatório: acesso cross-usuário retorna 403.

### A02 — Configuração Insegura
- Cabeçalhos de segurança sempre ativos: HSTS, CSP, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`.
- Nenhuma senha/config padrão em produção; nenhum painel administrativo exposto sem autenticação.
- Verificar nota A em securityheaders.com antes de publicar.

### A03 — Cadeia de Suprimentos
- Lockfile (`package-lock.json`/`requirements` travado) sempre commitado.
- Dependabot ligado + `npm audit`/`pip-audit` no CI falhando em severidade alta.
- Pacote novo: checar downloads, manutenção ativa e issues de segurança antes de adotar.

### A04 — Falhas Criptográficas
- HTTPS/TLS em **todo** tráfego (site, API, banco). HSTS ativo. Cookies `Secure`.
- Senhas com **argon2 ou bcrypt** — nunca texto puro, nunca MD5/SHA1.
- Dado sensível em repouso: usar a criptografia do banco gerenciado; não inventar criptografia própria.

### A05 — Injeção (SQLi / XSS)
- **Nunca montar SQL concatenando texto do usuário.** Só consultas parametrizadas ou ORM (Prisma/SQLAlchemy).
- Manter o escape padrão do React; `dangerouslySetInnerHTML` é proibido salvo revisão explícita com sanitização.
- CSP configurada como segunda linha de defesa contra XSS.

### A06 — Design Inseguro
- Fluxos sensíveis (recuperação de senha, convite, troca de e-mail, checkout) são desenhados **antes** de codar, perguntando: "como um atacante abusaria disto?"
- Recuperação de senha: token de uso único, com expiração curta, sem revelar se o e-mail existe.

### A07 — Falhas de Autenticação
- Não construir login do zero: usar provedor comprovado (Auth.js/Clerk/Supabase Auth).
- Rate limit + bloqueio após N tentativas falhas no login. MFA disponível (obrigatório para admin).
- Sessão expira e é revogável; logout invalida a sessão no servidor.

### A08 — Integridade de Software e Dados
- Deploy só via pipeline (CI) — nada de upload manual em produção.
- Dependências e actions do CI fixadas por versão; `dependency-review` em todo PR.

### A09 — Registro e Alerta
- Registrar login (sucesso/falha), erros e ações sensíveis em logs estruturados — **sem PII/segredo em texto puro**.
- Registrar sem alertar tem valor mínimo: erros e anomalias disparam alerta imediato (Sentry/borda).

### A10 — Tratamento Indevido de Erros
- Erro nunca "falha abrindo" (liberando acesso) — sempre nega.
- Usuário vê mensagem genérica; detalhes (stack, query, caminho) só no log interno.

## Regra para trabalho com IA (Claude Code)

- Todo código gerado é revisado por humano antes do merge.
- A IA nunca recebe segredos reais no prompt.
- Revisão OWASP mensal do código novo usando este arquivo como critério.

---
*Fontes: OWASP Top 10:2025 e Cheat Sheets (owasp.org) · NIST CSF 2.0 (nist.gov) · MDN Web Security. Versão 1.0 — 2026-07-02.*
