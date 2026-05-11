# Contrato de Catálogo com Estoque do ERP para a Tech10

Data-base: `2026-05-11`

## Objetivo

Definir como a Tech10 pode publicar produtos oriundos do estoque do ERP sem
acoplar o storefront a outro runtime e sem misturar ownership com projetos
externos.

## Estado atual

- o runtime canônico da Tech10 é `portal_tech10/SITE_RECUPERADO_TECH10`
- a loja pública já consome `/api/store/*` via proxy same-origin
- o ERP principal já possui conceitos internos úteis:
  - peças/estoque
  - catálogo publicado
  - vínculo entre item interno e item público
- ainda não existe um endpoint público/BFF canônico no ERP para servir esse
  catálogo à Tech10

## Decisão recomendada

O storefront Tech10 deve continuar consumindo um **contrato HTTP estável**
compatível com `/api/store/*`. Quando a origem dos produtos vier do estoque do
ERP, o backend do catálogo precisa expor esse mesmo contrato, mesmo que por
baixo use `parts`, `catalogProduct` ou outro agregado interno.

Isso permite:

- trocar a origem do catálogo sem refatorar o frontend
- operar com `TECH10_CATALOG_SOURCE=erp_stock`
- manter `TECH10_CHECKOUT_MODE=quote_only` ou `store_backend`, conforme a
  maturidade do fluxo comercial

## Contrato mínimo esperado

### Listagem de produtos

- `GET /api/store/lojas/:slug/produtos?limit=50&offset=0&category=...&search=...`

Resposta mínima compatível:

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod_123",
        "title": "iPhone 14 128GB",
        "description": "Produto revisado e com garantia",
        "thumbnail": "https://cdn.tech10cloud.com/produtos/iphone14.jpg",
        "images": [{ "url": "https://cdn.tech10cloud.com/produtos/iphone14.jpg" }],
        "category": {
          "id": "cat_smartphones",
          "name": "Smartphones",
          "handle": "smartphones"
        },
        "variants": [
          {
            "id": "variant_123",
            "title": "Única",
            "inventory_quantity": 3,
            "prices": [{ "amount": 459900 }]
          }
        ]
      }
    ]
  }
}
```

### Detalhe de produto

- `GET /api/store/products/:id`

### Categorias

- `GET /api/store/categories`

## Regra recomendada de publicação a partir do estoque

- só publicar itens marcados como vendáveis no catálogo
- bloquear itens sem preço final definido
- refletir `inventory_quantity` do estoque real ou de uma visão publicada
- manter imagem e categoria obrigatórias antes da publicação
- permitir estoque `0`, mas sinalizar como indisponível

## Modos de checkout suportados

### `TECH10_CHECKOUT_MODE=quote_only`

Uso recomendado na primeira fase do catálogo oriundo do ERP.

- catálogo navega normalmente
- botões da loja viram CTA de atendimento/WhatsApp
- carrinho e checkout não são tratados como contrato obrigatório

### `TECH10_CHECKOUT_MODE=store_backend`

Uso recomendado só quando existir backend transacional estável para carrinho,
pedido e pagamento.

## Próximo passo crítico

Criar no ERP um BFF público e explicitamente versionado para a Tech10, capaz de
servir o contrato `/api/store/*` a partir do catálogo/estoque interno sem expor
rotas administrativas.
