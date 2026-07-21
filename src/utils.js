// utils.js — Funções utilitárias

/**
 * Formata número como moeda brasileira (1.234,56)
 */
export function fmt(n) {
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Converte string formato BR (1.234,56) para float (1234.56)
 */
export function cleanN(s) {
  if (typeof s !== 'string') return 0;
  return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
}

/**
 * Remove tags HTML de uma string
 */
export function lim(s) {
  if (typeof s !== 'string') return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = s;
  return tmp.textContent || '';
}
