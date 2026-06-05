import { useState } from 'react';
import useStore from '../store';
import { apiPost, apiPut, apiPatch } from '../lib/api';
import { toast } from '../lib/toast';
import { useAuth } from '../context/AuthContext';
import { Overlay } from '../components/ui/Overlay';

const EMPTY_FORM = { nome: '', funcao: '', contacto: '', email: '', role: 'operador', estado: 'ativo' };

const IconEdit = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <g transform="matrix(1.05 0 0 1.05 12 12)">
      <path style={{ fill: 'currentColor' }} transform="translate(-12.5, -11.5)"
        d="M19.171875 2C18.448125 2 17.724375 2.275625 17.171875 2.828125L16 4L20 8L21.171875 6.828125C22.275875 5.724125 22.275875 3.933125 21.171875 2.828125C20.619375 2.275625 19.895625 2 19.171875 2zM14.5 5.5L5 15C5 15 6.005 15.005 6.5 15.5C6.995 15.995 6.984375 16.984375 6.984375 16.984375C6.984375 16.984375 8.004 17.004 8.5 17.5C8.996 17.996 9 19 9 19L18.5 9.5L14.5 5.5zM3.6699219 17L3.0136719 20.503906C2.9606719 20.789906 3.2100938 21.039328 3.4960938 20.986328L7 20.330078L3.6699219 17z"
      />
    </g>
  </svg>
);

const IconKey = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="8" cy="15" r="5"/>
    <path d="M13 9l8-4M21 5l-2 4M17 7l-2 4"/>
  </svg>
);

export default function ColaboradoresDm() {
  const colaboradores = useStore(s => s.colaboradores_dm);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [formOpen,   setFormOpen]   = useState(false);
  const [currentId,  setCurrentId]  = useState(null);
  const [form,       setFormState]  = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);

  const [pwOpen,     setPwOpen]     = useState(false);
  const [pwId,       setPwId]       = useState(null);
  const [pwNome,     setPwNome]     = useState('');
  const [pwTemp,     setPwTemp]     = useState('');
  const [pwErro,     setPwErro]     = useState('');
  const [pwSaving,   setPwSaving]   = useState(false);

  function field(name) {
    return e => setFormState(f => ({ ...f, [name]: e.target.value }));
  }

  function abrirForm(id) {
    const c = id ? colaboradores.find(x => x.id === id) : null;
    setCurrentId(id || null);
    setFormState({
      nome:     c?.nome     ?? '',
      funcao:   c?.funcao   ?? '',
      contacto: c?.contacto ?? '',
      email:    c?.email    ?? '',
      role:     c?.role     ?? 'operador',
      estado:   c?.estado   ?? 'ativo',
    });
    setFormOpen(true);
  }

  async function handleSave() {
    if (!form.nome.trim()) { toast.error('O nome é obrigatório.'); return; }
    const dados = {
      nome:     form.nome.trim(),
      funcao:   form.funcao.trim()   || undefined,
      contacto: form.contacto.trim() || undefined,
      email:    form.email.trim()    || null,
      role:     form.role,
      estado:   form.estado,
    };
    setSaving(true);
    try {
      if (currentId) {
        const atualizado = await apiPut(`/colaboradores-dm/${currentId}`, dados);
        useStore.setState(s => ({
          colaboradores_dm: s.colaboradores_dm.map(x => x.id === currentId ? atualizado : x),
        }));
      } else {
        const novo = await apiPost('/colaboradores-dm', dados);
        useStore.setState(s => ({ colaboradores_dm: [...s.colaboradores_dm, novo] }));
      }
      setFormOpen(false);
      toast.success('Colaborador gravado com sucesso.');
    } catch (err) {
      toast.error('Erro ao guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  function abrirFormPassword(id, nome) {
    setPwId(id);
    setPwNome(nome);
    setPwTemp('');
    setPwErro('');
    setPwOpen(true);
  }

  async function handleSavePassword() {
    if (pwTemp.length < 8) { setPwErro('A password deve ter pelo menos 8 caracteres.'); return; }
    setPwSaving(true);
    try {
      await apiPatch(`/colaboradores-dm/${pwId}/password`, { password_temp: pwTemp });
      setPwOpen(false);
      toast.success('Password temporária definida com sucesso.');
    } catch (err) {
      setPwErro(err.message);
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <>
      <div className="section-header">
        <span className="section-count">{colaboradores.length} colaborador(es)</span>
        <button className="btn btn-primary" onClick={() => abrirForm(null)}>+ Novo Colaborador</button>
      </div>

      <div className="full-card">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Função</th>
              <th>Email de login</th>
              <th>Perfil</th>
              <th>Estado</th>
              <th style={{ width: '1%' }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {colaboradores.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                Sem colaboradores registados.
              </td></tr>
            ) : colaboradores.map(c => (
              <tr key={c.id} style={!c.estado ? { opacity: 0.6 } : {}}>
                <td>{c.nome}</td>
                <td>{c.funcao || '—'}</td>
                <td>{c.email || <span style={{ color: 'var(--color-text-muted)' }}>Sem acesso</span>}</td>
                <td>
                  <span className={`badge ${c.role === 'admin' ? 'badge-blue' : 'badge-gray'}`}>
                    {c.role === 'admin' ? 'Admin' : 'Operador'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${c.estado === 'ativo' ? 'badge-green' : 'badge-gray'}`}>
                    {c.estado === 'ativo' ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-ghost btn-sm" title="Editar" onClick={() => abrirForm(c.id)}>
                    <IconEdit />
                  </button>
                  {isAdmin && (
                    <button className="btn btn-ghost btn-sm" title="Definir password" onClick={() => abrirFormPassword(c.id, c.nome)}>
                      <IconKey />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal editar/criar colaborador */}
      <Overlay
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={currentId ? 'Editar Colaborador' : 'Novo Colaborador'}
        maxWidth={420}
      >
        <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="form-group">
            <label className="form-label">Nome *</label>
            <input placeholder="Nome completo" value={form.nome} onChange={field('nome')} />
          </div>
          <div className="form-group">
            <label className="form-label">Função</label>
            <input placeholder="Ex: Torneiro, Fresador..." value={form.funcao} onChange={field('funcao')} />
          </div>
          <div className="form-group">
            <label className="form-label">Contacto</label>
            <input placeholder="Telefone" value={form.contacto} onChange={field('contacto')} />
          </div>
          <div className="form-group">
            <label className="form-label">Email de login</label>
            <input type="email" placeholder="utilizador@empresa.pt" value={form.email} onChange={field('email')} />
          </div>
          <div className="form-group">
            <label className="form-label">Perfil</label>
            <select value={form.role} onChange={field('role')}>
              <option value="operador">Operador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select value={form.estado} onChange={field('estado')}>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: '1rem' }}>
          <button className="btn" onClick={() => setFormOpen(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'A guardar…' : 'Guardar'}
          </button>
        </div>
      </Overlay>

      {/* Modal definir password (admin) */}
      <Overlay
        open={pwOpen}
        onClose={() => setPwOpen(false)}
        title={`Password: ${pwNome}`}
        maxWidth={380}
      >
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 1rem' }}>
          Define uma password temporária. O colaborador será obrigado a alterá-la no próximo acesso.
        </p>
        <div className="form-group">
          <label className="form-label">Password temporária *</label>
          <input
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={pwTemp}
            onChange={e => { setPwTemp(e.target.value); setPwErro(''); }}
          />
        </div>
        {pwErro && (
          <div style={{ fontSize: 13, color: 'var(--color-danger, #e53e3e)', minHeight: '1.2em', margin: '.5rem 0' }}>
            {pwErro}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: '.5rem' }}>
          <button className="btn" onClick={() => setPwOpen(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSavePassword} disabled={pwSaving}>
            {pwSaving ? 'A definir…' : 'Definir Password'}
          </button>
        </div>
      </Overlay>
    </>
  );
}
