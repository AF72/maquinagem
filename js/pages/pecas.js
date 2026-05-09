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
            <th style="width:150px;white-space:nowrap">Ref.</th><th>Denominação</th><th>Órgão</th><th>Parte</th><th style="width:1%;white-space:nowrap">Material</th><th>Ação</th>
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
            return `<tr>
      <td>${pc.ref}</td>
      <td>${pc.denominacao || '-'}</td>
      <td>${pc.orgao || '-'}</td>
      <td>${pc.parte || '-'}</td>
      <td>${pc.material || '-'}</td>
      <td>
        <button class="btn btn-ghost btn-sm" title="Ver peça" onclick="showPecaDetalhe(${pc.id})"><svg id='Pencil_24' width='20' height='20' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><rect width='24' height='24' stroke='none' fill='#000000' opacity='0'/><g transform="matrix(1.05 0 0 1.05 12 12)" ><path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" translate(-12.5, -11.5)" d="M 19.171875 2 C 18.448125 2 17.724375 2.275625 17.171875 2.828125 L 16 4 L 20 8 L 21.171875 6.828125 C 22.275875 5.724125 22.275875 3.933125 21.171875 2.828125 C 20.619375 2.275625 19.895625 2 19.171875 2 z M 14.5 5.5 L 5 15 C 5 15 6.005 15.005 6.5 15.5 C 6.995 15.995 6.984375 16.984375 6.984375 16.984375 C 6.984375 16.984375 8.004 17.004 8.5 17.5 C 8.996 17.996 9 19 9 19 L 18.5 9.5 L 14.5 5.5 z M 3.6699219 17 L 3.0136719 20.503906 C 2.9606719 20.789906 3.2100938 21.039328 3.4960938 20.986328 L 7 20.330078 L 3.6699219 17 z" stroke-linecap="round" /></g></svg></button>
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
 * Calcula o prefixo automático da referência a partir do pedido associado.
 * Formato: DM{ano2}-{seqPedido}  ex: DM26-0001
 */
function _pecaRefPrefixo(pedido) {
    const ano = new Date().getFullYear().toString().slice(-2);
    if (!pedido) return 'DM' + ano + '-';
    const seq = pedido.ref.split('-')[1] || '????';
    return 'DM' + ano + '-' + seq;
}

/*
 * Separa uma ref existente nos segmentos {prefixo, xxx, nn} com base no pedido associado.
 * Formato esperado: DMyy-ppp-xxx-nn
 */
function _parsearSegmentos(ref, pedido) {
    const prefixo = _pecaRefPrefixo(pedido);
    const restante =
        ref && ref.startsWith(prefixo + '-')
            ? ref.slice(prefixo.length + 1)
            : '';
    const partes = restante.split('-');
    return { prefixo, xxx: partes[0] || '', nn: partes[1] || '' };
}

/*
 * Atualiza o prefixo da ref quando o utilizador muda o pedido associado.
 */
function onPecaPedidoChange() {
    const sel = document.getElementById('f-pc-pedidoId');
    const pedido = DB.pedidos.find((p) => p.id === parseInt(sel.value));
    const el = document.getElementById('f-pc-ref-prefix');
    if (el) el.textContent = _pecaRefPrefixo(pedido) + '-';
}

/*
 * Renderiza o formulário de detalhe/criação de uma peça
 */
function renderPecaDetalhe() {
    const isNew = !_currentPecaId;
    const pc = isNew
        ? {
              ref: '',
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

    // Segmentos da referência: DMyy-ppp-xxx-nn
    const pedidoAssoc = DB.pedidos.find((p) => p.id === pc.pedidoId) || null;
    const { prefixo, xxx, nn } = _parsearSegmentos(pc.ref, pedidoAssoc);
    const editavel = isNew || _isPecaEditMode;

    const refFieldHtml = editavel
        ? `<div class="ref-input-group">
            <span id="f-pc-ref-prefix" class="ref-prefix-fixed">${prefixo}-</span>
            <input id="f-pc-ref-xxx" class="ref-segment-input" maxlength="3" placeholder="000" value="${xxx}"
                   oninput="this.value=this.value.replace(/[^0-9a-zA-Z]/g,''); if(this.value.length===3) document.getElementById('f-pc-ref-nn').focus();">
            <span class="ref-sep-fixed">-</span>
            <input id="f-pc-ref-nn" class="ref-segment-input ref-segment-nn" maxlength="2" placeholder="00" value="${nn}"
                   oninput="this.value=this.value.replace(/[^0-9]/g,'');">
           </div>
           <small class="form-hint">Formato: DMyy – nº pedido – 3 dígitos – 2 dígitos</small>`
        : `<input id="f-pc-ref" value="${pc.ref}" disabled>`;

    const formHtml = `
  <div class="form-grid">
    <div class="form-group"><label class="form-label">Referência da Peça</label>${refFieldHtml}</div>
    <div class="form-group">
      <label class="form-label">Pedido Associado</label>
      <select id="f-pc-pedidoId" ${!editavel ? 'disabled' : ''} onchange="onPecaPedidoChange()">
        <option value="">Selecione...</option>
        ${pedidoOpts}
      </select>
    </div>
    <div class="form-group"><label class="form-label">Plano</label><input id="f-pc-plano" value="${pc.plano || ''}" ${!editavel ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Denominação</label><input id="f-pc-denominacao" value="${pc.denominacao || ''}" ${!editavel ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Órgão</label><input id="f-pc-orgao" value="${pc.orgao || ''}" ${!editavel ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Parte</label><input id="f-pc-parte" value="${pc.parte || ''}" ${!editavel ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Material</label><input id="f-pc-material" value="${pc.material || ''}" ${!editavel ? 'disabled' : ''}></div>

    <div class="form-group full"><h4 style="margin: 1.5rem 0 0.5rem; color: var(--color-primary);">Dimensões</h4></div>
    <div class="form-group"><label class="form-label">Comprimento (mm)</label><input id="f-pc-comprimento" type="number" step="0.01" value="${pc.comprimento || ''}" ${!editavel ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Largura (mm)</label><input id="f-pc-largura" type="number" step="0.01" value="${pc.largura || ''}" ${!editavel ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Altura (mm)</label><input id="f-pc-altura" type="number" step="0.01" value="${pc.altura || ''}" ${!editavel ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Diâmetro Ext. (mm)</label><input id="f-pc-diametro_ext" type="number" step="0.01" value="${pc.diametro_ext || ''}" ${!editavel ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Diâmetro Int. (mm)</label><input id="f-pc-diametro_int" type="number" step="0.01" value="${pc.diametro_int || ''}" ${!editavel ? 'disabled' : ''}></div>

    <div class="form-group full"><h4 style="margin: 1.5rem 0 0.5rem; color: var(--color-primary);">Notas e Imagem</h4></div>
    <div class="form-group full"><label class="form-label">Nota Descritiva</label><textarea id="f-pc-nota" rows="3" style="width:100%;resize:vertical;" ${!editavel ? 'disabled' : ''}>${pc.nota_descritiva || ''}</textarea></div>
    <div class="form-group">
      <label class="form-label">Imagem (.png)</label>
      <input id="f-pc-imagem-file" type="file" accept=".png" ${!editavel ? 'disabled' : ''} onchange="handlePecaImageUpload(this)">
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

    const prefEl = document.getElementById('f-pc-ref-prefix');
    const xxxEl = document.getElementById('f-pc-ref-xxx');
    const nnEl = document.getElementById('f-pc-ref-nn');
    if (prefEl && xxxEl && nnEl) {
        pc.ref =
            prefEl.textContent +
            xxxEl.value.padStart(3, '0') +
            '-' +
            nnEl.value.padStart(2, '0');
    } else {
        pc.ref = (document.getElementById('f-pc-ref') || {}).value || pc.ref;
    }
    pc.plano = document.getElementById('f-pc-plano').value.trim();
    pc.denominacao = document.getElementById('f-pc-denominacao').value.trim();
    pc.orgao = document.getElementById('f-pc-orgao').value.trim();
    pc.parte = document.getElementById('f-pc-parte').value.trim();
    pc.material = document.getElementById('f-pc-material').value.trim();
    pc.comprimento =
        parseFloat(document.getElementById('f-pc-comprimento').value) || '';
    pc.largura =
        parseFloat(document.getElementById('f-pc-largura').value) || '';
    pc.altura = parseFloat(document.getElementById('f-pc-altura').value) || '';
    pc.diametro_ext =
        parseFloat(document.getElementById('f-pc-diametro_ext').value) || '';
    pc.diametro_int =
        parseFloat(document.getElementById('f-pc-diametro_int').value) || '';
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
