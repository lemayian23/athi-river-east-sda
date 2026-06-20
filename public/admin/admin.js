// public/admin/admin.js
const API_BASE = 'http://localhost:3000/api';

// ---------- Token Management ----------
function getToken() {
  return localStorage.getItem('admin_token');
}

function setToken(token) {
  localStorage.setItem('admin_token', token);
}

function removeToken() {
  localStorage.removeItem('admin_token');
}

// ---------- Authenticated API Request ----------
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  if (!token) {
    console.warn('No token, redirecting to login');
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

// ---------- Logout ----------
function logout() {
  removeToken();
  window.location.href = '/admin/login.html';
}

// ---------- Toast Notification ----------
function showNotification(message, type = 'success') {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };
  const div = document.createElement('div');
  div.className = `fixed top-4 right-4 ${colors[type] || colors.info} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-500 transform translate-x-0`;
  div.textContent = message;
  document.body.appendChild(div);
  setTimeout(() => {
    div.style.opacity = '0';
    setTimeout(() => div.remove(), 500);
  }, 3000);
}

// ---------- Utility: Close modal on background click ----------
function setupModalClose(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('open');
      }
    });
  }
}

// ---------- Global: open/close modal functions (to be redefined per page) ----------
// We'll define them in each page, but we can also provide a generic version.