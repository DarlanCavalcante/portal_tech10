# Variáveis e Configuração do portal_tech10

Data de referência: `2026-05-11`

## Objetivo

Este documento registra as variáveis, constantes e hardcodes relevantes do projeto `portal_tech10`, para evitar perda de contexto durante a evolução para site/portal/loja por tenant.

## 1. Configuração de API

Camada central nova:

- `SITE_RECUPERADO_TECH10/js/tenant-config.js`

Arquivo principal:

- `SITE_RECUPERADO_TECH10/js/api-config.js`

Chaves atuais:

- `provider`
  - valor atual: `vivacommerce`
  - papel: seleciona o provider da camada de loja
  - observação: hoje deve ser tratado como label legado/adaptador local, não como
    prova de vínculo operacional ativo com outro projeto

- `TECH10_STORE_SLUG`
  - valor atual: `revivah-tech`
  - papel: slug da loja/tenant consumido pelo adapter

- `VIVACOMMERCE_BASE_URL`
  - valor atual: `window.location.origin` com fallback para `http://localhost:3101`
  - papel: base do backend/storefront que responde produtos, categorias e carrinho

- `ACTIVE_URL`
  - derivado de `VIVACOMMERCE_BASE_URL`

- `STORE_API`
  - derivado: `${VIVACOMMERCE_BASE_URL}/api/store`

- `ADMIN_API`
  - derivado: `${ACTIVE_URL}/api`

- `HEALTH`
  - derivado: `${ACTIVE_URL}/health`

## 2. Configuração de tenant/empresa

Camada central nova:

- `SITE_RECUPERADO_TECH10/js/tenant-config.js`

Arquivo principal:

- `SITE_RECUPERADO_TECH10/js/empresa-config.js`

Campos atuais:

- `nome`
- `slogan`
- `descricao`
- `telefone`
- `whatsapp`
- `email`
- `endereco.rua`
- `endereco.bairro`
- `endereco.cidade`
- `endereco.estado`
- `endereco.cep`
- `horarios.semana`
- `horarios.sabado`
- `horarios.domingo`
- `social.facebook`
- `social.instagram`
- `social.twitter`
- `social.whatsappLink`
- `social.tiktok`
- `social.youtube`
- `stats.anosExperiencia`
- `stats.clientesSatisfeitos`
- `stats.produtosDisponiveis`
- `sobre.historia`
- `sobre.missao`
- `seo.titulo`
- `seo.descricao`

## 3. Hardcodes de path e rota

Os seguintes padrões atuais precisam virar configuração genérica por tenant:

- `/tech10/`
- `/tech10/carrinho.html`
- `/tech10/produtos.html`
- `/lojas/revivah-tech/shop`
- `/shop?store=revivah-tech&categorySlug=...`

Arquivos com ocorrência:

- `SITE_RECUPERADO_TECH10/index.html`
- `SITE_RECUPERADO_TECH10/produtos.html`
- `SITE_RECUPERADO_TECH10/carrinho.html`
- `SITE_RECUPERADO_TECH10/js/home-shop.js`
- `SITE_RECUPERADO_TECH10/js/product-modal.js`
- `SITE_RECUPERADO_TECH10/js/load-products.js`
- `SITE_RECUPERADO_TECH10/js/load-products-medusa.js`

## 4. Hardcodes de contato e branding

Hoje existem referências diretas à Tech10 em:

- telefone `(55) 3317-0762`
- WhatsApp `55974001960`
- email `tech10.infor@gmail.com`
- Instagram `@tech10info`
- nome visual `Tech10`
- arquivos de logo em `imagem/logo/tech10-logo-fundo-azul.png`

Isso aparece em HTML, JS e configurações.

## 5. Integração de loja confirmada

Arquivo principal:

- `SITE_RECUPERADO_TECH10/js/api-adapter.js`

Rotas confirmadas:

- `GET /api/store/lojas/:slug/produtos`
- `POST /api/store/carts`
- `GET /api/store/carts/:id`
- `POST /api/store/carts/:id/line-items`
- `PUT /api/store/carts/:id/line-items/:itemId`
- `DELETE /api/store/carts/:id/line-items/:itemId`

## 6. Chaves de storage local

Chaves encontradas:

- `vivacommerce_cart_id`
- `medusa_cart_id`
- `vc_cart_id`
- `cart`

Leitura importante:

há coexistência de camadas antigas e novas de carrinho. Isso sugere necessidade de saneamento antes de produção forte multi-tenant.

## 7. Endpoints e serviços externos

Endpoints externos confirmados:

- `https://viacep.com.br/ws/.../json/`
- `https://wa.me/...`
- `https://maps.google.com/...`
- `https://www.google.com/maps/...`
- `https://fonts.googleapis.com/...`
- `https://cdnjs.cloudflare.com/...`

## 8. Variáveis candidatas a contrato canônico por tenant

Sugestão de contrato futuro:

- `TENANT_SLUG`
- `TENANT_NAME`
- `TENANT_TAGLINE`
- `TENANT_DESCRIPTION`
- `TENANT_PHONE`
- `TENANT_WHATSAPP`
- `TENANT_EMAIL`
- `TENANT_INSTAGRAM`
- `TENANT_FACEBOOK`
- `TENANT_ADDRESS_STREET`
- `TENANT_ADDRESS_NEIGHBORHOOD`
- `TENANT_ADDRESS_CITY`
- `TENANT_ADDRESS_STATE`
- `TENANT_ADDRESS_ZIP`
- `TENANT_HOURS_WEEKDAYS`
- `TENANT_HOURS_SATURDAY`
- `TENANT_HOURS_SUNDAY`
- `TENANT_SEO_TITLE`
- `TENANT_SEO_DESCRIPTION`
- `TENANT_LOGO_URL`
- `TENANT_BRAND_PRIMARY`
- `TENANT_BRAND_ACCENT`
- `STORE_PROVIDER`
- `STORE_BASE_URL`
- `STORE_API_BASE_URL`
- `STORE_SLUG`
- `STORE_HOME_PATH`
- `STORE_CART_PATH`
- `STORE_CHECKOUT_PATH`
- `PORTAL_STATUS_URL_TEMPLATE`
- `PORTAL_OS_URL_TEMPLATE`

## 9. Recomendação

Antes de mexer em layout profundo, o projeto deve ganhar uma camada única de configuração por tenant que substitua:

- dados espalhados em `empresa-config.js`;
- slug espalhado em `api-config.js` e HTML;
- paths fixos como `/tech10/`;
- contatos e assets hardcoded.

## 10. Progresso já aplicado

Nesta rodada, o projeto recebeu a primeira camada real de centralização:

- `SITE_RECUPERADO_TECH10/js/tenant-config.js`

E os arquivos abaixo passaram a consumir essa camada:

- `SITE_RECUPERADO_TECH10/js/api-config.js`
- `SITE_RECUPERADO_TECH10/js/empresa-config.js`

Além disso, as páginas principais passaram a carregar `tenant-config.js` antes da configuração dependente.

Também foi criada uma camada de reescrita de rotas:

- `SITE_RECUPERADO_TECH10/js/tenant-routes.js`

Essa camada já começa a substituir links hardcoded como:

- `/tech10/`
- `/tech10/carrinho.html`
- `/lojas/revivah-tech/shop`
- `/shop?store=revivah-tech...`
- `https://wa.me/55974001960`

## 11. Referências externas históricas

Além da configuração local do `portal_tech10`, foram encontradas referências
históricas a uma runtime externa com variáveis como:

- `NEXT_PUBLIC_PLATFORM_DOMAIN`
  - domínio-base de runtime externo investigado.

- `NEXT_PUBLIC_API_URL`
  - URL pública do backend para cliente/browser.

- `BACKEND_INTERNAL_URL`
  - URL interna do backend para SSR e rotas server-side.

- `NEXT_PUBLIC_PAINEL_URL`
  - URL do painel usada em convites, aceitação e redirecionamentos.

- `NEXT_PUBLIC_WS_URL`
  - endpoint de websocket/tempo real.

- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
  - chave pública de notificações push.

- `NEXT_PUBLIC_DEFAULT_STORE_ID`
  - store id padrão usado por componentes de banners/tema quando necessário.

- `NEXT_PUBLIC_PLATFORM_NAME`
  - nome da plataforma exposto em algumas UIs.

- `NEXT_PUBLIC_SENTRY_DSN`
  - observabilidade frontend, quando habilitada.

- `NEXT_PUBLIC_SITE_URL`
  - base usada por `robots` e `sitemap`.

## 12. Leitura operacional atual

Hoje, a configuração do tenant Tech10 mostra:

1. configuração local saneada no `portal_tech10`;
2. referências históricas externas que não devem ser promovidas automaticamente a
   runtime oficial.

Por decisão operacional desta rodada, essas referências externas ficam tratadas
como contexto técnico, não como vínculo de publicação.
