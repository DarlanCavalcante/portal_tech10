# Variáveis e Configuração do portal_tech10

Data de referência: `2026-05-11`

## Objetivo

Registrar a configuração canônica do runtime standalone da Tech10, sem perder o
contexto dos nomes legados ainda presentes no frontend.

## 1. Arquivos centrais

- `SITE_RECUPERADO_TECH10/js/tenant-config.js`
- `SITE_RECUPERADO_TECH10/js/tenant-routes.js`
- `SITE_RECUPERADO_TECH10/js/api-config.js`
- `SITE_RECUPERADO_TECH10/js/api-adapter.js`
- `SITE_RECUPERADO_TECH10/api/runtime-config.js`

## 2. Contrato atual do tenant

### tenant

- `tenant.id`
  - valor atual: `tech10`
- `tenant.slug`
  - valor atual: `tech10`
- `tenant.legacyStoreSlugs`
  - valor atual: `['revivah-tech']`
- `tenant.legacySitePaths`
  - valor atual: `['/tech10']`
- `tenant.publicSiteBasePath`
  - valor atual: `/`
- `tenant.storefrontPath`
  - valor atual: `/loja`
- `tenant.categoryShopBasePath`
  - valor atual: `/loja`
- `tenant.cartPath`
  - valor atual: `/carrinho`
- `tenant.checkoutPath`
  - valor atual: `/checkout`
- `tenant.orderSuccessPath`
  - valor atual: `/pedido-confirmado`
- `tenant.portalPath`
  - valor atual: `/portal`

### brand

- `brand.logoUrl`
  - valor atual: `/imagem/logo/tech10-logo-principal-pulso-hibrido.svg`
- `brand.fallbackProductImageUrl`
  - valor atual: `/imagem/propaganda loja/tecnologia.jpeg`
- `brand.primaryColor`
  - valor atual: `#2563eb`
- `brand.accentColor`
  - valor atual: `#10b981`

### store

- `store.provider`
  - valor atual: `tenant-standalone`
- `store.runtimeId`
  - valor atual: `tech10-portal`
- `store.runtimeLabel`
  - valor atual: `Tech10 Portal`
- `store.slug`
  - valor atual: `tech10`
- `store.catalogSource`
  - valor atual: `store_backend`
- `store.checkoutMode`
  - valor atual: `store_backend`
- `store.baseUrl`
  - valor atual: `window.location.origin`
- `store.apiBasePath`
  - valor atual: `/api/store`
- `store.adminApiBasePath`
  - valor atual: `/api`
- `store.healthPath`
  - valor atual: `/api/health`

### portal

- `portal.entryPath`
  - valor atual: `/portal`
- `portal.runtimeConfigPath`
  - valor atual: `/api/runtime-config`
- `portal.defaultPortalBaseUrl`
  - valor atual: `https://sistema.tech10cloud.com/portal`
- `portal.defaultStatusBaseUrl`
  - valor atual: `https://sistema.tech10cloud.com/status`

## 3. Variáveis de ambiente do runtime

### Obrigatórias

- `TECH10_TENANT_ID`
  - identificador lógico do tenant
- `TECH10_PUBLIC_STORE_SLUG`
  - slug público canônico da loja
- `TECH10_SITE_NAME`
  - nome operacional exibido no runtime
- `TECH10_RUNTIME_ID`
  - identificador operacional do runtime standalone
- `TECH10_CATALOG_SOURCE`
  - `store_backend` ou `erp_stock`
- `TECH10_CATALOG_BACKEND_URL`
  - backend alvo das leituras do catálogo `/api/store/*`
- `TECH10_CHECKOUT_MODE`
  - `store_backend` ou `quote_only`
- `TECH10_CHECKOUT_BACKEND_URL`
  - backend alvo das operações de carrinho/checkout quando o modo é `store_backend`
- `TECH10_ERP_PORTAL_BASE_URL`
  - base do portal completo do ERP
- `TECH10_ERP_STATUS_BASE_URL`
  - base da consulta rápida da O.S.

### Opcionais

- `TECH10_SUPPORT_WHATSAPP`
  - canal de atendimento quando a loja opera em `quote_only`
- `STORE_BACKEND_URL`
  - fallback compatível para o backend da loja
- `TECH10_STORE_BACKEND_URL`
  - fallback legado para catálogo + checkout
- `TECH10_STORE_BEARER_TOKEN`
  - fallback legado de bearer para catálogo + checkout
- `TECH10_CATALOG_BEARER_TOKEN`
  - bearer específico para o backend de catálogo
- `TECH10_CHECKOUT_BEARER_TOKEN`
  - bearer específico para o backend de checkout
- `TECH10_STORE_API_KEY`
  - fallback legado de API key para catálogo + checkout
- `TECH10_CATALOG_API_KEY`
  - API key específica para o backend de catálogo
- `TECH10_CHECKOUT_API_KEY`
  - API key específica para o backend de checkout

## 4. Rotas públicas canônicas

- `/`
- `/loja`
- `/carrinho`
- `/checkout`
- `/pedido-confirmado`
- `/portal`

## 5. Rotas técnicas canônicas

- `/api/store/*`
- `/api/health`
- `/api/runtime-config`

## 6. Nomes legados ainda presentes

Ainda existem nomes como:

- `VIVACOMMERCE_BASE_URL`
- `cartVivaCommerce`
- `vivacommerce_cart_id`
- `revivah-tech`

Esses nomes foram mantidos por compatibilidade de transição e não representam
vínculo oficial com outro projeto.

## 7. Recomendação

Depois do go-live inicial, a próxima limpeza técnica deve atacar:

1. redução gradual dos aliases legados
2. service worker / manifest
3. `admin/` estático
