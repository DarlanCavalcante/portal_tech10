# Integração Tech10 com backend VivaCommerce

Este projeto pode usar o backend **VivaCommerce** (Node/Express + Prisma) em vez do Medusa. Siga os passos abaixo.

## 1. Arquivos necessários

- **js/api-config.js** — Defina `provider: 'vivacommerce'` e `VIVACOMMERCE_BASE_URL` (storefront ou backend).
- **js/api-adapter.js** — Normaliza as respostas do VivaCommerce para o formato esperado pelo Tech10 (produtos, categorias, carrinho).
- **js/load-products.js** — Carrega produtos usando o adapter quando o provider é `vivacommerce`.

## 2. Ordem de carregamento no HTML

**Para VivaCommerce** (provider `vivacommerce`), inclua:

```html
<script src="js/api-config.js"></script>
<script src="js/api-adapter.js"></script>
<script src="js/load-products.js"></script>
<script src="js/cart-vivacommerce.js"></script>
```

**Para Medusa**, mantenha:

```html
<script src="js/api-config.js"></script>
<script src="js/load-products-medusa.js"></script>
<script src="js/medusa-cart.js"></script>
```

- Com `cart-vivacommerce.js`, a variável global `medusaCart` é preenchida com o carrinho VivaCommerce, e `addToCartMedusa` (definida em `load-products.js`) chama `medusaCart.addItem`.

## 3. Usar produtos com o adapter

Onde hoje você chama algo como `loadProductsFromMedusa()` e `renderProducts()`, troque para:

```javascript
const products = await loadProductsFromAPI();
renderProductsFromAPI(products, 'produtosGrid');
```

Ou mantenha a lógica atual e apenas garanta que a **resposta da API** já esteja no formato esperado (o adapter faz isso quando a base URL é a do VivaCommerce).

## 4. Carrinho com VivaCommerce

O **medusa-cart.js** usa `API_CONFIG.STORE_API` como `baseUrl`. Com `provider: 'vivacommerce'`, `STORE_API` já é `VIVACOMMERCE_BASE_URL + '/api/store'`. As rotas são as mesmas:

- `POST /api/store/carts` — criar carrinho  
- `GET /api/store/carts/:id` — buscar carrinho  
- `POST /api/store/carts/:id/line-items` — adicionar item (`variant_id`, `quantity`)  
- `PUT /api/store/carts/:id/line-items/:itemId` — atualizar quantidade  
- `DELETE /api/store/carts/:id/line-items/:itemId` — remover item  

Se o backend usar **PUT** para atualizar quantidade (em vez de POST), ajuste o `medusa-cart.js` na função `updateQuantity` para `method: 'PUT'`.

## 5. CORS

Se o Tech10 for servido em outro domínio (ex.: `file://` ou `https://tech10.com`), o backend VivaCommerce precisa permitir a origem nas respostas. No backend Node, configure CORS para a origem do site Tech10.

## 6. Contrato da API

Veja em **docs/CONTRATO_BACKEND_VIVACOMMERCE.md** (na raiz do repositório) o contrato completo de produtos, categorias e carrinho.
