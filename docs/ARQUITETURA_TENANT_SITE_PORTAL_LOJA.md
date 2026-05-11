# Arquitetura recomendada para tenant: site + portal + loja

Data de referência: `2026-05-11`

## Objetivo

Evoluir o `portal_tech10` de uma implementação fortemente acoplada à Tech10 para uma base profissional onde cada tenant possa ter:

- site institucional;
- loja pública;
- portal do cliente;
- acompanhamento de O.S.;
- integração com ERP.

## 1. Separação correta de superfícies

### Site institucional do tenant

Responsável por:

- marca;
- serviços;
- prova social;
- contratos empresariais;
- CTA comercial;
- entrada para loja e portal.

### Loja pública do tenant

Responsável por:

- catálogo;
- categorias;
- carrinho;
- checkout;
- pedido confirmado.

### Portal do cliente

Responsável por:

- acompanhar O.S.;
- aprovar ou recusar orçamento;
- consultar status;
- autenticação leve por código ou magic link.

### ERP interno

Responsável por:

- operação;
- atendimento;
- O.S.;
- estoque;
- financeiro;
- PDV interno.

## 2. Modelo recomendado de tenant

Cada tenant deve ter um manifesto/configuração central, por exemplo:

```json
{
  "slug": "revivah-tech",
  "brand": {
    "name": "Tech10 Informática",
    "tagline": "20 anos de experiência em tecnologia",
    "logoUrl": "/assets/tenants/revivah-tech/logo.svg",
    "primaryColor": "#2563eb",
    "accentColor": "#10b981"
  },
  "contact": {
    "phone": "(55) 3317-0762",
    "whatsapp": "55974001960",
    "email": "tech10.infor@gmail.com"
  },
  "address": {
    "street": "Rua Doutor Bozano, 968 - Loja 8",
    "city": "Santa Maria",
    "state": "RS",
    "zip": "97015-001"
  },
  "store": {
    "provider": "vivacommerce",
    "storeSlug": "revivah-tech"
  },
  "routes": {
    "siteHome": "/lojas/revivah-tech",
    "shopHome": "/lojas/revivah-tech/shop",
    "cart": "/lojas/revivah-tech/cart",
    "checkout": "/lojas/revivah-tech/checkout"
  }
}
```

## 3. Sinais de que o projeto já está perto disso

O código atual já mostra a direção certa:

- loja por `slug`;
- rotas `/lojas/{slug}`;
- página agregadora de lojas;
- configuração de empresa separada;
- adapter de API isolado.

Isso reduz muito o esforço de transformação para um modelo multi-tenant real.

## 4. Lacunas atuais

Hoje ainda faltam:

- centralização única de config;
- eliminação de hardcodes `Tech10`;
- eliminação de paths fixos `/tech10/`;
- convenção única de carrinho;
- empacotamento de deploy profissional;
- documentação canônica de produção/HML;
- contrato explícito entre loja pública e portal do ERP.

## 5. Caminho recomendado

### Fase 1

Transformar a Tech10 em tenant configurável:

- uma única fonte de verdade para branding;
- uma única fonte de verdade para store slug;
- uma única fonte de verdade para rotas.

### Fase 2

Normalizar rotas:

- `/{tenantSlug}` ou `/lojas/{tenantSlug}`
- `/lojas/{tenantSlug}/shop`
- `/lojas/{tenantSlug}/cart`
- `/lojas/{tenantSlug}/checkout`

### Fase 3

Conectar o tenant ao ERP sem misturar repositórios:

- CTA `Acompanhar minha O.S.`
- CTA `Entrar no portal`
- URL de status público
- URL de portal por O.S.

### Fase 4

Adicionar onboarding profissional de tenant:

- brand kit;
- contatos;
- horários;
- domínio;
- slug;
- provider de loja;
- políticas de checkout.

## 6. Fronteira obrigatória desta trilha

Esta arquitetura não deve:

- tocar no `redevivah.com.br`;
- misturar com `redevivah-storefront`;
- acoplar diretamente o ERP a um projeto externo comercial sem contrato claro.

## 7. Próximo passo técnico mais importante

Criar uma camada `tenant-config` dentro do `SITE_RECUPERADO_TECH10` e migrar:

- `empresa-config.js`
- `api-config.js`
- links `/tech10/`
- links `/lojas/revivah-tech/shop`

para leitura centralizada de tenant.

## 8. Andamento desta diretriz

A primeira etapa já foi iniciada em `2026-05-11` com:

- criação de `SITE_RECUPERADO_TECH10/js/tenant-config.js`
- adaptação de `api-config.js`
- adaptação de `empresa-config.js`
- inclusão do `tenant-config.js` nas páginas principais

Pendência principal:

- migrar links e CTAs ainda hardcoded no HTML para helpers/rotas centralizadas.
