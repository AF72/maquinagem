import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const PAGE_TITLES = {
  '/dashboard':        'Dashboard',
  '/clientes':         'Clientes',
  '/pedidos':          'Pedidos',
  '/orcamentos':       'Orçamentos',
  '/ordens':           'Ordens de Trabalho',
  '/custos':           'Custos',
  '/pecas':            'Peças',
  '/materia-prima':    'Matéria Prima',
  '/colaboradores-dm': 'Colaboradores DM',
  '/fornecedores':     'Fornecedores',
  '/processos':        'Processos',
};

function getTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/pedidos/'))       return 'Detalhe do Pedido';
  if (pathname.startsWith('/orcamentos/'))    return 'Detalhe do Orçamento';
  if (pathname.startsWith('/ordens/'))        return 'Detalhe da Ordem de Trabalho';
  if (pathname.startsWith('/pecas/'))         return 'Detalhe da Peça';
  if (pathname.startsWith('/materia-prima/')) return 'Detalhe de Matéria Prima';
  return '';
}

export default function Topbar() {
  const location = useLocation();
  const title = getTitle(location.pathname);

  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const hora = clock.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  const data = clock.toLocaleDateString('pt-PT', { weekday: 'short', day: '2-digit', month: 'short' });

  return (
    <div className="topbar">
      <div id="page-title" style={{ fontWeight: 600, fontSize: 16 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
        {data} &nbsp;·&nbsp; {hora}
      </div>
    </div>
  );
}
