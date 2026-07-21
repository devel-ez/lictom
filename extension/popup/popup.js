// popup.js — Lógica da janela da extensão

document.addEventListener('DOMContentLoaded', () => {
  const versionEl = document.getElementById('version');
  const statusEl = document.getElementById('statusExt');
  const lastUpdateEl = document.getElementById('lastUpdate');
  const hasCodeEl = document.getElementById('hasCode');
  const toggleEnabled = document.getElementById('toggleEnabled');
  const toggleAutoUpdate = document.getElementById('toggleAutoUpdate');
  const btnUpdate = document.getElementById('btnUpdate');
  const btnOpenSAG = document.getElementById('btnOpenSAG');
  const updateStatusEl = document.getElementById('updateStatus');

  // Carregar status
  chrome.runtime.sendMessage({ action: 'getStatus' }, (data) => {
    if (!data) return;

    versionEl.textContent = data.version;
    toggleEnabled.checked = data.enabled;
    toggleAutoUpdate.checked = data.autoUpdate;

    if (data.hasCode) {
      hasCodeEl.textContent = 'Sim';
      hasCodeEl.className = 'status-value status-ok';
    } else {
      hasCodeEl.textContent = 'Não';
      hasCodeEl.className = 'status-value status-err';
    }

    if (data.lastUpdate) {
      const d = new Date(data.lastUpdate);
      lastUpdateEl.textContent = d.toLocaleString('pt-BR');
    } else {
      lastUpdateEl.textContent = 'Nunca';
      lastUpdateEl.className = 'status-value status-warn';
    }

    if (data.enabled) {
      statusEl.textContent = 'Ativa';
      statusEl.className = 'status-value status-ok';
    } else {
      statusEl.textContent = 'Inativa';
      statusEl.className = 'status-value status-err';
    }
  });

  // Toggle extensão habilitada
  toggleEnabled.addEventListener('change', () => {
    const val = toggleEnabled.checked;
    chrome.runtime.sendMessage({ action: 'toggleEnabled', value: val }, () => {
      statusEl.textContent = val ? 'Ativa' : 'Inativa';
      statusEl.className = val ? 'status-value status-ok' : 'status-value status-err';
    });
  });

  // Toggle auto-update
  toggleAutoUpdate.addEventListener('change', () => {
    chrome.runtime.sendMessage({ action: 'toggleAutoUpdate', value: toggleAutoUpdate.checked });
  });

  // Atualizar agora
  btnUpdate.addEventListener('click', () => {
    btnUpdate.disabled = true;
    btnUpdate.textContent = 'Atualizando...';
    showStatus('Buscando código no GitHub...', 'warn');

    chrome.runtime.sendMessage({ action: 'updateNow' }, (result) => {
      btnUpdate.disabled = false;
      btnUpdate.textContent = 'Atualizar Agora';

      if (result && result.ok) {
        showStatus('✓ Atualizado com sucesso!', 'ok');
        const d = new Date(result.lastUpdate);
        lastUpdateEl.textContent = d.toLocaleString('pt-BR');
        hasCodeEl.textContent = 'Sim';
        hasCodeEl.className = 'status-value status-ok';
      } else {
        showStatus('✗ ' + (result?.error || 'Erro desconhecido'), 'err');
      }
    });
  });

  // Abrir SAG
  btnOpenSAG.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://sag.eb.mil.br' });
  });

  function showStatus(msg, type) {
    updateStatusEl.style.display = 'block';
    updateStatusEl.textContent = msg;
    updateStatusEl.style.background = type === 'ok' ? '#dcfce7' : type === 'err' ? '#fee2e2' : '#fef3c7';
    updateStatusEl.style.color = type === 'ok' ? '#166534' : type === 'err' ? '#991b1b' : '#92400e';
    setTimeout(() => { updateStatusEl.style.display = 'none'; }, 4000);
  }
});
