const {
  buildCapabilityModel,
  buildStoreTargetUrl,
  classifyStoreOperation,
  getBackendForOperation,
  getRuntimeEnv,
  splitStorePath,
} = require('./runtime-env');

function buildUpstreamHeaders(req, operation) {
  const headers = new Headers();
  const passthrough = [
    'accept',
    'accept-language',
    'content-type',
    'user-agent',
    'x-request-id',
    'x-correlation-id',
  ];

  passthrough.forEach((name) => {
    const value = req.headers[name];
    if (value) headers.set(name, value);
  });

  const bearerToken =
    operation === 'catalog'
      ? process.env.TECH10_CATALOG_BEARER_TOKEN || process.env.TECH10_STORE_BEARER_TOKEN
      : process.env.TECH10_CHECKOUT_BEARER_TOKEN || process.env.TECH10_STORE_BEARER_TOKEN;

  const apiKey =
    operation === 'catalog'
      ? process.env.TECH10_CATALOG_API_KEY || process.env.TECH10_STORE_API_KEY
      : process.env.TECH10_CHECKOUT_API_KEY || process.env.TECH10_STORE_API_KEY;

  if (bearerToken) {
    headers.set('authorization', `Bearer ${bearerToken}`);
  } else if (req.headers.authorization) {
    headers.set('authorization', req.headers.authorization);
  }

  if (apiKey) {
    headers.set('x-api-key', apiKey);
  }

  headers.set('x-tech10-runtime', 'tech10-portal');

  return headers;
}

function buildRequestBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') return undefined;
  if (typeof req.body === 'undefined' || req.body === null) return undefined;
  if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) return req.body;
  return JSON.stringify(req.body);
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const env = getRuntimeEnv();
  const capabilities = buildCapabilityModel(env);
  const pathParts = splitStorePath(req.query.path);
  const operation = classifyStoreOperation(req.method, pathParts);
  const backendUrl = getBackendForOperation(env, operation);

  if (operation === 'checkout' && env.checkoutMode === 'quote_only') {
    res.status(503).json({
      success: false,
      error: 'TECH10_CHECKOUT_DISABLED',
      message: 'O checkout está em modo quote_only. Publique o catálogo e conclua a venda por atendimento até o backend de pedidos entrar.',
      checkoutMode: env.checkoutMode,
      supportWhatsappUrl: env.supportWhatsappUrl,
    });
    return;
  }

  if (!backendUrl) {
    const error =
      operation === 'catalog'
        ? 'TECH10_CATALOG_BACKEND_NOT_CONFIGURED'
        : 'TECH10_CHECKOUT_BACKEND_NOT_CONFIGURED';

    const envKey =
      operation === 'catalog'
        ? 'TECH10_CATALOG_BACKEND_URL'
        : 'TECH10_CHECKOUT_BACKEND_URL';

    res.status(503).json({
      success: false,
      error,
      message: `Configure ${envKey} para ativar ${operation === 'catalog' ? 'o catálogo' : 'o checkout'} da Tech10.`,
      operation,
      catalogSource: env.catalogSource,
      checkoutMode: env.checkoutMode,
      capabilities,
    });
    return;
  }

  const target = buildStoreTargetUrl(backendUrl, pathParts, req.query);

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: buildUpstreamHeaders(req, operation),
      body: buildRequestBody(req),
      redirect: 'follow',
    });

    const contentType = upstream.headers.get('content-type');
    const cacheControl = upstream.headers.get('cache-control');
    const payload = await upstream.text();

    if (contentType) res.setHeader('content-type', contentType);
    if (cacheControl) res.setHeader('cache-control', cacheControl);

    res.status(upstream.status).send(payload);
  } catch (error) {
    res.status(502).json({
      success: false,
      error: 'TECH10_STORE_PROXY_ERROR',
      message: error instanceof Error ? error.message : 'Falha ao conectar no backend da loja',
      backendUrl,
      operation,
    });
  }
};
