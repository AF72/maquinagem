/**
 * pages/pedidos.js
 * -------------------------------------------------
 * Lista de pedidos com ação para criar Ordem de Trabalho.
 * -------------------------------------------------
 */

const ICON_VIEW = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="3" /><path d="M1 8c0 0 2.5-5 7-5s7 5 7 5-2.5 5-7 5-7-5-7-5z" /></svg>`;
const ICON_CREATE_OT = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 3v10M3 8h10" /></svg>`;

/*
 * Renderiza a lista de pedidos
 */
function renderPedidos() {
    document.getElementById('page-pedidos').innerHTML = `
    <div class="section-header">
      <span class="section-count">${DB.pedidos.length} pedidos</span>
      <button class="btn btn-primary" onclick="showPedidoDetalhe(null)">+ Novo pedido</button>
    </div>
    <div class="full-card">
      <table class="table">
        <thead>
          <tr>
            <th>Ref.</th><th>Cliente</th><th>Tipo</th><th>Estado</th><th>Data</th><th>Ação</th>
          </tr>
        </thead>
        <tbody>${_pedidosRows()}</tbody>
      </table>
    </div>`;
}

/*
 * Renderiza linhas da tabela de pedidos
 */
function _pedidosRows() {
    return DB.pedidos
        .map((p) => {
            const cl = resolveCliente(p.clienteTipo, p.clienteId);
            const canOT = p.estado === 'Pendente';
            const ot = DB.ordens.find((o) => o.pedidoId === p.id);
            const label =
                p.clienteTipo === 'particular'
                    ? `<div style="line-height:1.2;"><div>${cl.nome}</div><div style="font-size:11px;color:var(--color-text-muted)">Particular</div></div>`
                    : `<div style="line-height:1.2;"><div>${cl.subtexto}</div><div style="font-size:11px;color:var(--color-text-muted)">${cl.nome}</div></div>`;

            return `<tr>
      <td>${p.ref}</td>
      <td>${inlineFlex(avatarHtml(cl.nome, cl.avClass, true), label)}</td>
      <td>${tipoBadge(p.clienteTipo)}</td>
      <td>${estadoBadge(p.estado)}</td>
      <td>${p.data}</td>
      <td>
        <button class="btn btn-ghost btn-sm" title="Ver pedido" onclick="showPedidoDetalhe(${p.id})">${ICON_VIEW}</button>
        ${ot ? `<span class="badge badge-blue">${ot.num}</span>` : canOT ? `<button class="btn btn-ghost btn-sm" title="Criar OT" onclick="criarOT(${p.id})">${ICON_CREATE_OT}</button>` : ''}
      </td>
    </tr>`;
        })
        .join('');
}

/*
 * Cria uma Ordem de Trabalho a partir de um pedido
 */
function criarOT(pedidoId) {
    const n = DB.ordens.length + 1;
    const newId = nextId();
    DB.ordens.push({
        id: newId,
        num: 'OT-' + padNum(n, 4),
        pedidoId,
        operador: 'Operador',
        estado: 'Em curso',
        prazo: addDays(14),
        moObra: 100,
    });
    const p = DB.pedidos.find((p) => p.id === pedidoId);
    if (p) {
        p.estado = 'Em produção';
        p.ordemTrabalhoId = newId;
    }
    renderAll();
}

let _currentPedidoId = null;
let _isEditMode = false;

function showPedidoDetalhe(id) {
    _currentPedidoId = id;
    _isEditMode = false;
    showPage('pedido_detalhe');
}

function renderPedidoDetalhe() {
    const isNew = !_currentPedidoId;
    const p = isNew
        ? {
              ref:
                  'PD' +
                  new Date().getFullYear().toString().slice(-2) +
                  '-' +
                  padNum(DB.pedidos.length + 1, 4),
              clienteTipo: 'colaborador',
              clienteId: null,
              qtd: 1,
              data: today(),
          }
        : DB.pedidos.find((x) => x.id === _currentPedidoId);

    if (!p) return;

    const dp = isNew
        ? {
              ref: '',
              equipamento: '',
              orgao: '',
              parte: '',
              breveDescricao: '',
              imagem: '',
              tipo_contacto: '',
              orcamento: '',
              ordem_compra: '',
              custo_total: '',
              ordem_trabalho: '',
          }
        : getDadosPedido(p.dadosPedidoId);

    const ot =
        !isNew && p.ordemTrabalhoId
            ? DB.ordens.find((o) => o.id === p.ordemTrabalhoId)
            : null;

    const colabOpts = DB.colaboradores
        .map((c) => {
            const emp = getEmpresa(c.empresaId);
            const sel =
                !isNew &&
                p.clienteTipo === 'colaborador' &&
                p.clienteId === c.id
                    ? 'selected'
                    : '';
            return `<option value="colab:${c.id}" ${sel}>${c.nome} — ${emp.nome}</option>`;
        })
        .join('');
    const partOpts = DB.particulares
        .map((part) => {
            const sel =
                !isNew &&
                p.clienteTipo === 'particular' &&
                p.clienteId === part.id
                    ? 'selected'
                    : '';
            return `<option value="part:${part.id}" ${sel}>${part.nome} (particular)</option>`;
        })
        .join('');

    const formHtml = `
  <div class="form-grid">
    <div class="form-group"><label class="form-label">Referência do Pedido</label><input id="f-ref" value="${p.ref}" readonly style="background:#ddedda; cursor:not-allowed; height:30px; box-sizing:border-box;"></div>
    <div class="form-group"><label class="form-label">Data de Criação</label><input id="f-data" type="date" value="${p.data}" readonly style="background:#ddedda; cursor:not-allowed; height:30px; box-sizing:border-box;"></div>
    <div class="form-group"><label class="form-label">Ordem de Trabalho</label><input id="f-dp-ordem_trabalho" value="${ot ? ot.num : ''}" readonly style="background:#ddedda; cursor:not-allowed; height:30px; box-sizing:border-box;"></div>

    <div class="form-group full"><h4 style="margin: 1.5rem 0 0.5rem; color: var(--color-primary);">Dados do Cliente</h4><hr style="border:none; border-top: 1px solid var(--color-border); margin-bottom: 1rem;"></div>
    
    <div class="form-group full">
      <label class="form-label">Solicitado por</label>
      <select id="f-clienteKey" ${!isNew && !_isEditMode ? 'disabled' : ''}>
        <optgroup label="Colaboradores de empresa">${colabOpts}</optgroup>
        <optgroup label="Particulares">${partOpts}</optgroup>
      </select>
    </div>
    
    <div class="form-group full"><h4 style="margin: 1.5rem 0 0.5rem; color: var(--color-primary);">Dados do Equipamento / Peça</h4><hr style="border:none; border-top: 1px solid var(--color-border); margin-bottom: 1rem;"></div>
    
    <div class="form-group"><label class="form-label">Ref. Equipamento</label><input id="f-dp-ref" value="${dp.ref}" placeholder="Ex: DP-005" ${!isNew && !_isEditMode ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Equipamento</label><input id="f-dp-equipamento" value="${dp.equipamento || ''}" ${!isNew && !_isEditMode ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Órgão</label><input id="f-dp-orgao" value="${dp.orgao || ''}" ${!isNew && !_isEditMode ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Parte</label><input id="f-dp-parte" value="${dp.parte || ''}" ${!isNew && !_isEditMode ? 'disabled' : ''}></div>
    <div class="form-group full"><label class="form-label">Breve Descrição</label><input id="f-dp-breve" value="${dp.breveDescricao || ''}" ${!isNew && !_isEditMode ? 'disabled' : ''}></div>
    <div class="form-group full"><label class="form-label">Imagem (URL ou Nome)</label><input id="f-dp-imagem" value="${dp.imagem || ''}" ${!isNew && !_isEditMode ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Tipo de Contacto</label><input id="f-dp-tipo_contacto" value="${dp.tipo_contacto || ''}" ${!isNew && !_isEditMode ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Orçamento</label><input id="f-dp-orcamento" value="${dp.orcamento || ''}" ${!isNew && !_isEditMode ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Ordem de Compra</label><input id="f-dp-ordem_compra" value="${dp.ordem_compra || ''}" ${!isNew && !_isEditMode ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Custo Total</label><input id="f-dp-custo_total" value="${dp.custo_total || ''}" ${!isNew && !_isEditMode ? 'disabled' : ''}></div>
    
    <div class="form-group full"><h4 style="margin: 1.5rem 0 0.5rem; color: var(--color-primary);">Detalhes Adicionais</h4><hr style="border:none; border-top: 1px solid var(--color-border); margin-bottom: 1rem;"></div>
    
    <div class="form-group"><label class="form-label">Quantidade</label><input id="f-qtd" type="number" min="1" value="${p.qtd}" ${!isNew && !_isEditMode ? 'disabled' : ''}></div>
  </div>
  <div class="form-actions" style="margin-top: 2rem;">
    <button class="btn" onclick="showPage('pedidos')">Cancelar</button>
    ${
        isNew
            ? `<button class="btn btn-primary" onclick="savePedidoDetalhe(null)">Criar Pedido</button>`
            : !_isEditMode
              ? `<button class="btn btn-primary" onclick="toggleEditMode()">Editar</button>`
              : `<button class="btn btn-primary" onclick="savePedidoDetalhe(${p.id})">Guardar alterações</button>`
    }
  </div>`;

    document.getElementById('page-pedido_detalhe').innerHTML = `
    <div class="section-header">
      <button class="btn btn-ghost" onclick="showPage('pedidos')">← Voltar aos Pedidos</button>
      <span class="section-count">${isNew ? 'Novo Pedido' : 'Detalhe do Pedido: ' + p.ref}</span>
    </div>
    <div class="full-card" style="max-width: 800px; margin: 0 auto; padding: 2rem;">
      ${formHtml}
    </div>
  `;
}

function toggleEditMode() {
    _isEditMode = true;
    renderPedidoDetalhe();
}

function savePedidoDetalhe(id) {
    const isNew = !id;
    let p;

    if (isNew) {
        p = {
            id: nextId(),
            ref:
                'PD' +
                new Date().getFullYear().toString().slice(-2) +
                '-' +
                padNum(DB.pedidos.length + 1, 4),
            estado: 'Pendente',
        };
    } else {
        p = DB.pedidos.find((x) => x.id === id);
        if (!p) return;
    }

    const key = document.getElementById('f-clienteKey').value;
    const [tipo, idStr] = key.split(':');

    p.clienteTipo = tipo === 'colab' ? 'colaborador' : 'particular';
    p.clienteId = parseInt(idStr);
    p.qtd = parseInt(document.getElementById('f-qtd').value) || 1;
    // A data é automática (readonly)

    const newRef = document.getElementById('f-dp-ref').value.trim();
    let dp = DB.dados_pedido.find((d) => d.ref === newRef);

    if (!dp) {
        dp = {
            id: nextId(),
            ref: newRef || 'DP-' + Date.now().toString().slice(-4),
        };
        DB.dados_pedido.push(dp);
    }

    dp.equipamento = document.getElementById('f-dp-equipamento').value;
    dp.orgao = document.getElementById('f-dp-orgao').value;
    dp.parte = document.getElementById('f-dp-parte').value;
    dp.breveDescricao = document.getElementById('f-dp-breve').value;
    dp.imagem = document.getElementById('f-dp-imagem').value;
    dp.tipo_contacto = document.getElementById('f-dp-tipo_contacto').value;
    dp.orcamento = document.getElementById('f-dp-orcamento').value;
    dp.ordem_compra = document.getElementById('f-dp-ordem_compra').value;
    dp.custo_total = document.getElementById('f-dp-custo_total').value;

    p.dadosPedidoId = dp.id;

    if (isNew) {
        p.data = document.getElementById('f-data').value || today();
        DB.pedidos.push(p);
    }

    showPage('pedidos');
}
