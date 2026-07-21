// ui.js — Renderização, busca, ordenação e eventos

import { fmt, cleanN } from './utils.js';

let LIMITE_VISUAL = 500;

let dadosMapeados = [];
let dadosFiltrados = [];
let colunaAtiva = '';
let ordemAscendente = true;
const mapaSolicitacoes = {};
const mapaQuantidades = {};

export function setDados(dados) {
  dadosMapeados = dados;
  dadosFiltrados = [...dados];
}

export function setLimiteVisual(n) {
  LIMITE_VISUAL = n;
}

export function getDadosFiltrados() {
  return dadosFiltrados;
}

export function getMapaSolicitacoes() {
  return mapaSolicitacoes;
}

// --- Renderização ---

export function renderTabela() {
  const corpo = document.getElementById('corpoTabela');
  if (!corpo) return;

  const total = dadosFiltrados.length;
  const visiveis = dadosFiltrados.slice(0, LIMITE_VISUAL);

  corpo.innerHTML = visiveis.map(item => {
    const valExistente = mapaQuantidades[item.id] != null
      ? mapaQuantidades[item.id]
      : '';

    const corTipo = item.tipo.toLowerCase().includes('gerenciadora')
      ? 'var(--accent-blue)'
      : '#d35400';

    const corDisponivel = item.numDisponivel > 0 ? 'var(--accent-green)' : 'var(--accent-red)';

    const totalItem = mapaSolicitacoes[item.id] || 0;
    const totalFormatado = totalItem > 0
      ? `R$ ${fmt(totalItem)}`
      : 'R$ 0,00';

    return `<tr onmouseover="this.style.background='var(--row-hover)'" onmouseout="this.style.background='transparent'">
      <td style="padding:8px;border:1px solid var(--border-color);">${item.ug}</td>
      <td style="padding:8px;border:1px solid var(--border-color);color:${corTipo};font-weight:bold;">${item.tipo}</td>
      <td style="padding:8px;border:1px solid var(--border-color);font-weight:bold;">${item.numCompra}</td>
      <td style="padding:8px;border:1px solid var(--border-color);font-weight:bold;">${item.numItem}</td>
      <td style="padding:8px;border:1px solid var(--border-color);font-size:11px;">${item.descricao}</td>
      <td style="padding:8px;border:1px solid var(--border-color);white-space:nowrap;">${item.cnpj}</td>
      <td style="padding:8px;border:1px solid var(--border-color);font-size:11px;">${item.empresa}</td>
      <td style="padding:8px;border:1px solid var(--border-color);">${item.vigFinal}</td>
      <td style="padding:8px;border:1px solid var(--border-color);text-align:right;">${item.valorUnitStr}</td>
      <td style="padding:8px;border:1px solid var(--border-color);text-align:center;font-weight:bold;color:${corDisponivel};">${item.qtdDisponivel}</td>
      <td style="padding:8px;border:1px solid var(--border-color);background:var(--yellow-cell);">
        <input type="number" class="input-qtd" min="0" step="1"
          value="${valExistente}"
          oninput="window.__ui.atualizarCalculo('${item.id}', this.value, ${item.valorUnit})">
      </td>
      <td style="padding:8px;border:1px solid var(--border-color);text-align:right;font-weight:bold;background:var(--yellow-cell);" id="total_${item.id}">${totalFormatado}</td>
    </tr>`;
  }).join('');

  atualizarContadores(total);
  atualizarAvisoTruncamento(total);
}

function atualizarContadores(total) {
  const contador = document.getElementById('contadorResultados');
  if (contador) {
    contador.textContent = `${Math.min(total, LIMITE_VISUAL)} de ${total} itens`;
  }

  const itensEmpenho = document.getElementById('totalItensEmpenho');
  if (itensEmpenho) {
    let count = 0;
    for (const key in mapaSolicitacoes) {
      if (mapaSolicitacoes[key] > 0) count++;
    }
    itensEmpenho.textContent = count;
  }

  const valorEmpenho = document.getElementById('valorTotalEmpenho');
  if (valorEmpenho) {
    let totalGeral = 0;
    for (const key in mapaSolicitacoes) {
      if (mapaSolicitacoes[key] > 0) totalGeral += mapaSolicitacoes[key];
    }
    valorEmpenho.textContent = `R$ ${fmt(totalGeral)}`;
  }
}

function atualizarAvisoTruncamento(total) {
  const aviso = document.getElementById('avisoTruncamento');
  if (aviso) {
    if (total > LIMITE_VISUAL) {
      aviso.textContent = `⚠️ Resultados truncados: mostrando ${LIMITE_VISUAL} de ${total} itens`;
      aviso.style.display = 'block';
    } else {
      aviso.style.display = 'none';
    }
  }
}

// --- Cálculo ---

function atualizarCalculo(id, qtd, valorUnit) {
  const qtdNum = parseFloat(qtd) || 0;
  const total = qtdNum * valorUnit;
  mapaSolicitacoes[id] = total;
  mapaQuantidades[id] = qtdNum || undefined;

  const totalCell = document.getElementById(`total_${id}`);
  if (totalCell) {
    totalCell.textContent = total > 0 ? `R$ ${fmt(total)}` : 'R$ 0,00';
  }

  atualizarContadores(dadosFiltrados.length);
}

// --- Ordenação ---

export function ordenarTabela(coluna) {
  if (colunaAtiva === coluna) {
    ordemAscendente = !ordemAscendente;
  } else {
    colunaAtiva = coluna;
    ordemAscendente = true;
  }

  const camposNumericos = ['numItem', 'valorUnit', 'numDisponivel', 'numCompra'];

  dadosFiltrados.sort((a, b) => {
    let valA = a[coluna];
    let valB = b[coluna];

    if (camposNumericos.includes(coluna)) {
      valA = typeof valA === 'number' ? valA : cleanN(String(valA));
      valB = typeof valB === 'number' ? valB : cleanN(String(valB));
    } else {
      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();
    }

    if (valA < valB) return ordemAscendente ? -1 : 1;
    if (valA > valB) return ordemAscendente ? 1 : -1;
    return 0;
  });

  renderTabela();
}

// --- Busca ---

export function filtrarDados(termo) {
  const t = termo.toLowerCase().trim();

  if (!t) {
    dadosFiltrados = [...dadosMapeados];
  } else {
    dadosFiltrados = dadosMapeados.filter(item =>
      item.numCompra.toLowerCase().includes(t) ||
      item.empresa.toLowerCase().includes(t) ||
      item.descricao.toLowerCase().includes(t) ||
      item.numItem.toLowerCase().includes(t) ||
      item.cnpj.toLowerCase().includes(t)
    );
  }

  renderTabela();
}

// --- Exportar CSV ---

export function exportarCSV() {
  const headers = [
    'UG', 'TIPO', 'COMPRA', 'ITEM', 'DESCRIÇÃO', 'CNPJ',
    'EMPRESA', 'VIG. FINAL', 'VALOR UNIT.', 'DISPONÍVEL',
    'QTD EMPENHAR', 'TOTAL ITEM'
  ];

  const rows = dadosFiltrados.map(item => {
    const totalItem = mapaSolicitacoes[item.id] || 0;
    const qtdEmpenhar = mapaQuantidades[item.id] || '';
    return [
      item.ug, item.tipo, item.numCompra, item.numItem,
      `"${item.descricao}"`, item.cnpj, `"${item.empresa}"`,
      item.vigFinal, item.valorUnitStr, item.qtdDisponivel,
      qtdEmpenhar, totalItem > 0 ? fmt(totalItem) : '0,00'
    ].join(';');
  });

  const csv = [headers.join(';'), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `saldos_pregao_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

// Expor funções para uso inline no HTML
window.__ui = {
  atualizarCalculo,
  ordenarTabela,
  filtrarDados,
  exportarCSV
};

window.ordenarTabela = ordenarTabela;
