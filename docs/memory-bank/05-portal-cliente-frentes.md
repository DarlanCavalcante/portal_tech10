# 05 — Iniciativa: Próximas Frentes do Portal do Cliente

Fonte: `docs/PROXIMAS_FRENTES_PORTAL_CLIENTE_TECH10_2026-05-13.md`. Atualizado em 2026-08-15 com o progresso real.

## Já consolidado
- Entrada pública premium em `/portal`; ponte contextual para o portal operacional do ERP.
- Diferenciação entre consulta rápida (`/status`) e portal completo; aprovação de O.S. mais clara.
- **Loja + carrinho + checkout Pix funcionais** (raio-x 15/08).

## Quatro frentes (ordem recomendada)
1. **Telemetria do funil** — ✅ **CONCLUÍDA** (15/08). `js/telemetry.js` + `api/telemetry.js` medem o funil (page_view por estágio, add_to_cart, begin_checkout, order_submit, help_click, checkout_abandon) e **persistem no ERP**: o coletor encaminha (shape reformatado) para `POST https://core.tech10cloud.com/api/portal-analytics/events` (endpoint **público, já existente**, sem token), gravando em `PortalAnalyticsEvent`. Verificado end-to-end (`[telemetry-forward] 202`). Modo log (`TECH10_TELEMETRY_LOG=1`) segue disponível para observabilidade.
   - Descoberta-chave: **não foi preciso mexer no ERP** — o pipeline `portalAnalytics.controller` + model `PortalAnalyticsEvent` já existiam.
2. **Painel interno** — ✅ **CONCLUÍDA** (15/08). O ERP **já tinha tudo**: `GET /api/reports/portal-funnel` (autenticado, por empresa, filtros days/decision/help/access/status) → `ReportService.getPortalFunnelWithFilters` (lê `PortalAnalyticsEvent`), a tela `apps/web/src/app/(app)/relatorios/page.tsx`, e o portal `apps/web/src/app/portal/[osNumber]/page.tsx` emitindo `portal_os_viewed`/`portal_budget_approved`/`portal_help_clicked`/etc. **Peça que faltava:** os eventos de ENTRADA — instrumentei `portal-entry.js` (portal_tech10) para emitir `portal_entry_viewed` (load) e `portal_entry_started` (abrir O.S., com osNumber). Verificado: `[telemetry-forward] 202`. O funil do painel fica completo (entrada → O.S. → aprovação). (PR #145).
3. **Pós-aprovação** — jornada por etapa da O.S. (aguardando peça / em execução / pronto p/ retirada / entregue).
4. **Financeiro básico** — valor aprovado, saldo pendente, situação de pagamento.

## Próximo passo recomendado
Fechar a Frente 1: **criar o endpoint de telemetria no ERP** e apontar `TECH10_ERP_TELEMETRY_URL` — isso desbloqueia a Frente 2 (painel). Em paralelo, **validar o checkout ponta-a-ponta** (criar um pedido de teste no ERP + Pix) para confirmar a espinha dorsal de vendas.

## Documento-mestre (fora deste repo)
`/Users/darlancavalcante/Documents/TECH/SaaS_redevivah_tech-manager/docs/PROJETO_PROXIMAS_FRENTES_PORTAL_CLIENTE_2026-05-13.md`.

Ver também [[08-progress]] e [[09-decisions]].
