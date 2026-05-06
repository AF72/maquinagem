/**
 * pages/orcamentos.js
 * -------------------------------------------------
 * Gestão de orçamentos (um por pedido)
 * -------------------------------------------------
 */

/*Constantes de ícones*/
const ICON_ORCAMENTO_VIEW = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="12" height="12" rx="1"/><path d="M5 6h6M5 10h4"/></svg>`;
const ICON_ORCAMENTO_EDIT = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 14h3l8-8-3-3-8 8v3z"/><circle cx="12" cy="4" r="0.5"/></svg>`;

/**
 * Renderiza a lista de orçamentos
 */
function renderOrcamentos() {
    document.getElementById('page-orcamentos').innerHTML = `
    <div class="section-header">
      <span class="section-count">${DB.orcamentos.length} orçamentos</span>
      <button class="btn btn-primary" onclick="showOrcamentoDetalhe(null)">+ Novo Orçamento</button>
    </div>
    <div class="full-card">
      <table class="table">
        <thead>
          <tr>
            <th>Pedido</th><th>Cliente</th><th>Valor (€)</th><th>Data Emissão</th><th>Validade</th><th>Estado</th><th>Ação</th>
          </tr>
        </thead>
        <tbody>${_orcamentosRows()}</tbody>
      </table>
    </div>`;
}

/**
 * Renderiza linhas da tabela de orçamentos
 */
function _orcamentosRows() {
    return DB.orcamentos
        .map((orc) => {
            const pedido = getPedido(orc.pedidoId);
            if (!pedido) return '';
            const cliente = resolveCliente(
                pedido.clienteTipo,
                pedido.clienteId,
            );
            const estadoBg =
                orc.estado === 'Aprovado'
                    ? 'badge-green'
                    : orc.estado === 'Rejeitado'
                      ? 'badge-red'
                      : 'badge-orange';

            return `<tr>
      <td><strong>${pedido.ref}</strong></td>
      <td>${cliente.nome}</td>
      <td><strong>${orc.valor.toFixed(2)}</strong></td>
      <td>${orc.dataEmissao}</td>
      <td>${orc.dataValidade}</td>
      <td><span class="badge ${estadoBg}">${orc.estado}</span></td>
      <td>
        <button class="btn btn-ghost btn-sm" title="Ver orçamento" onclick="showOrcamentoDetalhe(${orc.id})">${ICON_ORCAMENTO_VIEW}</button>
        <button class="btn btn-ghost btn-sm" title="Editar" onclick="editarOrcamento(${orc.id})">${ICON_ORCAMENTO_EDIT}</button>
      </td>
    </tr>`;
        })
        .join('');
}

let _currentOrcamentoId = null;
let _isOrcamentoEditMode = false;

function showOrcamentoDetalhe(id) {
    _currentOrcamentoId = id;
    _isOrcamentoEditMode = false;
    showPage('orcamento_detalhe');
}

function editarOrcamento(id) {
    _currentOrcamentoId = id;
    _isOrcamentoEditMode = true;
    showPage('orcamento_detalhe');
}

function renderOrcamentoDetalhe() {
    const isNew = !_currentOrcamentoId;
    const orc = isNew
        ? {
              pedidoId: null,
              valor: '',
              dataEmissao: today(),
              dataValidade: addDays(30),
              descricao: '',
              estado: 'Pendente',
              notas: '',
          }
        : DB.orcamentos.find((x) => x.id === _currentOrcamentoId);

    if (!orc && !isNew) return;

    // Listar pedidos sem orçamento (ou o atual)
    const pedidoOpts = DB.pedidos
        .map((p) => {
            const existing = DB.orcamentos.find((o) => o.pedidoId === p.id);
            const sel = orc && orc.pedidoId === p.id ? 'selected' : '';
            // Mostrar pedidos sem orçamento ou o pedido atual se em edição
            if (existing && existing.id !== (orc?.id || -1)) return '';
            const cliente = resolveCliente(p.clienteTipo, p.clienteId);
            return `<option value="${p.id}" ${sel}>${p.ref} — ${cliente.nome}</option>`;
        })
        .join('');

    const formHtml = `
  <div class="form-grid">
    <div class="form-group">
      <label class="form-label">Pedido</label>
      <select id="f-orcamento-pedido" ${!isNew && !_isOrcamentoEditMode ? 'disabled' : ''}>
        <option value="">Selecionar pedido</option>
        ${pedidoOpts}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Valor (€)</label>
      <input id="f-orcamento-valor" type="number" step="0.01" value="${orc.valor || ''}" ${!isNew && !_isOrcamentoEditMode ? 'disabled' : ''}>
    </div>
    <div class="form-group">
      <label class="form-label">Data Emissão</label>
      <input id="f-orcamento-emissao" type="date" value="${orc.dataEmissao}" ${!isNew && !_isOrcamentoEditMode ? 'disabled' : ''}>
    </div>
    <div class="form-group">
      <label class="form-label">Data Validade</label>
      <input id="f-orcamento-validade" type="date" value="${orc.dataValidade}" ${!isNew && !_isOrcamentoEditMode ? 'disabled' : ''}>
    </div>
    <div class="form-group full">
      <label class="form-label">Descrição</label>
      <input id="f-orcamento-descricao" value="${orc.descricao || ''}" ${!isNew && !_isOrcamentoEditMode ? 'disabled' : ''}>
    </div>
    <div class="form-group">
      <label class="form-label">Estado</label>
      <select id="f-orcamento-estado" ${!isNew && !_isOrcamentoEditMode ? 'disabled' : ''}>
        <option value="Pendente" ${orc.estado === 'Pendente' ? 'selected' : ''}>Pendente</option>
        <option value="Aprovado" ${orc.estado === 'Aprovado' ? 'selected' : ''}>Aprovado</option>
        <option value="Rejeitado" ${orc.estado === 'Rejeitado' ? 'selected' : ''}>Rejeitado</option>
      </select>
    </div>
    <div class="form-group full">
      <label class="form-label">Notas</label>
      <textarea id="f-orcamento-notas" style="min-height:80px;" ${!isNew && !_isOrcamentoEditMode ? 'disabled' : ''}>${orc.notas || ''}</textarea>
    </div>
  </div>
  <div class="form-actions" style="margin-top: 2rem;">
    <button class="btn" onclick="showPage('orcamentos')">Cancelar</button>
    ${
        isNew
            ? `<button class="btn btn-primary" onclick="saveOrcamento(null)">Criar Orçamento</button>`
            : !_isOrcamentoEditMode
              ? `<button class="btn btn-primary" onclick="editarOrcamento(${orc.id})">Editar</button>`
              : `<button class="btn btn-primary" onclick="saveOrcamento(${orc.id})">Guardar Alterações</button>`
    }
  </div>`;

    document.getElementById('page-orcamento_detalhe').innerHTML = `
    <div class="section-header">
      <button class="btn btn-ghost-back" onclick="showPage('orcamentos')">&#x21a9 Voltar aos Orçamentos</button>
      <span class="section-count">${isNew ? 'Novo Orçamento' : 'Detalhe do Orçamento'}</span>
    </div>
    <div class="full-card" style="max-width: 600px; margin: 0 auto; padding: 2rem;">
      ${formHtml}
    </div>
  `;
}

function saveOrcamento(id) {
    const isNew = !id;
    let orc;

    if (isNew) {
        orc = {
            id: nextId(),
        };
    } else {
        orc = DB.orcamentos.find((x) => x.id === id);
        if (!orc) return;
    }

    const pedidoId = parseInt(
        document.getElementById('f-orcamento-pedido').value,
    );
    if (!pedidoId) {
        alert('Selecione um pedido');
        return;
    }

    // Validar que não há outro orçamento para este pedido (a menos que seja o atual)
    const existingOrc = DB.orcamentos.find(
        (o) => o.pedidoId === pedidoId && o.id !== (orc.id || -1),
    );
    if (existingOrc && isNew) {
        alert('Este pedido já tem um orçamento atribuído');
        return;
    }

    orc.pedidoId = pedidoId;
    orc.valor =
        parseFloat(document.getElementById('f-orcamento-valor').value) || 0;
    orc.dataEmissao = document.getElementById('f-orcamento-emissao').value;
    orc.dataValidade = document.getElementById('f-orcamento-validade').value;
    orc.descricao = document.getElementById('f-orcamento-descricao').value;
    orc.estado = document.getElementById('f-orcamento-estado').value;
    orc.notas = document.getElementById('f-orcamento-notas').value;

    if (isNew) {
        DB.orcamentos.push(orc);
    }

    showPage('orcamentos');
}
