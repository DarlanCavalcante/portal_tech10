# Checklist de Go-Live Operacional do Tenant Tech10

Data-base: `2026-05-11`

## Escopo

Checklist para colocar no ar o runtime próprio da Tech10, usando
`SITE_RECUPERADO_TECH10/`.

## Pré-condições

- projeto dedicado criado no provedor de deploy
- root directory configurado como `SITE_RECUPERADO_TECH10`
- domínio `tech10.tech10cloud.com` sem vínculo com projeto externo

## Estado atual confirmado

- projeto dedicado confirmado: `tech10-portal`
- alias de produção confirmado: `https://tech10-portal.vercel.app`
- `TECH10_CATALOG_SOURCE=erp_stock` configurado em produção
- `TECH10_CATALOG_BACKEND_URL=https://core.tech10cloud.com` configurado em produção
- `TECH10_CHECKOUT_MODE=quote_only` configurado em produção
- `storeSlug=tech10` ativo no tenant real da Tech10
- ERP já responde `200` em `/api/store/lojas/tech10/produtos`
- runtime do portal já responde `status=ok` em `/api/health`

## Variáveis mínimas

1. `TECH10_CATALOG_SOURCE`
2. `TECH10_CATALOG_BACKEND_URL`
3. `TECH10_CHECKOUT_MODE`
4. `TECH10_ERP_PORTAL_BASE_URL`
5. `TECH10_ERP_STATUS_BASE_URL`

Opcional:

6. `TECH10_CHECKOUT_BACKEND_URL`
7. `TECH10_STORE_BEARER_TOKEN`
8. `TECH10_STORE_API_KEY`
9. `TECH10_SUPPORT_WHATSAPP`

## Rotas que precisam responder

1. `/`
2. `/loja`
3. `/carrinho`
4. `/checkout`
5. `/pedido-confirmado`
6. `/portal`
7. `/api/health`
8. `/api/runtime-config`

## Smoke mínimo

1. home institucional abre sem erro
2. catálogo carrega produtos via `/api/store/*`
3. se `TECH10_CHECKOUT_MODE=store_backend`, carrinho recebe item
4. se `TECH10_CHECKOUT_MODE=store_backend`, checkout abre com resumo do carrinho
5. se `TECH10_CHECKOUT_MODE=quote_only`, botão da loja abre atendimento
5. portal abre e redireciona corretamente para status/portal do ERP
6. `/api/health?deep=1` retorna `ok` ou indica claramente o upstream que falhou

## Domínio

1. anexar `tech10.tech10cloud.com` ao projeto correto
2. criar registro DNS apontando para a Vercel
3. validar:
   - `https://tech10.tech10cloud.com`
   - `https://tech10.tech10cloud.com/loja`
   - `https://tech10.tech10cloud.com/portal`

## Veredito

Depois desta rodada, o go-live da Tech10 nao depende mais de reestruturacao
arquitetural.

O bloqueio remanescente e operacional de catalogo:

1. vincular os produtos da Tech10 ao `catalogProductId`
2. revisar taxonomia/categorias publicas
3. validar a vitrine com itens reais antes do dominio oficial
