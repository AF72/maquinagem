/**
 * pages/orcamentos.js
 * -------------------------------------------------
 * Gestão de orçamentos (vários por pedido, com campo 'ativo')
 * -------------------------------------------------
 */

/*Constantes de ícones*/
const ICON_ORCAMENTO_VIEW = `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/></svg>`;
const ICON_ORCAMENTO_EDIT = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1.05 0 0 1.05 12 12)"><path style="fill: currentColor;" transform="translate(-12.5, -11.5)" d="M 19.171875 2 C 18.448125 2 17.724375 2.275625 17.171875 2.828125 L 16 4 L 20 8 L 21.171875 6.828125 C 22.275875 5.724125 22.275875 3.933125 21.171875 2.828125 C 20.619375 2.275625 19.895625 2 19.171875 2 z M 14.5 5.5 L 5 15 C 5 15 6.005 15.005 6.5 15.5 C 6.995 15.995 6.984375 16.984375 6.984375 16.984375 C 6.984375 16.984375 8.004 17.004 8.5 17.5 C 8.996 17.996 9 19 9 19 L 18.5 9.5 L 14.5 5.5 z M 3.6699219 17 L 3.0136719 20.503906 C 2.9606719 20.789906 3.2100938 21.039328 3.4960938 20.986328 L 7 20.330078 L 3.6699219 17 z" /></g></svg>`;

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
            <th>Ref. Orçamento</th><th>Pedido</th><th>Cliente</th><th>Custo Líquido (€)</th><th>Data Emissão</th><th>Validade</th><th>Estado</th><th>Ativo</th><th>Ação</th>
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

            const label =
                pedido.clienteTipo === 'particular'
                    ? `<div style="line-height:1.2;"><div>${cliente.nome}</div><div style="font-size:11px;color:var(--color-text-muted)">Particular</div></div>`
                    : `<div style="line-height:1.2;"><div>${cliente.subtexto}</div><div style="font-size:11px;color:var(--color-text-muted)">${cliente.nome}</div></div>`;

            return `<tr>
      <td><strong>${orc.ref || '-'}</strong></td>
      <td><a href="#" onclick="showPedidoDetalhe(${pedido.id}); return false;" style="color:var(--color-primary); text-decoration:none; cursor:pointer;">${pedido.ref}</a></td>
      <td>${inlineFlex(avatarHtml(cliente.nome, cliente.avClass, true), label)}</td>
      <td><strong>${(orc.valor || 0).toFixed(2)}</strong></td>
      <td>${orc.dataEmissao}</td>
      <td>${orc.dataValidade}</td>
      <td><span class="badge ${estadoBg}">${orc.estado}</span></td>
      <td>${orc.ativo ? '<span class="badge badge-blue">Ativo</span>' : '<span class="badge badge-gray">Inativo</span>'}</td>
      <td style="vertical-align: middle;">
        <button class="btn btn-ghost btn-sm" style="display: flex; align-items: center; gap: 5px;" onclick="editarOrcamento(${orc.id})">
          ${ICON_ORCAMENTO_EDIT}
        </button>
      </td>
    </tr>`;
        })
        .join('');
}

let _currentOrcamentoId = null;
let _isOrcamentoEditMode = false;

function showOrcamentoDetalhe(id) {
    _preSelectedPedidoId = null;
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
              ref:
                  'ORC' +
                  new Date().getFullYear().toString().slice(-2) +
                  '-' +
                  padNum(DB.orcamentos.length + 1, 4),
              pedidoId: _preSelectedPedidoId || null,
              valor: '',
              dataEmissao: today(),
              dataValidade: addDays(30),
              descricao: '',
              estado: 'Pendente',
              notas: '',
          }
        : DB.orcamentos.find((x) => x.id === _currentOrcamentoId);

    if (!orc && !isNew) return;

    // Listar pedidos sem orçamento (ou o atual) e que não estejam finalizados
    const invalidStatuses = ['Concluido', 'Cancelado', 'Faturar'];

    const pedidoOpts = DB.pedidos
        .map((p) => {
            const existing = DB.orcamentos.find((o) => o.pedidoId === p.id);
            const sel = orc && orc.pedidoId === p.id ? 'selected' : '';

            // Filtrar pedidos com estados finalizados (a menos que já seja o pedido deste orçamento)
            if (
                invalidStatuses.includes(p.estado_pedido) &&
                orc?.pedidoId !== p.id
            )
                return '';

            // Filtrar pedidos de colaboradores inativos
            if (p.clienteTipo === 'colaborador' && orc?.pedidoId !== p.id) {
                const colab = getColab(p.clienteId);
                if (colab.ativo === false) return '';
            }

            const cliente = resolveCliente(p.clienteTipo, p.clienteId);
            return `<option value="${p.id}" ${sel}>${p.ref} — ${cliente.nome}</option>`;
        })
        .join('');

    const formHtml = `
  <div class="form-grid">
    <div class="form-group">
      <label class="form-label">Ref. Orçamento</label>
      <input id="f-orcamento-ref" value="${orc.ref || ''}" readonly style="background:#ddedda; cursor:not-allowed;">
    </div>
    <div class="form-group">
      <label class="form-label">Pedido</label>
      <select id="f-orcamento-pedido" ${!isNew && !_isOrcamentoEditMode ? 'disabled' : ''}>
        <option value="">Selecionar pedido</option>
        ${pedidoOpts}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Custo Líquido (€)</label>
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
    <div class="form-group" style="display: flex; flex-direction: row; align-items: center; gap: 8px; margin-top: auto; padding-bottom: 8px;">
      <input type="checkbox" id="f-orcamento-ativo" ${isNew || orc.ativo ? 'checked' : ''} ${!isNew && !_isOrcamentoEditMode ? 'disabled' : ''} style="width: auto; margin: 0; padding: 0;">
      <label class="form-label" style="margin: 0; cursor: pointer;" for="f-orcamento-ativo">Ativo</label>
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

    // Se ativo, desativar outros orçamentos do mesmo pedido
    const isAtivo = document.getElementById('f-orcamento-ativo').checked;
    if (isAtivo) {
        DB.orcamentos.forEach((o) => {
            if (o.pedidoId === pedidoId && o.id !== orc.id) {
                o.ativo = false;
            }
        });
    }

    orc.pedidoId = pedidoId;
    orc.ref = document.getElementById('f-orcamento-ref').value;
    orc.valor =
        parseFloat(document.getElementById('f-orcamento-valor').value) || 0;
    orc.dataEmissao = document.getElementById('f-orcamento-emissao').value;
    orc.dataValidade = document.getElementById('f-orcamento-validade').value;
    orc.descricao = document.getElementById('f-orcamento-descricao').value;
    orc.estado = document.getElementById('f-orcamento-estado').value;
    orc.notas = document.getElementById('f-orcamento-notas').value;
    orc.ativo = isAtivo;

    if (isNew) {
        DB.orcamentos.push(orc);
    }

    // Se ativo e aprovado, atualizar custo_liquido no pedido
    if (orc.ativo && orc.estado === 'Aprovado') {
        const pedido = getPedido(orc.pedidoId);
        if (pedido) {
            pedido.custo_liquido = orc.valor;
        }
    }

    showPage('orcamentos');
}
