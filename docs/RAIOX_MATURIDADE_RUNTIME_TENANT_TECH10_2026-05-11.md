# Raio-X de Maturidade do Runtime Tech10

Data-base: `2026-05-11`

## Escopo desta rodada

Elevar o `portal_tech10` para um runtime standalone mais maduro, com:

- separação explícita entre catálogo e checkout
- documentação enterprise de variáveis e contrato
- preparação limpa para consumir produtos do estoque do ERP
- redução de naming legado mais visível

## O que ficou confirmado

- o runtime canônico continua em `SITE_RECUPERADO_TECH10/`
- a publicação standalone existe em `https://tech10-portal.vercel.app`
- a loja agora distingue:
  - `catalogSource`
  - `checkoutMode`
  - `capabilities`
- o portal público do cliente continua desacoplado do storefront

## O que mudou no código

- `api/runtime-env.js`
  - centraliza o contrato de ambiente e a semântica operacional
- `api/store-proxy.js`
  - separa backend de catálogo e backend de checkout
  - suporta `quote_only`
  - permite credenciais diferentes para catálogo e checkout
- `api/runtime-config.js`
  - expõe capacidades reais do runtime
- `api/health.js`
  - passou a refletir readiness de catálogo, checkout e bridge com o ERP
- `js/cart-storefront.js`
  - vira o carrinho canônico do storefront
- `js/load-products.js`
  - respeita o modo de checkout
  - abre atendimento quando a loja está em `quote_only`

## Estado validado localmente

- `npm run validate:runtime` -> `success`
- `npm run smoke:runtime` -> `success`
- `git diff --check` -> `success`
- `http://localhost:4111/api/runtime-config` -> `200`
- `http://localhost:4111/api/health` -> `degraded` esperado sem catálogo configurado

Leitura operacional local atual:

- `catalogSource=store_backend`
- `checkoutMode=quote_only`
- `browseCatalog=false`
- `cart=false`
- `checkout=false`
- `portalBridge=true`

## Interpretação correta do estado

O runtime está mais maduro, mas ainda não está em go-live completo da loja
porque o backend do catálogo não foi configurado.

Isso significa:

- site institucional: pronto
- portal/status do cliente: prontos
- contrato técnico da loja: pronto
- catálogo real vindo do estoque: ainda depende de backend configurado

## Próximo passo crítico

Há dois caminhos profissionais aceitos:

1. `TECH10_CATALOG_SOURCE=store_backend`
   - apontar `TECH10_CATALOG_BACKEND_URL` para o backend atual da loja
   - manter `TECH10_CHECKOUT_MODE=store_backend` ou `quote_only`
2. `TECH10_CATALOG_SOURCE=erp_stock`
   - criar um BFF público no ERP compatível com `/api/store/*`
   - usar `TECH10_CHECKOUT_MODE=quote_only` primeiro

A recomendação mais segura para evoluir sem retrabalho é:

1. publicar catálogo do estoque do ERP em `quote_only`
2. validar site + portal + vitrine
3. só depois ligar carrinho/checkout transacionais
