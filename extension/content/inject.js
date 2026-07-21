(function() {
  if (window.__lictomInjected) return;
  window.__lictomInjected = true;

  if (window.location.hostname !== 'sag.eb.mil.br') return;

  function isLoginPage() {
    if (document.querySelector('input[type="password"]')) return true;
    if (document.querySelector('form[action*="login"]')) return true;
    if (document.querySelector('form[action*="autentic"]')) return true;
    if (document.querySelector('#login')) return true;
    if (document.querySelector('[name="senha"]')) return true;
    return false;
  }

  async function init() {
    if (isLoginPage()) {
      console.log('[Lictom] Tela de login detectada, aguardando...');
      return;
    }

    const stored = await chrome.storage.local.get(['enabled', 'code']);
    if (!stored.enabled) {
      console.log('[Lictom] Extensão desabilitada');
      return;
    }

    const htmlUrl = chrome.runtime.getURL('content/dashboard.html');
    const resp = await fetch(htmlUrl);
    const htmlTemplate = await resp.text();

    document.head.innerHTML = '<meta charset="UTF-8">';
    document.body.innerHTML = htmlTemplate;

    document.getElementById('app-dashboard').style.display = 'none';

    console.log('[Lictom] Dashboard injetado com sucesso');
    Dashboard.init();
  }

  const Dashboard = {
    API_URL: 'https://sag.eb.mil.br/php/chamadas/gestaoAta.php',
    COLUNAS: [
      'CODIGO','TIPO_UNIDADE','UG_CODIGO','NUMERO_ATA','ANO_ATA',
      'NUMERO_COMPRA','NUMERO_ITEM','DESCRICAO_DETALHADA','TIPO_ITEM',
      'VALOR_UNITARIO','CNPJ','CNPJ_NOME','VIGENCIA_INICIAL',
      'VIGENCIA_FINAL','QUANTIDADE_REGISTRADA','QUANTIDADE_DISPONIVEL'
    ],
    CODIGO_ATA: '160081',
    MAX_ROWS: 50000,
    LIMITE_VISUAL: 500,

    dadosMapeados: [],
    dadosFiltrados: [],
    colunaAtiva: '',
    ordemAscendente: true,
    mapaSolicitacoes: {},
    mapaQuantidades: {},

    init() {
      this.bindEvents();
      this.loadData();
    },

    bindEvents() {
      const self = this;

      document.getElementById('campoBusca').addEventListener('input', function() {
        self.filtrarDados(this.value);
      });

      document.querySelectorAll('th[data-sort]').forEach(function(th) {
        th.addEventListener('click', function() {
          self.ordenarTabela(this.dataset.sort);
        });
      });

      document.getElementById('btnExportCSV').addEventListener('click', function() {
        self.exportarCSV();
      });

      document.getElementById('btnOpenConfig').addEventListener('click', function() {
        self.toggleConfig(true);
      });

      document.getElementById('btnCloseConfig').addEventListener('click', function() {
        self.toggleConfig(false);
      });

      document.getElementById('config-overlay').addEventListener('click', function() {
        self.toggleConfig(false);
      });

      document.getElementById('darkModeToggle').addEventListener('change', function() {
        self.toggleDark(this.checked);
      });

      document.getElementById('limiteInput').addEventListener('change', function() {
        var num = parseInt(this.value) || 500;
        self.LIMITE_VISUAL = Math.max(50, Math.min(50000, num));
        self.renderTabela();
      });

      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') self.toggleConfig(false);
      });
    },

    toggleConfig(open) {
      var panel = document.getElementById('config-panel');
      var overlay = document.getElementById('config-overlay');
      if (open) {
        panel.classList.add('open');
        overlay.classList.add('open');
      } else {
        panel.classList.remove('open');
        overlay.classList.remove('open');
      }
    },

    toggleDark(dark) {
      localStorage.setItem('lictom_dark_mode', String(dark));
      this.aplicarTema(dark);
      var label = document.getElementById('darkModeLabel');
      if (label) label.textContent = dark ? 'Ligado' : 'Desligado';
      this.renderTabela();
    },

    aplicarTema(dark) {
      var r = document.documentElement;
      if (dark) {
        r.style.setProperty('--bg-primary', '#1a1a2e');
        r.style.setProperty('--bg-secondary', '#16213e');
        r.style.setProperty('--text-primary', '#e0e0e0');
        r.style.setProperty('--text-secondary', '#a0a0a0');
        r.style.setProperty('--border-color', '#2a2a4a');
        r.style.setProperty('--row-hover', '#1e2a4a');
        r.style.setProperty('--header-bg', '#0f3460');
        r.style.setProperty('--table-header', '#16213e');
        r.style.setProperty('--table-border', '#2a2a4a');
        r.style.setProperty('--input-bg', '#1e2a4a');
        r.style.setProperty('--input-text', '#e0e0e0');
        r.style.setProperty('--card-bg', '#16213e');
        r.style.setProperty('--accent-green', '#4ade80');
        r.style.setProperty('--accent-red', '#f87171');
        r.style.setProperty('--accent-blue', '#60a5fa');
        r.style.setProperty('--warning-bg', '#78350f');
        r.style.setProperty('--warning-text', '#fde68a');
        r.style.setProperty('--warning-border', '#92400e');
      } else {
        r.style.setProperty('--bg-primary', '#f0f2f5');
        r.style.setProperty('--bg-secondary', '#ffffff');
        r.style.setProperty('--text-primary', '#1e293b');
        r.style.setProperty('--text-secondary', '#64748b');
        r.style.setProperty('--border-color', '#e2e8f0');
        r.style.setProperty('--row-hover', '#f0f8ff');
        r.style.setProperty('--header-bg', 'linear-gradient(135deg,#1e3a5f 0%,#2d5a87 100%)');
        r.style.setProperty('--table-header', '#cbd5e1');
        r.style.setProperty('--table-border', '#b0bec5');
        r.style.setProperty('--input-bg', '#ffffff');
        r.style.setProperty('--input-text', '#333333');
        r.style.setProperty('--card-bg', '#ffffff');
        r.style.setProperty('--accent-green', '#27ae60');
        r.style.setProperty('--accent-red', '#c0392b');
        r.style.setProperty('--accent-blue', '#2563eb');
        r.style.setProperty('--warning-bg', '#fef3c7');
        r.style.setProperty('--warning-text', '#92400e');
        r.style.setProperty('--warning-border', '#fde68a');
      }
    },

    async loadData() {
      try {
        var params = new URLSearchParams();
        params.set('metodo', 'tela');
        params.set('fase', 'change');
        params.set('sEcho', '1');
        params.set('iColumns', String(this.COLUNAS.length));
        params.set('iDisplayStart', '0');
        params.set('iDisplayLength', String(this.MAX_ROWS));
        this.COLUNAS.forEach(function(c) { params.append('coluna[]', c); });
        params.append('CODIGO[]', this.CODIGO_ATA);

        var response = await fetch(this.API_URL + '?' + params.toString());
        if (!response.ok) throw new Error('HTTP ' + response.status);

        var json = await response.json();
        var raw = json.aaData || json.data || [];
        this.dadosMapeados = raw.map(this.mapearItem.bind(this));
        this.dadosFiltrados = this.dadosMapeados.slice();

        document.getElementById('loading-overlay').style.display = 'none';
        document.getElementById('app-dashboard').style.display = 'flex';

        var isDark = localStorage.getItem('lictom_dark_mode') === 'true';
        document.getElementById('darkModeToggle').checked = isDark;
        document.getElementById('darkModeLabel').textContent = isDark ? 'Ligado' : 'Desligado';
        this.aplicarTema(isDark);

        this.renderTabela();
      } catch (err) {
        var lt = document.getElementById('loading-text');
        var sp = document.querySelector('.spinner');
        if (lt) {
          lt.textContent = 'Erro ao carregar dados: ' + err.message;
          lt.style.color = '#dc2626';
        }
        if (sp) sp.style.display = 'none';
        console.error('[Lictom] Erro:', err);
      }
    },

    mapearItem(i) {
      function lim(s) {
        if (typeof s !== 'string') return '';
        var tmp = document.createElement('div');
        tmp.innerHTML = s;
        return tmp.textContent || '';
      }
      function cleanN(s) {
        if (typeof s !== 'string') return 0;
        return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
      }

      var valorUnit = cleanN(lim(i[9]));
      return {
        id: i[5] + '_' + i[6],
        ug: lim(i[0]),
        tipo: lim(i[1]),
        numCompra: lim(i[5]),
        numItem: lim(i[6]),
        descricao: lim(i[7]),
        valorUnitStr: lim(i[9]),
        valorUnit: valorUnit,
        cnpj: lim(i[10]),
        empresa: lim(i[11]),
        vigFinal: lim(i[13]),
        qtdDisponivel: lim(i[15]),
        numDisponivel: cleanN(lim(i[15]))
      };
    },

    fmt(n) {
      return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    renderTabela() {
      var self = this;
      var corpo = document.getElementById('corpoTabela');
      if (!corpo) return;

      var total = this.dadosFiltrados.length;
      var visiveis = this.dadosFiltrados.slice(0, this.LIMITE_VISUAL);

      corpo.innerHTML = visiveis.map(function(item) {
        var qtd = self.mapaQuantidades[item.id];
        var valExistente = qtd != null ? qtd : '';

        var corTipo = item.tipo.toLowerCase().includes('gerenciadora')
          ? 'var(--accent-blue)' : '#d35400';
        var corDisp = item.numDisponivel > 0 ? 'var(--accent-green)' : 'var(--accent-red)';
        var totalItem = self.mapaSolicitacoes[item.id] || 0;
        var totalFmt = totalItem > 0 ? 'R$ ' + self.fmt(totalItem) : 'R$ 0,00';

        return '<tr>' +
          '<td>' + item.ug + '</td>' +
          '<td style="color:' + corTipo + ';font-weight:bold;">' + item.tipo + '</td>' +
          '<td style="font-weight:bold;">' + item.numCompra + '</td>' +
          '<td style="font-weight:bold;">' + item.numItem + '</td>' +
          '<td style="font-size:11px;">' + item.descricao + '</td>' +
          '<td style="white-space:nowrap;">' + item.cnpj + '</td>' +
          '<td style="font-size:11px;">' + item.empresa + '</td>' +
          '<td>' + item.vigFinal + '</td>' +
          '<td style="text-align:right;">' + item.valorUnitStr + '</td>' +
          '<td style="text-align:center;font-weight:bold;color:' + corDisp + ';">' + item.qtdDisponivel + '</td>' +
          '<td class="cell-input"><input type="number" class="input-qtd" min="0" step="1" data-id="' + item.id + '" data-valor="' + item.valorUnit + '" value="' + valExistente + '"></td>' +
          '<td class="cell-total" id="total_' + item.id + '">' + totalFmt + '</td>' +
        '</tr>';
      }).join('');

      corpo.querySelectorAll('.input-qtd').forEach(function(input) {
        input.addEventListener('input', function() {
          self.atualizarCalculo(this.dataset.id, this.value, parseFloat(this.dataset.valor));
        });
      });

      this.atualizarContadores(total);
      this.atualizarAvisoTruncamento(total);
    },

    atualizarCalculo(id, qtd, valorUnit) {
      var qtdNum = parseFloat(qtd) || 0;
      var total = qtdNum * valorUnit;
      this.mapaSolicitacoes[id] = total;
      this.mapaQuantidades[id] = qtdNum || undefined;

      var cell = document.getElementById('total_' + id);
      if (cell) cell.textContent = total > 0 ? 'R$ ' + this.fmt(total) : 'R$ 0,00';

      this.atualizarContadores(this.dadosFiltrados.length);
    },

    atualizarContadores(total) {
      var count = 0;
      var totalGeral = 0;
      for (var key in this.mapaSolicitacoes) {
        if (this.mapaSolicitacoes[key] > 0) {
          count++;
          totalGeral += this.mapaSolicitacoes[key];
        }
      }

      var contador = document.getElementById('contadorResultados');
      if (contador) contador.textContent = Math.min(total, this.LIMITE_VISUAL) + ' de ' + total + ' itens';

      var itensEl = document.getElementById('totalItensEmpenho');
      if (itensEl) itensEl.textContent = count;

      var valorEl = document.getElementById('valorTotalEmpenho');
      if (valorEl) valorEl.textContent = 'R$ ' + this.fmt(totalGeral);
    },

    atualizarAvisoTruncamento(total) {
      var aviso = document.getElementById('avisoTruncamento');
      if (!aviso) return;
      if (total > this.LIMITE_VISUAL) {
        aviso.textContent = '⚠️ Resultados truncados: mostrando ' + this.LIMITE_VISUAL + ' de ' + total + ' itens';
        aviso.style.display = 'block';
      } else {
        aviso.style.display = 'none';
      }
    },

    ordenarTabela(coluna) {
      if (this.colunaAtiva === coluna) {
        this.ordemAscendente = !this.ordemAscendente;
      } else {
        this.colunaAtiva = coluna;
        this.ordemAscendente = true;
      }

      var self = this;
      var numCols = ['numItem', 'valorUnit', 'numDisponivel', 'numCompra'];

      this.dadosFiltrados.sort(function(a, b) {
        var valA = a[coluna];
        var valB = b[coluna];
        if (numCols.includes(coluna)) {
          valA = typeof valA === 'number' ? valA : parseFloat(String(valA).replace(/\./g, '').replace(',', '.')) || 0;
          valB = typeof valB === 'number' ? valB : parseFloat(String(valB).replace(/\./g, '').replace(',', '.')) || 0;
        } else {
          valA = String(valA).toLowerCase();
          valB = String(valB).toLowerCase();
        }
        if (valA < valB) return self.ordemAscendente ? -1 : 1;
        if (valA > valB) return self.ordemAscendente ? 1 : -1;
        return 0;
      });

      this.renderTabela();
    },

    filtrarDados(termo) {
      var t = termo.toLowerCase().trim();
      if (!t) {
        this.dadosFiltrados = this.dadosMapeados.slice();
      } else {
        this.dadosFiltrados = this.dadosMapeados.filter(function(item) {
          return item.numCompra.toLowerCase().includes(t) ||
            item.empresa.toLowerCase().includes(t) ||
            item.descricao.toLowerCase().includes(t) ||
            item.numItem.toLowerCase().includes(t) ||
            item.cnpj.toLowerCase().includes(t);
        });
      }
      this.renderTabela();
    },

    exportarCSV() {
      var self = this;
      var headers = ['UG','TIPO','COMPRA','ITEM','DESCRIÇÃO','CNPJ','EMPRESA','VIG. FINAL','VALOR UNIT.','DISPONÍVEL','QTD EMPENHAR','TOTAL ITEM'];

      var rows = this.dadosFiltrados.map(function(item) {
        var totalItem = self.mapaSolicitacoes[item.id] || 0;
        var qtdEmp = self.mapaQuantidades[item.id] || '';
        return [
          item.ug, item.tipo, item.numCompra, item.numItem,
          '"' + item.descricao + '"', item.cnpj, '"' + item.empresa + '"',
          item.vigFinal, item.valorUnitStr, item.qtdDisponivel,
          qtdEmp, totalItem > 0 ? self.fmt(totalItem) : '0,00'
        ].join(';');
      });

      var csv = headers.join(';') + '\n' + rows.join('\n');
      var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = 'saldos_pregao_' + new Date().toISOString().slice(0, 10) + '.csv';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  init();
})();
