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
    dados_pedido: 'Dados do Pedido',
    custos: 'Custos',
    pedido_detalhe: 'Detalhe do Pedido',
};

const PAGE_LOGOS = {
    dashboard: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="1" width="6" height="6" rx="1" fill="orange"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1" fill="orange"/>&gt;</svg>`,
    clientes: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="5" r="3" /><path d="M1 14c0-2.8 2.2-5 5-5" /><circle cx="12" cy="10" r="3.5" /><path d="M12 8.5v3M10.5 10h3" /></svg>`,
    pedidos: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 2h10l1 3H2L3 2z" /><rect x="1" y="5" width="14" height="9" rx="1" /><path d="M6 9h4M6 12h2" /></svg>`,
    ordens: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="1" width="14" height="14" rx="1.5" /><path d="M4 5h8M4 8h8M4 11h5" /></svg>`,
    dados_pedido: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="8,1 15,5 15,11 8,15 1,11 1,5" /><circle cx="8" cy="8" r="2.5" /></svg>`,
    custos: `<svg class="nav-icon" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 463 463" xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 463 463"><path d="M395.195,67.805C351.471,24.08,293.336,0,231.5,0S111.529,24.08,67.805,67.805S0,169.664,0,231.5   s24.08,119.971,67.805,163.695S169.664,463,231.5,463s119.971-24.08,163.695-67.805S463,293.336,463,231.5   S438.92,111.529,395.195,67.805z M384.589,384.589C343.697,425.48,289.329,448,231.5,448s-112.197-22.52-153.089-63.411   S15,289.329,15,231.5S37.52,119.303,78.411,78.411S173.671,15,231.5,15s112.197,22.52,153.089,63.411S448,173.671,448,231.5   S425.48,343.697,384.589,384.589z"/>
    <path d="m340.393,315.771c-3.14-2.699-7.875-2.346-10.577,0.794-23.749,27.604-57.917,43.435-93.745,43.435-61.154,0-112.19-45.329-122.968-105h190.397c4.143,0 7.5-3.357 7.5-7.5s-3.357-7.5-7.5-7.5h-192.219c-0.18-2.811-0.281-5.643-0.281-8.5s0.101-5.689 0.281-8.5h192.219c4.143,0 7.5-3.357 7.5-7.5s-3.357-7.5-7.5-7.5h-190.397c10.778-59.671 61.814-105 122.968-105 35.825,0 69.992,15.829 93.74,43.43 2.702,3.14 7.438,3.494 10.577,0.794 3.14-2.702 3.495-7.438 0.794-10.577-26.6-30.917-64.911-48.647-105.111-48.647-69.424,0-127.203,52.015-138.183,120h-10.388c-4.143,0-7.5,3.357-7.5,7.5s3.357,7.5 7.5,7.5h8.753c-0.161,2.813-0.253,5.646-0.253,8.5s0.091,5.687 0.253,8.5h-8.753c-4.143,0-7.5,3.357-7.5,7.5s3.357,7.5 7.5,7.5h10.389c10.979,67.985 68.759,120 138.183,120 40.201,0 78.515-17.732 105.115-48.651 2.701-3.141 2.345-7.876-0.794-10.578z"/></svg>`,
};

const PAGE_RENDERERS = {
    dashboard: renderDashboard,
    clientes: renderClientes,
    pedidos: renderPedidos,
    ordens: renderOrdens,
    dados_pedido: renderDadosPedido,
    custos: renderCustos,
    pedido_detalhe: renderPedidoDetalhe,
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
