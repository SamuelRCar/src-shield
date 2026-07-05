# Playbook de Resposta a Incidentes — SRC Shield

> **Template — copiar por projeto e preencher os campos [entre colchetes] ANTES de precisar.**
> Escrito antes do incidente, seguido durante. NIST: Responder / Recuperar.

## 0. Contatos e papéis (preencher já)

| Papel | Quem | Contato |
|---|---|---|
| Responsável técnico (decide) | [nome] | [telefone/e-mail] |
| Suporte da hospedagem | Vercel/Netlify/Cloudflare | [link do suporte + login] |
| Suporte do banco | Supabase/Neon | [link do suporte] |
| Cliente/dono do projeto | [nome] | [contato] |

**Onde ficam:** painel da hospedagem: [URL] · painel do banco: [URL] · Sentry: [URL] · repositório: [URL]

## 1. Classificar a severidade (primeiros 5 minutos)

| Nível | Situação | Reação |
|---|---|---|
| **SEV-1** | Dados de usuários expostos/roubados, site comprometido (defacement), ransomware | Agir agora, avisar o responsável imediatamente |
| **SEV-2** | Site fora do ar (DDoS), credencial vazada sem evidência de uso | Agir em até 1h |
| **SEV-3** | Tentativas bloqueadas em volume anormal, dependência crítica vulnerável | Agir no dia |

Registrar desde o início: **data/hora, o que foi visto, onde** (vai virar a linha do tempo do incidente).

## 2. Conter (parar o sangramento)

Na ordem, conforme o caso:

1. **Revogar credenciais comprometidas:** trocar chaves de API no painel do provedor; rotacionar `secrets` de sessão/JWT (invalida todas as sessões); trocar senha do banco.
2. **Encerrar sessões ativas:** invalidar tokens/sessões no provedor de auth.
3. **Bloquear na borda:** regra de firewall na Cloudflare/Vercel para IP/país/padrão do ataque; modo "Under Attack" (Cloudflare) se DDoS.
4. **Congelar deploys:** pausar o pipeline; se o código foi comprometido, reverter para o último deploy sabidamente bom.
5. **Se ransomware/comprometimento de dados:** isolar (revogar todo acesso ao banco), **não apagar nada** (preservar evidência), partir para o restore.

## 3. Cenários rápidos

### Credencial/segredo vazado (no Git, log ou chat)
1. Revogar/rotacionar a credencial no provedor — **antes** de limpar o Git.
2. Verificar logs de uso da credencial no período exposto.
3. Limpar o histórico (BFG/`git filter-repo`) e forçar push com o time avisado.
4. Registrar: qual segredo, período exposto, evidência de uso indevido.

### Site fora do ar (DDoS)
1. Confirmar que é ataque (painel de tráfego) e não bug/deploy.
2. Cloudflare: ativar "Under Attack Mode" + regras de rate limit agressivas.
3. Acionar o suporte da hospedagem se persistir.

### Usuário acessando dados de outro (A01 explorado)
1. Desativar a rota/feature afetada (feature flag ou deploy de correção imediato).
2. Medir a extensão nos logs: quem acessou o quê, desde quando.
3. Corrigir a checagem de autorização + teste cross-usuário antes de reativar.

### Ransomware / dados sequestrados
1. Isolar acesso ao banco (revogar credenciais). Não negociar antes de avaliar o backup.
2. Restaurar do último backup íntegro (ver §4) em ambiente novo.
3. Identificar a porta de entrada antes de religar (senha vazada? dependência? config?).

## 4. Recuperar (restore)

1. Localizar o último backup íntegro (point-in-time se disponível): [onde/como — preencher com o procedimento do banco do projeto].
2. Restaurar em instância **nova** (não sobrescrever a comprometida — é evidência).
3. Validar integridade dos dados restaurados (contagens, registros recentes, login de teste).
4. Apontar a aplicação para a instância restaurada; monitorar de perto por 48h.

*Tempo do último teste de restauração: [data + duração] — se tem mais de 90 dias, testar de novo.*

## 5. Comunicar

- **Interno:** responsável técnico informado desde a classificação.
- **Cliente/usuários:** se dados pessoais foram expostos, comunicar o dono do projeto e avaliar obrigações da **LGPD** (comunicação à ANPD e aos titulares quando houver risco relevante) — registrar a decisão e o motivo.
- Nunca confirmar detalhes publicamente antes de conter o incidente.

## 6. Pós-incidente (até 1 semana depois)

1. Linha do tempo completa: detecção → contenção → recuperação (com horários).
2. Causa raiz: qual porta estava aberta? Qual item do `checklist-baseline.md` teria evitado?
3. Correção permanente aplicada + item novo no checklist/`SEGURANCA.md` se a lição for nova.
4. Atualizar este playbook com o que funcionou e o que faltou.

---
*Versão 1.0 — 2026-07-02. Template do SRC Shield — preencher por projeto na Etapa 6.*
