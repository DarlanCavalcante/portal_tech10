const DEFAULT_PORTAL_BASE_URL = 'https://sistema.tech10cloud.com/portal';
const DEFAULT_STATUS_BASE_URL = 'https://sistema.tech10cloud.com/status';

module.exports = function handler(req, res) {
  const storeBackendUrl = process.env.TECH10_STORE_BACKEND_URL || process.env.STORE_BACKEND_URL || '';
  res.status(200).json({
    tenantId: 'tech10',
    siteName: 'Tech10 Informática',
    mode: 'standalone',
    routes: {
      home: '/',
      store: '/loja',
      cart: '/carrinho',
      checkout: '/checkout',
      orderSuccess: '/pedido-confirmado',
      portal: '/portal',
    },
    integrations: {
      portalBaseUrl: (process.env.TECH10_ERP_PORTAL_BASE_URL || DEFAULT_PORTAL_BASE_URL).replace(/\/$/, ''),
      statusBaseUrl: (process.env.TECH10_ERP_STATUS_BASE_URL || DEFAULT_STATUS_BASE_URL).replace(/\/$/, ''),
      storeBackendUrl: storeBackendUrl ? storeBackendUrl.replace(/\/$/, '') : null,
      storeBackendConfigured: Boolean(storeBackendUrl),
    },
    support: {
      whatsapp: '55974001960',
      email: 'tech10.infor@gmail.com',
    },
  });
};
