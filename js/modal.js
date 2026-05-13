/**
 * modal.js
 * -------------------------------------------------
 * Gestão do modal genérico: abertura, fecho e
 * construção dinâmica dos formulários.
 * -------------------------------------------------
 */

let _modalCtx = {};
/*Abre o modal com o tipo de formulário e os dados extras.
 * @param {string} type - Tipo de formulário.
 * @param {*} extra - Dados extras.
 */
function openModal(type, extra) {
    _modalCtx = { type, extra };
    const titles = {
        novoCliente: 'Novo cliente',
        editEmpresa: 'Editar empresa',
        editParticular: 'Editar particular',
        colaborador: 'Novo colaborador',
        editColaborador: 'Editar colaborador',
        pedido: 'Novo pedido',
        editPedido: 'Editar pedido',
        viewPedido: 'Detalhes do pedido',
        dados_pedido: 'Novos dados de pedido',
        viewEmpresa: 'Detalhes da empresa',
        viewParticular: 'Detalhes do particular',
        viewColaborador: 'Detalhes do colaborador',
    };
    document.getElementById('modal-title').textContent = titles[type] || '';
    document.getElementById('modal-body').innerHTML = buildModalForm(
        type,
        extra,
    );
    document.getElementById('modal-wrap').classList.add('open');
}

/*Fecha o modal*/
function closeModal() {
    document.getElementById('modal-wrap').classList.remove('open');
}

/* Fecha ao clicar fora do modal */
document.getElementById('modal-wrap').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
});

/* ============================================================
   Form builders
   ============================================================ */

function buildModalForm(type, extra) {
    switch (type) {
        case 'novoCliente':
            return formNovoCliente();
        case 'editEmpresa':
            return formEditEmpresa(extra);
        case 'editParticular':
            return formEditParticular(extra);
        case 'colaborador':
            return formColaborador(extra);
        case 'editColaborador':
            return formEditColaborador(extra);
        case 'pedido':
            return formPedido();
        case 'editPedido':
            return formEditPedido(extra);
        case 'viewPedido':
            return formViewPedido(extra);
        case 'dados_pedido':
            return formDadosPedido();
        case 'viewEmpresa':
            return formViewEmpresa(extra);
        case 'viewParticular':
            return formViewParticular(extra);
        case 'viewColaborador':
            return formViewColaborador(extra);
        default:
            return '';
    }
}

/* ---------- Novo cliente (empresa ou particular) ---------- */
function formNovoCliente() {
    return `
  <div class="type-toggle">
    <button class="type-btn active" id="tbtn-empresa"    onclick="switchClienteType('empresa')">Empresa</button>
    <button class="type-btn"        id="tbtn-particular" onclick="switchClienteType('particular')">Particular</button>
  </div>

  <div id="form-empresa-fields">
    <div class="form-grid">
      <div class="form-group full"><label class="form-label">Nome da empresa</label><input id="f-nome" placeholder="Ex: MetalTec Lda"></div>
      <div class="form-group"><label class="form-label">NIF</label><input id="f-nif" placeholder="NIF"></div>
      <div class="form-group"><label class="form-label">Telefone</label><input id="f-tel" placeholder="2XX XXX XXX"></div>
      <div class="form-group"><label class="form-label">Email</label><input id="f-email" placeholder="geral@empresa.pt"></div>
      <div class="form-group full"><label class="form-label">Morada</label><input id="f-morada" placeholder="Rua, nº"></div>
      <div class="form-group"><label class="form-label">Código Postal</label><input id="f-cp" placeholder="XXXX-XXX"></div>
      <div class="form-group"><label class="form-label">Localidade</label><input id="f-localidade" placeholder="Cidade / Vila"></div>
    </div>
  </div>

  <div id="form-particular-fields" style="display:none">
    <div class="form-grid">
      <div class="form-group"><label class="form-label">Nome completo</label><input id="f-nome-p" placeholder="Nome e apelido"></div>
      <div class="form-group"><label class="form-label">Nº Cartão Cidadão</label><input id="f-cc" placeholder="XXXXXXXX"></div>
      <div class="form-group"><label class="form-label">Telefone</label><input id="f-tel-p" placeholder="9XX XXX XXX"></div>
      <div class="form-group"><label class="form-label">Email</label><input id="f-email-p" placeholder="nome@email.com"></div>
      <div class="form-group full"><label class="form-label">Morada</label><input id="f-morada-p" placeholder="Rua, nº"></div>
      <div class="form-group"><label class="form-label">Código Postal</label><input id="f-cp-p" placeholder="XXXX-XXX"></div>
      <div class="form-group"><label class="form-label">Localidade</label><input id="f-localidade-p" placeholder="Cidade / Vila"></div>
    </div>
  </div>

  <div class="form-actions">
    <button class="btn" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="save-cliente-btn" onclick="saveEmpresa()">Guardar empresa</button>
  </div>`;
}

let _clienteTypeAtivo = 'empresa';
function switchClienteType(tipo) {
    _clienteTypeAtivo = tipo;
    document.getElementById('form-empresa-fields').style.display =
        tipo === 'empresa' ? '' : 'none';
    document.getElementById('form-particular-fields').style.display =
        tipo === 'particular' ? '' : 'none';
    document
        .getElementById('tbtn-empresa')
        .classList.toggle('active', tipo === 'empresa');
    document
        .getElementById('tbtn-particular')
        .classList.toggle('active', tipo === 'particular');
    const btn = document.getElementById('save-cliente-btn');
    if (tipo === 'empresa') {
        btn.textContent = 'Guardar empresa';
        btn.onclick = saveEmpresa;
    } else {
        btn.textContent = 'Guardar particular';
        btn.onclick = saveParticular;
    }
}

/* ---------- Novo colaborador ---------- */
function formColaborador(empresaId) {
    const emp = getEmpresa(empresaId);
    return `
  <p style="font-size:12px;color:var(--color-text-muted);margin-bottom:1rem">
    Empresa: <strong>${emp.nome}</strong>
  </p>
  <div class="form-grid">
    <div class="form-group"><label class="form-label">Nome</label><input id="f-nome" placeholder="Nome completo"></div>
    <div class="form-group"><label class="form-label">Cargo</label><input id="f-cargo" placeholder="Ex: Engenheiro"></div>
    <div class="form-group"><label class="form-label">Email</label><input id="f-email" placeholder="nome@empresa.pt"></div>
    <div class="form-group"><label class="form-label">Telefone</label><input id="f-tel" placeholder="9XX XXX XXX"></div>
    <div class="form-group" style="display: flex; flex-direction: row; align-items: center; gap: 8px; margin-top: auto; padding-bottom: 8px;">
      <input type="checkbox" id="f-ativo" checked style="width: auto; margin: 0; padding: 0;">
      <label class="form-label" style="margin: 0; cursor: pointer;" for="f-ativo">Ativo</label>
    </div>
  </div>
  <div class="form-actions">
    <button class="btn" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveColaborador(${empresaId})">Guardar colaborador</button>
  </div>`;
}

/* ---------- Editar Empresa ---------- */
function formEditEmpresa(id) {
    const emp = DB.empresas.find((e) => e.id === id);
    if (!emp) return '';
    return `
  <div class="form-grid">
    <div class="form-group full"><label class="form-label">Nome da empresa</label><input id="f-nome" value="${emp.nome}"></div>
    <div class="form-group"><label class="form-label">NIF</label><input id="f-nif" value="${emp.nif}"></div>
    <div class="form-group"><label class="form-label">Telefone</label><input id="f-tel" value="${emp.tel}"></div>
    <div class="form-group"><label class="form-label">Email</label><input id="f-email" value="${emp.email}"></div>
    <div class="form-group full"><label class="form-label">Morada</label><input id="f-morada" value="${emp.morada}"></div>
    <div class="form-group"><label class="form-label">Código Postal</label><input id="f-cp" value="${emp.codigo_postal || ''}"></div>
    <div class="form-group"><label class="form-label">Localidade</label><input id="f-localidade" value="${emp.localidade || ''}"></div>
  </div>
  <div class="form-actions">
    <button class="btn" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveEditEmpresa(${id})">Guardar</button>
  </div>`;
}

/* ---------- Editar Particular ---------- */
function formEditParticular(id) {
    const p = DB.particulares.find((e) => e.id === id);
    if (!p) return '';
    return `
  <div class="form-grid">
    <div class="form-group"><label class="form-label">Nome completo</label><input id="f-nome-p" value="${p.nome}"></div>
    <div class="form-group"><label class="form-label">Nº Cartão Cidadão</label><input id="f-cc" value="${p.cc}"></div>
    <div class="form-group"><label class="form-label">Telefone</label><input id="f-tel-p" value="${p.tel}"></div>
    <div class="form-group"><label class="form-label">Email</label><input id="f-email-p" value="${p.email}"></div>
    <div class="form-group full"><label class="form-label">Morada</label><input id="f-morada-p" value="${p.morada}"></div>
    <div class="form-group"><label class="form-label">Código Postal</label><input id="f-cp-p" value="${p.codigo_postal || ''}"></div>
    <div class="form-group"><label class="form-label">Localidade</label><input id="f-localidade-p" value="${p.localidade || ''}"></div>
  </div>
  <div class="form-actions">
    <button class="btn" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveEditParticular(${id})">Guardar</button>
  </div>`;
}

/* ---------- Editar Colaborador ---------- */
function formEditColaborador(id) {
    const c = DB.colaboradores.find((e) => e.id === id);
    if (!c) return '';
    const emp = getEmpresa(c.empresaId);
    return `
  <p style="font-size:12px;color:var(--color-text-muted);margin-bottom:1rem">
    Empresa: <strong>${emp.nome}</strong>
  </p>
  <div class="form-grid">
    <div class="form-group"><label class="form-label">Nome</label><input id="f-nome" value="${c.nome}"></div>
    <div class="form-group"><label class="form-label">Cargo</label><input id="f-cargo" value="${c.cargo}"></div>
    <div class="form-group"><label class="form-label">Email</label><input id="f-email" value="${c.email}"></div>
    <div class="form-group"><label class="form-label">Telefone</label><input id="f-tel" value="${c.tel}"></div>
    <div class="form-group" style="display: flex; flex-direction: row; align-items: center; gap: 8px; margin-top: auto; padding-bottom: 8px;">
      <input type="checkbox" id="f-ativo" ${c.ativo !== false ? 'checked' : ''} style="width: auto; margin: 0; padding: 0;">
      <label class="form-label" style="margin: 0; cursor: pointer;" for="f-ativo">Ativo</label>
    </div>
  </div>
  <div class="form-actions">
    <button class="btn" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveEditColaborador(${id})">Guardar</button>
  </div>`;
}

/* ---------- Novo pedido ---------- */
function formPedido() {
    const colabOpts = DB.colaboradores
        .map((c) => {
            const emp = getEmpresa(c.empresaId);
            return `<option value="colab:${c.id}">${c.nome} — ${emp.nome}</option>`;
        })
        .join('');
    const partOpts = DB.particulares
        .map(
            (p) =>
                `<option value="part:${p.id}">${p.nome} (particular)</option>`,
        )
        .join('');
    const dadosOpts = DB.dados_pedido
        .map(
            (p) =>
                `<option value="${p.id}">${p.ref} — ${p.equipamento} (${p.orgao})</option>`,
        )
        .join('');

    return `
  <div class="form-grid">
    <div class="form-group full">
      <label class="form-label">Solicitado por</label>
      <select id="f-clienteKey">
        <optgroup label="Colaboradores de empresa">${colabOpts}</optgroup>
        <optgroup label="Particulares">${partOpts}</optgroup>
      </select>
    </div>
    <div class="form-group"><label class="form-label">Dados do Pedido</label><select id="f-dadosPedidoId">${dadosOpts}</select></div>
    <div class="form-group full"><label class="form-label">Data</label><input id="f-data" type="date" value="${today()}"></div>
  </div>
  <div class="form-actions">
    <button class="btn" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="savePedido()">Guardar pedido</button>
  </div>`;
}

/* ---------- Editar pedido ---------- */
function formEditPedido(pedidoId) {
    const p = DB.pedidos.find((x) => x.id === pedidoId);
    if (!p) return '';

    const colabOpts = DB.colaboradores
        .map((c) => {
            const emp = getEmpresa(c.empresaId);
            const sel =
                p.clienteTipo === 'colaborador' && p.clienteId === c.id
                    ? 'selected'
                    : '';
            return `<option value="colab:${c.id}" ${sel}>${c.nome} — ${emp.nome}</option>`;
        })
        .join('');
    const partOpts = DB.particulares
        .map((part) => {
            const sel =
                p.clienteTipo === 'particular' && p.clienteId === part.id
                    ? 'selected'
                    : '';
            return `<option value="part:${part.id}" ${sel}>${part.nome} (particular)</option>`;
        })
        .join('');
    const dadosOpts = DB.dados_pedido
        .map((dp) => {
            const sel = p.dadosPedidoId === dp.id ? 'selected' : '';
            return `<option value="${dp.id}" ${sel}>${dp.ref} — ${dp.equipamento} (${dp.orgao})</option>`;
        })
        .join('');

    return `
  <div class="form-grid">
    <div class="form-group full">
      <label class="form-label">Solicitado por</label>
      <select id="f-clienteKey">
        <optgroup label="Colaboradores de empresa">${colabOpts}</optgroup>
        <optgroup label="Particulares">${partOpts}</optgroup>
      </select>
    </div>
    <div class="form-group"><label class="form-label">Dados do Pedido</label><select id="f-dadosPedidoId">${dadosOpts}</select></div>
    <div class="form-group full"><label class="form-label">Data</label><input id="f-data" type="date" value="${p.data}"></div>
  </div>
  <div class="form-actions">
    <button class="btn" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveEditPedido(${pedidoId})">Guardar alterações</button>
  </div>`;
}

/* ---------- Ver pedido ---------- */
function formViewPedido(pedidoId) {
    const p = DB.pedidos.find((x) => x.id === pedidoId);
    if (!p) return '';
    const cl = resolveCliente(p.clienteTipo, p.clienteId);
    const dp = getDadosPedido(p.dadosPedidoId);

    return `
  <div style="margin-bottom:1.5rem; line-height: 1.6;">
    <p><strong>Referência:</strong> ${p.ref}</p>
    <p><strong>Cliente:</strong> ${cl.nome} <span style="color:var(--color-text-muted);font-size:11px">(${cl.subtexto})</span></p>
    <p><strong>Dados do Pedido:</strong> ${dp.ref} — ${dp.equipamento} <span style="color:var(--color-text-muted);font-size:11px">(${dp.orgao} / ${dp.parte})</span></p>
    <p><strong>Data:</strong> ${p.data}</p>
    <p><strong>Estado:</strong> ${estadoBadge(p.estado_pedido)}</p>
  </div>
  <div class="form-actions">
    <button class="btn" onclick="closeModal()">Fechar</button>
    <button class="btn btn-primary" onclick="openModal('editPedido', ${pedidoId})">Editar</button>
  </div>`;
}

/* ---------- Novos dados de pedido ---------- */
function formDadosPedido() {
    return `
  <div class="form-grid">
    <div class="form-group"><label class="form-label">Referência</label><input id="f-refdp" placeholder="DP-XXX"></div>
    <div class="form-group"><label class="form-label">Equipamento</label><input id="f-equipamento" placeholder="Ex: Torno CNC"></div>
    <div class="form-group"><label class="form-label">Órgão</label><input id="f-orgao" placeholder="Ex: Cabeçote"></div>
    <div class="form-group"><label class="form-label">Parte</label><input id="f-parte" placeholder="Ex: Flange Frontal"></div>
    <div class="form-group full"><label class="form-label">Breve Descrição</label><input id="f-brevedesc" placeholder="Breve descrição da necessidade"></div>
    <div class="form-group full"><label class="form-label">Imagem</label><input id="f-imagem" type="text" placeholder="URL ou nome da imagem"></div>
  </div>
  <div class="form-actions">
    <button class="btn" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveDadosPedido()">Guardar dados</button>
  </div>`;
}

/* ============================================================
   Helpers de feedback
   ============================================================ */

function _erroToast(msg) {
    let t = document.getElementById('_api-toast');
    if (!t) {
        t = document.createElement('div');
        t.id = '_api-toast';
        t.style.cssText =
            'position:fixed;bottom:24px;right:24px;background:#e53e3e;color:#fff;' +
            'padding:10px 18px;border-radius:8px;font-size:13px;z-index:9999;' +
            'box-shadow:0 4px 12px rgba(0,0,0,.25);max-width:340px;';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.display = 'block';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => (t.style.display = 'none'), 5000);
}

async function _apiSave(fn) {
    try {
        await fn();
    } catch (err) {
        console.error(err);
        _erroToast('Erro ao guardar: ' + (err.message || 'verifique o servidor'));
    }
}

/* ============================================================
   Save handlers
   ============================================================ */

function saveEmpresa() {
    const nome = (document.getElementById('f-nome') || {}).value?.trim();
    if (!nome) return;
    _apiSave(async () => {
        await apiPost('/empresas', {
            nome,
            nif:           document.getElementById('f-nif').value || undefined,
            tel:           document.getElementById('f-tel').value || undefined,
            email:         document.getElementById('f-email').value || undefined,
            morada:        document.getElementById('f-morada').value || undefined,
            codigo_postal: document.getElementById('f-cp').value || undefined,
            localidade:    document.getElementById('f-localidade').value || undefined,
        });
        closeModal();
        await carregarDados();
        renderAll();
    });
}

function saveParticular() {
    const nome = (document.getElementById('f-nome-p') || {}).value?.trim();
    if (!nome) return;
    _apiSave(async () => {
        await apiPost('/particulares', {
            nome,
            cc:            document.getElementById('f-cc').value || undefined,
            tel:           document.getElementById('f-tel-p').value || undefined,
            email:         document.getElementById('f-email-p').value || undefined,
            morada:        document.getElementById('f-morada-p').value || undefined,
            codigo_postal: document.getElementById('f-cp-p').value || undefined,
            localidade:    document.getElementById('f-localidade-p').value || undefined,
        });
        closeModal();
        await carregarDados();
        renderAll();
    });
}

function saveColaborador(empresaId) {
    const nome = document.getElementById('f-nome').value.trim();
    if (!nome) return;
    _apiSave(async () => {
        await apiPost('/colaboradores', {
            empresa_id: empresaId,
            nome,
            cargo: document.getElementById('f-cargo').value,
            email: document.getElementById('f-email').value,
            tel:   document.getElementById('f-tel').value,
            ativo: document.getElementById('f-ativo').checked,
        });
        DB.expanded['e' + empresaId] = true;
        closeModal();
        await carregarDados();
        renderAll();
    });
}

function saveEditEmpresa(id) {
    _apiSave(async () => {
        await apiPut(`/empresas/${id}`, {
            nome:          document.getElementById('f-nome').value.trim(),
            nif:           document.getElementById('f-nif').value,
            tel:           document.getElementById('f-tel').value,
            email:         document.getElementById('f-email').value,
            morada:        document.getElementById('f-morada').value,
            codigo_postal: document.getElementById('f-cp').value,
            localidade:    document.getElementById('f-localidade').value,
        });
        closeModal();
        await carregarDados();
        renderAll();
    });
}

function saveEditParticular(id) {
    _apiSave(async () => {
        await apiPut(`/particulares/${id}`, {
            nome:          document.getElementById('f-nome-p').value.trim(),
            cc:            document.getElementById('f-cc').value,
            tel:           document.getElementById('f-tel-p').value,
            email:         document.getElementById('f-email-p').value,
            morada:        document.getElementById('f-morada-p').value,
            codigo_postal: document.getElementById('f-cp-p').value,
            localidade:    document.getElementById('f-localidade-p').value,
        });
        closeModal();
        await carregarDados();
        renderAll();
    });
}

function saveEditColaborador(id) {
    _apiSave(async () => {
        await apiPut(`/colaboradores/${id}`, {
            nome:  document.getElementById('f-nome').value.trim(),
            cargo: document.getElementById('f-cargo').value,
            email: document.getElementById('f-email').value,
            tel:   document.getElementById('f-tel').value,
            ativo: document.getElementById('f-ativo').checked,
        });
        closeModal();
        await carregarDados();
        renderAll();
    });
}

function savePedido() {
    const key = document.getElementById('f-clienteKey').value;
    const [tipo, idStr] = key.split(':');
    const clienteTipo = tipo === 'colab' ? 'colaborador' : 'particular';
    const clienteId = parseInt(idStr);
    const n = DB.pedidos.length + 1;
    _apiSave(async () => {
        await apiPost('/pedidos', {
            ref:             'PT' + new Date().getFullYear().toString().slice(-2) + '-' + padNum(n, 4),
            cliente_tipo:    clienteTipo,
            colaborador_id:  clienteTipo === 'colaborador' ? clienteId : undefined,
            particular_id:   clienteTipo === 'particular'  ? clienteId : undefined,
            dados_pedido_id: parseInt(document.getElementById('f-dadosPedidoId').value),
            estado_pedido:   'Pendente',
            data_pedido:     document.getElementById('f-data').value || today(),
        });
        closeModal();
        await carregarDados();
        renderAll();
    });
}

function saveEditPedido(pedidoId) {
    const key = document.getElementById('f-clienteKey').value;
    const [tipo, idStr] = key.split(':');
    const clienteTipo = tipo === 'colab' ? 'colaborador' : 'particular';
    const clienteId = parseInt(idStr);
    _apiSave(async () => {
        await apiPut(`/pedidos/${pedidoId}`, {
            cliente_tipo:    clienteTipo,
            colaborador_id:  clienteTipo === 'colaborador' ? clienteId : null,
            particular_id:   clienteTipo === 'particular'  ? clienteId : null,
            dados_pedido_id: parseInt(document.getElementById('f-dadosPedidoId').value),
            data_pedido:     document.getElementById('f-data').value || today(),
        });
        closeModal();
        await carregarDados();
        renderAll();
    });
}

function saveDadosPedido() {
    const n = DB.dados_pedido.length + 1;
    _apiSave(async () => {
        await apiPost('/dados-pedido', {
            ref:             document.getElementById('f-refdp').value || 'DP-' + padNum(n, 3),
            equipamento:     document.getElementById('f-equipamento').value,
            orgao:           document.getElementById('f-orgao').value,
            parte:           document.getElementById('f-parte').value,
            breve_descricao: document.getElementById('f-brevedesc').value,
            imagem:          document.getElementById('f-imagem').value,
        });
        closeModal();
        await carregarDados();
        renderAll();
    });
}
/* ---------- Ver Empresa (Consulta) ---------- */
function formViewEmpresa(id) {
    const emp = DB.empresas.find((e) => e.id === id);
    if (!emp) return '';
    return `
  <div class="form-grid">
    <div class="form-group full"><label class="form-label">Nome da empresa</label><input value="${emp.nome}" disabled></div>
    <div class="form-group"><label class="form-label">NIF</label><input value="${emp.nif}" disabled></div>
    <div class="form-group"><label class="form-label">Telefone</label><input value="${emp.tel}" disabled></div>
    <div class="form-group"><label class="form-label">Email</label><input value="${emp.email}" disabled></div>
    <div class="form-group full"><label class="form-label">Morada</label><input value="${emp.morada}" disabled></div>
    <div class="form-group"><label class="form-label">Código Postal</label><input value="${emp.codigo_postal || ''}" disabled></div>
    <div class="form-group"><label class="form-label">Localidade</label><input value="${emp.localidade || ''}" disabled></div>
  </div>
  <div class="form-actions">
    <button class="btn btn-primary" onclick="closeModal()">Fechar</button>
  </div>`;
}

/* ---------- Ver Particular (Consulta) ---------- */
function formViewParticular(id) {
    const p = DB.particulares.find((e) => e.id === id);
    if (!p) return '';
    return `
  <div class="form-grid">
    <div class="form-group"><label class="form-label">Nome completo</label><input value="${p.nome}" disabled></div>
    <div class="form-group"><label class="form-label">Nº Cartão Cidadão</label><input value="${p.cc}" disabled></div>
    <div class="form-group"><label class="form-label">Telefone</label><input value="${p.tel}" disabled></div>
    <div class="form-group"><label class="form-label">Email</label><input value="${p.email}" disabled></div>
    <div class="form-group full"><label class="form-label">Morada</label><input value="${p.morada}" disabled></div>
    <div class="form-group"><label class="form-label">Código Postal</label><input value="${p.codigo_postal || ''}" disabled></div>
    <div class="form-group"><label class="form-label">Localidade</label><input value="${p.localidade || ''}" disabled></div>
  </div>
  <div class="form-actions">
    <button class="btn btn-primary" onclick="closeModal()">Fechar</button>
  </div>`;
}

/* ---------- Ver Colaborador (Consulta) ---------- */
function formViewColaborador(id) {
    const c = DB.colaboradores.find((e) => e.id === id);
    if (!c) return '';
    const emp = getEmpresa(c.empresaId);
    return `
  <p style="font-size:12px;color:var(--color-text-muted);margin-bottom:1rem">
    Empresa: <strong>${emp.nome}</strong> <button class="btn btn-ghost btn-sm" onclick="openModal('viewEmpresa', ${emp.id})">(Ver empresa)</button>
  </p>
  <div class="form-grid">
    <div class="form-group"><label class="form-label">Nome</label><input value="${c.nome}" disabled></div>
    <div class="form-group"><label class="form-label">Cargo</label><input value="${c.cargo}" disabled></div>
    <div class="form-group"><label class="form-label">Email</label><input value="${c.email}" disabled></div>
    <div class="form-group"><label class="form-label">Telefone</label><input value="${c.tel}" disabled></div>
    <div class="form-group" style="display: flex; flex-direction: row; align-items: center; gap: 8px; margin-top: auto; padding-bottom: 8px;">
      <input type="checkbox" ${c.ativo !== false ? 'checked' : ''} disabled style="width: auto; margin: 0; padding: 0;">
      <label class="form-label" style="margin: 0;">Ativo</label>
    </div>
  </div>
  <div class="form-actions">
    <button class="btn btn-primary" onclick="closeModal()">Fechar</button>
  </div>`;
}
