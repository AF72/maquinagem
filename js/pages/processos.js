/**
 * pages/processos.js
 */

const TIPOS_PROCESSO = [
    'Corte (serra)',
    'Torneamento Conv.',
    'Torneamento CNC',
    'Fresagem Conv.',
    'Fresagem CNC',
    'Eletroerosão Penetração',
    'Eletroerosão Fio',
    'Furação',
    'Mandrilagem',
    'Roscagem',
    'Retificação Plana',
    'Retificação Cilíndrica',
    'Soldadura MIG',
    'Soldadura TIG',
    'Montagem',
    'Controlo Dimensional',
    'Prototipagem 2D',
    'Prototipagem 3D',
    'Impressão 3D',
];

const ICON_EDIT_PROC = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1.05 0 0 1.05 12 12)"><path style="fill: currentColor;" transform="translate(-12.5, -11.5)" d="M 19.171875 2 C 18.448125 2 17.724375 2.275625 17.171875 2.828125 L 16 4 L 20 8 L 21.171875 6.828125 C 22.275875 5.724125 22.275875 3.933125 21.171875 2.828125 C 20.619375 2.275625 19.895625 2 19.171875 2 z M 14.5 5.5 L 5 15 C 5 15 6.005 15.005 6.5 15.5 C 6.995 15.995 6.984375 16.984375 6.984375 16.984375 C 6.984375 16.984375 8.004 17.004 8.5 17.5 C 8.996 17.996 9 19 9 19 L 18.5 9.5 L 14.5 5.5 z M 3.6699219 17 L 3.0136719 20.503906 C 2.9606719 20.789906 3.2100938 21.039328 3.4960938 20.986328 L 7 20.330078 L 3.6699219 17 z" /></g></svg>`;

/* ---------- Lista ---------- */

function renderProcessos() {
    const lista = DB.processos;
    document.getElementById('page-processos').innerHTML = `
    <div class="section-header">
      <span class="section-count">${lista.length} processo(s)</span>
      <button class="btn btn-primary" onclick="abrirFormProcesso(null)">+ Novo Processo</button>
    </div>
    <div class="full-card">
      <table class="table">
        <thead>
          <tr>
            <th>Ref.</th>
            <th>Descrição</th>
            <th>Tipo</th>
            <th>Custo/hora</th>
            <th>Estado</th>
            <th style="width:1%">Ação</th>
          </tr>
        </thead>
        <tbody>${_processosRows(lista)}</tbody>
      </table>
    </div>
    ${_processoFormOverlay()}`;
}

function _processosRows(lista) {
    if (lista.length === 0) {
        return `<tr><td colspan="6" style="text-align:center;color:var(--color-text-muted);padding:2rem;">
            Sem processos registados.</td></tr>`;
    }
    return lista.map(p => `<tr>
        <td><code>${p.ref}</code></td>
        <td>${p.descricao}</td>
        <td>${p.tipo}</td>
        <td>${Number(p.custo_hora).toFixed(2)} €/h</td>
        <td><span class="badge ${p.ativo ? 'badge-green' : 'badge-gray'}">${p.ativo ? 'Ativo' : 'Inativo'}</span></td>
        <td><button class="btn btn-ghost btn-sm" title="Editar" onclick="abrirFormProcesso(${p.id})">${ICON_EDIT_PROC}</button></td>
    </tr>`).join('');
}

/* ---------- Overlay de formulário ---------- */

function _tiposOptions(selected) {
    return TIPOS_PROCESSO.map(t =>
        `<option value="${t}" ${selected === t ? 'selected' : ''}>${t}</option>`
    ).join('');
}

function _processoFormOverlay() {
    return `<div id="proc-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:200; align-items:center; justify-content:center; overflow-y:auto; padding:1rem 0;">
      <div style="background:var(--color-surface); border-radius:var(--radius-lg); padding:1.5rem; width:100%; max-width:600px; box-shadow:0 8px 32px rgba(0,0,0,.2);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h3 id="proc-form-title" style="margin:0; font-size:15px; font-weight:600;"></h3>
          <button class="btn btn-ghost" onclick="fecharFormProcesso()">✕</button>
        </div>
        <div class="form-grid">
          <div class="form-group"><label class="form-label">Tipo *</label>
            <select id="proc-tipo"><option value="">Selecionar tipo...</option>${_tiposOptions('')}</select>
          </div>
          <div class="form-group full"><label class="form-label">Descrição *</label><input id="proc-descricao" placeholder="Descrição do processo"></div>
          <div class="form-group"><label class="form-label">Custo por hora (€)</label><input id="proc-custo_hora" readonly style="background:var(--color-surface-alt);color:var(--color-text-muted);cursor:not-allowed;" placeholder="—"></div>
          <div class="form-group" style="display:flex; align-items:center; gap:8px; padding-top:1.6rem;">
            <input id="proc-ativo" type="checkbox" style="width:16px;height:16px;">
            <label for="proc-ativo" class="form-label" style="margin:0; cursor:pointer;">Processo ativo</label>
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:1rem;">
          <button class="btn" onclick="fecharFormProcesso()">Cancelar</button>
          <button class="btn btn-primary" onclick="saveProcesso()">Guardar</button>
        </div>
        <div id="proc-historico-section"></div>
      </div>
    </div>`;
}

/* ---------- Funções ---------- */

let _currentProcessoId = null;

function abrirFormProcesso(id) {
    _currentProcessoId = id;
    const p = id ? DB.processos.find(x => x.id === id) : null;
    document.getElementById('proc-form-title').textContent = id ? 'Editar Processo' : 'Novo Processo';
    document.getElementById('proc-descricao').value  = p ? p.descricao  : '';
    document.getElementById('proc-tipo').value       = p ? p.tipo       : '';
    document.getElementById('proc-ativo').checked    = p ? p.ativo      : true;

    const custoEl = document.getElementById('proc-custo_hora');
    if (id) {
        // Modo edição: só leitura, mostrar valor atual
        custoEl.value    = Number(p.custo_hora).toFixed(2);
        custoEl.readOnly = true;
        custoEl.style.cssText = 'background:var(--color-surface-alt);color:var(--color-text-muted);cursor:not-allowed;';
    } else {
        // Modo criação: editável e obrigatório
        custoEl.value    = '';
        custoEl.readOnly = false;
        custoEl.style.cssText = '';
        custoEl.placeholder = '0.00';
    }

    document.getElementById('proc-overlay').style.display = 'flex';
    if (id) _renderHistoricoProcesso(id);
}

function fecharFormProcesso() {
    document.getElementById('proc-overlay').style.display = 'none';
    _currentProcessoId = null;
}

async function saveProcesso() {
    const descricao = document.getElementById('proc-descricao').value.trim();
    const tipo      = document.getElementById('proc-tipo').value;
    const ativo     = document.getElementById('proc-ativo').checked;

    if (!descricao) { _erroToast('A descrição é obrigatória.');    return; }
    if (!tipo)      { _erroToast('Seleciona o tipo de processo.'); return; }

    const dados = { descricao, tipo, ativo };

    if (!_currentProcessoId) {
        const custoRaw = document.getElementById('proc-custo_hora').value;
        if (custoRaw === '' || isNaN(Number(custoRaw))) { _erroToast('Custo por hora inválido.'); return; }
        dados.custo_hora = Number(custoRaw);
    }

    try {
        if (_currentProcessoId) {
            const atualizado = await apiPut(`/processos/${_currentProcessoId}`, dados);
            const idx = DB.processos.findIndex(x => x.id === _currentProcessoId);
            if (idx !== -1) DB.processos[idx] = atualizado;
            // Recarregar histórico do DB
            const hList = await apiFetch(`/historico-precos-processos?processo_id=${_currentProcessoId}`);
            DB.historico_precos_processos = DB.historico_precos_processos.filter(h => h.processoId !== _currentProcessoId);
            hList.forEach(h => DB.historico_precos_processos.push({ ...h, processoId: h.processo_id, custoHora: Number(h.custo_hora), data: h.data?.slice(0, 10) ?? '' }));
            _renderHistoricoProcesso(_currentProcessoId);
        } else {
            const novo = await apiPost('/processos', dados);
            DB.processos.push(novo);
        }
        fecharFormProcesso();
        renderProcessos();
        _successToast('Processo gravado com sucesso.');
    } catch (err) {
        _erroToast('Erro ao guardar processo: ' + err.message);
    }
}

/* ---------- Histórico de Preços dos Processos ---------- */

function _renderHistoricoProcesso(processoId) {
    const el = document.getElementById('proc-historico-section');
    if (!el) return;
    el.innerHTML = _processoHistoricoHtml(processoId);
}

function _processoHistoricoHtml(processoId) {
    const historico = DB.historico_precos_processos
        .filter(h => h.processoId === processoId)
        .sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id);

    const linhas = historico.length === 0
        ? `<tr><td colspan="4" style="text-align:center;color:var(--color-text-muted);padding:1rem;font-size:12px;">
            Sem histórico registado. O histórico é criado automaticamente ao alterar o custo/hora.</td></tr>`
        : historico.map(h => `<tr>
            <td style="font-size:12px;">${h.data}</td>
            <td style="font-size:12px;font-weight:${h === historico[0] ? '700' : '400'};">
                ${Number(h.custoHora).toFixed(2)} €/h
                ${h === historico[0] ? '<span style="font-size:10px;color:var(--color-success,#2e7d32);margin-left:4px;">atual</span>' : ''}
            </td>
            <td style="font-size:12px;color:var(--color-text-muted);">${h.notas || '—'}</td>
            <td><button class="btn btn-ghost btn-sm" style="color:var(--color-danger,#c00);" title="Remover" onclick="_removerPrecoProcesso(${h.id}, ${processoId})">✕</button></td>
          </tr>`).join('');

    return `
    <div style="border-top:1px solid var(--color-border);margin-top:1rem;padding-top:1rem;">
      <h4 style="margin:0 0 0.75rem;font-size:13px;color:var(--color-primary);">Histórico de Preços (€/h)</h4>
      <table class="table" style="font-size:12px;margin-bottom:1rem;">
        <thead><tr>
          <th style="width:110px;">Data</th>
          <th style="width:130px;">Custo/hora</th>
          <th>Notas</th>
          <th style="width:40px;"></th>
        </tr></thead>
        <tbody>${linhas}</tbody>
      </table>
      <div class="form-grid" style="align-items:end;">
        <div class="form-group">
          <label class="form-label">Novo custo/hora (€) *</label>
          <input id="proc-hist-custo" type="number" min="0" step="0.01" placeholder="0.00">
        </div>
        <div class="form-group">
          <label class="form-label">Data</label>
          <input id="proc-hist-data" type="date" value="${today()}">
        </div>
        <div class="form-group full">
          <label class="form-label">Notas</label>
          <input id="proc-hist-notas" placeholder="Opcional (ex: revisão anual, novo contrato...)">
        </div>
        <div class="form-group" style="display:flex;align-items:flex-end;">
          <button class="btn btn-primary" onclick="_registarPrecoProcesso(${processoId})">Registar preço</button>
        </div>
      </div>
    </div>`;
}

async function _registarPrecoProcesso(processoId) {
    const custoRaw = document.getElementById('proc-hist-custo').value;
    const data     = document.getElementById('proc-hist-data').value;
    const notas    = document.getElementById('proc-hist-notas').value.trim() || null;

    if (!custoRaw || isNaN(Number(custoRaw)) || Number(custoRaw) < 0) {
        _erroToast('Indica um custo/hora válido.'); return;
    }

    const dados = { processo_id: processoId, custo_hora: Number(custoRaw), notas };
    if (data) dados.data = data;

    try {
        const novo = await apiPost('/historico-precos-processos', dados);
        DB.historico_precos_processos.push({
            ...novo,
            processoId: novo.processo_id,
            custoHora:  Number(novo.custo_hora),
            data:       novo.data?.slice(0, 10) ?? '',
        });

        // Atualizar custo_hora no processo e refletir no campo só-leitura
        const atualizado = await apiPut(`/processos/${processoId}`, { custo_hora: Number(custoRaw) });
        const idx = DB.processos.findIndex(x => x.id === processoId);
        if (idx !== -1) DB.processos[idx] = atualizado;
        const custoEl = document.getElementById('proc-custo_hora');
        if (custoEl) custoEl.value = Number(custoRaw).toFixed(2);

        _renderHistoricoProcesso(processoId);
        _successToast('Preço registado com sucesso.');
    } catch (err) {
        _erroToast('Erro ao registar preço: ' + err.message);
    }
}

async function _removerPrecoProcesso(hId, processoId) {
    try {
        await apiDelete(`/historico-precos-processos/${hId}`);
        const idx = DB.historico_precos_processos.findIndex(h => h.id === hId);
        if (idx !== -1) DB.historico_precos_processos.splice(idx, 1);
        _renderHistoricoProcesso(processoId);
        _successToast('Registo removido.');
    } catch (err) {
        _erroToast('Erro ao remover: ' + err.message);
    }
}
