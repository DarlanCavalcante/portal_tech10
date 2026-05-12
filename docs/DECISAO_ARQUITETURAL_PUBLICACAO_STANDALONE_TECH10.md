# Decisão Arquitetural de Publicação Standalone da Tech10

Data-base: `2026-05-11`

## Decisão

A Tech10 deve publicar em runtime próprio, usando como base canônica:

- repositório: `portal_tech10`
- diretório de deploy: `SITE_RECUPERADO_TECH10/`

Sem dependência operacional de:

- `vivacommerce`
- `redevivah-storefront`
- qualquer outro runtime externo não autorizado

## O que foi decidido de forma prática

1. a base única da Tech10 passa a ser `SITE_RECUPERADO_TECH10/`
2. o runtime canônico agora é standalone, com:
   - `vercel.json`
   - `/api/store/*`
   - `/api/health`
   - `/api/runtime-config`
   - `/portal`
3. o `portal_tech10` deixa de depender de domínio ou alias anexado a outro projeto
4. o ERP continua integrado por contrato explícito, via URLs de portal/status

## Por que essa é a forma correta

- preserva o material já pronto do tenant
- evita mistura de ownership com projetos externos
- cria uma fronteira clara entre:
  - site/loja Tech10
  - backend de catálogo
  - portal/O.S. do ERP
- permite trocar backend da loja no futuro sem reescrever a superfície pública

## Arquitetura resultante

### Superfície pública do tenant

- `/` -> institucional
- `/loja` -> catálogo
- `/carrinho`
- `/checkout`
- `/pedido-confirmado`
- `/portal`

### Superfície técnica do runtime

- `/api/store/*` -> proxy same-origin para backend da loja
- `/api/health` -> health do runtime Tech10
- `/api/runtime-config` -> config pública de integração

### Integração explícita com ERP

- `TECH10_ERP_PORTAL_BASE_URL`
- `TECH10_ERP_STATUS_BASE_URL`

## Veredito

A Tech10 não precisa de outro projeto para avançar.

O caminho profissional e escalável agora é:

1. subir `SITE_RECUPERADO_TECH10/` em projeto próprio
2. configurar variáveis de deploy
3. anexar `tech10.tech10cloud.com`
4. rodar smoke de site + vendas + portal
