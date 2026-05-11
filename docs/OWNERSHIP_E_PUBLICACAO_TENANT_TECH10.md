# Ownership e Publicação do Tenant Tech10

Data de referência: `2026-05-11`

## Resumo executivo

Por decisão operacional registrada nesta rodada, o `portal_tech10` deve seguir
como projeto independente.

Isso significa:

- não tratar `VIVACOMMERCE` como runtime oficial deste projeto;
- não manter domínio da Tech10 anexado ao projeto `vivacommerce`;
- usar referências externas apenas como contexto histórico ou legado técnico.

## 1. portal_tech10

Repositório: `DarlanCavalcante/portal_tech10`

Papel atual:

- working copy principal da Tech10;
- snapshot funcional de site, catálogo, carrinho, checkout e admin;
- base prioritária para saneamento, documentação e publicação futura.

Leitura honesta:

é a base mais segura para continuar este trabalho sem misturar projetos.

## 2. tech10-informatica

Repositório: `DarlanCavalcante/tech10-informatica`

Papel atual:

- pacote estático adjacente da Tech10;
- alternativa real de publicação;
- precisa ser comparado com o `portal_tech10` antes de qualquer decisão final.

## 3. Referências externas

Existem artefatos históricos com nomenclaturas e adapters ligados a
`VIVACOMMERCE`, incluindo:

- `api-config.js`
- `api-adapter.js`
- `cart-vivacommerce.js`
- slugs como `revivah-tech`

Esses pontos devem ser lidos como:

- legado técnico;
- possível reaproveitamento antigo;
- contexto útil para auditoria;
- nunca como canonicidade automática de publicação.

## 4. Decisão aplicada nesta rodada

Nesta rodada, o vínculo operacional criado por hipótese foi desfeito:

- o alias `tech10.tech10cloud.com` foi removido do projeto Vercel `vivacommerce`;
- o `portal_tech10` voltou a ficar sem vínculo formal de domínio com esse projeto;
- a documentação foi ajustada para refletir essa separação.

## 5. Conclusão de ownership

Hoje, a leitura operacional correta fica assim:

- **base principal de trabalho:** `portal_tech10`
- **base adjacente a comparar:** `tech10-informatica`
- **referências externas:** apenas históricas, sem vínculo ativo de produção

## 6. Próximo passo recomendado

O próximo passo crítico é declarar a base única de publicação:

1. decidir entre `portal_tech10` e `tech10-informatica`;
2. criar projeto próprio da Tech10 para deploy;
3. só depois apontar `tech10.tech10cloud.com` para esse projeto próprio.
