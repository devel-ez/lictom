// generate-icons.js — Gera ícones simples para a extensão
// Rodar com: node generate-icons.js

const fs = require('fs');
const path = require('path');

// PNG mínimo 1x1 pixel (placeholder)
// Para ícones reais, substitua por arquivos PNG adequados
function createMinimalPNG(size) {
  // Gera um PNG simples com um quadrado colorido
  // Usando a especificação PNG mínima
  const { createCanvas } = (() => {
    try { return require('canvas'); } catch { return { createCanvas: null }; }
  })();

  if (!createCanvas) {
    return null;
  }

  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Fundo arredondado
  const r = size * 0.15;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, r);
  ctx.fillStyle = '#1e3a5f';
  ctx.fill();

  // Texto "S" centralizado
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.55}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('S', size / 2, size / 2);

  return canvas.toBuffer('image/png');
}

const iconsDir = path.join(__dirname, 'extension', 'icons');

// Tentar gerar com canvas, senão criar placeholders
const png16 = createMinimalPNG(16);
const png48 = createMinimalPNG(48);
const png128 = createMinimalPNG(128);

if (png16 && png48 && png128) {
  fs.writeFileSync(path.join(iconsDir, 'icon16.png'), png16);
  fs.writeFileSync(path.join(iconsDir, 'icon48.png'), png48);
  fs.writeFileSync(path.join(iconsDir, 'icon128.png'), png128);
  console.log('✅ Ícones gerados com canvas');
} else {
  // Gerar PNGs mínimos válidos sem dependência
  // Um PNG válido de 1x1 pixel azul escuro
  const minPNG = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // 8-bit RGB
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x08, 0xD7, 0x63, 0x10, 0x60, 0x18, 0x00, // compressed data
    0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC,
    0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, // IEND chunk
    0x44, 0xAE, 0x42, 0x60, 0x82
  ]);

  // Para 16x16, 48x48, 128x128 precisamos de PNGs maiores
  // Vamos usar SVG como alternativa (Chrome aceita SVG em manifest v3? Não direto)
  // Melhor: gerar PNGs maiores com a técnica de scaler

  // Na verdade, para placeholder vamos criar arquivos que o Chrome aceite
  // Chrome aceita PNGs de qualquer tamanho, então o 1x1 serve como placeholder
  fs.writeFileSync(path.join(iconsDir, 'icon16.png'), minPNG);
  fs.writeFileSync(path.join(iconsDir, 'icon48.png'), minPNG);
  fs.writeFileSync(path.join(iconsDir, 'icon128.png'), minPNG);
  console.log('⚠️  Ícones placeholder criados (1x1px). Substitua por ícones reais.');
  console.log('   Para ícones bonitos, crie PNGs com fundo #1e3a5f e letra "S" branca.');
}

console.log('📁 Ícones salvos em:', iconsDir);
