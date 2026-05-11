# Checklist de Go-Live Operacional do Tenant Tech10

Data-base: `2026-05-11`

## Objetivo

Registrar o checklist mínimo para colocar a experiência pública da Tech10 no ar
em projeto próprio da Tech10.

## Estado confirmado hoje

- base auditada principal: `portal_tech10`
- base adjacente: `tech10-informatica`
- domínio desejado para publicação própria: `tech10.tech10cloud.com`
- alias desse domínio com o projeto `vivacommerce` removido em `2026-05-11`

## Bloqueios atuais

### Base única

- ainda falta decidir entre `portal_tech10` e `tech10-informatica`

### Domínio

- `tech10.tech10cloud.com` segue como bom alvo de publicação
- ele não deve ser reapontado para projeto externo sem validação explícita

### URL oficial do tenant

A recomendação atual é:

- `https://tech10.tech10cloud.com`
- `https://tech10.tech10cloud.com/loja`
- `https://tech10.tech10cloud.com/portal`

## Estratégia de publicação

- escolher uma única base da Tech10;
- criar projeto próprio de deploy;
- só depois apontar o domínio final;
- integrar portal/ERP por contrato explícito.

## Checklist executivo

1. Escolher a base única entre `portal_tech10` e `tech10-informatica`.
2. Criar projeto próprio da Tech10.
3. Criar no Cloudflare o registro do domínio final apontando para o projeto novo.
4. Validar acesso público às rotas:
   - `https://tech10.tech10cloud.com`
   - `https://tech10.tech10cloud.com/loja`
   - `https://tech10.tech10cloud.com/portal`
5. Conferir variáveis mínimas da publicação:
   - `NEXT_PUBLIC_API_URL`
   - `BACKEND_INTERNAL_URL`
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_PAINEL_URL`
   - `NEXT_PUBLIC_WS_URL`
6. Executar smoke final:
   - home institucional
   - catálogo
   - carrinho
   - checkout
   - pedido confirmado
   - entrada do portal

## Veredito

O bloqueio restante agora é de decisão arquitetural e publicação própria da
Tech10, não de vínculo externo.
