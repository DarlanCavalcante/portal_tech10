# Operacao Canonica GitHub Gratis + Vercel do Tenant Tech10

Data de referencia: `2026-05-13`

## Resumo executivo

O fluxo canonico de publicacao da Tech10 ficou assim:

- origem de codigo: `GitHub`, no repositorio `DarlanCavalcante/portal_tech10`
- branch de publicacao: `main`
- projeto de deploy: `Vercel`, no projeto `tech10-portal`
- root directory obrigatorio: `SITE_RECUPERADO_TECH10`
- dominio publico canonico: `https://tech10.loja.tech10cloud.com`

Esse fluxo **nao depende de GitHub Actions pagos**.

O GitHub passa a ser apenas:

- repositorio canonico do codigo
- origem de branch e PR
- gatilho de auto deploy da Vercel

## O que e canonico

### Codigo

- repositorio canonico: `https://github.com/DarlanCavalcante/portal_tech10`
- base publicada: `SITE_RECUPERADO_TECH10/`

### Publicacao

- projeto Vercel: `tech10-portal`
- conta/time Vercel: `darlancavalcantes-projects`
- alias publico ativo:
  - `https://tech10.loja.tech10cloud.com`

### Fluxo oficial

1. editar codigo no repositorio `portal_tech10`
2. abrir PR
3. mergear na `main`
4. deixar a Vercel usar esse repositorio como origem canonica do build
5. validar smoke em:
   - `/`
   - `/loja`
   - `/carrinho`
   - `/portal`

## O que nao e mais canonico

- depender de `GitHub Actions` para publicar
- publicar a raiz `./` do repositorio na Vercel
- usar o projeto arquivado `tech10-informatica-2026-05-13` como base de producao
- tratar a CLI manual como caminho principal de release

## Incidente que esta documentacao evita

Ao reconectar o GitHub na Vercel, o projeto `tech10-portal` estava com `Root Directory = ./`.

Isso fez a Vercel publicar a raiz do repositorio, que expunha uma experiencia diferente da loja publicada. O sintoma objetivo foi:

- home com a interface escura `Assistencia Tecnica Premium em Tecnologia`
- rota `/loja` devolvendo `404`

O ajuste correto foi:

- manter o repositorio `DarlanCavalcante/portal_tech10` como origem do codigo
- corrigir o `Root Directory` da Vercel para `SITE_RECUPERADO_TECH10`

## Configuracao obrigatoria da Vercel

No projeto `tech10-portal`, a configuracao correta e:

- `Connected Git Repository`: `DarlanCavalcante/portal_tech10`
- `Production Branch`: `main`
- `Root Directory`: `SITE_RECUPERADO_TECH10`

Se qualquer um desses pontos divergir, a publicacao deixa de ser canonica.

## Processo operacional recomendado

### Caminho principal

1. trabalhar em branch
2. abrir PR
3. mergear na `main`
4. validar se a Vercel reagiu ao merge
5. se o deploy nao nascer sozinho, publicar manualmente a partir do mesmo repositorio
6. validar o deploy publicado

### Fallback manual

O deploy manual por CLI e o fallback oficial quando:

- a Vercel nao reagir sozinha ao merge
- a integracao Git estiver indisponivel
- for necessario validar uma correcao urgente fora do ciclo normal

Mesmo nesse caso, o deploy manual deve respeitar a mesma base:

- repositorio: `portal_tech10`
- root de deploy: `SITE_RECUPERADO_TECH10`

O comando validado nesta rodada foi disparado do **repo root** ja ligado ao
projeto correto:

```bash
cd /Users/darlancavalcante/Documents/TECH/portal_tech10
vercel deploy --prod --yes --scope darlancavalcantes-projects
```

Importante:

- nao disparar esse deploy de dentro de `SITE_RECUPERADO_TECH10/`
- com `Root Directory = SITE_RECUPERADO_TECH10`, rodar de dentro da subpasta
  duplica o caminho e falha

## Evidencias objetivas deste fechamento

- PR `#114`: logo canonica mergeada na `main`
- PR `#115`: entrada visivel de `Minha selecao` mergeada na `main`
- projeto Vercel reconectado ao GitHub
- root directory corrigido de `./` para `SITE_RECUPERADO_TECH10`
- PRs `#116`, `#117` e `#118`: usadas para revalidar governanca e gatilho
- deploy de contingencia validado com sucesso: `dpl_4dVf8xYZukSTxUgcFSJGSnrKb8sb`

## Checklist rapido

Antes de considerar o tenant saudavel:

1. confirmar que o projeto Vercel ainda aponta para `DarlanCavalcante/portal_tech10`
2. confirmar que o `Root Directory` segue `SITE_RECUPERADO_TECH10`
3. confirmar que `https://tech10.loja.tech10cloud.com/loja` abre sem `404`
4. confirmar que `Minha selecao` aparece na home e na loja
5. confirmar que a selecao leva a `/carrinho`

## Veredito

O modelo profissional recomendado para a Tech10 agora e:

- `GitHub gratis` como origem de codigo
- `Vercel` como plataforma de build e publicacao
- `GitHub Actions` fora do caminho critico
- `SITE_RECUPERADO_TECH10` como unica raiz valida de publicacao
- `CLI manual` como fallback documentado e validado quando o webhook da Vercel
  nao reagir ao merge
