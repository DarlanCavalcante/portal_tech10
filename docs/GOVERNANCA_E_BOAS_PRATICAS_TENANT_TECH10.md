# Governança e Boas Práticas do Tenant Tech10

Data-base: `2026-05-11`

## Princípios

1. ownership claro por tenant
2. integração explícita com ERP
3. runtime público desacoplado de projetos externos
4. documentação canônica antes de deploy crítico
5. smoke e validação de contrato como gate mínimo

## Fronteiras obrigatórias

Não misturar este projeto com:

- `redevivah.com.br`
- `redevivah-storefront`
- `vivacommerce`

## Convenções

- rotas públicas limpas
- variáveis críticas em `.env.example`
- adapter server-to-server para catálogo
- ADR formal para qualquer mudança de ownership ou runtime

## Dívida técnica aceita por enquanto

- aliases legados como `cartVivaCommerce`
- chaves antigas de carrinho em `localStorage`
- `admin/` estático

Esses itens são aceitos apenas como legado controlado, não como destino final.
