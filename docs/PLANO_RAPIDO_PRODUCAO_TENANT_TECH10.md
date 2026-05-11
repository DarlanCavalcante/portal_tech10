# Plano Rápido de Produção do Tenant Tech10

Data-base: `2026-05-11`

## Objetivo

Colocar a Tech10 em produção com `site + vendas + portal` usando base própria,
sem misturar com outros projetos.

## Verdade atual

- base única escolhida: `portal_tech10/SITE_RECUPERADO_TECH10`
- runtime standalone já preparado
- rotas públicas já definidas:
  - `/`
  - `/loja`
  - `/carrinho`
  - `/checkout`
  - `/pedido-confirmado`
  - `/portal`
- proxy de loja já preparado em `/api/store/*`

## Caminho mais curto para produção

1. criar projeto de deploy próprio da Tech10
   - sugestão: `tech10-portal`
   - root directory: `SITE_RECUPERADO_TECH10`
2. configurar variáveis mínimas:
   - `TECH10_STORE_BACKEND_URL`
   - `TECH10_ERP_PORTAL_BASE_URL`
   - `TECH10_ERP_STATUS_BASE_URL`
3. executar preview do projeto
4. validar:
   - home
   - catálogo
   - carrinho
   - checkout
   - entrada do portal
5. anexar `tech10.tech10cloud.com`
6. executar smoke final em domínio oficial

## O que já ficou adiantado

- `vercel.json`
- `api/store-proxy.js`
- `api/health.js`
- `api/runtime-config.js`
- `portal/index.html`
- `js/portal-entry.js`
- `js/tenant-config.js`
- `js/tenant-routes.js`

## Riscos ainda abertos

- nomenclaturas legadas como `cart-vivacommerce.js`
- coexistência de chaves de carrinho no `localStorage`
- `admin/` ainda é legado estático e não deve ser tratado como painel pronto de produção
- service worker e `manifest.json` ainda merecem rodada de saneamento depois do go-live inicial

## Veredito

O bloqueio principal agora não é mais arquitetura.

É só publicação operacional:

1. criar projeto próprio
2. configurar env
3. apontar domínio
