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
    clientes: 'Clientes',
    pedidos: 'Pedidos',
    ordens: 'Ordens de Trabalho',
    pecas: 'Peças',
    custos: 'Custos',
};

const PAGE_LOGOS = {
    dashboard: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
  <rect x="1" y="1" width="6" height="6" rx="1" fill="orange"/>
  <rect x="9" y="1" width="6" height="6" rx="1"/>
  <rect x="1" y="9" width="6" height="6" rx="1"/>
  <rect x="9" y="9" width="6" height="6" rx="1" fill="orange"/>
  &gt;
</svg>`,
    clientes: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="5" r="3" /><path d="M1 14c0-2.8 2.2-5 5-5" /><circle cx="12" cy="10" r="3.5" /><path d="M12 8.5v3M10.5 10h3" /></svg>`,
    pedidos: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 2h10l1 3H2L3 2z" /><rect x="1" y="5" width="14" height="9" rx="1" /><path d="M6 9h4M6 12h2" /></svg>`,
    ordens: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="1" width="14" height="14" rx="1.5" /><path d="M4 5h8M4 8h8M4 11h5" /></svg>`,
    pecas: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="8,1 15,5 15,11 8,15 1,11 1,5" /><circle cx="8" cy="8" r="2.5" /></svg>`,
    custos: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="7" /><path d="M8 4v1.5M8 10.5V12M5.5 6.5C5.5 5.7 6.6 5 8 5s2.5.7 2.5 1.5S9.4 8 8 8s-2.5.7-2.5 1.5S6.6 11 8 11s2.5-.7 2.5-1.5" /></svg>`,
};

const PAGE_RENDERERS = {
    dashboard: renderDashboard,
    clientes: renderClientes,
    pedidos: renderPedidos,
    ordens: renderOrdens,
    pecas: renderPecas,
    custos: renderCustos,
};

let _currentPage = 'dashboard';

/* ---------- Router ---------- */

function showPage(page) {
    if (!PAGE_RENDERERS[page]) return;
    _currentPage = page;

    /* Páginas visíveis */
    document
        .querySelectorAll('.page')
        .forEach((el) => el.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');

    /* Nav highlight */
    document.querySelectorAll('.nav-item').forEach((el) => {
        el.classList.toggle('active', el.dataset.page === page);
    });

    /* Página e logo */
    document.getElementById('page-title').textContent =
        PAGE_TITLES[page] || page;
    const pageLogo = document.getElementById('page-logo');
    if (pageLogo) {
        pageLogo.innerHTML = PAGE_LOGOS[page] || '';
        pageLogo.setAttribute('aria-label', PAGE_TITLES[page] || page);
    }

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

document.querySelectorAll('.nav-item[data-page]').forEach((el) => {
    el.addEventListener('click', () => showPage(el.dataset.page));
});

/* ---------- Init ---------- */

showPage('dashboard');
