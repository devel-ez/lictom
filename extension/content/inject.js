// content/inject.js — Injeta o dashboard na página do SAG

(function() {
  if (window.__sagInfInjected) return;
  window.__sagInfInjected = true;

  function isLoginPage() {
    if (document.querySelector('input[type="password"]')) return true;
    if (document.querySelector('form[action*="login"]')) return true;
    if (document.querySelector('form[action*="autentic"]')) return true;
    if (document.querySelector('#login')) return true;
    if (document.querySelector('.login-form')) return true;
    if (document.querySelector('[name="senha"]')) return true;
    return false;
  }

  function isSAGPage() {
    const url = window.location.href;
    if (url.includes('/index.php')) return false;
    if (url.includes('/login')) return false;
    if (url.includes('/logout')) return false;
    if (url.includes('/autentic')) return false;
    return true;
  }

  async function inject() {
    if (isLoginPage()) return;
    if (!isSAGPage()) return;

    const data = await chrome.storage.local.get(['enabled', 'code']);
    if (!data.enabled || !data.code) return;

    document.body.innerHTML = '';
    document.head.innerHTML = '';

    eval(data.code.replace(/^javascript:/, ''));
  }

  if (window.location.hostname === 'sag.eb.mil.br') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', inject);
    } else {
      inject();
    }
  }
})();
