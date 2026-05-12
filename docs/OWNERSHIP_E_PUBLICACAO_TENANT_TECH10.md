# Ownership e Publicação do Tenant Tech10

Data de referência: `2026-05-11`

## Resumo executivo

O ownership correto da Tech10 fica assim:

- repositório canônico desta frente: `DarlanCavalcante/portal_tech10`
- diretório canônico de deploy: `SITE_RECUPERADO_TECH10/`
- domínio alvo recomendado: `tech10.tech10cloud.com`

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

1. criar projeto dedicado da Tech10
2. usar `SITE_RECUPERADO_TECH10/` como root directory
3. anexar `tech10.tech10cloud.com`
4. publicar sem qualquer alias ou dependência operacional externa

## Veredito

O ownership está fechado:

- **código e runtime da Tech10:** `portal_tech10`
- **domínio final recomendado:** `tech10.tech10cloud.com`
- **integração com ERP:** contrato explícito via `/portal` e `/status`
