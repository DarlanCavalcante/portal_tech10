# Branch Registry - Tech10 Checkout

| Branch | Tipo | Status | Commits | Remoto? | Objetivo | Proximo passo |
| --- | --- | --- | --- | --- | --- | --- |
| `main` | default / producao | ativa | `48fd737` | sim | baseline publicado com o fluxo seguro atual | manter como base canonicamente publicada |
| `codex/tech10-checkout-white-screen-20260529` | funcional / hotfix issue `#124` | mergeada | `8ed93f6`, `a77c028`, `aa871db` | nao | corrigir `/checkout` em branco sem mexer em outras frentes | nenhum corretivo aberto; preservar trilha |
| `codex/tech10-checkout-assisted-message-20260529` | funcional / hotfix | mergeada | `63cc122`, `b6d16e6`, `fbadc70` | nao | incluir resumo do carrinho no link de atendimento | nenhum |
| `codex/tech10-checkout-assisted-message-followup-20260529` | funcional / hotfix | mergeada | `cd47bbf`, `09286ed`, `e1c5b8d` | nao | recalcular a mensagem com o carrinho persistido | nenhum |
| `codex/tech10-checkout-assisted-message-click-20260529` | funcional / hotfix | superada | `e58baeb` -> equivalente em `fafa0de` | nao | recalcular a mensagem no clique | usar a linha evoluida em `main`; nao recuperar a branch nomeada |
| `codex/tech10-checkout-whatsapp-app-first-20260529` | experimental | rejeitada / superada | `7b556fb` -> equivalente em `a8180e3` | nao | testar preferencia pelo app desktop do WhatsApp | manter apenas como rastro historico; nao promover |
| `codex/tech10-checkout-safe-draft-20260530` | funcional / hotfix | promovida por equivalente em `main` | `f4d54b6` -> publicado como `48fd737` | nao | restaurar o fluxo web seguro em modo draft | usar `main` / `48fd737` como verdade publicada |
| `codex/tech10-checkout-whatsapp-app-handoff-20260529` | documental / investigacao | encerrada | `a10a766`, `d40de69`, `f03a9dc` | sim | provar se o handoff para app desktop era seguro | nenhum corretivo; preservar documentacao |
| `docs/tech10-checkout-project-handover` | documental / handover | em review | `28c4e1e` | sim | centralizar estado, branches, runbooks e validacao | revisar e mergear o PR `#131` |

## Notas

- `Remoto?` indica se a branch com esse nome existe hoje em `origin`.
- Algumas branches locais nao existem no remoto, mas seus efeitos ja foram absorvidos por commits equivalentes ou merges em `origin/main`.
- O worktree local de `main` auditado em `/Users/darlancavalcante/Documents/TECH/portal_tech10` estava sujo durante o handover. Por isso esta frente foi executada em worktree separada.
