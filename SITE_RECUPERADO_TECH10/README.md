# Tech10 Standalone Runtime

Data-base: `2026-05-11`

## O que esta pasta é

`SITE_RECUPERADO_TECH10/` agora é a **base canônica de publicação** da Tech10
dentro do repositório `portal_tech10`.

Ela contém:

- home institucional;
- loja pública;
- carrinho;
- checkout;
- pedido confirmado;
- páginas por categoria;
- admin estático legado;
- entrada pública do portal do cliente;
- runtime serverless mínimo para proxy de loja e health check.

## Rotas públicas canônicas

- `/` -> home institucional
- `/loja` -> catálogo
- `/carrinho` -> carrinho
- `/checkout` -> checkout
- `/pedido-confirmado` -> confirmação de pedido
- `/portal` -> entrada pública do portal/O.S.

## Rotas serverless

- `/api/store/*` -> proxy same-origin para backend da loja
- `/api/health` -> health do runtime do tenant
- `/api/runtime-config` -> config pública de integração do tenant

## Arquivos principais

- `vercel.json`
- `api/store-proxy.js`
- `api/health.js`
- `api/runtime-config.js`
- `api/runtime-env.js`
- `portal/index.html`
- `js/portal-entry.js`
- `js/tenant-config.js`
- `js/tenant-routes.js`
- `js/api-config.js`
- `js/api-adapter.js`
- `js/cart-storefront.js`

## Variáveis esperadas no deploy

- `TECH10_CATALOG_SOURCE`
  - `store_backend` ou `erp_stock`
- `TECH10_CATALOG_BACKEND_URL`
  - backend alvo das leituras do catálogo `/api/store/*`
- `TECH10_CHECKOUT_MODE`
  - `store_backend` ou `quote_only`
- `TECH10_CHECKOUT_BACKEND_URL`
  - backend alvo das operações de carrinho/checkout
- `TECH10_STORE_BACKEND_URL`
  - fallback legado compatível para catálogo + checkout
- `STORE_BACKEND_URL`
  - fallback compatível se a variável acima não estiver definida
- `TECH10_STORE_BEARER_TOKEN`
  - opcional; fallback legado de bearer token para catálogo + checkout
- `TECH10_CATALOG_BEARER_TOKEN`
  - opcional; bearer token específico para o backend de catálogo
- `TECH10_CHECKOUT_BEARER_TOKEN`
  - opcional; bearer token específico para o backend de checkout
- `TECH10_STORE_API_KEY`
  - opcional; fallback legado de API key para catálogo + checkout
- `TECH10_CATALOG_API_KEY`
  - opcional; API key específica para o backend de catálogo
- `TECH10_CHECKOUT_API_KEY`
  - opcional; API key específica para o backend de checkout
- `TECH10_ERP_PORTAL_BASE_URL`
  - opcional; default `https://sistema.tech10cloud.com/portal`
- `TECH10_ERP_STATUS_BASE_URL`
  - opcional; default `https://sistema.tech10cloud.com/status`
- `TECH10_SUPPORT_WHATSAPP`
  - opcional; atendimento usado quando a loja opera em `quote_only`

Veja o contrato completo em:

- `/Users/darlancavalcante/Documents/TECH/portal_tech10/docs/CONTRATO_DE_AMBIENTE_TENANT_TECH10.md`
- `/Users/darlancavalcante/Documents/TECH/portal_tech10/docs/CONTRATO_CATALOGO_ESTOQUE_ERP_TENANT_TECH10.md`

## Validação recomendada

```bash
cd /Users/darlancavalcante/Documents/TECH/portal_tech10/SITE_RECUPERADO_TECH10
npm run validate:runtime
npm run smoke:runtime
```

## Compatibilidade preservada

Ainda existem aliases legados como `VIVACOMMERCE_BASE_URL`,
`cartVivaCommerce` e `vivacommerce_cart_id` apenas para reduzir risco de
quebra durante a transição. O runtime canônico agora usa `cart-storefront.js`
e `tech10_storefront_cart_id`.

## Próximo passo recomendado

1. criar projeto dedicado de deploy da Tech10 com root dir `SITE_RECUPERADO_TECH10`
2. configurar as variáveis acima
3. anexar `tech10.tech10cloud.com`
4. executar smoke em:
   - `/`
   - `/loja`
   - `/carrinho`
   - `/checkout`
   - `/portal`
