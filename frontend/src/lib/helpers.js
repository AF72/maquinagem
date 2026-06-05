import useStore from '../store';

// --- Lookups (usam getState() para funcionar fora de componentes React) ---

export function getEmpresa(id) {
  return useStore.getState().empresas.find(e => e.id === id) || { nome: '—', nif: '—' };
}

export function getColab(id) {
  return useStore.getState().colaboradores.find(c => c.id === id)
    || { nome: '—', cargo: '—', empresaId: null };
}

export function getParticular(id) {
  return useStore.getState().particulares.find(p => p.id === id) || { nome: '—', nif: '—' };
}

export function getDadosPedido(id) {
  return useStore.getState().dados_pedido.find(p => p.id === id) || {
    ref: '—', equipamento: '—', orgao: '—', parte: '—', breveDescricao: '—', imagem: '',
  };
}

export function getPedido(id) {
  return useStore.getState().pedidos.find(p => p.id === id)
    || { ref: '—', dadosPedidoId: 0, clienteTipo: '', clienteId: 0 };
}

export function resolveCliente(tipo, id) {
  if (tipo === 'particular') {
    const p = getParticular(id);
    return { nome: p.nome, subtexto: 'Particular', avClass: 'av-particular' };
  }
  const c = getColab(id);
  const emp = getEmpresa(c.empresaId);
  return { nome: c.nome, subtexto: emp.nome, avClass: 'av-colab' };
}

// --- Formatação ---

export function formatEuro(value) {
  return Number(value ?? 0).toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' €';
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function padNum(n, l) {
  return String(n).padStart(l, '0');
}

export function initials(name) {
  return (name || '—')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

// --- Mapeamento de badges de estado ---

export const ESTADO_BADGE_CLASS = {
  'Produção':   'badge-blue',
  'Pendente':   'badge-amber',
  'Orçamentar': 'badge-gray',
  'Faturar':    'badge-red',
  'Concluido':  'badge-green',
  'Cancelado':  'badge-black',
  'Em curso':   'badge-blue',
  'Falta OC':   'badge-orange',
  'Concluída':  'badge-green',
};
