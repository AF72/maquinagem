/**
 * pages/pecas.js
 * -------------------------------------------------
 * Módulo de peças: listagem geral e detalhe/formulário.
 * Cada peça está associada a um pedido (pedidoId).
 * -------------------------------------------------
 */

let _currentPecaId = null;
let _isPecaEditMode = false;
let _preSelectedPecaPedidoId = null;

/*
 * Renderiza a lista de peças
 */
function renderPecas() {
    document.getElementById('page-pecas').innerHTML = `
    <div class="section-header">
      <span class="section-count">${DB.pecas.length} peças</span>
      <button class="btn btn-primary" onclick="showPecaDetalhe(null)">+ Nova Peça</button>
    </div>
    <div class="full-card">
      <table class="table">
        <thead>
          <tr>
            <th style="width:120px">Ref.</th><th>Denominação</th><th>Pedido</th><th>Órgão</th><th>Parte</th><th>Material</th><th>Ação</th>
          </tr>
        </thead>
        <tbody>${_pecasRows()}</tbody>
      </table>
    </div>`;
}

/*
 * Renderiza linhas da tabela de peças
 */
function _pecasRows() {
    if (DB.pecas.length === 0) {
        return `<tr><td colspan="7" style="text-align:center;color:var(--color-text-muted);padding:2rem;">
      Sem peças registadas.</td></tr>`;
    }
    return DB.pecas
        .map((pc) => {
            const pedido = DB.pedidos.find((p) => p.id === pc.pedidoId);
            return `<tr>
      <td>${pc.ref}</td>
      <td>${pc.denominacao || '-'}</td>
      <td>${pedido ? `<span class="badge badge-blue">${pedido.ref}</span>` : '-'}</td>
      <td>${pc.orgao || '-'}</td>
      <td>${pc.parte || '-'}</td>
      <td>${pc.material || '-'}</td>
      <td>
        <button class="btn btn-ghost btn-sm" title="Ver peça" onclick="showPecaDetalhe(${pc.id})">Ver</button>
      </td>
    </tr>`;
        })
        .join('');
}

/*
 * Mostra os detalhes de uma peça (ou formulário de criação)
 */
function showPecaDetalhe(id) {
    _currentPecaId = id;
    _isPecaEditMode = false;
    showPage('peca_detalhe');
}

/*
 * Cria uma peça pré-associada a um pedido (chamado a partir do pedido)
 */
function criarPecaParaPedido(pedidoId) {
    _preSelectedPecaPedidoId = pedidoId;
    _currentPecaId = null;
    _isPecaEditMode = false;
    showPage('peca_detalhe');
}

/*
 * Renderiza o formulário de detalhe/criação de uma peça
 */
function renderPecaDetalhe() {
    const isNew = !_currentPecaId;
    const pc = isNew
        ? {
              ref: 'DM' + new Date().getFullYear().toString().slice(-2) + ' ' + padNum(DB.pecas.length + 1, 3) + ' 000 00',
              pedidoId: _preSelectedPecaPedidoId || null,
              plano: '',
              denominacao: '',
              orgao: '',
              parte: '',
              material: '',
              comprimento: '',
              largura: '',
              altura: '',
              diametro_ext: '',
              diametro_int: '',
              nota_descritiva: '',
              imagem: '',
          }
        : DB.pecas.find((x) => x.id === _currentPecaId);

    if (!pc) return;

    // Construir opções de pedidos
    const pedidoOpts = DB.pedidos
        .map((p) => {
            const sel = pc.pedidoId === p.id ? 'selected' : '';
            return `<option value="${p.id}" ${sel}>${p.ref}</option>`;
        })
        .join('');

    // Pedido associado (readonly label)
    const pedidoRef = pc.pedidoId
        ? (DB.pedidos.find((p) => p.id === pc.pedidoId) || {}).ref || '—'
        : '';

    const formHtml = `
  <div class="form-grid">
    <div class="form-group"><label class="form-label">Referência da Peça</label><input id="f-pc-ref" value="${pc.ref}" ${!isNew && !_isPecaEditMode ? 'disabled' : ''}></div>
    <div class="form-group">
      <label class="form-label">Pedido Associado</label>
      <select id="f-pc-pedidoId" ${!isNew && !_isPecaEditMode ? 'disabled' : ''}>
        <option value="">Selecione...</option>
        ${pedidoOpts}
      </select>
    </div>
    <div class="form-group"><label class="form-label">Plano</label><input id="f-pc-plano" value="${pc.plano || ''}" ${!isNew && !_isPecaEditMode ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Denominação</label><input id="f-pc-denominacao" value="${pc.denominacao || ''}" ${!isNew && !_isPecaEditMode ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Órgão</label><input id="f-pc-orgao" value="${pc.orgao || ''}" ${!isNew && !_isPecaEditMode ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Parte</label><input id="f-pc-parte" value="${pc.parte || ''}" ${!isNew && !_isPecaEditMode ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Material</label><input id="f-pc-material" value="${pc.material || ''}" ${!isNew && !_isPecaEditMode ? 'disabled' : ''}></div>

    <div class="form-group full"><h4 style="margin: 1.5rem 0 0.5rem; color: var(--color-primary);">Dimensões</h4></div>
    <div class="form-group"><label class="form-label">Comprimento (mm)</label><input id="f-pc-comprimento" type="number" step="0.01" value="${pc.comprimento || ''}" ${!isNew && !_isPecaEditMode ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Largura (mm)</label><input id="f-pc-largura" type="number" step="0.01" value="${pc.largura || ''}" ${!isNew && !_isPecaEditMode ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Altura (mm)</label><input id="f-pc-altura" type="number" step="0.01" value="${pc.altura || ''}" ${!isNew && !_isPecaEditMode ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Diâmetro Ext. (mm)</label><input id="f-pc-diametro_ext" type="number" step="0.01" value="${pc.diametro_ext || ''}" ${!isNew && !_isPecaEditMode ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Diâmetro Int. (mm)</label><input id="f-pc-diametro_int" type="number" step="0.01" value="${pc.diametro_int || ''}" ${!isNew && !_isPecaEditMode ? 'disabled' : ''}></div>

    <div class="form-group full"><h4 style="margin: 1.5rem 0 0.5rem; color: var(--color-primary);">Notas e Imagem</h4></div>
    <div class="form-group full"><label class="form-label">Nota Descritiva</label><textarea id="f-pc-nota" rows="3" style="width:100%;resize:vertical;" ${!isNew && !_isPecaEditMode ? 'disabled' : ''}>${pc.nota_descritiva || ''}</textarea></div>
    <div class="form-group">
      <label class="form-label">Imagem (.png)</label>
      <input id="f-pc-imagem-file" type="file" accept=".png" ${!isNew && !_isPecaEditMode ? 'disabled' : ''} onchange="handlePecaImageUpload(this)">
      <input id="f-pc-imagem" type="hidden" value="${pc.imagem || ''}">
    </div>
    <div class="form-group">
      <label class="form-label">Pré-visualização</label>
      <div id="peca-image-preview" style="width: 100%; height: 200px; border: 1px solid var(--color-border); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; background: var(--color-surface-alt); overflow: hidden;">
        ${pc.imagem ? `<img src="${pc.imagem}" style="width: 100%; height: 100%; object-fit: contain;">` : '<span style="font-size: 10px; color: var(--color-text-muted);">Sem imagem</span>'}
      </div>
    </div>
  </div>
  <div class="form-actions" style="margin-top: 2rem;">
    <button class="btn" onclick="_voltarDePeca()">Cancelar</button>
    ${
        isNew
            ? `<button class="btn btn-primary" onclick="savePecaDetalhe(null)">Criar Peça</button>`
            : !_isPecaEditMode
              ? `<button class="btn btn-primary" onclick="togglePecaEditMode()">Editar</button>`
              : `<button class="btn btn-primary" onclick="savePecaDetalhe(${pc.id})">Guardar alterações</button>`
    }
  </div>`;

    const backLabel = _preSelectedPecaPedidoId
        ? '&#x21a9 Voltar ao Pedido'
        : '&#x21a9 Voltar às Peças';

    document.getElementById('page-peca_detalhe').innerHTML = `
    <div class="section-header">
      <button class="btn btn-ghost-back" onclick="_voltarDePeca()">${backLabel}</button>
      <span class="section-count">${isNew ? 'Nova Peça' : 'Detalhe da Peça: ' + pc.ref}</span>
    </div>
    <div class="full-card" style="max-width: 800px; margin: 0 auto; padding: 2rem;">
      ${formHtml}
    </div>
  `;
}

/*
 * Volta para a página anterior (pedido ou lista de peças)
 */
function _voltarDePeca() {
    if (_preSelectedPecaPedidoId) {
        _currentPedidoId = _preSelectedPecaPedidoId;
        _preSelectedPecaPedidoId = null;
        _isPecaEditMode = false;
        showPage('pedido_detalhe');
    } else {
        _preSelectedPecaPedidoId = null;
        showPage('pecas');
    }
}

/*
 * Alterna o modo de edição da peça
 */
function togglePecaEditMode() {
    _isPecaEditMode = true;
    renderPecaDetalhe();
}

/*
 * Manipula o upload de imagem da peça
 */
function handlePecaImageUpload(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const base64 = e.target.result;
            document.getElementById('f-pc-imagem').value = base64;
            document.getElementById('peca-image-preview').innerHTML =
                `<img src="${base64}" style="width: 100%; height: 100%; object-fit: contain;">`;
        };
        reader.readAsDataURL(file);
    }
}

/*
 * Guarda os detalhes de uma peça (nova ou existente)
 */
function savePecaDetalhe(id) {
    const isNew = !id;
    let pc;

    if (isNew) {
        pc = {
            id: nextId(),
        };
    } else {
        pc = DB.pecas.find((x) => x.id === id);
        if (!pc) return;
    }

    pc.ref = document.getElementById('f-pc-ref').value.trim();
    pc.plano = document.getElementById('f-pc-plano').value.trim();
    pc.denominacao = document.getElementById('f-pc-denominacao').value.trim();
    pc.orgao = document.getElementById('f-pc-orgao').value.trim();
    pc.parte = document.getElementById('f-pc-parte').value.trim();
    pc.material = document.getElementById('f-pc-material').value.trim();
    pc.comprimento = parseFloat(document.getElementById('f-pc-comprimento').value) || '';
    pc.largura = parseFloat(document.getElementById('f-pc-largura').value) || '';
    pc.altura = parseFloat(document.getElementById('f-pc-altura').value) || '';
    pc.diametro_ext = parseFloat(document.getElementById('f-pc-diametro_ext').value) || '';
    pc.diametro_int = parseFloat(document.getElementById('f-pc-diametro_int').value) || '';
    pc.nota_descritiva = document.getElementById('f-pc-nota').value.trim();
    pc.imagem = document.getElementById('f-pc-imagem').value;

    const pedidoVal = document.getElementById('f-pc-pedidoId').value;
    pc.pedidoId = pedidoVal ? parseInt(pedidoVal) : null;

    if (isNew) {
        DB.pecas.push(pc);
    }

    // Voltar para o contexto anterior
    _voltarDePeca();
}
