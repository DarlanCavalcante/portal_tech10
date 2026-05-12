const { buildCapabilityModel, getRuntimeEnv } = require('./runtime-env');

module.exports = function handler(req, res) {
  const env = getRuntimeEnv();
  const capabilities = buildCapabilityModel(env);

  res.status(200).json({
    tenantId: env.tenantId,
    siteName: env.siteName,
    mode: env.mode,
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
      portalBaseUrl: env.portalBaseUrl,
      statusBaseUrl: env.statusBaseUrl,
      catalogBackendUrl: env.catalogBackendUrl || null,
      checkoutBackendUrl: capabilities.checkout ? env.checkoutBackendUrl : null,
      storeBackendUrl: env.catalogBackendUrl || null,
      storeBackendConfigured: capabilities.browseCatalog,
    },
    support: {
      whatsapp: env.supportWhatsapp,
      whatsappUrl: env.supportWhatsappUrl,
      email: 'tech10.infor@gmail.com',
    },
  });
};
