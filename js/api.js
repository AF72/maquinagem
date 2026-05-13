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

async function apiPatch(path, body) {
    const res = await fetch(API_BASE + path, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.erro || `PATCH ${path} → ${res.status}`);
    }
    if (res.status === 204) return null;
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
        prazo:    o.prazo?.slice(0, 10) ?? '',
    };
}

function mapOrcamento(o) {
    return {
        ...o,
        pedidoId:     o.pedido_id,
        dataEmissao:  o.data_emissao?.slice(0, 10)  ?? '',
        dataValidade: o.data_validade?.slice(0, 10) ?? '',
        valor:        Number(o.total_liquido ?? 0),
    };
}

async function carregarDados() {
    const endpoints = [
        { key: 'empresas',      path: '/empresas',      map: v => v },
        { key: 'colaboradores', path: '/colaboradores',  map: v => v.map(mapColaborador) },
        { key: 'particulares',  path: '/particulares',   map: v => v },
        { key: 'dados_pedido',  path: '/dados-pedido',   map: v => v.map(mapDadosPedido) },
        { key: 'pedidos',       path: '/pedidos',        map: v => v.map(mapPedido) },
        { key: 'ordens',        path: '/ordens',         map: v => v.map(mapOrdem) },
        { key: 'orcamentos', path: '/orcamentos', map: v => {
            DB.orcamento_itens = v.flatMap(o => (o.itens || []).map(i => ({
                id: i.id, orcamentoId: i.orcamento_id, pecaId: i.peca_id,
                precoUnitario: Number(i.valor_unitario), quantidade: Number(i.quantidade),
                subtotal: Number(i.subtotal ?? 0),
            })));
            return v.map(mapOrcamento);
        }},
        { key: 'materia_prima', path: '/materia-prima',  map: v => v },
        { key: 'pecas',            path: '/pecas',            map: v => v },
        { key: 'colaboradores_dm', path: '/colaboradores-dm', map: v => v },
        { key: 'pecas_pedidos',    path: '/pecas-pedidos',    map: v => v.map(j => ({ ...j, pecaId: j.peca_id, pedidoId: j.pedido_id })) },
    ];

    const resultados = await Promise.allSettled(
        endpoints.map(e => apiFetch(e.path))
    );

    let erros = 0;
    resultados.forEach((r, i) => {
        if (r.status === 'fulfilled') {
            DB[endpoints[i].key] = endpoints[i].map(r.value);
        } else {
            erros++;
            console.warn(`Endpoint ${endpoints[i].path} falhou:`, r.reason?.message);
        }
    });

    if (erros > 0) {
        console.warn(`${erros} endpoint(s) indisponível(-eis). Reinicia o backend.`);
    }
}
