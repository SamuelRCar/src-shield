# Checklist de configuração — revisão anti-AT-10

> Etapa 4 do SRC Shield. Inspirado nos CIS Benchmarks: a porta aberta por
> descuido de configuração é o ataque mais barato que existe. Rodar este
> checklist **antes do primeiro deploy público** e depois **na rotina mensal**.
> Princípio único: fechar/desligar tudo que não está em uso.

**Projeto:** ____________________  **Data:** ____ / ____ / ______

## 1. Contas e painéis (a chave do reino)

- [ ] **MFA ativado** em TODOS os painéis: GitHub, Vercel/Netlify, Cloudflare, banco (Supabase/Neon), Sentry, registrador de domínio
- [ ] Membros de cada painel revisados — quem saiu foi removido; papel mínimo para quem ficou
- [ ] Nenhuma conta compartilhada; nenhuma senha reutilizada (gerenciador de senhas)
- [ ] Tokens/API keys: com escopo mínimo, com expiração, e inventariados (sabemos quantos existem e onde)

## 2. Repositório (GitHub)

- [ ] Repo privado (ou público de propósito, sem nada sensível no histórico)
- [ ] Branch `main` protegida: PR + CI verde obrigatórios
- [ ] Secret scanning + Dependabot alerts habilitados nas configurações do repo
- [ ] Actions de terceiros revisadas; `GITHUB_TOKEN` com permissões mínimas (`permissions: contents: read` nos workflows — padrão do kit)

## 3. Hospedagem

- [ ] Variáveis de ambiente separadas por ambiente; produção nunca em preview
- [ ] Deploy previews protegidos (senha/auth) — nada de staging público
- [ ] Domínios extras (`*.vercel.app`, `*.netlify.app`, subdomínios antigos) redirecionando ou fora do ar
- [ ] Nenhum serviço/feature da plataforma ligado sem uso (forms, analytics de terceiros, integrações antigas)
- [ ] Logs de acesso/painel disponíveis para a rotina mensal

## 4. Banco e storage

- [ ] Banco sem acesso público direto (allowlist/subnet privada quando o provedor permitir)
- [ ] Buckets/storage **privados por padrão**; público só o que é explicitamente público (e listado aqui): ____________________
- [ ] Nenhuma porta/serviço extra exposto (aplicável a VPS: `ss -tlnp` — só o esperado)
- [ ] Credenciais de banco distintas por ambiente

## 5. Domínio e e-mail (protege contra phishing com a sua marca — AT-06)

- [ ] DNSSEC ativado (registrador + DNS)
- [ ] **SPF**, **DKIM** e **DMARC** (`p=quarantine` ou `reject`) configurados — mesmo que o domínio não envie e-mail (`v=spf1 -all`), senão qualquer um envia "como você"
- [ ] Registro do domínio com renovação automática e lock de transferência

## 6. Aplicação

- [ ] Nenhuma rota de debug/admin exposta sem autenticação (`/api/debug`, `/admin`, painéis de framework)
- [ ] Mensagens de erro de produção genéricas (conferir uma URL inexistente e um erro forçado)
- [ ] `robots.txt`/sitemap não revelam rotas internas
- [ ] Dependência ou feature desativada = removida do código (superfície menor), não só comentada

## Registro

| Data | Revisor | Itens abertos | Prazo de correção |
|---|---|---|---|
| | | | |
