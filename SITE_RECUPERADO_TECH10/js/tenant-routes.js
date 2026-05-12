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
  const legacyStoreSlugs = Array.isArray(tenant.legacyStoreSlugs) ? tenant.legacyStoreSlugs : ['revivah-tech'];
  const legacySitePaths = Array.isArray(tenant.legacySitePaths) ? tenant.legacySitePaths : ['/tech10'];

  const routes = {
    siteHome: tenant.publicSiteBasePath || '/',
    shopHome: tenant.storefrontPath || '/loja',
    categoryShopBasePath: tenant.categoryShopBasePath || '/loja',
    cart: tenant.cartPath || '/carrinho',
    checkout: tenant.checkoutPath || '/checkout',
    orderSuccess: tenant.orderSuccessPath || '/pedido-confirmado',
    portal: tenant.portalPath || '/portal',
    whatsappBase: company.whatsapp ? `https://wa.me/${company.whatsapp}` : 'https://wa.me/55974001960',
    logoUrl: (brand && brand.logoUrl) || '/imagem/logo/tech10-logo-fundo-azul.png',
    storeSlug: (tenant && tenant.slug) || 'tech10',
    legacyStoreSlugs,
    legacySitePaths,
  };

  function absoluteSiteHome() {
    if (routes.siteHome === '/') return '/';
    return routes.siteHome.endsWith('/') ? routes.siteHome : `${routes.siteHome}/`;
  }

  function isRelativePath(href) {
    return href && !href.startsWith('/') && !href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('#') && !href.startsWith('mailto:');
  }

  function maybeRewriteRelativeHref(anchor, href) {
    if (!isRelativePath(href)) return false;

    if (href === 'produtos.html') {
      anchor.setAttribute('href', routes.shopHome);
      return true;
    }

    if (href === 'carrinho.html') {
      anchor.setAttribute('href', routes.cart);
      return true;
    }

    if (href === 'checkout.html') {
      anchor.setAttribute('href', routes.checkout);
      return true;
    }

    if (href === 'pedido-confirmado.html') {
      anchor.setAttribute('href', routes.orderSuccess);
      return true;
    }

    return false;
  }

  function rewriteHref(anchor) {
    if (!anchor || !anchor.getAttribute) return;
    const href = anchor.getAttribute('href');
    if (!href) return;

    if (maybeRewriteRelativeHref(anchor, href)) {
      return;
    }

    if (
      routes.legacySitePaths.some(function (sitePath) {
        return href === sitePath || href === `${sitePath}/` || href === `${sitePath}/index.html`;
      })
    ) {
      anchor.setAttribute('href', absoluteSiteHome());
      return;
    }

    if (routes.legacySitePaths.some((sitePath) => href === `${sitePath}/produtos.html`)) {
      anchor.setAttribute('href', routes.shopHome);
      return;
    }

    if (routes.legacySitePaths.some((sitePath) => href === `${sitePath}/carrinho.html`) || href === '/carrinho.html') {
      anchor.setAttribute('href', routes.cart);
      return;
    }

    if (routes.legacySitePaths.some((sitePath) => href === `${sitePath}/checkout.html`) || href === '/checkout.html') {
      anchor.setAttribute('href', routes.checkout);
      return;
    }

    if (
      routes.legacySitePaths.some((sitePath) => href === `${sitePath}/pedido-confirmado.html`)
      || href === '/pedido-confirmado.html'
    ) {
      anchor.setAttribute('href', routes.orderSuccess);
      return;
    }

    if ([routes.storeSlug].concat(routes.legacyStoreSlugs).some((storeSlug) => href === `/lojas/${storeSlug}/shop`)) {
      anchor.setAttribute('href', routes.shopHome);
      return;
    }

    for (const storeSlug of [routes.storeSlug].concat(routes.legacyStoreSlugs)) {
      const legacyShopQuery = `/shop?store=${storeSlug}`;
      if (href.indexOf(legacyShopQuery) === 0) {
        anchor.setAttribute('href', href.replace(legacyShopQuery, routes.categoryShopBasePath));
        return;
      }
    }

    if (href === '/portal' || routes.legacySitePaths.some((sitePath) => href === `${sitePath}/portal`)) {
      anchor.setAttribute('href', routes.portal);
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
    routes.legacySitePaths.forEach(function (sitePath) {
      const escaped = sitePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      next = next.replace(new RegExp(`${escaped}/carrinho\\.html`, 'g'), routes.cart);
      next = next.replace(new RegExp(`${escaped}/checkout\\.html`, 'g'), routes.checkout);
      next = next.replace(new RegExp(`${escaped}/pedido-confirmado\\.html`, 'g'), routes.orderSuccess);
      next = next.replace(new RegExp(`${escaped}/produtos\\.html`, 'g'), routes.shopHome);
      next = next.replace(new RegExp(`${escaped}/`, 'g'), absoluteSiteHome());
    });

    [routes.storeSlug].concat(routes.legacyStoreSlugs).forEach(function (storeSlug) {
      const escapedSlug = storeSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      next = next.replace(new RegExp(`/lojas/${escapedSlug}/shop`, 'g'), routes.shopHome);
      next = next.replace(new RegExp(`/shop\\?store=${escapedSlug}`, 'g'), routes.categoryShopBasePath);
    });

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

  function bindPortalLinks() {
    document.querySelectorAll('[data-tenant-portal-link]').forEach(function (link) {
      if (link.getAttribute('href') !== routes.portal) {
        link.setAttribute('href', routes.portal);
      }
    });
  }

  function apply() {
    document.querySelectorAll('a[href]').forEach(rewriteHref);
    document.querySelectorAll('[onclick]').forEach(rewriteOnclick);
    rewriteImages();
    bindPortalLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }

  global.TenantRoutes = Object.freeze(routes);
})(typeof window !== 'undefined' ? window : this);
