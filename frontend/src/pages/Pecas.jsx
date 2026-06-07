import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import useStore from '../store';
import { apiPost, apiPut, apiDelete } from '../lib/api';
import { toast } from '../lib/toast';
import { formatEuro } from '../lib/helpers';
import { calcPeso, calcCustoEstimado, resolverMaterial } from '../lib/pecaUtils';

const PER_PAGE = 15;
const FORMA_CAMPOS = {
  comprimento:  ['quadrado', 'redondo_macico', 'redondo_oco'],
  largura:      ['quadrado'],
  altura:       ['quadrado'],
  diametro_ext: ['redondo_macico', 'redondo_oco'],
  diametro_int: ['redondo_oco'],
};

/* ---------- Ícones ---------- */
const IconEdit = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <g transform="matrix(1.05 0 0 1.05 12 12)">
      <path style={{ fill: 'currentColor' }} transform="translate(-12.5,-11.5)"
        d="M19.171875 2C18.448125 2 17.724375 2.275625 17.171875 2.828125L16 4L20 8L21.171875 6.828125C22.275875 5.724125 22.275875 3.933125 21.171875 2.828125C20.619375 2.275625 19.895625 2 19.171875 2zM14.5 5.5L5 15C5 15 6.005 15.005 6.5 15.5C6.995 15.995 6.984375 16.984375 6.984375 16.984375C6.984375 16.984375 8.004 17.004 8.5 17.5C8.996 17.996 9 19 9 19L18.5 9.5L14.5 5.5zM3.6699219 17L3.0136719 20.503906C2.9606719 20.789906 3.2100938 21.039328 3.4960938 20.986328L7 20.330078L3.6699219 17z"
      />
    </g>
  </svg>
);
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

/* ---------- Lightbox ---------- */
function Lightbox({ ref: pcRef, src, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
      <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: '0 0 12px' }}>{pcRef}</p>
      <img src={src} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 6 }} />
      <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 11, margin: '12px 0 0' }}>Clique em qualquer lugar para fechar</p>
    </div>
  );
}

/* ---------- Plano de Processos ---------- */
function PlanoProcessos({ pecaId }) {
  const pecas_processos = useStore(s => s.pecas_processos);
  const processos       = useStore(s => s.processos);
  const pecas           = useStore(s => s.pecas);
  const materia_prima   = useStore(s => s.materia_prima);

  const [novoProcessoId, setNovoProcessoId] = useState('');
  const [novoTempo, setNovoTempo] = useState('');
  const [novaUnidade, setNovaUnidade] = useState('h');
  const [novasNotas, setNovasNotas] = useState('');
  const [saving, setSaving] = useState(false);

  const plano = pecas_processos
    .filter(pp => pp.pecaId === pecaId)
    .sort((a, b) => a.ordem - b.ordem);

  const processosAtivos = processos.filter(p => p.ativo);

  const pc = pecas.find(p => p.id === pecaId);
  const mp = materia_prima.find(m => m.id === pc?.materiaPrimaId);
  const pesoKg = parseFloat(calcPeso(pc?.forma, pc?.comprimento, pc?.largura, pc?.altura, pc?.diametro_ext, pc?.diametro_int, mp?.peso_esp)) || 0;
  const custoStock = (pesoKg && pc?.precoMpSnapshot) ? pesoKg * pc.precoMpSnapshot : null;
  const totalProcessos = plano.reduce((s, pp) => {
    const proc = processos.find(p => p.id === pp.processoId) || {};
    return s + (calcCustoEstimado(pp, proc) ?? 0);
  }, 0);
  const custoTotal = (custoStock ?? 0) + totalProcessos;
  const temCusto = custoStock != null || plano.some(pp => calcCustoEstimado(pp, processos.find(p => p.id === pp.processoId) || {}) != null);

  async function adicionar() {
    if (!novoProcessoId) { toast.error('Seleciona um processo.'); return; }
    setSaving(true);
    try {
      const novo = await apiPost('/pecas-processos', {
        peca_id: pecaId, processo_id: Number(novoProcessoId), ordem: plano.length,
        tempo_estimado: novoTempo !== '' ? Number(novoTempo) : null,
        unidade_tempo: novaUnidade, notas: novasNotas || null,
      });
      useStore.setState(s => ({
        pecas_processos: [...s.pecas_processos, { ...novo, pecaId: novo.peca_id, processoId: novo.processo_id, tempoEstimado: novo.tempo_estimado != null ? Number(novo.tempo_estimado) : null, custoHoraSnapshot: novo.custo_hora_snapshot != null ? Number(novo.custo_hora_snapshot) : null }],
      }));
      setNovoProcessoId(''); setNovoTempo(''); setNovasNotas('');
      toast.success('Processo adicionado.');
    } catch (err) { toast.error('Erro: ' + err.message); }
    finally { setSaving(false); }
  }

  async function remover(ppId) {
    try {
      await apiDelete(`/pecas-processos/${ppId}`);
      useStore.setState(s => {
        const sem = s.pecas_processos.filter(pp => pp.id !== ppId);
        const reord = sem.filter(pp => pp.pecaId === pecaId).sort((a,b) => a.ordem - b.ordem).map((pp, i) => ({ ...pp, ordem: i }));
        return { pecas_processos: [...sem.filter(pp => pp.pecaId !== pecaId), ...reord] };
      });
      toast.success('Processo removido.');
    } catch (err) { toast.error('Erro: ' + err.message); }
  }

  async function mover(ppId, delta) {
    const idx = plano.findIndex(pp => pp.id === ppId);
    const idxAlvo = idx + delta;
    if (idxAlvo < 0 || idxAlvo >= plano.length) return;
    const ordemA = plano[idx].ordem, ordemB = plano[idxAlvo].ordem;
    try {
      await Promise.all([
        apiPut(`/pecas-processos/${plano[idx].id}`, { ordem: ordemB }),
        apiPut(`/pecas-processos/${plano[idxAlvo].id}`, { ordem: ordemA }),
      ]);
      useStore.setState(s => ({
        pecas_processos: s.pecas_processos.map(pp => {
          if (pp.id === plano[idx].id)    return { ...pp, ordem: ordemB };
          if (pp.id === plano[idxAlvo].id) return { ...pp, ordem: ordemA };
          return pp;
        }),
      }));
    } catch (err) { toast.error('Erro ao reordenar: ' + err.message); }
  }

  return (
    <>
      <div className="full-card" style={{ maxWidth: 800, margin: '1rem auto', padding: '2rem' }}>
        <h4 style={{ margin: '0 0 0.25rem', color: 'var(--color-primary)' }}>Plano de Processos</h4>
        <hr style={{ border: 'none', borderTop: '2px solid var(--color-primary)', margin: '0 0 1rem' }} />
        <table className="table" style={{ fontSize: 12, marginBottom: '1.25rem' }}>
          <thead>
            <tr>
              <th style={{ width: 50, textAlign: 'center' }}>Ord.</th>
              <th style={{ width: 80 }}>Ref.</th>
              <th>Processo</th><th>Tipo</th>
              <th style={{ width: 110 }}>Tempo Est.</th>
              <th style={{ width: 110, textAlign: 'right' }}>Custo Est.</th>
              <th style={{ width: 90 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {plano.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '1.5rem' }}>
                Sem processos definidos. Adiciona o primeiro processo abaixo.
              </td></tr>
            ) : plano.map((pp, idx) => {
              const proc = processos.find(p => p.id === pp.processoId) || pp.processo || {};
              const custoEst = calcCustoEstimado(pp, proc);
              const custoAtual = Number(proc.custo_hora);
              const precoAlterado = pp.custoHoraSnapshot != null && custoAtual !== pp.custoHoraSnapshot;
              return (
                <tr key={pp.id}>
                  <td style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>{pp.ordem + 1}</td>
                  <td><strong>{proc.ref || '—'}</strong></td>
                  <td>{proc.descricao || '—'}</td>
                  <td>{proc.tipo || '—'}</td>
                  <td>{pp.tempoEstimado != null ? `${pp.tempoEstimado} ${pp.unidade_tempo}` : '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    {custoEst != null ? formatEuro(custoEst) : '—'}
                    {precoAlterado && <span title={`Snapshot: ${pp.custoHoraSnapshot?.toFixed(2)} €/h · atual: ${custoAtual.toFixed(2)} €/h`} style={{ cursor: 'help', color: 'var(--color-warning,#b45309)', fontSize: 16 }}>⚠</span>}
                  </td>
                  <td style={{ display: 'flex', gap: 4 }}>
                    {idx > 0 ? <button className="btn btn-ghost btn-sm" onClick={() => mover(pp.id, -1)}>↑</button> : <span style={{ width: 32 }} />}
                    {idx < plano.length - 1 ? <button className="btn btn-ghost btn-sm" onClick={() => mover(pp.id, 1)}>↓</button> : <span style={{ width: 32 }} />}
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger,#c00)' }} onClick={() => remover(pp.id)} title="Remover"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                  </td>
                </tr>
              );
            })}
            {plano.length > 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'right', fontSize: 11, color: 'var(--color-text-muted)', padding: '6px 8px' }}>Total processos:</td>
                <td style={{ textAlign: 'right', fontWeight: 700, padding: '6px 8px' }}>{formatEuro(totalProcessos)}</td>
                <td />
              </tr>
            )}
          </tbody>
        </table>

        <details>
          <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', listStyle: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>▸</span> Adicionar processo
          </summary>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            <div style={{ flex: 2, minWidth: 220 }}>
              <label className="form-label">Processo</label>
              <select style={{ width: '100%' }} value={novoProcessoId} onChange={e => setNovoProcessoId(e.target.value)}>
                <option value="">Selecionar...</option>
                {processosAtivos.map(p => <option key={p.id} value={p.id}>{p.ref} — {p.descricao}</option>)}
              </select>
            </div>
            <div style={{ flex: '0 0 90px' }}>
              <label className="form-label">Tempo Est.</label>
              <input type="number" min="0" step="0.5" placeholder="0.0" style={{ width: '100%' }} value={novoTempo} onChange={e => setNovoTempo(e.target.value)} />
            </div>
            <div style={{ flex: '0 0 70px' }}>
              <label className="form-label">Unidade</label>
              <select style={{ width: '100%' }} value={novaUnidade} onChange={e => setNovaUnidade(e.target.value)}>
                <option value="h">h</option>
                <option value="min">min</option>
              </select>
            </div>
            <div style={{ flex: 2, minWidth: 160 }}>
              <label className="form-label">Notas</label>
              <input placeholder="Opcional" style={{ width: '100%' }} value={novasNotas} onChange={e => setNovasNotas(e.target.value)} />
            </div>
            <button className="btn btn-primary" style={{ height: 34 }} onClick={adicionar} disabled={saving}>
              {saving ? 'A adicionar…' : 'Adicionar'}
            </button>
          </div>
        </details>
      </div>

      {temCusto && (
        <div className="full-card" style={{ maxWidth: 800, margin: '1rem auto', padding: '2rem' }}>
          <h4 style={{ margin: '0 0 0.25rem', color: 'var(--color-primary)' }}>Resumo de Custos</h4>
          <hr style={{ border: 'none', borderTop: '2px solid var(--color-primary)', margin: '0 0 1rem' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Custo de stock</span>
              <span>{custoStock != null ? formatEuro(custoStock) : <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>sem preço MP registado</span>}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Custo de processos</span>
              <span>{formatEuro(totalProcessos)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontWeight: 700, fontSize: 15 }}>
              <span>Custo estimado</span>
              <span style={{ color: 'var(--color-primary)' }}>{formatEuro(custoTotal)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- Detalhe ---------- */
function PecaDetalhe({ pecaId: rawId }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const fromPedidoId = location.state?.fromPedidoId ?? null;

  const pecas         = useStore(s => s.pecas);
  const pedidos       = useStore(s => s.pedidos);
  const materia_prima = useStore(s => s.materia_prima);
  const pecas_pedidos = useStore(s => s.pecas_pedidos);

  const isNew = !rawId;
  const pecaId = isNew ? null : Number(rawId);
  const pc = isNew ? null : pecas.find(x => x.id === pecaId);

  const pedidoIdInicial = isNew
    ? (fromPedidoId || null)
    : (pecas_pedidos.find(pp => pp.pecaId === pecaId)?.pedidoId ?? null);

  const pedidoAssoc = pedidos.find(p => p.id === pedidoIdInicial) || null;

  function pecaRefPrefixo(pedido) {
    const ano = new Date().getFullYear().toString().slice(-2);
    if (!pedido) return `DM${ano}-????`;
    const seq = pedido.ref.split('-')[1] || '????';
    return `DM${ano}-${seq}`;
  }

  function parsearSegmentos(ref, pedido) {
    const prefixo = pecaRefPrefixo(pedido);
    const restante = ref && ref.startsWith(prefixo + '-') ? ref.slice(prefixo.length + 1) : '';
    const partes = restante.split('-');
    return { prefixo, xxx: partes[0] || '', nn: partes[1] || '' };
  }

  function sugerirSegmentos(prefixo) {
    if (!prefixo || prefixo.includes('????')) return { xxx: '', nn: '' };
    return { xxx: '000', nn: '00' };
  }

  const { prefixo: prefixoInicial, xxx: xxxInicial, nn: nnInicial } = parsearSegmentos(pc?.ref || '', pedidoAssoc);

  const [editMode, setEditMode] = useState(isNew);
  const [pedidoIdSel, setPedidoIdSel] = useState(pedidoIdInicial);
  const [refXxx, setRefXxx] = useState(xxxInicial);
  const [refNn, setRefNn]   = useState(nnInicial);
  const [forma, setForma]   = useState(pc?.forma || '');
  const [dims, setDims]     = useState({ comprimento: pc?.comprimento || '', largura: pc?.largura || '', altura: pc?.altura || '', diametro_ext: pc?.diametro_ext || '', diametro_int: pc?.diametro_int || '' });
  const [mpId, setMpId]     = useState(pc?.materiaPrimaId || '');
  const [form, setForm]     = useState({ plano: pc?.plano || '', denominacao: pc?.denominacao || '', orgao: pc?.orgao || '', parte: pc?.parte || '', nota_descritiva: pc?.nota_descritiva || '', imagem: pc?.imagem || '' });
  const [imgPreview, setImgPreview] = useState(pc?.imagem || '');
  const [lightbox, setLightbox] = useState(null);
  const [saving, setSaving] = useState(false);
  const nnRef = useRef(null);

  const mpSel = materia_prima.find(m => m.id === Number(mpId));
  const pesoEsp = mpSel?.peso_esp || '';

  const pesoCalculado = useMemo(() =>
    calcPeso(forma, dims.comprimento, dims.largura, dims.altura, dims.diametro_ext, dims.diametro_int, pesoEsp),
    [forma, dims, pesoEsp]
  );
  const custoStock = useMemo(() => {
    const pesoKg = parseFloat(pesoCalculado);
    const snap = pc?.precoMpSnapshot;
    return (pesoKg && snap) ? pesoKg * snap : null;
  }, [pesoCalculado, pc]);

  const pedidoSel = pedidos.find(p => p.id === pedidoIdSel);
  const prefixo = pecaRefPrefixo(pedidoSel);

  useEffect(() => {
    if (!isNew) return;
    const sug = sugerirSegmentos(prefixo);
    setRefXxx(sug.xxx);
    setRefNn(sug.nn);
  }, [isNew, prefixo]);

  const ro = !editMode;
  const dimEnabled = campo => editMode && (FORMA_CAMPOS[campo] || []).includes(forma);

  function setDim(name) { return e => setDims(d => ({ ...d, [name]: e.target.value })); }
  function setF(name)   { return e => setForm(f => ({ ...f, [name]: e.target.value })); }

  function onFormaChange(novaForma) {
    setForma(novaForma);
    const newDims = { ...dims };
    Object.keys(FORMA_CAMPOS).forEach(c => { if (!(FORMA_CAMPOS[c] || []).includes(novaForma)) newDims[c] = ''; });
    setDims(newDims);
  }

  function onMpChange(id) {
    setMpId(id);
  }

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { const b64 = ev.target.result; setForm(f => ({ ...f, imagem: b64 })); setImgPreview(b64); };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (isNew || editMode) {
      if (prefixo.includes('????')) { toast.error('Selecione um pedido para gerar a referência.'); return; }
      if (!refXxx.trim()) { toast.error('Preencha o número da peça (campo XXX).'); return; }
      if (!refNn.trim())  { toast.error('Preencha o número da variante (campo NN).'); return; }
    }

    const refFull = editMode
      ? `${prefixo}-${refXxx.padStart(3, '0')}-${refNn.padStart(2, '0')}`
      : (pc?.ref || '');

    const dados = {
      ref: refFull.includes('????') ? undefined : refFull,
      denominacao:     form.denominacao.trim() || undefined,
      plano:           form.plano.trim()       || undefined,
      orgao:           form.orgao.trim()       || undefined,
      parte:           form.parte.trim()       || undefined,
      materia_prima_id: mpId ? Number(mpId) : undefined,
      forma:           forma || undefined,
      comprimento:     parseFloat(dims.comprimento) || undefined,
      largura:         parseFloat(dims.largura)      || undefined,
      altura:          parseFloat(dims.altura)       || undefined,
      diametro_ext:    parseFloat(dims.diametro_ext) || undefined,
      diametro_int:    parseFloat(dims.diametro_int) || undefined,
      nota_descritiva: form.nota_descritiva.trim()  || undefined,
      imagem:          form.imagem || undefined,
      pedido_id:       pedidoIdSel ? Number(pedidoIdSel) : undefined,
    };

    setSaving(true);
    try {
      if (isNew) {
        const novo = await apiPost('/pecas', dados);
        useStore.setState(s => ({ pecas: [...s.pecas, { ...novo, materiaPrimaId: novo.materia_prima_id, precoMpSnapshot: novo.preco_mp_snapshot != null ? Number(novo.preco_mp_snapshot) : null }] }));
        if (fromPedidoId) {
          const pps = await apiFetch('/pecas-pedidos');
          useStore.setState({ pecas_pedidos: pps.map(j => ({ ...j, pecaId: j.peca_id, pedidoId: j.pedido_id })) });
        }
        toast.success('Peça criada com sucesso.');
        if (fromPedidoId) navigate(`/pedidos/${fromPedidoId}`);
        else navigate('/pecas');
      } else {
        const upd = await apiPut(`/pecas/${pecaId}`, dados);
        useStore.setState(s => ({ pecas: s.pecas.map(x => x.id === pecaId ? { ...upd, materiaPrimaId: upd.materia_prima_id, precoMpSnapshot: upd.preco_mp_snapshot != null ? Number(upd.preco_mp_snapshot) : null } : x) }));
        toast.success('Peça gravada com sucesso.');
        setEditMode(false);
      }
    } catch (err) {
      if (err.message?.includes('único') || err.message?.includes('409')) {
        toast.error('Já existe uma peça com esta referência. Altere os campos XXX ou NN.');
      } else {
        toast.error('Erro: ' + err.message);
      }
    }
    finally { setSaving(false); }
  }

  if (!isNew && !pc) return <p style={{ padding: '2rem' }}>Peça não encontrada.</p>;

  const titulo = isNew ? 'Nova Peça' : `Detalhe da Peça: ${pc.ref}`;
  const backPath = fromPedidoId ? `/pedidos/${fromPedidoId}` : '/pecas';
  const backLabel = fromPedidoId ? '↩ Voltar ao Pedido' : '↩ Voltar às Peças';

  return (
    <>
      {lightbox && <Lightbox ref={lightbox.ref} src={lightbox.src} onClose={() => setLightbox(null)} />}
      <div className="section-header">
        <button className="btn btn-ghost-back" onClick={() => navigate(backPath)}>{backLabel}</button>
        <span className="section-count">{titulo}</span>
      </div>

      <div className="full-card" style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
        <div className="form-grid">
          {/* Referência */}
          <div className="form-group">
            <label className="form-label">Referência da Peça</label>
            {editMode ? (
              <div className="ref-input-group">
                <span className="ref-prefix-fixed">{prefixo}-</span>
                <input className="ref-segment-input" maxLength={3} placeholder="000" value={refXxx}
                  onChange={e => { const v = e.target.value.replace(/[^0-9a-zA-Z]/g, ''); setRefXxx(v); if (v.length === 3) nnRef.current?.focus(); }} />
                <span className="ref-sep-fixed">-</span>
                <input ref={nnRef} className="ref-segment-input ref-segment-nn" maxLength={2} placeholder="00" value={refNn}
                  onChange={e => setRefNn(e.target.value.replace(/[^0-9]/g, ''))} />
              </div>
            ) : (
              <input value={pc?.ref || ''} disabled />
            )}
          </div>

          {/* Pedido associado */}
          <div className="form-group">
            <label className="form-label">Pedido Associado</label>
            <select disabled={ro} value={pedidoIdSel || ''} onChange={e => setPedidoIdSel(Number(e.target.value) || null)}>
              <option value="">Selecione...</option>
              {pedidos.map(p => <option key={p.id} value={p.id}>{p.ref}</option>)}
            </select>
          </div>

          <div className="form-group"><label className="form-label">Plano</label><input value={form.plano} onChange={setF('plano')} disabled={ro} /></div>
          <div className="form-group"><label className="form-label">Denominação</label><input value={form.denominacao} onChange={setF('denominacao')} disabled={ro} /></div>
          <div className="form-group"><label className="form-label">Órgão</label><input value={form.orgao} onChange={setF('orgao')} disabled={ro} /></div>
          <div className="form-group"><label className="form-label">Parte</label><input value={form.parte} onChange={setF('parte')} disabled={ro} /></div>

          <div className="form-group">
            <label className="form-label">Material</label>
            <select disabled={ro} value={mpId} onChange={e => onMpChange(e.target.value)}>
              <option value="">Selecione...</option>
              {materia_prima.map(mp => {
                const lbl = mp.ref_wnr && mp.ref_wnr !== '-' ? `${mp.ref_wnr} – ${mp.ref_din}` : mp.ref_din;
                return <option key={mp.id} value={mp.id}>{lbl}</option>;
              })}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Peso Esp. (g/cm³)</label>
            <input value={pesoEsp} disabled style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }} />
          </div>

          {/* Forma */}
          <div className="form-group full">
            <h4 style={{ margin: '1.5rem 0 0.75rem', color: 'var(--color-primary)' }}>Dimensões</h4>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {[['quadrado', 'Quadrado'], ['redondo_macico', 'Redondo maciço'], ['redondo_oco', 'Redondo oco']].map(([val, label]) => {
                const ativo = forma === val;
                return (
                  <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 6, border: ativo ? '2px solid #0f3a65' : '1.5px solid #e2e0d8', background: ativo ? '#e8f0f8' : 'transparent', fontWeight: ativo ? 600 : 400, color: ativo ? '#0f3a65' : 'inherit', cursor: ro ? 'default' : 'pointer' }}>
                    <input type="radio" name="forma" value={val} checked={ativo} disabled={ro} style={{ width: 16, height: 16, flexShrink: 0 }} onChange={() => onFormaChange(val)} />
                    {label}
                  </label>
                );
              })}
            </div>
          </div>

          {[['comprimento', 'Comprimento (mm)'], ['largura', 'Largura (mm)'], ['altura', 'Altura (mm)'], ['diametro_ext', 'Diâmetro Ext. (mm)'], ['diametro_int', 'Diâmetro Int. (mm)']].map(([campo, label]) => (
            <div key={campo} className="form-group">
              <label className="form-label">{label}</label>
              <input type="number" step="0.01" value={dims[campo]} disabled={!dimEnabled(campo)} onChange={setDim(campo)} />
            </div>
          ))}

          <div className="form-group">
            <label className="form-label">Peso da Peça (kg)</label>
            <input value={pesoCalculado !== '' ? `${pesoCalculado} kg` : ''} readOnly style={{ background: '#ddedda', cursor: 'not-allowed' }} />
            {pesoCalculado === '' && forma && <small style={{ color: '#c0392b', marginTop: 4, display: 'block' }}>Preenche as dimensões e o material</small>}
          </div>
          <div className="form-group">
            <label className="form-label">Custo de Stock (€)</label>
            {custoStock != null ? (
              <>
                <input value={formatEuro(custoStock)} readOnly style={{ background: '#ddedda', cursor: 'not-allowed' }} />
                <small style={{ color: 'var(--color-text-muted)', marginTop: 4, display: 'block' }}>Peso × {pc?.precoMpSnapshot?.toFixed(2)} €/kg</small>
              </>
            ) : (
              <>
                <input value="—" readOnly style={{ background: '#ddedda', cursor: 'not-allowed' }} />
                <small style={{ color: 'var(--color-text-muted)', marginTop: 4, display: 'block' }}>Sem preço MP ou peso incalculável</small>
              </>
            )}
          </div>

          <div className="form-group full"><h4 style={{ margin: '1.5rem 0 0.5rem', color: 'var(--color-primary)' }}>Notas e Imagem</h4></div>
          <div className="form-group full">
            <label className="form-label">Nota Descritiva</label>
            <textarea rows={3} style={{ width: '100%', resize: 'vertical' }} disabled={ro} value={form.nota_descritiva} onChange={setF('nota_descritiva')} />
          </div>
          <div className="form-group">
            <label className="form-label">Imagem (.png)</label>
            <input type="file" accept=".png" disabled={ro} onChange={handleImageUpload} />
          </div>
          <div className="form-group">
            <label className="form-label">Pré-visualização</label>
            <div style={{ width: '100%', height: 200, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-alt)', overflow: 'hidden', cursor: imgPreview ? 'zoom-in' : 'default' }}
              onClick={() => imgPreview && setLightbox({ ref: pc?.ref || 'Peça', src: imgPreview })}>
              {imgPreview ? <img src={imgPreview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Sem imagem</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: '2rem' }}>
          <button className="btn" onClick={() => navigate(backPath)}>Cancelar</button>
          {isNew
            ? <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'A criar…' : 'Criar Peça'}</button>
            : !editMode
              ? <button className="btn btn-primary" onClick={() => setEditMode(true)}>Editar</button>
              : <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'A guardar…' : 'Guardar alterações'}</button>
          }
        </div>
      </div>

      {!isNew && <PlanoProcessos pecaId={pecaId} />}
    </>
  );
}

/* ---------- Lista ---------- */
function PecasList() {
  const pecas       = useStore(s => s.pecas);
  const navigate    = useNavigate();
  const [page, setPage]     = useState(1);
  const [lightbox, setLightbox] = useState(null);

  const lista = [...pecas].reverse();
  const totalPages = Math.max(1, Math.ceil(lista.length / PER_PAGE));
  const p = Math.min(page, totalPages);
  const paginadas = lista.slice((p - 1) * PER_PAGE, p * PER_PAGE);

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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, padding: '12px 0 4px' }}>
        <button className="btn btn-ghost btn-sm" disabled={p === 1} onClick={() => setPage(p - 1)}>‹</button>
        {pages}
        <button className="btn btn-ghost btn-sm" disabled={p === totalPages} onClick={() => setPage(p + 1)}>›</button>
      </div>
    );
  }

  return (
    <>
      {lightbox && <Lightbox ref={lightbox.ref} src={lightbox.src} onClose={() => setLightbox(null)} />}
      <div className="section-header">
        <span className="section-count">{pecas.length} peças</span>
        {totalPages > 1 && <Paginacao />}
        <button className="btn btn-primary" onClick={() => navigate('/pecas/novo')}>+ Nova Peça</button>
      </div>
      <div className="full-card">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 120 }}>Ref.</th>
              <th style={{ width: 120 }}>Plano</th>
              <th style={{ width: 160 }}>Denominação</th>
              <th style={{ width: 160 }}>Material</th>
              <th style={{ width: 60 }}>Imagem</th>
              <th style={{ width: 80 }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {paginadas.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>Sem peças registadas.</td></tr>
            ) : paginadas.map(pc => (
              <tr key={pc.id} style={{ height: 60 }}>
                <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pc.ref}</td>
                <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pc.plano || '-'}</td>
                <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pc.denominacao || '-'}</td>
                <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resolverMaterial(pc.materiaPrimaId)}</td>
                <td style={{ textAlign: 'center' }}>
                  {pc.imagem
                    ? <img src={pc.imagem} alt={pc.ref} style={{ width: 44, height: 44, objectFit: 'contain', cursor: 'zoom-in', borderRadius: 4, border: '1px solid var(--color-border)', display: 'block', margin: '0 auto' }} onClick={() => setLightbox({ ref: pc.ref, src: pc.imagem })} />
                    : <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>—</span>}
                </td>
                <td style={{ display: 'flex', gap: 4, alignItems: 'center', height: 60 }}>
                  <button className="btn btn-ghost btn-sm" title="Ver / editar" onClick={() => navigate(`/pecas/${pc.id}`)}><IconEdit /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ---------- Raiz ---------- */
export default function Pecas() {
  const { id } = useParams();
  if (id) return <PecaDetalhe pecaId={id === 'novo' ? null : id} />;
  return <PecasList />;
}
