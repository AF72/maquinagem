/**
 * pages/materia_prima.js
 * -------------------------------------------------
 * Módulo de Matéria Prima: listagem e detalhe/formulário.
 * Campos: ref_wnr, peso_esp, ref_din, ref_bs, ref_afnor,
 *         ref_une, ref_aisi, ref_jis
 * -------------------------------------------------
 */

let _currentMpId = null;
let _isMpEditMode = false;

/* ---------- Lista ---------- */

function renderMateriaPrima() {
    document.getElementById('page-materia_prima').innerHTML = `
    <div class="section-header">
      <span class="section-count">${DB.materia_prima.length} material(ais)</span>
      <button class="btn btn-primary" onclick="showMateriaPrimaDetalhe(null)">+ Novo Material</button>
    </div>
    <div class="full-card">
      <table class="table">
        <thead>
          <tr>
            <th>W.-Nr.<br><small style="font-weight:400;color:var(--color-text-muted);">Alemanha</small></th>
            <th>Peso Esp.<br><small style="font-weight:400;color:var(--color-text-muted);">g/cm³</small></th>
            <th>DIN<br><small style="font-weight:400;color:var(--color-text-muted);">Alemanha</small></th>
            <th>BS<br><small style="font-weight:400;color:var(--color-text-muted);">Reino Unido</small></th>
            <th>AFNOR<br><small style="font-weight:400;color:var(--color-text-muted);">França</small></th>
            <th>UNE<br><small style="font-weight:400;color:var(--color-text-muted);">Espanha</small></th>
            <th>AISI<br><small style="font-weight:400;color:var(--color-text-muted);">EUA</small></th>
            <th>JIS<br><small style="font-weight:400;color:var(--color-text-muted);">Japão</small></th>
            <th>Preço atual<br><small style="font-weight:400;color:var(--color-text-muted);">€/kg</small></th>
            <th style="width:1%">Ação</th>
          </tr>
        </thead>
        <tbody>${_mpRows()}</tbody>
      </table>
    </div>`;
}

function _mpPrecoAtual(mpId) {
    const h = DB.historico_precos_mp
        .filter(x => x.materiaPrimaId === mpId)
        .sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id);
    return h.length > 0 ? h[0].precoKg : null;
}

function _mpRows() {
    if (DB.materia_prima.length === 0) {
        return `<tr><td colspan="10" style="text-align:center;color:var(--color-text-muted);padding:2rem;">
            Sem materiais registados.</td></tr>`;
    }
    return DB.materia_prima
        .map((m) => {
            const preco = _mpPrecoAtual(m.id);
            return `<tr>
            <td>${m.ref_wnr || '-'}</td>
            <td>${m.peso_esp != null ? m.peso_esp : '-'}</td>
            <td>${m.ref_din || '-'}</td>
            <td>${m.ref_bs || '-'}</td>
            <td>${m.ref_afnor || '-'}</td>
            <td>${m.ref_une || '-'}</td>
            <td>${m.ref_aisi || '-'}</td>
            <td>${m.ref_jis || '-'}</td>
            <td style="font-weight:${preco != null ? '600' : '400'};color:${preco != null ? 'inherit' : 'var(--color-text-muted)'};">
                ${preco != null ? preco.toFixed(2) + ' €/kg' : '—'}
            </td>
            <td>
              <button class="btn btn-ghost btn-sm" title="Ver material" onclick="showMateriaPrimaDetalhe(${m.id})">
                <svg width='20' height='20' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><rect width='24' height='24' stroke='none' fill='#000000' opacity='0'/><g transform="matrix(1.05 0 0 1.05 12 12)"><path style="stroke:none;fill:rgb(0,0,0);fill-rule:nonzero;opacity:1;" transform="translate(-12.5,-11.5)" d="M 19.171875 2 C 18.448125 2 17.724375 2.275625 17.171875 2.828125 L 16 4 L 20 8 L 21.171875 6.828125 C 22.275875 5.724125 22.275875 3.933125 21.171875 2.828125 C 20.619375 2.275625 19.895625 2 19.171875 2 z M 14.5 5.5 L 5 15 C 5 15 6.005 15.005 6.5 15.5 C 6.995 15.995 6.984375 16.984375 6.984375 16.984375 C 6.984375 16.984375 8.004 17.004 8.5 17.5 C 8.996 17.996 9 19 9 19 L 18.5 9.5 L 14.5 5.5 z M 3.6699219 17 L 3.0136719 20.503906 C 2.9606719 20.789906 3.2100938 21.039328 3.4960938 20.986328 L 7 20.330078 L 3.6699219 17 z" stroke-linecap="round"/></g></svg>
              </button>
            </td>
          </tr>`;
        })
        .join('');
}

/* ---------- Detalhe / Formulário ---------- */

function showMateriaPrimaDetalhe(id) {
    _currentMpId = id;
    _isMpEditMode = false;
    showPage('materia_prima_detalhe');
}

function renderMateriaPrimaDetalhe() {
    const isNew = !_currentMpId;
    const m = isNew
        ? { ref_wnr: '', peso_esp: '', ref_din: '', ref_bs: '', ref_afnor: '', ref_une: '', ref_aisi: '', ref_jis: '', tipo_tt: '' }
        : DB.materia_prima.find((x) => x.id === _currentMpId);

    if (!m) return;

    const editavel = isNew || _isMpEditMode;
    const d = (id, val) =>
        `<input id="${id}" value="${val != null ? val : ''}" ${!editavel ? 'disabled' : ''}>`;

    const formHtml = `
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">W.-Nr. (Werkstoffnummer)</label>
          ${d('f-mp-ref_wnr', m.ref_wnr)}
        </div>
        <div class="form-group">
          <label class="form-label">Peso Específico (g/cm³)</label>
          <input id="f-mp-peso_esp" type="number" step="0.001" value="${m.peso_esp != null ? m.peso_esp : ''}" ${!editavel ? 'disabled' : ''}>
        </div>
        <div class="form-group">
          <label class="form-label">Ref. DIN</label>
          ${d('f-mp-ref_din', m.ref_din)}
        </div>
        <div class="form-group">
          <label class="form-label">Ref. BS</label>
          ${d('f-mp-ref_bs', m.ref_bs)}
        </div>
        <div class="form-group">
          <label class="form-label">Ref. AFNOR</label>
          ${d('f-mp-ref_afnor', m.ref_afnor)}
        </div>
        <div class="form-group">
          <label class="form-label">Ref. UNE</label>
          ${d('f-mp-ref_une', m.ref_une)}
        </div>
        <div class="form-group">
          <label class="form-label">Ref. AISI</label>
          ${d('f-mp-ref_aisi', m.ref_aisi)}
        </div>
        <div class="form-group">
          <label class="form-label">Ref. JIS</label>
          ${d('f-mp-ref_jis', m.ref_jis)}
        </div>
        <div class="form-group full">
          <label class="form-label">Tipo de Tratamento Térmico</label>
          <input id="f-mp-tipo_tt" value="${m.tipo_tt || ''}" placeholder="Ex: Têmpera e revenido, Cementação, Nitruração…" ${!editavel ? 'disabled' : ''}>
        </div>
      </div>
      <div class="form-actions" style="margin-top:2rem;">
        <button class="btn" onclick="showPage('materia_prima')">Cancelar</button>
        ${isNew
            ? `<button class="btn btn-primary" onclick="saveMp(null)">Criar Material</button>`
            : !_isMpEditMode
              ? `<button class="btn btn-primary" onclick="toggleMpEditMode()">Editar</button>`
              : `<button class="btn btn-primary" onclick="saveMp(${m.id})">Guardar alterações</button>`
        }
      </div>`;

    document.getElementById('page-materia_prima_detalhe').innerHTML = `
      <div class="section-header">
        <button class="btn btn-ghost-back" onclick="showPage('materia_prima')">&#x21a9 Voltar à Matéria Prima</button>
        <span class="section-count">${isNew ? 'Novo Material' : 'Detalhe: ' + (m.ref_wnr || m.ref_din || 'Material')}</span>
      </div>
      <div class="full-card" style="max-width:800px;margin:0 auto;padding:2rem;">
        ${formHtml}
      </div>
      ${!isNew ? _mpHistoricoPrecos(m.id) : ''}`;
}

function toggleMpEditMode() {
    _isMpEditMode = true;
    renderMateriaPrimaDetalhe();
}

/* ---------- Histórico de Preços da Matéria Prima ---------- */

function _mpHistoricoPrecos(mpId) {
    const historico = DB.historico_precos_mp
        .filter(h => h.materiaPrimaId === mpId)
        .sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id);

    const precoAtual = historico.length > 0 ? historico[0].precoKg : null;

    const linhas = historico.length === 0
        ? `<tr><td colspan="4" style="text-align:center;color:var(--color-text-muted);padding:1.5rem;font-size:12px;">
            Sem preços registados. Adiciona o primeiro registo abaixo.</td></tr>`
        : historico.map(h => `<tr>
            <td style="font-size:12px;">${h.data}</td>
            <td style="font-size:12px;font-weight:${h === historico[0] ? '700' : '400'};">
                ${Number(h.precoKg).toFixed(2)} €/kg
                ${h === historico[0] ? '<span style="font-size:10px;color:var(--color-success,#2e7d32);margin-left:4px;">atual</span>' : ''}
            </td>
            <td style="font-size:12px;color:var(--color-text-muted);">${h.notas || '—'}</td>
            <td><button class="btn btn-ghost btn-sm" style="color:var(--color-danger,#c00);" title="Remover" onclick="_removerPrecoMp(${h.id})">✕</button></td>
          </tr>`).join('');

    return `
    <div class="full-card" style="max-width:800px;margin:1rem auto;padding:2rem;">
      <h4 style="margin:0 0 0.25rem;color:var(--color-primary);">Histórico de Preços</h4>
      <hr style="border:none;border-top:2px solid var(--color-primary);margin:0 0 1rem;">
      ${precoAtual != null ? `<p style="margin:0 0 1rem;font-size:13px;">Preço atual: <strong>${precoAtual.toFixed(2)} €/kg</strong></p>` : ''}
      <table class="table" style="font-size:12px;margin-bottom:1.25rem;">
        <thead><tr>
          <th style="width:120px;">Data</th>
          <th style="width:140px;">Preço (€/kg)</th>
          <th>Notas</th>
          <th style="width:50px;"></th>
        </tr></thead>
        <tbody>${linhas}</tbody>
      </table>
      <div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;">
        <div style="flex:0 0 120px;">
          <label class="form-label">Preço (€/kg) *</label>
          <input id="mp-preco-kg" type="number" min="0.01" step="0.01" placeholder="0.00" style="width:100%;">
        </div>
        <div style="flex:0 0 140px;">
          <label class="form-label">Data</label>
          <input id="mp-preco-data" type="date" value="${today()}" style="width:100%;">
        </div>
        <div style="flex:2;min-width:160px;">
          <label class="form-label">Notas</label>
          <input id="mp-preco-notas" placeholder="Opcional (ex: fornecedor, lote...)" style="width:100%;">
        </div>
        <button class="btn btn-primary" style="height:34px;white-space:nowrap;" onclick="_registarPrecoMp(${mpId})">Registar preço</button>
      </div>
    </div>`;
}

async function _registarPrecoMp(mpId) {
    const precoRaw = document.getElementById('mp-preco-kg').value;
    const data     = document.getElementById('mp-preco-data').value;
    const notas    = document.getElementById('mp-preco-notas').value.trim() || null;

    if (!precoRaw || isNaN(Number(precoRaw)) || Number(precoRaw) <= 0) {
        _erroToast('Indica um preço válido (€/kg).'); return;
    }

    const dados = { materia_prima_id: mpId, preco_kg: Number(precoRaw), notas };
    if (data) dados.data = data;

    try {
        const novo = await apiPost('/historico-precos-mp', dados);
        DB.historico_precos_mp.push({
            ...novo,
            materiaPrimaId: novo.materia_prima_id,
            precoKg:        Number(novo.preco_kg),
            data:           novo.data?.slice(0, 10) ?? '',
        });
        renderMateriaPrimaDetalhe();
        _successToast('Preço registado com sucesso.');
    } catch (err) {
        _erroToast('Erro ao registar preço: ' + err.message);
    }
}

async function _removerPrecoMp(hId) {
    try {
        await apiDelete(`/historico-precos-mp/${hId}`);
        const idx = DB.historico_precos_mp.findIndex(h => h.id === hId);
        if (idx !== -1) DB.historico_precos_mp.splice(idx, 1);
        renderMateriaPrimaDetalhe();
        _successToast('Registo removido.');
    } catch (err) {
        _erroToast('Erro ao remover: ' + err.message);
    }
}

async function saveMp(id) {
    const isNew = !id;
    const dados = {
        ref_wnr:   document.getElementById('f-mp-ref_wnr').value.trim()   || undefined,
        peso_esp:  parseFloat(document.getElementById('f-mp-peso_esp').value) || undefined,
        ref_din:   document.getElementById('f-mp-ref_din').value.trim()   || undefined,
        ref_bs:    document.getElementById('f-mp-ref_bs').value.trim()    || undefined,
        ref_afnor: document.getElementById('f-mp-ref_afnor').value.trim() || undefined,
        ref_une:   document.getElementById('f-mp-ref_une').value.trim()   || undefined,
        ref_aisi:  document.getElementById('f-mp-ref_aisi').value.trim()  || undefined,
        ref_jis:   document.getElementById('f-mp-ref_jis').value.trim()   || undefined,
        tipo_tt:   document.getElementById('f-mp-tipo_tt').value.trim()   || undefined,
    };
    try {
        if (isNew) {
            await apiPost('/materia-prima', dados);
        } else {
            await apiPut(`/materia-prima/${id}`, dados);
        }
        await carregarDados();
        _successToast('Material gravado com sucesso.');
        showPage('materia_prima');
    } catch (err) {
        _erroToast('Erro ao guardar: ' + err.message);
    }
}
