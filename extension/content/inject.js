// content/inject.js — Injeta o dashboard na página do SAG

(function() {
  // Evitar injeção duplicada
  if (window.__sagInfInjected) return;
  window.__sagInfInjected = true;

  async function inject() {
    // Verificar se a extensão está habilitada
    const data = await chrome.storage.local.get(['enabled', 'code']);
    if (!data.enabled || !data.code) return;

    // Limpar a página e injetar o código
    document.body.innerHTML = '';
    document.head.innerHTML = '';

    // Executar o código do dashboard
    // Extensões Chrome podem usar eval em content scripts
    eval(data.code.replace(/^javascript:/, ''));
  }

  // Verificar se a página é o SAG e injetar
  if (window.location.hostname === 'sag.eb.mil.br') {
    // Esperar o DOM estar pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', inject);
    } else {
      inject();
    }
  }
})();
