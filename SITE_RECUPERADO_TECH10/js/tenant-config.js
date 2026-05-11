/**
 * tenant-config.js
 *
 * Fonte única inicial de configuração do tenant Tech10.
 * Esta camada existe para reduzir hardcodes espalhados e preparar
 * a evolução para múltiplos tenants sem alterar o comportamento atual.
 */
(function (global) {
  'use strict';

  const origin = typeof window !== 'undefined' && window.location && window.location.origin
    ? window.location.origin
    : 'http://localhost:3101';

  const config = {
    tenant: {
      id: 'tech10',
      slug: 'revivah-tech',
      publicDomain: 'tech10.tech10cloud.com',
      publicOrigin: 'https://tech10.tech10cloud.com',
      canonicalEntryUrl: 'https://tech10.tech10cloud.com',
      canonicalStoreUrl: 'https://tech10.tech10cloud.com/loja',
      canonicalPortalUrl: 'https://tech10.tech10cloud.com/portal',
      publicSiteBasePath: '/tech10',
      storefrontPath: '/lojas/revivah-tech/shop',
      categoryShopBasePath: '/shop?store=revivah-tech',
      cartPath: '/tech10/carrinho.html',
      checkoutPath: '/tech10/checkout.html',
      orderSuccessPath: '/tech10/pedido-confirmado.html',
      runtimeSiteEntryPath: '/tech10',
      runtimeStoreEntryPath: '/lojas/revivah-tech/shop',
    },
    company: {
      name: 'Tech10 Informática',
      slogan: '20 Anos de Experiência em Tecnologia',
      description: 'Especialistas em equipamentos Apple, Samsung e desenvolvimento Full Stack há 20 anos.',
      email: 'tech10.infor@gmail.com',
      phone: '(55) 3317-0762',
      whatsapp: '55974001960',
      instagram: 'https://www.instagram.com/tech10info/',
      facebook: 'https://www.facebook.com/share/19wtZjc61F/',
      address: {
        street: 'Rua Doutor Bozano, 968 - Loja 8',
        neighborhood: 'Centro',
        city: 'Santa Maria',
        state: 'RS',
        zip: '97015-001',
      },
      hours: {
        weekdays: 'Segunda a Sexta: 9h às 18h',
        saturday: 'Sábado: Fechado',
        sunday: 'Domingo: Fechado',
      },
    },
    brand: {
      logoUrl: '/tech10/imagem/logo/tech10-logo-fundo-azul.png',
      primaryColor: '#2563eb',
      accentColor: '#10b981',
      themePreset: 'tech',
    },
    store: {
      provider: 'vivacommerce',
      slug: 'revivah-tech',
      baseUrl: origin,
      apiBasePath: '/api/store',
      adminApiBasePath: '/api',
      healthPath: '/health',
    },
    stats: {
      yearsExperience: '20+',
      happyClients: '1000+',
      productsAvailable: '500+',
    },
    seo: {
      title: 'Tech10 Informática - 20 Anos de Experiência em Tecnologia',
      description: 'Tech10 Informática em Santa Maria/RS. Especialistas em Apple, Samsung e desenvolvimento Full Stack há 20 anos. Assistência técnica e vendas com qualidade garantida!',
    },
  };

  global.TENANT_CONFIG = Object.freeze(config);
})(typeof window !== 'undefined' ? window : this);
