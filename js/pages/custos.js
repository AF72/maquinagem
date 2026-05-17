/**
 * pages/custos.js
 * -------------------------------------------------
 * Módulo de custos: métricas, detalhe por ordem
 * e gráfico de custo por material.
 * -------------------------------------------------
 */


function _valorOT(o) {
    const orc = DB.orcamentos.find(oc => oc.pedidoId === o.pedidoId && oc.ativo && oc.estado === 'Aprovado')
             || DB.orcamentos.find(oc => oc.pedidoId === o.pedidoId && oc.ativo);
    return Number(orc?.valor || 0);
}

function renderCustos() {
    const aFaturar = DB.ordens
        .filter((o) => o.estado === 'Faturar')
        .reduce((s, o) => s + _valorOT(o), 0);
    const totalFaturado = DB.ordens
        .filter((o) => o.estado === 'Concluída')
        .reduce((s, o) => s + _valorOT(o), 0);
    const totalOrcamentado = DB.orcamentos
        .filter(o => o.ativo)
        .reduce((s, o) => s + Number(o.valor || 0), 0);
    const totalAprovados = DB.orcamentos
        .filter(o => o.estado === 'Aprovado')
        .reduce((s, o) => s + Number(o.valor || 0), 0);

    document.getElementById('page-custos').innerHTML = `
    <div class="grid-metrics-4">
      <div class="metric-card">
        <div class="metric-label">Total orçamentado</div>
        <div class="metric-value">${totalOrcamentado.toFixed(2)} €</div>
        <div class="metric-sub">orçamentos ativos</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Total Orc. Aprovados</div>
        <div class="metric-value">${totalAprovados.toFixed(2)} €</div>
        <div class="metric-sub">orçamentos aprovados</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Total OT a faturar</div>
        <div class="metric-value">${aFaturar.toFixed(2)} €</div>
        <div class="metric-sub">ordens com estado "Faturar"</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Total faturado</div>
        <div class="metric-value">${totalFaturado.toFixed(2)} €</div>
        <div class="metric-sub">ordens concluídas</div>
      </div>
    </div>

    <div class="full-card">
      <div class="card-title">Ordens de trabalho a faturar</div>
      <table class="table">
        <thead>
          <tr>
            <th>OT Nº</th><th>Cliente</th><th>Empresa</th><th>Tipo</th>
            <th>Data Entrega</th><th>GT Nº</th><th>Valor (€)</th><th>Estado</th>
          </tr>
        </thead>
        <tbody>${_faturarRows()}</tbody>
      </table>
    </div>

    `;
}

function _faturarRows() {
    const ordens = DB.ordens.filter(o => o.estado === 'Faturar');
    if (!ordens.length) {
        return `<tr><td colspan="8" style="text-align:center;color:var(--color-text-muted);padding:2rem;">
            Sem ordens de trabalho a faturar.</td></tr>`;
    }
    return ordens.map(o => {
        const pd = getPedido(o.pedidoId);
        const cl = resolveCliente(pd.clienteTipo, pd.clienteId);
        const valor = _valorOT(o);
        return `<tr>
            <td><strong>${o.num}</strong></td>
            <td>${cl.nome}</td>
            <td>${cl.subtexto || '—'}</td>
            <td>${tipoBadge(pd.clienteTipo)}</td>
            <td>${o.dataLimiteEntrega || '—'}</td>
            <td>${o.n_gt || '—'}</td>
            <td><strong>${valor.toFixed(2)} €</strong></td>
            <td>${estadoBadge(o.estado)}</td>
        </tr>`;
    }).join('');
}

