/**
 * 🧪 TESTE BÁSICO DO SISTEMA ADMIN
 * Script para verificar se todos os componentes estão funcionando
 */

// Aguardar DOM carregar
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Tech10 Admin - Iniciando sistema...');
  
  // Verificar se os objetos globais foram criados
  setTimeout(() => {
    console.log('📊 Verificando componentes:');
    
    const components = {
      'AdminAPI': window.adminAPI,
      'AdminAuth': window.adminAuth,
      'AdminUtils': window.adminUtils,
      'AdminDashboard': window.adminDashboard,
      'AdminProducts': window.adminProducts,
      'AdminCategories': window.adminCategories,
      'AdminSettings': window.adminSettings,
      'AdminMain': window.adminMain
    };
    
    Object.entries(components).forEach(([name, component]) => {
      if (component) {
        console.log(`✅ ${name} - OK`);
      } else {
        console.log(`❌ ${name} - ERRO`);
      }
    });
    
    // Verificar autenticação
    if (window.adminAuth) {
      console.log('🔐 Verificando autenticação...');
      adminAuth.checkAuthStatus();
    }
    
    console.log('🎯 Sistema Admin Tech10 carregado!');
  }, 500);
});

// Log de eventos importantes
document.addEventListener('sectionChange', (e) => {
  console.log(`📄 Mudança de seção: ${e.detail.previous} → ${e.detail.current}`);
});

// Log de erros globais
window.addEventListener('error', (e) => {
  console.error('💥 Erro global:', e.error);
});

// Função de teste manual
window.testAdmin = () => {
  console.log('🧪 Executando testes...');
  
  // Teste de toast
  if (window.adminUtils) {
    adminUtils.showToast('Teste de notificação!', 'success');
  }
  
  // Teste de modal
  if (window.adminUtils) {
    setTimeout(() => {
      adminUtils.showConfirm('Este é um teste de confirmação', {
        title: 'Teste',
        confirmText: 'OK',
        cancelText: 'Cancelar'
      }).then(result => {
        console.log('Resultado do teste:', result);
      });
    }, 1000);
  }
  
  console.log('✅ Testes executados!');
};