# Vercel Smoke Deploy CI/CD

ℹ️ **Atalho rápido**: *Para inicialização e deploy de smoke environments em menos de 2 minutos, confira o nosso [SMOKE_CHECKLIST_2MIN.md](./SMOKE_CHECKLIST_2MIN.md)*.

Este arquivo contém a documentação detalhada sobre nossa estratégia de deploy de projetos experimentais/smoke usando Vercel e GitHub Actions.

## Abordagem do Smoke Environment

A criação de um "Smoke Environment" permite avaliar alterações na aplicação de forma isolada do ambiente de Produção e Homologação.
Durante o deploy, fazemos as seguintes injeções de variáveis via Vercel e chamadas de CI/CD:

1. **Tokens Requeridos**
   - \`VERCEL_TOKEN\`: Token de API da conta Vercel (gerado na sua conta "Settings > Tokens").
   - \`VERCEL_ORG_ID\`: ID da organização no Vercel.
   - \`VERCEL_PROJECT_ID\`: ID do projeto *separado* para o smoke test.

2. **Isolamento Completo**
   Utilizando um outro *Project ID* no Vercel (distinto da produção), garantimos que todos os webhooks ou integrações automáticas fiquem isoladas, além do banco de dados estar abstraído para ambiente "dev" ou "sandbox".

Para realizar o deploy e configurar tudo de maneira automatizada e evitar configuração na mão confira o nosso *[Checklist de 2 minutos](./SMOKE_CHECKLIST_2MIN.md)*.
