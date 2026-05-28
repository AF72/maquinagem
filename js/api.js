const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api'
    : 'https://maquinagem-production.up.railway.app/api';

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

async function apiDelete(path) {
    const res = await fetch(API_BASE + path, { method: 'DELETE' });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.erro || `DELETE ${path} → ${res.status}`);
    }
    return null;
}

function mapColaborador(c) {
    return { ...c, empresaId: c.empresa_id };
}

function mapDadosPedido(dp) {
    const _clean = v => (!v || v.toUpperCase() === 'NULL') ? null : v;
    return {
        ...dp,
        ref:             _clean(dp.ref),
        breveDescricao:  dp.breve_descricao,
        data_rececao_oc: dp.data_rececao_oc?.slice(0, 10) ?? '',
    };
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
        pedidoId:           o.pedido_id,
        moObra:             Number(o.mo_obra ?? 0),
        prazo:              o.prazo ?? null,
        dataLimiteEntrega:  o.data_limite_entrega?.slice(0, 10) ?? '',
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
                id: i.id, orcamentoId: i.orcamento_id,
                itemTipo: i.item_tipo,
                pecaId:    i.peca_id,
                servicoId: i.servico_id,
                servico:   i.servico || null,
                precoUnitario: Number(i.valor_unitario), quantidade: Number(i.quantidade),
                subtotal: Number(i.valor_unitario) * Number(i.quantidade),
            })));
            return v.map(mapOrcamento);
        }},
        { key: 'materia_prima', path: '/materia-prima',  map: v => v },
        { key: 'pecas',            path: '/pecas',            map: v => v.map(p => ({ ...p, materiaPrimaId: p.materia_prima_id })) },
        { key: 'colaboradores_dm', path: '/colaboradores-dm', map: v => v },
        { key: 'fornecedores',    path: '/fornecedores',     map: v => v },
        { key: 'pecas_pedidos',    path: '/pecas-pedidos',    map: v => v.map(j => ({ ...j, pecaId: j.peca_id, pedidoId: j.pedido_id })) },
        { key: 'notas_pedido',     path: '/notas-pedido',     map: v => v.map(n => {
            const dt = new Date(n.criado_em);
            const data = dt.toLocaleDateString('pt-PT');
            const hora = dt.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
            return { ...n, pedidoId: n.pedido_id, criadoPorId: n.colaborador_dm_id, dataHora: `${data} ${hora}` };
        }) },
        { key: 'servicos',         path: '/servicos',          map: v => v },
        { key: 'processos',        path: '/processos',         map: v => v },
        { key: 'pecas_processos',  path: '/pecas-processos',   map: v => v.map(pp => ({
            ...pp,
            pecaId:     pp.peca_id,
            processoId: pp.processo_id,
            tempoEstimado:     pp.tempo_estimado      != null ? Number(pp.tempo_estimado)      : null,
            custoHoraSnapshot: pp.custo_hora_snapshot != null ? Number(pp.custo_hora_snapshot) : null,
        })) },
        { key: 'servicos_pedidos', path: '/servicos-pedidos',  map: v => v.map(s => ({
            ...s,
            servicoId:    s.servico_id,
            pedidoId:     s.pedido_id,
            fornecedorId: s.fornecedor_id,
            quantidade:   Number(s.quantidade),
            precoUnitario: Number(s.preco_unitario),
        })) },
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
        mostrarErroBanner(`Backend indisponível (${erros} endpoint(s) com falha). Verifica a ligação ao servidor.`);
    } else {
        esconderErroBanner();
    }
}

function mostrarErroBanner(msg) {
    let el = document.getElementById('backend-erro-banner');
    if (!el) {
        el = document.createElement('div');
        el.id = 'backend-erro-banner';
        el.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#c0392b;color:#fff;padding:10px 16px;font-size:14px;text-align:center;';
        document.body.prepend(el);
    }
    el.textContent = msg;
    el.style.display = 'block';
}

function esconderErroBanner() {
    const el = document.getElementById('backend-erro-banner');
    if (el) el.style.display = 'none';
}
