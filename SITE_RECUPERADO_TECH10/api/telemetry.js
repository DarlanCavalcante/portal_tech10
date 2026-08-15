/*
 * Coletor de telemetria do funil (Frente 1) — same-origin.
 *
 * Recebe os eventos do js/telemetry.js (via sendBeacon/fetch) e, se configurado,
 * encaminha para o ERP. Inerte por padrão: sem TECH10_ERP_TELEMETRY_URL, apenas
 * responde 204 (não guarda nada, não erra). Nunca bloqueia o cliente.
 *
 * Env:
 *   TECH10_ERP_TELEMETRY_URL   endpoint do ERP que recebe os eventos (opcional)
 *   TECH10_ERP_TELEMETRY_TOKEN bearer para autenticar no ERP (opcional)
 */

function readBody(req) {
  // Vercel Node runtime normalmente já entrega req.body parseado para JSON.
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  if (typeof req.body === 'string') {
    try { return Promise.resolve(JSON.parse(req.body)); } catch (_e) { return Promise.resolve(null); }
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; if (raw.length > 1e5) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(raw)); } catch (_e) { resolve(null); } });
    req.on('error', () => resolve(null));
  });
}

module.exports = async function handler(req, res) {
  // Aceita apenas POST; qualquer outra coisa é no-op silencioso.
  if (req.method !== 'POST') {
    res.statusCode = 204;
    return res.end();
  }

  const endpoint = (process.env.TECH10_ERP_TELEMETRY_URL || '').trim();
  const logMode = /^(1|true|on|yes)$/i.test(String(process.env.TECH10_TELEMETRY_LOG || '').trim());

  // Responder cedo mantém o beacon rápido; o forward é best-effort.
  let event = null;
  try { event = await readBody(req); } catch (_e) { event = null; }

  // Modo de log (ativação MVP): imprime o evento nos logs da função (Vercel),
  // visível via `vercel logs`. Uma linha compacta por evento do funil.
  if (logMode && event) {
    try {
      const c = event.context || {};
      console.log('[telemetry] ' + JSON.stringify({
        event: event.event,
        stage: c.stage,
        path: c.path,
        session: event.sessionId,
        at: event.occurredAt,
        props: event.props || {}
      }));
    } catch (_e) { /* nunca impacta o cliente */ }
  }

  if (endpoint && event) {
    try {
      const headers = { 'content-type': 'application/json' };
      const token = (process.env.TECH10_ERP_TELEMETRY_TOKEN || '').trim();
      if (token) headers.authorization = `Bearer ${token}`;
      headers['x-tenant-id'] = String((event.context && event.context.tenantId) || 'tech10');

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(event),
        signal: controller.signal,
      }).catch(() => {});
      clearTimeout(timeout);
    } catch (_e) {
      // Telemetria nunca deve impactar o cliente.
    }
  }

  res.statusCode = 204;
  return res.end();
};
