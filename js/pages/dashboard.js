/**
 * pages/dashboard.js
 * -------------------------------------------------
 * Renderização do dashboard principal:
 * métricas, gráficos e tabela de últimas ordens.
 * -------------------------------------------------
 */

let _chartEstados = null;
let _chartTipos = null;
let _dashAno = new Date().getFullYear();

function renderDashboard() {
    document.getElementById('page-dashboard').innerHTML = `
    <div style="display:flex;gap:16px;margin-bottom:1.5rem;align-items:stretch;">
      <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
        <div class="dash-section-label">Pedidos</div>
        <div class="grid-metrics" style="margin-bottom:0;flex:1;align-items:stretch;">
          <div class="metric-card">
            <div class="metric-label" style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
              Pedidos em
              <select id="dash-ano-sel" onchange="_dashAno=+this.value;_updateDashAno()" style="font-size:12px;padding:2px 6px;border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-surface);color:var(--color-text);cursor:pointer;">
                ${_anosDisponiveis().map(y => `<option value="${y}"${y === _dashAno ? ' selected' : ''}>${y}</option>`).join('')}
              </select>
            </div>
            <div class="metric-value" id="dash-ano-pedidos">${_pedidosDoAno(_dashAno).length}</div>
            <div class="metric-sub" id="dash-ano-ordens"></div>
          </div>
          <div class="metric-card">
            <div class="metric-label">${estadoBadge('Orçamentar')}</div>
            <div class="metric-value">${DB.pedidos.filter(p => p.estado_pedido === 'Orçamentar').length}</div>
            <div class="metric-sub"></div>
          </div>
          <div class="metric-card">
            <div class="metric-label">${estadoBadge('Pendente')}</div>
            <div class="metric-value">${DB.pedidos.filter(p => p.estado_pedido === 'Pendente').length}</div>
            <div class="metric-sub"></div>
          </div>
          <div class="metric-card">
            <div class="metric-label">${estadoBadge('Produção')}</div>
            <div class="metric-value">${DB.pedidos.filter(p => p.estado_pedido === 'Produção').length}</div>
            <div class="metric-sub"></div>
          </div>
        </div>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
        <div class="dash-section-label">Ordens de Trabalho</div>
        <div class="grid-metrics" style="margin-bottom:0;flex:1;align-items:stretch;">
          <div class="metric-card">
            <div class="metric-label">${estadoBadge('Em curso')}</div>
            <div class="metric-value">${DB.ordens.filter(o => o.estado === 'Em curso').length}</div>
            <div class="metric-sub"></div>
          </div>
          <div class="metric-card">
            <div class="metric-label">${estadoBadge('Pendente')}</div>
            <div class="metric-value">${DB.ordens.filter(o => o.estado === 'Pendente').length}</div>
            <div class="metric-sub"></div>
          </div>
          <div class="metric-card">
            <div class="metric-label">${estadoBadge('Falta OC')}</div>
            <div class="metric-value">${DB.ordens.filter(o => o.estado === 'Falta OC').length}</div>
            <div class="metric-sub"></div>
          </div>
          <div class="metric-card">
            <div class="metric-label">${estadoBadge('Faturar')}</div>
            <div class="metric-value">${DB.ordens.filter(o => o.estado === 'Faturar').length}</div>
            <div class="metric-sub"></div>
          </div>
        </div>
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
      <div class="card-title">Ordens ativas — linha de tempo</div>
      <table class="table">
        <thead>
          <tr>
            <th>Nº Ordem</th>
            <th>Cliente</th>
            <th>Data Criação</th>
            <th>Progresso</th>
            <th>Data Limite</th>
          </tr>
        </thead>
        <tbody>${_dashTimeline()}</tbody>
      </table>
    </div>

    `;

    _drawDashCharts();
}
function _anosDisponiveis() {
    const anos = [...new Set(DB.pedidos.map(p => p.data?.slice(0, 4)).filter(Boolean))]
        .map(Number).sort((a, b) => b - a);
    if (anos.length && !anos.includes(_dashAno)) _dashAno = anos[0];
    return anos.length ? anos : [new Date().getFullYear()];
}

function _pedidosDoAno(ano) {
    return DB.pedidos.filter(p => p.data?.startsWith(String(ano)));
}

function _ordensDoAno(ano) {
    const ids = new Set(_pedidosDoAno(ano).map(p => p.id));
    return DB.ordens.filter(o => ids.has(o.pedidoId));
}

function _dashTimeline() {
    const ativas = DB.ordens
        .filter(o => !['Concluída', 'Cancelada'].includes(o.estado))
        .sort((a, b) => {
            if (a.dataLimiteEntrega && b.dataLimiteEntrega)
                return a.dataLimiteEntrega.localeCompare(b.dataLimiteEntrega);
            if (a.dataLimiteEntrega) return -1;
            if (b.dataLimiteEntrega) return 1;
            return 0;
        });

    if (!ativas.length)
        return `<tr><td colspan="5" style="text-align:center;color:var(--color-text-muted);padding:1.5rem">Sem ordens ativas.</td></tr>`;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return ativas.map(o => {
        const pd = getPedido(o.pedidoId);
        const cl = resolveCliente(pd.clienteTipo, pd.clienteId);
        const clienteLabel = pd.clienteTipo === 'particular'
            ? `<div style="line-height:1.2"><div>${cl.nome}</div><div style="font-size:11px;color:var(--color-text-muted)">Particular</div></div>`
            : `<div style="line-height:1.2"><div>${cl.subtexto}</div><div style="font-size:11px;color:var(--color-text-muted)">${cl.nome}</div></div>`;

        const criado = o.criado_em ? new Date(o.criado_em.slice(0, 10)) : null;
        const limite = o.dataLimiteEntrega ? new Date(o.dataLimiteEntrega) : null;

        let barraHtml = '<span style="color:var(--color-text-muted);font-size:11px;">—</span>';
        if (criado && limite) {
            const total = Math.round((limite - criado) / 86400000);
            const passados = Math.round((hoje - criado) / 86400000);
            const pct = total > 0 ? Math.min(Math.round(passados / total * 100), 100) : 100;
            const restantes = Math.round((limite - hoje) / 86400000);
            const atrasado = restantes < 0;

            const cor = atrasado       ? '#a32d2d'
                      : pct >= 80     ? '#c05c00'
                      : pct >= 50     ? '#854f0b'
                      :                 '#3b6d11';

            const tooltip = atrasado
                ? `Atrasada ${Math.abs(restantes)} dia(s)`
                : `${passados} dia(s) passados · ${restantes} dia(s) restantes`;

            barraHtml = `
              <div title="${tooltip}" style="display:flex;flex-direction:column;gap:3px;min-width:140px;">
                <div style="height:8px;border-radius:4px;background:#b8b5aa;overflow:hidden;">
                  <div style="height:100%;width:${pct}%;background:${cor};border-radius:4px;transition:width .3s;"></div>
                </div>
                <div style="font-size:10px;color:${cor};font-weight:500;">${tooltip}</div>
              </div>`;
        }

        return `<tr>
          <td><strong>${o.num}</strong></td>
          <td>${inlineFlex(avatarHtml(cl.nome, cl.avClass, true), clienteLabel)}</td>
          <td style="white-space:nowrap;">${criado ? criado.toLocaleDateString('pt-PT') : '—'}</td>
          <td>${barraHtml}</td>
          <td style="white-space:nowrap;">${limite ? limite.toLocaleDateString('pt-PT') : '—'}</td>
        </tr>`;
    }).join('');
}

function _updateDashAno() {
    const vp = document.getElementById('dash-ano-pedidos');
    const vo = document.getElementById('dash-ano-ordens');
    if (vp) vp.textContent = _pedidosDoAno(_dashAno).length;
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
    const ESTADO_CORES = {
        'Em curso':  '#185fa5',
        'Pendente':  '#854f0b',
        'Falta OC':  '#c05c00',
        'Faturar':   '#a32d2d',
        'Concluída': '#3b6d11',
        'Cancelada': '#3d3d3d',
    };
    const estados = {};
    DB.ordens.forEach((o) => {
        estados[o.estado] = (estados[o.estado] || 0) + 1;
    });
    const estadoLabels = Object.keys(estados);
    _chartEstados = new Chart(document.getElementById('chart-estados'), {
        type: 'doughnut',
        data: {
            labels: estadoLabels,
            datasets: [
                {
                    data: Object.values(estados),
                    backgroundColor: estadoLabels.map(e => ESTADO_CORES[e] || '#9e9c96'),
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
