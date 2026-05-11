# Contribuição

Este repositório contém material legado e uma base canônica nova em
`SITE_RECUPERADO_TECH10/`. Para reduzir risco operacional:

1. trate `SITE_RECUPERADO_TECH10/` como a base de runtime do tenant
2. documente qualquer mudança estrutural em `docs/`
3. não reintroduza vínculos operacionais com projetos externos sem ADR explícita
4. valide com:
   - `node SITE_RECUPERADO_TECH10/scripts/validate-runtime-contract.mjs`
   - `node SITE_RECUPERADO_TECH10/scripts/smoke-runtime.mjs`

Mudanças grandes devem preservar:

- rotas canônicas `/`, `/loja`, `/carrinho`, `/checkout`, `/pedido-confirmado`, `/portal`
- contrato de ambiente de `SITE_RECUPERADO_TECH10/.env.example`
- documentação canônica listada em `docs/README.md`
