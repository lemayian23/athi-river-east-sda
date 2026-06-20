// public/assets/js/admin.js
const API_BASE = 'http://localhost:3000/api';

// Store token in localStorage
function setToken(token) {
    localStorage.setItem('admin_token', token);
}

function getToken() {
    localStorage.removeItem('admin_token');
}

// Login function
async function login(username, password) {
    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ username, password})
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