/**
 * pages/dashboard.js
 * -------------------------------------------------
 * Renderização do dashboard principal:
 * métricas, gráficos e tabela de últimas ordens.
 * -------------------------------------------------
 */

let _chartEstados = null;
let _chartTipos = null;

function renderDashboard() {
    const ativas = DB.ordens.filter((o) => o.estado === 'Em curso').length;
    const fat = DB.ordens
        .filter((o) => o.estado === 'Em curso')
        .reduce((s, o) => {
            const pd = getPedido(o.pedidoId);
            return s + o.moObra;
        }, 0);

    document.getElementById('page-dashboard').innerHTML = `
    <div class="grid-metrics">
      <div class="metric-card">
        <div class="metric-label">Empresas clientes</div>
        <div class="metric-value">${DB.empresas.length}</div>
        <div class="metric-sub">${DB.colaboradores.length} colaboradores</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Particulares</div>
        <div class="metric-value">${DB.particulares.length}</div>
        <div class="metric-sub">clientes individuais</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Total de pedidos</div>
        <div class="metric-value">${DB.pedidos.length}</div>
        <div class="metric-sub">total de pedidos</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Ordens por faturar</div>
        <div class="metric-value">${DB.ordens.length}</div>
        <div class="metric-sub">ordens por faturar</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Ordens ativas</div>
        <div class="metric-value">${ativas}</div>
        <div class="metric-sub">em produção</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Faturação estimada</div>
        <div class="metric-value">${fat.toFixed(0)} €</div>
        <div class="metric-sub">ordens em curso</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-title">Ordens por estado</div>
        <div style="position:relative;height:190px">
          <canvas id="chart-estados"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-title">Pedidos por tipo de cliente</div>
        <div style="position:relative;height:190px">
          <canvas id="chart-tipos"></canvas>
        </div>
      </div>
    </div>

    <div class="full-card">
      <div class="card-title">Últimas ordens de trabalho</div>
      <table class="table">
        <thead>
          <tr>
            <th>OT</th><th>Cliente</th><th>Tipo</th>
            <th>Equipamento</th><th>Estado</th><th>Prazo</th>
          </tr>
        </thead>
        <tbody>${_dashOrdensRows()}</tbody>
      </table>
    </div>`;

    _drawDashCharts();
}
/*The next function should display all the orders in the system in a table*/
function _dashOrdensRows() {
    return DB.ordens
        .slice()
        .reverse()
        .map((o) => {
            const pd = getPedido(o.pedidoId);
            const cl = resolveCliente(pd.clienteTipo, pd.clienteId);
            const dp = getDadosPedido(pd.dadosPedidoId);
            const label = pd.clienteTipo === 'particular'
              ? `<div style="line-height:1.2;"><div>${cl.nome}</div><div style="font-size:11px;color:var(--color-text-muted)">Particular</div></div>`
              : `<div style="line-height:1.2;"><div>${cl.subtexto}</div><div style="font-size:11px;color:var(--color-text-muted)">${cl.nome}</div></div>`;
            return `<tr>
      <td>${o.num}</td>
      <td>${inlineFlex(avatarHtml(cl.nome, cl.avClass, true), label)}</td>
      <td>${tipoBadge(pd.clienteTipo)}</td>
      <td>${dp.equipamento}</td>
      <td>${estadoBadge(o.estado)}</td>
      <td>${o.prazo}</td>
    </tr>`;
        })
        .join('');
}

function _drawDashCharts() {
    if (_chartEstados) {
        _chartEstados.destroy();
        _chartEstados = null;
    }
    if (_chartTipos) {
        _chartTipos.destroy();
        _chartTipos = null;
    }

    /* Ordens por estado */
    const estados = {};
    DB.ordens.forEach((o) => {
        estados[o.estado] = (estados[o.estado] || 0) + 1;
    });
    _chartEstados = new Chart(document.getElementById('chart-estados'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(estados),
            datasets: [
                {
                    data: Object.values(estados),
                    backgroundColor: ['#378ADD', '#639922', '#BA7517'],
                    borderWidth: 0,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { size: 11 }, boxWidth: 10, padding: 8 },
                },
            },
        },
    });

    /* Pedidos por tipo de cliente */
    const emp = DB.pedidos.filter(
        (p) => p.clienteTipo === 'colaborador',
    ).length;
    const part = DB.pedidos.filter(
        (p) => p.clienteTipo === 'particular',
    ).length;
    _chartTipos = new Chart(document.getElementById('chart-tipos'), {
        type: 'doughnut',
        data: {
            labels: ['Empresa', 'Particular'],
            datasets: [
                {
                    data: [emp, part],
                    backgroundColor: ['#1D9E75', '#D85A30'],
                    borderWidth: 0,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { size: 11 }, boxWidth: 10, padding: 8 },
                },
            },
        },
    });
}
