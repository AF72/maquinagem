/**
 * pages/clientes.js
 * --------------------------------------------------------------------------------
 * Adaptador React: monta/atualiza ClientesPage (js/react/ClientesPage.jsx).
 * A lógica de renderização vive no componente React; este ficheiro apenas
 * faz a ponte entre o sistema de routing vanilla (renderAll/showPage) e o React.
 * --------------------------------------------------------------------------------
 */

let _clientesRoot = null;

function renderClientes() {
    const el = document.getElementById('page-clientes');
    if (!_clientesRoot) {
        _clientesRoot = ReactDOM.createRoot(el);
    }
    _clientesRoot.render(
        React.createElement(window.ClientesPage, {
            empresas:      DB.empresas,
            colaboradores: DB.colaboradores,
            particulares:  DB.particulares,
            pedidos:       DB.pedidos,
            expanded:      DB.expanded,
            filter:        DB.clienteFilter,
        })
    );
}

function toggleEmpresa(empId) {
    DB.expanded['e' + empId] = !DB.expanded['e' + empId];
    renderClientes();
}

function setClienteFilter(f) {
    DB.clienteFilter = f;
    renderClientes();
}
