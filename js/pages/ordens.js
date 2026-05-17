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
let _isOTEditMode = false;

function showOrdemDetalhe(otId) {
    _currentOrdemId = otId;
    _isOTEditMode = false;
    showPage('ordem_detalhe');
}

function toggleOTEditMode() {
    _isOTEditMode = true;
    renderOrdemDetalhe();
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
    const orc = DB.orcamentos.find((o) => o.pedidoId === pd.id && o.ativo && o.estado === 'Aprovado')
             || DB.orcamentos.find((o) => o.pedidoId === pd.id && o.ativo)
             || DB.orcamentos.find((o) => o.pedidoId === pd.id);
    const orcAprovado = DB.orcamentos.find((o) => o.pedidoId === pd.id && o.ativo && o.estado === 'Aprovado');
    const orcItens        = orcAprovado ? DB.orcamento_itens.filter(i => i.orcamentoId === orcAprovado.id && i.itemTipo !== 'servico') : [];
    const orcServicos     = orcAprovado ? DB.orcamento_itens.filter(i => i.orcamentoId === orcAprovado.id && i.itemTipo === 'servico')  : [];
    const _dimPeca = (pc) => {
        const parts = [];
        if (pc.comprimento) parts.push(`C:${pc.comprimento}`);
        if (pc.largura)     parts.push(`L:${pc.largura}`);
        if (pc.diametro_ext) parts.push(`∅ext:${pc.diametro_ext}`);
        if (pc.diametro_int) parts.push(`∅int:${pc.diametro_int}`);
        return parts.join(' · ') || '—';
    };

    document.getElementById('page-ordem_detalhe').innerHTML = `
    <div class="section-header">
      <button class="btn btn-ghost-back" onclick="showPage('ordens')">&#x21a9 Voltar às Ordens</button>
      <span class="section-count">Detalhe da Ordem: ${ot.num}</span>
    </div>
    <div class="full-card" style="padding:2rem;">
      <div class="form-grid">

        <div style="grid-column:1/-1;display:flex;flex-direction:row;gap:16px;">
          <div style="flex:2;display:flex;flex-direction:column;gap:4px;">
            <label class="form-label">Nº Ordem de Trabalho</label>
            <input value="${ot.num || '—'}" readonly style="background:#ddedda;cursor:not-allowed;height:30px;box-sizing:border-box;width:100%;border:none;">
          </div>
          <div style="flex:1.5;display:flex;flex-direction:column;gap:4px;">
            <label class="form-label">Criado em</label>
            <input type="date" value="${ot.criado_em?.slice(0,10) || ''}" readonly style="background:#ddedda;cursor:not-allowed;height:30px;box-sizing:border-box;width:100%;border:none;">
          </div>
          <div style="flex:0 0 90px;display:flex;flex-direction:column;gap:4px;">
            <label class="form-label">Prazo (sem.)</label>
            <input id="f-prazo" type="number" min="1" value="${ot.prazo ?? ''}" oninput="_calcDataLimite('${ot.criado_em?.slice(0,10) || today()}')" ${!_isOTEditMode ? 'disabled' : ''} style="height:30px;box-sizing:border-box;width:100%;">
          </div>
          <div style="flex:1.5;display:flex;flex-direction:column;gap:4px;">
            <label class="form-label">Data Limite Entrega</label>
            <input id="f-data_limite_entrega" type="date" value="${ot.dataLimiteEntrega || ''}" readonly style="background:#ddedda;cursor:not-allowed;height:30px;box-sizing:border-box;width:100%;border:none;">
          </div>
          <div style="flex:1.5;display:flex;flex-direction:column;gap:4px;">
            <label class="form-label">Estado</label>
            <select id="f-estado" ${!_isOTEditMode ? 'disabled' : ''} style="height:30px;box-sizing:border-box;width:100%;">
              ${['Em curso','Pendente','Falta OC','Faturar','Concluída'].map(s =>
                `<option value="${s}" ${ot.estado === s ? 'selected' : ''}>${s}</option>`
              ).join('')}
            </select>
          </div>
        </div>

        <div style="grid-column:1/-1;display:flex;flex-direction:row;align-items:flex-end;gap:16px;">
          <div class="form-group" style="flex:0 0 auto;">
            <label class="form-label">Concluído em</label>
            <input id="f-concluido_em" type="date" value="${ot.concluido_em?.slice(0,10) || ''}" ${!_isOTEditMode ? 'disabled' : ''}>
          </div>
          <div class="form-group" style="flex:0 0 auto;">
            <label class="form-label">Guia Transporte</label>
            <input id="f-n_gt" value="${ot.n_gt || ''}" ${!_isOTEditMode ? 'disabled' : ''}>
          </div>
          <div class="form-group" style="flex:0 0 auto;">
            <label class="form-label">Fatura</label>
            <input id="f-n_ft" value="${ot.n_ft || ''}" ${!_isOTEditMode ? 'disabled' : ''}>
          </div>
          <div class="form-group" style="flex:1;">
            <label class="form-label">Informação</label>
            <div style="height:34px;display:flex;align-items:center;padding:0 10px;border-radius:var(--radius-md);border:1px solid var(--color-border);font-size:12px;font-weight:500;
              ${(() => {
                const estado = ot.estado;
                if (estado === 'Em curso' || estado === 'Pendente') return 'background:#fff8e1;color:#7c5a00;';
                if (estado === 'Falta OC') return 'background:#fdecea;color:#a00;';
                if (estado === 'Concluída') return 'background:#e8f5e9;color:#2e7d32;';
                return 'background:var(--color-surface-alt);color:var(--color-text-muted);';
              })()}">
              ${(() => {
                const hoje = new Date(); hoje.setHours(0,0,0,0);
                const estado = ot.estado;
                if (estado === 'Em curso' || estado === 'Pendente') {
                  if (!ot.dataLimiteEntrega) return 'Sem data limite definida';
                  const limite = new Date(ot.dataLimiteEntrega); limite.setHours(0,0,0,0);
                  const dias = Math.round((limite - hoje) / 86400000);
                  if (dias < 0) return 'Data limite ultrapassada há ' + Math.abs(dias) + ' dia(s)';
                  if (dias === 0) return 'Data limite é hoje!';
                  return 'Faltam ' + dias + ' dia(s) para atingir a data limite';
                }
                if (estado === 'Falta OC') {
                  const conc = ot.concluido_em ? new Date(ot.concluido_em.slice(0,10)) : null;
                  const limite = ot.dataLimiteEntrega ? new Date(ot.dataLimiteEntrega) : null;
                  if (!conc) return 'Sem data de conclusão — PEDIR OC';
                  const dias = Math.round((hoje - conc) / 86400000);
                  return 'Trabalho entregue há ' + dias + ' dia(s) — PEDIR OC';
                }
                if (estado === 'Concluída') return 'Ordem de Trabalho Faturada';
                return '';
              })()}
            </div>
          </div>
          <div style="margin-left:auto;display:flex;gap:8px;align-items:flex-end;">
            <button class="btn" style="width:120px;" onclick="showPage('ordens')">Cancelar</button>
            ${!_isOTEditMode
              ? `<button class="btn btn-primary" style="width:120px;" onclick="toggleOTEditMode()">Editar</button>`
              : `<button class="btn btn-primary" style="width:120px;" onclick="saveOrdemDetalhe(${ot.id})">Guardar alterações</button>`
            }
          </div>
        </div>

        <div class="form-group full"><h4 style="margin:1.5rem 0 0.25rem;color:var(--color-primary);">Dados do Pedido</h4><hr style="border:none;border-top:2px solid var(--color-primary);margin:0 0 0.5rem;"></div>
        <div style="grid-column:1/-1;display:flex;flex-direction:row;gap:16px;">
          <div class="form-group" style="flex:1;">
            <label class="form-label">Nº Pedido</label>
            <div style="height:34px;box-sizing:border-box;display:flex;align-items:center;background:#ddedda;border:1px solid var(--color-border);border-radius:var(--radius-md);padding:0 10px;">
              <a href="#" onclick="showPedidoDetalhe(${pd.id});return false;" style="font-weight:600;color:var(--color-primary);text-decoration:underline;">${pd.ref}</a>
            </div>
          </div>
          <div class="form-group" style="flex:2;">
            <label class="form-label">Cliente</label>
            <input value="${cl.nome}" readonly>
          </div>
          <div class="form-group" style="flex:2;">
            <label class="form-label">Empresa / Tipo</label>
            <input value="${cl.subtexto}" readonly>
          </div>
        </div>
        <div style="grid-column:1/-1;display:flex;flex-direction:row;gap:16px;">
          <div class="form-group" style="flex:1;">
            <label class="form-label">Ordem de Compra</label>
            <input value="${dp.ordem_compra || '—'}" readonly>
          </div>
          <div class="form-group" style="flex:1;">
            <label class="form-label">Nº Orçamento</label>
            <input value="${orc ? orc.ref : '—'}" readonly>
          </div>
          <div class="form-group" style="flex:1;">
            <label class="form-label">Valor Orçamento</label>
            <input value="${orc ? Number(orc.valor).toFixed(2) + ' €' : '—'}" readonly>
          </div>
        </div>

        <div class="form-group full"><h4 style="margin:1.5rem 0 0.25rem;color:var(--color-primary);">Dados do Equipamento</h4><hr style="border:none;border-top:2px solid var(--color-primary);margin:0 0 0.5rem;"></div>
        <div class="form-group"><label class="form-label">Ref. Equipamento</label><input value="${dp.ref || '—'}" disabled></div>
        <div class="form-group"><label class="form-label">Equipamento</label><input value="${dp.equipamento || '—'}" disabled></div>
        <div class="form-group"><label class="form-label">Órgão</label><input value="${dp.orgao || '—'}" disabled></div>
        <div class="form-group"><label class="form-label">Parte</label><input value="${dp.parte || '—'}" disabled></div>
        <div class="form-group full"><label class="form-label">Breve Descrição</label><input value="${dp.breveDescricao || dp.breve_descricao || '—'}" disabled></div>

        <div class="form-group full"><h4 style="margin:1.5rem 0 0.25rem;color:var(--color-primary);">Lista de Peças Orçamentadas</h4><hr style="border:none;border-top:2px solid var(--color-primary);margin:0 0 0.5rem;"></div>
        <div class="form-group full">
          ${orcItens.length === 0
            ? `<p style="font-size:12px;color:var(--color-text-muted);margin:0;">${orcAprovado ? 'Sem peças no orçamento.' : 'Não existe orçamento ativo e aprovado.'}</p>`
            : `<table class="table" style="font-size:12px;">
                <thead><tr>
                  <th>Referência</th>
                  <th>Denominação</th>
                  <th>Plano</th>
                  <th>Material</th>
                  <th>Dimensões (mm)</th>
                  <th>Peso (kg)</th>
                  <th style="text-align:center;">Qtd.</th>
                  <th style="text-align:right;">Custo (€)</th>
                </tr></thead>
                <tbody>
                  ${orcItens.map(item => {
                    const pc = DB.pecas.find(p => p.id === item.pecaId);
                    if (!pc) return '';
                    return `<tr>
                      <td><a href="#" onclick="verPecaOverlay(${pc.id});return false;" style="font-weight:600;color:var(--color-primary);text-decoration:underline;">${pc.ref || '—'}</a></td>
                      <td>${pc.denominacao || '—'}</td>
                      <td>${pc.plano || '—'}</td>
                      <td>${_resolverMaterial(pc.materiaPrimaId)}</td>
                      <td>${_dimPeca(pc)}</td>
                      <td>${pc.peso != null ? pc.peso : '—'}</td>
                      <td style="text-align:center;">${item.quantidade}</td>
                      <td style="text-align:right;">${Number(item.precoUnitario).toFixed(2)}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>`
          }
        </div>

        <div class="form-group full"><h4 style="margin:1.5rem 0 0.25rem;color:var(--color-primary);">Lista de Serviços Orçamentados</h4><hr style="border:none;border-top:2px solid var(--color-primary);margin:0 0 0.5rem;"></div>
        <div class="form-group full">
          ${orcServicos.length === 0
            ? `<p style="font-size:12px;color:var(--color-text-muted);margin:0;">${orcAprovado ? 'Sem serviços no orçamento.' : 'Não existe orçamento ativo e aprovado.'}</p>`
            : `<table class="table" style="font-size:12px;">
                <thead><tr>
                  <th>Referência</th>
                  <th>Tipo de Serviço</th>
                  <th style="text-align:center;">Qtd.</th>
                  <th>Unidade</th>
                  <th style="text-align:right;">Preço Unit. (€)</th>
                  <th style="text-align:right;">Sub-total (€)</th>
                </tr></thead>
                <tbody>
                  ${orcServicos.map(item => {
                    const sv = item.servico || DB.servicos.find(s => s.id === item.servicoId);
                    if (!sv) return '';
                    const subtotal = (item.quantidade * item.precoUnitario).toFixed(2);
                    return `<tr>
                      <td><a href="#" onclick="verServicoOverlay(${sv.id});return false;" style="font-weight:600;color:var(--color-primary);text-decoration:underline;">${sv.ref || '—'}</a></td>
                      <td>${sv.tipo_servico || '—'}</td>
                      <td style="text-align:center;">${item.quantidade}</td>
                      <td>${sv.unidade || '—'}</td>
                      <td style="text-align:right;">${Number(item.precoUnitario).toFixed(2)}</td>
                      <td style="text-align:right;font-weight:600;">${subtotal}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>`
          }
        </div>

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
        n_gt:                document.getElementById('f-n_gt')?.value || undefined,
        n_ft:                document.getElementById('f-n_ft')?.value || undefined,
    };
    try {
        await apiPut(`/ordens/${otId}`, payload);
        _isOTEditMode = false;
        await carregarDados();
        renderAll();
        _successToast('Ordem de trabalho gravada com sucesso.');
    } catch (err) {
        _erroToast('Erro ao guardar: ' + err.message);
    }
}

async function concluirOT(otId) {
    try {
        await apiPatch(`/ordens/${otId}/concluir`);
        await carregarDados();
        renderAll();
        _successToast('Ordem concluída.');
    } catch (err) {
        _erroToast('Erro ao concluir OT: ' + err.message);
    }
}
