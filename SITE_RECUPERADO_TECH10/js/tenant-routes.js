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
    siteHome: tenant.publicSiteBasePath || '/',
    shopHome: tenant.storefrontPath || '/loja',
    categoryShopBasePath: tenant.categoryShopBasePath || '/loja',
    cart: tenant.cartPath || '/carrinho',
    checkout: tenant.checkoutPath || '/checkout',
    orderSuccess: tenant.orderSuccessPath || '/pedido-confirmado',
    portal: tenant.portalPath || '/portal',
    whatsappBase: company.whatsapp ? `https://wa.me/${company.whatsapp}` : 'https://wa.me/55974001960',
    logoUrl: (brand && brand.logoUrl) || '/imagem/logo/tech10-logo-fundo-azul.png',
    storeSlug: (tenant && tenant.slug) || 'revivah-tech',
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

    if (href === '/tech10/' || href === '/tech10' || href === '/tech10/index.html') {
      anchor.setAttribute('href', absoluteSiteHome());
      return;
    }

    if (href === '/tech10/produtos.html') {
      anchor.setAttribute('href', routes.shopHome);
      return;
    }

    if (href === '/tech10/carrinho.html' || href === '/carrinho.html') {
      anchor.setAttribute('href', routes.cart);
      return;
    }

    if (href === '/tech10/checkout.html' || href === '/checkout.html') {
      anchor.setAttribute('href', routes.checkout);
      return;
    }

    if (href === '/tech10/pedido-confirmado.html' || href === '/pedido-confirmado.html') {
      anchor.setAttribute('href', routes.orderSuccess);
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

    if (href === '/portal' || href === '/tech10/portal') {
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
    next = next.replace(/\/tech10\/carrinho\.html/g, routes.cart);
    next = next.replace(/\/tech10\/checkout\.html/g, routes.checkout);
    next = next.replace(/\/tech10\/pedido-confirmado\.html/g, routes.orderSuccess);
    next = next.replace(/\/tech10\/produtos\.html/g, routes.shopHome);
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
