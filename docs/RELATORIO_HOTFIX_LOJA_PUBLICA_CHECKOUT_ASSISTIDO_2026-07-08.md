# RELATORIO HOTFIX LOJA PUBLICA CHECKOUT ASSISTIDO 2026-07-08

- frente: Loja Publica / Checkout Assistido
- branch: `hotfix/portal-tech10-checkout-20260708`
- escopo:
  - `SITE_RECUPERADO_TECH10/js/tenant-routes.js`
  - `SITE_RECUPERADO_TECH10/js/produtos-page.js`
  - `SITE_RECUPERADO_TECH10/carrinho.html`
  - `SITE_RECUPERADO_TECH10/checkout.html`
  - `SITE_RECUPERADO_TECH10/pedido-confirmado.html`

## Problema reproduzido

- `https://tech10.loja.tech10cloud.com/checkout` direto nao ficava mais em loading infinito, mas caia em um fallback generico de atendimento.
- com item escolhido em `/loja`, o checkout continuava escondendo a superficie real de selecao assistida.
- resultado observado: o cliente perdia a leitura da propria selecao e nao conseguia seguir pelo fechamento assistido com contexto do item.
- durante a validacao do preview apareceu um segundo bloqueio na mesma jornada: `/loja`, `/carrinho`, `/checkout` e `/pedido-confirmado` herdavam `body:not(.loaded) { visibility: hidden; }` sem marcar `body.loaded` no bootstrap proprio dessas telas.

## Causa

- o runtime publico da Tech10 responde `checkoutMode=quote_only`.
- ao mesmo tempo, ele tambem responde:
  - `assistedCartBridge=true`
  - `assistedCheckoutBridge=true`
- `tenant-routes.js` tratava `quote_only` como ordem para mascarar sempre `carrinho` e `checkout`, ignorando que os bridges assistidos estavam ligados.
- as telas assistidas da loja publica usam `css/styles.css`, que esconde o `body` ate a classe `loaded`; como essas paginas nao carregavam `js/script.js`, faltava ativar `body.loaded` no bootstrap local.

## Correcao aplicada

- preservar as superficies de `carrinho` e `checkout` quando o runtime estiver em `quote_only` **e** os bridges assistidos estiverem ativos.
- manter o fallback generico apenas quando o runtime estiver sem superficie assistida real.
- marcar `body.loaded` no bootstrap de `/loja`, `/carrinho`, `/checkout` e `/pedido-confirmado`, para a jornada assistida nao ficar invisivel.

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

## Validacao em preview

- PR aberta: `#132`
- preview final: `https://tech10-portal-78r2ba9uy-darlancavalcantes-projects.vercel.app`
- preview inicial publicado sem runtime do catalogo para preview
  - efeito: `/api/store/*` respondia `503`
  - causa operacional: o projeto `tech10-portal` tinha variaveis de runtime apenas em `Production`
- preview refeito com runtime explicito do tenant Tech10:
  - `TECH10_CATALOG_BACKEND_URL=https://core.tech10cloud.com`
  - `TECH10_STORE_BACKEND_URL=https://core.tech10cloud.com`
  - `TECH10_CATALOG_SOURCE=erp_stock`
  - `TECH10_CHECKOUT_MODE=quote_only`
  - `TECH10_PUBLIC_STORE_SLUG=tech10`
  - `TECH10_SITE_NAME=Tech10 Informatica`
  - `TECH10_TENANT_ID=tech10`
- preview final validado:
  - `/checkout` direto sem selecao:
    - mostra `Nenhuma selecao ativa no momento`
    - CTA `Explorar catalogo`
  - `/loja` -> selecionar item -> `/checkout`:
    - item ficou preservado no resumo
    - quantidade e valor ficaram visiveis
    - contexto de marca e SKU continuou presente
  - envio para atendimento:
    - com dados de teste, a jornada abriu `pedido-confirmado?order=ATD-...`
    - abriu um unico WhatsApp pre-preenchido para o atendimento assistido
    - nao houve duplicacao observada de aba de WhatsApp nem de confirmacao
- observacao:
  - a verificacao do anti-duplo-clique ficou suportada por dois sinais:
    - codigo desabilita `submitBtn` antes do redirect assistido
    - no smoke manual houve apenas uma confirmacao local e uma unica aba externa pre-preenchida

## Produção alterada

- nao

## Proximo passo

- revisar a PR `#132`
- publicar o hotfix da loja publica Tech10 em producao somente depois da aprovacao do preview
- revalidar em producao:
  - `/checkout` direto sem selecao mostra estado vazio util
  - `/loja` -> selecionar produto -> `/checkout` preserva a selecao assistida
  - a jornada assistida continua visivel
  - o envio para atendimento continua abrindo a confirmacao assistida sem duplicar clique
