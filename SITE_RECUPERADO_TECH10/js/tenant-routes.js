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
    company: {
      whatsapp: company.whatsapp || '55974001960',
    },
    logoUrl: (brand && brand.logoUrl) || '/imagem/logo/tech10-logo-fundo-azul.png',
    storeSlug: (tenant && tenant.slug) || 'tech10',
    legacyStoreSlugs,
    legacySitePaths,
  };

  let runtimeConfigPromise = null;

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

  function bindSupportLinks() {
    document.querySelectorAll('[data-tenant-support-link]').forEach(function (link) {
      const message = link.getAttribute('data-support-message')
        || 'Olá! Vim pela loja da Tech10 e gostaria de atendimento para concluir uma compra.';
      link.setAttribute('href', buildSupportUrl(message));
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
  }

  function fetchRuntimeConfig() {
    if (global.__tech10_runtime_config) {
      return Promise.resolve(global.__tech10_runtime_config);
    }

    if (runtimeConfigPromise) {
      return runtimeConfigPromise;
    }

    const runtimeConfigPath = (cfg.portal && cfg.portal.runtimeConfigPath) || '/api/runtime-config';
    runtimeConfigPromise = fetch(runtimeConfigPath, {
      method: 'GET',
      headers: { accept: 'application/json' },
    })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (data) {
        global.__tech10_runtime_config = data;
        return data;
      })
      .catch(function () {
        return null;
      });

    return runtimeConfigPromise;
  }

  function buildSupportUrl(message) {
    const text = message || 'Olá! Vim pela loja da Tech10 e gostaria de atendimento para concluir uma compra.';
    return routes.whatsappBase + '?text=' + encodeURIComponent(text);
  }

  function hideElement(element) {
    if (!element || !element.style) return;
    element.style.display = 'none';
    element.setAttribute('aria-hidden', 'true');
  }

  function convertElementToSupportEntry(element, message, options) {
    if (!element) return;

    const supportUrl = buildSupportUrl(message);
    const html = (options && options.html)
      || '<i class="fab fa-whatsapp"></i><span>Atendimento</span>';

    if (element.tagName === 'A') {
      element.setAttribute('href', supportUrl);
      element.setAttribute('target', '_blank');
      element.setAttribute('rel', 'noopener noreferrer');
      element.setAttribute('data-runtime-retarget', 'support-entry');
      element.innerHTML = html;
      element.classList.add('runtime-support-entry');
      return;
    }

    if (element.tagName === 'DIV' || element.tagName === 'BUTTON') {
      element.innerHTML = html;
      element.setAttribute('role', 'link');
      element.setAttribute('tabindex', '0');
      element.setAttribute('data-runtime-retarget', 'support-entry');
      element.classList.add('runtime-support-entry');
      element.onclick = function () {
        global.open(supportUrl, '_blank', 'noopener,noreferrer');
      };
      element.onkeydown = function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          global.open(supportUrl, '_blank', 'noopener,noreferrer');
        }
      };
    }
  }

  function retargetLinkToSupport(link, message, html) {
    if (!link) return;
    link.setAttribute('href', buildSupportUrl(message));
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.setAttribute('data-runtime-retarget', 'support');
    if (html) {
      link.innerHTML = html;
    }
  }

  function ensureQuoteOnlyStyles() {
    if (document.getElementById('tech10-quote-only-runtime-style')) return;
    const style = document.createElement('style');
    style.id = 'tech10-quote-only-runtime-style';
    style.textContent = [
      '.quote-only-runtime-state{background:#fff;border:1px solid rgba(37,99,235,.12);box-shadow:0 18px 48px rgba(15,23,42,.08);border-radius:24px;padding:28px;max-width:760px;margin:24px auto;}',
      '.quote-only-runtime-badge{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;background:#eff6ff;color:#1d4ed8;font-size:12px;font-weight:700;margin-bottom:18px;}',
      '.quote-only-runtime-title{margin:0 0 12px;font-size:28px;line-height:1.1;color:#0f172a;}',
      '.quote-only-runtime-copy{margin:0;color:#475569;font-size:16px;line-height:1.7;}',
      '.quote-only-runtime-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:22px;}',
      '.quote-only-runtime-link{display:inline-flex;align-items:center;gap:8px;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:700;}',
      '.quote-only-runtime-link.primary{background:#2563eb;color:#fff;}',
      '.quote-only-runtime-link.secondary{background:#ecfeff;color:#0f766e;border:1px solid rgba(15,118,110,.18);}',
      '.runtime-support-entry{display:inline-flex !important;align-items:center;justify-content:center;gap:8px;text-decoration:none;}',
      '.pp-cart-btn.runtime-support-entry{width:auto;height:44px;border-radius:999px;padding:0 14px;background:#ecfeff;color:#0f766e;font-size:13px;font-weight:700;border:1px solid rgba(15,118,110,.18);}',
      '.pp-cart-btn.runtime-support-entry:hover{background:#d1fae5;color:#0f766e;}',
      '.pp-cart-btn.runtime-support-entry .pp-cart-count{display:none !important;}',
      '.cart-icon.runtime-support-entry{width:auto;height:40px;border-radius:999px;padding:0 14px;background:#ecfeff;color:#0f766e;font-size:13px;font-weight:700;border:1px solid rgba(15,118,110,.18);gap:8px;}',
      '.cart-icon.runtime-support-entry .cart-count{display:none !important;}',
    ].join('');
    document.head.appendChild(style);
  }

  function currentPath() {
    return (global.location && global.location.pathname) || '/';
  }

  function isCartPath(pathname) {
    return pathname === '/carrinho' || pathname.endsWith('/carrinho.html');
  }

  function isCheckoutPath(pathname) {
    return pathname === '/checkout' || pathname.endsWith('/checkout.html');
  }

  function renderQuoteOnlyPage(runtimeConfig) {
    const pathname = currentPath();
    if (!isCartPath(pathname) && !isCheckoutPath(pathname)) return;

    const stateRoot = isCartPath(pathname)
      ? document.getElementById('cart-content')
      : document.getElementById('checkout-content');
    if (!stateRoot) return;

    ensureQuoteOnlyStyles();
    document.querySelectorAll('.checkout-steps, .checkout-steps-bar').forEach(hideElement);
    document.querySelectorAll('.cart-icon, .pp-cart-btn, #cartIcon').forEach(hideElement);

    const title = isCartPath(pathname)
      ? 'Compra assistida pela Tech10'
      : 'Fechamento assistido do pedido';
    const copy = isCartPath(pathname)
      ? 'O catálogo público já está disponível, mas o fechamento do pedido continua pelo atendimento da Tech10. Escolha o item na loja e fale com o time para confirmar disponibilidade, entrega e pagamento.'
      : 'Nesta fase, a Tech10 conclui o pedido junto com você no atendimento. Assim garantimos confirmação de estoque, frete e forma de pagamento sem fricção.';
    const whatsappText = isCartPath(pathname)
      ? 'Olá! Vim pela loja da Tech10 e quero concluir a compra de um produto com atendimento assistido.'
      : 'Olá! Vim pela loja da Tech10 e quero finalizar meu pedido com atendimento assistido.';

    const heading = document.querySelector('.cart-header h1, .header h1');
    if (heading) {
      heading.innerHTML = '<i class="fas fa-headset"></i> ' + title;
    }

    const subtitle = document.querySelector('.header p');
    if (subtitle) {
      subtitle.textContent = 'Atendimento guiado pela Tech10 para confirmar produto, entrega e pagamento.';
    }

    stateRoot.style.display = 'block';
    stateRoot.innerHTML = [
      '<div class="quote-only-runtime-state">',
      '<div class="quote-only-runtime-badge"><i class="fas fa-comments"></i> Venda em atendimento assistido</div>',
      '<h2 class="quote-only-runtime-title">' + title + '</h2>',
      '<p class="quote-only-runtime-copy">' + copy + '</p>',
      '<div class="quote-only-runtime-actions">',
      '<a class="quote-only-runtime-link primary" href="' + routes.shopHome + '"><i class="fas fa-store"></i> Voltar ao catálogo</a>',
      '<a class="quote-only-runtime-link secondary" href="' + buildSupportUrl(whatsappText) + '" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp"></i> Falar com a Tech10</a>',
      '</div>',
      '</div>',
    ].join('');
  }

  function applyCommerceRuntime(runtimeConfig) {
    if (!runtimeConfig || !runtimeConfig.commerce) return;

    const capabilities = runtimeConfig.commerce.capabilities || {};
    const cartEnabled = capabilities.cart !== false;
    const checkoutEnabled = capabilities.checkout !== false;
    const quoteOnly = capabilities.quoteOnly === true || runtimeConfig.commerce.checkoutMode === 'quote_only';
    const assistedCartBridge = capabilities.assistedCartBridge === true;
    const assistedCheckoutBridge = capabilities.assistedCheckoutBridge === true;
    const keepCartSurface = quoteOnly && assistedCartBridge;
    const keepCheckoutSurface = quoteOnly && assistedCheckoutBridge;
    const hasPrimarySupportEntry = document.querySelector('[data-tenant-support-link][data-support-primary="true"]');

    if (!cartEnabled && !keepCartSurface) {
      document.querySelectorAll('.cart-count, .pp-cart-count').forEach(hideElement);
      document.querySelectorAll('.pp-cart-btn').forEach(function (element) {
        if (hasPrimarySupportEntry) {
          hideElement(element);
          return;
        }
        convertElementToSupportEntry(
          element,
          'Olá! Vim pela loja da Tech10 e gostaria de atendimento para fechar uma compra.',
          { html: '<i class="fab fa-whatsapp"></i><span>Atendimento</span>' }
        );
      });
      document.querySelectorAll('.cart-icon').forEach(function (element) {
        if (element.classList.contains('pp-cart-btn')) return;
        if (hasPrimarySupportEntry) {
          hideElement(element);
          return;
        }
        convertElementToSupportEntry(
          element,
          'Olá! Vim pela loja da Tech10 e gostaria de atendimento para fechar uma compra.',
          { html: '<i class="fab fa-whatsapp"></i><span>Atendimento</span>' }
        );
      });
      document.querySelectorAll('#cartIcon').forEach(function (element) {
        if (hasPrimarySupportEntry) {
          hideElement(element);
          return;
        }
        if (element.classList.contains('runtime-support-entry')) return;
        convertElementToSupportEntry(
          element,
          'Olá! Vim pela loja da Tech10 e gostaria de atendimento para fechar uma compra.',
          { html: '<i class="fab fa-whatsapp"></i><span>Atendimento</span>' }
        );
      });

      document.querySelectorAll('a[href="/carrinho"], a[href="/carrinho.html"]').forEach(function (link) {
        if (link.classList.contains('runtime-support-entry')) {
          return;
        }

        retargetLinkToSupport(
          link,
          'Olá! Vim pela loja da Tech10 e gostaria de ajuda para concluir a compra de um produto.',
          '<i class="fab fa-whatsapp"></i> Falar com a Tech10'
        );
      });
    }

    if (!checkoutEnabled && !keepCheckoutSurface) {
      document.querySelectorAll('a[href="/checkout"], a[href="/checkout.html"]').forEach(function (link) {
        retargetLinkToSupport(
          link,
          'Olá! Vim pela loja da Tech10 e preciso de ajuda para fechar meu pedido.',
          '<i class="fab fa-whatsapp"></i> Fechar com atendimento'
        );
      });
    }

    if (quoteOnly && !keepCartSurface && !keepCheckoutSurface) {
      renderQuoteOnlyPage(runtimeConfig);
    }
  }

  function apply() {
    document.querySelectorAll('a[href]').forEach(rewriteHref);
    document.querySelectorAll('[onclick]').forEach(rewriteOnclick);
    rewriteImages();
    bindPortalLinks();
    bindSupportLinks();

    fetchRuntimeConfig().then(function (runtimeConfig) {
      applyCommerceRuntime(runtimeConfig);
    });
  }

  routes.supportUrl = function (message) {
    return buildSupportUrl(message);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }

  global.TenantRoutes = Object.freeze(routes);
})(typeof window !== 'undefined' ? window : this);
