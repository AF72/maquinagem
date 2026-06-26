import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import useStore from '../store';
import { resolveCliente, formatEuro } from '../lib/helpers';
import { EstadoBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';

Chart.register(...registerables);

const ESTADO_CORES = {
  'Em curso':  '#185fa5',
  'Pendente':  '#854f0b',
  'Falta OC':  '#c05c00',
  'Faturar':   '#a32d2d',
  'Concluída': '#3b6d11',
  'Cancelada': '#3d3d3d',
};

function MetricCard({ label, value }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
    </div>
  );
}

function BarChartHorizontal({ data, colors }) {
  const ref = useRef(null);
  const instance = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    instance.current?.destroy();
    instance.current = new Chart(ref.current, {
      type: 'bar',
      data: {
        labels: data.map(d => d.label),
        datasets: [{ data: data.map(d => d.value), backgroundColor: colors, borderWidth: 0 }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });
    return () => instance.current?.destroy();
  }, [JSON.stringify(data)]);

  return <canvas ref={ref} />;
}

export default function Dashboard() {
  const pedidos = useStore(s => s.pedidos);
  const ordens  = useStore(s => s.ordens);

  const anosDisponiveis = [...new Set(pedidos.map(p => p.data?.slice(0, 4)).filter(Boolean))]
    .map(Number).sort((a, b) => b - a);
  const anoAtual = new Date().getFullYear();
  const [ano, setAno] = useState(anosDisponiveis[0] || anoAtual);

  const pedidosAno = pedidos.filter(p => p.data?.startsWith(String(ano)));

  const ativas = ordens
    .filter(o => !['Concluída', 'Cancelada'].includes(o.estado))
    .sort((a, b) => {
      if (a.dataLimiteEntrega && b.dataLimiteEntrega) return a.dataLimiteEntrega.localeCompare(b.dataLimiteEntrega);
      if (a.dataLimiteEntrega) return -1;
      if (b.dataLimiteEntrega) return 1;
      return 0;
    });

  const estadosData = Object.keys(ESTADO_CORES).map(label => ({
    label,
    value: ordens.filter(o => o.estado === label).length,
  }));

  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);

  return (
    <>
      {/* Métricas */}
      <div style={{ display: 'flex', gap: 16, marginBottom: '1.5rem', alignItems: 'stretch' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="dash-section-label">Pedidos</div>
          <div className="grid-metrics" style={{ marginBottom: 0, flex: 1, alignItems: 'stretch' }}>
            <div className="metric-card">
              <div className="metric-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                Pedidos em
                <select
                  value={ano}
                  onChange={e => setAno(Number(e.target.value))}
                  style={{ fontSize: 12, padding: '2px 6px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer' }}
                >
                  {anosDisponiveis.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="metric-value">{pedidosAno.length}</div>
            </div>
            {['Orçamentar', 'Pendente', 'Produção'].map(estado => (
              <div key={estado} className="metric-card">
                <div className="metric-label"><EstadoBadge estado={estado} /></div>
                <div className="metric-value">{pedidos.filter(p => p.estado_pedido === estado).length}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="dash-section-label">Ordens de Trabalho</div>
          <div className="grid-metrics" style={{ marginBottom: 0, flex: 1, alignItems: 'stretch' }}>
            {['Em curso', 'Pendente', 'Falta OC', 'Faturar'].map(estado => (
              <div key={estado} className="metric-card">
                <div className="metric-label"><EstadoBadge estado={estado} /></div>
                <div className="metric-value">{ordens.filter(o => o.estado === estado).length}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="full-card">
        <div className="card-title">Ordens ativas — linha de tempo</div>
        <table className="table">
          <thead>
            <tr>
              <th>Nº Pedido</th><th>Estado</th><th>Cliente</th>
              <th>Data Criação</th><th>Progresso</th><th>Data Limite</th>
              <th>Nº Ordem</th><th>Estado OT</th>
            </tr>
          </thead>
          <tbody>
            {ativas.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '1.5rem' }}>Sem ordens ativas.</td></tr>
            ) : ativas.map(o => {
              const pd = pedidos.find(p => p.id === o.pedidoId) || {};
              const cl = resolveCliente(pd.clienteTipo, pd.clienteId);
              const criado = o.criado_em ? new Date(o.criado_em.slice(0, 10)) : null;
              const limite = o.dataLimiteEntrega ? new Date(o.dataLimiteEntrega) : null;

              let barraEl = <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>—</span>;
              if (criado && limite) {
                const total = Math.round((limite - criado) / 86400000);
                const passados = Math.round((hoje - criado) / 86400000);
                const pct = total > 0 ? Math.min(Math.round(passados / total * 100), 100) : 100;
                const restantes = Math.round((limite - hoje) / 86400000);
                const atrasado = restantes < 0;
                const cor = atrasado ? '#a32d2d' : pct >= 80 ? '#c05c00' : pct >= 50 ? '#854f0b' : '#3b6d11';
                const tooltip = atrasado ? `Atrasada ${Math.abs(restantes)} dia(s)` : `${passados} dia(s) passados · ${restantes} dia(s) restantes`;
                barraEl = (
                  <div title={tooltip} style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 140 }}>
                    <div style={{ height: 8, borderRadius: 4, background: '#b8b5aa', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: cor, borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: 10, color: cor, fontWeight: 500 }}>{tooltip}</div>
                  </div>
                );
              }

              const clienteLabel = pd.clienteTipo === 'particular'
                ? <div style={{ lineHeight: 1.2 }}><div>{cl.nome}</div><div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Particular</div></div>
                : <div style={{ lineHeight: 1.2 }}><div>{cl.subtexto}</div><div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{cl.nome}</div></div>;

              return (
                <tr key={o.id}>
                  <td><Link to={`/pedidos/${pd.id}`} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>{pd.ref}</Link></td>
                  <td><EstadoBadge estado={pd.estado_pedido} /></td>
                  <td><span className="inline-flex"><Avatar name={cl.nome} cls={cl.avClass} small />{clienteLabel}</span></td>
                  <td style={{ whiteSpace: 'nowrap' }}>{criado ? criado.toLocaleDateString('pt-PT') : '—'}</td>
                  <td>{barraEl}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{limite ? limite.toLocaleDateString('pt-PT') : '—'}</td>
                  <td><Link to={`/ordens/${o.id}`} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>{o.num}</Link></td>
                  <td><EstadoBadge estado={o.estado} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Gráficos */}
      <div className="full-card">
        <div className="card-title">Ordens por estado</div>
        <div style={{ position: 'relative', height: 240 }}>
          <BarChartHorizontal data={estadosData} colors={estadosData.map(d => ESTADO_CORES[d.label] || '#9e9c96')} />
        </div>
      </div>
    </>
  );
}
