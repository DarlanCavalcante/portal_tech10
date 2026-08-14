# 01 — Project Brief

## O que é
`portal_tech10` — repositório do tenant **Tech10 Informática e Tecnologia** (assistência técnica em Santa Maria – RS). Contém duas superfícies:

1. **Site institucional legado** na raiz (`index.html`, `css/style.css`, `js/main.js`) — landing page single-page dark mode, gerador de leads via WhatsApp.
2. **Runtime canônico de produção** em `SITE_RECUPERADO_TECH10/` — site + loja + carrinho + checkout + portal do cliente (O.S.), com funções serverless mínimas (proxy da loja, health, config).

> A base canônica de publicação é `SITE_RECUPERADO_TECH10/`. O código na raiz é legado/histórico (ver [[09-decisions]] e [[02-architecture]]).

## Para quem
- Clientes da Tech10 em Santa Maria – RS: consulta de serviços, compra na loja online e acompanhamento/aprovação de Ordem de Serviço (O.S.) via portal.
- Equipe interna Tech10: operação da loja e do portal.

## Propósito
Vitrine digital + loja pública + portal do cliente para acompanhar O.S., integrado (via proxy same-origin `/api/store/*`) a um backend de catálogo/checkout e ao ERP `tech10cloud`.

## Contato / integrações
- WhatsApp de suporte: `55974001960` (usado no modo `quote_only`).
- ERP: `sistema.tech10cloud.com` (portal e status de O.S.).

Ver [[02-architecture]] e [[04-environments]].
