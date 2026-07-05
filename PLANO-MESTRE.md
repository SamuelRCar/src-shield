# SRC Shield — Plano Mestre

> Sistema padronizado de segurança da SRC. Base normativa: OWASP Top 10:2025 e NIST CSF 2.0.
> Versão 1.0 — 2026-07-02.
>
> **Como usar este documento:** as Partes I–III dão a visão e a arquitetura; a Parte IV é o
> plano de execução em 8 etapas — cada etapa é autossuficiente (objetivo, tarefas,
> ferramentas, prompt pronto, entregáveis e validação). A Parte V define como aplicar o
> kit pronto em cada projeto. Execute as etapas em ordem; não pule a validação.

---

## PARTE I — Visão e princípios

### 1.1 O que o SRC Shield É

Um **baseline reutilizável** com 6 componentes, versionado em um repositório-modelo da SRC:

1. **Governança versionada** — regras de segurança (OWASP Top 10:2025), checklist baseline e rotina mensal, em arquivos Markdown copiados para todo projeto.
2. **Inventário padrão** — template para mapear o que cada projeto tem a proteger: pontos de entrada de dados, dependências, segredos, dados sensíveis.
3. **Pacote `@src/shield`** — biblioteca npm com os controles de código: cabeçalhos de segurança, rate limiter, validação de entrada, guard de autorização, logger seguro, helpers anti-CSRF.
4. **Repo-modelo Next.js "hardened"** — template de projeto já nascendo seguro: pacote integrado, Auth.js configurado, ORM parametrizado, `.env.example`, CI completo.
5. **Pipeline CI reutilizável** — GitHub Actions que barram automaticamente segredo vazado, código inseguro e dependência vulnerável em todo push.
6. **Operação** — monitoramento (Sentry + alertas), playbook de resposta a incidentes, procedimento de backup/restore e receitas de borda por hospedagem.

### 1.2 O que o SRC Shield NÃO é (expectativas)

- **Não é** um firewall/WAF ao vivo bloqueando atacantes — isso é papel da borda gerenciada (Cloudflare/Vercel), que o kit configura.
- **Não substitui** serviços gerenciados (WAF, provedor de auth, banco gerenciado) — ele os integra corretamente.
- **Não garante 100% de segurança** — nada garante. A meta é eliminar o risco automatizado e oportunista (a grande maioria) e detectar/responder rápido ao restante.
- Todo resultado gerado com IA (Claude Code) **exige revisão humana** antes de virar padrão.

### 1.3 Princípios (Seção 01)

- **Tripé C·I·D** — toda decisão protege Confidencialidade (impedir roubo de dados), Integridade (impedir adulteração) e/ou Disponibilidade (manter no ar). Ao avaliar um risco, perguntar: qual dos três ele ameaça?
- **Defesa em profundidade** — camadas somadas; cada uma cobre as falhas da outra. Nenhum controle isolado basta.
- **Reduzir superfície de ataque** — desligar o que não usa, expor o mínimo: a defesa mais barata que existe.
- **O inimigo real é automatizado** — robôs varrendo a internet testando falhas simples. Fechar as portas óbvias elimina a grande maioria do risco.

### 1.4 Modelo de responsabilidade compartilhada (Seção 04)

| Quem | Cuida de |
|---|---|
| **Provedor cloud** (Vercel/Netlify, banco gerenciado) | Segurança **da** nuvem: patches de servidor/SO, TLS emitido e renovado, CDN + proteção DDoS, criptografia em repouso, backups automáticos, cofre de variáveis |
| **SRC (o kit)** | Segurança **na** nuvem: código, autenticação, autorização, validação, configuração, segredos, monitoramento, resposta |

**O teto do cloud:** nenhum provedor conserta lógica insegura no código — rota que devolve dado de outro usuário (A01), fluxo de senha mal desenhado (A06), validação ausente. É exatamente aí que o kit atua.

---

## PARTE II — Organização NIST CSF 2.0 (Seção 05 — o esqueleto)

As 6 funções do NIST CSF 2.0 são as "gavetas" que transformam medidas soltas num sistema. Cada componente do kit responde a uma pergunta:

| Função | Pergunta | Componente do SRC Shield | Etapa |
|---|---|---|---|
| **Governar** | Quais são minhas regras, prioridades e responsabilidades? | `SEGURANCA.md` + checklist baseline + rotina mensal | 0, 7 |
| **Identificar** | O que eu tenho e preciso proteger? | Template de inventário (entradas, dependências, segredos, dados) | 0 |
| **Proteger** | Que barreiras eu coloco? | Pacote `@src/shield` + repo-modelo + CI + receitas de borda/dados | 1–4 |
| **Detectar** | Como percebo que estou sob ataque? | Logs estruturados + Sentry + alertas de borda | 5 |
| **Responder** | O que faço quando um incidente acontece? | Playbook de resposta a incidentes | 6 |
| **Recuperar** | Como volto ao normal? | Backups testados + procedimento de restore + lições aprendidas | 6 |

---

## PARTE III — Ameaças e prioridades

### 3.1 Matriz ataque → defesa → onde o kit resolve (Seção 03)

| # | Ataque | Como funciona (resumo) | Defesa principal | Componente / Etapa |
|---|---|---|---|---|
| AT-01 | Força bruta & credential stuffing | Robôs testam milhares de senhas/pares vazados no login | MFA + rate limit + bloqueio após N falhas + senha forte | `@src/shield` rateLimit (E2) + Auth.js no repo-modelo (E3) |
| AT-02 | SQL Injection | Comando SQL disfarçado num campo é concatenado na consulta | Consultas parametrizadas/ORM sempre; usuário de banco mínimo | Repo-modelo ORM (E3) + regra em `SEGURANCA.md` + Semgrep (E1) |
| AT-03 | XSS | Script malicioso injetado executa no navegador de visitantes | CSP + escape de saída (React padrão); evitar `dangerouslySetInnerHTML` | Headers CSP (E2) + regras (E0) |
| AT-04 | CSRF | Site malicioso força o navegador logado a executar ação | Tokens anti-CSRF + cookies SameSite + reautenticar ações sensíveis | Helpers csrf (E2) + repo-modelo (E3) |
| AT-05 | DDoS | Enxurrada de acessos falsos derruba o servidor | WAF + CDN + rate limit na borda; auto-scaling | Receitas de borda (E4) — o cloud resolve quase sozinho |
| AT-06 | Phishing & engenharia social | Enganar humano para entregar senha/código MFA | MFA resistente a phishing (passkeys), desconfiança treinada, nunca reusar senhas | Auth.js/passkeys (E3) + rotina/governança (E7) |
| AT-07 | Cadeia de suprimentos | Biblioteca npm/pip comprometida entra pelo build | Dependabot + npm/pip audit + lockfile + revisar pacote novo | Pipeline CI (E1) |
| AT-08 | Ransomware & sequestro de dados | Invasor criptografa/rouba dados e exige resgate | Backups automáticos, versionados e **testados**; menor privilégio; MFA admin | Dados (E4) + Recuperação (E6) |
| AT-09 | Man-in-the-middle | Atacante intercepta tráfego sem criptografia | HTTPS/TLS em tudo + HSTS + cookies Secure | Headers (E2) + hospedagem (E4 — padrão na Vercel/Netlify) |
| AT-10 | Configuração incorreta na nuvem | Bucket público, env exposta, painel sem senha | CIS Benchmarks, revisar permissões, fechar o que não usa | Receitas + revisão de config (E4) |
| AT-11 | Abuso de bots, scraping & APIs | Robôs raspam conteúdo, criam contas falsas, esgotam API | Rate limit por IP/conta + CAPTCHA/bot management + monitorar anomalias | rateLimit (E2) + borda (E4) + monitoramento (E5) |

### 3.2 Os 8 essenciais (Seção 07 — prioridade máxima em qualquer projeto)

Se um projeto só puder ter o mínimo, é isto — nesta ordem:

1. HTTPS forçado + cabeçalhos de segurança básicos
2. Login por provedor comprovado, com MFA e rate limit
3. Segredos fora do código; `.env` no `.gitignore`
4. Consultas parametrizadas / ORM em todo acesso ao banco
5. Validação de entrada no servidor
6. Dependabot + npm audit ligados
7. Backups automáticos e testados
8. Alertas de erro (Sentry) configurados

### 3.3 Cobertura OWASP Top 10:2025

| Risco | Coberto por |
|---|---|
| A01 Quebra de Controle de Acesso | Guard de autorização por menor privilégio em toda rota (E2/E3) |
| A02 Configuração Insegura | Headers (E2), receitas de config + CIS (E4) |
| A03 Cadeia de Suprimentos | Dependabot + audit + lockfile no CI (E1) |
| A04 Falhas Criptográficas | HTTPS/HSTS (E2/E4), hash argon2/bcrypt (E3), TLS no banco (E4) |
| A05 Injeção (SQLi/XSS) | ORM parametrizado (E3), CSP + escape (E2), Semgrep (E1) |
| A06 Design Inseguro | Revisão de fluxos sensíveis no repo-modelo (E3) + regras de design em `SEGURANCA.md` (E0) |
| A07 Falhas de Autenticação | Auth.js + MFA + rate limit + expiração de sessão (E3) |
| A08 Integridade de Software/Dados | Lockfile + dependency-review + pipeline verificado (E1) |
| A09 Registro e Alerta | Logs estruturados + Sentry + alertas (E5) |
| A10 Tratamento Indevido de Erros | Padrão "falhar fechando" + páginas de erro sem detalhes internos (E2/E3) |

---

## PARTE IV — Plano de execução em 8 etapas

> Cada etapa termina com validação objetiva. **Não avançar sem validar.**
> Os prompts são para usar com o Claude Code na sessão da etapa (um por fase).

### ETAPA 0 — Fundação e governança ✅ (esta sessão)

- **Objetivo:** regras escritas antes do código. NIST: Governar / Identificar.
- **Tarefas:**
  1. Criar a pasta do projeto com `CLAUDE.md`, `briefing.md` e este plano. ✅
  2. Escrever `governanca/SEGURANCA.md` — as regras OWASP Top 10:2025 em formato copiável para todo projeto. ✅
  3. Escrever `governanca/checklist-baseline.md` — o checklist da Seção 10, aplicável por projeto. ✅
  4. Escrever `operacao/playbook-incidentes.md` e `operacao/rotina-mensal.md` (templates). ✅
  5. Versionar tudo no Git (`/salvar`).
- **Entregáveis:** os 7 arquivos desta pasta.
- **Validação:** um dev consegue executar a Etapa 1 sozinho lendo este plano; nenhum item do checklist (Seção 10) fica sem etapa correspondente.

### ETAPA 1 — Pipeline CI de segurança

- **Objetivo:** nenhum segredo, código inseguro ou dependência vulnerável passa pelo push. OWASP A03/A08. NIST: Proteger + Detectar.
- **Pré-requisito:** criar o repositório `src-shield` no GitHub (manual em github.com ou instalar o `gh` CLI — pendência registrada no briefing).
- **Tarefas:**
  1. Criar workflow reutilizável `security.yml` (GitHub Actions, `workflow_call`) com 4 jobs:
     - **gitleaks** — varredura de segredos no código e no histórico;
     - **Semgrep** (SAST, regras `p/owasp-top-ten` + `p/nextjs`) — padrões inseguros no código;
     - **npm audit / pip-audit** (SCA) — dependências com CVE conhecida (falhar em `high`+);
     - **dependency-review** — bloqueia PR que introduz dependência vulnerável.
  2. Criar `dependabot.yml` padrão (npm + pip + github-actions, semanal, PRs agrupados).
  3. Documentar em `docs/ci.md` como um projeto consome o workflow (`uses: src/src-shield/.github/workflows/security.yml@v1`).
  4. Proteger a branch `main` (exigir CI verde + 1 revisão).
- **Ferramentas:** GitHub Actions, gitleaks, Semgrep, npm audit, pip-audit, Dependabot.
- **Prompt pronto:** *"Crie no repo src-shield um workflow reutilizável de segurança (gitleaks, Semgrep com regras OWASP, npm audit e pip-audit falhando em high, dependency-review) + dependabot.yml. Verifique se há segredos expostos no código ou no histórico. Documente como outro repo consome o workflow."*
- **Entregáveis:** `.github/workflows/security.yml`, `dependabot.yml`, `docs/ci.md`.
- **Validação (teste de fogo):** plantar num branch de teste um segredo falso (`AWS_KEY=AKIA...`) e uma dependência sabidamente vulnerável → o CI **deve ficar vermelho** nos dois casos; remover → verde.

### ETAPA 2 — Pacote `@src/shield`

- **Objetivo:** os controles de código empacotados uma vez, reusados em todo projeto. OWASP A01/A02/A04/A05/A07/A10. NIST: Proteger.
- **Tarefas** (um módulo por vez, com testes unitários — Vitest):
  1. `headers` — conjunto pronto para `next.config.js`: HSTS, CSP (com preset por tipo de projeto: institucional/SaaS/e-commerce), `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`; redirect HTTP→HTTPS.
  2. `rateLimit` — limitador por IP/conta para rotas de API e login (janela deslizante; storage pluggable: memória p/ dev, Upstash/Redis p/ produção); resposta 429 padronizada.
  3. `validate` — helpers Zod para validação de entrada **no servidor** (tipo, tamanho, formato), com mensagens que não vazam detalhes internos.
  4. `authz` — guard de autorização por menor privilégio: `requireOwner(resource)` / `requireRole(role)` verificado **em cada requisição** — a defesa contra o risco nº 1 (A01).
  5. `logger` — logs estruturados (JSON) de login, erros e ações sensíveis, com **redação automática de PII/segredos**.
  6. `csrf` — geração/verificação de token anti-CSRF + preset de cookies (`SameSite=Lax/Strict`, `Secure`, `HttpOnly`).
  7. `errors` — handler padrão "falhar fechando" (A10): erro nega acesso por padrão e nunca expõe stack/detalhe interno ao usuário.
- **Prompt pronto:** *"Implemente o módulo [X] do pacote @src/shield conforme o PLANO-MESTRE.md (Etapa 2), com testes unitários cobrindo os casos de ataque da matriz AT-XX correspondente."*
- **Entregáveis:** pacote npm publicável (GitHub Packages ou npm privado) com os 7 módulos + testes + README de uso.
- **Validação:** todos os testes passam; app de exemplo com o módulo `headers` obtém **nota A** em securityheaders.com; teste de rate limit bloqueia a 11ª requisição/minuto.

### ETAPA 3 — Repo-modelo Next.js "hardened"

- **Objetivo:** todo projeto novo da SRC nasce seguro por padrão. OWASP A01/A04/A05/A06/A07. NIST: Proteger.
- **Tarefas:**
  1. Criar template (GitHub template repository) Next.js App Router + TS integrando todos os módulos do `@src/shield`.
  2. Autenticação com **Auth.js**: hash argon2 (se houver senha própria), MFA opcional, expiração/rotação de sessão, rate limit + bloqueio após N falhas no login, fluxo de recuperação de senha desenhado contra abuso (A06).
  3. Banco via ORM (**Prisma**) — zero SQL concatenado; usuário de banco com privilégio mínimo documentado; TLS na conexão.
  4. `.env.example` completo + `.gitignore` excluindo `.env*`; segredos só em variáveis de ambiente.
  5. CI consumindo o workflow da Etapa 1; Sentry pré-configurado (chave via env).
  6. Testes de segurança incluídos no template: acesso cross-usuário (deve dar 403), força bruta no login (deve bloquear), entrada inválida (deve rejeitar com 400 genérico).
- **Prompt pronto:** *"Implemente autenticação com Auth.js no repo-modelo: hash argon2, MFA opcional, expiração de sessão e rate limit no login usando @src/shield. Adicione checagem de autorização em cada rota de API para o usuário só acessar os próprios dados, e os três testes de segurança do plano."*
- **Entregáveis:** repositório template `src-shield-next` funcional.
- **Validação:** os 3 testes de segurança passam; tentar acessar dado de outro usuário logado → negado; 10 senhas erradas → bloqueio; deploy de teste na Vercel com nota A em securityheaders.com.

### ETAPA 4 — Borda, hospedagem e dados (multi-hospedagem)

- **Objetivo:** proteção de disponibilidade e configuração correta em **qualquer** hospedagem usada pela SRC. OWASP A02/A04. NIST: Proteger. Resolve AT-05, AT-08 (backup), AT-09, AT-10.
- **Tarefas** — escrever `receitas/` com guia passo a passo por plataforma:
  1. `receitas/vercel.md` — WAF da Vercel, proteção DDoS, rate limiting na borda, Environment Variables, headers confirmados.
  2. `receitas/netlify.md` — equivalentes Netlify (headers via `_headers`/`netlify.toml`, env vars, proteção de borda).
  3. `receitas/cloudflare.md` — Cloudflare na frente de **qualquer** host: WAF managed rules, bot management/CAPTCHA, rate limiting rules, DDoS, DNS proxied.
  4. `receitas/banco.md` — Supabase/Neon/RDS: TLS obrigatório, usuário de aplicação com privilégio mínimo (nunca root), criptografia em repouso (padrão gerenciado), backups automáticos + point-in-time, RLS quando Supabase.
  5. `receitas/checklist-config.md` — revisão de configuração baseada em CIS Benchmarks: fechar todo serviço/porta/painel não usado (reduzir superfície).
- **Prompt pronto:** *"Escreva a receita de borda para [plataforma] conforme a Etapa 4 do PLANO-MESTRE.md, com passos verificáveis e capturas dos pontos de configuração da documentação oficial."*
- **Entregáveis:** 5 receitas versionadas.
- **Validação:** aplicar cada receita num projeto de teste; DDoS/rate-limit simulado (ex.: `hey`/`autocannon` moderado num endpoint de teste próprio) é limitado pela borda; conexão sem TLS ao banco é recusada.

### ETAPA 5 — Monitoramento e alertas

- **Objetivo:** perceber o ataque enquanto acontece, não semanas depois. OWASP A09. NIST: Detectar.
- **Tarefas:**
  1. Padrão de logs estruturados (módulo `logger` do pacote) para login, erros e ações sensíveis — **sem dados pessoais em texto puro**.
  2. Integração Sentry no repo-modelo: alertas de erro por e-mail imediatos.
  3. Alertas de tráfego anômalo na borda (Vercel Analytics/Cloudflare notifications) — documentar em `receitas/`.
  4. Definir os 5 eventos que **sempre** geram alerta: pico de logins falhos, erro 500 em série, disparo de rate limit sustentado, alteração de configuração de produção, dependência crítica vulnerável.
- **Prompt pronto:** *"Adicione logs estruturados para login, erros e ações sensíveis (sem gravar dados pessoais em texto puro). Integre o Sentry para alertas de erro e configure os 5 alertas obrigatórios do plano."*
- **Entregáveis:** logger padrão no pacote + Sentry no template + doc de alertas.
- **Validação (teste de fogo):** provocar um erro de teste em produção de staging → o alerta chega ao e-mail/celular em minutos.

### ETAPA 6 — Resposta e recuperação

- **Objetivo:** saber agir e voltar ao ar. NIST: Responder / Recuperar. Resolve a parte "e se acontecer" do AT-08.
- **Tarefas:**
  1. Finalizar `operacao/playbook-incidentes.md` (template criado na Etapa 0) com os dados reais da SRC: contatos, responsáveis, canais.
  2. Configurar backups automáticos do banco em cada projeto (padrão gerenciado + verificação).
  3. **Executar e documentar um teste de restauração** — backup só vale se a restauração já foi testada.
  4. Procedimento de revogação rápida: chaves de API, sessões de usuários, tokens de deploy.
- **Prompt pronto:** *"Complete o playbook de incidentes com [contatos] e configure backups automáticos do banco com um teste de restauração documentado passo a passo."*
- **Entregáveis:** playbook preenchido + relatório do teste de restauração.
- **Validação:** restauração de backup executada com sucesso em ambiente de teste, com tempo medido e registrado.

### ETAPA 7 — Manutenção contínua + piloto real

- **Objetivo:** segurança é processo, não projeto de uma vez. NIST: Governar. Também cobre o fator humano (AT-06).
- **Tarefas:**
  1. Ativar a `operacao/rotina-mensal.md` como prática (agendável via `/schedule` ou lembrete recorrente).
  2. **Piloto:** aplicar o kit completo ao `casaconta-app` (Next.js + Supabase — candidato ideal): rodar o processo da Parte V para projeto existente, medir o esforço e registrar os ajustes necessários no kit.
  3. Revisar o kit com as lições do piloto → publicar `v1.0` do SRC Shield.
  4. Definir versionamento do kit (tags `v1.x`) e processo de atualização dos projetos que o consomem.
- **Validação:** `casaconta-app` passa 100% do `checklist-baseline.md`; rotina mensal executada pela primeira vez e registrada.

### Roadmap e dependências

| Etapa | Depende de | Estimativa (sessões de trabalho) |
|---|---|---|
| 0 Fundação | — | ✅ concluída |
| 1 Pipeline CI | repo GitHub criado | 1–2 |
| 2 Pacote `@src/shield` | E1 (CI valida o pacote) | 3–4 (um módulo por vez) |
| 3 Repo-modelo | E1 + E2 | 2–3 |
| 4 Borda e dados | independente (paralelizável com E2/E3) | 1–2 |
| 5 Monitoramento | E2 (logger) + E3 | 1 |
| 6 Resposta/recuperação | E4 (backups) | 1 |
| 7 Manutenção + piloto | todas | 2–3 |

---

## PARTE V — Como aplicar o kit em cada projeto

### Projeto novo
1. Criar a partir do template `src-shield-next` (Etapa 3).
2. Copiar `SEGURANCA.md` e `checklist-baseline.md` para o repo; preencher o inventário (o que o projeto tem: entradas, dependências, segredos, dados sensíveis).
3. Aplicar a receita da hospedagem escolhida (`receitas/`).
4. Configurar Sentry + alertas; preencher o playbook de incidentes com os contatos do projeto.
5. Percorrer o checklist inteiro antes do primeiro deploy público. **Nenhum item aberto = pode publicar.**

### Projeto existente (auditoria + retrofit)
1. **Auditoria OWASP:** revisar o código contra `SEGURANCA.md` (prompt: *"Revise este repositório contra as regras do SEGURANCA.md e o OWASP Top 10:2025; liste cada achado com severidade, arquivo e correção sugerida"*).
2. **Gap analysis:** preencher o `checklist-baseline.md` — o que já existe, o que falta.
3. Corrigir na ordem dos **8 essenciais** (Parte III.2), depois o restante do checklist.
4. Ligar o CI de segurança (Etapa 1) — a partir daí nada regride.
5. Entrar na rotina mensal.

### Por tipo de projeto
- **Site institucional:** essenciais 1, 3, 6, 8 + borda. Sem auth complexa → superfície mínima.
- **SaaS:** tudo, com ênfase em A01 (cada usuário só vê os próprios dados) e A07 (login forte). Testes cross-usuário obrigatórios.
- **E-commerce:** tudo + **PCI DSS via provedor de pagamento (Stripe/Mercado Pago)** — nunca tocar no dado do cartão diretamente; anti-bot no checkout (AT-11).

---

## PARTE VI — Fontes (Seção 11 — usar somente estas como base)

- **OWASP** — Top 10:2025, ASVS, Cheat Sheets — owasp.org
- **NIST** — CSF 2.0, SP 800-218/SSDF — nist.gov
- **MDN Web Docs — Web Security** — developer.mozilla.org
- **Docs oficiais Vercel/Next.js e Cloudflare** — headers, WAF, DDoS, env vars
- **PCI DSS 4.0** — pcisecuritystandards.org (pagamentos)
- **CIS Benchmarks** — cisecurity.org (configuração segura)

> Evitar conselhos soltos de blogs sem procedência. Toda regra nova no kit cita a fonte.
