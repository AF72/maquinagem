import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setOn401 } from '../lib/api';

const KEY_TOKEN = 'maquinagest_token';
const KEY_USER  = 'maquinagest_user';

const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ? 'http://localhost:3000/api'
  : 'https://maquinagem-production.up.railway.app/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(KEY_TOKEN));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY_USER)); } catch { return null; }
  });

  const isLoggedIn = useCallback(() => {
    if (!token) return false;
    try {
      // JWT usa base64url; atob() precisa de base64 standard
      const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(b64));
      return payload.exp * 1000 > Date.now();
    } catch { return false; }
  }, [token]);

  const setSession = useCallback((newToken, newUser) => {
    localStorage.setItem(KEY_TOKEN, newToken);
    localStorage.setItem(KEY_USER, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(KEY_TOKEN);
    localStorage.removeItem(KEY_USER);
    setToken(null);
    setUser(null);
  }, []);

  // Regista o callback de 401 na camada API para que sessões expiradas façam logout automático
  useEffect(() => {
    setOn401(logout);
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const res = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erro || 'Erro ao fazer login');
    setSession(data.token, data.utilizador);
    return data.utilizador;
  }, [setSession]);

  const alterarPassword = useCallback(async (passwordAtual, passwordNova) => {
    const res = await fetch(API_BASE + '/auth/alterar-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password_atual: passwordAtual, password_nova: passwordNova }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erro || 'Erro ao alterar password');

    const updatedUser = { ...user, primeiro_login: false };
    setSession(token, updatedUser);
  }, [token, user, setSession]);

  return (
    <AuthContext.Provider value={{ token, user, isLoggedIn, login, logout, alterarPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
