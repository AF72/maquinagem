import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import useStore from '../../store';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout({ children }) {
  const { isLoggedIn } = useAuth();
  const carregarDados = useStore(s => s.carregarDados);
  const backendErro   = useStore(s => s.backendErro);

  useEffect(() => {
    if (isLoggedIn()) carregarDados();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="app">
      {backendErro && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: '#c0392b', color: '#fff',
          padding: '10px 16px', fontSize: 14, textAlign: 'center',
        }}>
          {backendErro}
        </div>
      )}
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
}
