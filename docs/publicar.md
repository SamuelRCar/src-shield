# Publicar o pacote `@src/shield` no npm

O pacote de controles de código (`packages/shield`) pode ser publicado no **npm público**
para que qualquer projeto instale com um `npm install` simples — sem autenticação.
Enquanto não é publicado, projetos vendorizam (copiam) os controles; publicar troca
isso por uma dependência normal.

> Nada é publicado automaticamente. O workflow só roda quando **você disparar**.

## Passo 1 — Escopo no npm (uma vez)

O pacote se chama `@src/shield`. No npm, o escopo `@src` precisa **ser seu**:

1. Crie uma conta gratuita em [npmjs.com](https://www.npmjs.com) e faça `npm login` local.
2. Verifique o escopo:
   - Se você conseguir criar a organização **`src`** (npmjs.com → Add Organization), o nome
     `@src/shield` fica seu. 
   - Se `src` estiver **indisponível**, escolha outro escopo (ex.: sua conta `@seu-usuario`,
     ou uma org `src-shield`) e **me avise o escopo final** — eu renomeio o pacote e os
     imports (`packages/shield`, `templates/next-hardened`) numa passada.

> Como saber se `@src` está livre? `npm view @src/shield` — erro 404 sugere que o nome
> não existe; um 403 ao publicar significa que o escopo não é seu.

## Passo 2 — Token de automação

1. npmjs.com → seu avatar → **Access Tokens** → **Generate New Token** → tipo **Automation**.
2. No GitHub: repositório → **Settings → Secrets and variables → Actions → New repository
   secret** → nome **`NPM_TOKEN`**, valor = o token. (Nunca cole o token no código.)

## Passo 3 — Publicar

1. Confirme a versão em `packages/shield/package.json` (`version`). Para uma nova versão,
   suba o número (ex.: `0.1.0` → `0.1.1`) antes de publicar — o npm recusa republicar a mesma.
2. GitHub → aba **Actions** → **Publicar @src/shield** → **Run workflow**.
   (Ou crie uma tag `shield-v0.1.0` e faça push — dispara o mesmo workflow.)
3. O workflow roda typecheck + testes + build e só então publica. Acompanhe o resultado.

## Passo 4 — Como os projetos passam a consumir

Depois de publicado, qualquer projeto instala sem autenticação:

```bash
npm install @src/shield
```

```ts
import { securityHeaders, createRateLimiter, requireOwner } from "@src/shield";
```

E troca o arquivo vendorizado (`src/lib/security.ts`) pelo import real. Uso de cada
módulo: [README do pacote](../packages/shield/README.md).

## Versionamento

- `0.x` enquanto a API pode mudar; `1.0.0` quando estabilizar.
- Correção de segurança no pacote → nova versão patch publicada + aviso no CHANGELOG.
