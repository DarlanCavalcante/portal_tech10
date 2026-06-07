# Runbook - Validation

## Checklist tecnico minimo

- [ ] rodar `npm run validate:runtime`
- [ ] subir `vercel dev --listen 127.0.0.1:4112`
- [ ] rodar `SMOKE_BASE_URL=http://127.0.0.1:4112 npm run smoke:runtime`
- [ ] confirmar `200` em `/checkout`
- [ ] confirmar `200` em `/api/runtime-config`
- [ ] confirmar `/api/health` em `degraded` quando nao houver backend configurado

## Checklist visual do checkout

- [ ] abrir `http://127.0.0.1:4112/checkout`
- [ ] confirmar que a pagina nao fica branca
- [ ] confirmar que o texto `Fechamento assistido` aparece
- [ ] confirmar que existe CTA `Falar com a Tech10`
- [ ] confirmar que o CTA aponta para `https://wa.me/...?...text=...`
- [ ] confirmar ausencia de `whatsapp://send` como CTA principal
- [ ] confirmar console sem erro critico
- [ ] confirmar layout basico intacto

## Checklist funcional do fluxo oficial

- [ ] tratar `WhatsApp Web` como fluxo oficial
- [ ] confirmar mensagem pre-preenchida em formato de draft seguro
- [ ] confirmar revisao manual antes de qualquer envio
- [ ] nao promover app desktop como fluxo oficial

## Regras de seguranca da validacao

- nao enviar mensagem real durante a validacao sem autorizacao explicita
- nao usar o app desktop do WhatsApp como criterio de aceite
- nao reativar `whatsapp://send`
- nao alterar producao durante esta rotina

## Leitura esperada nesta retomada

- checkout abriu em `http://127.0.0.1:4112/checkout`
- o CTA observado no navegador apontou para `wa.me` com `text=`
- nenhuma ocorrencia de `whatsapp://` foi observada no checkout validado
