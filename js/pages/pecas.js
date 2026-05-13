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
function _resolverMaterial(materiaPrimaId) {
    if (!materiaPrimaId) return '-';
    const mp = DB.materia_prima.find((m) => m.id === materiaPrimaId);
    if (!mp) return '-';
    return mp.ref_wnr && mp.ref_wnr !== '-' ? `${mp.ref_wnr} – ${mp.ref_din}` : mp.ref_din;
}

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
      <td>${_resolverMaterial(pc.materiaPrimaId)}</td>
      <td style="display:flex;gap:4px;align-items:center;">
        <button class="btn btn-ghost btn-sm" title="Ver peça" onclick="verPecaOverlay(${pc.id})">${ICON_VIEW}</button>
        <button class="btn btn-ghost btn-sm" title="Editar peça" onclick="showPecaDetalhe(${pc.id})">${ICON_ORCAMENTO_EDIT}</button>
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
 * Atualiza o campo peso_esp quando o utilizador muda o material.
 */
/* Calcula o volume (mm³) e devolve o peso em kg; '' se dados insuficientes */
function _calcPeso(forma, c, l, h, de, di, pesoEsp) {
    const p = parseFloat(pesoEsp);
    if (!forma || !p) return '';
    let vol = 0;
    if (forma === 'quadrado') {
        const vc = parseFloat(c), vl = parseFloat(l), vh = parseFloat(h);
        if (!vc || !vl || !vh) return '';
        vol = vc * vl * vh;
    } else if (forma === 'redondo_macico') {
        const vc = parseFloat(c), vde = parseFloat(de);
        if (!vc || !vde) return '';
        vol = Math.PI * Math.pow(vde / 2, 2) * vc;
    } else if (forma === 'redondo_oco') {
        const vc = parseFloat(c), vde = parseFloat(de), vdi = parseFloat(di);
        if (!vc || !vde || !vdi) return '';
        vol = Math.PI * (Math.pow(vde / 2, 2) - Math.pow(vdi / 2, 2)) * vc;
    }
    if (!vol || vol <= 0) return '';
    // mm³ → cm³ (÷1000) × peso_esp (g/cm³) → g → kg (÷1000)
    return (vol / 1000 * p / 1000).toFixed(4);
}

/* Atualiza o campo Peso da Peça a partir dos valores actuais no DOM */
function calcPecaPeso() {
    const peso = _calcPeso(
        document.querySelector('input[name="f-pc-forma"]:checked')?.value || '',
        document.getElementById('f-pc-comprimento').value,
        document.getElementById('f-pc-largura').value,
        document.getElementById('f-pc-altura').value,
        document.getElementById('f-pc-diametro_ext').value,
        document.getElementById('f-pc-diametro_int').value,
        document.getElementById('f-pc-peso_esp').value,
    );
    const el = document.getElementById('f-pc-peso');
    if (el) el.value = peso !== '' ? peso + ' kg' : '';
}

function onPecaMaterialChange() {
    const sel = document.getElementById('f-pc-materiaPrimaId');
    const mp = DB.materia_prima.find((m) => m.id === parseInt(sel.value));
    document.getElementById('f-pc-peso_esp').value = mp ? mp.peso_esp : '';
    calcPecaPeso();
}

/*
 * Ativa/desativa os campos de dimensão consoante a forma selecionada.
 */
function onPecaFormaChange() {
    const forma = document.querySelector('input[name="f-pc-forma"]:checked')?.value || '';
    const mapa = {
        'f-pc-comprimento':  ['quadrado', 'redondo_macico', 'redondo_oco'],
        'f-pc-largura':      ['quadrado'],
        'f-pc-altura':       ['quadrado'],
        'f-pc-diametro_ext': ['redondo_macico', 'redondo_oco'],
        'f-pc-diametro_int': ['redondo_oco'],
    };
    Object.entries(mapa).forEach(([id, formas]) => {
        const el = document.getElementById(id);
        if (!el) return;
        const ativo = formas.includes(forma);
        el.disabled = !ativo;
        if (!ativo) el.value = '';
    });
    calcPecaPeso();
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
              materiaPrimaId: null,
              forma: '',
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

    const materialOpts = DB.materia_prima
        .map((mp) => {
            const label = mp.ref_wnr && mp.ref_wnr !== '-'
                ? `${mp.ref_wnr} – ${mp.ref_din}`
                : mp.ref_din;
            const sel = pc.materiaPrimaId === mp.id ? 'selected' : '';
            return `<option value="${mp.id}" ${sel}>${label}</option>`;
        })
        .join('');

    const mpSelecionado = DB.materia_prima.find((m) => m.id === pc.materiaPrimaId);
    const pesoEspInicial = mpSelecionado ? mpSelecionado.peso_esp : '';

    const formaAtiva = pc.forma || '';
    const _formaMap = {
        comprimento:  ['quadrado', 'redondo_macico', 'redondo_oco'],
        largura:      ['quadrado'],
        altura:       ['quadrado'],
        diametro_ext: ['redondo_macico', 'redondo_oco'],
        diametro_int: ['redondo_oco'],
    };
    const campoDisabled = campo =>
        (!editavel || !(_formaMap[campo] || []).includes(formaAtiva)) ? 'disabled' : '';

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
    <div class="form-group">
      <label class="form-label">Material</label>
      <select id="f-pc-materiaPrimaId" ${!editavel ? 'disabled' : ''} onchange="onPecaMaterialChange()">
        <option value="">Selecione...</option>
        ${materialOpts}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Peso Esp. (g/cm³)</label>
      <input id="f-pc-peso_esp" value="${pesoEspInicial}" disabled style="background:var(--color-surface-alt);color:var(--color-text-muted);">
    </div>

    <div class="form-group full">
      <h4 style="margin: 1.5rem 0 0.75rem; color: var(--color-primary);">Dimensões</h4>
      <div style="display:flex;gap:2rem;">
        <label style="display:flex;align-items:center;gap:6px;cursor:${editavel ? 'pointer' : 'default'};">
          <input type="radio" name="f-pc-forma" value="quadrado"
            ${formaAtiva === 'quadrado' ? 'checked' : ''}
            ${!editavel ? 'disabled' : ''}
            onchange="onPecaFormaChange()">
          Quadrado
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:${editavel ? 'pointer' : 'default'};">
          <input type="radio" name="f-pc-forma" value="redondo_macico"
            ${formaAtiva === 'redondo_macico' ? 'checked' : ''}
            ${!editavel ? 'disabled' : ''}
            onchange="onPecaFormaChange()">
          Redondo maciço
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:${editavel ? 'pointer' : 'default'};">
          <input type="radio" name="f-pc-forma" value="redondo_oco"
            ${formaAtiva === 'redondo_oco' ? 'checked' : ''}
            ${!editavel ? 'disabled' : ''}
            onchange="onPecaFormaChange()">
          Redondo oco
        </label>
      </div>
    </div>
    <div class="form-group"><label class="form-label">Comprimento (mm)</label><input id="f-pc-comprimento" type="number" step="0.01" value="${pc.comprimento || ''}" ${campoDisabled('comprimento')} oninput="calcPecaPeso()"></div>
    <div class="form-group"><label class="form-label">Largura (mm)</label><input id="f-pc-largura" type="number" step="0.01" value="${pc.largura || ''}" ${campoDisabled('largura')} oninput="calcPecaPeso()"></div>
    <div class="form-group"><label class="form-label">Altura (mm)</label><input id="f-pc-altura" type="number" step="0.01" value="${pc.altura || ''}" ${campoDisabled('altura')} oninput="calcPecaPeso()"></div>
    <div class="form-group"><label class="form-label">Diâmetro Ext. (mm)</label><input id="f-pc-diametro_ext" type="number" step="0.01" value="${pc.diametro_ext || ''}" ${campoDisabled('diametro_ext')} oninput="calcPecaPeso()"></div>
    <div class="form-group"><label class="form-label">Diâmetro Int. (mm)</label><input id="f-pc-diametro_int" type="number" step="0.01" value="${pc.diametro_int || ''}" ${campoDisabled('diametro_int')} oninput="calcPecaPeso()"></div>
    <div class="form-group full">
      <label class="form-label">Peso da Peça (kg)</label>
      <input id="f-pc-peso" value="${(() => { const p = _calcPeso(formaAtiva, pc.comprimento, pc.largura, pc.altura, pc.diametro_ext, pc.diametro_int, pesoEspInicial); return p !== '' ? p + ' kg' : ''; })()}" readonly style="background:#ddedda; cursor:not-allowed;">
    </div>

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
async function savePecaDetalhe(id) {
    const isNew = !id;

    const prefEl = document.getElementById('f-pc-ref-prefix');
    const xxxEl  = document.getElementById('f-pc-ref-xxx');
    const nnEl   = document.getElementById('f-pc-ref-nn');
    const ref = prefEl && xxxEl && nnEl
        ? prefEl.textContent + xxxEl.value.padStart(3, '0') + '-' + nnEl.value.padStart(2, '0')
        : (document.getElementById('f-pc-ref') || {}).value || '';

    const mpVal     = document.getElementById('f-pc-materiaPrimaId').value;
    const pedidoVal = document.getElementById('f-pc-pedidoId').value;

    const dados = {
        ref,
        denominacao:      document.getElementById('f-pc-denominacao').value.trim(),
        plano:            document.getElementById('f-pc-plano').value.trim()   || undefined,
        orgao:            document.getElementById('f-pc-orgao').value.trim()   || undefined,
        parte:            document.getElementById('f-pc-parte').value.trim()   || undefined,
        materia_prima_id: mpVal ? parseInt(mpVal) : undefined,
        forma:            document.querySelector('input[name="f-pc-forma"]:checked')?.value || undefined,
        comprimento:      parseFloat(document.getElementById('f-pc-comprimento').value) || undefined,
        largura:          parseFloat(document.getElementById('f-pc-largura').value)     || undefined,
        altura:           parseFloat(document.getElementById('f-pc-altura').value)      || undefined,
        diametro_ext:     parseFloat(document.getElementById('f-pc-diametro_ext').value) || undefined,
        diametro_int:     parseFloat(document.getElementById('f-pc-diametro_int').value) || undefined,
        nota_descritiva:  document.getElementById('f-pc-nota').value.trim()   || undefined,
        imagem:           document.getElementById('f-pc-imagem').value        || undefined,
        pedido_id:        pedidoVal ? parseInt(pedidoVal) : undefined,
    };

    try {
        if (isNew) {
            await apiPost('/pecas', dados);
        } else {
            await apiPut(`/pecas/${id}`, dados);
        }
        await carregarDados();
        _voltarDePeca();
    } catch (err) {
        alert('Erro ao guardar peça: ' + err.message);
    }
}
