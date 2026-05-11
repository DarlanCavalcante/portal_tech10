const DEFAULT_PORTAL_BASE_URL = 'https://sistema.tech10cloud.com/portal';
const DEFAULT_STATUS_BASE_URL = 'https://sistema.tech10cloud.com/status';

function getEnv() {
  const storeBackendUrl = process.env.TECH10_STORE_BACKEND_URL || process.env.STORE_BACKEND_URL || '';
  return {
    storeBackendUrl: storeBackendUrl ? storeBackendUrl.replace(/\/$/, '') : '',
    portalBaseUrl: (process.env.TECH10_ERP_PORTAL_BASE_URL || DEFAULT_PORTAL_BASE_URL).replace(/\/$/, ''),
    statusBaseUrl: (process.env.TECH10_ERP_STATUS_BASE_URL || DEFAULT_STATUS_BASE_URL).replace(/\/$/, ''),
  };
}

async function runDeepCheck(storeBackendUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${storeBackendUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });

    const text = await response.text();
    clearTimeout(timeout);

    return {
      status: response.ok ? 'ok' : 'error',
      httpStatus: response.status,
      body: text.slice(0, 300),
    };
  } catch (error) {
    clearTimeout(timeout);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Falha no deep check',
    };
  }
}

module.exports = async function handler(req, res) {
  const env = getEnv();
  const deep = req.query.deep === '1';
  const upstream = deep && env.storeBackendUrl ? await runDeepCheck(env.storeBackendUrl) : null;

  const checks = {
    storeProxyConfigured: Boolean(env.storeBackendUrl),
    portalBaseUrlConfigured: Boolean(env.portalBaseUrl),
    statusBaseUrlConfigured: Boolean(env.statusBaseUrl),
    upstream,
  };

  const overallStatus =
    !checks.storeProxyConfigured ? 'degraded'
      : upstream && upstream.status !== 'ok' ? 'degraded'
      : 'ok';

  res.status(overallStatus === 'ok' ? 200 : 503).json({
    status: overallStatus,
    service: 'tech10-portal',
    tenant: 'tech10',
    mode: 'standalone',
    timestamp: new Date().toISOString(),
    routes: {
      home: '/',
      store: '/loja',
      cart: '/carrinho',
      checkout: '/checkout',
      orderSuccess: '/pedido-confirmado',
      portal: '/portal',
    },
    integrations: {
      storeBackendUrl: env.storeBackendUrl,
      portalBaseUrl: env.portalBaseUrl,
      statusBaseUrl: env.statusBaseUrl,
    },
    checks,
  });
};
