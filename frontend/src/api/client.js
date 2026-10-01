const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers,
    credentials: 'include',       // send & receive cookies
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    // some endpoints may have no JSON body
  }

  if (!res.ok) {
    const error = new Error(data.error || 'Request failed');
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/users/me'),
};