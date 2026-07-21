# Lictom

Controle de Saldos de Pregão — 23ª Esqd C Sl

Dashboard para gerenciamento de itens, saldos e empenhos de pregão do SAG (Sistema de Administração de Gastos).

## Funcionalidades

- Tabela com 12 colunas: UG, Tipo, Compra, Item, Descrição, CNPJ, Empresa, Vigência, Valor Unitário, Disponível, QTD a Empenhar, Total
- Busca instantânea por qualquer campo
- Ordenação por clique no cabeçalho
- Cálculo automático de totais
- Exportação CSV
- Modo escuro
- Painel de configurações
- Menu lateral com múltiplas telas

## Uso

### Bookmarklet

Acesse a [página de instruções](https://devel-ez.github.io/lictom/) para instalar o bookmarklet.

### Extensão Chrome

1. Abra `chrome://extensions`
2. Ative "Modo desenvolvedor"
3. Clique "Carregar extensão expandida"
4. Selecione a pasta `extension/`

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Build do bookmarklet
npm run build

# Build com watch (rebuild automático)
npm run watch
```

## Estrutura

```
lictom/
├── src/                # Código fonte modular
│   ├── app.js          # Orquestrador principal
│   ├── api.js          # Chamadas à API do SAG
│   ├── ui.js           # Renderização e eventos
│   ├── theme.js        # Dark mode
│   └── utils.js        # Funções utilitárias
├── dist/               # Output do build
├── extension/          # Extensão Chrome
├── index.html          # Landing page
└── build.js            # Script de build (esbuild)
```
