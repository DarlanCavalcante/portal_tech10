/**
 * Modal Manager - Sistema Unificado de Gerenciamento de Modais
 * @version 2.0.0
 * @description Gerencia todos os modais do sistema com suporte a múltiplos modais,
 * acessibilidade, animações e eventos personalizados
 */

class ModalManager {
  constructor() {
    this.activeModals = new Map();
    this.config = {
      animationDuration: 300,
      closeOnEsc: true,
      closeOnBackdrop: true,
      preventBodyScroll: true,
      focusTrap: true
    };
    
    this.init();
  }

  /**
   * Inicializa o gerenciador de modais
   */
  init() {
    // Listener global para ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.config.closeOnEsc) {
        this.closeTopModal();
      }
    });

    // Listener para cliques no backdrop
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal') && this.config.closeOnBackdrop) {
        const modalId = e.target.id;
        if (modalId) {
          this.close(modalId);
        }
      }
    });
  }

  /**
   * Abre um modal
   * @param {string} modalId - ID do modal
   * @param {Object} options - Opções de configuração
   * @returns {Promise} - Resolve quando o modal estiver aberto
   */
  async open(modalId, options = {}) {
    try {
      const modal = document.getElementById(modalId);
      
      if (!modal) {
        throw new Error(`Modal '${modalId}' não encontrado no DOM`);
      }

      // Verificar se o modal já está aberto
      if (this.activeModals.has(modalId)) {
        console.warn(`Modal '${modalId}' já está aberto`);
        return;
      }

      // Merge de configurações
      const config = { ...this.config, ...options };

      // Prevenir scroll do body se configurado
      if (config.preventBodyScroll && this.activeModals.size === 0) {
        document.body.style.overflow = 'hidden';
      }

      // Configurar atributos de acessibilidade
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-hidden', 'false');

      // Exibir modal
      modal.style.display = 'block';

      // Trigger animação de entrada
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          modal.classList.add('modal-open');
          setTimeout(resolve, config.animationDuration);
        });
      });

      // Focar no primeiro elemento focável
      if (config.focusTrap) {
        this.focusFirstElement(modal);
      }

      // Registrar modal ativo
      this.activeModals.set(modalId, {
        element: modal,
        config,
        openedAt: Date.now()
      });

      // Disparar evento customizado
      this.dispatchEvent(modalId, 'opened');

      return modal;

    } catch (error) {
      console.error('Erro ao abrir modal:', error);
      throw error;
    }
  }

  /**
   * Fecha um modal
   * @param {string} modalId - ID do modal
   * @returns {Promise} - Resolve quando o modal estiver fechado
   */
  async close(modalId) {
    try {
      if (!this.activeModals.has(modalId)) {
        console.warn(`Modal '${modalId}' não está aberto`);
        return;
      }

      const { element: modal, config } = this.activeModals.get(modalId);

      // Trigger animação de saída
      modal.classList.remove('modal-open');

      await new Promise(resolve => {
        setTimeout(() => {
          modal.style.display = 'none';
          modal.setAttribute('aria-hidden', 'true');
          resolve();
        }, config.animationDuration);
      });

      // Remover do registro
      this.activeModals.delete(modalId);

      // Restaurar scroll do body se não há mais modais
      if (this.activeModals.size === 0 && config.preventBodyScroll) {
        document.body.style.overflow = '';
      }

      // Disparar evento customizado
      this.dispatchEvent(modalId, 'closed');

    } catch (error) {
      console.error('Erro ao fechar modal:', error);
      throw error;
    }
  }

  /**
   * Fecha o modal mais recentemente aberto
   */
  closeTopModal() {
    if (this.activeModals.size === 0) return;
    
    const modals = Array.from(this.activeModals.entries());
    const [latestModalId] = modals[modals.length - 1];
    this.close(latestModalId);
  }

  /**
   * Fecha todos os modais abertos
   */
  closeAll() {
    const modalIds = Array.from(this.activeModals.keys());
    modalIds.forEach(id => this.close(id));
  }

  /**
   * Toggle modal (abre se fechado, fecha se aberto)
   * @param {string} modalId - ID do modal
   */
  toggle(modalId) {
    if (this.activeModals.has(modalId)) {
      this.close(modalId);
    } else {
      this.open(modalId);
    }
  }

  /**
   * Verifica se um modal está aberto
   * @param {string} modalId - ID do modal
   * @returns {boolean}
   */
  isOpen(modalId) {
    return this.activeModals.has(modalId);
  }

  /**
   * Cria um modal dinâmico
   * @param {Object} options - Configurações do modal
   * @returns {string} - ID do modal criado
   */
  create(options = {}) {
    const {
      id = `modal-${Date.now()}`,
      title = '',
      content = '',
      footer = '',
      className = '',
      closeButton = true
    } = options;

    // Verificar se já existe
    if (document.getElementById(id)) {
      throw new Error(`Modal com ID '${id}' já existe`);
    }

    const modal = document.createElement('div');
    modal.id = id;
    modal.className = `modal ${className}`;
    modal.setAttribute('aria-hidden', 'true');

    modal.innerHTML = `
      <div class="modal-content">
        ${title ? `
          <div class="modal-header">
            <h3>${title}</h3>
            ${closeButton ? `
              <button class="modal-close" aria-label="Fechar modal">
                <i class="fas fa-times"></i>
              </button>
            ` : ''}
          </div>
        ` : ''}
        
        <div class="modal-body">
          ${content}
        </div>
        
        ${footer ? `
          <div class="modal-footer">
            ${footer}
          </div>
        ` : ''}
      </div>
    `;

    // Adicionar event listener no botão de fechar
    if (closeButton) {
      const closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.close(id));
      }
    }

    document.body.appendChild(modal);
    return id;
  }

  /**
   * Remove um modal do DOM
   * @param {string} modalId - ID do modal
   */
  destroy(modalId) {
    // Fechar se estiver aberto
    if (this.activeModals.has(modalId)) {
      this.close(modalId);
    }

    const modal = document.getElementById(modalId);
    if (modal) {
      modal.remove();
    }
  }

  /**
   * Foca no primeiro elemento focável do modal
   * @param {HTMLElement} modal - Elemento do modal
   */
  focusFirstElement(modal) {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  /**
   * Dispara um evento customizado
   * @param {string} modalId - ID do modal
   * @param {string} eventName - Nome do evento
   * @param {Object} detail - Detalhes do evento
   */
  dispatchEvent(modalId, eventName, detail = {}) {
    const event = new CustomEvent(`modal:${eventName}`, {
      detail: { modalId, ...detail }
    });
    document.dispatchEvent(event);
  }

  /**
   * Registra um listener para eventos de modal
   * @param {string} eventName - Nome do evento (opened, closed, etc)
   * @param {Function} callback - Função de callback
   */
  on(eventName, callback) {
    document.addEventListener(`modal:${eventName}`, callback);
  }

  /**
   * Remove um listener de eventos de modal
   * @param {string} eventName - Nome do evento
   * @param {Function} callback - Função de callback
   */
  off(eventName, callback) {
    document.removeEventListener(`modal:${eventName}`, callback);
  }

  /**
   * Cria modal de confirmação
   * @param {Object} options - Opções do modal
   * @returns {Promise<boolean>} - Resolve com true se confirmado
   */
  confirm(options = {}) {
    return new Promise((resolve) => {
      const {
        title = 'Confirmação',
        message = 'Tem certeza?',
        confirmText = 'Confirmar',
        cancelText = 'Cancelar',
        type = 'warning'
      } = options;

      const modalId = this.create({
        id: `confirm-${Date.now()}`,
        title,
        content: `<p style="margin: 1rem 0;">${message}</p>`,
        footer: `
          <button class="btn btn-secondary" data-action="cancel">
            ${cancelText}
          </button>
          <button class="btn btn-${type}" data-action="confirm">
            ${confirmText}
          </button>
        `,
        closeButton: true
      });

      const modal = document.getElementById(modalId);

      // Event handlers
      modal.addEventListener('click', (e) => {
        const action = e.target.getAttribute('data-action');
        
        if (action === 'confirm') {
          this.destroy(modalId);
          resolve(true);
        } else if (action === 'cancel') {
          this.destroy(modalId);
          resolve(false);
        }
      });

      // Abrir modal
      this.open(modalId);

      // Resolver com false se fechar sem ação
      this.on('closed', (e) => {
        if (e.detail.modalId === modalId) {
          resolve(false);
        }
      });
    });
  }

  /**
   * Cria modal de alerta
   * @param {String|Object} messageOrOptions - Mensagem ou objeto de opções
   * @param {String} type - Tipo do alerta (info, success, warning, error)
   * @returns {Promise} - Resolve quando o modal for fechado
   */
  alert(messageOrOptions = {}, type = 'info') {
    return new Promise((resolve) => {
      // Suportar ambos os formatos: alert(message, type) e alert({message, type})
      let options = {};
      
      if (typeof messageOrOptions === 'string') {
        // Formato: alert('mensagem', 'success')
        options = {
          message: messageOrOptions,
          type: type
        };
      } else if (typeof messageOrOptions === 'object') {
        // Formato: alert({message: 'mensagem', type: 'success'})
        options = messageOrOptions;
      }
      
      const {
        title = 'Aviso',
        message = '',
        okText = 'OK',
        type: alertType = 'info'
      } = options;

      const modalId = this.create({
        id: `alert-${Date.now()}`,
        title,
        content: `<p style="margin: 1rem 0;">${message}</p>`,
        footer: `
          <button class="btn btn-${alertType}" data-action="ok">
            ${okText}
          </button>
        `
      });

      const modal = document.getElementById(modalId);

      // Event handler
      modal.addEventListener('click', (e) => {
        if (e.target.getAttribute('data-action') === 'ok') {
          this.destroy(modalId);
          resolve();
        }
      });

      this.open(modalId);
    });
  }

  /**
   * Retorna estatísticas dos modais
   * @returns {Object} - Objeto com estatísticas
   */
  getStats() {
    return {
      totalActive: this.activeModals.size,
      activeModals: Array.from(this.activeModals.keys()),
      bodyScrollLocked: document.body.style.overflow === 'hidden'
    };
  }
}

// Instância global
const modalManager = new ModalManager();

// Expor globalmente
if (typeof window !== 'undefined') {
  window.modalManager = modalManager;
}

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModalManager;
}
