import { useState } from 'react';
import useStore from '../store';
import { apiPost, apiPut } from '../lib/api';
import { toast } from '../lib/toast';
import { Overlay } from '../components/ui/Overlay';

const EMPTY_FORM = {
  nome: '', nif: '', telf: '', morada: '',
  codigo_postal: '', localidade: '', pessoa_contacto: '', email: '',
};

const IconEdit = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <g transform="matrix(1.05 0 0 1.05 12 12)">
      <path style={{ fill: 'currentColor' }} transform="translate(-12.5, -11.5)"
        d="M19.171875 2C18.448125 2 17.724375 2.275625 17.171875 2.828125L16 4L20 8L21.171875 6.828125C22.275875 5.724125 22.275875 3.933125 21.171875 2.828125C20.619375 2.275625 19.895625 2 19.171875 2zM14.5 5.5L5 15C5 15 6.005 15.005 6.5 15.5C6.995 15.995 6.984375 16.984375 6.984375 16.984375C6.984375 16.984375 8.004 17.004 8.5 17.5C8.996 17.996 9 19 9 19L18.5 9.5L14.5 5.5zM3.6699219 17L3.0136719 20.503906C2.9606719 20.789906 3.2100938 21.039328 3.4960938 20.986328L7 20.330078L3.6699219 17z"
      />
    </g>
  </svg>
);

export default function Fornecedores() {
  const fornecedores = useStore(s => s.fornecedores);

  const [open,      setOpen]      = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form,      setFormState] = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);

  function abrirForm(id) {
    const f = id ? fornecedores.find(x => x.id === id) : null;
    setCurrentId(id || null);
    setFormState({
      nome:            f?.nome            ?? '',
      nif:             f?.nif             ?? '',
      telf:            f?.telf            ?? '',
      morada:          f?.morada          ?? '',
      codigo_postal:   f?.codigo_postal   ?? '',
      localidade:      f?.localidade      ?? '',
      pessoa_contacto: f?.pessoa_contacto ?? '',
      email:           f?.email           ?? '',
    });
    setOpen(true);
  }

  function field(name) {
    return e => setFormState(f => ({ ...f, [name]: e.target.value }));
  }

  async function handleSave() {
    if (!form.nome.trim()) { toast.error('O nome é obrigatório.'); return; }

    const dados = {
      nome:            form.nome.trim(),
      nif:             form.nif.trim()             || null,
      telf:            form.telf.trim()            || null,
      morada:          form.morada.trim()          || null,
      codigo_postal:   form.codigo_postal.trim()   || null,
      localidade:      form.localidade.trim()      || null,
      pessoa_contacto: form.pessoa_contacto.trim() || null,
      email:           form.email.trim()           || null,
    };

    setSaving(true);
    try {
      if (currentId) {
        const atualizado = await apiPut(`/fornecedores/${currentId}`, dados);
        useStore.setState(s => ({
          fornecedores: s.fornecedores.map(x => x.id === currentId ? atualizado : x),
        }));
      } else {
        const novo = await apiPost('/fornecedores', dados);
        useStore.setState(s => ({ fornecedores: [...s.fornecedores, novo] }));
      }
      setOpen(false);
      toast.success('Fornecedor gravado com sucesso.');
    } catch (err) {
      toast.error('Erro ao guardar fornecedor: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="section-header">
        <span className="section-count">{fornecedores.length} fornecedor(es)</span>
        <button className="btn btn-primary" onClick={() => abrirForm(null)}>+ Novo Fornecedor</button>
      </div>

      <div className="full-card">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>NIF</th>
              <th>Localidade</th>
              <th>Pessoa de Contacto</th>
              <th>Email</th>
              <th>Telefone</th>
              <th style={{ width: '1%' }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {fornecedores.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                  Sem fornecedores registados.
                </td>
              </tr>
            ) : fornecedores.map(f => (
              <tr key={f.id}>
                <td>{f.nome}</td>
                <td>{f.nif || '—'}</td>
                <td>{f.localidade || '—'}</td>
                <td>{f.pessoa_contacto || '—'}</td>
                <td>{f.email || '—'}</td>
                <td>{f.telf || '—'}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" title="Editar" onClick={() => abrirForm(f.id)}>
                    <IconEdit />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Overlay
        open={open}
        onClose={() => setOpen(false)}
        title={currentId ? 'Editar Fornecedor' : 'Novo Fornecedor'}
        maxWidth={520}
      >
        <div className="form-grid">
          <div className="form-group full">
            <label className="form-label">Nome *</label>
            <input placeholder="Nome da empresa ou fornecedor" value={form.nome} onChange={field('nome')} />
          </div>
          <div className="form-group">
            <label className="form-label">NIF</label>
            <input placeholder="Ex: 500000000" value={form.nif} onChange={field('nif')} />
          </div>
          <div className="form-group">
            <label className="form-label">Telefone</label>
            <input placeholder="+351 ..." value={form.telf} onChange={field('telf')} />
          </div>
          <div className="form-group full">
            <label className="form-label">Morada</label>
            <input placeholder="Rua, número..." value={form.morada} onChange={field('morada')} />
          </div>
          <div className="form-group">
            <label className="form-label">Código Postal</label>
            <input placeholder="0000-000" value={form.codigo_postal} onChange={field('codigo_postal')} />
          </div>
          <div className="form-group">
            <label className="form-label">Localidade</label>
            <input placeholder="Cidade" value={form.localidade} onChange={field('localidade')} />
          </div>
          <div className="form-group">
            <label className="form-label">Pessoa de Contacto</label>
            <input placeholder="Nome do contacto" value={form.pessoa_contacto} onChange={field('pessoa_contacto')} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" placeholder="email@exemplo.com" value={form.email} onChange={field('email')} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: '1rem' }}>
          <button className="btn" onClick={() => setOpen(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'A guardar…' : 'Guardar'}
          </button>
        </div>
      </Overlay>
    </>
  );
}
