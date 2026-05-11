function getBackendUrl() {
  const value = (
    process.env.TECH10_STORE_BACKEND_URL ||
    process.env.STORE_BACKEND_URL ||
    ''
  );

  return value ? value.replace(/\/$/, '') : '';
}

function buildTargetUrl(req) {
  const rawPath = req.query.path;
  const pathParts = Array.isArray(rawPath)
    ? rawPath
    : typeof rawPath === 'string' && rawPath.length > 0
      ? rawPath.split('/').filter(Boolean)
      : [];

  const suffix = pathParts.length ? `/${pathParts.map(encodeURIComponent).join('/')}` : '';
  const target = new URL(`${getBackendUrl()}/api/store${suffix}`);

  Object.entries(req.query || {}).forEach(([key, value]) => {
    if (key === 'path' || typeof value === 'undefined') return;

    if (Array.isArray(value)) {
      value.forEach((item) => target.searchParams.append(key, String(item)));
      return;
    }

    target.searchParams.append(key, String(value));
  });

  return target;
}

function buildUpstreamHeaders(req) {
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

  if (process.env.TECH10_STORE_BEARER_TOKEN) {
    headers.set('authorization', `Bearer ${process.env.TECH10_STORE_BEARER_TOKEN}`);
  } else if (req.headers.authorization) {
    headers.set('authorization', req.headers.authorization);
  }

  if (process.env.TECH10_STORE_API_KEY) {
    headers.set('x-api-key', process.env.TECH10_STORE_API_KEY);
  }

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

  const backendUrl = getBackendUrl();
  if (!backendUrl) {
    res.status(503).json({
      success: false,
      error: 'TECH10_STORE_BACKEND_URL_NOT_CONFIGURED',
      message: 'Configure TECH10_STORE_BACKEND_URL para ativar o catálogo e o carrinho da Tech10.',
    });
    return;
  }

  const target = buildTargetUrl(req);

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: buildUpstreamHeaders(req),
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
    });
  }
};
