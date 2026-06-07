# Execução Tech10 - 2026-05-29

> Nota de continuidade em `2026-06-06`:
> os links `site-recuperado-tech-10*` abaixo eram os aliases usados naquele
> momento historico. O projeto Vercel `site-recuperado-tech-10` foi aposentado
> em `2026-06-06`. A origem canonica atual da Tech10 e `tech10-portal`.

## Resumo

Este ciclo fechou o refinamento visual e comercial do site institucional da Tech10, publicou um deploy limpo no projeto Vercel acessível nesta conta e confirmou os bloqueios externos que ainda impedem o fechamento total da presença pública.

## O que foi aplicado

- Home com `Categorias em Destaque` refinada:
  - agrupamento `Especialidades` e `Loja & apoio`
  - tabs no mobile
  - cards mais compactos
  - ícones discretos nas tabs
  - redução de altura e descrição dos cards em telas menores
- Página `/desenvolvimento-de-sistemas-santa-maria` reposicionada com foco em:
  - sites e landing pages
  - sistemas web
  - automação com WhatsApp, CRM e IA
  - integrações e APIs
  - e-commerce e catálogo
  - suporte mensal, cloud e evolução
- Horário institucional atualizado no código:
  - segunda a sexta `9h às 12h e 13h às 18h`
  - sábado `9h às 13h`
  - domingo `fechado`
- `sitemap.xml` pronto
- `robots.txt` pronto
- arquivo de verificação do Search Console publicado na base:
  - `googleb0bfbd0d7ab63e65.html`

## Deploy executado

- Preview:
  - `https://site-recuperado-tech-10-88ap4h8fs-darlancavalcantes-projects.vercel.app`
  - status atual: alias historico / aposentado
- Produção do projeto acessível nesta conta:
  - `https://site-recuperado-tech-10.vercel.app`
  - status atual: projeto removido em `2026-06-06`

## Validação do horário

No alias novo do projeto naquele momento, o HTML já respondia com o horário
certo:

- `Segunda a Sexta: 9h às 12h e 13h às 18h`
- `Sábado: 9h às 13h`

No domínio oficial atual, o HTML público ainda responde com o horário antigo:

- `Segunda a Sexta: 8h às 18h`
- `Sábado: 9h às 17h`

## Bloqueio atual de produção

O domínio oficial `https://tech10.loja.tech10cloud.com/` ainda está apontando para outra configuração/projeto Vercel fora do escopo acessível nesta conta.

Sinais confirmados naquele momento:

- o domínio oficial retorna HTML antigo
- o alias novo retorna HTML atualizado
- a tentativa de inspecionar ou gerenciar o domínio pelo Vercel desta conta não tem permissão para `tech10.loja.tech10cloud.com`

### Consequência

O deploy limpo foi concluído, mas a publicação real no domínio oficial depende de quem controla o vínculo do domínio no Vercel.

## Instagram

Foi confirmado na interface web:

- a bio pública está refinada e com horário correto
- o campo `Site` ainda está preenchido com `wa.me/5555974001960`
- o campo de link aparece desabilitado no desktop/web

### Consequência

A troca do link principal para `https://tech10.loja.tech10cloud.com/` ainda depende do app móvel do Instagram ou de um fluxo móvel que a Meta aceite.

## Facebook

Foi confirmado:

- a Página `Tech10 Informática` existe
- a Página está visível dentro do ecossistema da Meta Business Suite
- a home do Business Suite da Página abre com `Tech10 Informática, tech10info`

### Bloqueio

Nesta sessão, a Meta não expôs de forma confiável um editor público dos campos de:

- telefone
- horário
- endereço
- site
- descrição curta

Também não ficou disponível uma troca estável para a Página como perfil público editável dentro do Facebook web.

## Search Console

Foi confirmado:

- a verificação por arquivo falha no domínio oficial
- motivo exibido pelo Google:
  - `Seu arquivo de verificação não foi encontrado no local obrigatório`

### Consequência

O Search Console só fecha quando o domínio oficial passar a servir:

- o arquivo `googleb0bfbd0d7ab63e65.html`

ou quando for usado outro método viável na infraestrutura que realmente atende `tech10.loja.tech10cloud.com`.

## Próximos passos obrigatórios

1. Reapontar ou religar `tech10.loja.tech10cloud.com` para o projeto Vercel correto.
   Estado posterior confirmado em `2026-06-06`: o projeto correto e `tech10-portal`.
2. Depois disso, validar o domínio oficial e concluir o `Search Console`.
3. No app móvel do Instagram, trocar o link principal da bio para o site oficial.
4. No Facebook/Meta, concluir a edição pública da Página com telefone, horário, endereço, site e descrição.
