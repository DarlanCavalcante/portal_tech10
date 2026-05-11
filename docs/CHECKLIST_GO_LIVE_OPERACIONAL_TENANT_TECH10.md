# Checklist de Go-Live Operacional do Tenant Tech10

Data-base: `2026-05-11`

## Objetivo

Registrar o checklist mínimo para colocar a experiência pública da Tech10 no ar da
forma mais rápida possível, usando a runtime canônica já existente.

## Estado confirmado hoje

- runtime canônica: `VIVACOMMERCE/storefront`
- projeto Vercel: `vivacommerce`
- project id: `prj_THwYTyH94zNVOwSspNwbOft0kOV8`
- deployment inspecionado: `dpl_Acevj2BYpeVupGXoXEFzjKZakjsd`
- rotas Tech10 já existentes:
  - `/tech10`
  - `/lojas/revivah-tech`
  - `/lojas/revivah-tech/shop`

## Bloqueios atuais

### Domínio

- `vivacommerce.com.br` está associado ao projeto certo;
- o DNS ainda não resolve publicamente;
- `www.vivacommerce.com.br` também não resolve publicamente;
- a Vercel recomendou explicitamente:
  - `A vivacommerce.com.br 76.76.21.21`
  - ou troca completa para `ns1.vercel-dns.com` e `ns2.vercel-dns.com`

### Acesso público

- os aliases `.vercel.app` responderam `401 Unauthorized`;
- o corpo da resposta confirmou `Authentication Required` da Vercel;
- a tentativa de gerar acesso autenticado programático à URL protegida não retornou share URL utilizável nesta sessão;
- isso significa que a borda pública ainda está protegida.

### URL oficial do tenant

A Tech10 ainda não tem uma única URL pública oficial declarada.

## Decisão recomendada

### URL pública oficial

Recomendação:

- usar `/tech10` como entrada oficial institucional do tenant;
- usar `/lojas/revivah-tech/shop` como rota operacional da loja;
- manter `/lojas/revivah-tech` como rota compatível de tenant.

### Estratégia de publicação

Recomendação:

- não publicar `portal_tech10` sozinho como runtime final;
- usar `portal_tech10` como base de saneamento e documentação;
- publicar a experiência real pela runtime `VIVACOMMERCE/storefront`.

## Checklist executivo

1. Corrigir o DNS de `vivacommerce.com.br`.
2. Revalidar resolução pública do domínio.
3. Decidir se a proteção Vercel `Authentication Required` continua ou é removida para a superfície pública.
4. Validar acesso público às rotas:
   - `/tech10`
   - `/lojas/revivah-tech`
   - `/lojas/revivah-tech/shop`
   - considerar `www.vivacommerce.com.br` apenas se ele também for configurado no DNS
5. Conferir variáveis mínimas da runtime:
   - `NEXT_PUBLIC_PLATFORM_DOMAIN`
   - `NEXT_PUBLIC_API_URL`
   - `BACKEND_INTERNAL_URL`
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_PAINEL_URL`
   - `NEXT_PUBLIC_WS_URL`
6. Executar smoke final de tenant:
   - home institucional Tech10
   - navegação para loja
   - listagem de produtos
   - carrinho
   - checkout
   - pedido confirmado

## Veredito

O caminho para produção da Tech10 já está arquiteturalmente encaminhado.

O bloqueio restante é predominantemente operacional na Vercel, não estrutural no
frontend do tenant.
