# ADR-001: Runtime Standalone da Tech10

Data: `2026-05-11`

## Status

Aceito

## Contexto

O tenant Tech10 possuía material rico em `portal_tech10`, mas havia risco de
mistura operacional com runtimes externos e nomenclaturas legadas.

## Decisão

Adotar `SITE_RECUPERADO_TECH10/` como runtime standalone canônico da Tech10,
com:

- rotas públicas limpas
- proxy same-origin para catálogo
- bridge explícita para portal/status do ERP

## Consequências

### Positivas

- ownership claro
- escalabilidade melhor por tenant
- deploy profissional e reproduzível
- menor risco de misturar domínios/projetos errados

### Custos

- manutenção temporária de nomes legados
- necessidade de configurar explicitamente o backend da loja
- necessidade de smoke operacional disciplinado
