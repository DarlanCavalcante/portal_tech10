# Arquitetura recomendada para tenant: site + portal + loja

Data de referência: `2026-05-11`

## Objetivo

Ter um tenant publicável com fronteiras claras entre:

- site institucional
- loja pública
- portal do cliente
- ERP operacional

## Arquitetura aplicada na Tech10

### Superfície pública do tenant

- `/` -> site institucional
- `/loja` -> catálogo/carrinho/checkout
- `/portal` -> entrada pública da jornada de O.S.

### Runtime do tenant

- `vercel.json`
- `/api/store/*`
- `/api/health`
- `/api/runtime-config`

### ERP

Permanece como sistema operacional externo a este repositório, acessado por
contrato explícito de URL para:

- portal completo
- status da O.S.

## Modelo de tenant atual

Hoje o contrato mínimo já existe em `js/tenant-config.js`, com:

- identidade do tenant
- branding
- contato
- rotas públicas
- integração da loja
- integração do portal

## Estado de maturidade

### Resolvido nesta rodada

- base única definida: `SITE_RECUPERADO_TECH10/`
- runtime standalone criado
- rotas limpas criadas
- vínculo operacional com projetos externos removido

### Ainda evolutivo

- nomes legados em arquivos e storage
- service worker e manifest
- admin estático

## Fronteira obrigatória

Esta arquitetura não deve:

- tocar em `redevivah.com.br`
- misturar com `vivacommerce`
- confundir storefront público com ERP

## Próximo passo natural

1. criar projeto de deploy próprio da Tech10
2. anexar `tech10.tech10cloud.com`
3. validar a experiência ponta a ponta
