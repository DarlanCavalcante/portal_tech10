/*
 * Tech10 Portal — Telemetria do funil (Frente 1)
 *
 * Mede o funil do portal/loja: entrada → produto → carrinho → checkout →
 * pedido, além de pedidos de ajuda (WhatsApp), entrada no portal do cliente e
 * abandono de checkout.
 *
 * Princípios:
 *  - NUNCA quebra a loja: tudo em try/catch, envio best-effort (sendBeacon).
 *  - Auto-instrumentação por delegação de eventos → quase zero edição nas páginas.
 *  - Inerte por padrão: os eventos vão para /api/telemetry (mesma origem); o
 *    coletor serverless só encaminha ao ERP se TECH10_ERP_TELEMETRY_URL existir.
 */
(function (global) {
  'use strict';

  var ENDPOINT = '/api/telemetry';
  var SESSION_KEY = 'tech10_telemetry_session';
  var VISITOR_KEY = 'tech10_telemetry_visitor';

  function safe(fn) { try { return fn(); } catch (_e) { return undefined; } }

  function sessionId() {
    return safe(function () {
      var id = sessionStorage.getItem(SESSION_KEY);
      if (!id) {
        id = (global.crypto && global.crypto.randomUUID)
          ? global.crypto.randomUUID()
          : 's_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
        sessionStorage.setItem(SESSION_KEY, id);
      }
      return id;
    }) || 'anon-session';
  }

  // Identificador persistente do visitante (localStorage) — distingue visitantes
  // recorrentes de sessões. Min. 8 chars (exigência do coletor do ERP).
  function visitorId() {
    return safe(function () {
      var id = localStorage.getItem(VISITOR_KEY);
      if (!id) {
        id = (global.crypto && global.crypto.randomUUID)
          ? global.crypto.randomUUID()
          : 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem(VISITOR_KEY, id);
      }
      return id;
    }) || 'anon-visitor';
  }

  // Deriva o estágio do funil a partir do caminho da URL.
  function funnelStage(path) {
    var p = (path || location.pathname || '/').toLowerCase();
    if (p === '/' || p.indexOf('/index') === 0) return 'home';
    if (p.indexOf('/loja') === 0 || p.indexOf('/produtos') === 0) return 'store';
    if (p.indexOf('/carrinho') === 0) return 'cart';
    if (p.indexOf('/checkout') === 0) return 'checkout';
    if (p.indexOf('/pedido-confirmado') === 0) return 'order_success';
    if (p.indexOf('/portal') === 0) return 'portal';
    if (p.indexOf('/status') === 0) return 'status';
    return 'other';
  }

  function runtimeContext() {
    var cfg = safe(function () { return global.API_CONFIG || {}; }) || {};
    return {
      tenantId: cfg.TENANT_ID || 'tech10',
      runtimeId: cfg.RUNTIME_ID || 'tech10-portal',
      stage: funnelStage(),
      path: safe(function () { return location.pathname; }),
      referrer: safe(function () { return document.referrer || null; })
    };
  }

  function send(event, props) {
    safe(function () {
      var payload = {
        event: String(event),
        occurredAt: new Date().toISOString(),
        sessionId: sessionId(),
        visitorId: visitorId(),
        context: runtimeContext(),
        props: props || {}
      };
      var body = JSON.stringify(payload);
      var sent = false;
      if (global.navigator && typeof navigator.sendBeacon === 'function') {
        sent = navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
      }
      if (!sent && global.fetch) {
        fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body,
          keepalive: true
        }).catch(function () {});
      }
    });
  }

  // ── Auto-instrumentação por delegação ──
  function matchText(el) {
    return ((el && (el.textContent || el.value)) || '').trim().toLowerCase();
  }

  function onClick(ev) {
    safe(function () {
      var el = ev.target && ev.target.closest ? ev.target.closest('a,button') : null;
      if (!el) return;
      var text = matchText(el);
      var href = (el.getAttribute && el.getAttribute('href')) || '';

      // Pedido de ajuda (WhatsApp / "Falar com a Tech10").
      if (href.indexOf('wa.me') !== -1 || href.indexOf('whatsapp') !== -1
        || text.indexOf('falar com a tech10') !== -1 || text.indexOf('precisa de ajuda') !== -1
        || text.indexOf('tirar dúvida') !== -1 || text.indexOf('tirar duvida') !== -1) {
        send('help_click', { text: text.slice(0, 60) });
        return;
      }
      // Adicionar ao carrinho.
      if (text === 'adicionar' || text.indexOf('adicionar ao carrinho') !== -1) {
        send('add_to_cart', { text: text.slice(0, 60) });
        return;
      }
      // Comprar agora / avançar para checkout.
      if (text.indexOf('comprar agora') !== -1 || text.indexOf('finalizar compra') !== -1) {
        send('begin_checkout', { text: text.slice(0, 60) });
        return;
      }
      // Gerar Pix (pedido criado no ERP).
      if (text.indexOf('gerar pix') !== -1) {
        send('order_submit', { text: text.slice(0, 60) });
        return;
      }
    });
  }

  // Abandono de checkout: saiu da página de checkout sem submeter o pedido.
  var orderSubmitted = false;
  function markSubmitted() { orderSubmitted = true; }
  function onHide() {
    safe(function () {
      if (funnelStage() === 'checkout' && !orderSubmitted) {
        send('checkout_abandon', {});
      }
    });
  }

  function init() {
    safe(function () {
      send('page_view', {});
      document.addEventListener('click', onClick, true);
      document.addEventListener('click', function (ev) {
        var el = ev.target && ev.target.closest ? ev.target.closest('a,button') : null;
        if (el && matchText(el).indexOf('gerar pix') !== -1) markSubmitted();
      }, true);
      // Abandono via pagehide/visibilitychange (best-effort).
      global.addEventListener('pagehide', onHide);
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') onHide();
      });
    });
  }

  // API pública para chamadas explícitas (ex.: entrada no portal do cliente).
  global.Tech10Telemetry = {
    track: send,
    markOrderSubmitted: markSubmitted
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : this);
