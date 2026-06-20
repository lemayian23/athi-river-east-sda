// public/assets/js/admin.js
const API_BASE = 'http://localhost:3000/api';

// Store token in localStorage
function setToken(token) {
  localStorage.setItem('admin_token', token);
}

function getToken() {
  return localStorage.getItem('admin_token');
}

function removeToken() {
  localStorage.removeItem('admin_token');
}

// Login function
async function login(username, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.token);
    }
    return data;
  } catch (err) {
    console.error(err);
    return { success: false, error: 'Network error' };
  }
}

// Logout
function logout() {
  removeToken();
}

// Authenticated API request
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  if (!token) {
    throw new Error('No token found');
  }

  const defaultOptions = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {})
    }
  };

  const response = await fetch(`${API_BASE}${endpoint}`, mergedOptions);
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid – redirect to login
      removeToken();
      window.location.href = '/admin/login.html';
      throw new Error('Unauthorized');
    }
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }
  return response.json();
}