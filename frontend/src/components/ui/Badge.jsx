import { ESTADO_BADGE_CLASS } from '../../lib/helpers';

export function EstadoBadge({ estado }) {
  const cls = ESTADO_BADGE_CLASS[estado] || 'badge-gray';
  return <span className={`badge ${cls}`}>{estado}</span>;
}

export function TipoBadge({ tipo }) {
  return tipo === 'particular'
    ? <span className="badge badge-coral">Particular</span>
    : <span className="badge badge-teal">Empresa</span>;
}
