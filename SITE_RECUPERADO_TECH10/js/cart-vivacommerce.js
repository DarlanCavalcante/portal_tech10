/**
 * Carrinho VivaCommerce — usa MarketplaceAdapter
 * Use com API_CONFIG.provider === 'vivacommerce'.
 * Interface: init, addItem, getCart, updateCartCount, showNotification (compatível com medusa-cart).
 */
(function (global) {
  'use strict';

  const CART_ID_KEY = 'vivacommerce_cart_id';

  class CartVivaCommerce {
    constructor() {
      this.adapter = global.MarketplaceAdapter;
      this.cartId = localStorage.getItem(CART_ID_KEY);
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
          localStorage.setItem(CART_ID_KEY, this.cartId);
        } else {
          const cart = await this.adapter.getCart(this.cartId);
          if (!cart) {
            this.cartId = null;
            localStorage.removeItem(CART_ID_KEY);
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
        if (buyNow) setTimeout(() => { window.location.href = 'carrinho.html'; }, 1000);
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
      if (typeof global.medusaCart !== 'undefined' && global.medusaCart.showNotification) {
        global.medusaCart.showNotification(message, type);
        return;
      }
      if (typeof alert !== 'undefined') alert(message);
    }
  }

  const cart = new CartVivaCommerce();
  if (typeof window !== 'undefined') {
    window.medusaCart = window.medusaCart || cart;
    window.cartVivaCommerce = cart;
  }
})(typeof window !== 'undefined' ? window : this);
