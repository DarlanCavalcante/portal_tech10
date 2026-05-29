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
      slug: 'tech10',
      legacyStoreSlugs: ['revivah-tech'],
      legacySitePaths: ['/tech10'],
      publicSiteBasePath: '/',
      storefrontPath: '/loja',
      categoryShopBasePath: '/loja',
      cartPath: '/carrinho',
      checkoutPath: '/checkout',
      orderSuccessPath: '/pedido-confirmado',
      portalPath: '/portal',
      runtimeSiteEntryPath: '/',
      runtimeStoreEntryPath: '/loja',
    },
    company: {
      name: 'Tech10 Informática e Tecnologia',
      slogan: 'Tecnologia que Conecta Seu Mundo',
      description: 'Assistência técnica Apple, iPhone, Samsung e Android, conserto de notebooks e computadores, redes, infraestrutura, desenvolvimento de sistemas e loja de informática em Santa Maria/RS.',
      website: 'https://tech10.loja.tech10cloud.com/',
      email: 'tech10.infor@gmail.com',
      phone: '(55) 3317-0762',
      whatsapp: '55974001960',
      instagram: 'https://www.instagram.com/tech10info/',
      facebook: 'https://www.facebook.com/Tech10Infor/',
      address: {
        street: 'Rua Dr. Bozano, 968 - Loja 8',
        neighborhood: 'Centro',
        city: 'Santa Maria',
        state: 'RS',
        zip: '97015-001',
      },
      hours: {
        weekdays: 'Segunda a Sexta: 9h às 12h e 13h às 18h',
        saturday: 'Sábado: 9h às 13h',
        sunday: 'Domingo: Fechado',
      },
    },
    brand: {
      logoUrl: '/imagem/logo/tech10-logo-principal-pulso-hibrido.svg',
      fallbackProductImageUrl: '/imagem/propaganda loja/tecnologia.jpeg',
      primaryColor: '#2563eb',
      accentColor: '#10b981',
      themePreset: 'tech',
    },
    store: {
      provider: 'tenant-standalone',
      runtimeId: 'tech10-portal',
      runtimeLabel: 'Tech10 Portal',
      slug: 'tech10',
      baseUrl: origin,
      apiBasePath: '/api/store',
      adminApiBasePath: '/api',
      healthPath: '/api/health',
      catalogSource: 'erp_stock',
      checkoutMode: 'quote_only',
    },
    portal: {
      entryPath: '/portal',
      runtimeConfigPath: '/api/runtime-config',
      defaultPortalBaseUrl: 'https://sistema.tech10cloud.com/portal',
      defaultStatusBaseUrl: 'https://sistema.tech10cloud.com/status',
    },
    stats: {
      yearsExperience: '20+',
      happyClients: '1000+',
      productsAvailable: '500+',
    },
    seo: {
      title: 'Tech10 Informática e Tecnologia em Santa Maria/RS | Assistência Apple, Samsung, notebooks, redes e sistemas',
      description: 'Assistência técnica Apple, iPhone, Samsung e Android, conserto de notebooks e computadores, redes, infraestrutura, desenvolvimento de sistemas e loja de informática em Santa Maria/RS.',
      siteUrl: 'https://tech10.loja.tech10cloud.com',
      defaultOgImage: '/imagem/logo/tech10-logo-principal-pulso-hibrido.svg',
    },
  };

  global.TENANT_CONFIG = Object.freeze(config);
})(typeof window !== 'undefined' ? window : this);
