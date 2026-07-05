# Receita de dados — banco gerenciado (Supabase · Neon · RDS)

> Etapa 4 do SRC Shield. Resolve A04 (criptografia), AT-02 (SQLi — privilégio),
> AT-08 (ransomware — backups) e o checklist item 4.
> Regra de ouro: o banco gerenciado já criptografa em repouso e faz backup —
> o nosso trabalho é TLS, privilégio mínimo e testar a restauração.

## Princípios (valem para qualquer banco)

1. **TLS obrigatório** na conexão: `?sslmode=require` no `DATABASE_URL` (ideal: `verify-full` com CA quando o provedor documentar).
2. **Usuário da aplicação com privilégio mínimo** — nunca `postgres`/root. SQL pronto no README do template (`app_user` com SELECT/INSERT/UPDATE/DELETE apenas; sem DROP/CREATE/superuser). Migrações rodam com papel elevado separado, só no deploy.
3. **Backups automáticos ativos + restauração testada** — backup não testado não existe (Etapa 6 documenta o teste).
4. **Rede mínima**: allowlist de IP quando o provedor suportar; connection pooler para serverless.
5. Uma credencial por ambiente; rotação ao menos anual e sempre em suspeita de vazamento (playbook).

## Supabase

- **TLS**: já exigido por padrão; conferir `sslmode=require` na string (usar a do *connection pooler* para Vercel/Netlify).
- **RLS (Row Level Security)**: ativar em TODAS as tabelas (`ALTER TABLE x ENABLE ROW LEVEL SECURITY;`), mesmo com acesso só server-side via Prisma — é a segunda camada se uma chave vazar. Se o front usar a `anon key` direto, RLS é a ÚNICA barreira: políticas por `auth.uid()` obrigatórias.
- **Chaves**: `service_role` NUNCA no navegador/`NEXT_PUBLIC_*`; ideal: nem usá-la na aplicação (Prisma conecta via Postgres direto com `app_user`).
- **Backups**: diários no plano Pro; **PITR** (point-in-time) como add-on para produção séria. Anotar no checklist qual está ativo.
- Painel: MFA na conta, membros mínimos.

## Neon

- **TLS**: obrigatório por padrão (`sslmode=require` já vem na string).
- **Privilégio mínimo**: criar role `app_user` (SQL do template); a role padrão do Neon é dona do schema — não usar na aplicação.
- **Backups/PITR**: *history retention* dá restauração point-in-time via **branches** — restaurar = criar branch em um timestamp. Testar isso é o teste de restauração da Etapa 6 (barato e rápido).
- Branch de desenvolvimento separado de produção (dados de teste ≠ dados reais).

## RDS (PostgreSQL)

- **Criptografia em repouso**: marcar *Enable encryption* NA CRIAÇÃO (não dá para ligar depois sem snapshot+restore).
- **TLS forçado**: parameter group com `rds.force_ssl=1`.
- **Rede**: instância em subnet privada; security group liberando só o backend/pooler — nunca `0.0.0.0/0`.
- **Backups**: automated backups ativos (retenção ≥ 7 dias) + snapshot manual antes de mudanças grandes.
- IAM: sem credenciais root da AWS na aplicação; usuário IAM próprio com política mínima.

## Como verificar (validação da Etapa 4)

| Teste | Esperado |
|---|---|
| `psql "postgresql://app_user:...@host/db?sslmode=disable"` | **conexão recusada** |
| `psql ... -c "\du app_user"` | sem `Superuser`, sem `Create DB`, sem `Create role` |
| `psql ... -c "DROP TABLE \"User\";"` conectado como `app_user` | **permission denied** |
| Painel do provedor | backups automáticos ativos; PITR/retention configurado |
| String de conexão da aplicação | usa `app_user` + `sslmode=require` |
