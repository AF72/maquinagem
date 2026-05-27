/**
 * helpers.js
 * -------------------------------------------------
 * Funções utilitárias partilhadas por todos os módulos.
 * -------------------------------------------------
 */

/* ---------- Lookups ---------- */

function getEmpresa(id) {
    return DB.empresas.find((e) => e.id === id) || { nome: '—', nif: '—' };
}
function getColab(id) {
    return (
        DB.colaboradores.find((c) => c.id === id) || {
            nome: '—',
            cargo: '—',
            empresaId: null,
        }
    );
}
function getParticular(id) {
    return DB.particulares.find((p) => p.id === id) || { nome: '—', cc: '—' };
}
function getDadosPedido(id) {
    return (
        DB.dados_pedido.find((p) => p.id === id) || {
            ref: '—',
            equipamento: '—',
            orgao: '—',
            parte: '—',
            breveDescricao: '—',
            imagem: '',
        }
    );
}
function getPedido(id) {
    return (
        DB.pedidos.find((p) => p.id === id) || {
            ref: '—',
            dadosPedidoId: 0,
            clienteTipo: '',
            clienteId: 0,
        }
    );
}

/**
 * Resolve cliente a partir de tipo e id.
 * Devolve { nome, subtexto, avClass }
 */
function resolveCliente(tipo, id) {
    if (tipo === 'particular') {
        const p = getParticular(id);
        return {
            nome: p.nome,
            subtexto: 'Particular',
            avClass: 'av-particular',
        };
    }
    const c = getColab(id);
    const emp = getEmpresa(c.empresaId);
    return { nome: c.nome, subtexto: emp.nome, avClass: 'av-colab' };
}

/* ---------- IDs ---------- */

function nextId() {
    return Date.now();
}
function padNum(n, l) {
    return String(n).padStart(l, '0');
}

/* ---------- Initials ---------- */

function initials(name) {
    return (name || '—')
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();
}

/* ---------- HTML helpers ---------- */

function estadoBadge(estado) {
    const map = {
        'Produção':   'badge-blue',
        'Pendente':   'badge-amber',
        'Orçamentar': 'badge-gray',
        'Faturar':    'badge-red',
        'Concluido':  'badge-green',
        'Cancelado':  'badge-black',
        'Em curso':   'badge-blue',
        'Falta OC':   'badge-orange',
        'Concluída':  'badge-green',
    };
    return `<span class="badge ${map[estado] || 'badge-gray'}">${estado}</span>`;
}

function tipoBadge(tipo) {
    return tipo === 'particular'
        ? `<span class="badge badge-coral">Particular</span>`
        : `<span class="badge badge-teal">Empresa</span>`;
}

function avatarHtml(name, cls, small = false) {
    return `<span class="avatar ${cls}${small ? ' av-sm' : ''}">${initials(name)}</span>`;
}

function inlineFlex(avatarHtml, label) {
    return `<span class="inline-flex">${avatarHtml}${label}</span>`;
}

/* ---------- Date ---------- */

function formatEuro(value) {
    return Number(value ?? 0).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

function addDays(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}
