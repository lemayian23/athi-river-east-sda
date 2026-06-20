// public/assets/js/sermons.js
const API_BASE = 'http://localhost:3000/api';

// Load and render all sermons
async function loadSermons() {
  try {
    const res = await fetch(`${API_BASE}/sermons`);
    if (!res.ok) throw new Error('Failed to fetch sermons');
    const sermons = await res.json();
    
    const container = document.getElementById('sermonsList');
    if (sermons.length === 0) {
      container.innerHTML = '<p class="text-gray-500">No sermons available yet.</p>';
      return;
    }

    // Render each sermon
    container.innerHTML = sermons.map(sermon => `
      <div class="border-b border-gray-200 pb-4 mb-4 last:border-0 last:mb-0" data-title="${sermon.title}" data-speaker="${sermon.speaker}">
        <div class="flex flex-col md:flex-row md:justify-between">
          <div>
            <h3 class="text-xl font-semibold text-sda-light-blue">
              <a href="/sermon.html?id=${sermon.id}" class="hover:text-sda-gold">${sermon.title}</a>
            </h3>
            <p class="text-sm text-gray-600">Speaker: ${sermon.speaker}</p>
            <p class="text-sm text-gray-500">Date: ${new Date(sermon.date).toLocaleDateString()}</p>
            ${sermon.scripture ? `<p class="text-sm text-gray-500">Scripture: ${sermon.scripture}</p>` : ''}
            <div class="mt-2">
              ${sermon.audio_url ? `<audio controls class="w-full max-w-xs" src="${sermon.audio_url}"></audio>` : ''}
            </div>
          </div>
          <div class="mt-2 md:mt-0">
            <span class="text-sm text-gray-500">Views: ${sermon.views || 0}</span>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
    document.getElementById('sermonsList').innerHTML = '<p class="text-red-500">Error loading sermons. Please try again later.</p>';
  }
}

// Live search filter
function setupSearch() {
  const input = document.getElementById('searchInput');
  input.addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const items = document.querySelectorAll('#sermonsList > div[data-title]');
    items.forEach(item => {
      const title = item.dataset.title.toLowerCase();
      const speaker = item.dataset.speaker.toLowerCase();
      const match = title.includes(query) || speaker.includes(query);
      item.style.display = match ? 'block' : 'none';
    });
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSermons();
  setupSearch();
});