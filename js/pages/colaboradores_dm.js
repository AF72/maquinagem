/**
 * pages/colaboradores_dm.js
 * Colaboradores internos da DrawMech.
 */

const ICON_EDIT_DM = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1.05 0 0 1.05 12 12)"><path style="fill: currentColor;" transform="translate(-12.5, -11.5)" d="M 19.171875 2 C 18.448125 2 17.724375 2.275625 17.171875 2.828125 L 16 4 L 20 8 L 21.171875 6.828125 C 22.275875 5.724125 22.275875 3.933125 21.171875 2.828125 C 20.619375 2.275625 19.895625 2 19.171875 2 z M 14.5 5.5 L 5 15 C 5 15 6.005 15.005 6.5 15.5 C 6.995 15.995 6.984375 16.984375 6.984375 16.984375 C 6.984375 16.984375 8.004 17.004 8.5 17.5 C 8.996 17.996 9 19 9 19 L 18.5 9.5 L 14.5 5.5 z M 3.6699219 17 L 3.0136719 20.503906 C 2.9606719 20.789906 3.2100938 21.039328 3.4960938 20.986328 L 7 20.330078 L 3.6699219 17 z" /></g></svg>`;

/* ---------- Lista ---------- */

function renderColaboradoresDM() {
    const lista = DB.colaboradores_dm;
    document.getElementById('page-colaboradores_dm').innerHTML = `
    <div class="section-header">
      <span class="section-count">${lista.length} colaborador(es)</span>
      <button class="btn btn-primary" onclick="abrirFormColabDM(null)">+ Novo Colaborador</button>
    </div>
    <div class="full-card">
      <table class="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Função</th>
            <th>Contacto</th>
            <th>Estado</th>
            <th style="width:1%">Ação</th>
          </tr>
        </thead>
        <tbody>${_colabDMRows(lista)}</tbody>
      </table>
    </div>
    ${_colabDMFormOverlay()}`;
}

function _colabDMRows(lista) {
    if (lista.length === 0) {
        return `<tr><td colspan="5" style="text-align:center;color:var(--color-text-muted);padding:2rem;">
            Sem colaboradores registados.</td></tr>`;
    }
    return lista.map(c => `<tr style="${!c.estado ? 'opacity:.6;' : ''}">
        <td>${c.nome}</td>
        <td>${c.funcao || '—'}</td>
        <td>${c.contacto || '—'}</td>
        <td><span class="badge ${c.estado === 'ativo' ? 'badge-green' : 'badge-gray'}">${c.estado === 'ativo' ? 'Ativo' : 'Inativo'}</span></td>
        <td><button class="btn btn-ghost btn-sm" title="Editar" onclick="abrirFormColabDM(${c.id})">${ICON_EDIT_DM}</button></td>
    </tr>`).join('');
}

/* ---------- Overlay de formulário ---------- */

function _colabDMFormOverlay() {
    return `<div id="colab-dm-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:200; align-items:center; justify-content:center;">
      <div style="background:var(--color-surface); border-radius:var(--radius-lg); padding:1.5rem; width:100%; max-width:420px; box-shadow:0 8px 32px rgba(0,0,0,.2);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h3 id="colab-dm-form-title" style="margin:0; font-size:15px; font-weight:600;"></h3>
          <button class="btn btn-ghost" onclick="fecharFormColabDM()">✕</button>
        </div>
        <div class="form-grid" style="grid-template-columns:1fr;">
          <div class="form-group"><label class="form-label">Nome *</label><input id="cdm-nome" placeholder="Nome completo"></div>
          <div class="form-group"><label class="form-label">Função</label><input id="cdm-funcao" placeholder="Ex: Torneiro, Fresador..."></div>
          <div class="form-group"><label class="form-label">Contacto</label><input id="cdm-contacto" placeholder="Telefone ou e-mail"></div>
          <div class="form-group">
            <label class="form-label">Estado</label>
            <select id="cdm-estado">
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:1rem;">
          <button class="btn" onclick="fecharFormColabDM()">Cancelar</button>
          <button class="btn btn-primary" id="cdm-btn-save" onclick="saveColabDM()">Guardar</button>
        </div>
      </div>
    </div>`;
}

/* ---------- Funções ---------- */

let _currentColabDMId = null;

function abrirFormColabDM(id) {
    _currentColabDMId = id;
    const overlay = document.getElementById('colab-dm-overlay');
    const c = id ? DB.colaboradores_dm.find(x => x.id === id) : null;
    document.getElementById('colab-dm-form-title').textContent = id ? 'Editar Colaborador' : 'Novo Colaborador';
    document.getElementById('cdm-nome').value = c ? c.nome : '';
    document.getElementById('cdm-funcao').value = c ? (c.funcao || '') : '';
    document.getElementById('cdm-contacto').value = c ? (c.contacto || '') : '';
    document.getElementById('cdm-estado').value = c ? c.estado : 'ativo';
    overlay.style.display = 'flex';
}

function fecharFormColabDM() {
    document.getElementById('colab-dm-overlay').style.display = 'none';
    _currentColabDMId = null;
}

async function saveColabDM() {
    const nome = document.getElementById('cdm-nome').value.trim();
    if (!nome) { alert('O nome é obrigatório.'); return; }

    const dados = {
        nome,
        funcao:   document.getElementById('cdm-funcao').value.trim() || undefined,
        contacto: document.getElementById('cdm-contacto').value.trim() || undefined,
        estado:   document.getElementById('cdm-estado').value,
    };

    try {
        if (_currentColabDMId) {
            const atualizado = await apiPut(`/colaboradores-dm/${_currentColabDMId}`, dados);
            const idx = DB.colaboradores_dm.findIndex(x => x.id === _currentColabDMId);
            if (idx !== -1) DB.colaboradores_dm[idx] = atualizado;
        } else {
            const novo = await apiPost('/colaboradores-dm', dados);
            DB.colaboradores_dm.push(novo);
        }
        fecharFormColabDM();
        renderColaboradoresDM();
    } catch (err) {
        alert('Erro ao guardar: ' + err.message);
    }
}
