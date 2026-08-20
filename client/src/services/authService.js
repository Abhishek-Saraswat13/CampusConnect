import api from './api';

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  return res.data.data; // { token, user }
}

export async function register(name, email, password) {
  const res = await api.post('/auth/register', { name, email, password });
  return res.data.data;
}

export async function fetchMe() {
  const res = await api.get('/auth/me');
  return res.data.data;
}
