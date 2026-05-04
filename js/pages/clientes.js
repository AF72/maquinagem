/**
 * pages/clientes.js
 * -------------------------------------------------
 * Lista de clientes com tabs Todos / Empresas / Particulares.
 * Empresas são expansíveis para mostrar colaboradores.
 * -------------------------------------------------
 */

function renderClientes() {
  const total = DB.empresas.length + DB.particulares.length;
  document.getElementById('page-clientes').innerHTML = `
    <div class="section-header">
      <span class="section-count">
        ${DB.empresas.length} empresas · ${DB.colaboradores.length} colaboradores · ${DB.particulares.length} particulares
      </span>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div class="filter-tabs">
          <div class="tab ${DB.clienteFilter==='todos'    ?'active':''}" onclick="setClienteFilter('todos',this)">Todos</div>
          <div class="tab ${DB.clienteFilter==='empresa'  ?'active':''}" onclick="setClienteFilter('empresa',this)">Empresas</div>
          <div class="tab ${DB.clienteFilter==='particular'?'active':''}" onclick="setClienteFilter('particular',this)">Particulares</div>
        </div>
        <button class="btn btn-primary" onclick="openModal('novoCliente')">+ Novo cliente</button>
      </div>
    </div>

    <div class="full-card">
      <table class="table">
        <thead>
          <tr>
            <th></th><th>Nome</th><th>Tipo</th><th>Contacto</th>
            <th>NIF / CC</th><th>Detalhe</th><th>Pedidos</th><th></th>
          </tr>
        </thead>
        <tbody>${_clientesRows()}</tbody>
      </table>
    </div>`;
}

function _clientesRows() {
  const f = DB.clienteFilter;
  let html = '';

  if (f === 'todos' || f === 'empresa') {
    DB.empresas.forEach(emp => {
      const colabs  = DB.colaboradores.filter(c => c.empresaId === emp.id);
      const pedEmp  = DB.pedidos.filter(p =>
        p.clienteTipo === 'colaborador' && colabs.some(c => c.id === p.clienteId)
      ).length;
      const exp = DB.expanded['e' + emp.id];

      html += `<tr class="row-empresa">
        <td><button class="expand-btn" onclick="toggleEmpresa(${emp.id})">${exp ? '▾' : '▸'}</button></td>
        <td>${inlineFlex(avatarHtml(emp.nome, 'av-empresa'), emp.nome)}</td>
        <td><span class="badge badge-teal">Empresa</span></td>
        <td>${emp.email}</td>
        <td>${emp.nif}</td>
        <td style="color:var(--color-text-muted);font-size:12px">${colabs.length} colaboradores</td>
        <td>${pedEmp}</td>
        <td><button class="btn btn-sm" onclick="openModal('colaborador',${emp.id})">+ Colaborador</button></td>
      </tr>`;

      if (exp) {
        colabs.forEach(c => {
          const pedC = DB.pedidos.filter(p => p.clienteTipo === 'colaborador' && p.clienteId === c.id).length;
          html += `<tr class="row-colab">
            <td></td>
            <td>${inlineFlex(avatarHtml(c.nome, 'av-colab'), c.nome)}</td>
            <td></td>
            <td style="color:var(--color-text-muted);font-size:12px">${c.email}</td>
            <td>—</td>
            <td style="color:var(--color-text-muted);font-size:12px">${c.cargo}</td>
            <td>${pedC}</td>
            <td></td>
          </tr>`;
        });
      }
    });
  }

  if (f === 'todos' || f === 'particular') {
    DB.particulares.forEach(p => {
      const pedP = DB.pedidos.filter(pd => pd.clienteTipo === 'particular' && pd.clienteId === p.id).length;
      html += `<tr>
        <td></td>
        <td>${inlineFlex(avatarHtml(p.nome, 'av-particular'), p.nome)}</td>
        <td><span class="badge badge-coral">Particular</span></td>
        <td>${p.email}</td>
        <td>${p.cc}</td>
        <td style="color:var(--color-text-muted);font-size:12px">${p.morada}</td>
        <td>${pedP}</td>
        <td></td>
      </tr>`;
    });
  }

  return html || `<tr><td colspan="8" style="text-align:center;color:var(--color-text-muted);padding:2rem">Nenhum cliente encontrado.</td></tr>`;
}

function toggleEmpresa(empId) {
  DB.expanded['e' + empId] = !DB.expanded['e' + empId];
  renderClientes();
}

function setClienteFilter(f) {
  DB.clienteFilter = f;
  renderClientes();
}
