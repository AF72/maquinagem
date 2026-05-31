/**
 * pages/colaboradores_dm.js
 * Colaboradores internos da DrawMech.
 */

const ICON_EDIT_DM = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1.05 0 0 1.05 12 12)"><path style="fill: currentColor;" transform="translate(-12.5, -11.5)" d="M 19.171875 2 C 18.448125 2 17.724375 2.275625 17.171875 2.828125 L 16 4 L 20 8 L 21.171875 6.828125 C 22.275875 5.724125 22.275875 3.933125 21.171875 2.828125 C 20.619375 2.275625 19.895625 2 19.171875 2 z M 14.5 5.5 L 5 15 C 5 15 6.005 15.005 6.5 15.5 C 6.995 15.995 6.984375 16.984375 6.984375 16.984375 C 6.984375 16.984375 8.004 17.004 8.5 17.5 C 8.996 17.996 9 19 9 19 L 18.5 9.5 L 14.5 5.5 z M 3.6699219 17 L 3.0136719 20.503906 C 2.9606719 20.789906 3.2100938 21.039328 3.4960938 20.986328 L 7 20.330078 L 3.6699219 17 z" /></g></svg>`;
const ICON_KEY_DM  = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="8" cy="15" r="5"/><path d="M13 9l8-4M21 5l-2 4M17 7l-2 4"/></svg>`;

/* ---------- Lista ---------- */

function renderColaboradoresDM() {
    const lista    = DB.colaboradores_dm;
    const eu       = typeof Auth !== 'undefined' ? Auth.getUtilizador() : null;
    const isAdmin  = eu?.role === 'admin';

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
            <th>Email de login</th>
            <th>Perfil</th>
            <th>Estado</th>
            <th style="width:1%">Ação</th>
          </tr>
        </thead>
        <tbody>${_colabDMRows(lista, isAdmin)}</tbody>
      </table>
    </div>
    ${_colabDMFormOverlay()}
    ${isAdmin ? _colabDMPasswordOverlay() : ''}`;
}

function _colabDMRows(lista, isAdmin) {
    if (lista.length === 0) {
        return `<tr><td colspan="6" style="text-align:center;color:var(--color-text-muted);padding:2rem;">
            Sem colaboradores registados.</td></tr>`;
    }
    return lista.map(c => `<tr style="${!c.estado ? 'opacity:.6;' : ''}">
        <td>${c.nome}</td>
        <td>${c.funcao || '—'}</td>
        <td>${c.email || '<span style="color:var(--color-text-muted)">Sem acesso</span>'}</td>
        <td><span class="badge ${c.role === 'admin' ? 'badge-blue' : 'badge-gray'}">${c.role === 'admin' ? 'Admin' : 'Operador'}</span></td>
        <td><span class="badge ${c.estado === 'ativo' ? 'badge-green' : 'badge-gray'}">${c.estado === 'ativo' ? 'Ativo' : 'Inativo'}</span></td>
        <td style="display:flex;gap:4px;">
          <button class="btn btn-ghost btn-sm" title="Editar" onclick="abrirFormColabDM(${c.id})">${ICON_EDIT_DM}</button>
          ${isAdmin ? `<button class="btn btn-ghost btn-sm" title="Definir password" onclick="abrirFormPasswordDM(${c.id},'${c.nome.replace(/'/g, "\\'")}')">${ICON_KEY_DM}</button>` : ''}
        </td>
    </tr>`).join('');
}

/* ---------- Overlay de formulário (criar/editar) ---------- */

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
          <div class="form-group"><label class="form-label">Contacto</label><input id="cdm-contacto" placeholder="Telefone"></div>
          <div class="form-group"><label class="form-label">Email de login</label><input id="cdm-email" type="email" placeholder="utilizador@empresa.pt"></div>
          <div class="form-group">
            <label class="form-label">Perfil</label>
            <select id="cdm-role">
              <option value="operador">Operador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
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

/* ---------- Overlay de definir password (admin) ---------- */

function _colabDMPasswordOverlay() {
    return `<div id="colab-dm-pw-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:200; align-items:center; justify-content:center;">
      <div style="background:var(--color-surface); border-radius:var(--radius-lg); padding:1.5rem; width:100%; max-width:380px; box-shadow:0 8px 32px rgba(0,0,0,.2);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h3 id="cdm-pw-title" style="margin:0; font-size:15px; font-weight:600;"></h3>
          <button class="btn btn-ghost" onclick="fecharFormPasswordDM()">✕</button>
        </div>
        <p style="font-size:13px; color:var(--color-text-muted); margin:0 0 1rem;">Define uma password temporária. O colaborador será obrigado a alterá-la no próximo acesso.</p>
        <div class="form-grid" style="grid-template-columns:1fr;">
          <div class="form-group"><label class="form-label">Password temporária *</label><input id="cdm-pw-temp" type="password" placeholder="Mínimo 8 caracteres"></div>
        </div>
        <div id="cdm-pw-erro" style="font-size:13px; color:var(--color-danger,#e53e3e); min-height:1.2em; margin:.5rem 0;"></div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:.5rem;">
          <button class="btn" onclick="fecharFormPasswordDM()">Cancelar</button>
          <button class="btn btn-primary" id="cdm-pw-btn-save" onclick="savePasswordDM()">Definir Password</button>
        </div>
      </div>
    </div>`;
}

/* ---------- Funções ---------- */

let _currentColabDMId     = null;
let _currentColabDMPwId   = null;

function abrirFormColabDM(id) {
    _currentColabDMId = id;
    const overlay = document.getElementById('colab-dm-overlay');
    const c = id ? DB.colaboradores_dm.find(x => x.id === id) : null;
    document.getElementById('colab-dm-form-title').textContent = id ? 'Editar Colaborador' : 'Novo Colaborador';
    document.getElementById('cdm-nome').value     = c ? c.nome : '';
    document.getElementById('cdm-funcao').value   = c ? (c.funcao || '') : '';
    document.getElementById('cdm-contacto').value = c ? (c.contacto || '') : '';
    document.getElementById('cdm-email').value    = c ? (c.email || '') : '';
    document.getElementById('cdm-role').value     = c ? (c.role || 'operador') : 'operador';
    document.getElementById('cdm-estado').value   = c ? c.estado : 'ativo';
    overlay.style.display = 'flex';
}

function fecharFormColabDM() {
    document.getElementById('colab-dm-overlay').style.display = 'none';
    _currentColabDMId = null;
}

async function saveColabDM() {
    const nome = document.getElementById('cdm-nome').value.trim();
    if (!nome) { alert('O nome é obrigatório.'); return; }

    const emailVal = document.getElementById('cdm-email').value.trim();
    const dados = {
        nome,
        funcao:   document.getElementById('cdm-funcao').value.trim() || undefined,
        contacto: document.getElementById('cdm-contacto').value.trim() || undefined,
        email:    emailVal || null,
        role:     document.getElementById('cdm-role').value,
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
        _successToast('Colaborador gravado com sucesso.');
    } catch (err) {
        _erroToast('Erro ao guardar: ' + err.message);
    }
}

function abrirFormPasswordDM(id, nome) {
    _currentColabDMPwId = id;
    document.getElementById('cdm-pw-title').textContent = `Password: ${nome}`;
    document.getElementById('cdm-pw-temp').value = '';
    document.getElementById('cdm-pw-erro').textContent = '';
    document.getElementById('colab-dm-pw-overlay').style.display = 'flex';
}

function fecharFormPasswordDM() {
    document.getElementById('colab-dm-pw-overlay').style.display = 'none';
    _currentColabDMPwId = null;
}

async function savePasswordDM() {
    const password_temp = document.getElementById('cdm-pw-temp').value;
    const erroEl = document.getElementById('cdm-pw-erro');
    erroEl.textContent = '';

    if (password_temp.length < 8) {
        erroEl.textContent = 'A password deve ter pelo menos 8 caracteres.';
        return;
    }

    const btnEl = document.getElementById('cdm-pw-btn-save');
    btnEl.disabled = true;
    try {
        await apiPatch(`/colaboradores-dm/${_currentColabDMPwId}/password`, { password_temp });
        fecharFormPasswordDM();
        _successToast('Password temporária definida com sucesso.');
    } catch (err) {
        erroEl.textContent = err.message;
    } finally {
        btnEl.disabled = false;
    }
}
