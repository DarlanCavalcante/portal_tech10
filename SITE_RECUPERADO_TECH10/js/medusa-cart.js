/**
 * MedusaCart - Sistema de Carrinho 100% Medusa
 * Tech10 E-commerce - Gestão completa de carrinho via API Medusa
 */

class MedusaCart {
    constructor() {
        // Usar configuração centralizada da API
        this.baseUrl = window.API_CONFIG?.STORE_API || 'http://localhost:9000/store';
        this.cartId = localStorage.getItem('medusa_cart_id');
        this.cartCountElement = document.getElementById('cartCount');
        this.cart = null;
    }

    /**
     * Inicializar carrinho
     */
    async init() {
        try {
            // Se não tiver carrinho, criar um
            if (!this.cartId) {
                await this.createCart();
            } else {
                // Verificar se o carrinho ainda existe no backend
                const cart = await this.getCart();
                if (!cart) {
                    // Carrinho não existe mais, criar novo
                    await this.createCart();
                }
            }
            
            // Atualizar contador do carrinho
            await this.updateCartCount();
            
            console.log('✅ MedusaCart inicializado');
        } catch (error) {
            console.error('❌ Erro ao inicializar MedusaCart:', error);
        }
    }

    /**
     * Criar novo carrinho
     */
    async createCart() {
        try {
            const response = await fetch(`${this.baseUrl}/carts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.cartId = data.cart.id;
            this.cart = data.cart;
            localStorage.setItem('medusa_cart_id', this.cartId);
            
            console.log('🛒 Carrinho Medusa criado:', this.cartId);
            return this.cart;
        } catch (error) {
            console.error('❌ Erro ao criar carrinho:', error);
            throw error;
        }
    }

    /**
     * Buscar carrinho atual
     */
    async getCart() {
        if (!this.cartId) return null;
        
        try {
            const response = await fetch(`${this.baseUrl}/carts/${this.cartId}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    // Carrinho não existe mais, limpar ID
                    this.cartId = null;
                    localStorage.removeItem('medusa_cart_id');
                    return null;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.cart = data.cart;
            return this.cart;
        } catch (error) {
            console.error('❌ Erro ao buscar carrinho:', error);
            return null;
        }
    }

    /**
     * Adicionar item ao carrinho
     */
    async addItem(variantId, productId, quantity = 1, buyNow = false) {
        try {
            // Garantir que temos um carrinho
            if (!this.cartId) {
                await this.createCart();
            }
            
            const response = await fetch(`${this.baseUrl}/carts/${this.cartId}/line-items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    variant_id: variantId, 
                    quantity: quantity 
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Erro ao adicionar item ao carrinho');
            }
            
            const data = await response.json();
            this.cart = data.cart;
            
            console.log('✅ Item adicionado ao carrinho:', data);
            
            // Atualizar contador
            await this.updateCartCount();
            
            // Mostrar notificação
            this.showNotification('✅ Produto adicionado ao carrinho!');
            
            // Se for compra imediata, redirecionar após 1 segundo
            if (buyNow) {
                setTimeout(() => {
                    window.location.href = '/carrinho.html';
                }, 1000);
            }
            
            return this.cart;
        } catch (error) {
            console.error('❌ Erro ao adicionar item:', error);
            this.showNotification(`❌ ${error.message || 'Erro ao adicionar produto'}`, 'error');
            throw error;
        }
    }

    /**
     * Atualizar quantidade de um item
     */
    async updateQuantity(itemId, quantity) {
        if (!this.cartId) {
            throw new Error('Carrinho não encontrado');
        }
        
        if (quantity < 1) {
            return await this.removeItem(itemId);
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/carts/${this.cartId}/line-items/${itemId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity })
            });
            
            if (!response.ok) {
                throw new Error('Erro ao atualizar quantidade');
            }
            
            const data = await response.json();
            this.cart = data.cart;
            
            // Atualizar contador
            await this.updateCartCount();
            
            return this.cart;
        } catch (error) {
            console.error('❌ Erro ao atualizar quantidade:', error);
            this.showNotification('❌ Erro ao atualizar quantidade', 'error');
            throw error;
        }
    }

    /**
     * Remover item do carrinho
     */
    async removeItem(itemId) {
        if (!this.cartId) {
            throw new Error('Carrinho não encontrado');
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/carts/${this.cartId}/line-items/${itemId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Erro ao remover item');
            }
            
            const data = await response.json();
            this.cart = data.cart;
            
            // Atualizar contador
            await this.updateCartCount();
            
            this.showNotification('✅ Item removido do carrinho');
            
            return this.cart;
        } catch (error) {
            console.error('❌ Erro ao remover item:', error);
            this.showNotification('❌ Erro ao remover item', 'error');
            throw error;
        }
    }

    /**
     * Atualizar contador do carrinho na UI
     */
    async updateCartCount() {
        try {
            const cart = await this.getCart();
            const count = cart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
            
            if (this.cartCountElement) {
                this.cartCountElement.textContent = count;
                this.cartCountElement.style.display = count > 0 ? 'flex' : 'none';
            }
            
            // Atualizar em todos os elementos com ID cartCount
            const allCartCounts = document.querySelectorAll('#cartCount');
            allCartCounts.forEach(el => {
                el.textContent = count;
                el.style.display = count > 0 ? 'flex' : 'none';
            });
            
            return count;
        } catch (error) {
            console.error('❌ Erro ao atualizar contador:', error);
            return 0;
        }
    }

    /**
     * Mostrar notificação visual
     */
    showNotification(message, type = 'success') {
        // Remover notificações anteriores
        const existing = document.querySelectorAll('.medusa-notification');
        existing.forEach(n => n.remove());
        
        // Criar notificação
        const notification = document.createElement('div');
        notification.className = `medusa-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
            </div>
        `;
        
        // Estilos inline
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 99999;
            animation: medusa-slideIn 0.3s ease;
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            font-weight: 500;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.animation = 'medusa-slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Limpar carrinho (útil para logout ou reset)
     */
    clearCart() {
        this.cartId = null;
        this.cart = null;
        localStorage.removeItem('medusa_cart_id');
        this.updateCartCount();
    }
}

// Inicializar quando o DOM carregar
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Só inicializar se não estiver na página de carrinho (ela inicializa sozinha)
        if (!window.location.pathname.includes('carrinho.html')) {
            window.medusaCart = new MedusaCart();
            window.medusaCart.init().catch(error => {
                console.error('Erro ao inicializar MedusaCart:', error);
            });
        }
    });
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MedusaCart;
}
