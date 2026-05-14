# Protocolo de Release Enxuto do Tenant Tech10

Data de referencia: `2026-05-13`

## Objetivo

Preservar a cota diaria da Vercel Hobby e manter a producao estavel sem perder
ritmo de entrega.

## Regra principal

**Nem todo merge justifica deploy.**

O time deve separar:

- o que pode entrar em `main` sem pressa de publicar
- o que realmente merece gastar uma janela de release

## O que pode mergear sem publicar imediatamente

- documentacao
- copy pequena
- ajuste visual fino sem impacto operacional
- refino editorial
- limpeza interna de codigo
- preparacao tecnica de uma frente ainda nao concluida

## O que justifica deploy em producao

- correcao de bug real visto em producao
- rota quebrada
- regressao de UX com impacto no cliente
- ganho funcional fechado
- melhoria operacional relevante
- alteracao comercial visivel que muda conversao ou navegacao

## O que nao deve consumir deploy sozinho

- trocar uma palavra
- microajuste de espacamento
- mudar ordem de um bloco sem impacto real
- documentacao isolada
- experimento visual ainda em avaliacao

## Politica de empacotamento

### Pacote ideal

Um release deve subir quando reunir pelo menos um destes cenarios:

1. uma correcao critica
2. um ganho funcional completo
3. um conjunto pequeno e coerente de melhorias relacionadas

### Pacote ruim

Nao subir:

- um deploy por detalhe
- um deploy por PR pequena
- um deploy so porque a branch foi mergeada

## Fluxo recomendado

1. desenvolver em branch
2. abrir PR limpa
3. mergear na `main`
4. decidir se o pacote:
   - fica acumulado para a proxima janela
   - ou sobe agora
5. se subir:
   - checar comentario do `vercel[bot]`
   - validar a cota
   - publicar
6. rodar smoke minimo

## Gate de publicacao

Antes de publicar, responder:

1. isso corrige algo que o cliente sente?
2. isso reduz atrito real de operacao?
3. isso fecha um pacote coerente?
4. isso vale gastar uma tentativa da Vercel hoje?

Se a maioria for `nao`, segurar.

## Cadencia recomendada

- `preview/local`: livre para testar
- `main`: pode receber documentacao e preparacoes tecnicas
- `producao`: apenas quando houver pacote maduro

Regra pratica:

- no maximo `1 release forte por janela`
- release extra so para bug critico

## Ordem de prioridade para gastar deploy

1. indisponibilidade ou rota quebrada
2. erro funcional real
3. problema de navegacao/comercio
4. melhoria operacional grande
5. polish visual
6. documentacao

## Quando segurar sem culpa

Segurar e a decisao correta quando:

- o ganho ainda esta incompleto
- a melhoria e so editorial
- a Vercel ja sinalizou limite diario
- o pacote ainda nao fecha uma historia clara

## Fallback oficial

Se a Vercel nao publicar automaticamente e nao houver bloqueio de cota:

```bash
cd /Users/darlancavalcante/Documents/TECH/portal_tech10
vercel deploy --prod --yes --scope darlancavalcantes-projects
```

Se a PR receber `api-deployments-free-per-day`, parar. O problema nao e do GitHub
nem do repositório; e a cota diaria da Vercel.

## Veredito

O modelo operacional certo para a Tech10 agora e:

- `GitHub Free` para codigo
- `Vercel` para publicacao
- `deploy em lote`, nao por impulso
- `producao` como janela valiosa, nao como reflexo de todo merge
