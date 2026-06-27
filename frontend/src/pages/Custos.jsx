import { useState } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../store';
import { formatEuro, resolveCliente, getColab, getEmpresa, getParticular } from '../lib/helpers';
import { EstadoBadge, TipoBadge } from '../components/ui/Badge';

function valorOT(o, orcamentos) {
  const orc = orcamentos.find(oc => oc.pedidoId === o.pedidoId && oc.ativo && oc.estado === 'Aprovado')
           || orcamentos.find(oc => oc.pedidoId === o.pedidoId && oc.ativo);
  return Number(orc?.valor || 0);
}

function MetricCard({ label, value, sub, style }) {
  return (
    <div className="metric-card" style={style}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-sub">{sub}</div>
    </div>
  );
}

export default function Custos() {
  const ordens    = useStore(s => s.ordens);
  const orcamentos = useStore(s => s.orcamentos);
  const pedidos   = useStore(s => s.pedidos);

  const anoAtual = new Date().getFullYear();
  const anosDisponiveis = [...new Set([
    ...orcamentos.map(o => o.dataEmissao?.slice(0, 4)),
    ...ordens.map(o => o.concluido_em?.slice(0, 4)),
    ...pedidos.map(p => p.data?.slice(0, 4)),
  ].filter(Boolean))].map(Number).sort((a, b) => b - a);
  const [ano, setAno] = useState(anosDisponiveis[0] || anoAtual);

  const aFaturar        = ordens.filter(o => o.estado === 'Faturar').reduce((s, o) => s + valorOT(o, orcamentos), 0);
  const totalFaturado   = ordens
    .filter(o => o.estado === 'Concluída' && o.concluido_em?.startsWith(String(ano)))
    .reduce((s, o) => s + valorOT(o, orcamentos), 0);
  const totalAprovados  = orcamentos
    .filter(o => o.estado === 'Aprovado' && o.dataEmissao?.startsWith(String(ano)))
    .reduce((s, o) => s + Number(o.valor || 0), 0);

  const resumoClientes = (() => {
    const stats = {};
    pedidos.filter(p => p.data?.startsWith(String(ano))).forEach(p => {
      let key, nome;
      if (p.clienteTipo === 'particular') {
        const part = getParticular(p.clienteId);
        key  = `particular_${p.clienteId}`;
        nome = part?.nome || '—';
      } else {
        const colab = getColab(p.clienteId);
        const emp   = getEmpresa(colab?.empresaId);
        key  = `empresa_${colab?.empresaId}`;
        nome = emp?.nome || '—';
      }
      if (!stats[key]) stats[key] = { nome, pedidos: 0, ordens: 0, valorTotal: 0 };
      stats[key].pedidos++;
      const ordensP = ordens.filter(o => o.pedidoId === p.id);
      stats[key].ordens += ordensP.length;
      ordensP.forEach(o => { stats[key].valorTotal += valorOT(o, orcamentos); });
    });
    return Object.values(stats).sort((a, b) => b.valorTotal - a.valorTotal);
  })();

  const ordensAFaturar = ordens.filter(o => o.estado === 'Faturar');

  return (
    <>
      <div className="full-card">
        <div className="card-title">Ordens de trabalho a faturar</div>
        <table className="table">
          <thead>
            <tr>
              <th>OT Nº</th><th>Cliente</th><th>Empresa</th><th>Tipo</th>
              <th>Data Entrega</th><th>GT Nº</th><th>Valor (€)</th><th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {ordensAFaturar.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                Sem ordens de trabalho a faturar.
              </td></tr>
            ) : ordensAFaturar.map(o => {
              const pd = pedidos.find(p => p.id === o.pedidoId) || {};
              const cl = resolveCliente(pd.clienteTipo, pd.clienteId);
              return (
                <tr key={o.id}>
                  <td><Link to={`/ordens/${o.id}`} style={{ fontWeight: 600 }}>{o.num}</Link></td>
                  <td>{cl.nome}</td>
                  <td>{cl.subtexto || '—'}</td>
                  <td><TipoBadge tipo={pd.clienteTipo} /></td>
                  <td>{o.dataLimiteEntrega || '—'}</td>
                  <td>{o.n_gt || '—'}</td>
                  <td><strong>{formatEuro(valorOT(o, orcamentos))}</strong></td>
                  <td><EstadoBadge estado={o.estado} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid-metrics" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <MetricCard label="Total OT a faturar"     value={formatEuro(aFaturar)}         sub='ordens com estado "Faturar"' style={{ background: 'var(--color-red-bg)', color: 'var(--color-red-fg)' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
        <label style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Ano</label>
        <select
          value={ano}
          onChange={e => setAno(Number(e.target.value))}
          style={{ fontSize: 12, padding: '2px 6px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer' }}
        >
          {anosDisponiveis.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="full-card">
        <div className="card-title">Resumo por cliente em {ano}</div>
        <table className="table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th style={{ textAlign: 'center' }}>Nº Pedidos</th>
              <th style={{ textAlign: 'center' }}>Nº Ordens</th>
              <th style={{ textAlign: 'right' }}>Total Orçamentado (€)</th>
            </tr>
          </thead>
          <tbody>
            {resumoClientes.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>Sem dados.</td></tr>
            ) : resumoClientes.map((r, i) => (
              <tr key={i}>
                <td>{r.nome}</td>
                <td style={{ textAlign: 'center' }}>{r.pedidos}</td>
                <td style={{ textAlign: 'center' }}>{r.ordens}</td>
                <td style={{ textAlign: 'right' }}><strong>{formatEuro(r.valorTotal)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid-metrics" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <MetricCard label={`Total Orc. Aprovados em ${ano}`}   value={formatEuro(totalAprovados)}   sub="orçamentos aprovados" style={{ background: 'var(--color-blue-bg)', color: 'var(--color-blue-fg)' }} />
        <MetricCard label={`Total faturado em ${ano}`}         value={formatEuro(totalFaturado)}    sub="ordens concluídas" style={{ background: 'var(--color-green-bg)', color: 'var(--color-green-fg)' }} />
      </div>
    </>
  );
}
