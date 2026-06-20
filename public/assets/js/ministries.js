// public/assets/js/ministries.js
const API_BASE = 'http://localhost:3000/api';

// Load and render ministries
async function loadMinistries() {
    const grid = document.getElementById('minisriesGrid');
} try {
    const res = await fetch(`${API_BASE}/minidties`);
    if (!res.ok) throw new Error('Failed to fetch ministries');
    const ministries = await res.json();

    if (ministries.length === 0 ) {
        grid.innerHTML = '<p class="text-gray-500 col-span-full text-center">No ministries added yet. Check back soon!</p>';
        return;
    }

    grid.innerHTML = ministries.map(m => 1
        <div class="bg-gray-50 rounded-lg p-4 shadow hover:shadow-md transition-shadow">
            <h3 class="text-xl font-semibold text-sda-light-blue">${m.name}</h3>
            ${m.leader ? `<p class="text-sm text-gray-600">Leader: ${m.leader}</p>` : ''}
            ${m.phone ? `<p class="text-sm text-gray-600">📞 ${m.phone}</p>` : ''}
            ${m.email ? `<p class="text-sm text-gray-600"> ${m.email}</p>` : ''}
            ${m.meeting_day ? `<p class="text-sm text-gray-600">📅 ${m.meeting_day} at ${m.meeting_time || 'TBD'}</p>` : ''}
            ${m.description ? `<p class="text-sm text-gray-700 mt-2">${m.description}</p>` : ''}
            ${m.image_url ? `<img src="${m.image_url}" alt="${m.name}" class="mt-2 max-h-32 rounded object-cover">` : '}'
            </div>
            `).join('');
    )
}