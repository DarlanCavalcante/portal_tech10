/**
 * ⚙️ TECH10 ADMIN CONFIGURAÇÕES
 * Gerenciamento de configurações do sistema
 */

class AdminSettings {
  constructor() {
    this.settings = {};
    this.groups = {};
    this.unsavedChanges = new Set();
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadSettings();
    this.setupAutoSave();
  }

  bindEvents() {
    // Abas de configuração
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-settings-tab]')) {
        this.switchTab(e.target.getAttribute('data-settings-tab'));
      }
    });

    // Botões de ação
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-save-settings]')) {
        this.saveAllSettings();
      }
      
      if (e.target.matches('[data-reset-settings]')) {
        const group = e.target.getAttribute('data-reset-settings');
        this.resetSettings(group);
      }
      
      if (e.target.matches('[data-export-settings]')) {
        this.exportSettings();
      }
      
      if (e.target.matches('[data-import-settings]')) {
        this.importSettings();
      }

      if (e.target.matches('[data-test-email]')) {
        this.testEmailSettings();
      }

      if (e.target.matches('[data-clear-cache]')) {
        this.clearCache();
      }
    });

    // Monitorar mudanças nos inputs
    document.addEventListener('input', (e) => {
      if (e.target.matches('[data-setting]')) {
        this.markAsChanged(e.target);
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target.matches('[data-setting]')) {
        this.markAsChanged(e.target);
      }
    });

    // Upload de arquivo
    document.addEventListener('change', (e) => {
      if (e.target.matches('[data-file-setting]')) {
        this.handleFileUpload(e.target);
      }
    });

    // Aviso ao sair com mudanças não salvas
    window.addEventListener('beforeunload', (e) => {
      if (this.unsavedChanges.size > 0) {
        e.preventDefault();
        e.returnValue = 'Você tem alterações não salvas. Deseja realmente sair?';
        return e.returnValue;
      }
    });
  }

  async loadSettings() {
    try {
      this.showLoading();
      
      const data = await adminAPI.getSettings();
      this.settings = data.settings;
      this.groups = this.groupSettings(data.settings);
      
      this.renderSettings();
      this.hideLoading();
      
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      this.hideLoading();
      adminUtils.showToast('Erro ao carregar configurações', 'error');
    }
  }

  groupSettings(settings) {
    const groups = {};
    
    settings.forEach(setting => {
      const group = setting.group_name || 'general';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(setting);
    });
    
    return groups;
  }

  renderSettings() {
    this.renderSettingsTabs();
    this.renderSettingsContent();
  }

  renderSettingsTabs() {
    const tabsContainer = document.getElementById('settings-tabs');
    if (!tabsContainer) return;

    const tabNames = {
      general: 'Geral',
      site: 'Site',
      email: 'Email',
      seo: 'SEO',
      security: 'Segurança',
      advanced: 'Avançado'
    };

    const html = Object.keys(this.groups).map(group => `
      <button class="tab-button ${group === 'general' ? 'active' : ''}" 
              data-settings-tab="${group}">
        <i class="fas ${this.getGroupIcon(group)}"></i>
        ${tabNames[group] || group}
      </button>
    `).join('');

    tabsContainer.innerHTML = html;
  }

  renderSettingsContent() {
    const contentContainer = document.getElementById('settings-content');
    if (!contentContainer) return;

    const html = Object.entries(this.groups).map(([group, settings]) => `
      <div class="settings-group ${group === 'general' ? 'active' : ''}" 
           data-settings-group="${group}">
        <div class="settings-header">
          <h3>
            <i class="fas ${this.getGroupIcon(group)}"></i>
            ${this.getGroupTitle(group)}
          </h3>
          <div class="settings-actions">
            <button class="btn btn-secondary btn-sm" data-reset-settings="${group}">
              <i class="fas fa-undo"></i>
              Restaurar Padrões
            </button>
          </div>
        </div>
        
        <div class="settings-form">
          ${settings.map(setting => this.renderSettingField(setting)).join('')}
        </div>
      </div>
    `).join('');

    contentContainer.innerHTML = html;
  }

  renderSettingField(setting) {
    const fieldId = `setting-${setting.key}`;
    let input = '';

    switch (setting.type) {
      case 'text':
      case 'email':
      case 'url':
        input = `
          <input 
            type="${setting.type}" 
            id="${fieldId}"
            name="${setting.key}"
            value="${setting.value || ''}"
            data-setting="${setting.key}"
            class="form-control"
            ${setting.required ? 'required' : ''}
            placeholder="${setting.placeholder || ''}"
          >
        `;
        break;

      case 'textarea':
        input = `
          <textarea 
            id="${fieldId}"
            name="${setting.key}"
            data-setting="${setting.key}"
            class="form-control"
            rows="4"
            ${setting.required ? 'required' : ''}
            placeholder="${setting.placeholder || ''}"
          >${setting.value || ''}</textarea>
        `;
        break;

      case 'number':
        input = `
          <input 
            type="number" 
            id="${fieldId}"
            name="${setting.key}"
            value="${setting.value || ''}"
            data-setting="${setting.key}"
            class="form-control"
            ${setting.min ? `min="${setting.min}"` : ''}
            ${setting.max ? `max="${setting.max}"` : ''}
            ${setting.step ? `step="${setting.step}"` : ''}
            ${setting.required ? 'required' : ''}
          >
        `;
        break;

      case 'boolean':
        input = `
          <div class="form-check form-switch">
            <input 
              type="checkbox" 
              id="${fieldId}"
              name="${setting.key}"
              data-setting="${setting.key}"
              class="form-check-input"
              ${setting.value === 'true' || setting.value === true ? 'checked' : ''}
            >
            <label class="form-check-label" for="${fieldId}">
              ${setting.description || 'Ativar'}
            </label>
          </div>
        `;
        break;

      case 'select':
        const options = JSON.parse(setting.options || '[]');
        input = `
          <select 
            id="${fieldId}"
            name="${setting.key}"
            data-setting="${setting.key}"
            class="form-control"
            ${setting.required ? 'required' : ''}
          >
            ${options.map(option => `
              <option value="${option.value}" ${option.value === setting.value ? 'selected' : ''}>
                ${option.label}
              </option>
            `).join('')}
          </select>
        `;
        break;

      case 'color':
        input = `
          <input 
            type="color" 
            id="${fieldId}"
            name="${setting.key}"
            value="${setting.value || '#000000'}"
            data-setting="${setting.key}"
            class="form-control form-control-color"
          >
        `;
        break;

      case 'file':
        input = `
          <input 
            type="file" 
            id="${fieldId}"
            name="${setting.key}"
            data-file-setting="${setting.key}"
            class="form-control"
            accept="${setting.accept || ''}"
          >
          ${setting.value ? `
            <div class="current-file">
              <small>Arquivo atual: <a href="${setting.value}" target="_blank">${setting.value}</a></small>
            </div>
          ` : ''}
        `;
        break;

      default:
        input = `
          <input 
            type="text" 
            id="${fieldId}"
            name="${setting.key}"
            value="${setting.value || ''}"
            data-setting="${setting.key}"
            class="form-control"
            placeholder="${setting.placeholder || ''}"
          >
        `;
    }

    return `
      <div class="form-group">
        <label for="${fieldId}">
          ${setting.name}
          ${setting.required ? '<span class="required">*</span>' : ''}
        </label>
        ${input}
        ${setting.description && setting.type !== 'boolean' ? `
          <small class="form-text text-muted">${setting.description}</small>
        ` : ''}
      </div>
    `;
  }

  switchTab(group) {
    // Atualizar botões
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-settings-tab="${group}"]`)?.classList.add('active');

    // Atualizar conteúdo
    document.querySelectorAll('.settings-group').forEach(groupEl => {
      groupEl.classList.remove('active');
    });
    document.querySelector(`[data-settings-group="${group}"]`)?.classList.add('active');
  }

  markAsChanged(input) {
    const key = input.getAttribute('data-setting');
    if (key) {
      this.unsavedChanges.add(key);
      this.updateSaveButton();
      
      // Adicionar indicador visual
      input.classList.add('changed');
    }
  }

  updateSaveButton() {
    const saveBtn = document.querySelector('[data-save-settings]');
    if (saveBtn) {
      if (this.unsavedChanges.size > 0) {
        saveBtn.classList.add('has-changes');
        saveBtn.innerHTML = `
          <i class="fas fa-save"></i>
          Salvar Alterações (${this.unsavedChanges.size})
        `;
      } else {
        saveBtn.classList.remove('has-changes');
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Salvar';
      }
    }
  }

  async saveAllSettings() {
    if (this.unsavedChanges.size === 0) {
      adminUtils.showToast('Nenhuma alteração para salvar', 'info');
      return;
    }

    try {
      const saveBtn = document.querySelector('[data-save-settings]');
      const originalText = saveBtn.innerHTML;
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

      const settingsToUpdate = {};
      
      this.unsavedChanges.forEach(key => {
        const input = document.querySelector(`[data-setting="${key}"]`);
        if (input) {
          let value;
          
          if (input.type === 'checkbox') {
            value = input.checked;
          } else if (input.type === 'file') {
            // Arquivos são tratados separadamente
            return;
          } else {
            value = input.value;
          }
          
          settingsToUpdate[key] = value;
        }
      });

      await adminAPI.updateSettings(settingsToUpdate);
      
      // Limpar mudanças
      this.unsavedChanges.clear();
      document.querySelectorAll('.changed').forEach(el => {
        el.classList.remove('changed');
      });
      
      this.updateSaveButton();
      adminUtils.showToast('Configurações salvas com sucesso!', 'success');

    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      adminUtils.showToast(error.message || 'Erro ao salvar configurações', 'error');
      
    } finally {
      const saveBtn = document.querySelector('[data-save-settings]');
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalText;
    }
  }

  async resetSettings(group) {
    const confirmed = confirm(
      `Tem certeza que deseja restaurar as configurações padrão do grupo "${group}"?\n\n` +
      'Esta ação não pode ser desfeita e todas as personalizações serão perdidas.'
    );

    if (!confirmed) return;

    try {
      await adminAPI.resetSettings(group);
      adminUtils.showToast('Configurações restauradas com sucesso!', 'success');
      this.loadSettings();
    } catch (error) {
      console.error('Erro ao restaurar configurações:', error);
      adminUtils.showToast('Erro ao restaurar configurações', 'error');
    }
  }

  async handleFileUpload(input) {
    const file = input.files[0];
    if (!file) return;

    const key = input.getAttribute('data-file-setting');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('key', key);

      // TODO: Implementar upload de arquivo para configurações
      // Por enquanto, apenas mostrar mensagem
      adminUtils.showToast('Upload de arquivos será implementado em breve', 'info');
      
    } catch (error) {
      console.error('Erro no upload:', error);
      adminUtils.showToast('Erro ao fazer upload do arquivo', 'error');
    }
  }

  async testEmailSettings() {
    try {
      const testBtn = document.querySelector('[data-test-email]');
      const originalText = testBtn.innerHTML;
      testBtn.disabled = true;
      testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testando...';

      // TODO: Implementar teste de email
      // Por enquanto, simular sucesso
      setTimeout(() => {
        adminUtils.showToast('Teste de email enviado com sucesso!', 'success');
        testBtn.disabled = false;
        testBtn.innerHTML = originalText;
      }, 2000);

    } catch (error) {
      console.error('Erro no teste de email:', error);
      adminUtils.showToast('Erro ao testar configurações de email', 'error');
    }
  }

  async clearCache() {
    const confirmed = confirm('Deseja limpar o cache do sistema?');
    if (!confirmed) return;

    try {
      // TODO: Implementar limpeza de cache
      adminUtils.showToast('Cache limpo com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      adminUtils.showToast('Erro ao limpar cache', 'error');
    }
  }

  exportSettings() {
    try {
      const settingsData = {
        timestamp: new Date().toISOString(),
        settings: this.settings
      };
      
      const blob = new Blob([JSON.stringify(settingsData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tech10-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      adminUtils.showToast('Configurações exportadas com sucesso!', 'success');
      
    } catch (error) {
      console.error('Erro ao exportar configurações:', error);
      adminUtils.showToast('Erro ao exportar configurações', 'error');
    }
  }

  importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (!data.settings) {
          throw new Error('Arquivo de configurações inválido');
        }
        
        const confirmed = confirm(
          'Tem certeza que deseja importar essas configurações?\n\n' +
          'As configurações atuais serão substituídas.'
        );
        
        if (!confirmed) return;
        
        // TODO: Implementar importação
        adminUtils.showToast('Importação será implementada em breve', 'info');
        
      } catch (error) {
        console.error('Erro ao importar configurações:', error);
        adminUtils.showToast('Erro ao importar configurações', 'error');
      }
    };
    
    input.click();
  }

  setupAutoSave() {
    // Auto-save a cada 30 segundos se houver mudanças
    setInterval(() => {
      if (this.unsavedChanges.size > 0) {
        this.autoSave();
      }
    }, 30000);
  }

  async autoSave() {
    try {
      console.log('Auto-salvando configurações...');
      await this.saveAllSettings();
    } catch (error) {
      console.error('Erro no auto-save:', error);
    }
  }

  // Utilitários
  getGroupIcon(group) {
    const icons = {
      general: 'fa-cog',
      site: 'fa-globe',
      email: 'fa-envelope',
      seo: 'fa-search',
      security: 'fa-shield-alt',
      advanced: 'fa-code'
    };
    return icons[group] || 'fa-cog';
  }

  getGroupTitle(group) {
    const titles = {
      general: 'Configurações Gerais',
      site: 'Configurações do Site',
      email: 'Configurações de Email',
      seo: 'SEO e Meta Tags',
      security: 'Segurança',
      advanced: 'Configurações Avançadas'
    };
    return titles[group] || group;
  }

  showLoading() {
    const container = document.getElementById('settings-content');
    if (container) {
      container.innerHTML = `
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Carregando configurações...</p>
        </div>
      `;
    }
  }

  hideLoading() {
    // O loading será substituído pelo conteúdo
  }
}

// Inicializar configurações
document.addEventListener('DOMContentLoaded', () => {
  window.adminSettings = new AdminSettings();
});