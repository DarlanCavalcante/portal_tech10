# Decisions - Tech10 Checkout

## ADR-001 - WhatsApp Web como fluxo oficial

- data: `2026-05-29`
- decisao: usar `WhatsApp Web` com mensagem em draft
- motivo: preserva revisao manual antes do envio e manteve o texto com a selecao atual
- status: aprovado

## ADR-002 - Rejeitar WhatsApp App Desktop como fluxo oficial

- data: `2026-05-29`
- decisao: nao usar `whatsapp://send` como fluxo oficial do checkout
- motivo: o teste real mostrou risco operacional, com mensagem real de teste as `00:40` e conflito de instancia entre web e app
- status: rejeitado

## ADR-003 - Evidencias locais nao versionadas

- data: `2026-05-29`
- decisao: nao commitar `web-draft.png`, `app-handoff.png` e `app-frontmost.png`
- motivo: sao evidencias locais, potencialmente sensiveis, e nao fazem parte do codigo do produto
- status: manter fora do repo

## ADR-004 - Isolar o handover em worktree propria

- data: `2026-06-06`
- decisao: executar a consolidacao documental em `docs/tech10-checkout-project-handover`, numa worktree separada
- motivo: `main` estava localmente suja e o worktree original do handoff continha evidencias locais nao versionadas
- status: aplicado

## ADR-005 - Publicar a branch documental original antes do novo handover

- data: `2026-06-06`
- decisao: publicar `codex/tech10-checkout-whatsapp-app-handoff-20260529` em `origin` antes de abrir a branch nova
- motivo: preservar a recuperacao fiel da trilha original em outro computador
- status: aplicado
