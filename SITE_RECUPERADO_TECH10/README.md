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
- `portal/index.html`
- `js/portal-entry.js`
- `js/tenant-config.js`
- `js/tenant-routes.js`
- `js/api-config.js`
- `js/api-adapter.js`

## Variáveis esperadas no deploy

- `TECH10_STORE_BACKEND_URL`
  - backend alvo do proxy `/api/store`
- `STORE_BACKEND_URL`
  - fallback compatível se a variável acima não estiver definida
- `TECH10_STORE_BEARER_TOKEN`
  - opcional; injeta `Authorization: Bearer ...` no upstream da loja
- `TECH10_STORE_API_KEY`
  - opcional; injeta `x-api-key` no upstream da loja
- `TECH10_ERP_PORTAL_BASE_URL`
  - opcional; default `https://sistema.tech10cloud.com/portal`
- `TECH10_ERP_STATUS_BASE_URL`
  - opcional; default `https://sistema.tech10cloud.com/status`

Veja o contrato completo em:

- `/Users/darlancavalcante/Documents/TECH/portal_tech10/docs/CONTRATO_DE_AMBIENTE_TENANT_TECH10.md`

## Validação recomendada

```bash
cd /Users/darlancavalcante/Documents/TECH/portal_tech10/SITE_RECUPERADO_TECH10
npm run validate:runtime
npm run smoke:runtime
```

## Compatibilidade preservada

Ainda existem nomes legados como:

- `cart-vivacommerce.js`
- `VIVACOMMERCE_BASE_URL`
- `vivacommerce_cart_id`

Esses nomes foram mantidos apenas para reduzir risco de quebra durante a
transição. Eles não devem mais ser interpretados como vínculo canônico de
runtime.

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
