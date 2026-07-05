# Rotina Mensal de Segurança — SRC Shield

> Segurança é processo, não projeto de uma vez (Etapa 7 / NIST: Governar).
> Executar **uma vez por mês** para cada projeto ativo — de preferência dia fixo.
> Duração alvo: 30–60 min por projeto. Registrar cada execução na tabela do fim.

## Checklist da rotina

### 1. Dependências (AT-07 / A03)
- [ ] Revisar e mergear os PRs do **Dependabot** pendentes (ler o changelog do que for major).
- [ ] Rodar `npm audit` / `pip-audit` local — zero severidade alta em aberto.
- [ ] Alguma dependência crítica abandonada? Planejar substituição.

### 2. Alertas e logs (A09)
- [ ] Revisar os erros do **Sentry** do mês — algum padrão suspeito (500 em série, rota estranha)?
- [ ] Revisar logs de **login**: picos de falha, horários/IPs anômalos, contas bloqueadas.
- [ ] Revisar disparos de **rate limit** — abuso sustentado de alguma rota/IP?
- [ ] Painel da borda (Vercel/Cloudflare): tráfego anômalo, origens estranhas, regras do WAF disparando.

### 3. Acessos e configuração (A01 / A02 / AT-10)
- [ ] Revisar usuários/permissões dos painéis (hospedagem, banco, GitHub) — remover quem saiu, reduzir o que sobrou.
- [ ] Alguma chave de API sem uso? Revogar. Alguma com mais permissão que o necessário? Reduzir.
- [ ] Re-testar cabeçalhos: **nota A** em securityheaders.com.

### 4. Revisão OWASP do código novo (Governar)
- [ ] Rodar a revisão do código escrito no mês contra `governanca/SEGURANCA.md`
      *(prompt: "Revise os commits deste mês contra o SEGURANCA.md e o OWASP Top 10:2025; liste achados com severidade e correção.")*
- [ ] Corrigir achados de severidade alta antes de fechar a rotina.

### 5. Recuperação (trimestral — a cada 3 rotinas)
- [ ] Executar **teste de restauração de backup** e registrar data + duração no playbook.
- [ ] Reler o playbook de incidentes — contatos e URLs ainda valem?

### 6. Checklist baseline
- [ ] Repassar o `governanca/checklist-baseline.md` do projeto — algum item regrediu?

## Registro de execuções

| Data | Projeto | Executado por | Achados/ações | Restore testado? |
|---|---|---|---|---|
| ____/____/______ | | | | |

---
*Versão 1.0 — 2026-07-02. Pode ser agendada como tarefa recorrente (`/schedule`) quando os projetos entrarem em produção.*
