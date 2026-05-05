/**
 * pages/custos.js
 * -------------------------------------------------
 * Módulo de custos: métricas, detalhe por ordem
 * e gráfico de custo por material.
 * -------------------------------------------------
 */

let _chartCustos = null;

function renderCustos() {
  const rows = DB.ordens.map(o => {
    const pd       = getPedido(o.pedidoId);
    const dp       = getDadosPedido(pd.dadosPedidoId);
    const cl       = resolveCliente(pd.clienteTipo, pd.clienteId);
    const total    = o.moObra;
    return { o, pd, dp, cl, total };
  });

  const totalGeral = rows.reduce((s, r) => s + r.total, 0);
  const concluidas = DB.ordens.filter(o => o.estado === 'Concluída').length;
  const medioPorOrdem = rows.length ? Math.round(totalGeral / rows.length) : 0;

  document.getElementById('page-custos').innerHTML = `
    <div class="grid-metrics-3">
      <div class="metric-card">
        <div class="metric-label">Custo total estimado</div>
        <div class="metric-value">${totalGeral.toFixed(0)} €</div>
        <div class="metric-sub">todas as ordens</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Custo médio por ordem</div>
        <div class="metric-value">${medioPorOrdem} €</div>
        <div class="metric-sub">mão de obra</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Ordens concluídas</div>
        <div class="metric-value">${concluidas}</div>
        <div class="metric-sub">de ${DB.ordens.length} total</div>
      </div>
    </div>

    <div class="full-card">
      <div class="card-title">Detalhe de custos por ordem de trabalho</div>
      <table class="table">
        <thead>
          <tr>
            <th>OT Nº</th><th>Equipamento</th><th>Cliente</th><th>Tipo</th>
            <th>Qtd.</th><th>Total €</th><th>Estado</th>
          </tr>
        </thead>
        <tbody>${_custosRows(rows)}</tbody>
      </table>
    </div>

    <div class="card" style="margin-top:1rem">
      <div class="card-title">Custo acumulado por equipamento</div>
      <div style="position:relative;height:220px">
        <canvas id="chart-custos"></canvas>
      </div>
    </div>`;

  _drawCustosChart();
}

function _custosRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="10" style="text-align:center;color:var(--color-text-muted);padding:2rem">
      Sem dados de custo disponíveis.</td></tr>`;
  }
  return rows.map(r => `
    <tr>
      <td><strong>${r.o.num}</strong></td>
      <td>${r.dp.equipamento || '—'}</td>
      <td>${r.cl.nome}</td>
      <td>${tipoBadge(r.pd.clienteTipo)}</td>
      <td>${r.pd.qtd}</td>
      <td><strong>${r.total.toFixed(0)} €</strong></td>
      <td>${estadoBadge(r.o.estado)}</td>
    </tr>`).join('');
}

function _drawCustosChart() {
  if (_chartCustos) { _chartCustos.destroy(); _chartCustos = null; }

  const mc = {};
  DB.ordens.forEach(o => {
    const pd = getPedido(o.pedidoId);
    const dp = getDadosPedido(pd.dadosPedidoId);
    mc[dp.equipamento || 'Outro'] = (mc[dp.equipamento || 'Outro'] || 0) + o.moObra;
  });

  _chartCustos = new Chart(document.getElementById('chart-custos'), {
    type: 'bar',
    data: {
      labels: Object.keys(mc),
      datasets: [{
        data: Object.values(mc),
        backgroundColor: ['#185FA5','#639922','#BA7517','#1D9E75','#8B5CF6'],
        borderRadius: 5,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: 'rgba(128,128,128,0.1)' } },
      },
    },
  });
}
