import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useStore from '../store';
import { apiPost, apiPut, apiPatch, apiDelete, apiFetch } from '../lib/api';
import { toast } from '../lib/toast';
import { formatEuro, today, padNum, resolveCliente, getDadosPedido } from '../lib/helpers';
import { calcPeso, resolverMaterial } from '../lib/pecaUtils';
import { EstadoBadge, TipoBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Overlay } from '../components/ui/Overlay';

const PER_PAGE = 15;
const FILTER_STYLE = { width: '100%', boxSizing: 'border-box', fontSize: 12, padding: '5px 8px', border: '1.5px solid var(--color-primary)', borderRadius: 6, background: '#f0f5fa', color: 'var(--color-primary)', outline: 'none', height: 28 };

/* ---------- Ícones ---------- */
const IconView = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconOT = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z"/>
  </svg>
);

/* ---------- Overlay pesquisa de peças ---------- */
function PesquisaPecasOverlay({ pedidoId, onClose, onAssociar }) {
  const pecas         = useStore(s => s.pecas);
  const pecas_pedidos = useStore(s => s.pecas_pedidos);
  const pedidos       = useStore(s => s.pedidos);
  const [filtro, setFiltro] = useState('');

  const disponiveis = pecas.filter(pc => {
    if (pecas_pedidos.some(pp => pp.pecaId === pc.id && pp.pedidoId === pedidoId)) return false;
    if (!filtro) return true;
    return (pc.ref || '').toLowerCase().includes(filtro.toLowerCase())
        || (pc.denominacao || '').toLowerCase().includes(filtro.toLowerCase())
        || (pc.plano || '').toLowerCase().includes(filtro.toLowerCase());
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', width: '100%', maxWidth: 700, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Pesquisar Peças</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>
        <input autoFocus placeholder="Filtrar por ref., denominação ou plano…" value={filtro} onChange={e => setFiltro(e.target.value)} style={{ marginBottom: '1rem' }} />
        <div style={{ overflow: 'auto', flex: 1 }}>
          {disponiveis.length === 0
            ? <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem 0' }}>Sem peças disponíveis.</p>
            : (
              <table className="table" style={{ fontSize: 12 }}>
                <thead><tr><th>Ref.</th><th>Denominação</th><th>Plano</th><th>Origem</th><th></th></tr></thead>
                <tbody>
                  {disponiveis.map(pc => {
                    const origem = pedidos.find(p => pecas_pedidos.some(pp => pp.pecaId === pc.id && pp.pedidoId === p.id));
                    return (
                      <tr key={pc.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>{pc.ref || '-'}</td>
                        <td>{pc.denominacao || '-'}</td>
                        <td>{pc.plano || '-'}</td>
                        <td>{origem ? <span className="badge badge-blue">{origem.ref}</span> : '-'}</td>
                        <td><button className="btn btn-primary btn-sm" onClick={() => onAssociar(pc.id)}>Associar</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Overlay adicionar serviço ---------- */
function AdicionarServicoOverlay({ pedidoId, onClose, onAdicionado }) {
  const servicos    = useStore(s => s.servicos);
  const fornecedores = useStore(s => s.fornecedores);
  const [svId, setSvId] = useState('');
  const [novoRef, setNovoRef]   = useState('');
  const [novoTipo, setNovoTipo] = useState('');
  const [novoDesc, setNovoDesc] = useState('');
  const [novoUnidade, setNovoUnidade] = useState('und');
  const [qty, setQty]     = useState('1');
  const [preco, setPreco] = useState('0');
  const [fornId, setFornId] = useState('');
  const [saving, setSaving] = useState(false);

  async function confirmar() {
    const quantidade = parseFloat(qty) || 1;
    const precoUnitario = parseFloat(preco) || 0;
    let servicoId = Number(svId) || 0;
    setSaving(true);
    try {
      if (!servicoId) {
        if (!novoRef.trim() || !novoTipo.trim()) { toast.error('Preencha a Referência e o Tipo de Serviço.'); return; }
        const novo = await apiPost('/servicos', { ref: novoRef.trim(), tipo_servico: novoTipo.trim(), descricao: novoDesc.trim() || undefined, unidade: novoUnidade });
        servicoId = novo.id;
        useStore.setState(s => ({ servicos: [...s.servicos, novo] }));
      }
      const sp = await apiPost('/servicos-pedidos', { servico_id: servicoId, pedido_id: pedidoId, quantidade, preco_unitario: precoUnitario, fornecedor_id: fornId ? Number(fornId) : null });
      useStore.setState(s => ({ servicos_pedidos: [...s.servicos_pedidos, { ...sp, servicoId: sp.servico_id, pedidoId: sp.pedido_id, fornecedorId: sp.fornecedor_id, quantidade: Number(sp.quantidade), precoUnitario: Number(sp.preco_unitario) }] }));
      onAdicionado();
      onClose();
      toast.success('Serviço adicionado.');
    } catch (err) { toast.error('Erro: ' + err.message); }
    finally { setSaving(false); }
  }

  const temServicos = servicos.length > 0;
  const novoDisabled = !!svId;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', width: '100%', maxWidth: 480, boxShadow: '0 8px 32px rgba(0,0,0,.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Adicionar Serviço</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {temServicos && (
            <>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, margin: '0 0 8px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Selecionar existente</p>
                <div className="form-group">
                  <label className="form-label">Serviço</label>
                  <select style={{ width: '100%' }} value={svId} onChange={e => setSvId(e.target.value)}>
                    <option value="">Selecione...</option>
                    {servicos.map(s => <option key={s.id} value={s.id}>{s.ref} — {s.tipo_servico}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-text-muted)' }}>— ou —</div>
            </>
          )}
          <div style={{ opacity: novoDisabled ? 0.4 : 1 }}>
            <p style={{ fontSize: 12, fontWeight: 600, margin: '0 0 8px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Criar novo serviço</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div className="form-group" style={{ flex: 1 }}><label className="form-label">Referência</label><input disabled={novoDisabled} placeholder="Ex: SV-001" value={novoRef} onChange={e => setNovoRef(e.target.value)} /></div>
                <div className="form-group" style={{ flex: 1 }}><label className="form-label">Unidade</label>
                  <select disabled={novoDisabled} value={novoUnidade} onChange={e => setNovoUnidade(e.target.value)}>
                    <option value="und">und</option><option value="H">H</option><option value="kg">kg</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Tipo de Serviço</label><input disabled={novoDisabled} placeholder="Ex: Maquinagem CNC" value={novoTipo} onChange={e => setNovoTipo(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Descrição</label><input disabled={novoDisabled} placeholder="Descrição opcional" value={novoDesc} onChange={e => setNovoDesc(e.target.value)} /></div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 600, margin: '0 0 8px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Quantidade, preço e fornecedor</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="form-group" style={{ flex: 1 }}><label className="form-label">Quantidade</label><input type="number" step="0.01" min="0.01" value={qty} onChange={e => setQty(e.target.value)} /></div>
              <div className="form-group" style={{ flex: 1 }}><label className="form-label">Preço Unit. (€)</label><input type="number" step="0.01" min="0" value={preco} onChange={e => setPreco(e.target.value)} /></div>
            </div>
            <div className="form-group" style={{ marginTop: 8 }}>
              <label className="form-label">Fornecedor</label>
              <select style={{ width: '100%' }} value={fornId} onChange={e => setFornId(e.target.value)}>
                <option value="">DM</option>
                {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={confirmar} disabled={saving}>{saving ? 'A adicionar…' : 'Adicionar'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Lista ---------- */
function PedidosList() {
  const pedidos         = useStore(s => s.pedidos);
  const dados_pedido    = useStore(s => s.dados_pedido);
  const orcamentos      = useStore(s => s.orcamentos);
  const ordens          = useStore(s => s.ordens);
  const navigate        = useNavigate();

  const [page, setPage]     = useState(1);
  const [filtros, setFiltros] = useState({ ref: '', descricao: '', orcamento: '', ordemCompra: '' });

  const pedidosFiltrados = useMemo(() => {
    const { ref, descricao, orcamento, ordemCompra } = filtros;
    if (!ref && !descricao && !orcamento && !ordemCompra) return pedidos;
    return pedidos.filter(p => {
      const dp = dados_pedido.find(d => d.id === p.dadosPedidoId) || {};
      const orc = orcamentos.find(o => o.pedidoId === p.id && o.ativo && o.estado === 'Aprovado')
               || orcamentos.find(o => o.pedidoId === p.id && o.ativo);
      if (ref && !(p.ref || '').toLowerCase().includes(ref.toLowerCase())) return false;
      if (descricao && !(dp.breveDescricao || '').toLowerCase().includes(descricao.toLowerCase())) return false;
      if (orcamento && !(orc?.ref || '').toLowerCase().includes(orcamento.toLowerCase())) return false;
      if (ordemCompra && !(dp.ordem_compra || '').toLowerCase().includes(ordemCompra.toLowerCase())) return false;
      return true;
    });
  }, [pedidos, dados_pedido, orcamentos, filtros]);

  const totalPages = Math.max(1, Math.ceil(pedidosFiltrados.length / PER_PAGE));
  const p = Math.min(page, totalPages);
  const paginados = pedidosFiltrados.slice((p - 1) * PER_PAGE, p * PER_PAGE);

  function filtrar(campo, valor) {
    setFiltros(f => ({ ...f, [campo]: valor }));
    setPage(1);
  }

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

  async function criarOT(pedidoId) {
    const n = ordens.length + 1;
    const ano = new Date().getFullYear().toString().slice(-2);
    try {
      await apiPost('/ordens', { num: `OT${ano}-${padNum(n, 4)}`, pedido_id: pedidoId, estado: 'Em curso', mo_obra: 100 });
      await apiPut(`/pedidos/${pedidoId}`, { estado_pedido: 'Produção' });
      await useStore.getState().carregarDados();
      toast.success('Ordem de trabalho criada.');
    } catch (err) { toast.error('Erro ao criar OT: ' + err.message); }
  }

  return (
    <>
      <div className="section-header">
        <span className="section-count">{pedidosFiltrados.length} pedidos</span>
        <span id="pedidos-paginacao"><Paginacao /></span>
        <button className="btn btn-primary" onClick={() => navigate('/pedidos/novo')}>+ Novo pedido</button>
      </div>
      <div className="full-card">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 90 }}>Ref.</th><th>Cliente</th><th>Breve Descrição</th>
              <th>Nº Orçamento</th><th>Custo Líquido</th><th style={{ width: 140, whiteSpace: 'nowrap' }}>Ordem de Compra</th>
              <th>Ação</th><th style={{ width: 90 }}>Estado</th>
            </tr>
            <tr>
              <th><input style={FILTER_STYLE} type="text" placeholder="filtrar…" value={filtros.ref} onChange={e => filtrar('ref', e.target.value)} /></th>
              <th></th>
              <th><input style={FILTER_STYLE} type="text" placeholder="filtrar…" value={filtros.descricao} onChange={e => filtrar('descricao', e.target.value)} /></th>
              <th><input style={FILTER_STYLE} type="text" placeholder="filtrar…" value={filtros.orcamento} onChange={e => filtrar('orcamento', e.target.value)} /></th>
              <th></th>
              <th><input style={FILTER_STYLE} type="text" placeholder="filtrar…" value={filtros.ordemCompra} onChange={e => filtrar('ordemCompra', e.target.value)} /></th>
              <th></th><th></th>
            </tr>
          </thead>
          <tbody>
            {paginados.map(p => {
              const cl = resolveCliente(p.clienteTipo, p.clienteId);
              const dp = getDadosPedido(p.dadosPedidoId);
              const ot = ordens.find(o => o.pedidoId === p.id);
              const orcAprovado = orcamentos.find(o => o.pedidoId === p.id && o.ativo && o.estado === 'Aprovado');
              const canOT = ['Orçamentar', 'Produção', 'Pendente'].includes(p.estado_pedido);
              const label = p.clienteTipo === 'particular'
                ? <div style={{ lineHeight: 1.2 }}><div>{cl.nome}</div><div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Particular</div></div>
                : <div style={{ lineHeight: 1.2 }}><div>{cl.subtexto}</div><div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{cl.nome}</div></div>;
              return (
                <tr key={p.id}>
                  <td>{p.ref}</td>
                  <td><span className="inline-flex"><Avatar name={cl.nome} cls={cl.avClass} small />{label}</span></td>
                  <td>{dp.breveDescricao || '-'}</td>
                  <td>{orcAprovado ? orcAprovado.ref : '-'}</td>
                  <td>{orcAprovado?.valor ? formatEuro(orcAprovado.valor) : '-'}</td>
                  <td>{dp.ordem_compra || '-'}</td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" title="Ver pedido" onClick={() => navigate(`/pedidos/${p.id}`)}><IconView /></button>
                      {ot
                        ? <Link to={`/ordens/${ot.id}`} className="badge badge-blue" style={{ textDecoration: 'none', cursor: 'pointer' }}>{ot.num}</Link>
                        : canOT
                          ? <button className="btn btn-ghost btn-sm" title="Criar OT" onClick={() => criarOT(p.id)}><IconOT /></button>
                          : null}
                    </div>
                  </td>
                  <td><EstadoBadge estado={p.estado_pedido} /></td>
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
function PedidoDetalhe({ pedidoId: rawId }) {
  const navigate = useNavigate();
  const isNew  = !rawId;
  const pedidoId = isNew ? null : Number(rawId);

  const pedidos          = useStore(s => s.pedidos);
  const dados_pedido     = useStore(s => s.dados_pedido);
  const orcamentos       = useStore(s => s.orcamentos);
  const orcamento_itens  = useStore(s => s.orcamento_itens);
  const ordens           = useStore(s => s.ordens);
  const pecas            = useStore(s => s.pecas);
  const pecas_pedidos    = useStore(s => s.pecas_pedidos);
  const servicos         = useStore(s => s.servicos);
  const servicos_pedidos = useStore(s => s.servicos_pedidos);
  const notas_pedido     = useStore(s => s.notas_pedido);
  const colaboradores_dm = useStore(s => s.colaboradores_dm);
  const empresas         = useStore(s => s.empresas);
  const colaboradores    = useStore(s => s.colaboradores);
  const particulares     = useStore(s => s.particulares);
  const fornecedores     = useStore(s => s.fornecedores);
  const materia_prima    = useStore(s => s.materia_prima);

  const p  = isNew ? null : pedidos.find(x => x.id === pedidoId);
  const dp = isNew ? {} : getDadosPedido(p?.dadosPedidoId);
  const ot = isNew ? null : ordens.find(o => o.pedidoId === pedidoId);
  const orcList = isNew ? [] : orcamentos.filter(o => o.pedidoId === pedidoId);
  const orcAprovado = orcList.find(o => o.ativo && o.estado === 'Aprovado');
  const pecasList = isNew ? [] : pecas.filter(pc => pecas_pedidos.some(pp => pp.pecaId === pc.id && pp.pedidoId === pedidoId));
  const spList = isNew ? [] : servicos_pedidos.filter(sp => sp.pedidoId === pedidoId);
  const notasList = isNew ? [] : notas_pedido.filter(n => n.pedidoId === pedidoId);

  const [editMode, setEditMode] = useState(isNew);
  const [saving, setSaving]     = useState(false);

  // Client selection state
  const initColab = p?.clienteTipo === 'colaborador' ? colaboradores.find(c => c.id === p.clienteId) : null;
  const initPart  = p?.clienteTipo === 'particular'  ? particulares.find(pt => pt.id === p.clienteId) : null;
  const initEmpId = initColab ? initColab.empresaId : (empresas[0]?.id || null);
  const isParticular = !!initPart;

  const [empOuPartKey, setEmpOuPartKey] = useState(isNew ? (empresas[0] ? `emp:${empresas[0].id}` : '') : (initPart ? `part:${initPart.id}` : `emp:${initEmpId}`));
  const [colabId, setColabId] = useState(() => {
    if (isNew) {
      const primEmp = empresas[0];
      const colabs = primEmp ? colaboradores.filter(c => c.empresaId === primEmp.id) : [];
      return colabs[0]?.id || null;
    }
    return initColab?.id || null;
  });

  // Pedido form
  const [estado, setEstado]         = useState(p?.estado_pedido || 'Orçamentar');
  const [data, setData]             = useState(p?.data || today());
  const [tipoContacto, setTipoContacto] = useState(dp.tipo_contacto || '');
  const [ordemCompra, setOrdemCompra]   = useState(dp.ordem_compra || '');
  const [dataRececaoOC, setDataRececaoOC] = useState(dp.data_rececao_oc || '');
  const [dpRef, setDpRef]           = useState(dp.ref || '');
  const [equipamento, setEquipamento] = useState(dp.equipamento || '');
  const [orgao, setOrgao]           = useState(dp.orgao || '');
  const [parte, setParte]           = useState(dp.parte || '');
  const [breveDescricao, setBreveDescricao] = useState(dp.breveDescricao || '');
  const [imagem, setImagem]         = useState(dp.imagem || '');
  const [imgPreview, setImgPreview] = useState(dp.imagem || '');

  // Overlays
  const [pesquisaPecasOpen, setPesquisaPecasOpen] = useState(false);
  const [adicionarSvOpen, setAdicionarSvOpen] = useState(false);

  // Notas
  const [notaCriadoPor, setNotaCriadoPor] = useState('');
  const [notaTexto, setNotaTexto]         = useState('');

  // historico_precos (carregado à mão)
  const [historico, setHistorico] = useState([]);
  useEffect(() => {
    if (!pedidoId) return;
    apiFetch(`/historico-precos/pedido/${pedidoId}`).then(setHistorico).catch(() => setHistorico([]));
  }, [pedidoId]);

  if (!isNew && !p) return <p style={{ padding: '2rem' }}>Pedido não encontrado.</p>;

  const isCancelado = !isNew && ['Cancelado', 'Concluido'].includes(p.estado_pedido) && !editMode;
  const ro = !editMode;

  // Client key computation
  const clienteKey = useMemo(() => {
    if (empOuPartKey.startsWith('part:')) return empOuPartKey;
    return colabId ? `colab:${colabId}` : '';
  }, [empOuPartKey, colabId]);

  const colabsDaEmpresa = useMemo(() => {
    if (!empOuPartKey.startsWith('emp:')) return [];
    const empId = Number(empOuPartKey.split(':')[1]);
    return colaboradores.filter(c => c.empresaId === empId);
  }, [empOuPartKey, colaboradores]);

  function handleEmpOuPartChange(val) {
    setEmpOuPartKey(val);
    if (val.startsWith('emp:')) {
      const empId = Number(val.split(':')[1]);
      const colabs = colaboradores.filter(c => c.empresaId === empId);
      setColabId(colabs[0]?.id || null);
    } else {
      setColabId(null);
    }
  }

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { const b64 = ev.target.result; setImagem(b64); setImgPreview(b64); };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!clienteKey) { toast.error('Selecione um cliente antes de guardar.'); return; }
    const [tipo, idStr] = clienteKey.split(':');
    const clienteTipo = tipo === 'colab' ? 'colaborador' : 'particular';
    const clienteId   = parseInt(idStr);

    const dpPayload = {
      ref:             dpRef.trim() || null,
      equipamento:     equipamento || null,
      orgao:           orgao || null,
      parte:           parte || null,
      breve_descricao: breveDescricao || null,
      imagem:          imagem || null,
      tipo_contacto:   tipoContacto || null,
      ordem_compra:    ordemCompra || null,
      data_rececao_oc: dataRececaoOC || null,
    };

    setSaving(true);
    try {
      let dadosPedidoId;
      if (!isNew) {
        dadosPedidoId = p.dadosPedidoId;
        await apiPut(`/dados-pedido/${dadosPedidoId}`, dpPayload);
      } else {
        const newDp = await apiPost('/dados-pedido', dpPayload);
        dadosPedidoId = newDp.id;
      }

      const anoAtual = new Date().getFullYear().toString().slice(-2);
      if (isNew) {
        const n = pedidos.length + 1;
        await apiPost('/pedidos', {
          ref: `PT${anoAtual}-${padNum(n, 4)}`,
          cliente_tipo: clienteTipo,
          colaborador_id: clienteTipo === 'colaborador' ? clienteId : undefined,
          particular_id:  clienteTipo === 'particular'  ? clienteId : undefined,
          dados_pedido_id: dadosPedidoId,
          estado_pedido: estado,
          data_pedido: data || today(),
        });
      } else {
        await apiPut(`/pedidos/${pedidoId}`, {
          cliente_tipo: clienteTipo,
          colaborador_id: clienteTipo === 'colaborador' ? clienteId : null,
          particular_id:  clienteTipo === 'particular'  ? clienteId : null,
          dados_pedido_id: dadosPedidoId,
          estado_pedido: estado,
          data_pedido: data || today(),
        });
      }

      await useStore.getState().carregarDados();
      toast.success('Pedido gravado com sucesso.');
      navigate('/pedidos');
    } catch (err) { toast.error('Erro ao guardar pedido: ' + err.message); }
    finally { setSaving(false); }
  }

  async function associarPeca(pecaId) {
    try {
      const pp = await apiPost('/pecas-pedidos', { peca_id: pecaId, pedido_id: pedidoId });
      useStore.setState(s => ({ pecas_pedidos: [...s.pecas_pedidos, { ...pp, pecaId: pp.peca_id, pedidoId: pp.pedido_id }] }));
      toast.success('Peça associada ao pedido.');
    } catch (err) { toast.error('Erro: ' + err.message); }
  }

  async function removerPeca(pecaId) {
    const pp = pecas_pedidos.find(x => x.pecaId === pecaId && x.pedidoId === pedidoId);
    if (!pp) return;
    try {
      await apiDelete(`/pecas-pedidos/${pp.id}`);
      useStore.setState(s => ({ pecas_pedidos: s.pecas_pedidos.filter(x => x.id !== pp.id) }));
      toast.success('Peça removida.');
    } catch (err) { toast.error('Erro: ' + err.message); }
  }

  async function removerServico(spId) {
    try {
      await apiDelete(`/servicos-pedidos/${spId}`);
      useStore.setState(s => ({ servicos_pedidos: s.servicos_pedidos.filter(x => x.id !== spId) }));
      toast.success('Serviço removido.');
    } catch (err) { toast.error('Erro: ' + err.message); }
  }

  async function guardarSpCampo(spId, campo, valor) {
    try {
      const upd = await apiPut(`/servicos-pedidos/${spId}`, { [campo]: parseFloat(valor) });
      useStore.setState(s => ({ servicos_pedidos: s.servicos_pedidos.map(x => x.id === spId ? { ...x, quantidade: Number(upd.quantidade), precoUnitario: Number(upd.preco_unitario) } : x) }));
    } catch (err) { toast.error('Erro: ' + err.message); }
  }

  async function guardarSpFornecedor(spId, fornId) {
    try {
      await apiPut(`/servicos-pedidos/${spId}`, { fornecedor_id: fornId ? Number(fornId) : null });
      useStore.setState(s => ({ servicos_pedidos: s.servicos_pedidos.map(x => x.id === spId ? { ...x, fornecedorId: fornId ? Number(fornId) : null } : x) }));
    } catch (err) { toast.error('Erro: ' + err.message); }
  }

  async function adicionarNota() {
    if (!notaCriadoPor) { toast.error('Selecione quem cria a nota.'); return; }
    if (!notaTexto.trim()) { toast.error('Escreva o texto da nota.'); return; }
    try {
      const nova = await apiPost('/notas-pedido', { pedido_id: pedidoId, colaborador_dm_id: Number(notaCriadoPor), nota: notaTexto.trim() });
      const dt = new Date(nova.criado_em);
      const mapped = { ...nova, pedidoId: nova.pedido_id, criadoPorId: nova.colaborador_dm_id, dataHora: `${dt.toLocaleDateString('pt-PT')} ${dt.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}` };
      useStore.setState(s => ({ notas_pedido: [...s.notas_pedido, mapped] }));
      setNotaTexto(''); setNotaCriadoPor('');
      toast.success('Nota adicionada.');
    } catch (err) { toast.error('Erro: ' + err.message); }
  }

  async function apagarNota(notaId) {
    if (!confirm('Apagar esta nota?')) return;
    try {
      await apiDelete(`/notas-pedido/${notaId}`);
      useStore.setState(s => ({ notas_pedido: s.notas_pedido.filter(n => n.id !== notaId) }));
      toast.success('Nota apagada.');
    } catch (err) { toast.error('Erro: ' + err.message); }
  }

  const refAuto = `PT${new Date().getFullYear().toString().slice(-2)}-${padNum(pedidos.length + 1, 4)}`;
  const titulo = isNew ? 'Novo Pedido' : `Detalhe do Pedido: ${p.ref}`;

  return (
    <>
      {pesquisaPecasOpen && (
        <PesquisaPecasOverlay
          pedidoId={pedidoId}
          onClose={() => setPesquisaPecasOpen(false)}
          onAssociar={associarPeca}
        />
      )}
      {adicionarSvOpen && (
        <AdicionarServicoOverlay
          pedidoId={pedidoId}
          onClose={() => setAdicionarSvOpen(false)}
          onAdicionado={() => {}}
        />
      )}

      <div className="section-header">
        <button className="btn btn-ghost-back" onClick={() => navigate('/pedidos')}>↩ Voltar aos Pedidos</button>
        <span className="section-count" style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-primary)' }}>{titulo}</span>
      </div>

      <div className="full-card" style={{ padding: '2rem' }}>
        <div className="form-grid">
          {/* Linha 1: ref, datas, OT, estado */}
          <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'row', gap: 16 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label className="form-label">Referência do Pedido</label>
              <input value={isNew ? refAuto : p.ref} readOnly style={{ background: '#ddedda', cursor: 'not-allowed', height: 30 }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label className="form-label">Data de Criação PT</label>
              <input type="date" value={data} readOnly style={{ background: '#ddedda', cursor: 'not-allowed', height: 30 }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label className="form-label">Ordem de Trabalho</label>
              {ot
                ? <div style={{ height: 30, display: 'flex', alignItems: 'center', background: '#ddedda', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '0 8px' }}>
                    <Link to={`/ordens/${ot.id}`} style={{ fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'underline' }}>{ot.num}</Link>
                  </div>
                : <input value="" readOnly style={{ background: '#ddedda', cursor: 'not-allowed', height: 30 }} />
              }
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label className="form-label">Estado do Pedido</label>
              <select disabled={ro} value={estado} onChange={e => setEstado(e.target.value)} style={{ height: 30 }}>
                {['Orçamentar', 'Pendente', 'Produção', 'Concluido', 'Cancelado'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Linha 2: OC + botões */}
          <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: 16 }}>
            <div className="form-group" style={{ flex: '0 0 auto' }}>
              <label className="form-label">Ordem de Compra</label>
              <input disabled={ro} value={ordemCompra} onChange={e => { setOrdemCompra(e.target.value); if (!e.target.value.trim()) setDataRececaoOC(''); }} />
            </div>
            <div className="form-group" style={{ flex: '0 0 auto' }}>
              <label className="form-label">Data de Receção OC</label>
              <input type="date" disabled={ro || !ordemCompra.trim()} value={dataRececaoOC} onChange={e => setDataRececaoOC(e.target.value)} />
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <button className="btn" style={{ width: 120 }} onClick={() => navigate('/pedidos')}>Cancelar</button>
              {isNew
                ? <button className="btn btn-primary" style={{ width: 120 }} onClick={handleSave} disabled={saving}>{saving ? 'A criar…' : 'Criar Pedido'}</button>
                : !editMode
                  ? <button className="btn btn-primary" style={{ width: 120 }} onClick={() => setEditMode(true)}>Editar</button>
                  : <button className="btn btn-primary" style={{ width: 120 }} onClick={handleSave} disabled={saving}>{saving ? 'A guardar…' : 'Guardar alterações'}</button>
              }
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="form-group full"><h4 style={{ margin: '1.5rem 0 0.25rem', color: 'var(--color-primary)' }}>Dados do Cliente</h4><hr style={{ border: 'none', borderTop: '2px solid var(--color-primary)', margin: '0 0 0.5rem' }} /></div>
          <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: 16 }}>
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Solicitado por</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select disabled={ro} style={{ flex: 1 }} value={empOuPartKey} onChange={e => handleEmpOuPartChange(e.target.value)}>
                  <optgroup label="Empresas">
                    {empresas.map(e => <option key={e.id} value={`emp:${e.id}`}>{e.nome}</option>)}
                  </optgroup>
                  <optgroup label="Particulares">
                    {particulares.map(pt => <option key={pt.id} value={`part:${pt.id}`}>{pt.nome}</option>)}
                  </optgroup>
                </select>
                {empOuPartKey.startsWith('emp:') && (
                  <select disabled={ro} style={{ flex: 1 }} value={colabId || ''} onChange={e => setColabId(Number(e.target.value) || null)}>
                    {colabsDaEmpresa.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                )}
              </div>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Tipo de Contacto</label>
              <select disabled={ro} value={tipoContacto} onChange={e => setTipoContacto(e.target.value)}>
                <option value="">Selecione...</option>
                <option value="Instalações Cliente">Instalações Cliente</option>
                <option value="Instalações DM">Instalações DM</option>
                <option value="E-mail">E-mail</option>
              </select>
            </div>
          </div>

          {/* Dados do Equipamento */}
          <div className="form-group full"><h4 style={{ margin: '1.5rem 0 0.25rem', color: 'var(--color-primary)' }}>Dados do Equipamento / Peça</h4><hr style={{ border: 'none', borderTop: '2px solid var(--color-primary)', margin: '0 0 0.5rem' }} /></div>
          <div className="form-group"><label className="form-label">Ref. Equipamento</label><input disabled={ro} value={dpRef} onChange={e => setDpRef(e.target.value)} placeholder="Ex: DP-005" /></div>
          <div className="form-group"><label className="form-label">Equipamento</label><input disabled={ro} value={equipamento} onChange={e => setEquipamento(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Órgão</label><input disabled={ro} value={orgao} onChange={e => setOrgao(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Parte</label><input disabled={ro} value={parte} onChange={e => setParte(e.target.value)} /></div>
          <div className="form-group full"><label className="form-label">Breve Descrição</label><input disabled={ro} value={breveDescricao} onChange={e => setBreveDescricao(e.target.value)} /></div>
          <div className="form-group">
            <label className="form-label">Imagem (.png)</label>
            <input type="file" accept=".png" disabled={ro} onChange={handleImageUpload} />
          </div>
          <div className="form-group">
            <label className="form-label">Pré-visualização</label>
            <div style={{ width: '100%', height: 200, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-alt)', overflow: 'hidden' }}>
              {imgPreview ? <img src={imgPreview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Sem imagem</span>}
            </div>
          </div>

          {/* Peças */}
          {!isNew && (
            <>
              <div className="form-group full"><h4 style={{ margin: '1.5rem 0 0.25rem', color: 'var(--color-primary)' }}>Peças</h4><hr style={{ border: 'none', borderTop: '2px solid var(--color-primary)', margin: '0 0 0.5rem' }} /></div>
              <div style={{ gridColumn: '1/-1', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <button className="btn btn-primary" disabled={isCancelado || ro} onClick={() => navigate(`/pecas/novo`, { state: { fromPedidoId: pedidoId } })}>+ Nova Peça</button>
                <button className="btn" disabled={isCancelado || ro} onClick={() => setPesquisaPecasOpen(true)}>Pesquisar peças</button>
              </div>
              {pecasList.length > 0 && (
                <div className="form-group full">
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>Peças associadas ({pecasList.length})</p>
                  <table className="table" style={{ fontSize: 12, tableLayout: 'fixed', width: '100%' }}>
                    <thead><tr>
                      <th style={{ width: 100 }}>Ref.</th><th style={{ width: 130 }}>Plano</th>
                      <th style={{ width: 160 }}>Denominação</th><th style={{ width: 100 }}>Material</th>
                      <th style={{ width: 160 }}>Dimensões (mm)</th><th style={{ width: 70 }}>Peso (kg)</th>
                      <th style={{ width: 160 }}>Fornecedor</th><th style={{ width: 100 }}>Preço Compra (€)</th>
                      <th style={{ width: 80 }}>Ação</th>
                    </tr></thead>
                    <tbody>
                      {pecasList.map(pc => {
                        const hist = historico.find(h => h.peca_id === pc.id && h.pedido_id === pedidoId);
                        const mp   = materia_prima.find(m => m.id === pc.materiaPrimaId);
                        const peso = calcPeso(pc.forma, pc.comprimento, pc.largura, pc.altura, pc.diametro_ext, pc.diametro_int, mp?.peso_esp);
                        const dimParts = [];
                        if (pc.comprimento) dimParts.push(`C:${pc.comprimento}`);
                        if (pc.largura)     dimParts.push(`L:${pc.largura}`);
                        if (pc.diametro_ext) dimParts.push(`∅ext:${pc.diametro_ext}`);
                        if (pc.diametro_int) dimParts.push(`∅int:${pc.diametro_int}`);
                        const emOrcamento = orcamento_itens.some(item => item.pecaId === pc.id && orcamentos.some(o => o.id === item.orcamentoId && o.pedidoId === pedidoId));
                        return (
                          <tr key={pc.id}>
                            <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <Link to={`/pecas/${pc.id}`} style={{ color: 'var(--color-primary)' }}>{pc.ref}</Link>
                            </td>
                            <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pc.plano || '-'}</td>
                            <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pc.denominacao || '-'}</td>
                            <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resolverMaterial(pc.materiaPrimaId)}</td>
                            <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dimParts.join(' · ') || '—'}</td>
                            <td>{peso || '—'}</td>
                            <td>
                              <select style={{ fontSize: 11, width: '100%', boxSizing: 'border-box' }} disabled={!editMode} defaultValue={hist?.fornecedor_id || ''} onChange={e => guardarSpFornecedor(hist?.id, e.target.value)}>
                                <option value="">DM</option>
                                {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                              </select>
                            </td>
                            <td>
                              <input type="number" step="0.01" min="0" defaultValue={hist?.preco_compra != null ? Number(hist.preco_compra).toFixed(2) : ''} style={{ fontSize: 11, width: '100%', boxSizing: 'border-box' }} disabled={!editMode} onBlur={e => { if (hist) guardarSpCampo(hist.id, 'preco_compra', e.target.value); }} />
                            </td>
                            <td style={{ display: 'flex', gap: 4 }}>
                              <Link to={`/pecas/${pc.id}`} className="btn btn-ghost btn-sm" title="Ver peça"><IconView /></Link>
                              {!emOrcamento && <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger,#c0392b)' }} onClick={() => removerPeca(pc.id)} title="Remover">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </button>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Serviços */}
          {!isNew && (
            <>
              <div className="form-group full"><h4 style={{ margin: '1.5rem 0 0.25rem', color: 'var(--color-primary)' }}>Serviços</h4><hr style={{ border: 'none', borderTop: '2px solid var(--color-primary)', margin: '0 0 0.5rem' }} /></div>
              <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <button className="btn btn-primary" disabled={isCancelado || ro} onClick={() => setAdicionarSvOpen(true)}>+ Adicionar Serviço</button>
                </div>
                {spList.length === 0
                  ? <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>Sem serviços associados.</p>
                  : (
                    <table className="table" style={{ fontSize: 12, tableLayout: 'fixed', width: '100%' }}>
                      <thead><tr>
                        <th style={{ width: 100 }}>Ref.</th><th style={{ width: 180 }}>Fornecedor</th>
                        <th style={{ width: 160 }}>Tipo de Serviço</th><th style={{ width: 180 }}>Descrição</th>
                        <th style={{ width: 80 }}>Qtd.</th><th style={{ width: 60 }}>Unid.</th>
                        <th style={{ width: 100 }}>Preço Unit. (€)</th><th style={{ width: 100 }}>Total (€)</th>
                        <th style={{ width: 60 }}>Ação</th>
                      </tr></thead>
                      <tbody>
                        {spList.map(sp => {
                          const sv = servicos.find(s => s.id === sp.servicoId);
                          if (!sv) return null;
                          const total = sp.quantidade * sp.precoUnitario;
                          const pedidoTemOrcAtivo = orcamentos.some(o => o.pedidoId === pedidoId && o.ativo);
                          const emOrcamento = orcamento_itens.some(item => item.itemTipo === 'servico' && item.servicoId === sp.servicoId && orcamentos.some(o => o.id === item.orcamentoId && o.pedidoId === pedidoId)) || pedidoTemOrcAtivo;
                          return (
                            <tr key={sp.id}>
                              <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sv.ref}</td>
                              <td>
                                <select style={{ fontSize: 11, width: '100%', boxSizing: 'border-box' }} disabled={!editMode} value={sp.fornecedorId || ''} onChange={e => guardarSpFornecedor(sp.id, e.target.value)}>
                                  <option value="">DM</option>
                                  {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                                </select>
                              </td>
                              <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sv.tipo_servico}</td>
                              <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sv.descricao || '—'}</td>
                              <td>
                                <input type="number" step="0.01" min="0.01" defaultValue={sp.quantidade} style={{ fontSize: 11, width: '100%', boxSizing: 'border-box' }} disabled={!editMode} onBlur={e => guardarSpCampo(sp.id, 'quantidade', e.target.value)} />
                              </td>
                              <td>{sv.unidade || '—'}</td>
                              <td>
                                <input type="number" step="0.01" min="0" defaultValue={sp.precoUnitario.toFixed(2)} style={{ fontSize: 11, width: '100%', boxSizing: 'border-box' }} disabled={!editMode} onBlur={e => guardarSpCampo(sp.id, 'preco_unitario', e.target.value)} />
                              </td>
                              <td style={{ fontWeight: 600 }}>{formatEuro(total)}</td>
                              <td>
                                {!isCancelado && !emOrcamento && (
                                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger,#c0392b)' }} onClick={() => removerServico(sp.id)} title="Remover serviço">✕</button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
              </div>
            </>
          )}

          {/* Orçamentos */}
          {!isNew && (
            <>
              <div className="form-group full"><h4 style={{ margin: '1.5rem 0 0.25rem', color: 'var(--color-primary)' }}>Orçamentos</h4><hr style={{ border: 'none', borderTop: '2px solid var(--color-primary)', margin: '0 0 0.5rem' }} /></div>
              <div style={{ gridColumn: '1/-1' }}>
                <button className="btn btn-primary" disabled={isCancelado || ro}
                  onClick={() => navigate('/orcamentos/novo', { state: { fromPedidoId: pedidoId } })}>
                  + Novo Orçamento
                </button>
              </div>
              {orcList.length > 0 && (
                <div className="form-group full">
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>Historial de orçamentos ({orcList.length})</p>
                  <table className="table" style={{ fontSize: 12 }}>
                    <thead><tr><th>Ref.</th><th>Quantidade</th><th>Unidades</th><th>Preço Unitário</th><th>Custo Líquido</th><th>Emissão</th><th>Estado</th><th>Ativo</th><th></th></tr></thead>
                    <tbody>
                      {orcList.flatMap(o => {
                        const itens = orcamento_itens.filter(i => i.orcamentoId === o.id);
                        const estadoBg = o.estado === 'Aprovado' ? 'badge-green' : o.estado === 'Rejeitado' ? 'badge-red' : 'badge-orange';
                        const headerRow = (
                          <tr key={o.id} style={o.ativo ? { fontWeight: 600 } : { opacity: 0.7 }}>
                            <td>{o.ref}</td>
                            <td colSpan={3} style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{itens.length > 0 ? `${itens.length} item(ns)` : '—'}</td>
                            <td>{o.valor > 0 ? formatEuro(o.valor) : '—'}</td>
                            <td>{o.dataEmissao}</td>
                            <td><span className={`badge ${estadoBg}`}>{o.estado}</span></td>
                            <td>{o.ativo ? <span className="badge badge-blue">Ativo</span> : <span className="badge badge-gray">—</span>}</td>
                            <td><button className="btn btn-ghost btn-sm" onClick={() => navigate(`/orcamentos/${o.id}`)}><IconView /></button></td>
                          </tr>
                        );
                        const itemRows = itens.map(i => {
                          const unidade = i.itemTipo === 'servico' ? (i.servico?.unidade || '—') : 'pç';
                          const ref = i.itemTipo === 'peca' ? (pecas.find(pc => pc.id === i.pecaId)?.ref || '—') : (i.servico?.ref || '—');
                          return (
                            <tr key={i.id} style={{ fontSize: 11, background: 'var(--color-surface-alt)', opacity: o.ativo ? 1 : 0.6 }}>
                              <td style={{ paddingLeft: 20, color: 'var(--color-text-muted)' }}>{ref}</td>
                              <td>{i.quantidade}</td><td>{unidade}</td>
                              <td>{formatEuro(i.precoUnitario)}</td>
                              <td style={{ color: 'var(--color-text-muted)' }}>{formatEuro(i.quantidade * i.precoUnitario)}</td>
                              <td colSpan={4}></td>
                            </tr>
                          );
                        });
                        return [headerRow, ...itemRows];
                      })}
                    </tbody>
                  </table>
                  {orcAprovado && (
                    <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Custo Líquido</span>
                        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-primary)' }}>{formatEuro(orcAprovado.valor)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Notas */}
          {!isNew && (
            <>
              <div className="form-group full"><h4 style={{ margin: '1.5rem 0 0.25rem', color: 'var(--color-primary)' }}>Notas</h4><hr style={{ border: 'none', borderTop: '2px solid var(--color-primary)', margin: '0 0 0.5rem' }} /></div>
              <div className="form-group full" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {notasList.length > 0 ? (
                  <table className="table" style={{ fontSize: 12 }}>
                    <thead><tr><th>Data</th><th>Criado por</th><th>Nota</th><th></th></tr></thead>
                    <tbody>
                      {notasList.map(n => {
                        const colab = colaboradores_dm.find(c => c.id === n.criadoPorId);
                        return (
                          <tr key={n.id}>
                            <td style={{ whiteSpace: 'nowrap' }}>{n.dataHora}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{colab ? colab.nome : '—'}</td>
                            <td style={{ whiteSpace: 'pre-wrap' }}>{n.nota}</td>
                            <td><button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger,#c0392b)' }} onClick={() => apagarNota(n.id)} title="Apagar nota">✕</button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>Sem notas registadas.</p>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <label className="form-label" style={{ fontSize: 11 }}>Criado por</label>
                      <select style={{ width: '100%' }} value={notaCriadoPor} onChange={e => setNotaCriadoPor(e.target.value)}>
                        <option value="">Selecione...</option>
                        {colaboradores_dm.filter(c => c.estado === 'ativo').map(c => (
                          <option key={c.id} value={c.id}>{c.nome}{c.funcao ? ` — ${c.funcao}` : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 11 }}>Nota</label>
                    <textarea rows={3} style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }} placeholder="Escreva a nota aqui..." value={notaTexto} onChange={e => setNotaTexto(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={adicionarNota}>+ Adicionar Nota</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ---------- Raiz ---------- */
export default function Pedidos() {
  const { id } = useParams();
  if (id) return <PedidoDetalhe pedidoId={id === 'novo' ? null : id} />;
  return <PedidosList />;
}
