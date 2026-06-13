import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useStore from '../store';
import { apiPut } from '../lib/api';
import { toast } from '../lib/toast';
import { formatEuro, resolveCliente, getPedido, getDadosPedido, today, addDays } from '../lib/helpers';
import { calcPeso, calcCustoEstimado, resolverMaterial } from '../lib/pecaUtils';
import { EstadoBadge, TipoBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';

const PER_PAGE = 15;
const ESTADOS_OT = ['Em curso', 'Pendente', 'Falta OC', 'Faturar', 'Concluída'];

/* ---------- Lista ---------- */
function OrdensList() {
  const ordens  = useStore(s => s.ordens);
  const pedidos = useStore(s => s.pedidos);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(ordens.length / PER_PAGE));
  const p = Math.min(page, totalPages);
  const paginadas = ordens.slice((p - 1) * PER_PAGE, p * PER_PAGE);

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
        <span className="section-count">{ordens.length} ordens de trabalho</span>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}><Paginacao /></div>
      </div>
      <div className="full-card">
        <table className="table">
          <thead>
            <tr>
              <th>OT Nº</th><th>Pedido</th><th>Cliente</th>
              <th>Ordem de Compra</th><th>Prazo</th><th>Data Limite Entrega</th>
              <th>Nº GT</th><th>Nº FT</th><th>Estado</th><th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {paginadas.length === 0 ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>Nenhuma ordem de trabalho criada.</td></tr>
            ) : paginadas.map(o => {
              const pd = pedidos.find(x => x.id === o.pedidoId) || {};
              const cl = resolveCliente(pd.clienteTipo, pd.clienteId);
              const dp = getDadosPedido(pd.dadosPedidoId);
              const label = pd.clienteTipo === 'particular'
                ? <div style={{ lineHeight: 1.2 }}><div>{cl.nome}</div><div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Particular</div></div>
                : <div style={{ lineHeight: 1.2 }}><div>{cl.subtexto}</div><div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{cl.nome}</div></div>;

              return (
                <tr key={o.id}>
                  <td><strong>{o.num}</strong></td>
                  <td><Link to={`/pedidos/${pd.id}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>{pd.ref}</Link></td>
                  <td><span className="inline-flex"><Avatar name={cl.nome} cls={cl.avClass} small />{label}</span></td>
                  <td>{dp.ordem_compra || '—'}</td>
                  <td>{o.prazo != null ? `${o.prazo} sem.` : '—'}</td>
                  <td>{o.dataLimiteEntrega || '—'}</td>
                  <td>{o.n_gt || '—'}</td>
                  <td>{o.n_ft || '—'}</td>
                  <td><EstadoBadge estado={o.estado} /></td>
                  <td><Link to={`/ordens/${o.id}`} className="btn btn-ghost btn-sm" title="Ver detalhe">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </Link></td>
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
function InfoBox({ estado, dataLimiteEntrega, concluidoEm }) {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  let text = '', bg = 'var(--color-surface-alt)', color = 'var(--color-text-muted)';

  if (estado === 'Em curso' || estado === 'Pendente') {
    if (!dataLimiteEntrega) { text = 'Sem data limite definida'; }
    else {
      const limite = new Date(dataLimiteEntrega); limite.setHours(0, 0, 0, 0);
      const dias = Math.round((limite - hoje) / 86400000);
      if (dias < 0) { text = `Data limite ultrapassada há ${Math.abs(dias)} dia(s)`; bg = '#fdecea'; color = '#a00'; }
      else if (dias === 0) { text = 'Data limite é hoje!'; bg = '#fff8e1'; color = '#7c5a00'; }
      else { text = `Faltam ${dias} dia(s) para atingir a data limite`; bg = '#fff8e1'; color = '#7c5a00'; }
    }
  } else if (estado === 'Falta OC') {
    const conc = concluidoEm ? new Date(concluidoEm.slice(0, 10)) : null;
    if (!conc) { text = 'Sem data de conclusão — PEDIR OC'; bg = '#fdecea'; color = '#a00'; }
    else { const dias = Math.round((hoje - conc) / 86400000); text = `Trabalho entregue há ${dias} dia(s) — PEDIR OC`; bg = '#fdecea'; color = '#a00'; }
  } else if (estado === 'Concluída') {
    text = 'Ordem de Trabalho Faturada'; bg = '#e8f5e9'; color = '#2e7d32';
  }

  return (
    <div style={{ height: 34, display: 'flex', alignItems: 'center', padding: '0 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 12, fontWeight: 500, background: bg, color }}>
      {text}
    </div>
  );
}

function OrdensDetalhe({ otId }) {
  const navigate  = useNavigate();
  const ordens    = useStore(s => s.ordens);
  const pedidos   = useStore(s => s.pedidos);
  const orcamentos     = useStore(s => s.orcamentos);
  const orcamento_itens = useStore(s => s.orcamento_itens);
  const pecas     = useStore(s => s.pecas);
  const pecas_processos = useStore(s => s.pecas_processos);
  const processos = useStore(s => s.processos);
  const materia_prima   = useStore(s => s.materia_prima);

  const ot = ordens.find(o => o.id === Number(otId));
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!ot) return <p style={{ padding: '2rem' }}>Ordem não encontrada.</p>;

  const pd  = pedidos.find(p => p.id === ot.pedidoId) || {};
  const cl  = resolveCliente(pd.clienteTipo, pd.clienteId);
  const dp  = getDadosPedido(pd.dadosPedidoId);

  const orc = orcamentos.find(o => o.pedidoId === pd.id && o.ativo && o.estado === 'Aprovado')
           || orcamentos.find(o => o.pedidoId === pd.id && o.ativo)
           || orcamentos.find(o => o.pedidoId === pd.id);
  const orcAprovado = orcamentos.find(o => o.pedidoId === pd.id && o.ativo && o.estado === 'Aprovado');
  const orcItens    = orcAprovado ? orcamento_itens.filter(i => i.orcamentoId === orcAprovado.id && i.itemTipo !== 'servico') : [];
  const orcServicos = orcAprovado ? orcamento_itens.filter(i => i.orcamentoId === orcAprovado.id && i.itemTipo === 'servico') : [];

  const currentForm = form || {
    prazo: ot.prazo ?? '',
    dataLimiteEntrega: ot.dataLimiteEntrega || '',
    concluidoEm: ot.concluido_em?.slice(0, 10) || '',
    estado: ot.estado,
    n_gt: ot.n_gt || '',
    n_ft: ot.n_ft || '',
    n_orc_sage: ot.n_orc_sage || '',
  };

  function startEdit() { setForm({ ...currentForm }); setEditMode(true); }

  function onPrazoChange(semanas) {
    const s = parseInt(semanas);
    if (!s || s < 1) { setForm(f => ({ ...f, prazo: semanas, dataLimiteEntrega: '' })); return; }
    const base = new Date(ot.criado_em?.slice(0, 10) || today());
    base.setDate(base.getDate() + s * 7);
    setForm(f => ({ ...f, prazo: semanas, dataLimiteEntrega: base.toISOString().slice(0, 10) }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        prazo: currentForm.prazo ? parseInt(currentForm.prazo) : null,
        data_limite_entrega: currentForm.dataLimiteEntrega || null,
        concluido_em: currentForm.concluidoEm || null,
        estado: currentForm.estado || undefined,
        n_gt: currentForm.n_gt || null,
        n_ft: currentForm.n_ft || null,
        n_orc_sage: currentForm.n_orc_sage || null,
      };
      const upd = await apiPut(`/ordens/${otId}`, payload);
      useStore.setState(s => ({ ordens: s.ordens.map(o => o.id === Number(otId) ? { ...o, ...upd, pedidoId: upd.pedido_id, moObra: Number(upd.mo_obra ?? 0), prazo: upd.prazo ?? null, dataLimiteEntrega: upd.data_limite_entrega?.slice(0, 10) ?? '' } : o) }));
      setEditMode(false); setForm(null);
      toast.success('Ordem de trabalho gravada com sucesso.');
    } catch (err) { toast.error('Erro ao guardar: ' + err.message); }
    finally { setSaving(false); }
  }

  const ro = !editMode;
  const f  = name => e => setForm(x => ({ ...x, [name]: e.target.value }));
  const displayOt = { ...ot, ...currentForm };

  const dimPeca = pc => {
    const parts = [];
    if (pc.comprimento) parts.push(`C:${pc.comprimento}`);
    if (pc.largura)     parts.push(`L:${pc.largura}`);
    if (pc.diametro_ext) parts.push(`∅ext:${pc.diametro_ext}`);
    if (pc.diametro_int) parts.push(`∅int:${pc.diametro_int}`);
    return parts.join(' · ') || '—';
  };

  return (
    <>
      <div className="section-header">
        <button className="btn btn-ghost-back" onClick={() => navigate('/ordens')}>↩ Voltar às Ordens</button>
        <span className="section-count" style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-primary)' }}>Detalhe da Ordem: {ot.num}</span>
      </div>

      <div className="full-card" style={{ padding: '2rem' }}>
        <div className="form-grid">
          {/* Linha 1: info principal */}
          <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'row', gap: 16 }}>
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label className="form-label">Nº Ordem de Trabalho</label>
              <input value={ot.num || '—'} readOnly style={{ background: '#ddedda', cursor: 'not-allowed', height: 30 }} />
            </div>
            <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label className="form-label">Criado em</label>
              <input type="date" value={ot.criado_em?.slice(0, 10) || ''} readOnly style={{ background: '#ddedda', cursor: 'not-allowed', height: 30 }} />
            </div>
            <div style={{ flex: '0 0 90px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label className="form-label">Prazo (sem.)</label>
              <input type="number" min="1" value={currentForm.prazo} disabled={ro} onChange={e => onPrazoChange(e.target.value)} style={{ height: 30 }} />
            </div>
            <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label className="form-label">Data Limite Entrega</label>
              <input type="date" value={currentForm.dataLimiteEntrega} readOnly style={{ background: '#ddedda', cursor: 'not-allowed', height: 30 }} />
            </div>
            <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label className="form-label">Estado</label>
              <select value={currentForm.estado} disabled={ro} onChange={f('estado')} style={{ height: 30 }}>
                {ESTADOS_OT.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Linha 2: campos secundários */}
          <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: 16 }}>
            <div className="form-group" style={{ flex: '0 0 auto' }}>
              <label className="form-label">Concluído em</label>
              <input type="date" value={currentForm.concluidoEm} disabled={ro} onChange={f('concluidoEm')} />
            </div>
            <div className="form-group" style={{ flex: '0 0 auto' }}>
              <label className="form-label">Guia Transporte</label>
              <input value={currentForm.n_gt} disabled={ro} onChange={f('n_gt')} />
            </div>
            <div className="form-group" style={{ flex: '0 0 auto' }}>
              <label className="form-label">Fatura</label>
              <input value={currentForm.n_ft} disabled={ro} onChange={f('n_ft')} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Informação</label>
              <InfoBox estado={displayOt.estado} dataLimiteEntrega={displayOt.dataLimiteEntrega} concluidoEm={displayOt.concluidoEm} />
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <button className="btn" style={{ width: 120 }} onClick={() => navigate('/ordens')}>Cancelar</button>
              {!editMode
                ? <button className="btn btn-primary" style={{ width: 120 }} onClick={startEdit}>Editar</button>
                : <button className="btn btn-primary" style={{ width: 120 }} onClick={handleSave} disabled={saving}>{saving ? 'A guardar…' : 'Guardar alterações'}</button>
              }
            </div>
          </div>

          {/* Dados do Pedido */}
          <div className="form-group full"><h4 style={{ margin: '1.5rem 0 0.25rem', color: 'var(--color-primary)' }}>Dados do Pedido</h4><hr style={{ border: 'none', borderTop: '2px solid var(--color-primary)', margin: '0 0 0.5rem' }} /></div>
          <div style={{ gridColumn: '1/-1', display: 'flex', gap: 16 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Nº Pedido</label>
              <div style={{ height: 34, display: 'flex', alignItems: 'center', background: '#ddedda', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0 10px' }}>
                <Link to={`/pedidos/${pd.id}`} style={{ fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'underline' }}>{pd.ref}</Link>
              </div>
            </div>
            <div className="form-group" style={{ flex: 2 }}><label className="form-label">Cliente</label><input value={cl.nome} readOnly /></div>
            <div className="form-group" style={{ flex: 2 }}><label className="form-label">Empresa / Tipo</label><input value={cl.subtexto} readOnly /></div>
          </div>
          <div style={{ gridColumn: '1/-1', display: 'flex', gap: 16 }}>
            <div className="form-group" style={{ flex: 1 }}><label className="form-label">Ordem de Compra</label><input value={dp.ordem_compra || '—'} readOnly /></div>
            <div className="form-group" style={{ flex: 1 }}><label className="form-label">Nº Orç. SAGE</label><input value={currentForm.n_orc_sage} disabled={ro} onChange={e => setForm(f => ({ ...f, n_orc_sage: e.target.value }))} /></div>
            <div className="form-group" style={{ flex: 1 }}><label className="form-label">Nº Orçamento</label><input value={orc ? orc.ref : '—'} readOnly /></div>
            <div className="form-group" style={{ flex: 1 }}><label className="form-label">Valor Orçamento</label><input value={orc ? formatEuro(orc.valor) : '—'} readOnly /></div>
          </div>

          {/* Dados do Equipamento */}
          <div className="form-group full"><h4 style={{ margin: '1.5rem 0 0.25rem', color: 'var(--color-primary)' }}>Dados do Equipamento</h4><hr style={{ border: 'none', borderTop: '2px solid var(--color-primary)', margin: '0 0 0.5rem' }} /></div>
          <div className="form-group"><label className="form-label">Ref. Equipamento</label><input value={dp.ref || '—'} disabled /></div>
          <div className="form-group"><label className="form-label">Equipamento</label><input value={dp.equipamento || '—'} disabled /></div>
          <div className="form-group"><label className="form-label">Órgão</label><input value={dp.orgao || '—'} disabled /></div>
          <div className="form-group"><label className="form-label">Parte</label><input value={dp.parte || '—'} disabled /></div>
          <div className="form-group full"><label className="form-label">Breve Descrição</label><input value={dp.breveDescricao || '—'} disabled /></div>

          {/* Lista de Peças */}
          <div className="form-group full"><h4 style={{ margin: '1.5rem 0 0.25rem', color: 'var(--color-primary)' }}>Lista de Peças</h4><hr style={{ border: 'none', borderTop: '2px solid var(--color-primary)', margin: '0 0 0.5rem' }} /></div>
          <div className="form-group full">
            {orcItens.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
                {orcAprovado ? 'Sem peças no orçamento.' : 'Não existe orçamento ativo e aprovado.'}
              </p>
            ) : (
              <table className="table" style={{ fontSize: 12 }}>
                <thead><tr>
                  <th>Referência</th><th>Denominação</th><th>Plano</th><th>Material</th>
                  <th>Dimensões (mm)</th><th>Peso (kg)</th>
                  <th style={{ textAlign: 'right' }}>Custo stock (€)</th>
                  <th style={{ textAlign: 'center' }}>Qtd.</th>
                  <th style={{ textAlign: 'right' }}>Custo und (€)</th>
                </tr></thead>
                <tbody>
                  {orcItens.map(item => {
                    const pc = pecas.find(p => p.id === item.pecaId);
                    if (!pc) return null;
                    const mp = materia_prima.find(m => m.id === pc.materiaPrimaId);
                    const pesoKg = parseFloat(calcPeso(pc.forma, pc.comprimento, pc.largura, pc.altura, pc.diametro_ext, pc.diametro_int, mp?.peso_esp)) || 0;
                    const snap = pc.precoMpSnapshot;
                    const custoStock = (pesoKg && snap) ? pesoKg * snap : null;
                    const matLabel = mp ? ((mp.ref_wnr && mp.ref_wnr !== '-') ? `${mp.ref_wnr} – ${mp.ref_din}` : mp.ref_din) : '—';
                    const plano = pecas_processos.filter(pp => pp.pecaId === pc.id).sort((a, b) => a.ordem - b.ordem);
                    const linhasProc = plano.map(pp => { const proc = processos.find(p => p.id === pp.processoId) || pp.processo || {}; return { pp, proc, custoEst: calcCustoEstimado(pp, proc) }; });
                    const totalCustoPeca = linhasProc.reduce((s, { custoEst }) => s + (custoEst ?? 0), 0) + (custoStock ?? 0);
                    const temCusto = linhasProc.some(({ custoEst }) => custoEst != null) || custoStock != null;

                    return (
                      <>
                        <tr key={item.id}>
                          <td><Link to={`/pecas/${pc.id}`} style={{ fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'underline' }}>{pc.ref || '—'}</Link></td>
                          <td>{pc.denominacao || '—'}</td>
                          <td>{pc.plano || '—'}</td>
                          <td>{resolverMaterial(pc.materiaPrimaId)}</td>
                          <td>{dimPeca(pc)}</td>
                          <td>{pesoKg ? `${pesoKg.toFixed(4)} kg` : '—'}</td>
                          <td style={{ textAlign: 'right', fontWeight: custoStock != null ? 600 : 400, color: custoStock == null ? 'var(--color-text-muted)' : 'inherit' }}>{custoStock != null ? formatEuro(custoStock) : '—'}</td>
                          <td style={{ textAlign: 'center' }}>{item.quantidade}</td>
                          <td style={{ textAlign: 'right' }}>{formatEuro(item.precoUnitario)}</td>
                        </tr>
                        <tr key={`stock-${item.id}`} style={{ background: 'var(--color-surface-alt,#f8f8f6)' }}>
                          <td colSpan={9} style={{ padding: '0.3rem 1rem 0.3rem 1.5rem', fontSize: 11, color: 'var(--color-text-muted)', borderTop: 'none' }}>
                            <strong>Material:</strong> {matLabel} &nbsp;|&nbsp; <strong>Peso:</strong> {pesoKg ? `${pesoKg.toFixed(4)} kg` : '—'} &nbsp;|&nbsp; <strong>Preço MP:</strong> {snap ? `${parseFloat(snap).toFixed(2)} €/kg` : '—'} &nbsp;|&nbsp; <strong>Custo stock:</strong> {custoStock != null ? <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{formatEuro(custoStock)}</span> : '—'}
                          </td>
                        </tr>
                        {plano.length > 0 && (
                          <tr key={`plan-${item.id}`}>
                            <td colSpan={9} style={{ padding: '0.4rem 1rem 0.75rem', background: 'var(--color-surface-alt,#f8f8f6)' }}>
                              <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
                                <thead><tr style={{ color: 'var(--color-text-muted)' }}>
                                  <th style={{ padding: '2px 8px', textAlign: 'center', width: 40 }}>Ord.</th>
                                  <th style={{ padding: '2px 8px', width: 70 }}>Ref.</th>
                                  <th style={{ padding: '2px 8px' }}>Processo</th>
                                  <th style={{ padding: '2px 8px' }}>Tipo</th>
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

          {/* Lista de Serviços */}
          <div className="form-group full"><h4 style={{ margin: '1.5rem 0 0.25rem', color: 'var(--color-primary)' }}>Lista de Serviços</h4><hr style={{ border: 'none', borderTop: '2px solid var(--color-primary)', margin: '0 0 0.5rem' }} /></div>
          <div className="form-group full">
            {orcServicos.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
                {orcAprovado ? 'Sem serviços no orçamento.' : 'Não existe orçamento ativo e aprovado.'}
              </p>
            ) : (
              <table className="table" style={{ fontSize: 12 }}>
                <thead><tr>
                  <th>Referência</th><th>Tipo de Serviço</th>
                  <th style={{ textAlign: 'center' }}>Qtd.</th><th>Unidade</th>
                  <th style={{ textAlign: 'right' }}>Preço Unit. (€)</th>
                  <th style={{ textAlign: 'right' }}>Sub-total (€)</th>
                </tr></thead>
                <tbody>
                  {orcServicos.map(item => {
                    const sv = item.servico || useStore.getState().servicos.find(s => s.id === item.servicoId);
                    if (!sv) return null;
                    return (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 600 }}>{sv.ref || '—'}</td>
                        <td>{sv.tipo_servico || '—'}</td>
                        <td style={{ textAlign: 'center' }}>{item.quantidade}</td>
                        <td>{sv.unidade || '—'}</td>
                        <td style={{ textAlign: 'right' }}>{formatEuro(item.precoUnitario)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatEuro(item.quantidade * item.precoUnitario)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- Raiz ---------- */
export default function Ordens() {
  const { id } = useParams();
  if (id) return <OrdensDetalhe otId={id} />;
  return <OrdensList />;
}
