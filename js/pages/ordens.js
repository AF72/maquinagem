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
            <th>Ordem de Compra</th><th>Prazo</th><th>Data Limite Entrega</th><th>Nº GT</th><th>Nº FT</th><th>Estado</th><th>Ação</th>
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
            const label =
                pd.clienteTipo === 'particular'
                    ? `<div style="line-height:1.2;"><div>${cl.nome}</div><div style="font-size:11px;color:var(--color-text-muted)">Particular</div></div>`
                    : `<div style="line-height:1.2;"><div>${cl.subtexto}</div><div style="font-size:11px;color:var(--color-text-muted)">${cl.nome}</div></div>`;

            return `<tr>
      <td><strong>${o.num}</strong></td>
      <td><a href="#" onclick="showPedidoDetalhe(${pd.id}); return false;" style="color:var(--color-primary);text-decoration:none;cursor:pointer;">${pd.ref}</a></td>
      <td>${inlineFlex(avatarHtml(cl.nome, cl.avClass, true), label)}</td>
     
      <td>${dp.ordem_compra || '—'}</td>
      <td>${o.prazo != null ? o.prazo + ' sem.' : '—'}</td>
      <td>${o.dataLimiteEntrega || '—'}</td>
      <td>${o.n_gt || '—'}</td>
      <td>${o.n_ft || '—'}</td>
      <td>${estadoBadge(o.estado)}</td>
      <td>
        <button class="btn btn-ghost btn-sm" title="Ver detalhe" onclick="verDetalheOT(${o.id})">${ICON_VIEW}</button>
      </td>
    </tr>`;
        })
        .join('');
}

let _currentOrdemId = null;

function showOrdemDetalhe(otId) {
    _currentOrdemId = otId;
    showPage('ordem_detalhe');
}

function verDetalheOT(otId) {
    showOrdemDetalhe(otId);
}

function renderOrdemDetalhe() {
    const ot = DB.ordens.find((o) => o.id === _currentOrdemId);
    if (!ot) return;
    const pd  = getPedido(ot.pedidoId);
    const cl  = resolveCliente(pd.clienteTipo, pd.clienteId);
    const dp  = getDadosPedido(pd.dadosPedidoId);
    const orc = DB.orcamentos.find((o) => o.pedidoId === pd.id && o.ativo)
             || DB.orcamentos.find((o) => o.pedidoId === pd.id);

    document.getElementById('page-ordem_detalhe').innerHTML = `
    <div class="section-header">
      <button class="btn btn-ghost-back" onclick="showPage('ordens')">&#x21a9 Voltar às Ordens</button>
      <span class="section-count">Detalhe da Ordem: ${ot.num}</span>
    </div>
    <div class="full-card" style="max-width:800px;margin:0 auto;padding:2rem">
      <div class="form-grid">

        <div class="form-group full">
          <h4 style="margin:0 0 0.25rem;color:var(--color-primary);">Ordem de Trabalho</h4>
          <hr style="border:none;border-top:2px solid var(--color-primary);margin:0 0 0.5rem">
        </div>

        <div class="form-group" style="display:flex;flex-direction:column;gap:8px;">
          <div>
            <label class="form-label">Criado em</label>
            <input type="date" value="${ot.criado_em?.slice(0,10) || ''}" readonly style="background:#ddedda;cursor:not-allowed;height:30px;box-sizing:border-box;width:100%;">
          </div>
          <div style="display:flex;gap:8px;">
            <div style="flex:0 0 100px;">
              <label class="form-label">Prazo (sem.)</label>
              <input id="f-prazo" type="number" min="1" value="${ot.prazo ?? ''}" oninput="_calcDataLimite('${ot.criado_em?.slice(0,10) || today()}')" style="height:30px;box-sizing:border-box;width:100%;">
            </div>
            <div style="flex:1;">
              <label class="form-label">Data Limite Entrega</label>
              <input id="f-data_limite_entrega" type="date" value="${ot.dataLimiteEntrega || ''}" readonly style="background:#ddedda;cursor:not-allowed;height:30px;box-sizing:border-box;width:100%;">
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Estado</label>
          <select id="f-estado" style="height:30px;box-sizing:border-box;">
            ${['Em curso','Pendente','Falta OC','Faturar','Concluída'].map(s =>
              `<option value="${s}" ${ot.estado === s ? 'selected' : ''}>${s}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Concluído em</label><input id="f-concluido_em" type="date" value="${ot.concluido_em?.slice(0,10) || ''}" style="height:30px;box-sizing:border-box;"></div>

        <div class="form-group full">
          <h4 style="margin:1.5rem 0 0.25rem;color:var(--color-primary);">Dados do Pedido</h4>
          <hr style="border:none;border-top:2px solid var(--color-primary);margin:0 0 0.5rem">
        </div>

        <div class="form-group"><label class="form-label">Nº Pedido</label><input value="${pd.ref || '—'}" disabled></div>
        <div class="form-group"><label class="form-label">Ordem de Compra</label><input value="${dp.ordem_compra || '—'}" disabled></div>
        <div class="form-group"><label class="form-label">Cliente</label><input value="${cl.nome}" disabled></div>
        <div class="form-group"><label class="form-label">Empresa / Tipo</label><input value="${cl.subtexto}" disabled></div>
        <div class="form-group"><label class="form-label">Nº Orçamento</label><input value="${orc ? orc.ref : '—'}" disabled></div>
        <div class="form-group"><label class="form-label">Valor Orçamento</label><input value="${orc ? Number(orc.valor).toFixed(2) + ' €' : '—'}" disabled></div>

        <div class="form-group full">
          <h4 style="margin:1.5rem 0 0.25rem;color:var(--color-primary);">Dados do Equipamento</h4>
          <hr style="border:none;border-top:2px solid var(--color-primary);margin:0 0 0.5rem">
        </div>

        <div class="form-group"><label class="form-label">Ref. Equipamento</label><input value="${dp.ref || '—'}" disabled></div>
        <div class="form-group"><label class="form-label">Equipamento</label><input value="${dp.equipamento || '—'}" disabled></div>
        <div class="form-group"><label class="form-label">Órgão</label><input value="${dp.orgao || '—'}" disabled></div>
        <div class="form-group"><label class="form-label">Parte</label><input value="${dp.parte || '—'}" disabled></div>
        <div class="form-group full"><label class="form-label">Breve Descrição</label><input value="${dp.breveDescricao || dp.breve_descricao || '—'}" disabled></div>

      </div>
      <div class="form-actions" style="margin-top:2rem">
        <button class="btn" onclick="showPage('ordens')">Cancelar</button>
        <button class="btn btn-primary" onclick="saveOrdemDetalhe(${ot.id})">Guardar alterações</button>
      </div>
    </div>`;
}

function _calcDataLimite(criadoEm) {
    const semanas = parseInt(document.getElementById('f-prazo')?.value);
    const campo = document.getElementById('f-data_limite_entrega');
    if (!campo) return;
    if (!semanas || semanas < 1) { campo.value = ''; return; }
    const base = new Date(criadoEm);
    base.setDate(base.getDate() + semanas * 7);
    campo.value = base.toISOString().slice(0, 10);
}

async function saveOrdemDetalhe(otId) {
    const prazoVal = document.getElementById('f-prazo')?.value;
    const dataLimite = document.getElementById('f-data_limite_entrega')?.value;
    const concluidoEm = document.getElementById('f-concluido_em')?.value;
    const estado = document.getElementById('f-estado')?.value;
    const payload = {
        prazo:               prazoVal ? parseInt(prazoVal) : null,
        data_limite_entrega: dataLimite || null,
        concluido_em:        concluidoEm || null,
        estado:              estado || undefined,
    };
    try {
        await apiPut(`/ordens/${otId}`, payload);
        await carregarDados();
        renderAll();
    } catch (err) {
        alert('Erro ao guardar: ' + err.message);
    }
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
