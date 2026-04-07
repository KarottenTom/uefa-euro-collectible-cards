const API_BASE = import.meta.env.VITE_API_BASE || 'https://uefa-euro-collectible-cards.vercel.app/_/backend/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || 'Request failed');
  }
  return payload;
};

export const register = (email, username, password) => request('/register', { method: 'POST', body: { email, username, password } });
export const login = (email, password) => request('/login', { method: 'POST', body: { email, password } });
export const fetchProfile = () => request('/me');
export const fetchCards = () => request('/cards');
export const fetchCardById = (id) => request(`/cards/${id}`);
export const fetchCollection = () => request('/user/collection');
export const openPack = () => request('/user/openPack', { method: 'POST' });
export const fetchPending = () => request('/admin/pending');
export const approveUser = (userId, approve) => request('/admin/approve', { method: 'POST', body: { userId, approve } });
export const fetchAdminStats = () => request('/admin/stats');
export const fetchAllUsers = () => request('/admin/users');
export const clearUserCollection = (userId) => request(`/admin/clearCollection/${userId}`, { method: 'DELETE' });
