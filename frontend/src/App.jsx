import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard       from './pages/Dashboard';
import Clientes        from './pages/Clientes';
import Pedidos         from './pages/Pedidos';
import Orcamentos      from './pages/Orcamentos';
import Ordens          from './pages/Ordens';
import Custos          from './pages/Custos';
import Pecas           from './pages/Pecas';
import MateriaPrima    from './pages/MateriaPrima';
import ColaboradoresDm from './pages/ColaboradoresDm';
import Fornecedores    from './pages/Fornecedores';
import Processos       from './pages/Processos';

function ProtectedRoutes() {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn()) return <Navigate to="/login" replace />;

  return (
    <Layout>
      <Routes>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"       element={<Dashboard />} />
        <Route path="clientes"        element={<Clientes />} />
        <Route path="pedidos"          element={<Pedidos />} />
        <Route path="pedidos/:id"     element={<Pedidos />} />
        <Route path="orcamentos"      element={<Orcamentos />} />
        <Route path="orcamentos/:id"  element={<Orcamentos />} />
        <Route path="ordens"          element={<Ordens />} />
        <Route path="ordens/:id"      element={<Ordens />} />
        <Route path="custos"          element={<Custos />} />
        <Route path="pecas"           element={<Pecas />} />
        <Route path="pecas/:id"       element={<Pecas />} />
        <Route path="materia-prima"         element={<MateriaPrima />} />
        <Route path="materia-prima/:id"     element={<MateriaPrima />} />
        <Route path="colaboradores-dm"      element={<ColaboradoresDm />} />
        <Route path="fornecedores"          element={<Fornecedores />} />
        <Route path="processos"             element={<Processos />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*"     element={<ProtectedRoutes />} />
      </Routes>
    </AuthProvider>
  );
}
