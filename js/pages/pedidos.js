/**
 * pages/pedidos.js
 * -------------------------------------------------
 * Lista de pedidos com ação para criar Ordem de Trabalho.
 * -------------------------------------------------
 */

/*As seguintes constantes defiem os icons usados nos pedidos*/
const ICON_VIEW = `<svg id='Heart_Monitor_24' width='20' height='20' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><rect width='24' height='24' stroke='none' fill='#000000' opacity='0'/>
<g transform="matrix(0.19 0 0 0.19 12 12)" >
<path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" translate(-64, -65.4)" d="M 18.199219 15.099609 C 14.199219 15.099609 11 18.300781 11 22.300781 L 11 93.199219 C 11 97.199219 14.199219 100.40039 18.199219 100.40039 L 48.5 100.40039 C 48.5 107.10039 47.799609 107.89922 44.099609 109.69922 L 42 109.69922 C 40.3 109.69922 39 110.99922 39 112.69922 C 39 114.39922 40.3 115.69922 42 115.69922 L 44.800781 115.69922 L 83.099609 115.69922 L 86 115.69922 C 87.7 115.69922 89 114.39922 89 112.69922 C 89 110.99922 87.7 109.69922 86 109.69922 L 83.900391 109.69922 C 80.300391 107.89922 79.5 107.00039 79.5 100.40039 L 109.80078 100.40039 C 113.80078 100.40039 117 97.199219 117 93.199219 L 117 22.300781 C 117 18.300781 113.80078 15.099609 109.80078 15.099609 L 18.199219 15.099609 z M 18.199219 21.099609 L 109.90039 21.099609 C 110.50039 21.099609 111.09961 21.600781 111.09961 22.300781 L 111.09961 77.599609 L 17 77.599609 L 17 22.300781 C 17 21.700781 17.499219 21.099609 18.199219 21.099609 z M 88.300781 29.5 C 85.100781 29.5 82.5 32.100781 82.5 35.300781 C 82.5 36.900781 83.099219 38.400391 84.199219 39.400391 L 75 53.300781 C 74.3 53.000781 73.600781 52.900391 72.800781 52.900391 C 71.600781 52.900391 70.499609 53.300391 69.599609 53.900391 L 62.099609 46.400391 C 62.699609 45.500391 63.099609 44.399219 63.099609 43.199219 C 63.099609 39.999219 60.500781 37.400391 57.300781 37.400391 C 54.100781 37.400391 51.5 39.999219 51.5 43.199219 C 51.5 44.399219 51.9 45.500391 52.5 46.400391 L 45 53.900391 C 44.1 53.300391 43.000781 52.900391 41.800781 52.900391 C 38.600781 52.900391 36 55.499219 36 58.699219 C 36 61.899219 38.600781 64.5 41.800781 64.5 C 45.000781 64.5 47.599609 61.899219 47.599609 58.699219 C 47.599609 57.499219 47.199609 56.4 46.599609 55.5 L 54 48 C 54.9 48.6 55.999219 49 57.199219 49 C 58.399219 49 59.500391 48.6 60.400391 48 L 67.900391 55.5 C 67.300391 56.4 66.900391 57.499219 66.900391 58.699219 C 66.900391 61.899219 69.499219 64.5 72.699219 64.5 C 75.899219 64.5 78.5 61.899219 78.5 58.699219 C 78.5 57.099219 77.900781 55.599609 76.800781 54.599609 L 86 40.800781 C 86.7 41.100781 87.399219 41.199219 88.199219 41.199219 C 91.399219 41.199219 94 38.600391 94 35.400391 C 94.2 32.100391 91.600781 29.5 88.300781 29.5 z M 17 83.699219 L 111 83.699219 L 111 93.199219 C 111 93.799219 110.50078 94.400391 109.80078 94.400391 L 18.199219 94.400391 C 17.599219 94.400391 17 93.899219 17 93.199219 L 17 83.699219 z M 64 86 C 62.34314575050762 86 61 87.34314575050762 61 89 C 61 90.65685424949238 62.34314575050762 92 64 92 C 65.65685424949238 92 67 90.65685424949238 67 89 C 67 87.34314575050762 65.65685424949238 86 64 86 z M 54.5 105.30078 L 73.5 105.30078 L 73.5 109.30078 L 54.5 109.30078 L 54.5 105.30078 z" stroke-linecap="round"/>
</g>
</svg>`;
const ICON_CREATE_OT = `<svg id='Hammer_24' width='20' height='20' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><rect width='24' height='24' stroke='none' fill='#000000' opacity='0'/>
<g transform="matrix(0.71 0 0 0.71 12 12)" >
<path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" translate(-15.98, -16.02)" d="M 7.0625 2 L 9.5625 3.8125 C 14.277344 7.210938 15.707031 10.542969 16 11.28125 L 15.09375 12.1875 L 15.09375 12.21875 L 14.40625 12.90625 L 2.6875 25.0625 L 2 25.78125 L 6.25 30.03125 L 6.96875 29.28125 L 19.375 16.4375 L 19.6875 16.0625 L 19.78125 16 L 20.75 15.65625 L 20.9375 15.84375 L 20.5625 16.75 L 20.28125 17.375 L 23.59375 20.6875 L 29.96875 14.3125 L 27.125 11.46875 L 26.65625 11.03125 L 26.0625 11.25 L 25.15625 11.59375 L 24.9375 11.375 L 25.25 10.375 L 25.375 9.96875 L 25.1875 9.59375 C 25.1875 9.59375 24.132813 7.636719 21.75 5.75 C 19.367188 3.863281 15.59375 2 10.15625 2 Z M 13.09375 4.25 C 16.460938 4.75 18.890625 6.015625 20.53125 7.3125 C 22.296875 8.710938 23 9.84375 23.21875 10.21875 L 22.84375 11.375 L 22.6875 11.9375 L 23.09375 12.375 L 24.6875 13.96875 L 25.3125 13.71875 L 26.1875 13.375 L 27.125 14.3125 L 23.59375 17.84375 L 22.65625 16.90625 L 23.03125 16 L 23.3125 15.375 L 22.8125 14.90625 L 21.6875 13.78125 L 21.25 13.3125 L 20.625 13.53125 L 18.84375 14.25 L 18.65625 14.3125 L 17.9375 13.625 L 17.21875 12.90625 L 18.375 11.75 L 18.15625 11.15625 C 18.15625 11.15625 16.8125 7.761719 13.09375 4.25 Z M 15.8125 14.3125 L 17.25 15.75 L 6.21875 27.15625 L 4.8125 25.75 Z" stroke-linecap="round" />
</g>
</svg>`;

const ICON_EDIT = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1.05 0 0 1.05 12 12)"><path style="fill: currentColor;" transform="translate(-12.5, -11.5)" d="M 19.171875 2 C 18.448125 2 17.724375 2.275625 17.171875 2.828125 L 16 4 L 20 8 L 21.171875 6.828125 C 22.275875 5.724125 22.275875 3.933125 21.171875 2.828125 C 20.619375 2.275625 19.895625 2 19.171875 2 z M 14.5 5.5 L 5 15 C 5 15 6.005 15.005 6.5 15.5 C 6.995 15.995 6.984375 16.984375 6.984375 16.984375 C 6.984375 16.984375 8.004 17.004 8.5 17.5 C 8.996 17.996 9 19 9 19 L 18.5 9.5 L 14.5 5.5 z M 3.6699219 17 L 3.0136719 20.503906 C 2.9606719 20.789906 3.2100938 21.039328 3.4960938 20.986328 L 7 20.330078 L 3.6699219 17 z" /></g></svg>`;

const ICON_CREATE_PRJ = `<svg id="Calculator_24" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><rect width="24" height="24" stroke="none" fill="#000000" opacity="0"/>
<g transform="matrix(0.77 0 0 0.77 12 12)" >
<path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" translate(-13, -13)" d="M 6 0 C 4.34375 0 3 1.34375 3 3 L 3 23 C 3 24.65625 4.34375 26 6 26 L 20 26 C 21.65625 26 23 24.65625 23 23 L 23 3 C 23 1.34375 21.65625 0 20 0 Z M 6 2 L 20 2 C 20.550781 2 21 2.449219 21 3 L 21 8 C 21 8.550781 20.550781 9 20 9 L 6 9 C 5.449219 9 5 8.550781 5 8 L 5 3 C 5 2.449219 5.449219 2 6 2 Z M 17 3 C 16.449219 3 16 3.449219 16 4 L 16 7 C 16 7.550781 16.449219 8 17 8 L 19 8 C 19.550781 8 20 7.550781 20 7 L 20 4 C 20 3.449219 19.550781 3 19 3 Z M 17 4 L 19 4 L 19 7 L 17 7 Z M 6 11 L 8 11 C 8.550781 11 9 11.449219 9 12 L 9 13 C 9 13.550781 8.550781 14 8 14 L 6 14 C 5.449219 14 5 13.550781 5 13 L 5 12 C 5 11.449219 5.449219 11 6 11 Z M 12 11 L 14 11 C 14.550781 11 15 11.449219 15 12 L 15 13 C 15 13.550781 14.550781 14 14 14 L 12 14 C 11.449219 14 11 13.550781 11 13 L 11 12 C 11 11.449219 11.449219 11 12 11 Z M 18 11 L 20 11 C 20.550781 11 21 11.449219 21 12 L 21 13 C 21 13.550781 20.550781 14 20 14 L 18 14 C 17.449219 14 17 13.550781 17 13 L 17 12 C 17 11.449219 17.449219 11 18 11 Z M 6 16 L 8 16 C 8.550781 16 9 16.449219 9 17 L 9 18 C 9 18.550781 8.550781 19 8 19 L 6 19 C 5.449219 19 5 18.550781 5 18 L 5 17 C 5 16.449219 5.449219 16 6 16 Z M 12 16 L 14 16 C 14.550781 16 15 16.449219 15 17 L 15 18 C 15 18.550781 14.550781 19 14 19 L 12 19 C 11.449219 19 11 18.550781 11 18 L 11 17 C 11 16.449219 11.449219 16 12 16 Z M 18 16 L 20 16 C 20.550781 16 21 16.449219 21 17 L 21 18 C 21 18.550781 20.550781 19 20 19 L 18 19 C 17.449219 19 17 18.550781 17 18 L 17 17 C 17 16.449219 17.449219 16 18 16 Z M 6 21 L 8 21 C 8.550781 21 9 21.449219 9 22 L 9 23 C 9 23.550781 8.550781 24 8 24 L 6 24 C 5.449219 24 5 23.550781 5 23 L 5 22 C 5 21.449219 5.449219 21 6 21 Z M 12 21 L 14 21 C 14.550781 21 15 21.449219 15 22 L 15 23 C 15 23.550781 14.550781 24 14 24 L 12 24 C 11.449219 24 11 23.550781 11 23 L 11 22 C 11 21.449219 11.449219 21 12 21 Z M 18 21 L 20 21 C 20.550781 21 21 21.449219 21 22 L 21 23 C 21 23.550781 20.550781 24 20 24 L 18 24 C 17.449219 24 17 23.550781 17 23 L 17 22 C 17 21.449219 17.449219 21 18 21 Z" stroke-linecap="round" />
</g>
</svg>`;

let _pedidosPage = 1;
const _PEDIDOS_PER_PAGE = 15;

/*
 * Renderiza a lista de pedidos
 */
function renderPedidos() {
    const total = DB.pedidos.length;
    const totalPages = Math.max(1, Math.ceil(total / _PEDIDOS_PER_PAGE));
    if (_pedidosPage > totalPages) _pedidosPage = totalPages;

    const inicio = (_pedidosPage - 1) * _PEDIDOS_PER_PAGE;
    const paginados = DB.pedidos.slice(inicio, inicio + _PEDIDOS_PER_PAGE);

    document.getElementById('page-pedidos').innerHTML = `
    <div class="section-header">
      <span class="section-count">${total} pedidos</span>
      ${totalPages > 1 ? _pedidosPaginacao(totalPages) : ''}
      <button class="btn btn-primary" onclick="showPedidoDetalhe(null)">+ Novo pedido</button>
    </div>
    <div class="full-card">
      <table class="table">
        <thead>
          <tr>
            <th style="width:90px">Ref.</th><th>Cliente</th><th>Breve Descrição</th><th>Nº Orçamento</th><th>Custo Líquido</th><th>Ordem de Compra</th><th>Ação</th><th style="width:90px">Estado</th>
          </tr>
        </thead>
        <tbody>${_pedidosRows(paginados)}</tbody>
      </table>
    </div>`;
}

function _pedidosPaginacao(totalPages) {
    const prev = `<button class="btn btn-ghost btn-sm" ${_pedidosPage === 1 ? 'disabled' : ''} onclick="_setPedidosPage(${_pedidosPage - 1})">&#8249;</button>`;
    const next = `<button class="btn btn-ghost btn-sm" ${_pedidosPage === totalPages ? 'disabled' : ''} onclick="_setPedidosPage(${_pedidosPage + 1})">&#8250;</button>`;

    let paginas = '';
    for (let i = 1; i <= totalPages; i++) {
        if (
            totalPages <= 7 ||
            i === 1 || i === totalPages ||
            Math.abs(i - _pedidosPage) <= 1
        ) {
            const active = i === _pedidosPage ? 'btn-primary' : 'btn-ghost';
            paginas += `<button class="btn ${active} btn-sm" onclick="_setPedidosPage(${i})">${i}</button>`;
        } else if (i === 2 && _pedidosPage > 4) {
            paginas += `<span style="padding:0 4px;color:var(--color-text-muted);">…</span>`;
        } else if (i === totalPages - 1 && _pedidosPage < totalPages - 3) {
            paginas += `<span style="padding:0 4px;color:var(--color-text-muted);">…</span>`;
        }
    }

    return `<div style="display:flex;justify-content:center;align-items:center;gap:4px;padding:12px 0 4px;">
        ${prev}${paginas}${next}
    </div>`;
}

function _setPedidosPage(n) {
    _pedidosPage = n;
    renderPedidos();
}

/*
 * Renderiza linhas da tabela de pedidos
 */
function _pedidosRows(pedidos) {
    return pedidos
        .map((p) => {
            const cl = resolveCliente(p.clienteTipo, p.clienteId);
            const dp = getDadosPedido(p.dadosPedidoId);
            const canOT = ['Orçamentar', 'Produção', 'Pendente'].includes(
                p.estado_pedido,
            );
            const ot = DB.ordens.find((o) => o.pedidoId === p.id);
            const label =
                p.clienteTipo === 'particular'
                    ? `<div style="line-height:1.2;"><div>${cl.nome}</div><div style="font-size:11px;color:var(--color-text-muted)">Particular</div></div>`
                    : `<div style="line-height:1.2;"><div>${cl.subtexto}</div><div style="font-size:11px;color:var(--color-text-muted)">${cl.nome}</div></div>`;

            const orcAprovado = DB.orcamentos.find(
                (o) => o.pedidoId === p.id && o.ativo && o.estado === 'Aprovado',
            );

            return `<tr>
      <td>${p.ref}</td>
      <td>${inlineFlex(avatarHtml(cl.nome, cl.avClass, true), label)}</td>

      <td>${dp.breveDescricao || '-'}</td>
      <td>${orcAprovado ? orcAprovado.ref : '-'}</td>
      <td>${orcAprovado && orcAprovado.valor ? formatEuro(orcAprovado.valor) : '-'}</td>
      <td>${dp.ordem_compra || '-'}</td>
      <td style="vertical-align: middle;">
        <div style="display: flex; align-items: center; gap: 4px;">
          <button class="btn btn-ghost btn-sm" title="Ver pedido" onclick="showPedidoDetalhe(${p.id})">${ICON_VIEW}</button>
          ${ot ? `<a href="#" onclick="verDetalheOT(${ot.id});return false;" class="badge badge-blue" style="text-decoration:none;cursor:pointer;">${ot.num}</a>` : canOT ? `<button class="btn btn-ghost btn-sm" title="Criar OT" onclick="criarOT(${p.id})">${ICON_CREATE_OT}</button>` : ''}
        </div>
      </td>
      <td>${estadoBadge(p.estado_pedido)}</td>
    </tr>`;
        })
        .join('');
}

/*
 * Cria uma Ordem de Trabalho a partir de um pedido
 */
async function criarOT(pedidoId) {
    const n = DB.ordens.length + 1;
    const ano = new Date().getFullYear().toString().slice(-2);
    try {
        await apiPost('/ordens', {
            num:       'OT' + ano + '-' + padNum(n, 4),
            pedido_id: pedidoId,
            estado:    'Em curso',
            mo_obra:   100,
        });
        await apiPut(`/pedidos/${pedidoId}`, { estado_pedido: 'Produção' });
        await carregarDados();
        renderAll();
        _successToast('Ordem de trabalho criada.');
    } catch (err) {
        _erroToast('Erro ao criar OT: ' + err.message);
    }
}

let _currentPedidoId = null;
let _isEditMode = false;
let _preSelectedPedidoId = null;
/*
 * Mostra os detalhes de um pedido
 */
async function showPedidoDetalhe(id) {
    _currentPedidoId = id;
    _isEditMode = false;
    if (id) {
        try {
            const registos = await apiFetch(`/historico-precos/pedido/${id}`);
            DB.historico_precos = registos;
        } catch (_) { DB.historico_precos = []; }
    } else {
        DB.historico_precos = [];
    }
    showPage('pedido_detalhe');
}

/*
 * Edita um pedido existente
 */
function editarPedido(id) {
    _currentPedidoId = id;
    _isEditMode = true;
    showPage('pedido_detalhe');
}

/*
 * Encerra um pedido existente
 */
async function encerrarPedido(id) {
    try {
        const ot = DB.ordens.find((o) => o.pedidoId === id);
        if (ot) {
            await apiPatch(`/ordens/${ot.id}/concluir`);
        } else {
            await apiPatch(`/pedidos/${id}/estado`, { estado_pedido: 'Concluido' });
        }
        await carregarDados();
        _successToast('Pedido encerrado.');
        showPage('pedidos');
    } catch (err) {
        console.error(err);
        _erroToast('Erro ao encerrar pedido: ' + (err.message || 'verifique o servidor'));
    }
}

/*
 * Manipula o upload de imagem e mostra o preview
 */
function handleImageUpload(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const base64 = e.target.result;
            document.getElementById('f-dp-imagem').value = base64;
            document.getElementById('image-preview').innerHTML =
                `<img src="${base64}" style="width: 100%; height: 100%; object-fit: contain;">`;
        };
        reader.readAsDataURL(file);
    }
}

/*
 * Abre o modal de consulta de detalhes do cliente selecionado
 */
function verDetalhesCliente() {
    const key = document.getElementById('f-clienteKey').value;
    if (!key) return;
    const [tipo, idStr] = key.split(':');
    const id = parseInt(idStr);
    if (tipo === 'colab') {
        openModal('viewColaborador', id);
    } else {
        openModal('viewParticular', id);
    }
}

/*
 * Renderiza os detalhes de um pedido
 */
function renderPedidoDetalhe() {
    const isNew = !_currentPedidoId;
    const p = isNew
        ? {
              ref:
                  'PT' +
                  new Date().getFullYear().toString().slice(-2) +
                  '-' +
                  padNum(DB.pedidos.length + 1, 4),
              clienteTipo: 'colaborador',
              clienteId: null,
              data: today(),
          }
        : DB.pedidos.find((x) => x.id === _currentPedidoId);

    if (!p) return;

    const dp = isNew
        ? {
              ref: '',
              equipamento: '',
              orgao: '',
              parte: '',
              breveDescricao: '',
              imagem: '',
              tipo_contacto: '',
              ordem_compra: '',
              data_rececao_oc: '',
              custo_total: '',
          }
        : getDadosPedido(p.dadosPedidoId);

    const ot = !isNew
        ? DB.ordens.find(
              (o) => o.id === p.ordemTrabalhoId || o.pedidoId === p.id,
          )
        : null;

    const orcAtivo = !isNew
        ? DB.orcamentos.find((o) => o.pedidoId === p.id && o.ativo)
        : null;
    const orcList = !isNew
        ? DB.orcamentos.filter((o) => o.pedidoId === p.id)
        : [];
    const pecasList = !isNew
        ? DB.pecas.filter((pc) =>
              DB.pecas_pedidos.some(
                  (pp) => pp.pecaId === pc.id && pp.pedidoId === p.id,
              ),
          )
        : [];

    const isCancelado = !isNew && ['Cancelado', 'Concluido'].includes(p.estado_pedido) && !_isEditMode;

    const colabOpts = DB.colaboradores
        .map((c) => {
            const emp = getEmpresa(c.empresaId);
            const sel =
                !isNew &&
                p.clienteTipo === 'colaborador' &&
                p.clienteId === c.id
                    ? 'selected'
                    : '';
            return `<option value="colab:${c.id}" ${sel}>${c.nome} — ${emp.nome}</option>`;
        })
        .join('');
    const partOpts = DB.particulares
        .map((part) => {
            const sel =
                !isNew &&
                p.clienteTipo === 'particular' &&
                p.clienteId === part.id
                    ? 'selected'
                    : '';
            return `<option value="part:${part.id}" ${sel}>${part.nome} (particular)</option>`;
        })
        .join('');

    const formHtml = `
  <div class="form-grid">
    <div style="grid-column:1/-1;display:flex;flex-direction:row;gap:16px;">
      <div style="flex:1;display:flex;flex-direction:column;gap:4px;">
        <label class="form-label">Referência do Pedido</label>
        <input id="f-ref" value="${p.ref}" readonly style="background:#ddedda;cursor:not-allowed;height:30px;box-sizing:border-box;width:100%;border:none;">
      </div>
      <div style="flex:1;display:flex;flex-direction:column;gap:4px;">
        <label class="form-label">Data de Criação PT</label>
        <input id="f-pt-data" type="date" value="${p.data}" readonly style="background:#ddedda;cursor:not-allowed;height:30px;box-sizing:border-box;width:100%;border:none;">
      </div>
      <div style="flex:1;display:flex;flex-direction:column;gap:4px;">
        <label class="form-label">Ordem de Trabalho</label>
        ${ot
          ? `<div style="height:30px;box-sizing:border-box;display:flex;align-items:center;background:#ddedda;border:1px solid var(--color-border);border-radius:var(--radius-sm);padding:0 8px;">
               <a href="#" onclick="showOrdemDetalhe(${ot.id});return false;" style="font-weight:600;color:var(--color-primary);text-decoration:underline;">${ot.num}</a>
             </div>`
          : `<input value="" readonly style="background:#ddedda;cursor:not-allowed;height:30px;box-sizing:border-box;width:100%;">`
        }
      </div>
      <div style="flex:1;display:flex;flex-direction:column;gap:4px;">
        <label class="form-label">Data de Criação OT</label>
        <input id="f-ot-data" type="date" value="${today()}" readonly style="background:#ddedda;cursor:not-allowed;height:30px;box-sizing:border-box;width:100%;border:none;">
      </div>
      <div style="flex:1;display:flex;flex-direction:column;gap:4px;">
        <label class="form-label">Estado do Pedido</label>
        <select id="f-pt-estado" ${!isNew && !_isEditMode ? 'disabled' : ''} style="height:30px;box-sizing:border-box;">
          <option value="Orçamentar" ${p.estado_pedido === 'Orçamentar' ? 'selected' : ''}>Orçamentar</option>
          <option value="Pendente" ${p.estado_pedido === 'Pendente' ? 'selected' : ''}>Pendente</option>
          <option value="Produção" ${p.estado_pedido === 'Produção' ? 'selected' : ''}>Produção</option>
          <option value="Concluido" ${p.estado_pedido === 'Concluido' ? 'selected' : ''}>Concluido</option>
          <option value="Cancelado" ${p.estado_pedido === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
        </select>
      </div>
    </div>
    <div style="grid-column:1/-1;display:flex;flex-direction:row;align-items:flex-end;gap:16px;">
      <div class="form-group" style="flex:0 0 auto;">
        <label class="form-label">Ordem de Compra</label>
        <input id="f-dp-ordem_compra" value="${dp.ordem_compra || ''}" ${!isNew && !_isEditMode ? 'disabled' : ''} oninput="_toggleRececaoOC()">
      </div>
      <div class="form-group" style="flex:0 0 auto;">
        <label class="form-label">Data de Receção OC</label>
        <input id="f-dp-data_rececao_oc" type="date" value="${dp.data_rececao_oc || ''}" ${!isNew && !_isEditMode || !(dp.ordem_compra) ? 'disabled' : ''}>
      </div>
      <div style="margin-left:auto;display:flex;gap:8px;align-items:flex-end;">
        <button class="btn" style="width:120px;" onclick="showPage('pedidos')">Cancelar</button>
        ${isNew
          ? `<button class="btn btn-primary" style="width:120px;" onclick="savePedidoDetalhe(null)">Criar Pedido</button>`
          : !_isEditMode
            ? `<button class="btn btn-primary" style="width:120px;" onclick="toggleEditMode()">Editar</button>`
            : `<button class="btn btn-primary" style="width:120px;" onclick="savePedidoDetalhe(${p.id})">Guardar alterações</button>`
        }
      </div>
    </div>

    <div class="form-group full"><h4 style="margin: 1.5rem 0 0.25rem; color: var(--color-primary);">Dados do Cliente</h4><hr style="border:none;border-top:2px solid var(--color-primary);margin:0 0 0.5rem;"></div>
    <div style="grid-column:1/-1;display:flex;flex-direction:row;align-items:flex-end;gap:16px;">
      <div class="form-group" style="flex:2;">
        <label class="form-label">Solicitado por</label>
        <div style="display:flex;gap:8px;align-items:center;">
          <select id="f-clienteKey" ${!isNew && !_isEditMode ? 'disabled' : ''} style="flex:1;">
            <optgroup label="Colaboradores de empresa">${colabOpts}</optgroup>
            <optgroup label="Particulares">${partOpts}</optgroup>
          </select>
          <button class="btn btn-ghost" title="Ver detalhes do cliente" onclick="verDetalhesCliente()">${ICON_VIEW}</button>
        </div>
      </div>
      <div class="form-group" style="flex:1;">
        <label class="form-label">Tipo de Contacto</label>
        <select id="f-dp-tipo_contacto" ${!isNew && !_isEditMode ? 'disabled' : ''}>
          <option value="" ${!dp.tipo_contacto ? 'selected' : ''}>Selecione...</option>
          <option value="Instalações Cliente" ${dp.tipo_contacto === 'Instalações Cliente' ? 'selected' : ''}>Instalações Cliente</option>
          <option value="Instalações DM" ${dp.tipo_contacto === 'Instalações DM' ? 'selected' : ''}>Instalações DM</option>
          <option value="E-mail" ${dp.tipo_contacto === 'E-mail' ? 'selected' : ''}>E-mail</option>
        </select>
      </div>
    </div>
    
    <!-- Seccao dados do equipamento -->
    <div class="form-group full"><h4 style="margin: 1.5rem 0 0.25rem; color: var(--color-primary);">Dados do Equipamento / Peça</h4><hr style="border:none;border-top:2px solid var(--color-primary);margin:0 0 0.5rem;"></div>
    
    <div class="form-group"><label class="form-label">Ref. Equipamento</label><input id="f-dp-ref" value="${dp.ref || ''}" placeholder="Ex: DP-005" ${!isNew && !_isEditMode ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Equipamento</label><input id="f-dp-equipamento" value="${dp.equipamento || ''}" ${!isNew && !_isEditMode ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Órgão</label><input id="f-dp-orgao" value="${dp.orgao || ''}" ${!isNew && !_isEditMode ? 'disabled' : ''}></div>
    <div class="form-group"><label class="form-label">Parte</label><input id="f-dp-parte" value="${dp.parte || ''}" ${!isNew && !_isEditMode ? 'disabled' : ''}></div>
    <div class="form-group full"><label class="form-label">Breve Descrição</label><input id="f-dp-breve" value="${dp.breveDescricao || ''}" ${!isNew && !_isEditMode ? 'disabled' : ''}></div>
    <div class="form-group">
      <label class="form-label">Imagem (.png)</label>
      <input id="f-dp-imagem-file" type="file" accept=".png" ${!isNew && !_isEditMode ? 'disabled' : ''} onchange="handleImageUpload(this)">
      <input id="f-dp-imagem" type="hidden" value="${dp.imagem || ''}">
    </div>
    <div class="form-group">
      <label class="form-label">Pré-visualização</label>
      <div id="image-preview" style="width: 100%; height: 200px; border: 1px solid var(--color-border); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; background: var(--color-surface-alt); overflow: hidden;">
        ${dp.imagem ? `<img src="${dp.imagem}" style="width: 100%; height: 100%; object-fit: contain;">` : '<span style="font-size: 10px; color: var(--color-text-muted);">Sem imagem</span>'}
      </div>
    </div>
    <!-- Seccao de peças -->
    <div class="form-group full"><h4 style="margin: 1.5rem 0 0.25rem; color: var(--color-primary);">Peças</h4><hr style="border:none;border-top:2px solid var(--color-primary);margin:0 0 0.5rem;"></div>
    ${
        !isNew
            ? `
      <div style="grid-column: 1 / -1; display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
        <button class="btn btn-primary" onclick="criarPecaParaPedido(${p.id})" ${isCancelado ? 'disabled' : ''}>+ Nova Peça</button>
        <button class="btn" onclick="abrirPesquisaPecas(${p.id})" ${isCancelado ? 'disabled' : ''}>Pesquisar peças</button>
      </div>
      ${
          pecasList.length > 0
              ? `<div class="form-group full">
        <p style="font-size:12px; color:var(--color-text-muted); margin-bottom:8px;">Peças associadas (${pecasList.length})</p>
        <table class="table" style="font-size:12px;table-layout:fixed;width:100%;">
          <thead><tr>
            <th style="width:100px;">Ref.</th>
            <th style="width:160px;">Denominação</th>
            <th style="width:80px;">Plano</th>
            <th style="width:160px;">Material</th>
            <th style="width:160px;">Dimensões (mm)</th>
            <th style="width:70px;">Peso (kg)</th>
            <th style="width:160px;">Fornecedor</th>
            <th style="width:100px;">Preço Compra (€)</th>
            <th style="width:80px;">Ação</th>
          </tr></thead>
          <tbody>${pecasList
              .map((pc) => {
                  const emOrcamento = DB.orcamento_itens.some(item =>
                      item.pecaId === pc.id &&
                      DB.orcamentos.some(o => o.id === item.orcamentoId && o.pedidoId === p.id)
                  );
                  const hist = (DB.historico_precos || []).find(h => h.peca_id === pc.id && h.pedido_id === p.id);
                  const fornOpts = DB.fornecedores.map(f =>
                      `<option value="${f.id}" ${hist && hist.fornecedor_id === f.id ? 'selected' : ''}>${f.nome}</option>`
                  ).join('');
                  const dimParts = [];
                  if (pc.comprimento) dimParts.push(`C:${pc.comprimento}`);
                  if (pc.largura)     dimParts.push(`L:${pc.largura}`);
                  if (pc.diametro_ext) dimParts.push(`∅ext:${pc.diametro_ext}`);
                  if (pc.diametro_int) dimParts.push(`∅int:${pc.diametro_int}`);
                  const dim = dimParts.join(' · ') || '—';
                  const mpPc = DB.materia_prima.find(m => m.id === pc.materiaPrimaId);
                  const pesoPc = _calcPeso(pc.forma, pc.comprimento, pc.largura, pc.altura, pc.diametro_ext, pc.diametro_int, mpPc?.peso_esp);
                  return `<tr>
            <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${pc.ref}</td>
            <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${pc.denominacao || '-'}</td>
            <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${pc.plano || '-'}</td>
            <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_resolverMaterial(pc.materiaPrimaId)}</td>
            <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${dim}</td>
            <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${pesoPc || '—'}</td>
            <td>
              <select style="font-size:11px;width:100%;box-sizing:border-box;" ${!_isEditMode ? 'disabled' : ''} onchange="guardarHistoricoPreco(${p.id},${pc.id},this.value,null)">
                <option value="">DM</option>
                ${fornOpts}
              </select>
            </td>
            <td>
              <input type="number" step="0.01" min="0" value="${hist && hist.preco_compra != null ? Number(hist.preco_compra).toFixed(2) : ''}"
                style="font-size:11px;width:100%;box-sizing:border-box;"
                ${!_isEditMode ? 'disabled' : ''}
                onchange="guardarHistoricoPreco(${p.id},${pc.id},null,this.value)">
            </td>
            <td style="display:flex;gap:4px;">
              <button class="btn btn-ghost btn-sm" title="Ver peça" onclick="verPecaOverlay(${pc.id})">${ICON_VIEW}</button>
              <button class="btn btn-ghost btn-sm" title="Historial de preços" onclick="verHistorialPrecos(${pc.id})">📋</button>
              ${emOrcamento ? '' : `<button class="btn btn-ghost btn-sm" style="color:var(--color-danger,#c0392b);" onclick="removerPecaDoPedido(${p.id},${pc.id})" title="Remover associação">✕</button>`}
            </td>
          </tr>`;
              })
              .join('')}</tbody>
        </table>
      </div>`
              : ''
      }
    `
            : ''
    }

    <!-- Seccao de servicos -->
    ${!isNew ? `
    <div class="form-group full"><h4 style="margin: 1.5rem 0 0.25rem; color: var(--color-primary);">Serviços</h4><hr style="border:none;border-top:2px solid var(--color-primary);margin:0 0 0.5rem;"></div>
    <div style="grid-column: 1 / -1; display:flex; flex-direction:column; gap:12px;">
      <div>
        <button class="btn btn-primary" onclick="abrirAdicionarServico(${p.id})" ${isCancelado ? 'disabled' : ''}>+ Adicionar Serviço</button>
      </div>
      ${(() => {
          const spList = DB.servicos_pedidos.filter(sp => sp.pedidoId === p.id);
          if (spList.length === 0) return '<p style="font-size:12px;color:var(--color-text-muted);margin:0;">Sem serviços associados.</p>';
          return `<table class="table" style="font-size:12px;table-layout:fixed;width:100%;">
            <thead><tr>
              <th style="width:100px;">Ref.</th>
              <th style="width:180px;">Fornecedor</th>
              <th style="width:160px;">Tipo de Serviço</th>
              <th style="width:180px;">Descrição</th>
              <th style="width:80px;">Qtd.</th>
              <th style="width:60px;">Unid.</th>
              <th style="width:100px;">Preço Unit. (€)</th>
              <th style="width:100px;">Total (€)</th>
              <th style="width:60px;">Ação</th>
            </tr></thead>
            <tbody>${spList.map(sp => {
                const sv = DB.servicos.find(s => s.id === sp.servicoId);
                if (!sv) return '';
                const total = sp.quantidade * sp.precoUnitario;
                return `<tr>
                  <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${sv.ref}</td>
                  <td>
                    <select style="font-size:11px;width:100%;box-sizing:border-box;" ${!_isEditMode ? 'disabled' : ''}
                      onchange="guardarFornecedorServico(${sp.id}, this.value)">
                      <option value="">DM</option>
                      ${DB.fornecedores.map(f => `<option value="${f.id}" ${sp.fornecedorId === f.id ? 'selected' : ''}>${f.nome}</option>`).join('')}
                    </select>
                  </td>
                  <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${sv.tipo_servico}</td>
                  <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${sv.descricao || '—'}</td>
                  <td>
                    <input type="number" step="0.01" min="0.01" value="${sp.quantidade}"
                      style="font-size:11px;width:100%;box-sizing:border-box;"
                      ${!_isEditMode ? 'disabled' : ''}
                      onchange="guardarServicoPedido(${sp.id}, 'quantidade', this.value)">
                  </td>
                  <td>${sv.unidade || '—'}</td>
                  <td>
                    <input type="number" step="0.01" min="0" value="${sp.precoUnitario.toFixed(2)}"
                      style="font-size:11px;width:100%;box-sizing:border-box;"
                      ${!_isEditMode ? 'disabled' : ''}
                      onchange="guardarServicoPedido(${sp.id}, 'preco_unitario', this.value)">
                  </td>
                  <td style="font-weight:600;">${formatEuro(total)}</td>
                  <td>${(() => {
                    const emOrcamentoItem = DB.orcamento_itens.some(item =>
                        item.itemTipo === 'servico' &&
                        item.servicoId === sp.servicoId &&
                        DB.orcamentos.some(o => o.id === item.orcamentoId && o.pedidoId === p.id)
                    );
                    const pedidoTemOrcamentoAtivo = DB.orcamentos.some(o => o.pedidoId === p.id && o.ativo);
                    const emOrcamento = emOrcamentoItem || pedidoTemOrcamentoAtivo;
                    if (isCancelado || emOrcamento) return '';
                    return `<button class="btn btn-ghost btn-sm" style="color:var(--color-danger,#c0392b);"
                      onclick="removerServicoDoPedido(${sp.id})" title="Remover serviço">✕</button>`;
                  })()}</td>
                </tr>`;
            }).join('')}</tbody>
          </table>`;
      })()}
    </div>` : ''}

    <!-- Seccao de orçamentos  -->
    <div class="form-group full"><h4 style="margin: 1.5rem 0 0.25rem; color: var(--color-primary);">Orçamentos</h4><hr style="border:none;border-top:2px solid var(--color-primary);margin:0 0 0.5rem;"></div>
    ${
        !isNew
            ? `
      <div style="grid-column: 1 / -1;">
        <button class="btn btn-primary" onclick="criarOrcamentoParaPedido(${p.id})" ${isCancelado ? 'disabled' : ''}>+ Novo Orçamento</button>
      </div>
      ${
          orcList.length > 0
              ? `<div class="form-group full">
        <p style="font-size:12px; color:var(--color-text-muted); margin-bottom:8px;">Historial de orçamentos (${orcList.length})</p>
        <table class="table" style="font-size:12px;">
          <thead><tr><th>Ref.</th><th>Quantidade</th><th>Unidades</th><th>Preço Unitário</th><th>Custo Líquido</th><th>Emissão</th><th>Estado</th><th>Ativo</th><th></th></tr></thead>
          <tbody>${orcList.flatMap(o => {
              const itens = DB.orcamento_itens.filter(i => i.orcamentoId === o.id);
              const headerRow = `<tr style="${o.ativo ? 'font-weight:600;' : 'opacity:0.7;'}">
                <td>${o.ref}</td>
                <td colspan="3" style="font-size:11px;color:var(--color-text-muted);">${itens.length > 0 ? itens.length + ' item(ns)' : '—'}</td>
                <td>${o.valor > 0 ? formatEuro(o.valor) : '—'}</td>
                <td>${o.dataEmissao}</td>
                <td><span class="badge ${o.estado === 'Aprovado' ? 'badge-green' : o.estado === 'Rejeitado' ? 'badge-red' : 'badge-orange'}">${o.estado}</span></td>
                <td>${o.ativo ? '<span class="badge badge-blue">Ativo</span>' : '<span class="badge badge-gray">—</span>'}</td>
                <td><button class="btn btn-ghost btn-sm" title="Editar orçamento" onclick="editarOrcamento(${o.id})">${ICON_EDIT}</button></td>
              </tr>`;
              const itemRows = itens.map(i => {
                  const unidade = i.itemTipo === 'servico' ? (i.servico?.unidade || '—') : 'pç';
                  const ref = i.itemTipo === 'peca'
                      ? (DB.pecas.find(pc => pc.id === i.pecaId)?.ref || '—')
                      : (i.servico?.ref || '—');
                  return `<tr style="font-size:11px;background:var(--color-surface-alt);opacity:${o.ativo ? '1' : '0.6'};">
                    <td style="padding-left:20px;color:var(--color-text-muted);">${ref}</td>
                    <td>${i.quantidade}</td>
                    <td>${unidade}</td>
                    <td>${formatEuro(i.precoUnitario)}</td>
                    <td style="color:var(--color-text-muted);">${formatEuro(i.quantidade * i.precoUnitario)}</td>
                    <td colspan="4"></td>
                  </tr>`;
              });
              return [headerRow, ...itemRows];
          }).join('')}</tbody>
        </table>
      </div>`
              : ''
      }
      ${(() => {
          const orcAprovado = orcList.find(o => o.estado === 'Aprovado' && o.ativo);
          if (!orcAprovado) return '';
          return `<div style="grid-column: 1 / -1; display:flex; justify-content:flex-end; margin-top:8px;">
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:2px;">
          <span style="font-size:11px; color:var(--color-text-muted); text-transform:uppercase; letter-spacing:.05em;">Custo Líquido</span>
          <span style="font-size:16px; font-weight:700; color:var(--color-primary);">${formatEuro(orcAprovado.valor)}</span>
        </div>
      </div>`;
      })()}
    `
            : ''
    }

    <!-- Seccao de notas -->
    ${!isNew ? `
    <div class="form-group full"><h4 style="margin: 1.5rem 0 0.25rem; color: var(--color-primary);">Notas</h4><hr style="border:none;border-top:2px solid var(--color-primary);margin:0 0 0.5rem;"></div>
    <div class="form-group full" style="display:flex; flex-direction:column; gap:12px;">
      ${(() => {
          const notas = DB.notas_pedido.filter(n => n.pedidoId === p.id);
          const colabOpts = DB.colaboradores_dm
              .filter(c => c.estado === 'ativo')
              .map(c => `<option value="${c.id}">${c.nome}${c.funcao ? ' — ' + c.funcao : ''}</option>`)
              .join('');
          return `
          ${notas.length > 0 ? `
          <table class="table" style="font-size:12px;">
            <thead><tr><th>Data</th><th>Criado por</th><th>Nota</th><th></th></tr></thead>
            <tbody>${notas.map(n => {
                const colab = DB.colaboradores_dm.find(c => c.id === n.criadoPorId);
                return `<tr>
                  <td style="white-space:nowrap;">${n.dataHora}</td>
                  <td style="white-space:nowrap;">${colab ? colab.nome : '—'}</td>
                  <td style="white-space:pre-wrap;">${n.nota}</td>
                  <td><button class="btn btn-ghost btn-sm" style="color:var(--color-danger,#c0392b);" onclick="apagarNota(${n.id})" title="Apagar nota">✕</button></td>
                </tr>`;
            }).join('')}</tbody>
          </table>` : '<p style="font-size:12px;color:var(--color-text-muted);margin:0;">Sem notas registadas.</p>'}
          <div style="display:flex; flex-direction:column; gap:8px; padding:12px; background:var(--color-surface-alt); border-radius:var(--radius-md); border:1px solid var(--color-border);">
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <div style="flex:1; min-width:180px;">
                <label class="form-label" style="font-size:11px;">Criado por</label>
                <select id="nota-criado-por" style="width:100%;">
                  <option value="">Selecione...</option>
                  ${colabOpts}
                </select>
              </div>
            </div>
            <div>
              <label class="form-label" style="font-size:11px;">Nota</label>
              <textarea id="nota-texto" rows="3" style="width:100%; box-sizing:border-box; resize:vertical;" placeholder="Escreva a nota aqui..."></textarea>
            </div>
            <div style="display:flex; justify-content:flex-end;">
              <button class="btn btn-primary" onclick="adicionarNota(${p.id})">+ Adicionar Nota</button>
            </div>
          </div>`;
      })()}
    </div>` : ''}
  </div>


  `;

    document.getElementById('page-pedido_detalhe').innerHTML = `
    <div class="section-header">
      <button class="btn btn-ghost-back" onclick="showPage('pedidos')">&#x21a9 Voltar aos Pedidos</button>
      <span class="section-count">${isNew ? 'Novo Pedido' : 'Detalhe do Pedido: ' + p.ref}</span>
      ${!isNew ? `<button class="btn" onclick="exportarPedidoPDF(${p.id})">⬇ Exportar PDF</button>` : ''}
    </div>
    <div class="full-card" style="padding: 2rem;">
      ${formHtml}
    </div>
  `;
}
/*
 * Gera PDF do pedido
 */
function exportarPedidoPDF(pedidoId) {
    const p   = DB.pedidos.find(x => x.id === pedidoId);
    if (!p) return;
    const dp  = getDadosPedido(p.dadosPedidoId);
    const cl  = resolveCliente(p.clienteTipo, p.clienteId);
    const ot  = DB.ordens.find(o => o.pedidoId === p.id);
    const orcList  = DB.orcamentos.filter(o => o.pedidoId === p.id);
    const pecasList = DB.pecas.filter(pc =>
        DB.pecas_pedidos.some(pp => pp.pecaId === pc.id && pp.pedidoId === p.id));
    const notas = DB.notas_pedido.filter(n => n.pedidoId === p.id);

    const linha = (label, valor) =>
        `<tr><td style="padding:4px 8px;font-weight:600;color:#555;width:40%">${label}</td>
             <td style="padding:4px 8px;">${valor || '—'}</td></tr>`;

    const secTitle = t =>
        `<h3 style="margin:18px 0 4px;padding-bottom:4px;border-bottom:2px solid #2e6b3e;color:#2e6b3e;font-size:13px;">${t}</h3>`;

    const orcRows = orcList.map(o =>
        `<tr>
          <td style="padding:3px 6px;">${o.ref}</td>
          <td style="padding:3px 6px;">${o.valor > 0 ? formatEuro(o.valor) : '—'}</td>
          <td style="padding:3px 6px;">${o.dataEmissao || '—'}</td>
          <td style="padding:3px 6px;">${o.estado}</td>
         </tr>`).join('');

    const pecasRows = pecasList.map(pc =>
        `<tr>
          <td style="padding:3px 6px;">${pc.ref}</td>
          <td style="padding:3px 6px;">${pc.denominacao || '—'}</td>
          <td style="padding:3px 6px;">${_resolverMaterial(pc.materiaPrimaId)}</td>
         </tr>`).join('');

    const notasRows = notas.map(n => {
        const colab = DB.colaboradores_dm.find(c => c.id === n.criadoPorId);
        return `<tr>
          <td style="padding:3px 6px;white-space:nowrap;">${n.dataHora || '—'}</td>
          <td style="padding:3px 6px;">${colab ? colab.nome : '—'}</td>
          <td style="padding:3px 6px;">${n.nota}</td>
         </tr>`;
    }).join('');

    const html = `
    <div style="font-family:Arial,sans-serif;font-size:12px;color:#222;padding:24px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
        <div>
          <h1 style="margin:0;font-size:20px;color:#2e6b3e;">Pedido ${p.ref}</h1>
          <p style="margin:4px 0 0;color:#777;font-size:11px;">Data: ${p.data || '—'} &nbsp;|&nbsp; Estado: ${p.estado_pedido}</p>
        </div>
        <div style="text-align:right;font-size:10px;color:#aaa;">
          Gerado em ${new Date().toLocaleDateString('pt-PT')} ${new Date().toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit'})}
        </div>
      </div>

      ${secTitle('Dados do Cliente')}
      <table style="width:100%;border-collapse:collapse;">
        ${linha('Cliente', cl.nome)}
        ${linha('Empresa / Tipo', cl.subtexto || (p.clienteTipo === 'particular' ? 'Particular' : '—'))}
        ${linha('Tipo de Contacto', dp.tipo_contacto)}
        ${linha('Ordem de Compra', dp.ordem_compra)}
        ${linha('Data Receção OC', dp.data_rececao_oc)}
        ${ot ? linha('Ordem de Trabalho', ot.num) : ''}
      </table>

      ${secTitle('Dados do Equipamento / Peça')}
      <table style="width:100%;border-collapse:collapse;">
        ${linha('Ref. Equipamento', dp.ref)}
        ${linha('Equipamento', dp.equipamento)}
        ${linha('Órgão', dp.orgao)}
        ${linha('Parte', dp.parte)}
        ${linha('Breve Descrição', dp.breveDescricao)}
      </table>

      ${secTitle('Peças')}
      ${pecasList.length > 0 ? `
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        <thead><tr style="background:#f0f4f0;">
          <th style="padding:4px 6px;text-align:left;">Ref.</th>
          <th style="padding:4px 6px;text-align:left;">Denominação</th>
          <th style="padding:4px 6px;text-align:left;">Material</th>
        </tr></thead>
        <tbody>${pecasRows}</tbody>
      </table>` : '<p style="font-size:11px;color:#999;margin:4px 0;">Sem peças associadas.</p>'}

      ${secTitle('Orçamentos')}
      ${orcList.length > 0 ? `
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        <thead><tr style="background:#f0f4f0;">
          <th style="padding:4px 6px;text-align:left;">Ref.</th>
          <th style="padding:4px 6px;text-align:left;">Valor</th>
          <th style="padding:4px 6px;text-align:left;">Emissão</th>
          <th style="padding:4px 6px;text-align:left;">Estado</th>
        </tr></thead>
        <tbody>${orcRows}</tbody>
      </table>` : '<p style="font-size:11px;color:#999;margin:4px 0;">Sem orçamentos associados.</p>'}

      ${secTitle('Notas')}
      ${notas.length > 0 ? `
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        <thead><tr style="background:#f0f4f0;">
          <th style="padding:4px 6px;text-align:left;">Data/Hora</th>
          <th style="padding:4px 6px;text-align:left;">Criado por</th>
          <th style="padding:4px 6px;text-align:left;">Nota</th>
        </tr></thead>
        <tbody>${notasRows}</tbody>
      </table>` : '<p style="font-size:11px;color:#999;margin:4px 0;">Sem notas registadas.</p>'}
    </div>`;

    const el = document.createElement('div');
    el.innerHTML = html;
    document.body.appendChild(el);

    html2pdf().set({
        margin:      10,
        filename:    `Pedido_${p.ref}.pdf`,
        image:       { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(el).save().then(() => document.body.removeChild(el));
}

/*
 * Alterna o modo de edição
 */
function toggleEditMode() {
    _isEditMode = true;
    renderPedidoDetalhe();
}

function _guardarValoresFormulario() {
    if (!_isEditMode) return null;
    const ids = [
        'f-dp-ref', 'f-dp-equipamento', 'f-dp-orgao', 'f-dp-parte',
        'f-dp-breve', 'f-dp-tipo_contacto', 'f-dp-ordem_compra',
        'f-dp-data_rececao_oc', 'f-pt-estado', 'f-clienteKey', 'f-dp-imagem',
    ];
    const vals = {};
    ids.forEach(id => { const el = document.getElementById(id); if (el) vals[id] = el.value; });
    return vals;
}

function _restaurarValoresFormulario(vals) {
    if (!vals) return;
    Object.entries(vals).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    });
}
/*
 * Guarda os detalhes de um pedido
 */
/**
 * Cria um novo orçamento pré-associado ao pedido e navega para o detalhe.
 */
function criarOrcamentoParaPedido(pedidoId) {
    _preSelectedPedidoId = pedidoId;
    _currentOrcamentoId = null;
    _isOrcamentoEditMode = false;
    showPage('orcamento_detalhe');
}

async function savePedidoDetalhe(id) {
    const isNew = !id;
    try {
        const key = document.getElementById('f-clienteKey').value;
        if (!key) throw new Error('Selecione um cliente antes de guardar.');
        const [tipo, idStr] = key.split(':');
        const clienteTipo = tipo === 'colab' ? 'colaborador' : 'particular';
        const clienteId = parseInt(idStr);
        if (!clienteId) throw new Error('Cliente inválido — recarregue a página.');

        const dpRefInput = document.getElementById('f-dp-ref').value.trim();
        const dpPayload = {
            ref:             dpRefInput || null,
            equipamento:     document.getElementById('f-dp-equipamento').value || null,
            orgao:           document.getElementById('f-dp-orgao').value || null,
            parte:           document.getElementById('f-dp-parte').value || null,
            breve_descricao: document.getElementById('f-dp-breve').value || null,
            imagem:          document.getElementById('f-dp-imagem').value || null,
            tipo_contacto:   document.getElementById('f-dp-tipo_contacto').value || null,
            ordem_compra:    document.getElementById('f-dp-ordem_compra').value || null,
            data_rececao_oc: document.getElementById('f-dp-data_rececao_oc').value || null,
        };

        let dadosPedidoId;

        if (!isNew) {
            const p = DB.pedidos.find((x) => x.id === id);
            dadosPedidoId = p?.dadosPedidoId;
            await apiPut(`/dados-pedido/${dadosPedidoId}`, dpPayload);
        } else {
            const newDp = await apiPost('/dados-pedido', dpPayload);
            dadosPedidoId = newDp.id;
        }

        if (isNew) {
            const n = DB.pedidos.length + 1;
            await apiPost('/pedidos', {
                ref:             'PT' + new Date().getFullYear().toString().slice(-2) + '-' + padNum(n, 4),
                cliente_tipo:    clienteTipo,
                colaborador_id:  clienteTipo === 'colaborador' ? clienteId : undefined,
                particular_id:   clienteTipo === 'particular'  ? clienteId : undefined,
                dados_pedido_id: dadosPedidoId,
                estado_pedido:   document.getElementById('f-pt-estado').value,
                data_pedido:     document.getElementById('f-pt-data').value || today(),
            });
        } else {
            await apiPut(`/pedidos/${id}`, {
                cliente_tipo:    clienteTipo,
                colaborador_id:  clienteTipo === 'colaborador' ? clienteId : null,
                particular_id:   clienteTipo === 'particular'  ? clienteId : null,
                dados_pedido_id: dadosPedidoId,
                estado_pedido:   document.getElementById('f-pt-estado').value,
                data_pedido:     document.getElementById('f-pt-data').value || today(),
            });
        }

        await carregarDados();
        _successToast('Pedido gravado com sucesso.');
        showPage('pedidos');
    } catch (err) {
        console.error('savePedidoDetalhe erro:', err);
        _erroToast('Erro ao guardar pedido: ' + (err.message || 'verifique o servidor'));
    }
}

/*
 * Remove a associação entre uma peça e um pedido (não apaga a peça).
 */
async function removerPecaDoPedido(pedidoId, pecaId) {
    const pp = DB.pecas_pedidos.find((x) => x.pecaId === pecaId && x.pedidoId === pedidoId);
    if (!pp) return;
    try {
        const vals = _guardarValoresFormulario();
        await fetch(`${API_BASE}/pecas-pedidos/${pp.id}`, { method: 'DELETE' });
        await carregarDados();
        _currentPedidoId = pedidoId;
        renderPedidoDetalhe();
        _restaurarValoresFormulario(vals);
        _successToast('Peça removida.');
    } catch (err) {
        console.error(err);
        _erroToast('Erro ao remover peça: ' + (err.message || 'verifique o servidor'));
    }
}

/* -------- Overlay de visualização de peça -------- */

function verPecaOverlay(pecaId) {
    const pc = DB.pecas.find((x) => x.id === pecaId);
    if (!pc) return;

    const existente = document.getElementById('ver-peca-overlay');
    if (existente) existente.remove();

    function campo(label, valor) {
        return `<div class="vpc-field">
            <span class="vpc-label">${label}</span>
            <span class="vpc-value">${valor || '—'}</span>
        </div>`;
    }

    const overlay = document.createElement('div');
    overlay.id = 'ver-peca-overlay';
    overlay.className = 'peca-search-overlay';
    overlay.innerHTML = `
        <div class="peca-search-panel" style="max-width:600px;">
            <div class="peca-search-header">
                <h3 style="margin:0;font-size:15px;font-weight:600;">Ver Peça — ${pc.ref || '—'}</h3>
                <button class="btn btn-ghost" onclick="fecharVerPecaOverlay()">✕</button>
            </div>
            <div class="peca-search-body">
                <div class="vpc-grid">
                    ${campo('Referência', pc.ref)}
                    ${campo('Plano', pc.plano)}
                    ${campo('Denominação', pc.denominacao)}
                    ${campo('Material', _resolverMaterial(pc.materiaPrimaId))}
                    ${campo('Órgão', pc.orgao)}
                    ${campo('Parte', pc.parte)}
                </div>
                <div class="vpc-section-title">Dimensões</div>
                <div class="vpc-grid">
                    ${campo('Comprimento (mm)', pc.comprimento)}
                    ${campo('Largura (mm)', pc.largura)}
                    ${campo('Altura (mm)', pc.altura)}
                    ${campo('Diâmetro Ext. (mm)', pc.diametro_ext)}
                    ${campo('Diâmetro Int. (mm)', pc.diametro_int)}
                    ${(() => { const mp = DB.materia_prima.find(m => m.id === pc.materiaPrimaId); const p = _calcPeso(pc.forma, pc.comprimento, pc.largura, pc.altura, pc.diametro_ext, pc.diametro_int, mp?.peso_esp); return campo('Peso (kg)', p ? p + ' kg' : null); })()}
                </div>
                ${pc.nota_descritiva ? `
                <div class="vpc-section-title">Nota Descritiva</div>
                <p style="font-size:13px;margin:0;">${pc.nota_descritiva}</p>` : ''}
                ${pc.imagem ? `
                <div class="vpc-section-title">Imagem</div>
                <div style="width:100%;border-radius:var(--radius-md);border:1px solid var(--color-border);display:flex;justify-content:center;background:var(--color-surface-alt);">
                    <img src="${pc.imagem}" style="max-width:100%;max-height:220px;object-fit:contain;">
                </div>` : ''}
            </div>
        </div>`;
    document.body.appendChild(overlay);
}

function fecharVerPecaOverlay() {
    const overlay = document.getElementById('ver-peca-overlay');
    if (overlay) overlay.remove();
}

function verServicoOverlay(servicoId) {
    const sv = DB.servicos.find(x => x.id === servicoId);
    if (!sv) return;

    const existente = document.getElementById('ver-servico-overlay');
    if (existente) existente.remove();

    function campo(label, valor) {
        return `<div class="vpc-field">
            <span class="vpc-label">${label}</span>
            <span class="vpc-value">${valor || '—'}</span>
        </div>`;
    }

    const overlay = document.createElement('div');
    overlay.id = 'ver-servico-overlay';
    overlay.className = 'peca-search-overlay';
    overlay.innerHTML = `
        <div class="peca-search-panel" style="max-width:480px;">
            <div class="peca-search-header">
                <h3 style="margin:0;font-size:15px;font-weight:600;">Serviço — ${sv.ref || '—'}</h3>
                <button class="btn btn-ghost" onclick="document.getElementById('ver-servico-overlay').remove()">✕</button>
            </div>
            <div class="peca-search-body">
                <div class="vpc-grid">
                    ${campo('Referência', sv.ref)}
                    ${campo('Tipo de Serviço', sv.tipo_servico)}
                    ${campo('Descrição', sv.descricao)}
                    ${campo('Unidade', sv.unidade)}
                </div>
            </div>
        </div>`;
    document.body.appendChild(overlay);
}

/* -------- Overlay de pesquisa de peças -------- */

let _pedidoIdParaAssoc = null;

function abrirPesquisaPecas(pedidoId) {
    _pedidoIdParaAssoc = pedidoId;
    const existente = document.getElementById('peca-search-overlay');
    if (existente) existente.remove();

    const overlay = document.createElement('div');
    overlay.id = 'peca-search-overlay';
    overlay.className = 'peca-search-overlay';
    overlay.innerHTML = `
        <div class="peca-search-panel">
            <div class="peca-search-header">
                <h3 style="margin:0;font-size:15px;font-weight:600;">Pesquisar Peças</h3>
                <button class="btn btn-ghost" onclick="fecharPesquisaPecas()">✕</button>
            </div>
            <div class="peca-search-body">
                <input id="peca-search-input" class="peca-search-input"
                       placeholder="Filtrar por ref., denominação ou plano…"
                       oninput="_renderPecaSearchRows()">
                <div id="peca-search-rows-container"></div>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    _renderPecaSearchRows();
    document.getElementById('peca-search-input').focus();
}

function _renderPecaSearchRows() {
    const filtro = (document.getElementById('peca-search-input')?.value || '').toLowerCase();
    const pedidoId = _pedidoIdParaAssoc;

    const disponiveis = DB.pecas.filter((pc) => {
        if (DB.pecas_pedidos.some((pp) => pp.pecaId === pc.id && pp.pedidoId === pedidoId)) return false;
        if (!filtro) return true;
        return (pc.ref || '').toLowerCase().includes(filtro) ||
               (pc.denominacao || '').toLowerCase().includes(filtro) ||
               (pc.plano || '').toLowerCase().includes(filtro);
    });

    const container = document.getElementById('peca-search-rows-container');
    if (!container) return;

    if (disponiveis.length === 0) {
        container.innerHTML = `<p style="text-align:center;color:var(--color-text-muted);padding:2rem 0;">Sem peças disponíveis.</p>`;
        return;
    }

    container.innerHTML = `
        <table class="table" style="font-size:12px;">
            <thead><tr><th>Ref.</th><th>Denominação</th><th>Plano</th><th>Origem</th><th></th></tr></thead>
            <tbody>${disponiveis.map((pc) => {
                const origem = DB.pedidos.find((x) => x.id === pc.pedidoId);
                return `<tr>
                    <td style="white-space:nowrap">${pc.ref || '-'}</td>
                    <td>${pc.denominacao || '-'}</td>
                    <td>${pc.plano || '-'}</td>
                    <td>${origem ? `<span class="badge badge-blue">${origem.ref}</span>` : '-'}</td>
                    <td><button class="btn btn-primary btn-sm" onclick="associarPecaDaOverlay(${pc.id})">Associar</button></td>
                </tr>`;
            }).join('')}</tbody>
        </table>`;
}

async function associarPecaDaOverlay(pecaId) {
    const pedidoId = _pedidoIdParaAssoc;
    if (DB.pecas_pedidos.some((pp) => pp.pecaId === pecaId && pp.pedidoId === pedidoId)) return;
    try {
        const vals = _guardarValoresFormulario();
        await apiPost('/pecas-pedidos', { peca_id: pecaId, pedido_id: pedidoId });
        await carregarDados();
        _currentPedidoId = pedidoId;
        renderPedidoDetalhe();
        _restaurarValoresFormulario(vals);
        _renderPecaSearchRows();
        _successToast('Peça associada ao pedido.');
    } catch (err) {
        console.error(err);
        _erroToast('Erro ao associar peça: ' + (err.message || 'verifique o servidor'));
    }
}

function fecharPesquisaPecas() {
    const overlay = document.getElementById('peca-search-overlay');
    if (overlay) overlay.remove();
    _pedidoIdParaAssoc = null;
}

/* -------- Notas de pedido -------- */

async function adicionarNota(pedidoId) {
    const criadoPorId = parseInt(document.getElementById('nota-criado-por').value);
    const nota = document.getElementById('nota-texto').value.trim();
    if (!criadoPorId) { alert('Selecione quem cria a nota.'); return; }
    if (!nota) { alert('Escreva o texto da nota.'); return; }
    try {
        const vals = _guardarValoresFormulario();
        await apiPost('/notas-pedido', { pedido_id: pedidoId, colaborador_dm_id: criadoPorId, nota });
        await carregarDados();
        _currentPedidoId = pedidoId;
        renderPedidoDetalhe();
        _restaurarValoresFormulario(vals);
        _successToast('Nota adicionada.');
    } catch (err) {
        console.error(err);
        _erroToast('Erro ao adicionar nota: ' + (err.message || 'verifique o servidor'));
    }
}

async function apagarNota(notaId) {
    if (!confirm('Apagar esta nota?')) return;
    try {
        const vals = _guardarValoresFormulario();
        await fetch(`${API_BASE}/notas-pedido/${notaId}`, { method: 'DELETE' });
        await carregarDados();
        renderPedidoDetalhe();
        _restaurarValoresFormulario(vals);
        _successToast('Nota apagada.');
    } catch (err) {
        console.error(err);
        _erroToast('Erro ao apagar nota: ' + (err.message || 'verifique o servidor'));
    }
}

/* -------- Historial de preços -------- */

async function guardarHistoricoPreco(pedidoId, pecaId, fornecedorIdRaw, precoRaw) {
    const hist = (DB.historico_precos || []).find(h => h.peca_id === pecaId && h.pedido_id === pedidoId) || {};
    const fornecedor_id = fornecedorIdRaw !== null
        ? (fornecedorIdRaw ? parseInt(fornecedorIdRaw) : null)
        : (hist.fornecedor_id || null);
    const preco_compra = precoRaw !== null
        ? (precoRaw !== '' ? parseFloat(precoRaw) : null)
        : (hist.preco_compra != null ? Number(hist.preco_compra) : null);
    try {
        const atualizado = await apiPost('/historico-precos', {
            peca_id: pecaId, pedido_id: pedidoId, fornecedor_id, preco_compra,
        });
        const idx = (DB.historico_precos || []).findIndex(h => h.peca_id === pecaId && h.pedido_id === pedidoId);
        if (idx !== -1) DB.historico_precos[idx] = atualizado;
        else { DB.historico_precos = DB.historico_precos || []; DB.historico_precos.push(atualizado); }
        _successToast('Preço gravado.');
    } catch (err) {
        _erroToast('Erro ao guardar preço: ' + err.message);
    }
}

async function verHistorialPrecos(pecaId) {
    const pc = DB.pecas.find(x => x.id === pecaId);
    let registos = [];
    try { registos = await apiFetch(`/historico-precos/peca/${pecaId}`); } catch (_) {}

    const existente = document.getElementById('hist-precos-overlay');
    if (existente) existente.remove();

    const rows = registos.length === 0
        ? `<tr><td colspan="4" style="text-align:center;color:var(--color-text-muted);padding:1rem;">Sem registos.</td></tr>`
        : registos.map(h => {
            const pedido = DB.pedidos.find(p => p.id === h.pedido_id);
            return `<tr>
              <td style="white-space:nowrap;">${new Date(h.data).toLocaleDateString('pt-PT')}</td>
              <td>${pedido ? pedido.ref : '—'}</td>
              <td>${h.fornecedor ? h.fornecedor.nome : 'DM'}</td>
              <td>${h.preco_compra != null ? formatEuro(h.preco_compra) : '—'}</td>
            </tr>`;
          }).join('');

    const overlay = document.createElement('div');
    overlay.id = 'hist-precos-overlay';
    overlay.className = 'peca-search-overlay';
    overlay.innerHTML = `
      <div class="peca-search-panel" style="max-width:560px;">
        <div class="peca-search-header">
          <h3 style="margin:0;font-size:15px;font-weight:600;">Historial de Preços — ${pc ? pc.ref : ''}</h3>
          <button class="btn btn-ghost" onclick="document.getElementById('hist-precos-overlay').remove()">✕</button>
        </div>
        <div class="peca-search-body">
          <table class="table" style="font-size:12px;">
            <thead><tr><th>Data</th><th>Pedido</th><th>Fornecedor</th><th>Preço Compra</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
    document.body.appendChild(overlay);
}

function _toggleRececaoOC() {
    const oc = document.getElementById('f-dp-ordem_compra');
    const dt = document.getElementById('f-dp-data_rececao_oc');
    if (!oc || !dt) return;
    const temOC = oc.value.trim() !== '';
    dt.disabled = !temOC;
    if (!temOC) dt.value = '';
}

/* -------- Serviços do Pedido -------- */

function abrirAdicionarServico(pedidoId) {
    const existente = document.getElementById('servico-add-overlay');
    if (existente) existente.remove();

    const temServicos = DB.servicos.length > 0;
    const svOpts = DB.servicos
        .map(s => `<option value="${s.id}">${s.ref} — ${s.tipo_servico}</option>`)
        .join('');

    const overlay = document.createElement('div');
    overlay.id = 'servico-add-overlay';
    overlay.className = 'peca-search-overlay';
    overlay.innerHTML = `
      <div class="peca-search-panel" style="max-width:480px;">
        <div class="peca-search-header">
          <h3 style="margin:0;font-size:15px;font-weight:600;">Adicionar Serviço</h3>
          <button class="btn btn-ghost" onclick="document.getElementById('servico-add-overlay').remove()">✕</button>
        </div>
        <div class="peca-search-body" style="display:flex;flex-direction:column;gap:16px;">

          ${temServicos ? `
          <div>
            <p style="font-size:12px;font-weight:600;margin:0 0 8px;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.05em;">Selecionar existente</p>
            <div class="form-group">
              <label class="form-label">Serviço</label>
              <select id="sv-add-id" style="width:100%;" onchange="_svToggleNovo()">
                <option value="">Selecione...</option>
                ${svOpts}
              </select>
            </div>
          </div>
          <div style="text-align:center;font-size:12px;color:var(--color-text-muted);">— ou —</div>` : ''}

          <div>
            <p style="font-size:12px;font-weight:600;margin:0 0 8px;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.05em;">Criar novo serviço</p>
            <div style="display:flex;flex-direction:column;gap:8px;" id="sv-novo-form">
              <div style="display:flex;gap:8px;">
                <div class="form-group" style="flex:1;">
                  <label class="form-label">Referência</label>
                  <input id="sv-novo-ref" placeholder="Ex: SV-001">
                </div>
                <div class="form-group" style="flex:1;">
                  <label class="form-label">Unidade</label>
                  <select id="sv-novo-unidade">
                    <option value="und">und</option>
                    <option value="H">H</option>
                    <option value="kg">kg</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Tipo de Serviço</label>
                <input id="sv-novo-tipo" placeholder="Ex: Maquinagem CNC">
              </div>
              <div class="form-group">
                <label class="form-label">Descrição</label>
                <input id="sv-novo-desc" placeholder="Descrição opcional">
              </div>
            </div>
          </div>

          <div style="border-top:1px solid var(--color-border);padding-top:12px;">
            <p style="font-size:12px;font-weight:600;margin:0 0 8px;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:.05em;">Quantidade, preço e fornecedor</p>
            <div style="display:flex;gap:8px;">
              <div class="form-group" style="flex:1;">
                <label class="form-label">Quantidade</label>
                <input id="sv-add-qty" type="number" step="0.01" min="0.01" value="1">
              </div>
              <div class="form-group" style="flex:1;">
                <label class="form-label">Preço Unit. (€)</label>
                <input id="sv-add-preco" type="number" step="0.01" min="0" value="0">
              </div>
            </div>
            <div class="form-group" style="margin-top:8px;">
              <label class="form-label">Fornecedor</label>
              <select id="sv-add-fornecedor" style="width:100%;">
                <option value="">DM</option>
                ${DB.fornecedores.map(f => `<option value="${f.id}">${f.nome}</option>`).join('')}
              </select>
            </div>
          </div>

          <div style="display:flex;justify-content:flex-end;gap:8px;">
            <button class="btn" onclick="document.getElementById('servico-add-overlay').remove()">Cancelar</button>
            <button class="btn btn-primary" onclick="confirmarAdicionarServico(${pedidoId})">Adicionar</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(overlay);
}

function _svToggleNovo() {
    const sel = document.getElementById('sv-add-id')?.value;
    const form = document.getElementById('sv-novo-form');
    if (!form) return;
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(el => el.disabled = !!sel);
    form.style.opacity = sel ? '0.4' : '1';
}

async function confirmarAdicionarServico(pedidoId) {
    const quantidade    = parseFloat(document.getElementById('sv-add-qty')?.value) || 1;
    const precoUnitario = parseFloat(document.getElementById('sv-add-preco')?.value) || 0;

    let servicoId = Number(document.getElementById('sv-add-id')?.value) || 0;

    try {
        if (!servicoId) {
            const ref  = document.getElementById('sv-novo-ref')?.value.trim();
            const tipo = document.getElementById('sv-novo-tipo')?.value.trim();
            const desc = document.getElementById('sv-novo-desc')?.value.trim();
            const unidade = document.getElementById('sv-novo-unidade')?.value || 'und';
            if (!ref || !tipo) { _erroToast('Preencha a Referência e o Tipo de Serviço.'); return; }
            const novo = await apiPost('/servicos', { ref, tipo_servico: tipo, descricao: desc || undefined, unidade });
            servicoId = novo.id;
        }

        const fornecedorId = Number(document.getElementById('sv-add-fornecedor')?.value) || null;
        await apiPost('/servicos-pedidos', {
            servico_id: servicoId,
            pedido_id: pedidoId,
            quantidade,
            preco_unitario: precoUnitario,
            fornecedor_id: fornecedorId,
        });
        document.getElementById('servico-add-overlay')?.remove();
        const vals = _guardarValoresFormulario();
        await carregarDados();
        _currentPedidoId = pedidoId;
        renderPedidoDetalhe();
        _restaurarValoresFormulario(vals);
        _successToast('Serviço adicionado.');
    } catch (err) {
        _erroToast('Erro ao adicionar serviço: ' + err.message);
    }
}

async function guardarFornecedorServico(spId, fornecedorId) {
    try {
        const vals = _guardarValoresFormulario();
        await apiPut(`/servicos-pedidos/${spId}`, {
            fornecedor_id: fornecedorId ? Number(fornecedorId) : null,
        });
        await carregarDados();
        renderPedidoDetalhe();
        _restaurarValoresFormulario(vals);
    } catch (err) {
        _erroToast('Erro ao guardar fornecedor: ' + err.message);
    }
}

async function guardarServicoPedido(spId, campo, valor) {
    try {
        const vals = _guardarValoresFormulario();
        await apiPut(`/servicos-pedidos/${spId}`, { [campo]: parseFloat(valor) });
        await carregarDados();
        renderPedidoDetalhe();
        _restaurarValoresFormulario(vals);
    } catch (err) {
        _erroToast('Erro ao guardar: ' + err.message);
    }
}

async function removerServicoDoPedido(spId) {
    try {
        const vals = _guardarValoresFormulario();
        await apiDelete(`/servicos-pedidos/${spId}`);
        await carregarDados();
        renderPedidoDetalhe();
        _restaurarValoresFormulario(vals);
        _successToast('Serviço removido.');
    } catch (err) {
        _erroToast('Erro ao remover serviço: ' + err.message);
    }
}
