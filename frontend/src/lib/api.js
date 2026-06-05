const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ? 'http://localhost:3000/api'
  : 'https://maquinagem-production.up.railway.app/api';

let _on401 = null;

export function setOn401(fn) {
  _on401 = fn;
}

function getToken() {
  return localStorage.getItem('maquinagest_token');
}

function authHeaders(withContentType = true) {
  const token = getToken();
  return {
    ...(withContentType ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function handle401(res) {
  if (res.status === 401) {
    if (_on401) _on401();
    throw new Error('Sessão expirada. Por favor faz login novamente.');
  }
}

export async function apiFetch(path) {
  const res = await fetch(API_BASE + path, { headers: authHeaders(false) });
  handle401(res);
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(body),
  });
  handle401(res);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro || `POST ${path} → ${res.status}`);
  }
  return res.json();
}

export async function apiPut(path, body) {
  const res = await fetch(API_BASE + path, {
    method: 'PUT',
    headers: authHeaders(true),
    body: JSON.stringify(body),
  });
  handle401(res);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro || `PUT ${path} → ${res.status}`);
  }
  return res.json();
}

export async function apiPatch(path, body) {
  const res = await fetch(API_BASE + path, {
    method: 'PATCH',
    headers: authHeaders(true),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  handle401(res);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro || `PATCH ${path} → ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function apiDelete(path) {
  const res = await fetch(API_BASE + path, {
    method: 'DELETE',
    headers: authHeaders(false),
  });
  handle401(res);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro || `DELETE ${path} → ${res.status}`);
  }
  return null;
}

// --- Mappers (snake_case → camelCase) ---

export function mapColaborador(c) {
  return { ...c, empresaId: c.empresa_id };
}

export function mapDadosPedido(dp) {
  const clean = v => (!v || v.toUpperCase() === 'NULL') ? null : v;
  return {
    ...dp,
    ref: clean(dp.ref),
    breveDescricao: dp.breve_descricao,
    data_rececao_oc: dp.data_rececao_oc?.slice(0, 10) ?? '',
  };
}

export function mapPedido(p) {
  return {
    ...p,
    clienteTipo: p.cliente_tipo,
    clienteId: p.colaborador_id ?? p.particular_id,
    dadosPedidoId: p.dados_pedido_id,
    data: p.data_pedido?.slice(0, 10) ?? '',
  };
}

export function mapOrdem(o) {
  return {
    ...o,
    pedidoId: o.pedido_id,
    moObra: Number(o.mo_obra ?? 0),
    prazo: o.prazo ?? null,
    dataLimiteEntrega: o.data_limite_entrega?.slice(0, 10) ?? '',
  };
}

export function mapOrcamento(o) {
  return {
    ...o,
    pedidoId: o.pedido_id,
    dataEmissao: o.data_emissao?.slice(0, 10) ?? '',
    dataValidade: o.data_validade?.slice(0, 10) ?? '',
    valor: Number(o.total_liquido ?? 0),
  };
}
