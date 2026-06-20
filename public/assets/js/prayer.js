// public/assets/js/prayer.js
const API_BASE = 'http://localhost:3000/api';

// Load public prayers
async function loadPublicPrayers() {
  const container = document.getElementById('publicPrayers');
  try {
    const res = await fetch(`${API_BASE}/prayers`);
    if (!res.ok) throw new Error('Failed to fetch prayers');
    const prayers = await res.json();

    // Show only public, unanswered prayers
    const publicPrayers = prayers.filter(p => p.is_public === 1 && p.is_answered === 0);

    if (publicPrayers.length === 0) {
      container.innerHTML = '<p class="text-gray-500">No public prayers yet. Be the first to share!</p>';
      return;
    }

    container.innerHTML = publicPrayers.map(p => `
      <div class="border-b border-gray-200 pb-3 last:border-0">
        <p class="text-gray-800">"${p.request}"</p>
        ${p.name ? `<p class="text-sm text-gray-500 mt-1">— ${p.name}</p>` : ''}
        <p class="text-xs text-gray-400 mt-1">${new Date(p.created_at).toLocaleDateString()}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p class="text-red-500">Error loading prayers. Please refresh.</p>';
  }
}

// Submit prayer request
document.getElementById('prayerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('prayerName').value;
  const email = document.getElementById('prayerEmail').value;
  const request = document.getElementById('prayerRequest').value;
  const isPublic = document.getElementById('prayerPublic').checked;
  const messageEl = document.getElementById('prayerMessage');

  if (!request.trim()) {
    messageEl.innerHTML = '<span class="text-red-500">Please enter your prayer request.</span>';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/prayers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, request, is_public: isPublic ? 1 : 0 })
    });
    const data = await res.json();

    if (data.success) {
      messageEl.innerHTML = '<span class="text-green-600">✅ Prayer request submitted! Our team will pray for you.</span>';
      document.getElementById('prayerForm').reset();
      document.getElementById('prayerPublic').checked = false;
      // Reload public prayers
      loadPublicPrayers();
    } else {
      messageEl.innerHTML = `<span class="text-red-500">❌ ${data.error || 'Submission failed'}</span>`;
    }
  } catch (err) {
    messageEl.innerHTML = '<span class="text-red-500">❌ Network error. Please try again.</span>';
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', loadPublicPrayers);