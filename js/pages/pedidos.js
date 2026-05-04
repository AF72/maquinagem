/**
 * pages/pedidos.js
 * -------------------------------------------------
 * Lista de pedidos com ação para criar Ordem de Trabalho.
 * -------------------------------------------------
 */

function renderPedidos() {
  document.getElementById('page-pedidos').innerHTML = `
    <div class="section-header">
      <span class="section-count">${DB.pedidos.length} pedidos</span>
      <button class="btn btn-primary" onclick="openModal('pedido')">+ Novo pedido</button>
    </div>
    <div class="full-card">
      <table class="table">
        <thead>
          <tr>
            <th>Ref.</th><th>Cliente</th><th>Tipo</th><th>Peça</th>
            <th>Qtd.</th><th>Material</th><th>Estado</th><th>Data</th><th>Ação</th>
          </tr>
        </thead>
        <tbody>${_pedidosRows()}</tbody>
      </table>
    </div>`;
}

function _pedidosRows() {
  return DB.pedidos.map(p => {
    const cl  = resolveCliente(p.clienteTipo, p.clienteId);
    const pc  = getPeca(p.pecaId);
    const canOT = p.estado === 'Pendente';
    const label = p.clienteTipo === 'particular'
      ? cl.nome
      : `${cl.nome} <span style="font-size:11px;color:var(--color-text-muted)">(${cl.subtexto})</span>`;

    return `<tr>
      <td>${p.ref}</td>
      <td>${inlineFlex(avatarHtml(cl.nome, cl.avClass, true), label)}</td>
      <td>${tipoBadge(p.clienteTipo)}</td>
      <td>${pc.nome}</td>
      <td>${p.qtd}</td>
      <td>${pc.material}</td>
      <td>${estadoBadge(p.estado)}</td>
      <td>${p.data}</td>
      <td>${canOT ? `<button class="btn btn-sm" onclick="criarOT(${p.id})">Criar OT</button>` : '—'}</td>
    </tr>`;
  }).join('');
}

function criarOT(pedidoId) {
  const n = DB.ordens.length + 1;
  DB.ordens.push({
    id:       nextId(),
    num:      'OT-' + padNum(n, 4),
    pedidoId,
    operador: 'Operador',
    estado:   'Em curso',
    prazo:    addDays(14),
    moObra:   100,
  });
  const p = DB.pedidos.find(p => p.id === pedidoId);
  if (p) p.estado = 'Em produção';
  renderAll();
}
