# Lictom - Estado do Projeto (21/07/2026)

## Resumo

Dashboard de Controle de Saldos de Pregão para o SAG (sag.eb.mil.br). 
23ª Esqd C Sl.

## Arquitetura Atual

- **Bookmarklet**: Código inline (~22KB) gerado por `npm run build` (esbuild)
- **Extensão Chrome**: MV3, injeta dashboard via DOM manipulation (sem eval)
- **GitHub Pages**: Landing page + distribuição
- **Repo**: https://github.com/devel-ez/lictom

## Estrutura

```
lictom/
├── src/                    # Código fonte do bookmarklet
│   ├── app.js              # Orquestrador + HTML template
│   ├── api.js              # Fetch API do SAG
│   ├── ui.js               # Renderização, busca, sort
│   ├── theme.js            # Dark mode
│   └── utils.js            # fmt, cleanN, lim
├── extension/              # Extensão Chrome
│   ├── manifest.json       # MV3
│   ├── background/
│   │   └── service-worker.js  # Auto-update do GitHub
│   ├── content/
│   │   ├── inject.js       # Content script (DOM + addEventListener)
│   │   ├── dashboard.html  # Template HTML (sem inline handlers)
│   │   └── styles.css      # Estilos do dashboard
│   ├── popup/
│   │   ├── popup.html      # UI da extensão
│   │   └── popup.js        # Lógica do popup
│   ├── icons/              # Ícones (placeholders 1x1px)
│   └── dist/
│       └── bookmarklet.txt # Output do build
├── dist/
│   ├── bookmarklet.js      # JS minificado
│   └── bookmarklet.txt     # Bookmarklet final (javascript:...)
├── index.html              # Landing page GitHub Pages
├── build.js                # esbuild bundler
├── package.json
└── generate-icons.js       # Gerador de ícones
```

## Estado Atual / Pendências

### ✅ Concluído
- Refatoração em módulos (5 arquivos JS)
- Build com esbuild
- Loading spinner
- Contador de resultados
- Aviso de truncamento
- Exportação CSV
- Dark mode com persistência
- Painel de configurações
- Sidebar com menu lateral (Saldos + Carona placeholder)
- Landing page GitHub Pages
- Extensão Chrome MV3
- Content script sem eval (DOM + addEventListener)
- Login page detection (não injeta na tela de login)
- Push para GitHub: https://github.com/devel-ez/lictom

### 🔧 Em andamento (ÚLTIMA SESSÃO)
- **Testar extensão**: Remover extensão antiga, recarregar, testar login + dashboard
- **Fix aplicado**: Removido `isSAGPage()` que bloqueava `/index.php` pós-login
- **Precisa testar**: Se o dashboard carrega após login no SAG

### 📋 Pendente
- Testar extensão no SAG real (após fix do isSAGPage)
- Ícones reais (substituir placeholders 1x1px)
- Tela "Carona" (placeholder na sidebar)
- Parâmetro CODIGO configurável (atualmente fixo em 160081)
- GitHub Pages habilitado (precisa ativar nas config do repo)
- Landing page com instruções atualizadas

## Comandos Úteis

```bash
npm run build              # Build do bookmarklet
npm run watch              # Build com watch
node generate-icons.js     # Gerar ícones placeholders
git push                   # Push para GitHub
```

## Para Continuar

1. Abrir terminal em `C:\Users\AUX-SALC\Documents\apps\saginf`
2. Testar extensão: `chrome://extensions` → recarregar → acessar SAG → login → verificar console
3. Se `[Lictom] Dashboard injetado com sucesso` aparece no console → funciona
4. Se não, verificar erros no console e ajustar `extension/content/inject.js`

## CSS Variables (Dark Mode)

O dashboard usa CSS variables para theming. Tema claro e escuro alternam via toggle.
Storage key: `lictom_dark_mode` no localStorage.

## API do SAG

```
GET https://sag.eb.mil.br/php/chamadas/gestaoAta.php
  ?metodo=tela&fase=change
  &coluna[]=CODIGO&coluna[]=TIPO_UNIDADE&... (16 colunas)
  &CODIGO[]=160081
  &sEcho=1&iColumns=16&iDisplayStart=0&iDisplayLength=50000
```

Response: DataTables format `{ aaData: [...], sEcho: 1, iTotalDisplayRecords: "1300" }`
