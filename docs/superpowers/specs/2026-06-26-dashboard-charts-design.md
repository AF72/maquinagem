# Dashboard — reorganização da secção de gráficos

## Contexto

O Dashboard React ([frontend/src/pages/Dashboard.jsx](../../../frontend/src/pages/Dashboard.jsx)) tem atualmente, por esta ordem:

1. Métricas (pedidos + ordens de trabalho)
2. Secção "Gráficos" (`grid-2`, duas colunas): "Ordens por estado" (donut) e "Pedidos por tipo de cliente" (donut)
3. Tabela "Ordens ativas — linha de tempo" (`full-card`)

## Alteração pretendida

1. **Remover** o card e o cálculo de dados (`tiposData`) de "Pedidos por tipo de cliente".
2. **Trocar a ordem**: a tabela "Ordens ativas — linha de tempo" passa para a posição em que estava a secção de gráficos; o card "Ordens por estado" passa para a posição em que estava a tabela (ou seja, fica depois dela).
3. **Converter** "Ordens por estado" de donut em `grid-2` (meia largura) para um `full-card` de largura total, com gráfico de **barras horizontais**:
   - Chart.js `type: 'bar'`, `indexAxis: 'y'`.
   - Reutiliza as cores existentes de `ESTADO_CORES` por barra.
   - Sem legenda — cada barra já é identificada pela etiqueta do estado no eixo.
   - Altura do gráfico aumenta de 190px para ~220–260px, para dar espaço confortável às 6 categorias de estado.

## Fora de âmbito

- Sem alterações ao backend, à store (`useStore`), ou a outras páginas.
- Sem alterações aos dados em si — `estadosData` (agregação por `estado`) mantém-se igual.
- `DonutChart` só é usado nestes dois pontos do Dashboard. Depois de remover "Pedidos por tipo de cliente" e converter "Ordens por estado" em barras horizontais, deixa de ter chamadas — o componente é removido em vez de ficar como código morto.

## Resultado esperado

Nova ordem na página Dashboard:

1. Métricas
2. Tabela "Ordens ativas — linha de tempo" (full-card, inalterada)
3. Card "Ordens por estado" (full-card, barras horizontais)
