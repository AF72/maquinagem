import { useState } from 'react';
import useStore from '../store';
import { apiPost, apiPut, apiDelete, apiFetch } from '../lib/api';
import { toast } from '../lib/toast';
import { today } from '../lib/helpers';
import { Overlay } from '../components/ui/Overlay';

const TIPOS_PROCESSO = [
  'Corte (serra)', 'Torneamento Conv.', 'Torneamento CNC',
  'Fresagem Conv.', 'Fresagem CNC', 'Eletroerosão Penetração',
  'Eletroerosão Fio', 'Furação', 'Mandrilagem', 'Roscagem',
  'Retificação Plana', 'Retificação Cilíndrica', 'Soldadura MIG',
  'Soldadura TIG', 'Montagem', 'Controlo Dimensional',
  'Prototipagem 2D', 'Prototipagem 3D', 'Impressão 3D',
];

const EMPTY_FORM = { tipo: '', descricao: '', custo_hora: '', ativo: true };
const EMPTY_HIST = { custo: '', data: today(), notas: '' };

const IconEdit = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <g transform="matrix(1.05 0 0 1.05 12 12)">
      <path style={{ fill: 'currentColor' }} transform="translate(-12.5, -11.5)"
        d="M19.171875 2C18.448125 2 17.724375 2.275625 17.171875 2.828125L16 4L20 8L21.171875 6.828125C22.275875 5.724125 22.275875 3.933125 21.171875 2.828125C20.619375 2.275625 19.895625 2 19.171875 2zM14.5 5.5L5 15C5 15 6.005 15.005 6.5 15.5C6.995 15.995 6.984375 16.984375 6.984375 16.984375C6.984375 16.984375 8.004 17.004 8.5 17.5C8.996 17.996 9 19 9 19L18.5 9.5L14.5 5.5zM3.6699219 17L3.0136719 20.503906C2.9606719 20.789906 3.2100938 21.039328 3.4960938 20.986328L7 20.330078L3.6699219 17z"
      />
    </g>
  </svg>
);

function HistoricoPrecos({ processoId, onRefresh }) {
  const historico = useStore(s =>
    s.historico_precos_processos
      .filter(h => h.processoId === processoId)
      .sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id)
  );
  const [hist, setHist] = useState(EMPTY_HIST);
  const [saving, setSaving] = useState(false);

  function field(name) {
    return e => setHist(h => ({ ...h, [name]: e.target.value }));
  }

  async function registar() {
    if (!hist.custo || isNaN(Number(hist.custo)) || Number(hist.custo) < 0) {
      toast.error('Indica um custo/hora válido.'); return;
    }
    setSaving(true);
    try {
      const dados = {
        processo_id: processoId,
        custo_hora: Number(hist.custo),
        notas: hist.notas || null,
        ...(hist.data ? { data: hist.data } : {}),
      };
      const novo = await apiPost('/historico-precos-processos', dados);
      const novoMapped = { ...novo, processoId: novo.processo_id, custoHora: Number(novo.custo_hora), data: novo.data?.slice(0, 10) ?? '' };
      useStore.setState(s => ({ historico_precos_processos: [...s.historico_precos_processos, novoMapped] }));

      // Atualiza custo_hora no processo
      const atualizado = await apiPut(`/processos/${processoId}`, { custo_hora: Number(hist.custo) });
      useStore.setState(s => ({ processos: s.processos.map(x => x.id === processoId ? atualizado : x) }));

      setHist(h => ({ ...h, custo: '', notas: '' }));
      if (onRefresh) onRefresh(atualizado);
      toast.success('Preço registado com sucesso.');
    } catch (err) {
      toast.error('Erro ao registar preço: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remover(hId) {
    try {
      await apiDelete(`/historico-precos-processos/${hId}`);
      useStore.setState(s => ({
        historico_precos_processos: s.historico_precos_processos.filter(h => h.id !== hId),
      }));
      toast.success('Registo removido.');
    } catch (err) {
      toast.error('Erro ao remover: ' + err.message);
    }
  }

  return (
    <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '1rem', paddingTop: '1rem' }}>
      <h4 style={{ margin: '0 0 0.75rem', fontSize: 13, color: 'var(--color-primary)' }}>Histórico de Preços (€/h)</h4>
      <table className="table" style={{ fontSize: 12, marginBottom: '1rem' }}>
        <thead>
          <tr>
            <th style={{ width: 110 }}>Data</th>
            <th style={{ width: 130 }}>Custo/hora</th>
            <th>Notas</th>
            <th style={{ width: 40 }}></th>
          </tr>
        </thead>
        <tbody>
          {historico.length === 0 ? (
            <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '1rem', fontSize: 12 }}>
              Sem histórico registado. O histórico é criado automaticamente ao alterar o custo/hora.
            </td></tr>
          ) : historico.map((h, i) => (
            <tr key={h.id}>
              <td style={{ fontSize: 12 }}>{h.data}</td>
              <td style={{ fontSize: 12, fontWeight: i === 0 ? 700 : 400 }}>
                {Number(h.custoHora).toFixed(2)} €/h
                {i === 0 && <span style={{ fontSize: 10, color: 'var(--color-success, #2e7d32)', marginLeft: 4 }}>atual</span>}
              </td>
              <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{h.notas || '—'}</td>
              <td>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--color-danger, #c00)' }}
                  title="Remover"
                  onClick={() => remover(h.id)}
                ><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="form-grid" style={{ alignItems: 'end' }}>
        <div className="form-group">
          <label className="form-label">Novo custo/hora (€) *</label>
          <input type="number" min="0" step="0.01" placeholder="0.00" value={hist.custo} onChange={field('custo')} />
        </div>
        <div className="form-group">
          <label className="form-label">Data</label>
          <input type="date" value={hist.data} onChange={field('data')} />
        </div>
        <div className="form-group full">
          <label className="form-label">Notas</label>
          <input placeholder="Opcional (ex: revisão anual, novo contrato...)" value={hist.notas} onChange={field('notas')} />
        </div>
        <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button className="btn btn-primary" onClick={registar} disabled={saving}>
            {saving ? 'A registar…' : 'Registar preço'}
          </button>
        </div>
      </div>
    </div>
  );
}

const IconDelete = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

export default function Processos() {
  const processos       = useStore(s => s.processos);
  const servicos        = useStore(s => s.servicos);
  const orcamento_itens = useStore(s => s.orcamento_itens);

  const [open,      setOpen]      = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form,      setFormState] = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);

  function field(name) {
    return e => setFormState(f => ({ ...f, [name]: name === 'ativo' ? e.target.checked : e.target.value }));
  }

  function abrirForm(id) {
    const p = id ? processos.find(x => x.id === id) : null;
    setCurrentId(id || null);
    setFormState({
      tipo:       p?.tipo      ?? '',
      descricao:  p?.descricao ?? '',
      custo_hora: p ? Number(p.custo_hora).toFixed(2) : '',
      ativo:      p ? p.ativo : true,
    });
    setOpen(true);
  }

  async function eliminarServico(id) {
    if (!confirm('Eliminar este serviço?')) return;
    try {
      await apiDelete(`/servicos/${id}`);
      useStore.setState(s => ({ servicos: s.servicos.filter(sv => sv.id !== id) }));
      toast.success('Serviço eliminado.');
    } catch (err) { toast.error('Erro ao eliminar: ' + err.message); }
  }

  async function handleSave() {
    if (!form.descricao.trim()) { toast.error('A descrição é obrigatória.'); return; }
    if (!form.tipo)             { toast.error('Seleciona o tipo de processo.'); return; }

    const dados = { descricao: form.descricao.trim(), tipo: form.tipo, ativo: form.ativo };

    if (!currentId) {
      if (form.custo_hora === '' || isNaN(Number(form.custo_hora))) {
        toast.error('Custo por hora inválido.'); return;
      }
      dados.custo_hora = Number(form.custo_hora);
    }

    setSaving(true);
    try {
      if (currentId) {
        const atualizado = await apiPut(`/processos/${currentId}`, dados);
        useStore.setState(s => ({ processos: s.processos.map(x => x.id === currentId ? atualizado : x) }));
      } else {
        const novo = await apiPost('/processos', dados);
        useStore.setState(s => ({ processos: [...s.processos, novo] }));
      }
      setOpen(false);
      toast.success('Processo gravado com sucesso.');
    } catch (err) {
      toast.error('Erro ao guardar processo: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="section-header">
        <span className="section-count">{processos.length} processo(s)</span>
        <button className="btn btn-primary" onClick={() => abrirForm(null)}>+ Novo Processo</button>
      </div>

      <div className="full-card">
        <table className="table">
          <thead>
            <tr>
              <th>Ref.</th>
              <th>Descrição</th>
              <th>Tipo</th>
              <th>Custo/hora</th>
              <th>Estado</th>
              <th style={{ width: '1%' }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {processos.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                Sem processos registados.
              </td></tr>
            ) : processos.map(p => (
              <tr key={p.id}>
                <td><code>{p.ref}</code></td>
                <td>{p.descricao}</td>
                <td>{p.tipo}</td>
                <td>{Number(p.custo_hora).toFixed(2)} €/h</td>
                <td>
                  <span className={`badge ${p.ativo ? 'badge-green' : 'badge-gray'}`}>
                    {p.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm" title="Editar" onClick={() => abrirForm(p.id)}>
                    <IconEdit />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <div className="section-header">
          <span className="section-count">{servicos.length} serviço(s)</span>
        </div>
        <div className="full-card">
          <table className="table">
            <thead>
              <tr>
                <th>Ref.</th>
                <th>Tipo</th>
                <th>Descrição</th>
                <th>Unidade</th>
                <th style={{ width: '1%' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {servicos.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                  Sem serviços registados.
                </td></tr>
              ) : servicos.map(sv => {
                const usado = orcamento_itens.some(i => i.servicoId === sv.id && i.itemTipo === 'servico');
                return (
                  <tr key={sv.id}>
                    <td><code>{sv.ref}</code></td>
                    <td>{sv.tipo_servico}</td>
                    <td>{sv.descricao || '—'}</td>
                    <td>{sv.unidade}</td>
                    <td>
                      {!usado && (
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Eliminar"
                          style={{ color: 'var(--color-danger,#c0392b)' }}
                          onClick={() => eliminarServico(sv.id)}
                        >
                          <IconDelete />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Overlay
        open={open}
        onClose={() => setOpen(false)}
        title={currentId ? 'Editar Processo' : 'Novo Processo'}
        maxWidth={600}
        scrollable
      >
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Tipo *</label>
            <select value={form.tipo} onChange={field('tipo')}>
              <option value="">Selecionar tipo...</option>
              {TIPOS_PROCESSO.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group full">
            <label className="form-label">Descrição *</label>
            <input placeholder="Descrição do processo" value={form.descricao} onChange={field('descricao')} />
          </div>
          <div className="form-group">
            <label className="form-label">Custo por hora (€)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder={currentId ? '—' : '0.00'}
              value={form.custo_hora}
              onChange={field('custo_hora')}
              readOnly={!!currentId}
              style={currentId ? { background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)', cursor: 'not-allowed' } : {}}
            />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: '1.6rem' }}>
            <input
              id="proc-ativo"
              type="checkbox"
              style={{ width: 16, height: 16 }}
              checked={form.ativo}
              onChange={field('ativo')}
            />
            <label htmlFor="proc-ativo" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
              Processo ativo
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: '1rem' }}>
          <button className="btn" onClick={() => setOpen(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'A guardar…' : 'Guardar'}
          </button>
        </div>

        {currentId && (
          <HistoricoPrecos
            processoId={currentId}
            onRefresh={atualizado => setFormState(f => ({ ...f, custo_hora: Number(atualizado.custo_hora).toFixed(2) }))}
          />
        )}
      </Overlay>
    </>
  );
}
