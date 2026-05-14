/**
 * pages/ordens.js
 * -------------------------------------------------
 * Lista de ordens de trabalho com ação para concluir.
 * -------------------------------------------------
 */

function renderOrdens() {
    document.getElementById('page-ordens').innerHTML = `
    <div class="section-header">
      <span class="section-count">${DB.ordens.length} ordens de trabalho</span>
    </div>
    <div class="full-card">
      <table class="table">
        <thead>
          <tr>
            <th>OT Nº</th><th>Pedido</th><th>Cliente</th>
            <th>Ordem de Compra</th><th>Equipamento</th><th>Estado</th><th>Operador</th><th>Prazo</th><th>Ação</th>
          </tr>
        </thead>
        <tbody>${_ordensRows()}</tbody>
      </table>
    </div>`;
}

function _ordensRows() {
    if (!DB.ordens.length) {
        return `<tr><td colspan="10" style="text-align:center;color:var(--color-text-muted);padding:2rem">
      Nenhuma ordem de trabalho criada.</td></tr>`;
    }
    return DB.ordens
        .map((o) => {
            const pd = getPedido(o.pedidoId);
            const cl = resolveCliente(pd.clienteTipo, pd.clienteId);
            const dp = getDadosPedido(pd.dadosPedidoId);
            const canConc = o.estado === 'Em curso';
            const label =
                pd.clienteTipo === 'particular'
                    ? `<div style="line-height:1.2;"><div>${cl.nome}</div><div style="font-size:11px;color:var(--color-text-muted)">Particular</div></div>`
                    : `<div style="line-height:1.2;"><div>${cl.subtexto}</div><div style="font-size:11px;color:var(--color-text-muted)">${cl.nome}</div></div>`;

            return `<tr>
      <td><strong>${o.num}</strong></td>
      <td><a href="#" onclick="showPedidoDetalhe(${pd.id}); return false;" style="color:var(--color-primary);text-decoration:none;cursor:pointer;">${pd.ref}</a></td>
      <td>${inlineFlex(avatarHtml(cl.nome, cl.avClass, true), label)}</td>
     
      <td>${dp.ordem_compra || '—'}</td>
      <td>${dp.equipamento || '—'}</td>
      <td>${estadoBadge(o.estado)}</td>
      <td>${o.operador || '—'}</td>
      <td>${o.prazo || '—'}</td>
      <td>${
          canConc
              ? `<button class="btn btn-sm" onclick="concluirOT(${o.id})">Concluir</button>`
              : '—'
      }</td>
    </tr>`;
        })
        .join('');
}

async function concluirOT(otId) {
    try {
        await apiPatch(`/ordens/${otId}/concluir`);
        await carregarDados();
        renderAll();
    } catch (err) {
        alert('Erro ao concluir OT: ' + err.message);
    }
}
