import { create } from 'zustand';
import {
  apiFetch,
  mapColaborador,
  mapDadosPedido,
  mapPedido,
  mapOrdem,
  mapOrcamento,
} from '../lib/api';

const useStore = create((set) => ({
  // --- Coleções de dados (espelho do DB global original) ---
  empresas:                    [],
  colaboradores:               [],
  particulares:                [],
  dados_pedido:                [],
  pedidos:                     [],
  ordens:                      [],
  orcamentos:                  [],
  orcamento_itens:             [],
  pecas:                       [],
  pecas_pedidos:               [],
  notas_pedido:                [],
  colaboradores_dm:            [],
  materia_prima:               [],
  fornecedores:                [],
  historico_precos:            [],
  servicos:                    [],
  servicos_pedidos:            [],
  processos:                   [],
  pecas_processos:             [],
  historico_precos_mp:         [],
  historico_precos_processos:  [],

  // --- Estado de UI ---
  expanded:      {},
  clienteFilter: 'todos',

  // --- Estado de carregamento ---
  carregando:   false,
  backendErro:  null,

  // --- Actions ---
  setClienteFilter: (f) => set({ clienteFilter: f }),

  toggleExpanded: (id) => set(s => ({
    expanded: { ...s.expanded, [id]: !s.expanded[id] },
  })),

  carregarDados: async () => {
    set({ carregando: true, backendErro: null });

    const endpoints = [
      { key: 'empresas',     path: '/empresas',     map: v => v },
      { key: 'colaboradores', path: '/colaboradores', map: v => v.map(mapColaborador) },
      { key: 'particulares', path: '/particulares',  map: v => v },
      { key: 'dados_pedido', path: '/dados-pedido',  map: v => v.map(mapDadosPedido) },
      { key: 'pedidos',      path: '/pedidos',       map: v => v.map(mapPedido) },
      { key: 'ordens',       path: '/ordens',        map: v => v.map(mapOrdem) },
      {
        key: 'orcamentos', path: '/orcamentos',
        map: (v, updates) => {
          updates.orcamento_itens = v.flatMap(o =>
            (o.itens || []).map(i => ({
              id:            i.id,
              orcamentoId:   i.orcamento_id,
              itemTipo:      i.item_tipo,
              pecaId:        i.peca_id,
              servicoId:     i.servico_id,
              servico:       i.servico || null,
              precoUnitario: Number(i.valor_unitario),
              quantidade:    Number(i.quantidade),
              subtotal:      Number(i.valor_unitario) * Number(i.quantidade),
            }))
          );
          return v.map(mapOrcamento);
        },
      },
      { key: 'materia_prima', path: '/materia-prima', map: v => v },
      {
        key: 'pecas', path: '/pecas',
        map: v => v.map(p => ({
          ...p,
          materiaPrimaId:  p.materia_prima_id,
          precoMpSnapshot: p.preco_mp_snapshot != null ? Number(p.preco_mp_snapshot) : null,
        })),
      },
      { key: 'colaboradores_dm', path: '/colaboradores-dm', map: v => v },
      { key: 'fornecedores',     path: '/fornecedores',     map: v => v },
      {
        key: 'pecas_pedidos', path: '/pecas-pedidos',
        map: v => v.map(j => ({ ...j, pecaId: j.peca_id, pedidoId: j.pedido_id })),
      },
      {
        key: 'notas_pedido', path: '/notas-pedido',
        map: v => v.map(n => {
          const dt   = new Date(n.criado_em);
          const data = dt.toLocaleDateString('pt-PT');
          const hora = dt.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
          return { ...n, pedidoId: n.pedido_id, criadoPorId: n.colaborador_dm_id, dataHora: `${data} ${hora}` };
        }),
      },
      { key: 'servicos',  path: '/servicos',  map: v => v },
      { key: 'processos', path: '/processos', map: v => v },
      {
        key: 'pecas_processos', path: '/pecas-processos',
        map: v => v.map(pp => ({
          ...pp,
          pecaId:            pp.peca_id,
          processoId:        pp.processo_id,
          tempoEstimado:     pp.tempo_estimado      != null ? Number(pp.tempo_estimado)      : null,
          custoHoraSnapshot: pp.custo_hora_snapshot != null ? Number(pp.custo_hora_snapshot) : null,
        })),
      },
      {
        key: 'historico_precos_mp', path: '/historico-precos-mp',
        map: v => v.map(h => ({
          ...h,
          materiaPrimaId: h.materia_prima_id,
          precoKg:        Number(h.preco_kg),
          data:           h.data?.slice(0, 10) ?? '',
        })),
      },
      {
        key: 'historico_precos_processos', path: '/historico-precos-processos',
        map: v => v.map(h => ({
          ...h,
          processoId: h.processo_id,
          custoHora:  Number(h.custo_hora),
          data:       h.data?.slice(0, 10) ?? '',
        })),
      },
      {
        key: 'servicos_pedidos', path: '/servicos-pedidos',
        map: v => v.map(s => ({
          ...s,
          servicoId:     s.servico_id,
          pedidoId:      s.pedido_id,
          fornecedorId:  s.fornecedor_id,
          quantidade:    Number(s.quantidade),
          precoUnitario: Number(s.preco_unitario),
        })),
      },
    ];

    const results = await Promise.allSettled(
      endpoints.map(e => apiFetch(e.path))
    );

    const updates = {};
    let erros = 0;

    results.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        updates[endpoints[i].key] = endpoints[i].map(r.value, updates);
      } else {
        if (!r.reason?.message?.includes('Sessão expirada')) {
          erros++;
          console.warn(`Endpoint ${endpoints[i].path} falhou:`, r.reason?.message);
        }
      }
    });

    set({
      ...updates,
      carregando:  false,
      backendErro: erros > 0
        ? `Backend indisponível (${erros} endpoint(s) com falha). Verifica a ligação ao servidor.`
        : null,
    });
  },
}));

export default useStore;
