# Raio-X de Go-Live do Catalogo Tenant Tech10

Data-base: `2026-05-11`

## Resumo executivo

O tenant Tech10 ja esta operacionalmente preparado para publicar `site + portal + loja`
em runtime proprio, sem mistura com outros projetos.

O bloqueio que restou nao e mais de deploy, nem de dominio, nem de integracao basica.

O bloqueio atual nao e mais publicar itens no catalogo central.

Essa etapa ja foi concluida. O foco agora e **lapidar a qualidade da vitrine**
com taxonomia, categoria e imagem, antes do dominio oficial.

## O que foi confirmado

### Runtime publico Tech10

- projeto dedicado: `tech10-portal`
- alias de producao: `https://tech10-portal.vercel.app`
- runtime publicado em modo `standalone`
- `api/runtime-config` responde com:
  - `tenantId=tech10`
  - `catalogSource=erp_stock`
  - `checkoutMode=quote_only`
  - `catalogBackendUrl=https://core.tech10cloud.com`
- `api/health` responde `status=ok`

### ERP principal

- HML responde em:
  - `https://api-preproduction.up.railway.app/api/store/lojas/tech10/produtos`
  - `https://api-preproduction.up.railway.app/api/store/lojas/tech10/categorias`
- producao responde em:
  - `https://core.tech10cloud.com/api/store/lojas/tech10/produtos`
- o `storeSlug=tech10` foi confirmado em:
  - tenant HML de smoke
  - tenant real da Tech10 em producao

### Estado atual da resposta publica

As rotas publicas respondem `200`, com identidade correta da loja e agora com
catalogo real publicado.

Isso comprova que:

1. o contrato tecnico esta no ar;
2. o slug esta resolvendo corretamente;
3. o tenant esta publicado;
4. o catalogo publico ja esta populado.

## Diagnostico do catalogo da Tech10

Tenant real em producao:

- `companyId`: `4be47cf4-a20c-4da9-ac4f-fd90d917bb8f`
- `brandName`: `Tech10 Informatica e Tecnologia`
- `storefrontEnabled`: `true`
- `storeSlug`: `tech10`

Contagens apuradas no ERP:

- `totalParts`: `8`
- `activeSaleOrBoth`: `7`
- `priced`: `7`
- `catalogLinked`: `7`
- `eligible`: `7`

Interpretacao:

- a Tech10 ja tem itens ativos e com preco de venda;
- os itens vendaveis ja foram promovidos para o catalogo central;
- a vitrine publica ja tem produtos reais;
- o proximo passo agora e qualidade comercial da apresentacao.

## Amostra de itens ja publicados na vitrine

Itens com perfil comercial ja publicados:

1. `Roteador Wireless TP-Link 300Mbps`
2. `Suporte Veicular Magnetico Inova`
3. `Mouse Optico JJT Homem de Ferro`
4. `Mouse Sem Fio Magnavox 2.4GHz`
5. `Cabo de Dados Inova 2.4A`

## Proximo passo critico

O proximo passo mais importante nao e criar mais infraestrutura.

E executar uma rodada controlada no ERP para:

1. revisar categoria/taxonomia publica;
2. corrigir itens que ainda caiam em `Outros` ou sem imagem ideal;
3. validar a loja em `quote_only` com itens reais;
4. depois decidir se o checkout continua por atendimento ou evolui para pedido transacional.

## Veredito

O projeto saiu de **setup** e entrou em **operacao assistida de go-live**.

Hoje a Tech10 ja esta:

- com runtime proprio;
- com integracao canonica no ERP;
- com slug publico ativo;
- com portal e status conectados;
- com loja ja servindo catalogo real.

O que falta agora e **curadoria operacional da vitrine/catalogo**, nao nova
arquitetura.
