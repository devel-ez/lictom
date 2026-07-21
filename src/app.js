// app.js — Orquestrador principal (HTML + inicialização)

import { buscarDados } from './api.js';
import { setDados, renderTabela, filtrarDados, exportarCSV, ordenarTabela, setLimiteVisual } from './ui.js';
import { isDarkMode, toggleDarkMode, aplicarTema } from './theme.js';

const STYLE = `
  :root {
    --bg-primary: #f0f2f5;
    --bg-secondary: #ffffff;
    --bg-tertiary: #f8fafc;
    --text-primary: #1e293b;
    --text-secondary: #64748b;
    --border-color: #e2e8f0;
    --row-hover: #f0f8ff;
    --header-bg: linear-gradient(135deg,#1e3a5f 0%,#2d5a87 100%);
    --table-header: #cbd5e1;
    --table-border: #b0bec5;
    --input-bg: #ffffff;
    --input-text: #333333;
    --card-bg: #ffffff;
    --accent-green: #27ae60;
    --accent-red: #c0392b;
    --accent-blue: #2563eb;
    --warning-bg: #fef3c7;
    --warning-text: #92400e;
    --warning-border: #fde68a;
    --yellow-input: #fef9c3;
    --yellow-cell: #fff9e6;
    --sidebar-bg: #1e293b;
    --sidebar-text: #94a3b8;
    --sidebar-active: #2563eb;
    --sidebar-hover: #334155;
    --sidebar-width: 220px;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', system-ui, Arial, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  /* Sidebar */
  #sidebar {
    width: var(--sidebar-width);
    min-width: var(--sidebar-width);
    background: var(--sidebar-bg);
    display: flex;
    flex-direction: column;
    z-index: 20;
    box-shadow: 2px 0 8px rgba(0,0,0,0.15);
  }
  .sidebar-header {
    padding: 20px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .sidebar-header h1 {
    font-size: 18px;
    font-weight: 800;
    color: white;
    margin: 0;
  }
  .sidebar-header span {
    font-size: 11px;
    color: var(--sidebar-text);
    opacity: 0.7;
  }
  .sidebar-nav {
    flex: 1;
    padding: 12px 8px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .sidebar-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: var(--sidebar-text);
    transition: all 0.15s;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
  }
  .sidebar-item:hover {
    background: var(--sidebar-hover);
    color: white;
  }
  .sidebar-item.active {
    background: var(--sidebar-active);
    color: white;
    font-weight: 600;
  }
  .sidebar-item .icon {
    font-size: 18px;
    width: 24px;
    text-align: center;
  }
  .sidebar-footer {
    padding: 12px 16px;
    border-top: 1px solid rgba(255,255,255,0.08);
    font-size: 11px;
    color: var(--sidebar-text);
    opacity: 0.5;
    text-align: center;
  }

  /* Main content */
  #main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
  }

  /* Pages */
  .page {
    display: none;
    flex-direction: column;
    height: 100%;
  }
  .page.active {
    display: flex;
  }

  /* Saldos page specific */
  .page-header {
    background: var(--header-bg);
    padding: 12px 20px;
    color: white;
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }

  /* Placeholder page */
  .placeholder {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: var(--text-secondary);
  }
  .placeholder .icon { font-size: 48px; opacity: 0.4; }
  .placeholder h3 { font-size: 18px; color: var(--text-primary); }
  .placeholder p { font-size: 14px; }

  th { cursor: pointer; user-select: none; transition: background 0.15s; }
  th:hover { background-color: #8ec8c9 !important; }
  .input-qtd {
    width: 70px; padding: 4px 6px;
    border: 1px solid var(--border-color);
    text-align: center; color: var(--input-text);
    font-weight: bold; border-radius: 3px; font-size: 13px;
    background: var(--input-bg);
  }
  .input-qtd:focus { outline: 2px solid var(--accent-blue); border-color: var(--accent-blue); }
  .btn {
    padding: 6px 14px; border: none; border-radius: 5px;
    cursor: pointer; font-weight: 600; font-size: 13px;
    transition: all 0.2s; display: inline-flex; align-items: center; gap: 4px;
  }
  .btn:hover { opacity: 0.85; transform: translateY(-1px); }
  .btn-danger { background: #dc2626; color: white; }
  .btn-success { background: #16a34a; color: white; }
  .btn-primary { background: #2563eb; color: white; }
  .btn-ghost {
    background: rgba(255,255,255,0.15); color: white;
    border: 1px solid rgba(255,255,255,0.3);
  }
  .btn-ghost:hover { background: rgba(255,255,255,0.25); }
  #loading-overlay {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    position: fixed; inset: 0; background: var(--bg-primary); z-index: 100;
  }
  .spinner {
    width: 48px; height: 48px; border: 5px solid var(--border-color);
    border-top-color: var(--accent-blue); border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  #loading-text { margin-top: 16px; color: var(--text-primary); font-size: 15px; font-weight: 500; }
  #avisoTruncamento {
    display: none; background: var(--warning-bg); color: var(--warning-text);
    padding: 8px 16px; font-size: 13px; font-weight: 500;
    border-bottom: 1px solid var(--warning-border);
  }
  #config-panel {
    display: none; position: fixed; top: 0; right: 0; width: 320px; height: 100vh;
    background: var(--card-bg); border-left: 1px solid var(--border-color);
    box-shadow: -4px 0 20px rgba(0,0,0,0.15); z-index: 50;
    padding: 24px; overflow-y: auto;
  }
  #config-panel.open { display: block; }
  #config-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(0,0,0,0.3); z-index: 40;
  }
  #config-overlay.open { display: block; }
  .config-group { margin-bottom: 20px; }
  .config-label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .config-input {
    width: 100%; padding: 8px 12px; border: 1px solid var(--border-color);
    border-radius: 6px; font-size: 14px; background: var(--input-bg);
    color: var(--input-text);
  }
  .config-input:focus { outline: 2px solid var(--accent-blue); border-color: var(--accent-blue); }
  .toggle-switch {
    position: relative; display: inline-block; width: 44px; height: 24px;
  }
  .toggle-switch input { opacity: 0; width: 0; height: 0; }
  .toggle-slider {
    position: absolute; cursor: pointer; inset: 0;
    background: #ccc; border-radius: 24px; transition: 0.3s;
  }
  .toggle-slider:before {
    content: ""; position: absolute; height: 18px; width: 18px;
    left: 3px; bottom: 3px; background: white; border-radius: 50%;
    transition: 0.3s;
  }
  .toggle-switch input:checked + .toggle-slider { background: var(--accent-blue); }
  .toggle-switch input:checked + .toggle-slider:before { transform: translateX(20px); }
`;

const HTML = `
<div id="loading-overlay">
  <div class="spinner"></div>
  <div id="loading-text">Carregando dados do SAG...</div>
</div>

<style>${STYLE}</style>

<!-- Config Overlay -->
<div id="config-overlay" onclick="window.__app.toggleConfig()"></div>

<!-- Config Panel -->
<div id="config-panel">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
    <h3 style="font-size:16px;font-weight:700;">Configurações</h3>
    <button class="btn btn-danger" style="padding:4px 10px;font-size:12px;" onclick="window.__app.toggleConfig()">✕</button>
  </div>

  <div class="config-group">
    <div class="config-label">Modo Escuro</div>
    <div style="display:flex;align-items:center;gap:12px;">
      <label class="toggle-switch">
        <input type="checkbox" id="darkModeToggle" onchange="window.__app.toggleDark()">
        <span class="toggle-slider"></span>
      </label>
      <span style="font-size:13px;" id="darkModeLabel">Desligado</span>
    </div>
  </div>

  <div class="config-group">
    <div class="config-label">Máximo de Linhas Visíveis</div>
    <input type="number" class="config-input" id="limiteInput" value="500" min="50" max="50000" step="50"
      onchange="window.__app.updateLimite(this.value)">
    <div style="font-size:11px;color:var(--text-secondary);margin-top:4px;">Padrão: 500. Aumente se precisar ver mais itens.</div>
  </div>

  <div class="config-group">
    <div class="config-label">Sobre</div>
    <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">
      <strong>Lictom</strong> v1.0<br>
      Controle de Saldos de Pregão<br>
      23ª Esqd C Sl
    </div>
  </div>
</div>

<!-- Sidebar -->
<div id="sidebar">
  <div class="sidebar-header">
    <h1>Lictom</h1>
    <span>23ª Esqd C Sl</span>
  </div>
  <nav class="sidebar-nav">
    <button class="sidebar-item active" data-page="saldos" onclick="window.__app.navigateTo('saldos')">
      <span class="icon">📊</span>
      Saldos dos Pregões
    </button>
    <button class="sidebar-item" data-page="carona" onclick="window.__app.navigateTo('carona')">
      <span class="icon">🚗</span>
      Carona
    </button>
  </nav>
  <div class="sidebar-footer">Lictom v1.0</div>
</div>

<!-- Main Content -->
<div id="main-content">

  <!-- Page: Saldos -->
  <div id="page-saldos" class="page active">
    <div class="page-header">
      <div style="flex:1; min-width:180px;">
        <h2 style="font-size:17px; margin:0; font-weight:700;">Controle de Saldos de Pregão</h2>
      </div>

      <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
        <input type="text" id="campoBusca" placeholder="Pesquisar..."
          oninput="window.__ui.filtrarDados(this.value)"
          style="padding:7px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.3); width:260px; font-size:13px; color:#333; background:white;">
        <span id="contadorResultados" style="font-size:12px; color:#93c5fd; font-weight:600; white-space:nowrap;"></span>
      </div>

      <div style="display:flex; align-items:center; gap:8px; margin-left:auto;">
        <div style="background:rgba(0,0,0,0.2); padding:6px 14px; border-radius:6px; font-size:12px; display:flex; align-items:center; gap:14px;">
          <span>Itens: <b id="totalItensEmpenho" style="color:#93c5fd;">0</b></span>
          <span>Total: <b id="valorTotalEmpenho" style="color:#4ade80;">R$ 0,00</b></span>
        </div>
        <button class="btn btn-ghost" onclick="window.__ui.exportarCSV()" title="Exportar CSV">CSV</button>
        <button class="btn btn-ghost" onclick="window.__app.toggleConfig()" title="Configurações">⚙</button>
      </div>
    </div>

    <div id="avisoTruncamento"></div>

    <div style="flex:1; overflow:auto; background:var(--bg-secondary); box-shadow:0 1px 6px rgba(0,0,0,0.08);">
      <table style="width:100%; border-collapse:collapse; font-size:13px; min-width:1400px;">
        <thead style="background:var(--table-header); color:var(--text-primary); position:sticky; top:0; z-index:10;">
          <tr>
            <th onclick="window.ordenarTabela('ug')" style="padding:10px 8px; border:1px solid var(--table-border);">UG ↕</th>
            <th onclick="window.ordenarTabela('tipo')" style="padding:10px 8px; border:1px solid var(--table-border);">TIPO ↕</th>
            <th onclick="window.ordenarTabela('numCompra')" style="padding:10px 8px; border:1px solid var(--table-border);">COMPRA ↕</th>
            <th onclick="window.ordenarTabela('numItem')" style="padding:10px 8px; border:1px solid var(--table-border);">ITEM ↕</th>
            <th onclick="window.ordenarTabela('descricao')" style="padding:10px 8px; border:1px solid var(--table-border); width:25%;">DESCRIÇÃO ↕</th>
            <th onclick="window.ordenarTabela('cnpj')" style="padding:10px 8px; border:1px solid var(--table-border); white-space:nowrap;">CNPJ ↕</th>
            <th onclick="window.ordenarTabela('empresa')" style="padding:10px 8px; border:1px solid var(--table-border);">EMPRESA ↕</th>
            <th onclick="window.ordenarTabela('vigFinal')" style="padding:10px 8px; border:1px solid var(--table-border);">VIG. FINAL ↕</th>
            <th onclick="window.ordenarTabela('valorUnit')" style="padding:10px 8px; border:1px solid var(--table-border); text-align:right;">VALOR UNIT. ↕</th>
            <th style="padding:10px 8px; border:1px solid var(--table-border); text-align:center;">DISPONÍVEL</th>
            <th style="padding:10px 8px; border:1px solid var(--table-border); text-align:center; background:var(--yellow-input);">QTD A EMPENHAR</th>
            <th style="padding:10px 8px; border:1px solid var(--table-border); text-align:right; background:var(--yellow-input);">TOTAL ITEM</th>
          </tr>
        </thead>
        <tbody id="corpoTabela"></tbody>
      </table>
    </div>
  </div>

  <!-- Page: Carona -->
  <div id="page-carona" class="page">
    <div class="page-header">
      <div style="flex:1;">
        <h2 style="font-size:17px; margin:0; font-weight:700;">Carona</h2>
      </div>
    </div>
    <div class="placeholder">
      <div class="icon">🚗</div>
      <h3>Carona</h3>
      <p>Funcionalidade em desenvolvimento.</p>
    </div>
  </div>

</div>
`;

// Inicializar
document.body.innerHTML = HTML;

// Aplicar tema salvo
aplicarTema(isDarkMode());

// Sync dark mode toggle
const darkToggle = document.getElementById('darkModeToggle');
const darkLabel = document.getElementById('darkModeLabel');
if (darkToggle) darkToggle.checked = isDarkMode();
if (darkLabel) darkLabel.textContent = isDarkMode() ? 'Ligado' : 'Desligado';

// App controller
window.__app = {
  navigateTo(page) {
    // Atualizar sidebar
    document.querySelectorAll('.sidebar-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });
    // Atualizar páginas
    document.querySelectorAll('.page').forEach(el => {
      el.classList.toggle('active', el.id === `page-${page}`);
    });
  },

  toggleConfig() {
    const panel = document.getElementById('config-panel');
    const overlay = document.getElementById('config-overlay');
    const isOpen = panel.classList.contains('open');
    if (isOpen) {
      panel.classList.remove('open');
      overlay.classList.remove('open');
    } else {
      panel.classList.add('open');
      overlay.classList.add('open');
    }
  },

  toggleDark() {
    const dark = toggleDarkMode();
    const label = document.getElementById('darkModeLabel');
    if (label) label.textContent = dark ? 'Ligado' : 'Desligado';
    renderTabela();
  },

  updateLimite(val) {
    const num = parseInt(val) || 500;
    setLimiteVisual(Math.max(50, Math.min(50000, num)));
    renderTabela();
  }
};

async function init() {
  try {
    const dados = await buscarDados();
    setDados(dados);

    const loading = document.getElementById('loading-overlay');
    if (loading) loading.style.display = 'none';

    renderTabela();
  } catch (err) {
    const loadingText = document.getElementById('loading-text');
    const spinner = document.querySelector('.spinner');
    if (loadingText) {
      loadingText.textContent = `Erro ao carregar dados: ${err.message}`;
      loadingText.style.color = '#dc2626';
    }
    if (spinner) spinner.style.display = 'none';
    console.error('Erro ao buscar dados do SAG:', err);
  }
}

init();
