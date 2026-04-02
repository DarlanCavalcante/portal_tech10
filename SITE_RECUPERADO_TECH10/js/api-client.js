// API Client para comunicação com o Backend
const API_URL = 'http://localhost:9000/store';

class TechAPI {
  // Produtos
  static async getProducts(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}/products?${queryString}`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
  }

  static async getProduct(id) {
    try {
      const response = await fetch(`${API_URL}/products/${id}`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return null;
    }
  }

  static async getFeaturedProducts() {
    try {
      const response = await fetch(`${API_URL}/products?featured=true&limit=6`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar produtos em destaque:', error);
      return [];
    }
  }

  // Categorias
  static async getCategories(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}/categories?${queryString}`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  }

  static async getCategory(id) {
    try {
      const response = await fetch(`${API_URL}/categories/${id}`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      return null;
    }
  }

  static async getCategoryStats(id) {
    try {
      const response = await fetch(`${API_URL}/categories/${id}/stats`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar estatísticas da categoria:', error);
      return null;
    }
  }

  // Configurações
  static async getSettings(group = null) {
    try {
      const url = group ? `${API_URL}/settings?group=${group}` : `${API_URL}/settings`;
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return [];
    }
  }

  static async getPublicSettings() {
    try {
      const response = await fetch(`${API_URL}/settings/public`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar configurações públicas:', error);
      return [];
    }
  }

  static async getSetting(key) {
    try {
      const response = await fetch(`${API_URL}/settings/${key}`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      return null;
    }
  }

  // Busca
  static async searchProducts(query) {
    try {
      const response = await fetch(`${API_URL}/products?search=${encodeURIComponent(query)}`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
  }

  // Utilitários
  static formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  static formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.TechAPI = TechAPI;
}
