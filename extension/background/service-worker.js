// service-worker.js — Background script: auto-update do código do GitHub

const GITHUB_URL = 'https://raw.githubusercontent.com/devel-ez/lictom/main/dist/bookmarklet.txt';
const ALARM_NAME = 'lictom-update';
const UPDATE_INTERVAL_MINUTES = 30;

// Inicializar alarme na instalação
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    enabled: true,
    autoUpdate: true,
    version: '1.0.0',
    lastUpdate: null,
    code: null
  });
  checkForUpdates();
  chrome.alarms.create(ALARM_NAME, {
    periodInMinutes: UPDATE_INTERVAL_MINUTES
  });
});

// Escutar alarmes
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    checkForUpdates();
  }
});

// Escutar mensagens do popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getStatus') {
    chrome.storage.local.get(['version', 'lastUpdate', 'enabled', 'autoUpdate', 'code'], (data) => {
      sendResponse({
        version: data.version || '1.0.0',
        lastUpdate: data.lastUpdate || null,
        enabled: data.enabled !== false,
        autoUpdate: data.autoUpdate !== false,
        hasCode: !!data.code
      });
    });
    return true; // async response
  }

  if (message.action === 'updateNow') {
    checkForUpdates().then((result) => {
      sendResponse(result);
    });
    return true;
  }

  if (message.action === 'toggleEnabled') {
    chrome.storage.local.set({ enabled: message.value });
    sendResponse({ ok: true });
    return true;
  }

  if (message.action === 'toggleAutoUpdate') {
    chrome.storage.local.set({ autoUpdate: message.value });
    if (message.value) {
      chrome.alarms.create(ALARM_NAME, { periodInMinutes: UPDATE_INTERVAL_MINUTES });
    } else {
      chrome.alarms.clear(ALARM_NAME);
    }
    sendResponse({ ok: true });
    return true;
  }
});

// Buscar atualizações do GitHub
async function checkForUpdates() {
  try {
    const response = await fetch(GITHUB_URL + '?t=' + Date.now());
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const code = await response.text();
    if (!code.startsWith('javascript:')) {
      throw new Error('Código inválido (não começa com javascript:)');
    }

    // Extrair versão do código (primeira linha como comentário) ou usar timestamp
    const now = new Date().toISOString();

    chrome.storage.local.set({
      code: code,
      lastUpdate: now,
      lastError: null
    });

    console.log('[Lictom] Código atualizado:', now);
    return { ok: true, lastUpdate: now };
  } catch (err) {
    console.error('[Lictom] Erro ao atualizar:', err.message);
    chrome.storage.local.set({ lastError: err.message });
    return { ok: false, error: err.message };
  }
}
