/**
 * tenant-routes.js
 *
 * Reescreve links hardcoded da Tech10 a partir do TENANT_CONFIG,
 * preservando a estrutura atual das páginas estáticas.
 */
(function (global) {
  'use strict';

  const cfg = global.TENANT_CONFIG || {};
  const tenant = cfg.tenant || {};
  const company = cfg.company || {};
  const brand = cfg.brand || {};

  const routes = {
    siteHome: tenant.publicSiteBasePath || '/tech10',
    shopHome: tenant.storefrontPath || '/lojas/revivah-tech/shop',
    categoryShopBasePath: tenant.categoryShopBasePath || '/shop?store=revivah-tech',
    cart: tenant.cartPath || '/tech10/carrinho.html',
    checkout: tenant.checkoutPath || '/tech10/checkout.html',
    orderSuccess: tenant.orderSuccessPath || '/tech10/pedido-confirmado.html',
    whatsappBase: company.whatsapp ? `https://wa.me/${company.whatsapp}` : 'https://wa.me/55974001960',
    logoUrl: (brand && brand.logoUrl) || '/tech10/imagem/logo/tech10-logo-fundo-azul.png',
    storeSlug: (tenant && tenant.slug) || 'revivah-tech',
  };

  function absoluteSiteHome() {
    return routes.siteHome.endsWith('/') ? routes.siteHome : `${routes.siteHome}/`;
  }

  function rewriteHref(anchor) {
    if (!anchor || !anchor.getAttribute) return;
    const href = anchor.getAttribute('href');
    if (!href) return;

    if (href === '/tech10/' || href === '/tech10') {
      anchor.setAttribute('href', absoluteSiteHome());
      return;
    }

    if (href === '/tech10/carrinho.html') {
      anchor.setAttribute('href', routes.cart);
      return;
    }

    if (href === '/lojas/revivah-tech/shop') {
      anchor.setAttribute('href', routes.shopHome);
      return;
    }

    if (href.indexOf('/shop?store=revivah-tech') === 0) {
      anchor.setAttribute('href', href.replace('/shop?store=revivah-tech', routes.categoryShopBasePath));
      return;
    }

    if (href.indexOf('https://wa.me/55974001960') === 0) {
      anchor.setAttribute('href', href.replace('https://wa.me/55974001960', routes.whatsappBase));
    }
  }

  function rewriteOnclick(element) {
    if (!element || !element.getAttribute) return;
    const onclick = element.getAttribute('onclick');
    if (!onclick) return;

    let next = onclick;
    next = next.replace(/\/tech10\/carrinho\.html/g, routes.cart);
    next = next.replace(/\/tech10\//g, absoluteSiteHome());
    next = next.replace(/\/lojas\/revivah-tech\/shop/g, routes.shopHome);
    next = next.replace(/\/shop\?store=revivah-tech/g, routes.categoryShopBasePath);

    if (next !== onclick) {
      element.setAttribute('onclick', next);
    }
  }

  function rewriteImages() {
    const logoImages = document.querySelectorAll('img[src*="tech10-logo"]');
    logoImages.forEach(function (img) {
      if (!img.getAttribute('data-preserve-logo')) {
        img.setAttribute('src', routes.logoUrl);
      }
    });
  }

  function apply() {
    document.querySelectorAll('a[href]').forEach(rewriteHref);
    document.querySelectorAll('[onclick]').forEach(rewriteOnclick);
    rewriteImages();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }

  global.TenantRoutes = Object.freeze(routes);
})(typeof window !== 'undefined' ? window : this);
