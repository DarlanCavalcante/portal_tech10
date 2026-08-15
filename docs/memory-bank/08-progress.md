# 08 — Progress

_Atualizado: 2026-08-15. Loja/carrinho/checkout/portal re-testados ao vivo em produção nesta sessão._

## Funciona / entregue ✅
- ✅ Site institucional legado (raiz) — landing single-page, WhatsApp lead.
- ✅ Runtime canônico `SITE_RECUPERADO_TECH10/` com rotas `/`, `/loja`, `/carrinho`, `/checkout`, `/pedido-confirmado`, `/portal`, `/status` (definidas em `vercel.json`).
- ✅ Funções serverless: proxy same-origin `/api/store/*`, `/api/health`, `/api/runtime-config`, `/api/telemetry`.
- ✅ **Loja funcional ponta-a-ponta** (raio-x 15/08): catálogo puxa ~28 produtos reais do ERP (imagem/preço/estoque/categorias), modal de produto, carrinho, checkout Pix (Retirada/Entrega + Pix Mercado Pago) e portal do cliente. Sem erros de console.
- ✅ **Carrinho: recuperação de estado travado (409)** — carrinho não-ACTIVE não prende mais o cliente (`carrinho.html`, PR #137).
- ✅ **Carrinho consolidado** — 5 módulos mortos removidos; `js/api-adapter.js` canônico (PR #138).
- ✅ **Telemetria do funil (Frente 1 — CONCLUÍDA)** — `js/telemetry.js` + `api/telemetry.js`; eventos do funil **persistem no ERP** via `POST https://core.tech10cloud.com/api/portal-analytics/events` (público, já existente → `PortalAnalyticsEvent`). Verificado end-to-end (`[telemetry-forward] 202`). Ativado com `TECH10_ERP_TELEMETRY_URL` no Vercel; modo log opcional (`TECH10_TELEMETRY_LOG`). (PRs #139/#140/#142/#143).
- ✅ Contrato de ambiente multi-tenant (`.env.example`) + scripts de validação/smoke.
- ✅ PWA (`sw.js`, `manifest.json`); entrada pública do portal do cliente com deep links; logo canônica SVG.
- ✅ Projeto Vercel dedicado `tech10-portal` com root `SITE_RECUPERADO_TECH10` (confirmado no ar).

## Em aberto / a fazer ⏳
- ⏳ **Verificar o checkout de fato** — no teste paramos antes de "Gerar Pix" (não criamos pedido no ERP). Falta confirmar que o pedido é criado + Pix emitido + webhook marca como pago ponta-a-ponta.
- ⏳ **Painel interno** para a equipe (Frente 2) — dados já persistem em `PortalAnalyticsEvent`; falta a **rota/serviço de leitura** no ERP (`portalAnalytics.controller` só tem `POST /events`) + a **tela**.
- ⏳ **Jornada pós-aprovação da O.S.** (Frente 3).
- ⏳ **Transparência financeira básica** (Frente 4).
- ⏳ Dados de produto pobres (abas Especificações/Descrição vazias — "Nenhuma característica listada").
- ⏳ CI/CD versionado (nenhum workflow); automatizar `validate:runtime`/`smoke:runtime`.
- ⏳ Consolidação profunda do carrinho: unificar `api-client.js`/`cart-storefront.js` (ainda vivos em index/produtos) no `api-adapter.js`.

## Resolvido (antes "a investigar")
- ✅ Backend de catálogo/checkout: é o **`revivah-erp`/`apps/api`** (`publicStorefront.controller.ts`, loja **Medusa-compatível**), NÃO um Medusa dedicado. Servido em `core.tech10cloud.com`.
- ✅ Estado de produção pós 2026-05-20: **vivo e funcional** (re-testado ao vivo).
- ✅ Projeto Vercel dedicado + domínio: concluído (`tech10-portal`, root `SITE_RECUPERADO_TECH10`).
