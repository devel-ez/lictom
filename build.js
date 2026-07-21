const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');

async function build() {
  try {
    const result = await esbuild.build({
      entryPoints: ['src/app.js'],
      bundle: true,
      format: 'iife',
      minify: true,
      target: ['es2020'],
      outfile: 'dist/bookmarklet.js',
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    });

    // Wrap as bookmarklet
    const jsCode = fs.readFileSync('dist/bookmarklet.js', 'utf8');
    const bookmarklet = 'javascript:' + jsCode;
    fs.writeFileSync('dist/bookmarklet.txt', bookmarklet);

    // Copiar para extensão
    const extDir = path.join(__dirname, 'extension');
    if (fs.existsSync(extDir)) {
      fs.mkdirSync(path.join(extDir, 'dist'), { recursive: true });
      fs.writeFileSync(path.join(extDir, 'dist', 'bookmarklet.txt'), bookmarklet);
    }

    const originalSize = fs.statSync('dist/bookmarklet.js').size;
    const bookmarkletSize = Buffer.byteLength(bookmarklet, 'utf8');

    console.log(`✅ Build concluído!`);
    console.log(`   JS minificado: ${originalSize} bytes`);
    console.log(`   Bookmarklet:   ${bookmarkletSize} bytes`);
    console.log(`   Output: dist/bookmarklet.txt`);
    if (fs.existsSync(extDir)) {
      console.log(`   Extensão: extension/dist/bookmarklet.txt`);
    }
  } catch (err) {
    console.error('❌ Build falhou:', err.message);
    process.exit(1);
  }
}

if (isWatch) {
  esbuild.context({
    entryPoints: ['src/app.js'],
    bundle: true,
    format: 'iife',
    minify: true,
    target: ['es2020'],
    outfile: 'dist/bookmarklet.js',
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  }).then(ctx => {
    ctx.watch();
    console.log('👀 Watching for changes...');
  });
} else {
  build();
}
