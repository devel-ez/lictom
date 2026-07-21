// theme.js — Dark mode toggle com persistência

const STORAGE_KEY = 'lictom_dark_mode';

export function isDarkMode() {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function toggleDarkMode() {
  const dark = !isDarkMode();
  localStorage.setItem(STORAGE_KEY, String(dark));
  aplicarTema(dark);
  return dark;
}

export function aplicarTema(dark) {
  const root = document.documentElement;
  if (dark) {
    root.style.setProperty('--bg-primary', '#1a1a2e');
    root.style.setProperty('--bg-secondary', '#16213e');
    root.style.setProperty('--bg-tertiary', '#0f3460');
    root.style.setProperty('--text-primary', '#e0e0e0');
    root.style.setProperty('--text-secondary', '#a0a0a0');
    root.style.setProperty('--border-color', '#2a2a4a');
    root.style.setProperty('--row-hover', '#1e2a4a');
    root.style.setProperty('--header-bg', '#0f3460');
    root.style.setProperty('--table-header', '#16213e');
    root.style.setProperty('--table-border', '#2a2a4a');
    root.style.setProperty('--input-bg', '#1e2a4a');
    root.style.setProperty('--input-text', '#e0e0e0');
    root.style.setProperty('--card-bg', '#16213e');
    root.style.setProperty('--accent-green', '#4ade80');
    root.style.setProperty('--accent-red', '#f87171');
    root.style.setProperty('--accent-blue', '#60a5fa');
    root.style.setProperty('--warning-bg', '#78350f');
    root.style.setProperty('--warning-text', '#fde68a');
    root.style.setProperty('--warning-border', '#92400e');
    document.body.classList.add('dark-mode');
  } else {
    root.style.setProperty('--bg-primary', '#f0f2f5');
    root.style.setProperty('--bg-secondary', '#ffffff');
    root.style.setProperty('--bg-tertiary', '#f8fafc');
    root.style.setProperty('--text-primary', '#1e293b');
    root.style.setProperty('--text-secondary', '#64748b');
    root.style.setProperty('--border-color', '#e2e8f0');
    root.style.setProperty('--row-hover', '#f0f8ff');
    root.style.setProperty('--header-bg', 'linear-gradient(135deg,#1e3a5f 0%,#2d5a87 100%)');
    root.style.setProperty('--table-header', '#cbd5e1');
    root.style.setProperty('--table-border', '#b0bec5');
    root.style.setProperty('--input-bg', '#ffffff');
    root.style.setProperty('--input-text', '#333333');
    root.style.setProperty('--card-bg', '#ffffff');
    root.style.setProperty('--accent-green', '#27ae60');
    root.style.setProperty('--accent-red', '#c0392b');
    root.style.setProperty('--accent-blue', '#2563eb');
    root.style.setProperty('--warning-bg', '#fef3c7');
    root.style.setProperty('--warning-text', '#92400e');
    root.style.setProperty('--warning-border', '#fde68a');
    document.body.classList.remove('dark-mode');
  }
}

// Inicializar tema
aplicarTema(isDarkMode());
