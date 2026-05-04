/**
 * modal.js
 * -------------------------------------------------
 * Gestão do modal genérico: abertura, fecho e
 * construção dinâmica dos formulários.
 * -------------------------------------------------
 */

let _modalCtx = {};

function openModal(type, extra) {
  _modalCtx = { type, extra };
  const titles = {
    novoCliente:  'Novo cliente',
    colaborador:  'Novo colaborador',
    pedido:       'Novo pedido',
    peca:         'Nova peça',
  };
  document.getElementById('modal-title').textContent = titles[type] || '';
  document.getElementById('modal-body').innerHTML    = buildModalForm(type, extra);
  document.getElementById('modal-wrap').classList.add('open');
}

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
    case 'novoCliente':  return formNovoCliente();
    case 'colaborador':  return formColaborador(extra);
    case 'pedido':       return formPedido();
    case 'peca':         return formPeca();
    default: return '';
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
      <div class="form-group"><label class="form-label">Morada</label><input id="f-morada" placeholder="Rua, nº, cidade"></div>
    </div>
  </div>

  <div id="form-particular-fields" style="display:none">
    <div class="form-grid">
      <div class="form-group"><label class="form-label">Nome completo</label><input id="f-nome-p" placeholder="Nome e apelido"></div>
      <div class="form-group"><label class="form-label">Nº Cartão Cidadão</label><input id="f-cc" placeholder="XXXXXXXX"></div>
      <div class="form-group"><label class="form-label">Telefone</label><input id="f-tel-p" placeholder="9XX XXX XXX"></div>
      <div class="form-group"><label class="form-label">Email</label><input id="f-email-p" placeholder="nome@email.com"></div>
      <div class="form-group full"><label class="form-label">Morada</label><input id="f-morada-p" placeholder="Rua, nº, cidade"></div>
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
  document.getElementById('form-empresa-fields').style.display    = tipo === 'empresa'    ? '' : 'none';
  document.getElementById('form-particular-fields').style.display = tipo === 'particular' ? '' : 'none';
  document.getElementById('tbtn-empresa').classList.toggle('active',    tipo === 'empresa');
  document.getElementById('tbtn-particular').classList.toggle('active', tipo === 'particular');
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
  </div>
  <div class="form-actions">
    <button class="btn" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveColaborador(${empresaId})">Guardar colaborador</button>
  </div>`;
}

/* ---------- Novo pedido ---------- */
function formPedido() {
  const colabOpts = DB.colaboradores.map(c => {
    const emp = getEmpresa(c.empresaId);
    return `<option value="colab:${c.id}">${c.nome} — ${emp.nome}</option>`;
  }).join('');
  const partOpts = DB.particulares.map(p =>
    `<option value="part:${p.id}">${p.nome} (particular)</option>`
  ).join('');
  const pecaOpts = DB.pecas.map(p =>
    `<option value="${p.id}">${p.nome} — ${p.material}</option>`
  ).join('');

  return `
  <div class="form-grid">
    <div class="form-group full">
      <label class="form-label">Solicitado por</label>
      <select id="f-clienteKey">
        <optgroup label="Colaboradores de empresa">${colabOpts}</optgroup>
        <optgroup label="Particulares">${partOpts}</optgroup>
      </select>
    </div>
    <div class="form-group"><label class="form-label">Peça</label><select id="f-pecaId">${pecaOpts}</select></div>
    <div class="form-group"><label class="form-label">Quantidade</label><input id="f-qtd" type="number" min="1" placeholder="0"></div>
    <div class="form-group full"><label class="form-label">Data</label><input id="f-data" type="date" value="${today()}"></div>
  </div>
  <div class="form-actions">
    <button class="btn" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="savePedido()">Guardar pedido</button>
  </div>`;
}

/* ---------- Nova peça ---------- */
function formPeca() {
  return `
  <div class="form-grid">
    <div class="form-group"><label class="form-label">Referência</label><input id="f-ref" placeholder="P-XXX"></div>
    <div class="form-group"><label class="form-label">Designação</label><input id="f-nomepeca" placeholder="Nome da peça"></div>
    <div class="form-group">
      <label class="form-label">Material</label>
      <select id="f-material">
        <option>Aço</option><option>Alumínio</option><option>Cobre</option>
        <option>Polímero</option><option>Inox</option>
      </select>
    </div>
    <div class="form-group"><label class="form-label">Espessura</label><input id="f-esp" placeholder="ex: 10mm"></div>
    <div class="form-group"><label class="form-label">Peso (kg)</label><input id="f-peso" type="number" step="0.1" placeholder="0.0"></div>
    <div class="form-group"><label class="form-label">Acabamento</label><input id="f-acab" placeholder="ex: Polido"></div>
    <div class="form-group"><label class="form-label">Custo unitário (€)</label><input id="f-custo" type="number" step="0.01" placeholder="0.00"></div>
  </div>
  <div class="form-actions">
    <button class="btn" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="savePeca()">Guardar peça</button>
  </div>`;
}

/* ============================================================
   Save handlers
   ============================================================ */

function saveEmpresa() {
  const nome = (document.getElementById('f-nome') || {}).value?.trim();
  if (!nome) return;
  DB.empresas.push({
    id:     nextId(),
    nome,
    nif:    document.getElementById('f-nif').value,
    tel:    document.getElementById('f-tel').value,
    email:  document.getElementById('f-email').value,
    morada: document.getElementById('f-morada').value,
  });
  closeModal();
  renderAll();
}

function saveParticular() {
  const nome = (document.getElementById('f-nome-p') || {}).value?.trim();
  if (!nome) return;
  DB.particulares.push({
    id:     nextId(),
    nome,
    cc:     document.getElementById('f-cc').value,
    tel:    document.getElementById('f-tel-p').value,
    email:  document.getElementById('f-email-p').value,
    morada: document.getElementById('f-morada-p').value,
  });
  closeModal();
  renderAll();
}

function saveColaborador(empresaId) {
  const nome = document.getElementById('f-nome').value.trim();
  if (!nome) return;
  DB.colaboradores.push({
    id: nextId(),
    empresaId,
    nome,
    cargo: document.getElementById('f-cargo').value,
    email: document.getElementById('f-email').value,
    tel:   document.getElementById('f-tel').value,
  });
  DB.expanded['e' + empresaId] = true;
  closeModal();
  renderAll();
}

function savePedido() {
  const key  = document.getElementById('f-clienteKey').value;
  const [tipo, idStr] = key.split(':');
  const n = DB.pedidos.length + 1;
  DB.pedidos.push({
    id:          nextId(),
    ref:         'PD-' + padNum(n, 4),
    clienteTipo: tipo === 'colab' ? 'colaborador' : 'particular',
    clienteId:   parseInt(idStr),
    pecaId:      parseInt(document.getElementById('f-pecaId').value),
    qtd:         parseInt(document.getElementById('f-qtd').value) || 1,
    estado:      'Pendente',
    data:        document.getElementById('f-data').value || today(),
  });
  closeModal();
  renderAll();
}

function savePeca() {
  const n = DB.pecas.length + 1;
  DB.pecas.push({
    id:         nextId(),
    ref:        document.getElementById('f-ref').value || 'P-' + padNum(n, 3),
    nome:       document.getElementById('f-nomepeca').value,
    material:   document.getElementById('f-material').value,
    esp:        document.getElementById('f-esp').value,
    peso:       parseFloat(document.getElementById('f-peso').value)  || 0,
    acabamento: document.getElementById('f-acab').value,
    custo:      parseFloat(document.getElementById('f-custo').value) || 0,
  });
  closeModal();
  renderAll();
}
