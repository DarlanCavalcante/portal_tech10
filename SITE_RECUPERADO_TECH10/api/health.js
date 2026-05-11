const {
  buildCapabilityModel,
  getRuntimeEnv,
} = require('./runtime-env');

async function runDeepCheck(label, targetUrl) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });

    const text = await response.text();
    clearTimeout(timeout);

    return {
      label,
      status: response.ok ? 'ok' : 'error',
      httpStatus: response.status,
      body: text.slice(0, 300),
    };
  } catch (error) {
    clearTimeout(timeout);
    return {
      label,
      status: 'error',
      message: error instanceof Error ? error.message : 'Falha no deep check',
    };
  }
}

module.exports = async function handler(req, res) {
  const env = getRuntimeEnv();
  const capabilities = buildCapabilityModel(env);
  const deep = req.query.deep === '1';
  const deepChecks = [];

  if (deep && env.healthTargets.catalog) {
    deepChecks.push(runDeepCheck('catalog', env.healthTargets.catalog));
  }

  if (
    deep &&
    env.healthTargets.checkout &&
    env.healthTargets.checkout !== env.healthTargets.catalog
  ) {
    deepChecks.push(runDeepCheck('checkout', env.healthTargets.checkout));
  }

  const upstream = deepChecks.length > 0 ? await Promise.all(deepChecks) : [];

  const checks = {
    catalogBackendConfigured: Boolean(env.catalogBackendUrl),
    checkoutBackendConfigured: capabilities.checkout,
    checkoutMode: env.checkoutMode,
    catalogSource: env.catalogSource,
    portalBaseUrlConfigured: Boolean(env.portalBaseUrl),
    statusBaseUrlConfigured: Boolean(env.statusBaseUrl),
    capabilities,
    upstream,
  };

  const criticalChecks = [
    checks.catalogBackendConfigured,
    checks.portalBaseUrlConfigured,
    checks.statusBaseUrlConfigured,
    env.checkoutMode === 'quote_only' || checks.checkoutBackendConfigured,
  ];

  const upstreamHasError = upstream.some((check) => check.status !== 'ok');
  const overallStatus = criticalChecks.every(Boolean) && !upstreamHasError ? 'ok' : 'degraded';

  res.status(overallStatus === 'ok' ? 200 : 503).json({
    status: overallStatus,
    service: 'tech10-portal',
    tenant: env.tenantId,
    mode: env.mode,
    timestamp: new Date().toISOString(),
    routes: {
      home: '/',
      store: '/loja',
      cart: '/carrinho',
      checkout: '/checkout',
      orderSuccess: '/pedido-confirmado',
      portal: '/portal',
    },
    commerce: {
      catalogSource: env.catalogSource,
      checkoutMode: env.checkoutMode,
      capabilities,
    },
    integrations: {
      catalogBackendUrl: env.catalogBackendUrl,
      checkoutBackendUrl: capabilities.checkout ? env.checkoutBackendUrl : null,
      portalBaseUrl: env.portalBaseUrl,
      statusBaseUrl: env.statusBaseUrl,
    },
    checks,
  });
};
