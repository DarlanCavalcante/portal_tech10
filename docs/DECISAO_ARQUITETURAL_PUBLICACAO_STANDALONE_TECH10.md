# Decisão Arquitetural de Publicação Standalone da Tech10

Data-base: `2026-05-11`

## Decisão

A Tech10 deve ser publicada em projeto próprio, sem depender operacionalmente de
`vivacommerce` ou outro runtime externo não autorizado.

## Por quê

- o usuário confirmou que `vivacommerce` é outro projeto;
- misturar runtime externo com o tenant Tech10 aumenta risco de publicação errada;
- o `portal_tech10` já tem massa crítica suficiente para virar projeto próprio;
- a forma profissional é integrar por contrato explícito, não por acoplamento implícito.

## Forma correta de resolver

### Fase 1. Canonicalizar a base

Escolher uma base única entre:

- `portal_tech10`
- `tech10-informatica`

Recomendação atual:

- usar `portal_tech10` como base principal;
- tratar `tech10-informatica` como referência adjacente para comparação e eventual
  migração de assets.

### Fase 2. Criar runtime próprio da Tech10

Em vez de depender de projeto externo, criar um projeto de deploy próprio da
Tech10, por exemplo:

- nome de projeto Vercel: `tech10-portal`
- domínio alvo: `tech10.tech10cloud.com`

### Fase 3. Manter integração explícita

Separar claramente:

- site institucional;
- camada de loja;
- entrada do portal/O.S.;
- adapters de API.

Se houver backend de loja, ele deve ser plugável por configuração, nunca imposto
por vínculo indireto de domínio.

## Recomendação técnica prática

### Curto prazo

Publicar o `SITE_RECUPERADO_TECH10/` como base da Tech10 em projeto próprio.

### Médio prazo

Evoluir para um runtime mais limpo e escalável com:

- `tenant-config.js` como fonte única de branding e rotas;
- adapters bem definidos para catálogo/carrinho/checkout;
- `/portal` apontando por contrato para o ERP;
- remoção progressiva dos hardcodes restantes.

## Veredito

Não precisamos criar um runtime totalmente novo antes de publicar.

O caminho mais profissional agora é:

1. usar o que já está pronto no `portal_tech10`;
2. publicar em projeto próprio;
3. extrair a arquitetura escalável por tenant em seguida.
