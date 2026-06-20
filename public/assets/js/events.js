// public/assets/js/events.js
const API_BASE = 'http://localhost:3000/api';
let allEvents = [];
let currentFilter = 'upcoming'; // upcoming, past, all

// Load all events
async function loadEvents() {
  try {
    const res = await fetch(`${API_BASE}/events`);
    if (!res.ok) throw new Error('Failed to fetch events');
    allEvents = await res.json();
    renderEvents(currentFilter);
  } catch (err) {
    console.error(err);
    document.getElementById('eventsList').innerHTML = '<p class="text-red-500">Error loading events. Please try again later.</p>';
  }
}

// Render events based on filter
function renderEvents(filter) {
  const container = document.getElementById('eventsList');
  const now = new Date();

  let filtered = allEvents;
  if (filter === 'upcoming') {
    filtered = allEvents.filter(e => new Date(e.event_date) >= now);
  } else if (filter === 'past') {
    filtered = allEvents.filter(e => new Date(e.event_date) < now);
  }
  // 'all' shows everything

  // Sort by date ascending
  filtered.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

  if (filtered.length === 0) {
    container.innerHTML = `<p class="text-gray-500">No ${filter !== 'all' ? filter : ''} events found.</p>`;
    return;
  }

  container.innerHTML = filtered.map(event => `
    <div class="border-b border-gray-200 pb-4 mb-4 last:border-0 last:mb-0">
      <div class="flex flex-col md:flex-row md:justify-between">
        <div>
          <h3 class="text-xl font-semibold text-sda-light-blue">${event.title}</h3>
          ${event.description ? `<p class="text-gray-600 mt-1">${event.description}</p>` : ''}
          <p class="text-sm text-gray-500 mt-1">
            📅 ${new Date(event.event_date).toLocaleString()}
            ${event.location ? ` • 📍 ${event.location}` : ''}
          </p>
          ${event.end_date ? `<p class="text-sm text-gray-500">Ends: ${new Date(event.end_date).toLocaleString()}</p>` : ''}
          ${event.image_url ? `<img src="${event.image_url}" alt="${event.title}" class="mt-2 max-h-40 rounded object-cover">` : ''}
        </div>
        <div class="mt-2 md:mt-0">
          <span class="text-sm text-gray-500">${new Date(event.event_date) >= new Date() ? '🟢 Upcoming' : '🔴 Past'}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// Set up filter tab switching
function setupFilters() {
  document.getElementById('upcomingTab').addEventListener('click', () => {
    currentFilter = 'upcoming';
    updateTabStyles('upcoming');
    renderEvents('upcoming');
  });
  document.getElementById('pastTab').addEventListener('click', () => {
    currentFilter = 'past';
    updateTabStyles('past');
    renderEvents('past');
  });
  document.getElementById('allTab').addEventListener('click', () => {
    currentFilter = 'all';
    updateTabStyles('all');
    renderEvents('all');
  });
}

function updateTabStyles(active) {
  const tabs = ['upcoming', 'past', 'all'];
  tabs.forEach(id => {
    const el = document.getElementById(id + 'Tab');
    if (id === active) {
      el.className = 'py-2 px-4 text-sda-light-blue border-b-2 border-sda-gold font-semibold';
    } else {
      el.className = 'py-2 px-4 text-gray-500 hover:text-sda-light-blue';
    }
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadEvents();
  setupFilters();
});