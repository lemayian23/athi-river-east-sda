// public/admin/admin.js
const API_BASE = 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('admin_token');
}

function removeToken() {
  localStorage.removeItem('admin_token');
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  if (!token) {
    window.location.href = '/admin/login.html';
    throw new Error('No token');
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
      removeToken();
      window.location.href = '/admin/login.html';
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'API request failed');
  }
  return response.json();
}

function logout() {
  removeToken();
  window.location.href = '/admin/login.html';
}

function showNotification(message, type = 'success') {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };
  const div = document.createElement('div');
  div.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-500 transform translate-x-full`;
  div.textContent = message;
  document.body.appendChild(div);
  setTimeout(() => div.classList.remove('translate-x-full'), 100);
  setTimeout(() => div.remove(), 4000);
}