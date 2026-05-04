/**
 * app.js
 * -------------------------------------------------
 * Ponto de entrada da aplicação:
 * - Router de páginas (sidebar nav)
 * - renderAll() — atualiza todos os módulos ativos
 * - Inicialização
 * -------------------------------------------------
 */

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  clientes:  'Clientes',
  pedidos:   'Pedidos',
  ordens:    'Ordens de Trabalho',
  pecas:     'Peças',
  custos:    'Custos',
};

const PAGE_RENDERERS = {
  dashboard: renderDashboard,
  clientes:  renderClientes,
  pedidos:   renderPedidos,
  ordens:    renderOrdens,
  pecas:     renderPecas,
  custos:    renderCustos,
};

let _currentPage = 'dashboard';

/* ---------- Router ---------- */

function showPage(page) {
  if (!PAGE_RENDERERS[page]) return;
  _currentPage = page;

  /* Páginas visíveis */
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');

  /* Nav highlight */
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  /* Título */
  document.getElementById('page-title').textContent = PAGE_TITLES[page] || page;

  /* Renderiza o conteúdo da página */
  PAGE_RENDERERS[page]();
}

/* ---------- renderAll ---------- */

/**
 * Atualiza apenas a página atual (evita re-renderizar tudo).
 * Chamado após mutações ao DB (save, criarOT, concluirOT…).
 */
function renderAll() {
  if (PAGE_RENDERERS[_currentPage]) {
    PAGE_RENDERERS[_currentPage]();
  }
}

/* ---------- Sidebar listeners ---------- */

document.querySelectorAll('.nav-item[data-page]').forEach(el => {
  el.addEventListener('click', () => showPage(el.dataset.page));
});

/* ---------- Init ---------- */

showPage('dashboard');
