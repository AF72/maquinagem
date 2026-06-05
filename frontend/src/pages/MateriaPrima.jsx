import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStore from '../store';
import { apiPost, apiPut, apiDelete } from '../lib/api';
import { toast } from '../lib/toast';
import { today } from '../lib/helpers';

const EMPTY_FORM = { ref_wnr: '', peso_esp: '', ref_din: '', ref_bs: '', ref_afnor: '', ref_une: '', ref_aisi: '', ref_jis: '', tipo_tt: '' };

const IconEdit = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <g transform="matrix(1.05 0 0 1.05 12 12)">
      <path style={{ fill: 'currentColor' }} transform="translate(-12.5,-11.5)"
        d="M19.171875 2C18.448125 2 17.724375 2.275625 17.171875 2.828125L16 4L20 8L21.171875 6.828125C22.275875 5.724125 22.275875 3.933125 21.171875 2.828125C20.619375 2.275625 19.895625 2 19.171875 2zM14.5 5.5L5 15C5 15 6.005 15.005 6.5 15.5C6.995 15.995 6.984375 16.984375 6.984375 16.984375C6.984375 16.984375 8.004 17.004 8.5 17.5C8.996 17.996 9 19 9 19L18.5 9.5L14.5 5.5zM3.6699219 17L3.0136719 20.503906C2.9606719 20.789906 3.2100938 21.039328 3.4960938 20.986328L7 20.330078L3.6699219 17z"
      />
    </g>
  </svg>
);

/* ---------- Histórico de preços ---------- */
function HistoricoPrecosMp({ mpId }) {
  const historico = useStore(s =>
    s.historico_precos_mp
      .filter(h => h.materiaPrimaId === mpId)
      .sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id)
  );
  const precoAtual = historico[0]?.precoKg ?? null;

  const [form, setForm]   = useState({ preco: '', data: today(), notas: '' });
  const [saving, setSaving] = useState(false);

  async function registar() {
    if (!form.preco || isNaN(Number(form.preco)) || Number(form.preco) <= 0) {
      toast.error('Indica um preço válido (€/kg).'); return;
    }
    setSaving(true);
    try {
      const dados = { materia_prima_id: mpId, preco_kg: Number(form.preco), notas: form.notas || null, ...(form.data ? { data: form.data } : {}) };
      const novo = await apiPost('/historico-precos-mp', dados);
      const mapped = { ...novo, materiaPrimaId: novo.materia_prima_id, precoKg: Number(novo.preco_kg), data: novo.data?.slice(0, 10) ?? '' };
      useStore.setState(s => ({ historico_precos_mp: [...s.historico_precos_mp, mapped] }));
      setForm(f => ({ ...f, preco: '', notas: '' }));
      toast.success('Preço registado com sucesso.');
    } catch (err) { toast.error('Erro: ' + err.message); }
    finally { setSaving(false); }
  }

  async function remover(hId) {
    try {
      await apiDelete(`/historico-precos-mp/${hId}`);
      useStore.setState(s => ({ historico_precos_mp: s.historico_precos_mp.filter(h => h.id !== hId) }));
      toast.success('Registo removido.');
    } catch (err) { toast.error('Erro: ' + err.message); }
  }

  return (
    <div className="full-card" style={{ maxWidth: 800, margin: '1rem auto', padding: '2rem' }}>
      <h4 style={{ margin: '0 0 0.25rem', color: 'var(--color-primary)' }}>Histórico de Preços</h4>
      <hr style={{ border: 'none', borderTop: '2px solid var(--color-primary)', margin: '0 0 1rem' }} />
      {precoAtual != null && <p style={{ margin: '0 0 1rem', fontSize: 13 }}>Preço atual: <strong>{precoAtual.toFixed(2)} €/kg</strong></p>}
      <table className="table" style={{ fontSize: 12, marginBottom: '1.25rem' }}>
        <thead><tr><th style={{ width: 120 }}>Data</th><th style={{ width: 140 }}>Preço (€/kg)</th><th>Notas</th><th style={{ width: 50 }}></th></tr></thead>
        <tbody>
          {historico.length === 0 ? (
            <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '1.5rem', fontSize: 12 }}>
              Sem preços registados. Adiciona o primeiro registo abaixo.
            </td></tr>
          ) : historico.map((h, i) => (
            <tr key={h.id}>
              <td style={{ fontSize: 12 }}>{h.data}</td>
              <td style={{ fontSize: 12, fontWeight: i === 0 ? 700 : 400 }}>
                {Number(h.precoKg).toFixed(2)} €/kg
                {i === 0 && <span style={{ fontSize: 10, color: 'var(--color-success,#2e7d32)', marginLeft: 4 }}>atual</span>}
              </td>
              <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{h.notas || '—'}</td>
              <td>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger,#c00)' }} onClick={() => remover(h.id)}>✕</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <div style={{ flex: '0 0 100px' }}>
          <label className="form-label">Preço (€/kg) *</label>
          <input type="number" min="0.01" step="0.01" placeholder="0.00" value={form.preco} onChange={e => setForm(f => ({ ...f, preco: e.target.value }))} style={{ width: '100%', height: 34, boxSizing: 'border-box' }} />
        </div>
        <div style={{ flex: '0 0 auto' }}>
          <label className="form-label">Data</label>
          <input type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} style={{ height: 34, boxSizing: 'border-box' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <label className="form-label">Notas</label>
          <input placeholder="Opcional (ex: fornecedor, lote...)" value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} style={{ width: '100%', height: 34, boxSizing: 'border-box' }} />
        </div>
        <button className="btn btn-primary" onClick={registar} disabled={saving} style={{ whiteSpace: 'nowrap', height: 34 }}>
          {saving ? 'A registar…' : 'Registar preço'}
        </button>
      </div>
    </div>
  );
}

/* ---------- Detalhe ---------- */
function MateriaPrimaDetalhe({ mpId }) {
  const navigate = useNavigate();
  const materia_prima = useStore(s => s.materia_prima);
  const isNew = !mpId;
  const m = isNew ? null : materia_prima.find(x => x.id === Number(mpId));

  const [editMode, setEditMode] = useState(isNew);
  const [form, setForm] = useState(isNew ? EMPTY_FORM : {
    ref_wnr:   m?.ref_wnr   ?? '',
    peso_esp:  m?.peso_esp  ?? '',
    ref_din:   m?.ref_din   ?? '',
    ref_bs:    m?.ref_bs    ?? '',
    ref_afnor: m?.ref_afnor ?? '',
    ref_une:   m?.ref_une   ?? '',
    ref_aisi:  m?.ref_aisi  ?? '',
    ref_jis:   m?.ref_jis   ?? '',
    tipo_tt:   m?.tipo_tt   ?? '',
  });
  const [saving, setSaving] = useState(false);

  const f = name => e => setForm(x => ({ ...x, [name]: e.target.value }));
  const ro = !editMode;

  async function handleSave() {
    const dados = {
      ref_wnr:   form.ref_wnr   || undefined,
      peso_esp:  parseFloat(form.peso_esp) || undefined,
      ref_din:   form.ref_din   || undefined,
      ref_bs:    form.ref_bs    || undefined,
      ref_afnor: form.ref_afnor || undefined,
      ref_une:   form.ref_une   || undefined,
      ref_aisi:  form.ref_aisi  || undefined,
      ref_jis:   form.ref_jis   || undefined,
      tipo_tt:   form.tipo_tt   || undefined,
    };
    setSaving(true);
    try {
      if (isNew) {
        const novo = await apiPost('/materia-prima', dados);
        useStore.setState(s => ({ materia_prima: [...s.materia_prima, novo] }));
        toast.success('Material criado com sucesso.');
        navigate('/materia-prima');
      } else {
        const upd = await apiPut(`/materia-prima/${mpId}`, dados);
        useStore.setState(s => ({ materia_prima: s.materia_prima.map(x => x.id === Number(mpId) ? upd : x) }));
        toast.success('Material gravado com sucesso.');
        setEditMode(false);
      }
    } catch (err) { toast.error('Erro: ' + err.message); }
    finally { setSaving(false); }
  }

  if (!isNew && !m) return <p style={{ padding: '2rem' }}>Material não encontrado.</p>;

  const titulo = isNew ? 'Novo Material' : `Detalhe: ${m.ref_wnr || m.ref_din || 'Material'}`;

  return (
    <>
      <div className="section-header">
        <button className="btn btn-ghost-back" onClick={() => navigate('/materia-prima')}>↩ Voltar à Matéria Prima</button>
        <span className="section-count">{titulo}</span>
      </div>
      <div className="full-card" style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
        <div className="form-grid">
          {[
            ['ref_wnr',   'W.-Nr. (Werkstoffnummer)'],
            ['ref_din',   'Ref. DIN'],
            ['ref_bs',    'Ref. BS'],
            ['ref_afnor', 'Ref. AFNOR'],
            ['ref_une',   'Ref. UNE'],
            ['ref_aisi',  'Ref. AISI'],
            ['ref_jis',   'Ref. JIS'],
          ].map(([key, label]) => (
            <div key={key} className="form-group">
              <label className="form-label">{label}</label>
              <input value={form[key]} onChange={f(key)} disabled={ro} />
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">Peso Específico (g/cm³)</label>
            <input type="number" step="0.001" value={form.peso_esp} onChange={f('peso_esp')} disabled={ro} />
          </div>
          <div className="form-group full">
            <label className="form-label">Tipo de Tratamento Térmico</label>
            <input value={form.tipo_tt} onChange={f('tipo_tt')} placeholder="Ex: Têmpera e revenido, Cementação, Nitruração…" disabled={ro} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: '2rem' }}>
          <button className="btn" onClick={() => navigate('/materia-prima')}>Cancelar</button>
          {isNew
            ? <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'A criar…' : 'Criar Material'}</button>
            : !editMode
              ? <button className="btn btn-primary" onClick={() => setEditMode(true)}>Editar</button>
              : <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'A guardar…' : 'Guardar alterações'}</button>
          }
        </div>
      </div>
      {!isNew && <HistoricoPrecosMp mpId={Number(mpId)} />}
    </>
  );
}

/* ---------- Lista ---------- */
function MateriaPrimaLista() {
  const materia_prima       = useStore(s => s.materia_prima);
  const historico_precos_mp = useStore(s => s.historico_precos_mp);
  const navigate            = useNavigate();

  function precoAtual(mpId) {
    const h = historico_precos_mp
      .filter(x => x.materiaPrimaId === mpId)
      .sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id);
    return h.length > 0 ? h[0].precoKg : null;
  }

  return (
    <>
      <div className="section-header">
        <span className="section-count">{materia_prima.length} material(ais)</span>
        <button className="btn btn-primary" onClick={() => navigate('/materia-prima/novo')}>+ Novo Material</button>
      </div>
      <div className="full-card">
        <table className="table">
          <thead>
            <tr>
              <th>W.-Nr.<br /><small style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>Alemanha</small></th>
              <th>Peso Esp.<br /><small style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>g/cm³</small></th>
              <th>DIN<br /><small style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>Alemanha</small></th>
              <th>BS<br /><small style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>Reino Unido</small></th>
              <th>AFNOR<br /><small style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>França</small></th>
              <th>UNE<br /><small style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>Espanha</small></th>
              <th>AISI<br /><small style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>EUA</small></th>
              <th>JIS<br /><small style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>Japão</small></th>
              <th>Preço atual<br /><small style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>€/kg</small></th>
              <th style={{ width: '1%' }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {materia_prima.length === 0 ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>Sem materiais registados.</td></tr>
            ) : materia_prima.map(m => {
              const preco = precoAtual(m.id);
              return (
                <tr key={m.id}>
                  <td>{m.ref_wnr || '-'}</td>
                  <td>{m.peso_esp != null ? m.peso_esp : '-'}</td>
                  <td>{m.ref_din || '-'}</td>
                  <td>{m.ref_bs || '-'}</td>
                  <td>{m.ref_afnor || '-'}</td>
                  <td>{m.ref_une || '-'}</td>
                  <td>{m.ref_aisi || '-'}</td>
                  <td>{m.ref_jis || '-'}</td>
                  <td style={{ fontWeight: preco != null ? 600 : 400, color: preco != null ? 'inherit' : 'var(--color-text-muted)' }}>
                    {preco != null ? `${preco.toFixed(2)} €/kg` : '—'}
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/materia-prima/${m.id}`)}><IconEdit /></button>
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

/* ---------- Componente raiz (lista ou detalhe) ---------- */
export default function MateriaPrima() {
  const { id } = useParams();
  if (id) return <MateriaPrimaDetalhe mpId={id === 'novo' ? null : id} />;
  return <MateriaPrimaLista />;
}
