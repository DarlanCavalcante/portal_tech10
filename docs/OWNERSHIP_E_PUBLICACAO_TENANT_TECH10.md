# Ownership e Publicação do Tenant Tech10

Data de referência: `2026-05-11`

## Resumo executivo

O ownership correto da Tech10 fica assim:

- repositório canônico desta frente: `DarlanCavalcante/portal_tech10`
- diretório canônico de deploy: `SITE_RECUPERADO_TECH10/`
- domínio público canônico: `tech10.loja.tech10cloud.com`

## O que não faz parte do runtime canônico

- `VIVACOMMERCE`
- `vivacommerce`
- `redevivah.com.br`
- `redevivah-storefront`

Esses artefatos só podem ser tratados como:

- referência histórica
- contexto de auditoria
- fonte eventual de comparação

Nunca como canonicidade automática de publicação.

## Estado aplicado

- o alias `tech10.tech10cloud.com` já foi removido do projeto externo `vivacommerce`
- a publicação correta agora deve sair de projeto próprio da Tech10
- o runtime standalone já foi preparado dentro do próprio `portal_tech10`

## Publicação correta

1. usar o projeto dedicado `tech10-portal`
2. conectar o GitHub `DarlanCavalcante/portal_tech10`
3. usar `SITE_RECUPERADO_TECH10/` como root directory
4. manter `main` como branch de produção
5. anexar e preservar `tech10.loja.tech10cloud.com`
6. publicar sem depender de GitHub Actions pagos

## Veredito

O ownership está fechado:

- **código e runtime da Tech10:** `portal_tech10`
- **domínio final canônico:** `tech10.loja.tech10cloud.com`
- **integração com ERP:** contrato explícito via `/portal` e `/status`
