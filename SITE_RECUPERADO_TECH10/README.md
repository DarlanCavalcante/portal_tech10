# Tech10 — loja (dados do seed)

Template completo da loja Tech10, servido em `/tech10/` pelo storefront. **Produtos e categorias vêm da loja do seed** (slug `tech10-informatica`).

## Configuração

- **api-config.js:** `TECH10_STORE_SLUG: 'tech10-informatica'` — loja criada no seed.
- **api-adapter.js:** Usa `/api/store/tenant/tech10-informatica/products` e `/api/store/tenant/tech10-informatica/categories`.
- Ordem dos scripts no HTML: `api-config.js` → `api-adapter.js` → `cart-vivacommerce.js` → `load-products.js`.

## Seed

A loja **Tech10 Informática** e o usuário lojista são criados em:

- `backend/scripts/seed-complete-system.ts` (trecho “6. LOJA DE TESTE (Tech10 Informatica)”).

Execute o seed para ter produtos e categorias na Tech10:

```bash
cd backend && npx ts-node scripts/seed-complete-system.ts
```

- Loja: slug **tech10-informatica**.
- Lojista: `tech10.infor@gmail.com` / `123456`.

## Acesso

- Storefront: `http://localhost:3000/tech10/` (ou a porta do Next.js).
- Backend deve estar no mesmo host (proxy) ou configurar CORS se a página for servida em outro domínio.
