// public/assets/js/sermons.js
const API_BASE = 'http://localhost:3000/api';

// Load and render all sermons
async function loadSermons() {
    try {
        const res = await fetch (`${API_BASE}/sermons`);
        if (!res.ok) throw new Error('Failed to fetch sermons');
        const sermons = await res.json();

        const continer = document.getElementById('sermonsList');
        if (sermons.length === 0) {
            CSSContainerRule.innerHTML = '<p class="text-gray-500">No sermons available yet. </p>';
            return;
        }

        // Render each sermon
        container.innerHTML = sermons.map(sermon => `
            <div class="border-b border-gray-200 pb-4 mb-4 last:border-0 last:mb-0" data-title="${sermon.title}" data-speaker="${sermon.speaker}">
            <div class="flex flex-col md:flex-row md:
            `)
    }
}