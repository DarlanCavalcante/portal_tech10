# Project State - Tech10 Checkout

## Identificacao

- projeto: `Tech10 Checkout / issue #124`
- repositorio: `portal_tech10`
- remoto: `https://github.com/DarlanCavalcante/portal_tech10.git`
- branch default remota: `main`
- branch documental original: `codex/tech10-checkout-whatsapp-app-handoff-20260529`
- branch documental de handover: `docs/tech10-checkout-project-handover`

## Estado Git auditado em 2026-06-06

- `origin/main` observado em `48fd737`
- worktree local de `main` em `/Users/darlancavalcante/Documents/TECH/portal_tech10` estava sujo e avancado em `d85d4cd`
- worktree original do handoff em `/Users/darlancavalcante/Documents/TECH/tmp-tech10-checkout-issue-124` estava na branch `codex/tech10-checkout-whatsapp-app-handoff-20260529` com apenas `tmp-handoff-evidence/` fora do versionamento
- worktree isolada deste handover: `/Users/darlancavalcante/Documents/TECH/tmp-tech10-checkout-handover`

## Ambiente local validado

- sistema: `macOS`
- node: `v25.9.0`
- npm: `11.12.1`
- vercel cli: `/opt/homebrew/bin/vercel`
- lockfile do runtime: ausente
- dependencias declaradas em `SITE_RECUPERADO_TECH10/package.json`: nenhuma
- comando local validado: `vercel dev --listen 127.0.0.1:4112`

## URL local validada

- checkout: `http://127.0.0.1:4112/checkout`
- runtime-config: `http://127.0.0.1:4112/api/runtime-config`
- health: `http://127.0.0.1:4112/api/health`

## Estado operacional atual

- producao: manter o fluxo publicado; nenhuma promocao nova nesta frente
- runtime local: validado em `quote_only`
- `npm run validate:runtime`: aprovado em `2026-06-06`
- `SMOKE_BASE_URL=http://127.0.0.1:4112 npm run smoke:runtime`: aprovado em `2026-06-06`
- `/api/health`: `degraded` era o resultado esperado sem backend de catalogo/checkout configurado
- checkout no navegador: abriu sem tela branca e sem erro critico de console observado

## Fluxo oficial atual

- o checkout assistido abre `WhatsApp Web` via `https://wa.me/...?...text=...`
- a mensagem fica em modo de rascunho revisavel antes do envio
- o CTA oficial nao usa `whatsapp://send`
- o app desktop do WhatsApp nao e fluxo oficial do checkout

## Ultima decisao conhecida

- data: `2026-05-29`
- decisao: `WhatsApp Web aprovado; WhatsApp app desktop reprovado`
- motivo: no experimento do protocolo nativo houve mensagem real de teste na conversa da Tech10 as `00:40`, junto com conflito de instancia entre web e app; o desktop nao preservou revisao manual com seguranca

## O que esta fechado

- a issue `#124` do checkout branco foi isolada, corrigida e mergeada
- o hotfix de mensagem assistida com resumo do carrinho foi mergeado
- o follow-up de mensagem assistida persistida foi mergeado
- a investigacao documental do handoff para app desktop foi encerrada
- a branch documental original `codex/tech10-checkout-whatsapp-app-handoff-20260529` foi publicada no remoto em `2026-06-06`
- a branch `docs/tech10-checkout-project-handover` foi publicada e recebeu o PR `#131` em `2026-06-06`

## Estado Vercel confirmado em 2026-06-06

- existe um segundo projeto Vercel chamado `site-recuperado-tech-10`
- ele nao representa outro repositorio; aponta para a mesma base de codigo em outra configuracao de deploy
- `tech10-portal` segue como projeto canonico
- `tech10-portal` usa `Root Directory = SITE_RECUPERADO_TECH10`
- `site-recuperado-tech-10` usa `Root Directory = .`
- `tech10-portal` expoe o dominio customizado `https://tech10.loja.tech10cloud.com`
- `site-recuperado-tech-10` nao expoe o dominio customizado canonico
- `tech10-portal/api/runtime-config` retornou catalogo configurado e `browseCatalog=true`
- `site-recuperado-tech-10/api/runtime-config` retornou sem backend configurado e `browseCatalog=false`

## O que esta pendente

- revisar e mergear o PR `#131` da branch `docs/tech10-checkout-project-handover`
- decidir explicitamente se o projeto Vercel legado `site-recuperado-tech-10` sera apenas mantido sem uso ou aposentado depois
- manter o manifesto de evidencias atualizado sem versionar os arquivos locais

## O que esta proibido reativar ou alterar nesta frente

- `whatsapp://send` como fluxo oficial do checkout
- qualquer promocao de producao sem validacao explicita
- commit de `.env`, `.env.local`, `.vercel`, `node_modules`, `dist`, `build`, screenshots, videos ou evidencias locais
- mudancas em ERP, fiscal, PDV, O.S. ou app motorista
- alteracoes de credenciais
