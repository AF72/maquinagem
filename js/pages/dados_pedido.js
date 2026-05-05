/**
 * pages/pecas.js
 * -------------------------------------------------
 * Catálogo de peças com as suas características
 * e custo unitário de produção.
 * -------------------------------------------------
 */

function renderDadosPedido() {
  document.getElementById('page-dados_pedido').innerHTML = `
    <div class="section-header">
      <span class="section-count">${DB.dados_pedido.length} registos de dados</span>
      <button class="btn btn-primary" onclick="openModal('dados_pedido')">+ Novos dados</button>
    </div>
    <div class="full-card">
      <table class="table">
        <thead>
          <tr>
            <th>Ref.</th><th>Equipamento</th><th>Órgão</th><th>Parte</th>
            <th>Breve Descrição</th><th>Imagem</th>
          </tr>
        </thead>
        <tbody>${_dadosPedidoRows()}</tbody>
      </table>
    </div>`;
}

function _dadosPedidoRows() {
  if (!DB.dados_pedido.length) {
    return `<tr><td colspan="6" style="text-align:center;color:var(--color-text-muted);padding:2rem">
      Nenhum dado de pedido registado.</td></tr>`;
  }
  return DB.dados_pedido.map(p => `
    <tr>
      <td><strong>${p.ref}</strong></td>
      <td>${p.equipamento || '—'}</td>
      <td>${p.orgao || '—'}</td>
      <td>${p.parte || '—'}</td>
      <td>${p.breveDescricao || '—'}</td>
      <td>${p.imagem ? `<span class="badge badge-blue">Ver Imagem</span>` : '—'}</td>
    </tr>`).join('');
}
