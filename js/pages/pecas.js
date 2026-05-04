/**
 * pages/pecas.js
 * -------------------------------------------------
 * Catálogo de peças com as suas características
 * e custo unitário de produção.
 * -------------------------------------------------
 */

function renderPecas() {
  document.getElementById('page-pecas').innerHTML = `
    <div class="section-header">
      <span class="section-count">${DB.pecas.length} peças no catálogo</span>
      <button class="btn btn-primary" onclick="openModal('peca')">+ Nova peça</button>
    </div>
    <div class="full-card">
      <table class="table">
        <thead>
          <tr>
            <th>Referência</th><th>Designação</th><th>Material</th>
            <th>Espessura</th><th>Peso (kg)</th><th>Acabamento</th><th>Custo unit. (€)</th>
          </tr>
        </thead>
        <tbody>${_pecasRows()}</tbody>
      </table>
    </div>`;
}

function _pecasRows() {
  if (!DB.pecas.length) {
    return `<tr><td colspan="7" style="text-align:center;color:var(--color-text-muted);padding:2rem">
      Nenhuma peça registada.</td></tr>`;
  }
  const matColors = {
    'Aço':      'badge-blue',
    'Alumínio': 'badge-teal',
    'Cobre':    'badge-amber',
    'Polímero': 'badge-coral',
    'Inox':     'badge-gray',
  };
  return DB.pecas.map(p => `
    <tr>
      <td><code style="font-size:12px;color:var(--color-text-muted)">${p.ref}</code></td>
      <td><strong>${p.nome}</strong></td>
      <td><span class="badge ${matColors[p.material] || 'badge-gray'}">${p.material}</span></td>
      <td>${p.esp}</td>
      <td>${p.peso}</td>
      <td>${p.acabamento}</td>
      <td><strong>${p.custo.toFixed(2)} €</strong></td>
    </tr>`).join('');
}
