# Contrato de Ambiente do Tenant Tech10

Data-base: `2026-05-11`

## Objetivo

Definir as variáveis de ambiente canônicas do runtime standalone da Tech10.

## Variáveis obrigatórias

| Variável | Obrigatória | Papel | Exemplo |
|---|---|---|---|
| `TECH10_TENANT_ID` | Sim | Identificador lógico do tenant | `tech10` |
| `TECH10_PUBLIC_STORE_SLUG` | Sim | Slug público canônico do catálogo | `tech10` |
| `TECH10_SITE_NAME` | Sim | Nome público exibido pelo runtime | `Tech10 Informática` |
| `TECH10_RUNTIME_ID` | Sim | Identificador operacional do runtime standalone | `tech10-portal` |
| `TECH10_CATALOG_SOURCE` | Sim | Estratégia de catálogo: `store_backend` ou `erp_stock` | `erp_stock` |
| `TECH10_CATALOG_BACKEND_URL` | Sim | Backend alvo das leituras do catálogo `/api/store/*` | `https://catalogo.tech10cloud.com` |
| `TECH10_CHECKOUT_MODE` | Sim | Estratégia de checkout: `store_backend` ou `quote_only` | `quote_only` |
| `TECH10_CHECKOUT_BACKEND_URL` | Não* | Backend de carrinho/checkout quando `TECH10_CHECKOUT_MODE=store_backend` | `https://catalogo.tech10cloud.com` |
| `TECH10_ERP_PORTAL_BASE_URL` | Sim | Base do portal completo do ERP | `https://sistema.tech10cloud.com/portal` |
| `TECH10_ERP_STATUS_BASE_URL` | Sim | Base da consulta pública simples | `https://sistema.tech10cloud.com/status` |

## Variáveis opcionais

| Variável | Papel |
|---|---|
| `TECH10_STORE_BEARER_TOKEN` | Fallback legado de bearer token para catálogo + checkout |
| `TECH10_CATALOG_BEARER_TOKEN` | Bearer token específico do backend de catálogo |
| `TECH10_CHECKOUT_BEARER_TOKEN` | Bearer token específico do backend de checkout |
| `TECH10_STORE_API_KEY` | Fallback legado de API key para catálogo + checkout |
| `TECH10_CATALOG_API_KEY` | API key específica do backend de catálogo |
| `TECH10_CHECKOUT_API_KEY` | API key específica do backend de checkout |
| `TECH10_SUPPORT_WHATSAPP` | Canal de atendimento quando a loja opera em `quote_only` |
| `TECH10_STORE_BACKEND_URL` | Fallback legado para catálogo + checkout |
| `STORE_BACKEND_URL` | Fallback temporário compatível para `TECH10_STORE_BACKEND_URL` |

## Semântica operacional

- o slug público canônico desta base é `tech10`; `revivah-tech` fica só como alias legado
- sem `TECH10_CATALOG_BACKEND_URL`, o runtime sobe mas fica `degraded`
- sem `TECH10_CHECKOUT_BACKEND_URL` e com `TECH10_CHECKOUT_MODE=store_backend`, checkout e carrinho ficam indisponíveis
- sem `TECH10_ERP_PORTAL_BASE_URL` ou `TECH10_ERP_STATUS_BASE_URL`, o runtime perde a ponte oficial com o ERP
- tokens nunca devem ir para o HTML ou para `tenant-config.js`

## Fonte de verdade

- arquivo de exemplo: [SITE_RECUPERADO_TECH10/.env.example](/Users/darlancavalcante/Documents/TECH/portal_tech10/SITE_RECUPERADO_TECH10/.env.example)
- endpoint público de leitura operacional: `/api/runtime-config`
