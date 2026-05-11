# Plano Rápido de Produção do Tenant Tech10

Data-base: `2026-05-11`

## Objetivo

Colocar o tenant Tech10 em produção com `site + vendas + portal` no menor caminho
seguro possível, sem misturar com outros projetos fora do escopo deste trabalho.

## Verdade confirmada

- O repositório `portal_tech10` é a working copy rica do tenant Tech10.
- A camada `SITE_RECUPERADO_TECH10/` já possui:
  - home institucional;
  - catálogo;
  - carrinho;
  - checkout;
  - pedido confirmado;
  - admin estático;
  - sinais de multi-tenant por slug.
- O runtime canônico mais provável da publicação real está em
  `VIVACOMMERCE/storefront`, ligado ao projeto Vercel `vivacommerce`.
- O caminho Tech10 já existe no runtime canônico:
  - `/tech10`
  - `/lojas/revivah-tech`
  - `/lojas/revivah-tech/shop`

## Caminho mais curto para produção

### Opção recomendada

Usar `VIVACOMMERCE/storefront` como runtime oficial e tratar `portal_tech10` como:

- fonte de conteúdo;
- fonte de assets;
- fonte de referência para páginas estáticas e comportamento legado;
- área segura para saneamento de hardcodes antes de migrar para a runtime canônica.

### O que já ficou adiantado no `portal_tech10`

- `SITE_RECUPERADO_TECH10/js/tenant-config.js`
- `SITE_RECUPERADO_TECH10/js/tenant-routes.js`
- `SITE_RECUPERADO_TECH10/js/api-config.js` adaptado para `TENANT_CONFIG`
- `SITE_RECUPERADO_TECH10/js/empresa-config.js` adaptado para `TENANT_CONFIG`
- páginas principais carregando essas camadas antes dos scripts dependentes

Isso reduz o custo de replicar a identidade e as rotas da Tech10 em outros tenants.

## Bloqueios reais hoje

### 1. Domínio da plataforma

O domínio `vivacommerce.com.br` está vinculado ao projeto correto na Vercel, mas o
DNS ainda não está íntegro. Sem isso, a publicação pública fica inconsistente.

### 2. Proteção de borda

O deployment `.vercel.app` inspecionado respondeu `401 Unauthorized`.

Isso indica uma destas situações:

- proteção de deployment ativa;
- autenticação de preview/produção na borda;
- regra de acesso impedindo validação pública.

Enquanto isso não for decidido, não dá para tratar a loja Tech10 como experiência
publicamente aberta e estável.

### 3. Escolha da URL oficial da Tech10

Antes do go-live, precisa haver uma URL oficial única para a jornada pública:

- `/tech10`
- `/lojas/revivah-tech`
- `/lojas/revivah-tech/shop`

Recomendação prática:

- usar `/tech10` como URL institucional de entrada do tenant;
- deixar `/lojas/revivah-tech/shop` como rota operacional da loja;
- manter `/lojas/revivah-tech` como rota de compatibilidade e fallback de tenant.

## Variáveis canônicas da publicação

Estas variáveis aparecem na runtime canônica `VIVACOMMERCE/storefront` e impactam
diretamente a publicação do tenant:

- `NEXT_PUBLIC_PLATFORM_DOMAIN`
  - domínio-base da plataforma multi-tenant.
- `NEXT_PUBLIC_API_URL`
  - URL pública do backend usada no cliente.
- `BACKEND_INTERNAL_URL`
  - URL interna do backend para SSR/server routes.
- `NEXT_PUBLIC_PAINEL_URL`
  - URL do painel administrativo relacionada a convites e redirecionamentos.
- `NEXT_PUBLIC_WS_URL`
  - URL de websocket para tempo real/chat.
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
  - chave pública para notificações push.
- `NEXT_PUBLIC_DEFAULT_STORE_ID`
  - store id padrão usado por alguns componentes de tema/banner.
- `NEXT_PUBLIC_PLATFORM_NAME`
  - nome da plataforma exibido em prompts/UI.
- `NEXT_PUBLIC_SENTRY_DSN`
  - observabilidade do frontend, quando habilitada.

Observação:

- `NEXT_PUBLIC_SITE_URL` aparece na runtime para `robots/sitemap` e precisa ser
  tratada com atenção para não publicar metadados globais incorretos na experiência
  do tenant.

## Hardcodes remanescentes no `portal_tech10`

Mesmo com `tenant-config.js` e `tenant-routes.js`, ainda existem pontos com
acoplamento Tech10 que precisam de rodada posterior:

- `SITE_RECUPERADO_TECH10/sw.js`
- `SITE_RECUPERADO_TECH10/manifest.json`
- `SITE_RECUPERADO_TECH10/js/product-modal.js`
- `SITE_RECUPERADO_TECH10/js/load-products.js`
- `SITE_RECUPERADO_TECH10/js/load-products-medusa.js`
- `SITE_RECUPERADO_TECH10/js/home-shop.js`
- `SITE_RECUPERADO_TECH10/admin/*`

Esses pontos não impedem a documentação e a padronização atual, mas impedem dizer
que o pacote já está 100% tenant-agnostic.

## Próxima ordem recomendada

1. Corrigir o DNS do projeto `vivacommerce`.
2. Decidir se a borda pública continuará protegida com `401`.
3. Escolher a URL oficial da Tech10.
4. Migrar os hardcodes remanescentes do `portal_tech10` para configuração.
5. Espelhar apenas o necessário na runtime canônica `VIVACOMMERCE/storefront`.
6. Fazer um raio-x final de publicação com:
   - URL final;
   - domínio;
   - rota oficial;
   - variáveis confirmadas;
   - checklist de smoke.

## Veredito

O cenário mais profissional e rápido não é publicar o `portal_tech10` isoladamente.

O cenário mais seguro é:

- manter `portal_tech10` como base de saneamento e referência;
- usar `VIVACOMMERCE/storefront` como runtime oficial de produção;
- resolver primeiro domínio, acesso e URL oficial;
- só depois concluir a rodada final de publicação Tech10.
