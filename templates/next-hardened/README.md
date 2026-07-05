# src-shield-next — Template Next.js hardened

Todo projeto novo da SRC nasce deste template (Etapa 3 do [SRC Shield](../../PLANO-MESTRE.md)).
Ele já vem com os controles do baseline ligados:

| Defesa | Onde | Checklist |
|---|---|---|
| Cabeçalhos de segurança (HSTS, CSP, nosniff, DENY) | [next.config.ts](next.config.ts) via `@src/shield` | item 1 |
| Login por provedor (Auth.js) + argon2id + sessão 8h | [src/auth.ts](src/auth.ts) | item 2 |
| Rate limit + bloqueio após 5 falhas/15min no login | [src/lib/login-guard.ts](src/lib/login-guard.ts) | item 2 |
| MFA TOTP opcional (obrigatório p/ admin — política) | [src/lib/mfa.ts](src/lib/mfa.ts) + `/api/mfa` | item 2 |
| Autorização por dono em toda rota (`requireOwner`) | [src/services/notes.ts](src/services/notes.ts) | item 2 |
| Validação de entrada no servidor (Zod) | services + rotas | item 3 |
| ORM (Prisma) — zero SQL concatenado | [prisma/schema.prisma](prisma/schema.prisma) | item 4 |
| Logs estruturados com redação (login, erros) | [src/lib/shield.ts](src/lib/shield.ts) | item 5 |
| Erros "falham fechando" com id de correlação | rotas via `toPublicError` | item 5 |
| Segredos só em env (`.env` fora do Git) | [.env.example](.env.example) | item 3 |
| CI de segurança (gitleaks/Semgrep/audit) + testes | [.github/workflows/security.yml](.github/workflows/security.yml) | item 3 |

## Começando um projeto

```bash
# 1. Criar a partir do template (GitHub: "Use this template") e clonar
# 2. Configurar segredos
cp .env.example .env          # preencher; nunca commitar
npx auth secret               # gera AUTH_SECRET

# 3. Banco e usuário inicial
npm install
npx prisma migrate dev        # cria as tabelas
npm run user:create -- voce@empresa.com "senha-forte-12+" admin

# 4. Rodar
npm run dev                   # http://localhost:3000  (login em /login)

# 5. Validar segurança
npm test                      # 3 testes obrigatórios do plano + apoio
```

Depois do primeiro deploy: conferir **nota A** em securityheaders.com e aplicar a
receita de borda da hospedagem (`receitas/` no repo src-shield — Etapa 4).

## Banco com privilégio mínimo (checklist item 4)

As migrações rodam com papel elevado; a aplicação usa um papel restrito.
No Postgres (Supabase/Neon/RDS):

```sql
CREATE ROLE app_user LOGIN PASSWORD 'senha-forte-gerada';
GRANT CONNECT ON DATABASE app TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
```

`DATABASE_URL` da aplicação usa `app_user` com `sslmode=require`.
Sem `DROP`, sem `CREATE`, sem superusuário — um SQL injection que passe
não consegue destruir o schema.

## O padrão a seguir (toda entidade nova)

`src/services/notes.ts` é o molde: **requireUser** no início, **requireOwner**
em todo acesso a item, **parseOrThrow** em toda escrita, db por parâmetro
(produção passa `getDb()`, teste passa fake). Copie o padrão e os testes.

## Sentry (Etapa 5)

`SENTRY_DSN` já está no `.env.example`. A instrumentação entra na Etapa 5:
`npx @sentry/wizard@latest -i nextjs` e configurar os 5 alertas obrigatórios
do PLANO-MESTRE.md.

## Fluxos sensíveis ainda não incluídos (A06 — desenhar antes de codar)

Recuperação de senha, convite de usuários e troca de e-mail **não** vêm no
template de propósito: cada projeto desenha o fluxo contra abuso (token de uso
único com expiração curta, sem revelar se o e-mail existe) antes de implementar.
Regras em `governanca/SEGURANCA.md` (A06/A07).
