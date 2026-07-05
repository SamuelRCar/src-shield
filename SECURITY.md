# Política de Segurança — SRC Shield

## Reportar uma vulnerabilidade

Encontrou uma falha de segurança **neste repositório** (no pipeline, no pacote
`@src/shield` ou no template)? Agradecemos a divulgação responsável.

- **Não** abra uma issue pública com detalhes da falha.
- Prefira o canal privado do GitHub: aba **Security → Report a vulnerability**
  (GitHub Private Vulnerability Reporting), quando habilitado neste repositório.
- Alternativamente, entre em contato com o mantenedor de forma privada.

Inclua, se possível: o que é a falha, como reproduzir, o impacto e uma sugestão
de correção. Retornamos assim que possível.

## Escopo

Esta política cobre o código deste repositório. Falhas em serviços de terceiros
que o kit apenas configura (Vercel, Cloudflare, Supabase, GitHub, etc.) devem ser
reportadas aos respectivos programas de segurança.

## Versões

O baseline é distribuído pela tag `v1`. Correções de segurança são publicadas
movendo a tag para o commit corrigido. Consuma sempre `@v1` para receber os ajustes.

## Lembrete honesto

O SRC Shield reduz drasticamente o risco automatizado, mas **nenhum controle isolado
garante proteção total**. Ele é uma base sólida — não um substituto para revisão
humana e auditoria em projetos críticos.
