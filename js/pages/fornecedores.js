/**
 * pages/fornecedores.js
 */

const ICON_EDIT_FORN = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1.05 0 0 1.05 12 12)"><path style="fill: currentColor;" transform="translate(-12.5, -11.5)" d="M 19.171875 2 C 18.448125 2 17.724375 2.275625 17.171875 2.828125 L 16 4 L 20 8 L 21.171875 6.828125 C 22.275875 5.724125 22.275875 3.933125 21.171875 2.828125 C 20.619375 2.275625 19.895625 2 19.171875 2 z M 14.5 5.5 L 5 15 C 5 15 6.005 15.005 6.5 15.5 C 6.995 15.995 6.984375 16.984375 6.984375 16.984375 C 6.984375 16.984375 8.004 17.004 8.5 17.5 C 8.996 17.996 9 19 9 19 L 18.5 9.5 L 14.5 5.5 z M 3.6699219 17 L 3.0136719 20.503906 C 2.9606719 20.789906 3.2100938 21.039328 3.4960938 20.986328 L 7 20.330078 L 3.6699219 17 z" /></g></svg>`;

/* ---------- Lista ---------- */

function renderFornecedores() {
    const lista = DB.fornecedores;
    document.getElementById('page-fornecedores').innerHTML = `
    <div class="section-header">
      <span class="section-count">${lista.length} fornecedor(es)</span>
      <button class="btn btn-primary" onclick="abrirFormFornecedor(null)">+ Novo Fornecedor</button>
    </div>
    <div class="full-card">
      <table class="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>NIF</th>
            <th>Localidade</th>
            <th>Pessoa de Contacto</th>
            <th>Email</th>
            <th>Telefone</th>
            <th style="width:1%">Ação</th>
          </tr>
        </thead>
        <tbody>${_fornecedoresRows(lista)}</tbody>
      </table>
    </div>
    ${_fornecedorFormOverlay()}`;
}

function _fornecedoresRows(lista) {
    if (lista.length === 0) {
        return `<tr><td colspan="7" style="text-align:center;color:var(--color-text-muted);padding:2rem;">
            Sem fornecedores registados.</td></tr>`;
    }
    return lista.map(f => `<tr>
        <td>${f.nome}</td>
        <td>${f.nif || '—'}</td>
        <td>${f.localidade || '—'}</td>
        <td>${f.pessoa_contacto || '—'}</td>
        <td>${f.email || '—'}</td>
        <td>${f.telf || '—'}</td>
        <td><button class="btn btn-ghost btn-sm" title="Editar" onclick="abrirFormFornecedor(${f.id})">${ICON_EDIT_FORN}</button></td>
    </tr>`).join('');
}

/* ---------- Overlay de formulário ---------- */

function _fornecedorFormOverlay() {
    return `<div id="forn-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:200; align-items:center; justify-content:center;">
      <div style="background:var(--color-surface); border-radius:var(--radius-lg); padding:1.5rem; width:100%; max-width:520px; box-shadow:0 8px 32px rgba(0,0,0,.2);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h3 id="forn-form-title" style="margin:0; font-size:15px; font-weight:600;"></h3>
          <button class="btn btn-ghost" onclick="fecharFormFornecedor()">✕</button>
        </div>
        <div class="form-grid">
          <div class="form-group full"><label class="form-label">Nome *</label><input id="forn-nome" placeholder="Nome da empresa ou fornecedor"></div>
          <div class="form-group"><label class="form-label">NIF</label><input id="forn-nif" placeholder="Ex: 500000000"></div>
          <div class="form-group"><label class="form-label">Telefone</label><input id="forn-telf" placeholder="+351 ..."></div>
          <div class="form-group full"><label class="form-label">Morada</label><input id="forn-morada" placeholder="Rua, número..."></div>
          <div class="form-group"><label class="form-label">Código Postal</label><input id="forn-codigo_postal" placeholder="0000-000"></div>
          <div class="form-group"><label class="form-label">Localidade</label><input id="forn-localidade" placeholder="Cidade"></div>
          <div class="form-group"><label class="form-label">Pessoa de Contacto</label><input id="forn-pessoa_contacto" placeholder="Nome do contacto"></div>
          <div class="form-group"><label class="form-label">Email</label><input id="forn-email" type="email" placeholder="email@exemplo.com"></div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:1rem;">
          <button class="btn" onclick="fecharFormFornecedor()">Cancelar</button>
          <button class="btn btn-primary" onclick="saveFornecedor()">Guardar</button>
        </div>
      </div>
    </div>`;
}

/* ---------- Funções ---------- */

let _currentFornecedorId = null;

function abrirFormFornecedor(id) {
    _currentFornecedorId = id;
    const f = id ? DB.fornecedores.find(x => x.id === id) : null;
    document.getElementById('forn-form-title').textContent = id ? 'Editar Fornecedor' : 'Novo Fornecedor';
    document.getElementById('forn-nome').value            = f ? f.nome            : '';
    document.getElementById('forn-nif').value             = f ? (f.nif            || '') : '';
    document.getElementById('forn-telf').value            = f ? (f.telf           || '') : '';
    document.getElementById('forn-morada').value          = f ? (f.morada         || '') : '';
    document.getElementById('forn-codigo_postal').value   = f ? (f.codigo_postal  || '') : '';
    document.getElementById('forn-localidade').value      = f ? (f.localidade     || '') : '';
    document.getElementById('forn-pessoa_contacto').value = f ? (f.pessoa_contacto|| '') : '';
    document.getElementById('forn-email').value           = f ? (f.email          || '') : '';
    document.getElementById('forn-overlay').style.display = 'flex';
}

function fecharFormFornecedor() {
    document.getElementById('forn-overlay').style.display = 'none';
    _currentFornecedorId = null;
}

async function saveFornecedor() {
    const nome = document.getElementById('forn-nome').value.trim();
    if (!nome) { _erroToast('O nome é obrigatório.'); return; }

    const dados = {
        nome,
        nif:             document.getElementById('forn-nif').value.trim()             || null,
        telf:            document.getElementById('forn-telf').value.trim()            || null,
        morada:          document.getElementById('forn-morada').value.trim()          || null,
        codigo_postal:   document.getElementById('forn-codigo_postal').value.trim()   || null,
        localidade:      document.getElementById('forn-localidade').value.trim()      || null,
        pessoa_contacto: document.getElementById('forn-pessoa_contacto').value.trim() || null,
        email:           document.getElementById('forn-email').value.trim()           || null,
    };

    try {
        if (_currentFornecedorId) {
            const atualizado = await apiPut(`/fornecedores/${_currentFornecedorId}`, dados);
            const idx = DB.fornecedores.findIndex(x => x.id === _currentFornecedorId);
            if (idx !== -1) DB.fornecedores[idx] = atualizado;
        } else {
            const novo = await apiPost('/fornecedores', dados);
            DB.fornecedores.push(novo);
        }
        fecharFormFornecedor();
        renderFornecedores();
        _successToast('Fornecedor gravado com sucesso.');
    } catch (err) {
        _erroToast('Erro ao guardar fornecedor: ' + err.message);
    }
}
