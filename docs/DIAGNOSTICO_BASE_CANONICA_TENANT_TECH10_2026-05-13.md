# Diagnóstico da Base Canônica do Tenant Tech10

Data-base: `2026-05-13`

## Conclusão

A base canônica da produção pública de:

- `https://tech10.loja.tech10cloud.com/`

é:

- `portal_tech10/SITE_RECUPERADO_TECH10`

## Evidências

- o runtime local possui `.vercel/project.json` apontando para o projeto `tech10-portal`;
- o `vercel.json` canônico reescreve:
  - `/loja`
  - `/portal`
  - `/status`
- o HTML publicado em produção bate com os fingerprints de `SITE_RECUPERADO_TECH10/index.html`;
- a produção responde com `server: Vercel`.

## Projeto que não deve mais ser tratado como base de produção

O repositório:

- `tech10-informatica`

não é a base publicada atual do tenant.

Ele pode servir como:

- laboratório de identidade;
- origem de assets aprovados;
- referência histórica.

Mas não deve ser tratado como fonte primária de mudança para a produção atual da Tech10.

## Logo oficial aplicada na base canônica

Asset canônico atual:

- `SITE_RECUPERADO_TECH10/imagem/logo/tech10-logo-principal-pulso-hibrido.svg`

Esse asset foi promovido a partir da identidade aprovada e passou a ser a referência principal da marca nas superfícies:

- home
- loja
- carrinho
- portal
- componentes de rota/tenant
