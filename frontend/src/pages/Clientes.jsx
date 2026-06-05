import { useState } from 'react';
import useStore from '../store';
import { apiPost, apiPut } from '../lib/api';
import { toast } from '../lib/toast';
import { initials } from '../lib/helpers';
import { Overlay } from '../components/ui/Overlay';

/* ---------- Ícones ---------- */
const IconPencil = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <g transform="matrix(1.05 0 0 1.05 12 12)">
      <path style={{ fill: 'currentColor' }} transform="translate(-12.5,-11.5)"
        d="M19.171875 2C18.448125 2 17.724375 2.275625 17.171875 2.828125L16 4L20 8L21.171875 6.828125C22.275875 5.724125 22.275875 3.933125 21.171875 2.828125C20.619375 2.275625 19.895625 2 19.171875 2zM14.5 5.5L5 15C5 15 6.005 15.005 6.5 15.5C6.995 15.995 6.984375 16.984375 6.984375 16.984375C6.984375 16.984375 8.004 17.004 8.5 17.5C8.996 17.996 9 19 9 19L18.5 9.5L14.5 5.5zM3.6699219 17L3.0136719 20.503906C2.9606719 20.789906 3.2100938 21.039328 3.4960938 20.986328L7 20.330078L3.6699219 17z"
      />
    </g>
  </svg>
);
const IconUserPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
    <line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/>
  </svg>
);

/* ---------- Campos de Empresa ---------- */
const EMPTY_EMP = { nome: '', nif: '', tel: '', email: '', morada: '', codigo_postal: '', localidade: '' };
const EMPTY_PART = { nome: '', cc: '', tel: '', email: '', morada: '', codigo_postal: '', localidade: '' };
const EMPTY_COLAB = { nome: '', cargo: '', email: '', tel: '', ativo: true };

function EmpresaForm({ form, setForm }) {
  const f = name => e => setForm(x => ({ ...x, [name]: e.target.value }));
  return (
    <div className="form-grid">
      <div className="form-group full"><label className="form-label">Nome da empresa</label><input placeholder="Ex: MetalTec Lda" value={form.nome} onChange={f('nome')} /></div>
      <div className="form-group"><label className="form-label">NIF</label><input placeholder="NIF" value={form.nif} onChange={f('nif')} /></div>
      <div className="form-group"><label className="form-label">Telefone</label><input placeholder="2XX XXX XXX" value={form.tel} onChange={f('tel')} /></div>
      <div className="form-group"><label className="form-label">Email</label><input placeholder="geral@empresa.pt" value={form.email} onChange={f('email')} /></div>
      <div className="form-group full"><label className="form-label">Morada</label><input placeholder="Rua, nº" value={form.morada} onChange={f('morada')} /></div>
      <div className="form-group"><label className="form-label">Código Postal</label><input placeholder="XXXX-XXX" value={form.codigo_postal} onChange={f('codigo_postal')} /></div>
      <div className="form-group"><label className="form-label">Localidade</label><input placeholder="Cidade / Vila" value={form.localidade} onChange={f('localidade')} /></div>
    </div>
  );
}

function ParticularForm({ form, setForm }) {
  const f = name => e => setForm(x => ({ ...x, [name]: e.target.value }));
  return (
    <div className="form-grid">
      <div className="form-group"><label className="form-label">Nome completo</label><input placeholder="Nome e apelido" value={form.nome} onChange={f('nome')} /></div>
      <div className="form-group"><label className="form-label">Nº Cartão Cidadão</label><input placeholder="XXXXXXXX" value={form.cc} onChange={f('cc')} /></div>
      <div className="form-group"><label className="form-label">Telefone</label><input placeholder="9XX XXX XXX" value={form.tel} onChange={f('tel')} /></div>
      <div className="form-group"><label className="form-label">Email</label><input placeholder="nome@email.com" value={form.email} onChange={f('email')} /></div>
      <div className="form-group full"><label className="form-label">Morada</label><input placeholder="Rua, nº" value={form.morada} onChange={f('morada')} /></div>
      <div className="form-group"><label className="form-label">Código Postal</label><input placeholder="XXXX-XXX" value={form.codigo_postal} onChange={f('codigo_postal')} /></div>
      <div className="form-group"><label className="form-label">Localidade</label><input placeholder="Cidade / Vila" value={form.localidade} onChange={f('localidade')} /></div>
    </div>
  );
}

function ColabForm({ form, setForm, empresaNome }) {
  const f = name => e => setForm(x => ({ ...x, [name]: e.target.value }));
  return (
    <>
      {empresaNome && <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Empresa: <strong>{empresaNome}</strong></p>}
      <div className="form-grid">
        <div className="form-group"><label className="form-label">Nome</label><input placeholder="Nome completo" value={form.nome} onChange={f('nome')} /></div>
        <div className="form-group"><label className="form-label">Cargo</label><input placeholder="Ex: Engenheiro" value={form.cargo} onChange={f('cargo')} /></div>
        <div className="form-group"><label className="form-label">Email</label><input placeholder="nome@empresa.pt" value={form.email} onChange={f('email')} /></div>
        <div className="form-group"><label className="form-label">Telefone</label><input placeholder="9XX XXX XXX" value={form.tel} onChange={f('tel')} /></div>
        <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 'auto', paddingBottom: 8 }}>
          <input type="checkbox" id="f-ativo" checked={form.ativo} onChange={e => setForm(x => ({ ...x, ativo: e.target.checked }))} style={{ width: 'auto', margin: 0, padding: 0 }} />
          <label htmlFor="f-ativo" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Ativo</label>
        </div>
      </div>
    </>
  );
}

/* ---------- Linhas da tabela ---------- */
function ColabRow({ colab, pedidos, onEdit }) {
  const pedC = pedidos.filter(p => p.clienteTipo === 'colaborador' && p.clienteId === colab.id).length;
  return (
    <tr className="row-colab">
      <td />
      <td style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="10" height="10" viewBox="0 0 10 10" style={{ marginLeft: 4, flexShrink: 0 }}>
          <circle cx="5" cy="5" r="5" fill={colab.ativo !== false ? '#4caf50' : '#f44336'} />
        </svg>
        <span className="inline-flex">
          <span className="avatar av-colab av-sm">{initials(colab.nome)}</span>
          {colab.nome}
        </span>
      </td>
      <td />
      <td style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{colab.tel || '—'}</td>
      <td style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{colab.email || '—'}</td>
      <td>—</td>
      <td>{pedC}</td>
      <td><button className="btn btn-ghost btn-sm" onClick={() => onEdit(colab)}><IconPencil /></button></td>
    </tr>
  );
}

function EmpresaRow({ empresa, colaboradores, pedidos, expanded, onToggle, onEditEmp, onAddColab }) {
  const colabs = colaboradores.filter(c => c.empresaId === empresa.id);
  const pedEmp = pedidos.filter(p => p.clienteTipo === 'colaborador' && colabs.some(c => c.id === p.clienteId)).length;
  const exp = expanded['e' + empresa.id];
  return (
    <>
      <tr className="row-empresa">
        <td>
          <button className="expand-btn" onClick={() => onToggle(empresa.id)} style={{ fontSize: '1.25rem' }}>
            {exp ? '▼' : '▶'}
          </button>
        </td>
        <td><span className="inline-flex"><span className="avatar av-empresa">{initials(empresa.nome)}</span>{empresa.nome}</span></td>
        <td><span className="badge badge-teal">Empresa</span></td>
        <td>{empresa.tel || '—'}</td>
        <td>{empresa.email || '—'}</td>
        <td>{empresa.nif || '—'}</td>
        <td>{pedEmp}</td>
        <td>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => onEditEmp(empresa)}><IconPencil /></button>
            <button className="btn btn-ghost btn-sm" onClick={() => onAddColab(empresa)}><IconUserPlus /></button>
          </div>
        </td>
      </tr>
      {exp && colabs.map(c => (
        <ColabRow key={c.id} colab={c} pedidos={pedidos} onEdit={onAddColab} />
      ))}
    </>
  );
}

function ParticularRow({ particular, pedidos, onEdit }) {
  const pedP = pedidos.filter(p => p.clienteTipo === 'particular' && p.clienteId === particular.id).length;
  return (
    <tr>
      <td />
      <td><span className="inline-flex"><span className="avatar av-particular">{initials(particular.nome)}</span>{particular.nome}</span></td>
      <td><span className="badge badge-coral">Particular</span></td>
      <td>{particular.tel || '—'}</td>
      <td>{particular.email || '—'}</td>
      <td>{particular.nif || particular.cc || '—'}</td>
      <td>{pedP}</td>
      <td><button className="btn btn-ghost btn-sm" onClick={() => onEdit(particular)}><IconPencil /></button></td>
    </tr>
  );
}

/* ---------- Componente principal ---------- */
export default function Clientes() {
  const empresas      = useStore(s => s.empresas);
  const colaboradores = useStore(s => s.colaboradores);
  const particulares  = useStore(s => s.particulares);
  const pedidos       = useStore(s => s.pedidos);
  const expanded      = useStore(s => s.expanded);
  const clienteFilter = useStore(s => s.clienteFilter);
  const toggleExpanded   = useStore(s => s.toggleExpanded);
  const setClienteFilter = useStore(s => s.setClienteFilter);

  // Modal: novo cliente (empresa ou particular)
  const [novoOpen, setNovoOpen]   = useState(false);
  const [novoTipo, setNovoTipo]   = useState('empresa');
  const [empForm,  setEmpForm]    = useState(EMPTY_EMP);
  const [partForm, setPartForm]   = useState(EMPTY_PART);
  const [saving,   setSaving]     = useState(false);

  // Modal: editar empresa
  const [editEmpOpen, setEditEmpOpen] = useState(false);
  const [editEmp,     setEditEmp]     = useState(null);
  const [editEmpForm, setEditEmpForm] = useState(EMPTY_EMP);

  // Modal: editar particular
  const [editPartOpen, setEditPartOpen] = useState(false);
  const [editPart,     setEditPart]     = useState(null);
  const [editPartForm, setEditPartForm] = useState(EMPTY_PART);

  // Modal: colaborador (novo ou editar)
  const [colabOpen,    setColabOpen]    = useState(false);
  const [colabEmpresa, setColabEmpresa] = useState(null);
  const [colabId,      setColabId]      = useState(null);
  const [colabForm,    setColabForm]    = useState(EMPTY_COLAB);

  function openAddColab(empresa) {
    // Se receber um colab (editar), detectamos pelo campo empresaId
    if (empresa.empresaId !== undefined) {
      const emp = empresas.find(e => e.id === empresa.empresaId);
      setColabEmpresa(emp || null);
      setColabId(empresa.id);
      setColabForm({ nome: empresa.nome || '', cargo: empresa.cargo || '', email: empresa.email || '', tel: empresa.tel || '', ativo: empresa.ativo !== false });
    } else {
      setColabEmpresa(empresa);
      setColabId(null);
      setColabForm(EMPTY_COLAB);
    }
    setColabOpen(true);
  }

  async function handleSaveNovo() {
    setSaving(true);
    try {
      if (novoTipo === 'empresa') {
        if (!empForm.nome.trim()) { toast.error('O nome é obrigatório.'); return; }
        const novo = await apiPost('/empresas', { nome: empForm.nome.trim(), nif: empForm.nif || null, tel: empForm.tel || null, email: empForm.email || null, morada: empForm.morada || null, codigo_postal: empForm.codigo_postal || null, localidade: empForm.localidade || null });
        useStore.setState(s => ({ empresas: [...s.empresas, novo] }));
      } else {
        if (!partForm.nome.trim()) { toast.error('O nome é obrigatório.'); return; }
        const novo = await apiPost('/particulares', { nome: partForm.nome.trim(), cc: partForm.cc || null, tel: partForm.tel || null, email: partForm.email || null, morada: partForm.morada || null, codigo_postal: partForm.codigo_postal || null, localidade: partForm.localidade || null });
        useStore.setState(s => ({ particulares: [...s.particulares, novo] }));
      }
      setNovoOpen(false);
      setEmpForm(EMPTY_EMP); setPartForm(EMPTY_PART);
      toast.success('Cliente criado com sucesso.');
    } catch (err) { toast.error('Erro: ' + err.message); }
    finally { setSaving(false); }
  }

  async function handleSaveEditEmp() {
    if (!editEmpForm.nome.trim()) { toast.error('O nome é obrigatório.'); return; }
    setSaving(true);
    try {
      const upd = await apiPut(`/empresas/${editEmp.id}`, { nome: editEmpForm.nome.trim(), nif: editEmpForm.nif || null, tel: editEmpForm.tel || null, email: editEmpForm.email || null, morada: editEmpForm.morada || null, codigo_postal: editEmpForm.codigo_postal || null, localidade: editEmpForm.localidade || null });
      useStore.setState(s => ({ empresas: s.empresas.map(e => e.id === editEmp.id ? upd : e) }));
      setEditEmpOpen(false);
      toast.success('Empresa atualizada.');
    } catch (err) { toast.error('Erro: ' + err.message); }
    finally { setSaving(false); }
  }

  async function handleSaveEditPart() {
    if (!editPartForm.nome.trim()) { toast.error('O nome é obrigatório.'); return; }
    setSaving(true);
    try {
      const upd = await apiPut(`/particulares/${editPart.id}`, { nome: editPartForm.nome.trim(), cc: editPartForm.cc || null, tel: editPartForm.tel || null, email: editPartForm.email || null, morada: editPartForm.morada || null, codigo_postal: editPartForm.codigo_postal || null, localidade: editPartForm.localidade || null });
      useStore.setState(s => ({ particulares: s.particulares.map(p => p.id === editPart.id ? upd : p) }));
      setEditPartOpen(false);
      toast.success('Particular atualizado.');
    } catch (err) { toast.error('Erro: ' + err.message); }
    finally { setSaving(false); }
  }

  async function handleSaveColab() {
    if (!colabForm.nome.trim()) { toast.error('O nome é obrigatório.'); return; }
    setSaving(true);
    try {
      const dados = { nome: colabForm.nome.trim(), cargo: colabForm.cargo || null, email: colabForm.email || null, tel: colabForm.tel || null, ativo: colabForm.ativo };
      if (colabId) {
        const upd = await apiPut(`/colaboradores/${colabId}`, dados);
        useStore.setState(s => ({ colaboradores: s.colaboradores.map(c => c.id === colabId ? { ...upd, empresaId: upd.empresa_id } : c) }));
      } else {
        const novo = await apiPost('/colaboradores', { ...dados, empresa_id: colabEmpresa.id });
        useStore.setState(s => ({ colaboradores: [...s.colaboradores, { ...novo, empresaId: novo.empresa_id }] }));
      }
      setColabOpen(false);
      toast.success('Colaborador gravado.');
    } catch (err) { toast.error('Erro: ' + err.message); }
    finally { setSaving(false); }
  }

  const showEmpresas    = clienteFilter === 'todos' || clienteFilter === 'empresa';
  const showParticulares = clienteFilter === 'todos' || clienteFilter === 'particular';

  return (
    <>
      <div className="section-header">
        <span className="section-count">
          {empresas.length} empresas · {colaboradores.length} colaboradores · {particulares.length} particulares
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="filter-tabs">
            {[['todos', 'Todos'], ['empresa', 'Empresas'], ['particular', 'Particulares']].map(([val, label]) => (
              <div key={val} className={`tab${clienteFilter === val ? ' active' : ''}`} onClick={() => setClienteFilter(val)}>{label}</div>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => { setNovoOpen(true); setNovoTipo('empresa'); setEmpForm(EMPTY_EMP); setPartForm(EMPTY_PART); }}>
            + Novo cliente
          </button>
        </div>
      </div>

      <div className="full-card">
        <table className="table">
          <thead>
            <tr><th></th><th>Nome</th><th>Tipo</th><th>Telefone</th><th>E-mail</th><th>NIF / CC</th><th>Pedidos</th><th>Ações</th></tr>
          </thead>
          <tbody>
            {showEmpresas && empresas.map(emp => (
              <EmpresaRow
                key={emp.id} empresa={emp} colaboradores={colaboradores} pedidos={pedidos}
                expanded={expanded}
                onToggle={id => toggleExpanded('e' + id)}
                onEditEmp={e => { setEditEmp(e); setEditEmpForm({ nome: e.nome || '', nif: e.nif || '', tel: e.tel || '', email: e.email || '', morada: e.morada || '', codigo_postal: e.codigo_postal || '', localidade: e.localidade || '' }); setEditEmpOpen(true); }}
                onAddColab={openAddColab}
              />
            ))}
            {showParticulares && particulares.map(p => (
              <ParticularRow
                key={p.id} particular={p} pedidos={pedidos}
                onEdit={pt => { setEditPart(pt); setEditPartForm({ nome: pt.nome || '', cc: pt.cc || pt.nif || '', tel: pt.tel || '', email: pt.email || '', morada: pt.morada || '', codigo_postal: pt.codigo_postal || '', localidade: pt.localidade || '' }); setEditPartOpen(true); }}
              />
            ))}
            {empresas.length === 0 && particulares.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>Nenhum cliente encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Novo Cliente */}
      <Overlay open={novoOpen} onClose={() => setNovoOpen(false)} title="Novo Cliente" maxWidth={560}>
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem' }}>
          {[['empresa', 'Empresa'], ['particular', 'Particular']].map(([val, label]) => (
            <button key={val} className={`btn ${novoTipo === val ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setNovoTipo(val)}>{label}</button>
          ))}
        </div>
        {novoTipo === 'empresa'
          ? <EmpresaForm form={empForm} setForm={setEmpForm} />
          : <ParticularForm form={partForm} setForm={setPartForm} />}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: '1rem' }}>
          <button className="btn" onClick={() => setNovoOpen(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSaveNovo} disabled={saving}>{saving ? 'A guardar…' : `Guardar ${novoTipo}`}</button>
        </div>
      </Overlay>

      {/* Modal: Editar Empresa */}
      <Overlay open={editEmpOpen} onClose={() => setEditEmpOpen(false)} title="Editar Empresa" maxWidth={560}>
        <EmpresaForm form={editEmpForm} setForm={setEditEmpForm} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: '1rem' }}>
          <button className="btn" onClick={() => setEditEmpOpen(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSaveEditEmp} disabled={saving}>{saving ? 'A guardar…' : 'Guardar'}</button>
        </div>
      </Overlay>

      {/* Modal: Editar Particular */}
      <Overlay open={editPartOpen} onClose={() => setEditPartOpen(false)} title="Editar Particular" maxWidth={560}>
        <ParticularForm form={editPartForm} setForm={setEditPartForm} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: '1rem' }}>
          <button className="btn" onClick={() => setEditPartOpen(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSaveEditPart} disabled={saving}>{saving ? 'A guardar…' : 'Guardar'}</button>
        </div>
      </Overlay>

      {/* Modal: Colaborador */}
      <Overlay open={colabOpen} onClose={() => setColabOpen(false)} title={colabId ? 'Editar Colaborador' : 'Novo Colaborador'} maxWidth={480}>
        <ColabForm form={colabForm} setForm={setColabForm} empresaNome={colabEmpresa?.nome} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: '1rem' }}>
          <button className="btn" onClick={() => setColabOpen(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSaveColab} disabled={saving}>{saving ? 'A guardar…' : 'Guardar colaborador'}</button>
        </div>
      </Overlay>
    </>
  );
}
