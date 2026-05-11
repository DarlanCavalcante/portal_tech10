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
  - valor atual: `revivah-tech`
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
  - valor atual: `/imagem/logo/tech10-logo-fundo-azul.png`
- `brand.fallbackProductImageUrl`
  - valor atual: `/imagem/propaganda loja/tecnologia.jpeg`
- `brand.primaryColor`
  - valor atual: `#2563eb`
- `brand.accentColor`
  - valor atual: `#10b981`

### store

- `store.provider`
  - valor atual: `tech10-standalone`
- `store.slug`
  - valor atual: `revivah-tech`
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

- `TECH10_STORE_BACKEND_URL`
  - backend alvo do proxy `/api/store/*`

### Opcionais

- `STORE_BACKEND_URL`
  - fallback compatível para o backend da loja
- `TECH10_STORE_BEARER_TOKEN`
  - adiciona header `Authorization: Bearer ...` no upstream
- `TECH10_STORE_API_KEY`
  - adiciona header `x-api-key` no upstream
- `TECH10_ERP_PORTAL_BASE_URL`
  - substitui a URL padrão do portal completo
- `TECH10_ERP_STATUS_BASE_URL`
  - substitui a URL padrão da consulta rápida

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
- `cart-vivacommerce.js`
- `vivacommerce_cart_id`
- `vc_cart_id`

Esses nomes foram mantidos por compatibilidade de transição e não representam
vínculo oficial com outro projeto.

## 7. Recomendação

Depois do go-live inicial, a próxima limpeza técnica deve atacar:

1. nomes legados de arquivos e chaves
2. service worker / manifest
3. `admin/` estático
