# Deployment Notes - Tech10 Checkout

## Regra principal

Producao so muda com validacao explicita. Esta frente de handover nao inclui promocao de codigo.

## Base canonica atual

- repositorio: `DarlanCavalcante/portal_tech10`
- branch de producao documentada: `main`
- root directory de publicacao: `SITE_RECUPERADO_TECH10`
- projeto Vercel descrito na documentacao canonica: `tech10-portal`

## Estado confirmado dos projetos Vercel

- `tech10-portal`
  - projeto canonico
  - `Root Directory = SITE_RECUPERADO_TECH10`
  - alias canonico: `https://tech10-portal.vercel.app`
  - dominio customizado observado: `https://tech10.loja.tech10cloud.com`
  - `runtime-config` retornou backend configurado

- `site-recuperado-tech-10`
  - projeto paralelo/legado
  - `Root Directory = .`
  - alias observado: `https://site-recuperado-tech-10.vercel.app`
  - `runtime-config` retornou sem backend configurado

Regra operacional:

- usar `tech10-portal` para qualquer validacao ou deploy canonico do tenant
- nao promover `site-recuperado-tech-10` como origem de producao

## Como gerar preview

- preferir branch dedicada e PR
- deixar a Vercel gerar preview pelo fluxo `GitHub -> Vercel`
- se a branch alterar apenas documentacao, nao promover deploy de producao

## Como publicar

- validar localmente primeiro
- revisar `main` e `SITE_RECUPERADO_TECH10` como base de publicacao
- confirmar que a pasta local esta vinculada a `tech10-portal`
- confirmar que o fluxo publicado continua `WhatsApp Web` com draft seguro
- publicar apenas depois de review explicito

## Validacao antes de qualquer deploy

- `npm run validate:runtime`
- `SMOKE_BASE_URL=http://127.0.0.1:4112 npm run smoke:runtime`
- abrir `/checkout`
- confirmar ausencia de tela branca
- confirmar CTA em `wa.me` com `text=`
- confirmar ausencia de `whatsapp://send`

## Rollback

- reverter o merge ou redeployar o commit anterior bem-sucedido em `main`
- usar `48fd737` como referencia do estado publicado seguro observado nesta auditoria
- registrar a reversao em documentacao antes de nova promocao

## Registro de evidencia

- manter imagens e videos fora do repo
- atualizar `EVIDENCE_MANIFEST.md` com caminho local, data e finalidade
- nunca commitar `.vercel`, `.env`, screenshots ou videos sem autorizacao explicita
