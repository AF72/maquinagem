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
            <th style="width:120px;">Ref.</th><th style="width:120px;">Plano</th><th style="width:160px;">Denominação</th><th style="width:100px;">Órgão</th><th style="width:100px;">Parte</th><th style="width:160px;">Material</th><th style="width:160px;">Dimensões (mm)</th><th style="width:80px;">Peso (kg)</th><th style="width:80px;">Ação</th>
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
        return `<tr><td colspan="8" style="text-align:center;color:var(--color-text-muted);padding:2rem;">
      Sem peças registadas.</td></tr>`;
    }
    return DB.pecas
        .map((pc) => {
            const dimParts = [];
            if (pc.comprimento)  dimParts.push(`C:${pc.comprimento}`);
            if (pc.largura)      dimParts.push(`L:${pc.largura}`);
            if (pc.diametro_ext) dimParts.push(`∅ext:${pc.diametro_ext}`);
            if (pc.diametro_int) dimParts.push(`∅int:${pc.diametro_int}`);
            const dim = dimParts.join(' · ') || '—';
            const mp = DB.materia_prima.find(m => m.id === pc.materiaPrimaId);
            const peso = _calcPeso(pc.forma, pc.comprimento, pc.largura, pc.altura, pc.diametro_ext, pc.diametro_int, mp?.peso_esp);
            return `<tr>
      <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${pc.ref}</td>
      <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${pc.plano || '-'}</td>
      <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${pc.denominacao || '-'}</td>
      <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${pc.orgao || '-'}</td>
      <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${pc.parte || '-'}</td>
      <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_resolverMaterial(pc.materiaPrimaId)}</td>
      <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${dim}</td>
      <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${peso || '—'}</td>
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
    if (!pedido) return 'DM' + ano + '-????';
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
/* Devolve a primeira mensagem sobre o que falta para calcular o peso, ou '' se tudo ok */
function _mensagemPesoPendente(forma, c, l, h, de, di, pesoEsp) {
    if (!forma) return 'Falta indicar a forma da peça';
    if (!parseFloat(pesoEsp)) return 'Falta indicar o material da peça';
    if (forma === 'quadrado') {
        if (!parseFloat(c)) return 'Falta indicar o comprimento';
        if (!parseFloat(l)) return 'Falta indicar a largura';
        if (!parseFloat(h)) return 'Falta indicar a altura';
    } else if (forma === 'redondo_macico') {
        if (!parseFloat(c))  return 'Falta indicar o comprimento';
        if (!parseFloat(de)) return 'Falta indicar o diâmetro exterior';
    } else if (forma === 'redondo_oco') {
        if (!parseFloat(c))  return 'Falta indicar o comprimento';
        if (!parseFloat(de)) return 'Falta indicar o diâmetro exterior';
        if (!parseFloat(di)) return 'Falta indicar o diâmetro interior';
    }
    return '';
}

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
    const forma = document.querySelector('input[name="f-pc-forma"]:checked')?.value || '';
    const c  = document.getElementById('f-pc-comprimento').value;
    const l  = document.getElementById('f-pc-largura').value;
    const h  = document.getElementById('f-pc-altura').value;
    const de = document.getElementById('f-pc-diametro_ext').value;
    const di = document.getElementById('f-pc-diametro_int').value;
    const pe = document.getElementById('f-pc-peso_esp').value;
    const peso = _calcPeso(forma, c, l, h, de, di, pe);
    const el = document.getElementById('f-pc-peso');
    if (el) el.value = peso !== '' ? peso + ' kg' : '';
    const hint = document.getElementById('f-pc-peso-hint');
    if (hint) hint.textContent = peso !== '' ? '' : _mensagemPesoPendente(forma, c, l, h, de, di, pe);
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

    // Para peças existentes, resolver o pedido associado via pecas_pedidos (DB.pecas não tem pedidoId)
    const pedidoId = isNew
        ? (_preSelectedPecaPedidoId || null)
        : (DB.pecas_pedidos.find(pp => pp.pecaId === _currentPecaId)?.pedidoId ?? null);

    // Construir opções de pedidos
    const pedidoOpts = DB.pedidos
        .map((p) => {
            const sel = pedidoId === p.id ? 'selected' : '';
            return `<option value="${p.id}" ${sel}>${p.ref}</option>`;
        })
        .join('');

    // Segmentos da referência: DMyy-ppp-xxx-nn
    const pedidoAssoc = DB.pedidos.find((p) => p.id === pedidoId) || null;
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
      <div style="display:flex;gap:0.75rem;">
        ${['quadrado','redondo_macico','redondo_oco'].map(forma => {
          const ativo = formaAtiva === forma;
          const label = forma === 'quadrado' ? 'Quadrado' : forma === 'redondo_macico' ? 'Redondo maciço' : 'Redondo oco';
          const labelStyle = ativo
            ? 'display:flex;align-items:center;gap:8px;padding:7px 14px;border-radius:6px;border:2px solid #0f3a65;background:#e8f0f8;font-weight:600;color:#0f3a65;cursor:' + (editavel ? 'pointer' : 'default')
            : 'display:flex;align-items:center;gap:8px;padding:7px 14px;border-radius:6px;border:1.5px solid #e2e0d8;background:transparent;font-weight:400;color:inherit;cursor:' + (editavel ? 'pointer' : 'default');
          return `<label style="${labelStyle}">
            <input type="radio" name="f-pc-forma" value="${forma}" style="width:16px;height:16px;flex-shrink:0;"
              ${ativo ? 'checked' : ''} ${!editavel ? 'disabled' : ''} onchange="onPecaFormaChange()">
            ${label}
          </label>`;
        }).join('')}
      </div>
    </div>
    <div class="form-group"><label class="form-label">Comprimento (mm)</label><input id="f-pc-comprimento" type="number" step="0.01" value="${pc.comprimento || ''}" ${campoDisabled('comprimento')} oninput="calcPecaPeso()"></div>
    <div class="form-group"><label class="form-label">Largura (mm)</label><input id="f-pc-largura" type="number" step="0.01" value="${pc.largura || ''}" ${campoDisabled('largura')} oninput="calcPecaPeso()"></div>
    <div class="form-group"><label class="form-label">Altura (mm)</label><input id="f-pc-altura" type="number" step="0.01" value="${pc.altura || ''}" ${campoDisabled('altura')} oninput="calcPecaPeso()"></div>
    <div class="form-group"><label class="form-label">Diâmetro Ext. (mm)</label><input id="f-pc-diametro_ext" type="number" step="0.01" value="${pc.diametro_ext || ''}" ${campoDisabled('diametro_ext')} oninput="calcPecaPeso()"></div>
    <div class="form-group"><label class="form-label">Diâmetro Int. (mm)</label><input id="f-pc-diametro_int" type="number" step="0.01" value="${pc.diametro_int || ''}" ${campoDisabled('diametro_int')} oninput="calcPecaPeso()"></div>
    <div class="form-group">
      <label class="form-label">Peso da Peça (kg)</label>
      <input id="f-pc-peso" value="${(() => { const p = _calcPeso(formaAtiva, pc.comprimento, pc.largura, pc.altura, pc.diametro_ext, pc.diametro_int, pesoEspInicial); return p !== '' ? p + ' kg' : ''; })()}" readonly style="background:#ddedda; cursor:not-allowed;">
      <small id="f-pc-peso-hint" style="color:#c0392b;margin-top:4px;display:block;">${(() => { const p = _calcPeso(formaAtiva, pc.comprimento, pc.largura, pc.altura, pc.diametro_ext, pc.diametro_int, pesoEspInicial); return p !== '' ? '' : _mensagemPesoPendente(formaAtiva, pc.comprimento, pc.largura, pc.altura, pc.diametro_ext, pc.diametro_int, pesoEspInicial); })()}</small>
    </div>
    <div class="form-group">
      <label class="form-label">Custo de Stock (€)</label>
      ${(() => {
        const pesoKg = parseFloat(_calcPeso(formaAtiva, pc.comprimento, pc.largura, pc.altura, pc.diametro_ext, pc.diametro_int, pesoEspInicial));
        const snapshot = pc.precoMpSnapshot;
        if (pesoKg && snapshot) {
            return `<input value="${formatEuro(pesoKg * snapshot)}" readonly style="background:#ddedda; cursor:not-allowed;">
                    <small style="color:var(--color-text-muted);margin-top:4px;display:block;">Peso × ${snapshot.toFixed(2)} €/kg (preço MP na criação)</small>`;
        }
        const motivo = !snapshot ? 'Sem preço de MP registado na criação da peça' : 'Peso não calculável (faltam dimensões ou material)';
        return `<input value="—" readonly style="background:#ddedda; cursor:not-allowed;">
                <small style="color:var(--color-text-muted);margin-top:4px;display:block;">${motivo}</small>`;
      })()}
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
    ${!isNew ? _pecaPlanoProcessosHtml(pc.id) : ''}
  `;
}

/* ---------------------------------------------------------------
   Plano de Processos da Peça
--------------------------------------------------------------- */

function _calcCustoEstimado(pp, proc) {
    if (pp.tempoEstimado == null) return null;
    const taxa = pp.custoHoraSnapshot ?? Number(proc.custo_hora);
    if (!taxa) return null;
    const horas = pp.unidade_tempo === 'min' ? pp.tempoEstimado / 60 : pp.tempoEstimado;
    return horas * taxa;
}

function _pecaPlanoProcessosHtml(pecaId) {
    const plano = DB.pecas_processos
        .filter(pp => pp.pecaId === pecaId)
        .sort((a, b) => a.ordem - b.ordem);

    const processosAtivos = DB.processos.filter(p => p.ativo);
    const optsProcesso = processosAtivos.map(p =>
        `<option value="${p.id}">${p.ref} — ${p.descricao}</option>`
    ).join('');

    const linhas = plano.length === 0
        ? `<tr><td colspan="7" style="text-align:center;color:var(--color-text-muted);padding:1.5rem;">
            Sem processos definidos. Adiciona o primeiro processo abaixo.</td></tr>`
        : plano.map((pp, idx) => {
            const proc = DB.processos.find(p => p.id === pp.processoId) || pp.processo || {};
            const custoEst = _calcCustoEstimado(pp, proc);
            const custoAtual = Number(proc.custo_hora);
            const snapshot = pp.custoHoraSnapshot;
            const precoAlterado = snapshot != null && custoAtual !== snapshot;
            const custoCell = custoEst != null
                ? `${formatEuro(custoEst)}${precoAlterado
                    ? ` <span title="Custo/h quando adicionado: ${snapshot.toFixed(2)} €/h · atual: ${custoAtual.toFixed(2)} €/h" style="cursor:help;color:var(--color-warning,#b45309);font-size:10px;">⚠</span>`
                    : ''}`
                : '—';
            return `<tr>
              <td style="text-align:center;color:var(--color-text-muted);">${pp.ordem + 1}</td>
              <td><strong>${proc.ref || '—'}</strong></td>
              <td>${proc.descricao || '—'}</td>
              <td>${proc.tipo || '—'}</td>
              <td>${pp.tempoEstimado != null ? pp.tempoEstimado + ' ' + pp.unidade_tempo : '—'}</td>
              <td style="text-align:right;">${custoCell}</td>
              <td style="display:flex;gap:4px;">
                ${idx > 0 ? `<button class="btn btn-ghost btn-sm" title="Mover para cima" onclick="_moverProcessoPeca(${pp.id},-1)">↑</button>` : '<span style="width:32px"></span>'}
                ${idx < plano.length - 1 ? `<button class="btn btn-ghost btn-sm" title="Mover para baixo" onclick="_moverProcessoPeca(${pp.id},1)">↓</button>` : '<span style="width:32px"></span>'}
                <button class="btn btn-ghost btn-sm" title="Remover" style="color:var(--color-danger,#c00);" onclick="_removerProcessoPeca(${pp.id})">✕</button>
              </td>
            </tr>`;
        }).join('');

    const totalProcessos = plano.reduce((sum, pp) => {
        const proc = DB.processos.find(p => p.id === pp.processoId) || {};
        const c = _calcCustoEstimado(pp, proc);
        return sum + (c ?? 0);
    }, 0);

    const pc = DB.pecas.find(p => p.id === pecaId);
    const mp = DB.materia_prima.find(m => m.id === pc?.materiaPrimaId);
    const pesoKg = parseFloat(_calcPeso(pc?.forma, pc?.comprimento, pc?.largura, pc?.altura, pc?.diametro_ext, pc?.diametro_int, mp?.peso_esp)) || 0;
    const custoStock = (pesoKg && pc?.precoMpSnapshot) ? pesoKg * pc.precoMpSnapshot : null;
    const custoTotal = (custoStock ?? 0) + totalProcessos;
    const temCustoTotal = custoStock != null || plano.some(pp => {
        const proc = DB.processos.find(p => p.id === pp.processoId) || {};
        return _calcCustoEstimado(pp, proc) != null;
    });

    return `
    <div class="full-card" style="max-width:800px;margin:1rem auto;padding:2rem;">
      <h4 style="margin:0 0 0.25rem;color:var(--color-primary);">Plano de Processos</h4>
      <hr style="border:none;border-top:2px solid var(--color-primary);margin:0 0 1rem;">
      <table class="table" style="font-size:12px;margin-bottom:1.25rem;">
        <thead><tr>
          <th style="width:50px;text-align:center;">Ord.</th>
          <th style="width:80px;">Ref.</th>
          <th>Processo</th>
          <th>Tipo</th>
          <th style="width:110px;">Tempo Est.</th>
          <th style="width:110px;text-align:right;">Custo Est.</th>
          <th style="width:90px;">Ações</th>
        </tr></thead>
        <tbody>${linhas}</tbody>
        ${plano.length > 0 ? `<tfoot><tr>
          <td colspan="5" style="text-align:right;font-size:11px;color:var(--color-text-muted);padding:6px 8px;">Total processos:</td>
          <td style="text-align:right;font-weight:700;padding:6px 8px;">${formatEuro(totalProcessos)}</td>
          <td></td>
        </tr></tfoot>` : ''}
      </table>
      <details style="margin-top:0.5rem;">
        <summary style="cursor:pointer;font-size:13px;font-weight:600;color:var(--color-primary);list-style:none;display:flex;align-items:center;gap:6px;">
          <span>▸</span> Adicionar processo
        </summary>
        <div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-top:0.75rem;">
          <div style="flex:2;min-width:220px;">
            <label class="form-label">Processo</label>
            <select id="pp-select-processo" style="width:100%;">
              <option value="">Selecionar...</option>${optsProcesso}
            </select>
          </div>
          <div style="flex:0 0 90px;">
            <label class="form-label">Tempo Est.</label>
            <input id="pp-tempo" type="number" min="0" step="0.5" placeholder="0.0" style="width:100%;">
          </div>
          <div style="flex:0 0 70px;">
            <label class="form-label">Unidade</label>
            <select id="pp-unidade" style="width:100%;">
              <option value="h">h</option>
              <option value="min">min</option>
            </select>
          </div>
          <div style="flex:2;min-width:160px;">
            <label class="form-label">Notas</label>
            <input id="pp-notas" placeholder="Opcional" style="width:100%;">
          </div>
          <button class="btn btn-primary" style="height:34px;" onclick="_adicionarProcessoPeca(${pecaId})">Adicionar</button>
        </div>
      </details>
    </div>
    ${temCustoTotal ? `
    <div class="full-card" style="max-width:800px;margin:1rem auto;padding:2rem;">
      <h4 style="margin:0 0 0.25rem;color:var(--color-primary);">Resumo de Custos</h4>
      <hr style="border:none;border-top:2px solid var(--color-primary);margin:0 0 1rem;">
      <div style="display:flex;flex-direction:column;gap:6px;font-size:13px;">
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--color-border);">
          <span style="color:var(--color-text-muted);">Custo de stock</span>
          <span>${custoStock != null ? formatEuro(custoStock) : '<span style="color:var(--color-text-muted);font-size:12px;">sem preço MP registado</span>'}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--color-border);">
          <span style="color:var(--color-text-muted);">Custo de processos</span>
          <span>${formatEuro(totalProcessos)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:10px 0 0;font-weight:700;font-size:15px;">
          <span>Custo estimado</span>
          <span style="color:var(--color-primary);">${formatEuro(custoTotal)}</span>
        </div>
      </div>
    </div>` : ''}`;
}

async function _adicionarProcessoPeca(pecaId) {
    const processoId = Number(document.getElementById('pp-select-processo').value);
    if (!processoId) { _erroToast('Seleciona um processo.'); return; }

    const tempoRaw = document.getElementById('pp-tempo').value;
    const unidade  = document.getElementById('pp-unidade').value;
    const notas    = document.getElementById('pp-notas').value.trim() || null;

    const ordemAtual = DB.pecas_processos.filter(pp => pp.pecaId === pecaId).length;

    const dados = {
        peca_id:        pecaId,
        processo_id:    processoId,
        ordem:          ordemAtual,
        tempo_estimado: tempoRaw !== '' ? Number(tempoRaw) : null,
        unidade_tempo:  unidade,
        notas,
    };

    try {
        const novo = await apiPost('/pecas-processos', dados);
        DB.pecas_processos.push({
            ...novo,
            pecaId:            novo.peca_id,
            processoId:        novo.processo_id,
            tempoEstimado:     novo.tempo_estimado      != null ? Number(novo.tempo_estimado)      : null,
            custoHoraSnapshot: novo.custo_hora_snapshot != null ? Number(novo.custo_hora_snapshot) : null,
        });
        renderPecaDetalhe();
        _successToast('Processo adicionado.');
    } catch (err) {
        _erroToast('Erro ao adicionar processo: ' + err.message);
    }
}

async function _removerProcessoPeca(ppId) {
    try {
        await apiDelete(`/pecas-processos/${ppId}`);
        const idx = DB.pecas_processos.findIndex(pp => pp.id === ppId);
        if (idx !== -1) DB.pecas_processos.splice(idx, 1);
        _reordenarPlanoLocal(_currentPecaId);
        renderPecaDetalhe();
        _successToast('Processo removido.');
    } catch (err) {
        _erroToast('Erro ao remover processo: ' + err.message);
    }
}

async function _moverProcessoPeca(ppId, delta) {
    const pecaId = _currentPecaId;
    const plano = DB.pecas_processos
        .filter(pp => pp.pecaId === pecaId)
        .sort((a, b) => a.ordem - b.ordem);

    const idx = plano.findIndex(pp => pp.id === ppId);
    const idxAlvo = idx + delta;
    if (idxAlvo < 0 || idxAlvo >= plano.length) return;

    // Trocar ordens
    const ordemA = plano[idx].ordem;
    const ordemB = plano[idxAlvo].ordem;

    try {
        await Promise.all([
            apiPut(`/pecas-processos/${plano[idx].id}`,    { ordem: ordemB }),
            apiPut(`/pecas-processos/${plano[idxAlvo].id}`, { ordem: ordemA }),
        ]);
        const entA = DB.pecas_processos.find(pp => pp.id === plano[idx].id);
        const entB = DB.pecas_processos.find(pp => pp.id === plano[idxAlvo].id);
        if (entA) entA.ordem = ordemB;
        if (entB) entB.ordem = ordemA;
        renderPecaDetalhe();
    } catch (err) {
        _erroToast('Erro ao reordenar: ' + err.message);
    }
}

function _reordenarPlanoLocal(pecaId) {
    DB.pecas_processos
        .filter(pp => pp.pecaId === pecaId)
        .sort((a, b) => a.ordem - b.ordem)
        .forEach((pp, i) => { pp.ordem = i; });
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
    let ref = prefEl && xxxEl && nnEl
        ? prefEl.textContent + xxxEl.value.padStart(3, '0') + '-' + nnEl.value.padStart(2, '0')
        : (document.getElementById('f-pc-ref') || {}).value || '';
    // Se o prefixo não foi resolvido (peça sem pedido associado), preservar a ref original
    if (!id && ref.includes('????')) ref = '';
    if (id && ref.includes('????')) ref = DB.pecas.find(p => p.id === id)?.ref || ref;

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
        _successToast('Peça gravada com sucesso.');
        _voltarDePeca();
    } catch (err) {
        _erroToast('Erro ao guardar peça: ' + err.message);
    }
}
