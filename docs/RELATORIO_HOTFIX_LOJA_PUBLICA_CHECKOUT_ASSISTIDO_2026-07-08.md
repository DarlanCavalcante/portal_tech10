# RELATORIO HOTFIX LOJA PUBLICA CHECKOUT ASSISTIDO 2026-07-08

- frente: Loja Publica / Checkout Assistido
- branch: `hotfix/portal-tech10-checkout-20260708`
- escopo: `SITE_RECUPERADO_TECH10/js/tenant-routes.js`

## Problema reproduzido

- `https://tech10.loja.tech10cloud.com/checkout` direto nao ficava mais em loading infinito, mas caia em um fallback generico de atendimento.
- com item escolhido em `/loja`, o checkout continuava escondendo a superficie real de selecao assistida.
- resultado observado: o cliente perdia a leitura da propria selecao e nao conseguia seguir pelo fechamento assistido com contexto do item.

## Causa

- o runtime publico da Tech10 responde `checkoutMode=quote_only`.
- ao mesmo tempo, ele tambem responde:
  - `assistedCartBridge=true`
  - `assistedCheckoutBridge=true`
- `tenant-routes.js` tratava `quote_only` como ordem para mascarar sempre `carrinho` e `checkout`, ignorando que os bridges assistidos estavam ligados.

## Correcao aplicada

- preservar as superficies de `carrinho` e `checkout` quando o runtime estiver em `quote_only` **e** os bridges assistidos estiverem ativos.
- manter o fallback generico apenas quando o runtime estiver sem superficie assistida real.

## Validacao tecnica

- `curl https://tech10.loja.tech10cloud.com/api/runtime-config`
  - `checkoutMode: quote_only`
  - `assistedCartBridge: true`
  - `assistedCheckoutBridge: true`
- reproducao em Chrome:
  - `/checkout` direto: fallback generico visivel
  - `/loja` com item selecionado -> `/checkout`: fallback generico ainda escondia a selecao
- conclusao: o bug estava na camada de retarget/runtime da loja publica.

## Validacoes executadas localmente

- `npm run validate:runtime`
- `EXPECT_CATALOG_BACKEND=1 SMOKE_BASE_URL=https://tech10.loja.tech10cloud.com npm run smoke:runtime`
- `git diff --check`

## Produção alterada

- nao

## Proximo passo

- publicar o hotfix da loja publica em HML ou preview do tenant Tech10
- validar:
  - `/checkout` direto sem selecao mostra estado vazio util
  - `/loja` -> selecionar produto -> `/checkout` preserva a selecao assistida
  - botao de atendimento continua funcional
