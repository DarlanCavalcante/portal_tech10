# 08 — Progress

_Atualizado: 2026-08-14. Baseado em código presente e docs; comportamento em produção não re-testado nesta sessão._

## Funciona / entregue ✅
- ✅ Site institucional legado (raiz) — landing single-page, WhatsApp lead.
- ✅ Runtime canônico `SITE_RECUPERADO_TECH10/` com rotas `/`, `/loja`, `/carrinho`, `/checkout`, `/pedido-confirmado`, `/portal`, `/status` (definidas em `vercel.json`).
- ✅ Funções serverless: proxy same-origin `/api/store/*`, `/api/health`, `/api/runtime-config`.
- ✅ Contrato de ambiente multi-tenant (`.env.example`) + scripts de validação/smoke.
- ✅ PWA (`sw.js`, `manifest.json`).
- ✅ Entrada pública do portal do cliente com deep links (`/portal/:os`, `/status/:os`, token/autostart).
- ✅ Identidade: logo canônica SVG aplicada nas superfícies.
- ✅ Header da loja com marca restaurado; carrinho assistido travado ao estoque (últimos commits).

## Em aberto / a fazer ⏳
- ⏳ Telemetria do funil do portal (frente 1 — próximo passo recomendado). Ver [[05-portal-cliente-frentes]].
- ⏳ Painel interno para a equipe (frente 2).
- ⏳ Jornada pós-aprovação da O.S. (frente 3).
- ⏳ Transparência financeira básica (frente 4).
- ⏳ Projeto Vercel dedicado com root `SITE_RECUPERADO_TECH10` + domínio anexado (a investigar se concluído).

## A investigar / desconhecido
- Backend real de catálogo/checkout (Medusa? URLs de produção reais). (a investigar)
- Estado real de produção pós 2026-05-20. (a investigar)
- CI/CD efetivo (nenhum workflow versionado). (a investigar)
