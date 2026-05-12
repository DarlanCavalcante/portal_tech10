/**
 * Compatibilidade legada do carrinho.
 * Mantido apenas para páginas antigas; o arquivo canônico é cart-storefront.js.
 */
(function (global) {
  'use strict';

  const CART_ID_KEY = 'tech10_storefront_cart_id';
  const LEGACY_CART_ID_KEY = 'vivacommerce_cart_id';
  const EXTRA_LEGACY_CART_ID_KEY = 'vc_cart_id';

  function getCartStorageKeys() {
    const apiConfig = global.API_CONFIG || {};
    const configuredKeys = Array.isArray(apiConfig.CART_STORAGE_KEYS)
      ? apiConfig.CART_STORAGE_KEYS
      : [apiConfig.CART_STORAGE_KEY, apiConfig.LEGACY_CART_STORAGE_KEY];

    return Array.from(new Set(configuredKeys.concat([
      CART_ID_KEY,
      LEGACY_CART_ID_KEY,
      EXTRA_LEGACY_CART_ID_KEY
    ]).filter(Boolean)));
  }

  function readCartId() {
    const apiConfig = global.API_CONFIG || {};
    if (typeof apiConfig.readStoredCartId === 'function') {
      return apiConfig.readStoredCartId();
    }

    for (const key of getCartStorageKeys()) {
      const value = localStorage.getItem(key);
      if (value) return value;
    }
    return null;
  }

  function persistCartId(value) {
    const apiConfig = global.API_CONFIG || {};
    if (typeof apiConfig.persistStoredCartId === 'function') {
      apiConfig.persistStoredCartId(value);
      return;
    }

    for (const key of getCartStorageKeys()) {
      if (!value) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    }
  }

  function getLegacyNotificationBridge(currentCart) {
    return [
      global.storefrontCart,
      global.cartStorefront,
      global.medusaCart
    ].find(function (cart) {
      return cart && cart !== currentCart && typeof cart.showNotification === 'function';
    }) || null;
  }

  function publishCompatibilityAliases(cart) {
    if (typeof window === 'undefined') return;
    window.cartVivaCommerce = cart;
    window.medusaCart = window.medusaCart || cart;
  }

  class CartVivaCommerce {
    constructor() {
      this.adapter = global.MarketplaceAdapter;
      this.cartId = readCartId();
      this.cartCountElement = document.getElementById('cartCount');
      this.cart = null;
    }

    async init() {
      if (!this.adapter) {
        console.warn('MarketplaceAdapter não encontrado. Carregue api-adapter.js antes.');
        return;
      }
      try {
        if (!this.cartId) {
          const { cart } = await this.adapter.createCart();
          this.cartId = cart.id;
          this.cart = cart;
          persistCartId(this.cartId);
        } else {
          const cart = await this.adapter.getCart(this.cartId);
          if (!cart) {
            this.cartId = null;
            persistCartId(null);
            await this.init();
            return;
          }
          this.cart = cart;
        }
        await this.updateCartCount();
      } catch (err) {
        console.error('CartVivaCommerce init:', err);
      }
    }

    async getCart() {
      if (!this.cartId || !this.adapter) return null;
      this.cart = await this.adapter.getCart(this.cartId);
      return this.cart;
    }

    async addItem(variantId, productId, quantity, buyNow) {
      if (!this.adapter) throw new Error('Adapter não disponível');
      try {
        if (!this.cartId) await this.init();
        const { cart } = await this.adapter.addLineItem(this.cartId, variantId, quantity || 1);
        this.cart = cart;
        await this.updateCartCount();
        this.showNotification('Produto adicionado ao carrinho!');
        if (buyNow) setTimeout(() => { window.location.href = '/carrinho'; }, 1000);
        return this.cart;
      } catch (err) {
        this.showNotification(err.message || 'Erro ao adicionar produto', 'error');
        throw err;
      }
    }

    async updateQuantity(itemId, quantity) {
      if (!this.cartId) throw new Error('Carrinho não encontrado');
      if (quantity < 1) return this.removeItem(itemId);
      try {
        const { cart } = await this.adapter.updateLineItem(this.cartId, itemId, quantity);
        this.cart = cart;
        await this.updateCartCount();
        return this.cart;
      } catch (err) {
        this.showNotification('Erro ao atualizar quantidade', 'error');
        throw err;
      }
    }

    async removeItem(itemId) {
      if (!this.cartId) throw new Error('Carrinho não encontrado');
      try {
        const { cart } = await this.adapter.removeLineItem(this.cartId, itemId);
        this.cart = cart;
        await this.updateCartCount();
        this.showNotification('Item removido do carrinho');
        return this.cart;
      } catch (err) {
        this.showNotification('Erro ao remover item', 'error');
        throw err;
      }
    }

    async updateCartCount() {
      try {
        const cart = await this.getCart();
        const count = (cart && cart.items) ? cart.items.reduce((s, i) => s + (i.quantity || 0), 0) : 0;
        if (this.cartCountElement) this.cartCountElement.textContent = count;
      } catch (_) {}
    }

    showNotification(message, type) {
      const bridge = getLegacyNotificationBridge(this);
      if (bridge) {
        bridge.showNotification(message, type);
        return;
      }
      if (typeof alert !== 'undefined') alert(message);
    }
  }

  const cart = new CartVivaCommerce();
  publishCompatibilityAliases(cart);
})(typeof window !== 'undefined' ? window : this);
