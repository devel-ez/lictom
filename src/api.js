// api.js — Chamadas à API do SAG + mapeamento de dados

import { lim, cleanN } from './utils.js';

const API_URL = 'https://sag.eb.mil.br/php/chamadas/gestaoAta.php';

const COLUNAS = [
  'CODIGO', 'TIPO_UNIDADE', 'UG_CODIGO', 'NUMERO_ATA', 'ANO_ATA',
  'NUMERO_COMPRA', 'NUMERO_ITEM', 'DESCRICAO_DETALHADA', 'TIPO_ITEM',
  'VALOR_UNITARIO', 'CNPJ', 'CNPJ_NOME', 'VIGENCIA_INICIAL',
  'VIGENCIA_FINAL', 'QUANTIDADE_REGISTRADA', 'QUANTIDADE_DISPONIVEL'
];

const CODIGO_ATA = '160081';
const MAX_ROWS = 50000;

export async function buscarDados() {
  const params = new URLSearchParams();
  params.set('metodo', 'tela');
  params.set('fase', 'change');
  params.set('sEcho', '1');
  params.set('iColumns', String(COLUNAS.length));
  params.set('iDisplayStart', '0');
  params.set('iDisplayLength', String(MAX_ROWS));

  COLUNAS.forEach(c => params.append('coluna[]', c));
  params.append('CODIGO[]', CODIGO_ATA);

  const response = await fetch(`${API_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const json = await response.json();
  const raw = json.aaData || json.data || [];

  return raw.map(mapearItem);
}

function mapearItem(i) {
  const valorUnit = cleanN(lim(i[9]));
  const id = `${i[5]}_${i[6]}`;

  return {
    id,
    ug: lim(i[0]),
    tipo: lim(i[1]),
    numCompra: lim(i[5]),
    numItem: lim(i[6]),
    descricao: lim(i[7]),
    valorUnitStr: lim(i[9]),
    valorUnit,
    cnpj: lim(i[10]),
    empresa: lim(i[11]),
    vigFinal: lim(i[13]),
    qtdDisponivel: lim(i[15]),
    numDisponivel: cleanN(lim(i[15]))
  };
}
