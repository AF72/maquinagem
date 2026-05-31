/**
 * Gestão de autenticação no frontend.
 * Token e dados do utilizador guardados em localStorage.
 */

const Auth = (() => {
  const KEY_TOKEN = 'maquinagest_token';
  const KEY_USER  = 'maquinagest_user';

  function getToken() {
    return localStorage.getItem(KEY_TOKEN);
  }

  function getUtilizador() {
    try { return JSON.parse(localStorage.getItem(KEY_USER)); } catch { return null; }
  }

  function isLoggedIn() {
    const token = getToken();
    if (!token) return false;
    try {
      // Verifica só a expiração sem validar a assinatura (validação real é no servidor)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch { return false; }
  }

  function setSession(token, utilizador) {
    localStorage.setItem(KEY_TOKEN, token);
    localStorage.setItem(KEY_USER, JSON.stringify(utilizador));
  }

  function clear() {
    localStorage.removeItem(KEY_TOKEN);
    localStorage.removeItem(KEY_USER);
  }

  async function login(email, password) {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erro || 'Erro ao fazer login');
    setSession(data.token, data.utilizador);
    return data.utilizador;
  }

  function logout() {
    clear();
    mostrarEcraLogin();
  }

  return { getToken, getUtilizador, isLoggedIn, login, logout, setSession, clear };
})();

/* ---------- Ecrã de login ---------- */

function mostrarEcraLogin() {
  document.getElementById('app-wrapper').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('login-erro').textContent = '';
  document.getElementById('login-email').focus();
}

function mostrarApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app-wrapper').style.display = 'flex';
  const u = Auth.getUtilizador();
  const nomeEl = document.getElementById('sidebar-user-nome');
  const roleEl = document.getElementById('sidebar-user-role');
  if (nomeEl) nomeEl.textContent = u?.nome || '';
  if (roleEl) roleEl.textContent = u?.role === 'admin' ? 'Administrador' : 'Operador';
}

async function submitLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const erroEl   = document.getElementById('login-erro');
  const btnEl    = document.getElementById('login-btn');

  erroEl.textContent = '';
  btnEl.disabled = true;
  btnEl.textContent = 'A entrar…';

  try {
    const utilizador = await Auth.login(email, password);
    mostrarApp();
    await carregarDados();
    renderAll();

    if (utilizador.primeiro_login) {
      abrirModalAlterarPassword(true);
    }
  } catch (err) {
    erroEl.textContent = err.message;
  } finally {
    btnEl.disabled = false;
    btnEl.textContent = 'Entrar';
  }
}

/* ---------- Modal de alterar password ---------- */

function abrirModalAlterarPassword(obrigatorio = false) {
  const overlay = document.getElementById('alterar-password-overlay');
  document.getElementById('ap-atual').value = '';
  document.getElementById('ap-nova').value = '';
  document.getElementById('ap-confirmar').value = '';
  document.getElementById('ap-erro').textContent = '';
  document.getElementById('ap-cancelar').style.display = obrigatorio ? 'none' : '';
  overlay.style.display = 'flex';
}

function fecharModalAlterarPassword() {
  document.getElementById('alterar-password-overlay').style.display = 'none';
}

async function submitAlterarPassword() {
  const atual     = document.getElementById('ap-atual').value;
  const nova      = document.getElementById('ap-nova').value;
  const confirmar = document.getElementById('ap-confirmar').value;
  const erroEl    = document.getElementById('ap-erro');
  const btnEl     = document.getElementById('ap-btn-save');

  erroEl.textContent = '';

  if (nova.length < 8) {
    erroEl.textContent = 'A nova password deve ter pelo menos 8 caracteres.';
    return;
  }
  if (nova !== confirmar) {
    erroEl.textContent = 'As passwords não coincidem.';
    return;
  }

  btnEl.disabled = true;
  try {
    const res = await fetch('http://localhost:3000/api/auth/alterar-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Auth.getToken()}`,
      },
      body: JSON.stringify({ password_atual: atual, password_nova: nova }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erro || 'Erro ao alterar password');

    // Atualiza o utilizador em sessão para primeiro_login = false
    const u = Auth.getUtilizador();
    if (u) { u.primeiro_login = false; Auth.setSession(Auth.getToken(), u); }

    fecharModalAlterarPassword();
    _successToast('Password alterada com sucesso.');
  } catch (err) {
    erroEl.textContent = err.message;
  } finally {
    btnEl.disabled = false;
  }
}
