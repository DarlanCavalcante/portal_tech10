# 09 — Decisions (log append-only)

Registro cronológico de decisões. Adicione no fim; não reescreva o histórico.

---

## 2026-05-11 — Runtime standalone como base canônica
`SITE_RECUPERADO_TECH10/` promovido a base canônica de publicação do tenant Tech10 (site + loja + portal + serverless). Formalizado em `docs/adr/ADR-001-RUNTIME-STANDALONE-TECH10.md` e `docs/DECISAO_ARQUITETURAL_PUBLICACAO_STANDALONE_TECH10.md`.

## 2026-05-11 — Segurança: proxy same-origin
Integração com backend da loja só via `/api/store/*` (server-to-server). Tokens (`TECH10_STORE_BEARER_TOKEN`, `TECH10_STORE_API_KEY`, etc.) tratados como segredos de deploy, nunca no frontend (`SECURITY.md`).

## 2026-05-13 — Diagnóstico da base de produção
Confirmado que a produção pública `https://tech10.loja.tech10cloud.com/` é servida por `SITE_RECUPERADO_TECH10/`. O projeto `tech10-informatica` deixa de ser tratado como base de produção (vira lab de identidade/histórico).

## 2026-05-13 — Slug canônico `tech10`
Slug público canônico passa a ser `tech10`; `revivah-tech` e aliases `vivacommerce*` mantidos apenas como compatibilidade de transição. Carrinho canônico: `cart-storefront.js` + `tech10_storefront_cart_id`.

## 2026-05-13 — Direção: próximas frentes do portal
Definidas 4 frentes (telemetria → painel interno → pós-aprovação → financeiro), iniciando por telemetria. Ver [[05-portal-cliente-frentes]].

## 2026-05-20 — Último trabalho de runtime
Commits `fix(runtime): restore branded store header` e `clamp assisted cart to live stock`. Projeto dormente a partir daqui.

## 2026-08-14 — Memory Bank criado
Criado este banco de memória em `docs/memory-bank/` para leitura por agentes de IA em sessões futuras, evitando reanálise de todo o código.

## 2026-08-15 — Reativação: raio-x confirmou produto vivo e funcional
Teste funcional ponta-a-ponta em `tech10-portal.vercel.app`: catálogo carrega ~28 produtos reais do ERP (imagem/preço/estoque/categorias), modal de produto, carrinho (funil Seleção→Atendimento→Fechamento), checkout Pix (dados + resumo) e portal do cliente. **Não é base quebrada** — "virar produto" = completude, não conserto. O backend de catálogo/checkout é o **`revivah-erp` → `apps/api/src/api/publicStorefront.controller.ts`** (loja **Medusa-compatível**, servida em `core.tech10cloud.com`), NÃO um Medusa dedicado.

## 2026-08-15 — Bug do carrinho (409) e correção (backend correto, front frágil)
`publicStoreCart.service.removeLineItem` recusa alterar carrinho com `status !== 'ACTIVE'` (virou pedido/pagamento pendente ou expirou) → lança "Este carrinho não pode mais ser alterado" → controller mapeia para **HTTP 409**. **Decisão:** backend fica intocado (protege corretamente); o fix é no **front** — `carrinho.html` ganhou `isCartLockedError()`/`recoverFromLockedCart()` que descartam o `cartId` stale e reiniciam o carrinho, para o cliente não ficar preso. (PR #137).

## 2026-08-15 — Consolidação: `api-adapter.js` é o carrinho canônico
Auditoria de `<script src>` de todas as páginas + referências dinâmicas: **5 módulos de carrinho estavam mortos** (nenhuma página os carregava): `cart-manager`, `cart-vivacommerce`, `medusa-cart`, `medusa-client`, `load-products-medusa`. **Decisão:** removidos; o caminho canônico de carrinho/catálogo é `js/api-adapter.js` (`css/medusa-cart.css` mantido — stylesheet vivo). Reduz a classe de bugs de estado inconsistente. (PR #138).

## 2026-08-15 — Telemetria (Frente 1): base MVP em modo log, inerte por padrão
Entregue `js/telemetry.js` (auto-instrumentação por delegação: page_view por estágio, add_to_cart, begin_checkout, order_submit, help_click, checkout_abandon; falha silenciosa via sendBeacon) + coletor same-origin `api/telemetry.js`. **Decisão:** ativação MVP por **modo de log** (`TECH10_TELEMETRY_LOG=1`) — os eventos vão para os logs da função (Vercel), pois o ERP **ainda não tem endpoint de telemetria**. Forward ao ERP fica opcional (`TECH10_ERP_TELEMETRY_URL`, com token como segredo de deploy). Ativado e confirmado em produção. (PRs #139, #140).

## 2026-08-15 — Gotcha de deploy: Vercel não realiasa o domínio sozinho
O projeto Vercel `tech10-portal` **gera** deploys de produção a cada merge na `main`, MAS **não reaponta `tech10-portal.vercel.app` automaticamente** para o mais novo. Publicar exige `vercel promote <deploy-url>` (ou `vercel redeploy <deploy-url>`, que também realiasa e recarrega env vars). Raiz do runtime no Vercel = `SITE_RECUPERADO_TECH10`.

## 2026-08-15 — Frente 1 CONCLUÍDA: telemetria persiste no ERP (endpoint já existia)
Ao investigar o ERP para "criar o endpoint de telemetria", descobrimos que ele **já existe e está no ar**: `POST /api/portal-analytics/events` (`portalAnalytics.controller.ts`, **público** — `authenticate` é decorator opt-in, essa rota não usa) → grava em `model PortalAnalyticsEvent`. Probe: `{"ok":true,"accepted":1}` (202). **Decisão:** não criar nada novo no ERP; apenas fazer o coletor do portal **reformatar** o evento para o shape do ERP (`{ events: [{ eventName, occurredAt ISO, tenantSlug, sessionId, visitorId (>=8), source, surface: 'tenant_portal', mode, metadata }] }`) e apontar `TECH10_ERP_TELEMETRY_URL=https://core.tech10cloud.com/api/portal-analytics/events` (URL não-secreta; sem token). Adicionado `visitorId` persistente no front e log do forward (`[telemetry-forward] 202`). Verificado end-to-end. (PRs #142/#143). **Desbloqueia a Frente 2.**

## 2026-08-15 — Linhagem git: memory-bank estava órfão fora da `main`
O memory-bank (branch local `docs/memory-bank-obsidian-20260814`, baseada no `d85d4cd` antigo) **nunca foi para `origin/main`**, que seguiu outra linhagem (`46bdb3e…`). **Decisão:** trazer `docs/memory-bank/` para a `main` canônica (via PR) para virar fonte de verdade única. A `main` local antiga (`d85d4cd`) estava atrás do `origin/main` — sempre usar `origin/main` como canônico.
