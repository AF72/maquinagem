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
    return `<div id="proc-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:200; align-items:center; justify-content:center;">
      <div style="background:var(--color-surface); border-radius:var(--radius-lg); padding:1.5rem; width:100%; max-width:480px; box-shadow:0 8px 32px rgba(0,0,0,.2);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h3 id="proc-form-title" style="margin:0; font-size:15px; font-weight:600;"></h3>
          <button class="btn btn-ghost" onclick="fecharFormProcesso()">✕</button>
        </div>
        <div class="form-grid">
          <div class="form-group"><label class="form-label">Tipo *</label>
            <select id="proc-tipo"><option value="">Selecionar tipo...</option>${_tiposOptions('')}</select>
          </div>
          <div class="form-group full"><label class="form-label">Descrição *</label><input id="proc-descricao" placeholder="Descrição do processo"></div>
          <div class="form-group"><label class="form-label">Custo por hora (€) *</label><input id="proc-custo_hora" type="number" min="0" step="0.01" placeholder="0.00"></div>
          <div class="form-group" style="display:flex; align-items:center; gap:8px; padding-top:1.6rem;">
            <input id="proc-ativo" type="checkbox" style="width:16px;height:16px;">
            <label for="proc-ativo" class="form-label" style="margin:0; cursor:pointer;">Processo ativo</label>
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:1rem;">
          <button class="btn" onclick="fecharFormProcesso()">Cancelar</button>
          <button class="btn btn-primary" onclick="saveProcesso()">Guardar</button>
        </div>
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
    document.getElementById('proc-custo_hora').value = p ? Number(p.custo_hora).toFixed(2) : '';
    document.getElementById('proc-ativo').checked    = p ? p.ativo      : true;
    document.getElementById('proc-overlay').style.display = 'flex';
}

function fecharFormProcesso() {
    document.getElementById('proc-overlay').style.display = 'none';
    _currentProcessoId = null;
}

async function saveProcesso() {
    const descricao = document.getElementById('proc-descricao').value.trim();
    const tipo      = document.getElementById('proc-tipo').value;
    const custoRaw  = document.getElementById('proc-custo_hora').value;
    const ativo     = document.getElementById('proc-ativo').checked;

    if (!descricao) { _erroToast('A descrição é obrigatória.');     return; }
    if (!tipo)      { _erroToast('Seleciona o tipo de processo.');  return; }
    if (custoRaw === '' || isNaN(Number(custoRaw))) { _erroToast('Custo por hora inválido.'); return; }

    const dados = { descricao, tipo, custo_hora: Number(custoRaw), ativo };

    try {
        if (_currentProcessoId) {
            const atualizado = await apiPut(`/processos/${_currentProcessoId}`, dados);
            const idx = DB.processos.findIndex(x => x.id === _currentProcessoId);
            if (idx !== -1) DB.processos[idx] = atualizado;
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
