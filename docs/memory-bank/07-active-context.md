# 07 — Active Context

_Atualizado: 2026-08-15_

## Estado geral
**Reativado em 2026-08-15** (após dormência desde 2026-05-20). Raio-x + teste funcional confirmaram que o produto está **vivo e funcional em produção** (`tech10-portal.vercel.app`): loja, carrinho, checkout Pix e portal do cliente funcionam ponta-a-ponta, puxando estoque real do ERP. Foco da reativação: corrigir bug do carrinho, reduzir dívida técnica e iniciar a telemetria do funil. Ainda sem CI versionado.

## Git
- **Remote canônico**: `origin` → `https://github.com/DarlanCavalcante/portal_tech10.git`. **Sempre usar `origin/main`** como base (a `main` local antiga `d85d4cd` ficou atrás; a linhagem canônica é `46bdb3e…924da4d`).
- **HEAD de `origin/main`** (15/08): `924da4d` — `feat(telemetry): add log mode … (#140)`.
- **Entregue hoje (PRs)**: #137 fix do carrinho 409 · #138 remoção de 5 módulos mortos · #139 base de telemetria · #140 modo de log. Todos mergeados e **publicados** (via `vercel promote`).

## O que um novo agente deve saber primeiro
- Mudanças de produção vão em `SITE_RECUPERADO_TECH10/` (base canônica), **não** na raiz (legado). O root do projeto Vercel `tech10-portal` é essa pasta.
- Validar com `npm run validate:runtime` e `npm run smoke:runtime` dentro dessa pasta; JS solto dá para `node --check`.
- Nunca expor tokens no frontend; integrações via `/api/store/*` (proxy same-origin) → ERP `core.tech10cloud.com` = `revivah-erp`/`apps/api` (loja Medusa-compatível).
- **Carrinho canônico: `js/api-adapter.js`** (os módulos concorrentes foram removidos). O carrinho é server-side no ERP e só é mutável enquanto `status === 'ACTIVE'`.
- **Publicar no Vercel**: merge na `main` NÃO realiasa o domínio sozinho → `vercel promote <deploy-url>`.
- Telemetria: ativa em **modo log** (`TECH10_TELEMETRY_LOG=1`); ver eventos com `vercel logs https://tech10-portal.vercel.app` (filtrar `[telemetry]`).

Ver [[08-progress]] e [[09-decisions]].
