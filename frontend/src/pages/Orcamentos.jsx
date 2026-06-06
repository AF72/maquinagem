import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import useStore from '../store';
import { apiPost, apiPut } from '../lib/api';
import { toast } from '../lib/toast';
import { formatEuro, today, addDays, padNum, resolveCliente } from '../lib/helpers';
import { calcPeso, calcCustoEstimado } from '../lib/pecaUtils';
import { EstadoBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';

const PER_PAGE = 15;

const IconEdit = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <g transform="matrix(1.05 0 0 1.05 12 12)">
      <path style={{ fill: 'currentColor' }} transform="translate(-12.5,-11.5)"
        d="M19.171875 2C18.448125 2 17.724375 2.275625 17.171875 2.828125L16 4L20 8L21.171875 6.828125C22.275875 5.724125 22.275875 3.933125 21.171875 2.828125C20.619375 2.275625 19.895625 2 19.171875 2zM14.5 5.5L5 15C5 15 6.005 15.005 6.5 15.5C6.995 15.995 6.984375 16.984375 6.984375 16.984375C6.984375 16.984375 8.004 17.004 8.5 17.5C8.996 17.996 9 19 9 19L18.5 9.5L14.5 5.5zM3.6699219 17L3.0136719 20.503906C2.9606719 20.789906 3.2100938 21.039328 3.4960938 20.986328L7 20.330078L3.6699219 17z"
      />
    </g>
  </svg>
);

/* ---------- Lista ---------- */
function OrcamentosList() {
  const orcamentos = useStore(s => s.orcamentos);
  const pedidos    = useStore(s => s.pedidos);
  const navigate   = useNavigate();
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(orcamentos.length / PER_PAGE));
  const p = Math.min(page, totalPages);
  const paginados = orcamentos.slice((p - 1) * PER_PAGE, p * PER_PAGE);

  function Paginacao() {
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (totalPages <= 7 || i === 1 || i === totalPages || Math.abs(i - p) <= 1) {
        pages.push(<button key={i} className={`btn ${i === p ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setPage(i)}>{i}</button>);
      } else if ((i === 2 && p > 4) || (i === totalPages - 1 && p < totalPages - 3)) {
        pages.push(<span key={i} style={{ padding: '0 4px', color: 'var(--color-text-muted)' }}>…</span>);
      }
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button className="btn btn-ghost btn-sm" disabled={p === 1} onClick={() => setPage(p - 1)}>‹</button>
        {pages}
        <button className="btn btn-ghost btn-sm" disabled={p === totalPages} onClick={() => setPage(p + 1)}>›</button>
      </div>
    );
  }

  return (
    <>
      <div className="section-header">
        <span className="section-count">{orcamentos.length} orçamentos</span>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}><Paginacao /></div>
        <button className="btn btn-primary" onClick={() => navigate('/orcamentos/novo')}>+ Novo Orçamento</button>
      </div>
      <div className="full-card">
        <table className="table">
          <thead>
            <tr>
              <th>Ref. Orçamento</th><th>Pedido</th><th>Cliente</th>
              <th>Custo Líquido (€)</th><th>Data Emissão</th><th>Validade</th>
              <th>Estado</th><th>Ativo</th><th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {paginados.map(orc => {
              const pedido = pedidos.find(p => p.id === orc.pedidoId);
              if (!pedido) return null;
              const cl = resolveCliente(pedido.clienteTipo, pedido.clienteId);
              const estadoBg = orc.estado === 'Aprovado' ? 'badge-green' : orc.estado === 'Rejeitado' ? 'badge-red' : 'badge-orange';
              const label = pedido.clienteTipo === 'particular'
                ? <div style={{ lineHeight: 1.2 }}><div>{cl.nome}</div><div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Particular</div></div>
                : <div style={{ lineHeight: 1.2 }}><div>{cl.subtexto}</div><div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{cl.nome}</div></div>;

              return (
                <tr key={orc.id}>
                  <td><strong>{orc.ref || '-'}</strong></td>
                  <td><Link to={`/pedidos/${pedido.id}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>{pedido.ref}</Link></td>
                  <td><span className="inline-flex"><Avatar name={cl.nome} cls={cl.avClass} small />{label}</span></td>
                  <td><strong>{formatEuro(orc.valor || 0)}</strong></td>
                  <td>{orc.dataEmissao || '—'}</td>
                  <td>{orc.dataValidade || '—'}</td>
                  <td><span className={`badge ${estadoBg}`}>{orc.estado}</span></td>
                  <td>{orc.ativo ? <span className="badge badge-blue">Ativo</span> : <span className="badge badge-gray">Inativo</span>}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/orcamentos/${orc.id}`)}>
                      <IconEdit />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ---------- Detalhe ---------- */
function OrcamentosDetalhe({ orcId: rawId }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const fromPedidoId = location.state?.fromPedidoId ?? null;

  const orcamentos      = useStore(s => s.orcamentos);
  const orcamento_itens = useStore(s => s.orcamento_itens);
  const pedidos         = useStore(s => s.pedidos);
  const pecas           = useStore(s => s.pecas);
  const pecas_pedidos   = useStore(s => s.pecas_pedidos);
  const servicos        = useStore(s => s.servicos);
  const servicos_pedidos = useStore(s => s.servicos_pedidos);
  const processos       = useStore(s => s.processos);
  const pecas_processos  = useStore(s => s.pecas_processos);
  const materia_prima    = useStore(s => s.materia_prima);

  const isNew = !rawId;
  const orcId = isNew ? null : Number(rawId);
  const orc   = isNew ? null : orcamentos.find(x => x.id === orcId);

  const anoAtual = new Date().getFullYear().toString().slice(-2);
  const refAuto  = `ORC${anoAtual}-${padNum(orcamentos.length + 1, 4)}`;

  const [editMode, setEditMode] = useState(isNew);
  const [pedidoIdSel, setPedidoIdSel] = useState(orc?.pedidoId || fromPedidoId || null);
  const [estado, setEstado]   = useState(orc?.estado || 'Pendente');
  const [ativo, setAtivo]     = useState(orc?.ativo ?? true);
  const [emissao, setEmissao] = useState(orc?.dataEmissao || today());
  const [validade, setValidade] = useState(orc?.dataValidade || addDays(30));
  const [validadeDias, setValidadeDias] = useState(30);
  const [descricao, setDescricao] = useState(orc?.observacoes || '');
  const [notas, setNotas]     = useState(orc?.notas || '');
  const [saving, setSaving]   = useState(false);

  // Itens: [{pecaId, quantidade, precoUnitario}] e serviços: [{servicoId, quantidade, precoUnitario}]
  const [pecaItems, setPecaItems] = useState(() => {
    if (!isNew && orcId) {
      return orcamento_itens.filter(i => i.orcamentoId === orcId && i.itemTipo !== 'servico').map(i => ({ pecaId: i.pecaId, quantidade: i.quantidade, precoUnitario: i.precoUnitario }));
    }
    // novo: pré-popular com peças do pedido (qtd 1, preço 0)
    if (fromPedidoId) {
      const ids = new Set(pecas_pedidos.filter(pp => pp.pedidoId === fromPedidoId).map(pp => pp.pecaId));
      return [...ids].map(pecaId => ({ pecaId, quantidade: 1, precoUnitario: 0 }));
    }
    return [];
  });
  const [svItems, setSvItems] = useState(() => {
    if (!isNew && orcId) {
      return orcamento_itens.filter(i => i.orcamentoId === orcId && i.itemTipo === 'servico').map(i => ({ servicoId: i.servicoId, quantidade: i.quantidade, precoUnitario: i.precoUnitario }));
    }
    if (fromPedidoId) {
      return servicos_pedidos.filter(sp => sp.pedidoId === fromPedidoId).map(sp => ({ servicoId: sp.servicoId, quantidade: sp.quantidade, precoUnitario: sp.precoUnitario }));
    }
    return [];
  });

  // Quando muda o pedido, actualizar as listas de peças e serviços
  function onPedidoChange(newPedidoId) {
    setPedidoIdSel(newPedidoId);
    if (!newPedidoId) { setPecaItems([]); setSvItems([]); return; }
    const ids = new Set(pecas_pedidos.filter(pp => pp.pedidoId === newPedidoId).map(pp => pp.pecaId));
    const existing = isNew ? [] : orcamento_itens.filter(i => i.orcamentoId === orcId && i.itemTipo !== 'servico');
    setPecaItems([...ids].map(pecaId => {
      const ex = existing.find(i => i.pecaId === pecaId);
      return { pecaId, quantidade: ex?.quantidade ?? 1, precoUnitario: ex?.precoUnitario ?? 0 };
    }));
    const spList = servicos_pedidos.filter(sp => sp.pedidoId === newPedidoId);
    const existingSv = isNew ? [] : orcamento_itens.filter(i => i.orcamentoId === orcId && i.itemTipo === 'servico');
    setSvItems(spList.map(sp => {
      const ex = existingSv.find(i => i.servicoId === sp.servicoId);
      return { servicoId: sp.servicoId, quantidade: ex?.quantidade ?? sp.quantidade, precoUnitario: ex?.precoUnitario ?? sp.precoUnitario };
    }));
  }

  function calcValidade(dias, baseEmissao) {
    const d = dias ?? validadeDias;
    const base = new Date(baseEmissao ?? emissao);
    base.setDate(base.getDate() + d);
    setValidade(base.toISOString().slice(0, 10));
    if (dias != null) setValidadeDias(dias);
  }

  const total = useMemo(() => {
    const tp = pecaItems.reduce((s, i) => s + (parseFloat(i.quantidade) || 0) * (parseFloat(i.precoUnitario) || 0), 0);
    const ts = svItems.reduce((s, i) => s + (parseFloat(i.quantidade) || 0) * (parseFloat(i.precoUnitario) || 0), 0);
    return tp + ts;
  }, [pecaItems, svItems]);

  function setPecaItem(pecaId, field, value) {
    setPecaItems(items => items.map(i => i.pecaId === pecaId ? { ...i, [field]: value } : i));
  }
  function removePecaItem(pecaId) {
    setPecaItems(items => items.filter(i => i.pecaId !== pecaId));
  }
  function setSvItem(servicoId, field, value) {
    setSvItems(items => items.map(i => i.servicoId === servicoId ? { ...i, [field]: value } : i));
  }
  function removeSvItem(servicoId) {
    setSvItems(items => items.filter(i => i.servicoId !== servicoId));
  }

  async function handleSave() {
    if (!pedidoIdSel) { toast.error('Selecione um pedido.'); return; }
    const dados = {
      pedido_id: pedidoIdSel, ref: isNew ? refAuto : orc.ref,
      data_emissao: emissao || undefined, data_validade: validade || undefined,
      estado, observacoes: descricao || undefined, notas: notas || undefined,
      ativo, total_liquido: total,
    };
    setSaving(true);
    try {
      let savedOrc;
      if (isNew) { savedOrc = await apiPost('/orcamentos', dados); }
      else       { savedOrc = await apiPut(`/orcamentos/${orcId}`, dados); }

      const itens = [
        ...pecaItems.filter(i => (parseFloat(i.precoUnitario) || 0) > 0 || (parseFloat(i.quantidade) || 0) > 0).map(i => ({ item_tipo: 'peca', peca_id: i.pecaId, quantidade: parseFloat(i.quantidade) || 1, valor_unitario: parseFloat(i.precoUnitario) || 0 })),
        ...svItems.map(i => ({ item_tipo: 'servico', servico_id: i.servicoId, quantidade: parseFloat(i.quantidade) || 1, valor_unitario: parseFloat(i.precoUnitario) || 0 })),
      ];
      await apiPost(`/orcamentos/${savedOrc.id}/itens`, itens);

      await useStore.getState().carregarDados();
      toast.success('Orçamento gravado com sucesso.');
      if (fromPedidoId) navigate(`/pedidos/${fromPedidoId}`);
      else navigate('/orcamentos');
    } catch (err) { toast.error('Erro ao guardar: ' + err.message); }
    finally { setSaving(false); }
  }

  if (!isNew && !orc) return <p style={{ padding: '2rem' }}>Orçamento não encontrado.</p>;

  const bloqueado = !editMode;
  const podeEliminar = isNew || (editMode && !(orc?.ativo && orc?.estado === 'Aprovado'));
  const invalidStatuses = ['Concluido', 'Cancelado', 'Faturar'];

  // Peças do pedido seleccionado para mostrar
  const pecasDoPedido = pedidoIdSel
    ? pecas.filter(pc => pecas_pedidos.some(pp => pp.pecaId === pc.id && pp.pedidoId === pedidoIdSel))
    : [];

  return (
    <>
      <div className="section-header">
        <button className="btn btn-ghost-back" onClick={() => fromPedidoId ? navigate(`/pedidos/${fromPedidoId}`) : navigate('/orcamentos')}>
          ↩ {fromPedidoId ? 'Voltar ao Pedido' : 'Voltar aos Orçamentos'}
        </button>
        <span className="section-count">{isNew ? 'Novo Orçamento' : 'Detalhe do Orçamento'}</span>
      </div>

      <div className="full-card" style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Ref. Orçamento</label>
            <input value={isNew ? refAuto : orc.ref} readOnly style={{ background: '#ddedda', cursor: 'not-allowed' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Custo Líquido (€)</label>
            <input value={total.toFixed(2)} readOnly style={{ background: '#ddedda', cursor: 'not-allowed' }} />
          </div>

          <div className="form-group full" style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 160 }}>
              <label className="form-label" style={{ margin: 0 }}>Pedido</label>
              <select disabled={bloqueado} value={pedidoIdSel || ''} onChange={e => onPedidoChange(Number(e.target.value) || null)}>
                <option value="">Selecionar pedido</option>
                {pedidos.filter(p => !invalidStatuses.includes(p.estado_pedido) || p.id === orc?.pedidoId).map(p => {
                  const cl = resolveCliente(p.clienteTipo, p.clienteId);
                  return <option key={p.id} value={p.id}>{p.ref} — {cl.nome}</option>;
                })}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label className="form-label" style={{ margin: 0 }}>Estado</label>
              <select disabled={bloqueado} value={estado} onChange={e => setEstado(e.target.value)}>
                <option value="Pendente">Pendente</option>
                <option value="Aprovado">Aprovado</option>
                <option value="Rejeitado">Rejeitado</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
              <label className="form-label" style={{ margin: 0, cursor: 'pointer' }} htmlFor="f-orc-ativo">Ativo</label>
              <input type="checkbox" id="f-orc-ativo" checked={ativo} disabled={bloqueado} onChange={e => setAtivo(e.target.checked)} style={{ width: 'auto', margin: 0, padding: 0, height: 34 }} />
            </div>
          </div>

          <div className="form-group full" style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label className="form-label" style={{ margin: 0 }}>Data Emissão</label>
              <input type="date" disabled={bloqueado} value={emissao} style={{ width: 'auto' }} onChange={e => { setEmissao(e.target.value); calcValidade(null, e.target.value); }} />
            </div>
            {!bloqueado && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label className="form-label" style={{ margin: 0 }}>Validade</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[15, 30].map(d => (
                    <button key={d} type="button" className={`btn btn-sm ${validadeDias === d ? 'btn-primary' : ''}`} style={{ padding: '7px 10px', fontSize: 13 }} onClick={() => calcValidade(d)}>{d} dias</button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label className="form-label" style={{ margin: 0 }}>Data Validade</label>
              <input type="date" value={validade} readOnly style={{ width: 'auto', background: '#ddedda', cursor: 'not-allowed' }} />
            </div>
          </div>

          <div className="form-group full">
            <label className="form-label">Descrição</label>
            <input disabled={bloqueado} value={descricao} onChange={e => setDescricao(e.target.value)} />
          </div>
          <div className="form-group full">
            <label className="form-label">Notas</label>
            <textarea style={{ minHeight: 80 }} disabled={bloqueado} value={notas} onChange={e => setNotas(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: '2rem' }}>
          <button className="btn" onClick={() => fromPedidoId ? navigate(`/pedidos/${fromPedidoId}`) : navigate('/orcamentos')}>Cancelar</button>
          {isNew
            ? <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'A criar…' : 'Criar Orçamento'}</button>
            : !editMode
              ? <button className="btn btn-primary" onClick={() => setEditMode(true)}>Editar</button>
              : <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'A guardar…' : 'Guardar Alterações'}</button>
          }
        </div>
      </div>

      {/* Peças */}
      <div className="full-card" style={{ margin: '1.5rem auto', maxWidth: 900, padding: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem', color: 'var(--color-primary)', fontSize: '1rem' }}>Peças do Pedido</h3>
        {!pedidoIdSel ? (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>Selecione um pedido para ver as peças associadas.</p>
        ) : pecasDoPedido.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>Sem peças associadas a este pedido.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Ref.</th><th>Plano</th><th>Denominação</th>
                <th>Qtd.</th><th>Unidade</th><th>Preço Unit. (€)</th><th className="orc-item-subtotal">Sub-total (€)</th>
                {podeEliminar && <th></th>}
              </tr>
            </thead>
            <tbody>
              {pecasDoPedido.map(pc => {
                const item = pecaItems.find(i => i.pecaId === pc.id) || { pecaId: pc.id, quantidade: 0, precoUnitario: 0 };
                const subtotal = (parseFloat(item.quantidade) || 0) * (parseFloat(item.precoUnitario) || 0);
                const mp = materia_prima.find(m => m.id === pc.materiaPrimaId);
                const pesoKg = parseFloat(calcPeso(pc.forma, pc.comprimento, pc.largura, pc.altura, pc.diametro_ext, pc.diametro_int, mp?.peso_esp)) || 0;
                const snap = pc.precoMpSnapshot;
                const custoStock = (pesoKg && snap) ? pesoKg * snap : null;
                const matLabel = mp ? ((mp.ref_wnr && mp.ref_wnr !== '-') ? `${mp.ref_wnr} – ${mp.ref_din}` : mp.ref_din) : '—';
                const plano = pecas_processos.filter(pp => pp.pecaId === pc.id).sort((a,b) => a.ordem - b.ordem);
                const linhasProc = plano.map(pp => { const proc = processos.find(p => p.id === pp.processoId) || {}; return { pp, proc, custoEst: calcCustoEstimado(pp, proc) }; });
                const totalCustoPeca = linhasProc.reduce((s, { custoEst }) => s + (custoEst ?? 0), 0) + (custoStock ?? 0);
                const temCusto = linhasProc.some(({ custoEst }) => custoEst != null) || custoStock != null;

                return (
                  <>
                    <tr key={pc.id}>
                      <td><strong>{pc.ref}</strong></td>
                      <td>{pc.plano || '—'}</td>
                      <td>{pc.denominacao || '-'}</td>
                      <td>{editMode ? <input type="number" min="1" step="1" value={item.quantidade} onChange={e => setPecaItem(pc.id, 'quantidade', e.target.value)} style={{ width: 70, padding: '4px 6px' }} /> : item.quantidade || '—'}</td>
                      <td>und</td>
                      <td>{editMode ? <input type="number" min="0" step="0.01" value={item.precoUnitario} onChange={e => setPecaItem(pc.id, 'precoUnitario', e.target.value)} style={{ width: 90, padding: '4px 6px' }} /> : (item.precoUnitario > 0 ? formatEuro(item.precoUnitario) : '—')}</td>
                      <td style={{ fontWeight: 600 }}>{subtotal > 0 ? formatEuro(subtotal) : '—'}</td>
                      {podeEliminar && <td><button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger,#c0392b)' }} onClick={() => removePecaItem(pc.id)}>✕</button></td>}
                    </tr>
                    <tr key={`stock-${pc.id}`} style={{ background: 'var(--color-surface-alt,#f8f8f6)' }}>
                      <td colSpan={podeEliminar ? 8 : 7} style={{ padding: '0.3rem 1rem 0.3rem 1.5rem', fontSize: 11, color: 'var(--color-text-muted)', borderTop: 'none' }}>
                        <strong>Material:</strong> {matLabel} &nbsp;|&nbsp; <strong>Peso:</strong> {pesoKg ? `${pesoKg.toFixed(4)} kg` : '—'} &nbsp;|&nbsp; <strong>Preço MP:</strong> {snap ? `${parseFloat(snap).toFixed(2)} €/kg` : '—'} &nbsp;|&nbsp; <strong>Custo stock:</strong> {custoStock != null ? <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{formatEuro(custoStock)}</span> : '—'}
                      </td>
                    </tr>
                    {plano.length > 0 && (
                      <tr key={`plan-${pc.id}`}>
                        <td colSpan={podeEliminar ? 8 : 7} style={{ padding: '0.4rem 1rem 0.75rem', background: 'var(--color-surface-alt,#f8f8f6)' }}>
                          <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
                            <thead><tr style={{ color: 'var(--color-text-muted)' }}>
                              <th style={{ padding: '2px 8px', textAlign: 'center', width: 40 }}>Ord.</th>
                              <th style={{ padding: '2px 8px', width: 70 }}>Ref.</th>
                              <th style={{ padding: '2px 8px' }}>Processo</th><th style={{ padding: '2px 8px' }}>Tipo</th>
                              <th style={{ padding: '2px 8px', width: 100 }}>Tempo Est.</th>
                              <th style={{ padding: '2px 8px', width: 100, textAlign: 'right' }}>Custo Est.</th>
                            </tr></thead>
                            <tbody>
                              {linhasProc.map(({ pp, proc, custoEst }) => (
                                <tr key={pp.id}>
                                  <td style={{ padding: '3px 8px', textAlign: 'center' }}>{pp.ordem + 1}</td>
                                  <td style={{ padding: '3px 8px', fontWeight: 600 }}>{proc.ref || '—'}</td>
                                  <td style={{ padding: '3px 8px' }}>{proc.descricao || '—'}</td>
                                  <td style={{ padding: '3px 8px' }}>{proc.tipo || '—'}</td>
                                  <td style={{ padding: '3px 8px' }}>{pp.tempoEstimado != null ? `${pp.tempoEstimado} ${pp.unidade_tempo}` : '—'}</td>
                                  <td style={{ padding: '3px 8px', textAlign: 'right' }}>{custoEst != null ? formatEuro(custoEst) : '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                            {temCusto && (
                              <tfoot><tr>
                                <td colSpan={5} style={{ padding: '4px 8px', textAlign: 'right', fontSize: 10, color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)' }}>Custo total por peça:</td>
                                <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 700, borderTop: '1px solid var(--color-border)' }}>{formatEuro(totalCustoPeca)}</td>
                              </tr></tfoot>
                            )}
                          </table>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Serviços */}
      <div className="full-card" style={{ margin: '1.5rem auto', maxWidth: 900, padding: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem', color: 'var(--color-primary)', fontSize: '1rem' }}>Serviços do Pedido</h3>
        {svItems.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '1rem 0' }}>Sem serviços.</p>
        ) : (
          <table className="table" id="orcamento-servicos-table">
            <thead>
              <tr>
                <th>Ref.</th><th>Tipo de Serviço</th><th>Qtd.</th><th>Unidade</th>
                <th>Preço Unit. (€)</th><th>Sub-total (€)</th>
                {podeEliminar && <th></th>}
              </tr>
            </thead>
            <tbody>
              {svItems.map(item => {
                const sv = servicos.find(s => s.id === item.servicoId);
                if (!sv) return null;
                const subtotal = (parseFloat(item.quantidade) || 0) * (parseFloat(item.precoUnitario) || 0);
                return (
                  <tr key={item.servicoId}>
                    <td><strong>{sv.ref}</strong></td>
                    <td>{sv.tipo_servico}</td>
                    <td>{editMode ? <input type="number" min="0.01" step="0.01" value={item.quantidade} onChange={e => setSvItem(item.servicoId, 'quantidade', e.target.value)} style={{ width: 80 }} /> : item.quantidade}</td>
                    <td>{sv.unidade || '—'}</td>
                    <td>{editMode ? <input type="number" min="0" step="0.01" value={item.precoUnitario} onChange={e => setSvItem(item.servicoId, 'precoUnitario', e.target.value)} style={{ width: 90 }} /> : formatEuro(item.precoUnitario)}</td>
                    <td style={{ fontWeight: 600 }}>{formatEuro(subtotal)}</td>
                    {podeEliminar && <td><button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger,#c0392b)' }} onClick={() => removeSvItem(item.servicoId)}>✕</button></td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

/* ---------- Raiz ---------- */
export default function Orcamentos() {
  const { id } = useParams();
  if (id) return <OrcamentosDetalhe orcId={id === 'novo' ? null : id} />;
  return <OrcamentosList />;
}
