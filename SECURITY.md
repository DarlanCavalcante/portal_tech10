# Segurança

## Escopo

O runtime público da Tech10 fica em `SITE_RECUPERADO_TECH10/`.

## Regras mínimas

- não expor tokens no frontend
- preferir integração server-to-server via `/api/store/*`
- tratar `TECH10_STORE_BEARER_TOKEN` e `TECH10_STORE_API_KEY` como segredos de deploy
- revisar qualquer mudança em `vercel.json`, `api/*.js` e rotas públicas com atenção redobrada

## Reporte

Problemas de segurança devem ser registrados internamente antes de qualquer
divulgação pública, com contexto mínimo:

- rota afetada
- impacto
- cenário de reprodução
- commit/branch relacionado
