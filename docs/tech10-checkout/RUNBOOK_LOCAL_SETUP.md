# Runbook - Local Setup

## Objetivo

Colocar o checkout da Tech10 no ar localmente sem alterar producao, sem puxar credenciais e sem reativar o fluxo de app desktop.

## Pre-requisitos

- `git`
- `node` `18+` (`v25.9.0` foi validado nesta retomada)
- `npm` (`11.12.1` foi validado nesta retomada)
- `vercel` CLI disponivel via global ou `npx`

## Clonar e preparar o repositorio

```bash
git clone https://github.com/DarlanCavalcante/portal_tech10.git
cd portal_tech10
git fetch --all --prune
git branch -a
```

## Branches uteis para retomada

```bash
git checkout main
git checkout codex/tech10-checkout-whatsapp-app-handoff-20260529
git checkout docs/tech10-checkout-project-handover
```

## Entrar no runtime canonico

```bash
cd SITE_RECUPERADO_TECH10
cat package.json
```

Observacao:

- nao ha `lockfile` nesta pasta
- nao ha dependencias declaradas para instalar
- os scripts locais validos hoje sao `validate:runtime` e `smoke:runtime`

## Validar a estrutura antes de subir

```bash
npm run validate:runtime
```

Resultado esperado:

- `Runtime Tech10 validado com sucesso.`

## Subir localmente

Opcao preferida:

```bash
npx vercel dev --listen 127.0.0.1:4112
```

Opcao equivalente quando a CLI ja esta instalada:

```bash
vercel dev --listen 127.0.0.1:4112
```

## Regras para o primeiro `vercel dev`

- se a CLI perguntar sobre pull de variaveis de ambiente, responder `no`
- nao puxar credenciais para esta validacao documental
- se `.vercel/project.json` apontar para projeto diferente do canonicamente documentado, registrar a divergencia antes de qualquer deploy

## URL local esperada

- `http://127.0.0.1:4112/checkout`

## Smoke tecnico com a porta validada

O script default usa `4111`. Para a porta validada nesta retomada, rode:

```bash
SMOKE_BASE_URL=http://127.0.0.1:4112 npm run smoke:runtime
```

## Como abrir o checkout

- navegador: `http://127.0.0.1:4112/checkout`
- apoio tecnico: `http://127.0.0.1:4112/api/runtime-config`
- health local: `http://127.0.0.1:4112/api/health`

## Como limpar cache e estado local

Hard reload do navegador:

- `Cmd+Shift+R` no macOS

Limpar site data:

- DevTools -> Application -> Clear site data

Chaves de `localStorage` relevantes para zerar carrinho/assistido:

- `tech10_storefront_cart_id`
- `tech10_assisted_cart`
- `vivacommerce_cart_id`
- `vc_cart_id`
- `medusa_cart_id`

## Como validar console

- abrir DevTools no checkout
- confirmar ausencia de erro critico
- nesta retomada, a leitura visual e a captura automatizada nao retornaram erros de console

## Como encerrar o servidor local

- `Ctrl+C` no terminal onde o `vercel dev` estiver rodando
