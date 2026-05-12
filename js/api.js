const API_BASE = 'http://localhost:3000/api';

async function apiFetch(path) {
    const res = await fetch(API_BASE + path);
    if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
    return res.json();
}

async function apiPost(path, body) {
    const res = await fetch(API_BASE + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.erro || `POST ${path} → ${res.status}`);
    }
    return res.json();
}

async function apiPut(path, body) {
    const res = await fetch(API_BASE + path, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.erro || `PUT ${path} → ${res.status}`);
    }
    return res.json();
}

function mapColaborador(c) {
    return { ...c, empresaId: c.empresa_id };
}

function mapDadosPedido(dp) {
    return { ...dp, breveDescricao: dp.breve_descricao };
}

function mapPedido(p) {
    return {
        ...p,
        clienteTipo:   p.cliente_tipo,
        clienteId:     p.colaborador_id ?? p.particular_id,
        dadosPedidoId: p.dados_pedido_id,
        data:          p.data_pedido?.slice(0, 10) ?? '',
    };
}

function mapOrdem(o) {
    return {
        ...o,
        pedidoId: o.pedido_id,
        moObra:   Number(o.mo_obra ?? 0),
    };
}

function mapOrcamento(o) {
    return { ...o, pedidoId: o.pedido_id };
}

async function carregarDados() {
    try {
        const [empresas, colaboradores, particulares, dadosPedido, pedidos, ordens, orcamentos, materiaPrima, pecas] =
            await Promise.all([
                apiFetch('/empresas'),
                apiFetch('/colaboradores'),
                apiFetch('/particulares'),
                apiFetch('/dados-pedido'),
                apiFetch('/pedidos'),
                apiFetch('/ordens'),
                apiFetch('/orcamentos'),
                apiFetch('/materia-prima'),
                apiFetch('/pecas'),
            ]);

        DB.empresas      = empresas;
        DB.colaboradores = colaboradores.map(mapColaborador);
        DB.particulares  = particulares;
        DB.dados_pedido  = dadosPedido.map(mapDadosPedido);
        DB.ordens        = ordens.map(mapOrdem);
        DB.orcamentos    = orcamentos.map(mapOrcamento);
        DB.pedidos       = pedidos.map(mapPedido);
        DB.materia_prima = materiaPrima;
        DB.pecas         = pecas;

    } catch (err) {
        console.warn('Backend indisponível — a usar dados locais.', err.message);
    }
}
