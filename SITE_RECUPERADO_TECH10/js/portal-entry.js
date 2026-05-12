(function (global) {
  'use strict';

  const cfg = global.TENANT_CONFIG || {};
  const portalCfg = cfg.portal || {};
  const companyCfg = cfg.company || {};
  const defaults = {
    portalBaseUrl: portalCfg.defaultPortalBaseUrl || 'https://sistema.tech10cloud.com/portal',
    statusBaseUrl: portalCfg.defaultStatusBaseUrl || 'https://sistema.tech10cloud.com/status',
    runtimeConfigPath: portalCfg.runtimeConfigPath || '/api/runtime-config',
    whatsapp: companyCfg.whatsapp || '55974001960',
  };

  function normalizeOsNumber(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/^\d+$/.test(raw) && raw.length <= 4) {
      return raw.padStart(4, '0');
    }
    return raw;
  }

  function buildUrl(baseUrl, osNumber, token) {
    const normalizedOs = normalizeOsNumber(osNumber);
    if (!normalizedOs) return null;

    const url = new URL(`${String(baseUrl || '').replace(/\/$/, '')}/${encodeURIComponent(normalizedOs)}`);
    if (token) {
      url.searchParams.set('token', token.trim());
    }
    return url.toString();
  }

  async function fetchRuntimeConfig() {
    try {
      const response = await fetch(defaults.runtimeConfigPath, {
        method: 'GET',
        headers: { accept: 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      return {
        integrations: {
          portalBaseUrl: defaults.portalBaseUrl,
          statusBaseUrl: defaults.statusBaseUrl,
        },
        support: {
          whatsapp: defaults.whatsapp,
        },
      };
    }
  }

  function buildSupportUrl(runtimeConfig, message) {
    const tenantRoutes = global.TenantRoutes || {};
    if (tenantRoutes.supportUrl) {
      return tenantRoutes.supportUrl(message);
    }
    const support = (runtimeConfig && runtimeConfig.support) || {};
    const company = tenantRoutes.company || {};
    const whatsapp = String(company.whatsapp || support.whatsapp || defaults.whatsapp).replace(/\D/g, '');
    const text = encodeURIComponent(message || 'Olá! Vim pelo portal da Tech10 e preciso de ajuda com uma ordem de serviço.');
    return 'https://wa.me/' + whatsapp + '?text=' + text;
  }

  function updateRuntimeInfo(runtimeConfig) {
    const note = document.getElementById('runtime-note');
    const whatsappButton = document.getElementById('whatsapp-support-btn');
    const topbarSupportLink = document.getElementById('portal-topbar-support-link');
    if (!note) return;

    const integrations = runtimeConfig.integrations || {};
    const portalBaseUrl = integrations.portalBaseUrl || defaults.portalBaseUrl;
    const statusBaseUrl = integrations.statusBaseUrl || defaults.statusBaseUrl;
    const catalogBackendUrl = integrations.catalogBackendUrl || integrations.storeBackendUrl || 'não configurado';
    const commerce = runtimeConfig.commerce || {};
    const capabilities = commerce.capabilities || {};
    const checkoutMode = commerce.checkoutMode || 'desconhecido';
    const assistedBridgeActive = capabilities.assistedCheckoutBridge === true
      || capabilities.assistedCartBridge === true
      || checkoutMode === 'quote_only';

    note.innerHTML = [
      `Portal: <code>${portalBaseUrl}</code>`,
      `Status: <code>${statusBaseUrl}</code>`,
      `Catálogo público: <code>${catalogBackendUrl}</code>`,
      `Proxy loja: <code>/api/store/*</code>`,
      `Fluxo comercial: <strong>${checkoutMode === 'quote_only' ? 'atendimento assistido' : checkoutMode}</strong>`,
      `Ponte assistida: <strong>${assistedBridgeActive ? 'ativa' : 'inativa'}</strong>`,
    ].join('<br>');

    if (whatsappButton) {
      whatsappButton.href = buildSupportUrl(runtimeConfig, whatsappButton.getAttribute('data-support-message'));
    }

    if (topbarSupportLink) {
      topbarSupportLink.href = buildSupportUrl(runtimeConfig, topbarSupportLink.getAttribute('data-support-message'));
    }
  }

  function bindActions(runtimeConfig) {
    const osField = document.getElementById('os-number');
    const tokenField = document.getElementById('magic-token');
    const accessModeField = document.getElementById('access-mode');
    const portalButton = document.getElementById('open-portal-btn');
    const statusButton = document.getElementById('open-status-btn');

    if (!osField || !portalButton || !statusButton) return;

    const integrations = runtimeConfig.integrations || {};
    const portalBaseUrl = integrations.portalBaseUrl || defaults.portalBaseUrl;
    const statusBaseUrl = integrations.statusBaseUrl || defaults.statusBaseUrl;

    function openTarget(mode) {
      const osNumber = osField.value;
      const token = tokenField ? tokenField.value : '';
      const baseUrl = mode === 'status' ? statusBaseUrl : portalBaseUrl;
      const nextUrl = buildUrl(baseUrl, osNumber, mode === 'portal' ? token : '');

      if (!nextUrl) {
        osField.focus();
        osField.select();
        return;
      }

      global.location.href = nextUrl;
    }

    portalButton.addEventListener('click', function () {
      openTarget('portal');
    });

    statusButton.addEventListener('click', function () {
      openTarget('status');
    });

    if (accessModeField) {
      accessModeField.addEventListener('change', function () {
        if (accessModeField.value === 'status') {
          statusButton.focus();
        }
      });
    }

    osField.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      const mode = accessModeField ? accessModeField.value : 'portal';
      openTarget(mode === 'status' ? 'status' : 'portal');
    });
  }

  async function init() {
    const runtimeConfig = await fetchRuntimeConfig();
    updateRuntimeInfo(runtimeConfig);
    bindActions(runtimeConfig);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : this);
