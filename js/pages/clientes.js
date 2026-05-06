/**
 * pages/clientes.js
 * --------------------------------------------------------------------------------
 * Lista de clientes com tabs Todos / Empresas / Particulares.
 * Empresas são expansíveis para mostrar colaboradores.
 * --------------------------------------------------------------------------------
 */

/*A função que faz a renderização da página de clientes.
 *Os clientes são divididos em empresas e particulares.
 *As empresas são expansíveis para mostrar os colaboradores.
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
          <div class="tab ${DB.clienteFilter === 'todos' ? 'active' : ''}" onclick="setClienteFilter('todos',this)">Todos</div>
          <div class="tab ${DB.clienteFilter === 'empresa' ? 'active' : ''}" onclick="setClienteFilter('empresa',this)">Empresas</div>
          <div class="tab ${DB.clienteFilter === 'particular' ? 'active' : ''}" onclick="setClienteFilter('particular',this)">Particulares</div>
        </div>
        <button class="btn btn-primary" onclick="openModal('novoCliente')">+ Novo cliente</button>
      </div>
    </div>

    <div class="full-card">
      <table class="table">
        <thead>
          <tr>
            <th></th><th>Nome</th><th>Tipo</th><th>Telefone</th><th>E-mail</th>
            <th>NIF / CC</th><th>Pedidos</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>${_clientesRows()}</tbody>
      </table>
    </div>`;
}

/**A função que faz a renderização das linhas da tabela de clientes.
 *As linhas são divididas em empresas e particulares.
 *As empresas são expansíveis para mostrar os colaboradores.
 */
function _clientesRows() {
    const f = DB.clienteFilter;
    let html = '';

    if (f === 'todos' || f === 'empresa') {
        DB.empresas.forEach((emp) => {
            const colabs = DB.colaboradores.filter(
                (c) => c.empresaId === emp.id,
            );
            const pedEmp = DB.pedidos.filter(
                (p) =>
                    p.clienteTipo === 'colaborador' &&
                    colabs.some((c) => c.id === p.clienteId),
            ).length;
            const exp = DB.expanded['e' + emp.id];

            html += `<tr class="row-empresa">
        <td><button class="expand-btn" onclick="toggleEmpresa(${emp.id})" style="font-size: 1.25rem;">${exp ? '▼' : '▶'}</button></td>
        <td>${inlineFlex(avatarHtml(emp.nome, 'av-empresa'), emp.nome)}</td>
        <td><span class="badge badge-teal">Empresa</span></td>
        <td>${emp.tel}</td>
        <td>${emp.email}</td>
        <td>${emp.nif}</td>
        <td>${pedEmp}</td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn btn-ghost btn-sm" style="display:flex;align-items:center;gap:4px;" onclick="openModal('editEmpresa', ${emp.id})">
              <svg id='Pencil_24' width='20' height='20' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><rect width='24' height='24' stroke='none' fill='#000000' opacity='0'/>
              <g transform="matrix(1.05 0 0 1.05 12 12)" >
              <path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" translate(-12.5, -11.5)" d="M 19.171875 2 C 18.448125 2 17.724375 2.275625 17.171875 2.828125 L 16 4 L 20 8 L 21.171875 6.828125 C 22.275875 5.724125 22.275875 3.933125 21.171875 2.828125 C 20.619375 2.275625 19.895625 2 19.171875 2 z M 14.5 5.5 L 5 15 C 5 15 6.005 15.005 6.5 15.5 C 6.995 15.995 6.984375 16.984375 6.984375 16.984375 C 6.984375 16.984375 8.004 17.004 8.5 17.5 C 8.996 17.996 9 19 9 19 L 18.5 9.5 L 14.5 5.5 z M 3.6699219 17 L 3.0136719 20.503906 C 2.9606719 20.789906 3.2100938 21.039328 3.4960938 20.986328 L 7 20.330078 L 3.6699219 17 z" stroke-linecap="round" />
              </g>
              </svg>
            </button>
            <button class="btn btn-ghost btn-sm" style="display:flex;align-items:center;gap:4px;" onclick="openModal('colaborador',${emp.id})">
              <svg id='user-plus_24' width='20' height='20' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><rect width='24' height='24' stroke='none' fill='#000000' opacity='0'/>
              <g transform="matrix(1 0 0 1 12 12)" >
              <g style="" >
              <g transform="matrix(1 0 0 1 0 0)" >
              <path style="stroke: none; stroke-width: 2; stroke-dasharray: none; stroke-linecap: round; stroke-dashoffset: 0; stroke-linejoin: round; stroke-miterlimit: 4; fill: none; fill-rule: nonzero; opacity: 1;" transform=" translate(-12, -12)" d="M 0 0 L 24 0 L 24 24 L 0 24 z" stroke-linecap="round" />
              </g>
              <g transform="matrix(1 0 0 1 -3 -5)" >
              <circle style="stroke: rgb(33,33,33); stroke-width: 2; stroke-dasharray: none; stroke-linecap: round; stroke-dashoffset: 0; stroke-linejoin: round; stroke-miterlimit: 4; fill: none; fill-rule: nonzero; opacity: 1;" cx="0" cy="0" r="4" />
              </g>
              <g transform="matrix(1 0 0 1 -3 6)" >
              <path style="stroke: rgb(33,33,33); stroke-width: 2; stroke-dasharray: none; stroke-linecap: round; stroke-dashoffset: 0; stroke-linejoin: round; stroke-miterlimit: 4; fill: none; fill-rule: nonzero; opacity: 1;" transform=" translate(-9, -18)" d="M 3 21 L 3 19 C 3 16.790861000676827 4.790861000676826 15 7 15 L 11 15 C 13.209138999323173 15 15 16.790861000676827 15 19 L 15 21" stroke-linecap="round" />
              </g>
              <g transform="matrix(1 0 0 1 7 -1)" >
              <path style="stroke: rgb(33,33,33); stroke-width: 2; stroke-dasharray: none; stroke-linecap: round; stroke-dashoffset: 0; stroke-linejoin: round; stroke-miterlimit: 4; fill: none; fill-rule: nonzero; opacity: 1;" transform=" translate(-19, -11)" d="M 16 11 L 22 11 M 19 8 L 19 14" stroke-linecap="round" />
              </g>
              </g>
              </g>
              </svg>
            </button>
          </div>
        </td>
      </tr>`;

            if (exp) {
                colabs.forEach((c) => {
                    const pedC = DB.pedidos.filter(
                        (p) =>
                            p.clienteTipo === 'colaborador' &&
                            p.clienteId === c.id,
                    ).length;
                    html += `<tr class="row-colab">
            <td></td>
            <td style="display: flex; align-items: center; gap: 6px;">
            <svg width="10" height="10" viewBox="0 0 10 10" style="margin-left: 4px; flex-shrink: 0;" title="${c.ativo !== false ? 'Ativo' : 'Inativo'}">
              <circle cx="5" cy="5" r="5" fill="${c.ativo !== false ? '#4caf50' : '#f44336'}" />
            </svg>
              ${inlineFlex(avatarHtml(c.nome, 'av-colab'), c.nome)}
            </td>
            <td></td>
            <td style="color:var(--color-text-muted);font-size:12px">${c.tel}</td>
            <td style="color:var(--color-text-muted);font-size:12px">${c.email}</td>
            <td>—</td>
            <td>${pedC}</td>
            <td>
              <button class="btn btn-ghost btn-sm" style="display:flex;align-items:center;gap:4px;" onclick="openModal('editColaborador', ${c.id})">
              <svg id='Pencil_24' width='20' height='20' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><rect width='24' height='24' stroke='none' fill='#000000' opacity='0'/>
              <g transform="matrix(1.05 0 0 1.05 12 12)" >
              <path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" translate(-12.5, -11.5)" d="M 19.171875 2 C 18.448125 2 17.724375 2.275625 17.171875 2.828125 L 16 4 L 20 8 L 21.171875 6.828125 C 22.275875 5.724125 22.275875 3.933125 21.171875 2.828125 C 20.619375 2.275625 19.895625 2 19.171875 2 z M 14.5 5.5 L 5 15 C 5 15 6.005 15.005 6.5 15.5 C 6.995 15.995 6.984375 16.984375 6.984375 16.984375 C 6.984375 16.984375 8.004 17.004 8.5 17.5 C 8.996 17.996 9 19 9 19 L 18.5 9.5 L 14.5 5.5 z M 3.6699219 17 L 3.0136719 20.503906 C 2.9606719 20.789906 3.2100938 21.039328 3.4960938 20.986328 L 7 20.330078 L 3.6699219 17 z" stroke-linecap="round" />
              </g>
              </svg>
              </button>
            </td>
          </tr>`;
                });
            }
        });
    }

    if (f === 'todos' || f === 'particular') {
        DB.particulares.forEach((p) => {
            const pedP = DB.pedidos.filter(
                (pd) =>
                    pd.clienteTipo === 'particular' && pd.clienteId === p.id,
            ).length;
            html += `<tr>
        <td></td>
        <td>${inlineFlex(avatarHtml(p.nome, 'av-particular'), p.nome)}</td>
        <td><span class="badge badge-coral">Particular</span></td>
        <td>${p.tel}</td>
        <td>${p.email}</td>
        <td>${p.cc}</td>
        <td>${pedP}</td>
        <td>
          <button class="btn btn-ghost btn-sm" style="display:flex;align-items:center;gap:4px;" onclick="openModal('editParticular', ${p.id})">
            <svg id='Pencil_24' width='20' height='20' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><rect width='24' height='24' stroke='none' fill='#000000' opacity='0'/>
            <g transform="matrix(1.05 0 0 1.05 12 12)" >
            <path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" translate(-12.5, -11.5)" d="M 19.171875 2 C 18.448125 2 17.724375 2.275625 17.171875 2.828125 L 16 4 L 20 8 L 21.171875 6.828125 C 22.275875 5.724125 22.275875 3.933125 21.171875 2.828125 C 20.619375 2.275625 19.895625 2 19.171875 2 z M 14.5 5.5 L 5 15 C 5 15 6.005 15.005 6.5 15.5 C 6.995 15.995 6.984375 16.984375 6.984375 16.984375 C 6.984375 16.984375 8.004 17.004 8.5 17.5 C 8.996 17.996 9 19 9 19 L 18.5 9.5 L 14.5 5.5 z M 3.6699219 17 L 3.0136719 20.503906 C 2.9606719 20.789906 3.2100938 21.039328 3.4960938 20.986328 L 7 20.330078 L 3.6699219 17 z" stroke-linecap="round" />
            </g>
            </svg>
          </button>
        </td>
      </tr>`;
        });
    }

    return (
        html ||
        `<tr><td colspan="8" style="text-align:center;color:var(--color-text-muted);padding:2rem">Nenhum cliente encontrado.</td></tr>`
    );
}
/*A função que expande e recolhe as empresas.
 */
function toggleEmpresa(empId) {
    DB.expanded['e' + empId] = !DB.expanded['e' + empId];
    renderClientes();
}

/*A função que define o filtro de clientes.
 *A função recebe um parâmetro f que define o filtro.
 */
function setClienteFilter(f) {
    DB.clienteFilter = f;
    renderClientes();
}
