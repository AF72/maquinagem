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
        <div class="metric-value">${formatEuro(totalOrcamentado)}</div>
        <div class="metric-sub">orçamentos ativos</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Total Orc. Aprovados</div>
        <div class="metric-value">${formatEuro(totalAprovados)}</div>
        <div class="metric-sub">orçamentos aprovados</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Total OT a faturar</div>
        <div class="metric-value">${formatEuro(aFaturar)}</div>
        <div class="metric-sub">ordens com estado "Faturar"</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Total faturado</div>
        <div class="metric-value">${formatEuro(totalFaturado)}</div>
        <div class="metric-sub">ordens concluídas</div>
      </div>
    </div>

    <div class="full-card">
      <div class="card-title">Resumo por cliente</div>
      <table class="table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th style="text-align:center;">Nº Pedidos</th>
            <th style="text-align:center;">Nº Ordens</th>
            <th style="text-align:right;">Total Orçamentado (€)</th>
          </tr>
        </thead>
        <tbody>${_resumoClientesRows()}</tbody>
      </table>
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

function _resumoClientesRows() {
    const stats = {};

    DB.pedidos.forEach(p => {
        let key, nome;
        if (p.clienteTipo === 'particular') {
            const part = getParticular(p.clienteId);
            key = `particular_${p.clienteId}`;
            nome = part?.nome || '—';
        } else {
            const colab = getColab(p.clienteId);
            const emp = getEmpresa(colab?.empresaId);
            key = `empresa_${colab?.empresaId}`;
            nome = emp?.nome || '—';
        }

        if (!stats[key]) stats[key] = { nome, pedidos: 0, ordens: 0, valorTotal: 0 };
        stats[key].pedidos++;

        const ordensP = DB.ordens.filter(o => o.pedidoId === p.id);
        stats[key].ordens += ordensP.length;
        ordensP.forEach(o => { stats[key].valorTotal += _valorOT(o); });
    });

    const linhas = Object.values(stats).sort((a, b) => b.valorTotal - a.valorTotal);

    if (!linhas.length) {
        return `<tr><td colspan="4" style="text-align:center;color:var(--color-text-muted);padding:2rem;">Sem dados.</td></tr>`;
    }

    return linhas.map(r => `<tr>
        <td>${r.nome}</td>
        <td style="text-align:center;">${r.pedidos}</td>
        <td style="text-align:center;">${r.ordens}</td>
        <td style="text-align:right;"><strong>${formatEuro(r.valorTotal)}</strong></td>
    </tr>`).join('');
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
            <td><a href="#" onclick="verDetalheOT(${o.id});return false;" style="font-weight:600;">${o.num}</a></td>
            <td>${cl.nome}</td>
            <td>${cl.subtexto || '—'}</td>
            <td>${tipoBadge(pd.clienteTipo)}</td>
            <td>${o.dataLimiteEntrega || '—'}</td>
            <td>${o.n_gt || '—'}</td>
            <td><strong>${formatEuro(valor)}</strong></td>
            <td>${estadoBadge(o.estado)}</td>
        </tr>`;
    }).join('');
}

