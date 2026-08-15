# 02 — Arquitetura

## Duas superfícies no mesmo repo
- **Raiz** (legado): landing institucional estática — `index.html`, `css/style.css` (~42 KB), `js/main.js` (~20 KB). HTML/CSS/JS vanilla + GSAP/ScrollTrigger via CDN. Deploy Vercel projeto `tech10-portal` (`.vercel/project.json`).
- **`SITE_RECUPERADO_TECH10/`** (canônico): runtime standalone de produção. É a base a ser tratada como fonte primária de mudança.

## Runtime canônico — estrutura (top-level)
```
SITE_RECUPERADO_TECH10/
├── index.html              # home institucional
├── produtos.html           # /loja (catálogo)
├── carrinho.html           # /carrinho
├── checkout.html           # /checkout
├── pedido-confirmado.html  # /pedido-confirmado
├── home-shop.html
├── portal/index.html       # /portal e /status (entrada pública da O.S.)
├── admin/                  # admin estático legado (login, dashboard, monitor)
├── categorias/             # páginas por categoria
├── api/                    # funções serverless (Vercel)
│   ├── store-proxy.js      # proxy same-origin p/ backend da loja
│   ├── health.js           # /api/health
│   ├── runtime-config.js   # /api/runtime-config (config pública)
│   └── runtime-env.js      # resolução de env do tenant
├── js/                     # ~20 módulos JS vanilla (ver abaixo)
├── scripts/                # validate-runtime-contract.mjs, smoke-runtime.mjs
├── css/, imagem/, imagem-otimizada/
├── sw.js, manifest.json    # PWA
├── vercel.json             # rotas/rewrites/redirects/headers
├── package.json            # scripts validate:runtime / smoke:runtime
└── .env.example            # contrato de ambiente do tenant
```

## Rotas públicas canônicas (via `vercel.json` rewrites)
`/` · `/loja` · `/carrinho` · `/checkout` · `/pedido-confirmado` · `/portal` · `/portal/:os` · `/status/:os`

## Rotas serverless
- `/api/store` e `/api/store/*` → `api/store-proxy.js` (proxy same-origin; token fica no servidor).
- `/api/health` → health do runtime.
- `/api/runtime-config` → config pública de integração.

## Módulos JS principais (runtime)
`portal-entry.js`, `tenant-config.js`, `tenant-routes.js`, `api-config.js`, `api-adapter.js`, `api-client.js`, `cart-storefront.js` (canônico), `cart-manager.js`, `cart-vivacommerce.js` (alias legado), `load-products*.js`, `medusa-*.js` (indícios de integração Medusa), `product-modal.js`, `content-manager.js`.

## Padrões / princípios
- **Multi-tenant por env**: identidade e backends resolvidos por variáveis `TECH10_*` (ver [[03-tech-context]] e `.env.example`).
- **Same-origin proxy**: frontend nunca fala direto com backend externo nem expõe tokens; tudo via `/api/store/*` (ver [[03-tech-context]] armadilhas e `SECURITY.md`).
- **Compatibilidade legada preservada**: aliases `revivah-tech` (slug), `vivacommerce_cart_id`, `VIVACOMMERCE_BASE_URL` mantidos só p/ transição; canônico usa slug `tech10` e `tech10_storefront_cart_id`.
- Sem framework de build, sem TypeScript, sem bundler — HTML/CSS/JS vanilla servidos estáticos + serverless functions Vercel.

Contratos completos em `docs/CONTRATO_DE_AMBIENTE_TENANT_TECH10.md`, `docs/ARQUITETURA_TENANT_SITE_PORTAL_LOJA.md`, `docs/adr/ADR-001-RUNTIME-STANDALONE-TECH10.md`.
