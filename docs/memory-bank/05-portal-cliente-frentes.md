# 05 — Iniciativa: Próximas Frentes do Portal do Cliente

Fonte: `docs/PROXIMAS_FRENTES_PORTAL_CLIENTE_TECH10_2026-05-13.md`. Atualizado em 2026-08-15 com o progresso real.

## Já consolidado
- Entrada pública premium em `/portal`; ponte contextual para o portal operacional do ERP.
- Diferenciação entre consulta rápida (`/status`) e portal completo; aprovação de O.S. mais clara.
- **Loja + carrinho + checkout Pix funcionais** (raio-x 15/08).

## Quatro frentes (ordem recomendada)
1. **Telemetria do funil** — ✅ **CONCLUÍDA** (15/08). `js/telemetry.js` + `api/telemetry.js` medem o funil (page_view por estágio, add_to_cart, begin_checkout, order_submit, help_click, checkout_abandon) e **persistem no ERP**: o coletor encaminha (shape reformatado) para `POST https://core.tech10cloud.com/api/portal-analytics/events` (endpoint **público, já existente**, sem token), gravando em `PortalAnalyticsEvent`. Verificado end-to-end (`[telemetry-forward] 202`). Modo log (`TECH10_TELEMETRY_LOG=1`) segue disponível para observabilidade.
   - Descoberta-chave: **não foi preciso mexer no ERP** — o pipeline `portalAnalytics.controller` + model `PortalAnalyticsEvent` já existiam.
2. **Painel interno** — 🟢 **DESBLOQUEADA** (dados já persistem). Visão para a equipe (funil por tenant/O.S.: quem abriu e não respondeu, pediu ajuda, aprovou e aguarda). Ler de `PortalAnalyticsEvent`; o `portalAnalytics.controller` do ERP só tem `POST /events` hoje — falta a rota/serviço de leitura + a tela.
3. **Pós-aprovação** — jornada por etapa da O.S. (aguardando peça / em execução / pronto p/ retirada / entregue).
4. **Financeiro básico** — valor aprovado, saldo pendente, situação de pagamento.

## Próximo passo recomendado
Fechar a Frente 1: **criar o endpoint de telemetria no ERP** e apontar `TECH10_ERP_TELEMETRY_URL` — isso desbloqueia a Frente 2 (painel). Em paralelo, **validar o checkout ponta-a-ponta** (criar um pedido de teste no ERP + Pix) para confirmar a espinha dorsal de vendas.

## Documento-mestre (fora deste repo)
`/Users/darlancavalcante/Documents/TECH/SaaS_redevivah_tech-manager/docs/PROJETO_PROXIMAS_FRENTES_PORTAL_CLIENTE_2026-05-13.md`.

Ver também [[08-progress]] e [[09-decisions]].
