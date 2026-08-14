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
