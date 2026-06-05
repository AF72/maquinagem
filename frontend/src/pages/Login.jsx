import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useStore from '../store';

export default function Login() {
  const { login, user } = useAuth();
  const carregarDados  = useStore(s => s.carregarDados);
  const navigate       = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [erro,     setErro]     = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const utilizador = await login(email, password);
      await carregarDados();
      navigate('/dashboard');

      if (utilizador.primeiro_login) {
        // TODO: abrir modal de alterar password
      }
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="login-screen" style={{ display: 'flex', position: 'fixed', inset: 0, background: 'var(--color-bg, #f5f5f5)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }}>
      <div className="login-card" style={{ background: 'var(--color-surface, #fff)', borderRadius: 'var(--radius-lg, 12px)', boxShadow: '0 8px 32px rgba(0,0,0,.12)', padding: '2.5rem 2rem', width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <img src="/images/LOGO COR_A.png" alt="MaquinaGest" style={{ height: '7rem', objectFit: 'contain' }} />
        </div>
        <h1 style={{ textAlign: 'center', fontSize: 22, fontWeight: 700, margin: '0 0 .25rem', color: 'var(--color-text)' }}>MaquinaGest</h1>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-text-muted)', marginBottom: '1.75rem' }}>Gestão de Produção</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="utilizador@empresa.pt"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {erro && (
            <div style={{ fontSize: 13, color: 'var(--color-danger, #e53e3e)', marginBottom: '.75rem', minHeight: '1.2em' }}>
              {erro}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'A entrar…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
