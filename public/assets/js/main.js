// public/assets/js/main.js
const API_BASE = 'http://localhost:3000/api';

// ========== Load Settings ==========
async function loadSettings() {
  try {
    const res = await fetch(`${API_BASE}/settings/public`);
    const settings = await res.json();
    
    // Populate header
    document.getElementById('churchName').textContent = settings.church_name || 'Athi River East SDA Church';
    document.getElementById('footerChurchName').textContent = settings.church_name || '';
    document.getElementById('footerAddress').textContent = settings.church_address || '';
    document.getElementById('footerPhone').textContent = settings.church_phone || '';
    
    // Welcome
    document.getElementById('welcomeMessage').textContent = settings.welcome_message || 'Welcome to our church!';
    
    // Service times
    document.getElementById('sabbathSchoolTime').textContent = settings.sabbath_school_time || '--';
    document.getElementById('divineServiceTime').textContent = settings.divine_service_time || '--';
    document.getElementById('vespersTime').textContent = settings.vespers_time || '--';
    
    // Giving
    document.getElementById('paybillNumber').textContent = settings.paybill_number || '803300';
    document.getElementById('paybillAccount').textContent = settings.paybill_account || 'ATHI RIVER EAST';
    
    return settings;
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
}

// ========== Load Recent Sermons ==========
async function loadRecentSermons() {
  try {
    const res = await fetch(`${API_BASE}/sermons`);
    const sermons = await res.json();
    const list = document.getElementById('recentSermonsList');
    
    if (sermons.length === 0) {
      list.innerHTML = '<p class="text-gray-500">No sermons available yet.</p>';
      return;
    }
    
    // Show latest 3
    const recent = sermons.slice(0, 3);
    list.innerHTML = recent.map(s => `
      <div class="border-b py-2">
        <p class="font-semibold">${s.title}</p>
        <p class="text-sm text-gray-600">${s.speaker} • ${new Date(s.date).toLocaleDateString()}</p>
        ${s.audio_url ? `<audio controls class="w-full mt-1" src="${s.audio_url}"></audio>` : ''}
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load sermons:', err);
    document.getElementById('recentSermonsList').innerHTML = '<p class="text-red-500">Error loading sermons</p>';
  }
}

// ========== Load Upcoming Events ==========
async function loadUpcomingEvents() {
  try {
    const res = await fetch(`${API_BASE}/events/upcoming`);
    const events = await res.json();
    const list = document.getElementById('upcomingEventsList');
    
    if (events.length === 0) {
      list.innerHTML = '<p class="text-gray-500">No upcoming events.</p>';
      return;
    }
    
    list.innerHTML = events.map(e => `
      <div class="border-b py-2">
        <p class="font-semibold">${e.title}</p>
        <p class="text-sm text-gray-600">${new Date(e.event_date).toLocaleDateString()} ${e.location ? '• ' + e.location : ''}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load events:', err);
    document.getElementById('upcomingEventsList').innerHTML = '<p class="text-red-500">Error loading events</p>';
  }
}

// ========== Sabbath Countdown ==========
function startSabbathCountdown() {
  function update() {
    const now = new Date();
    const day = now.getDay(); // 5 = Friday, 6 = Saturday
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Find next Friday 6pm
    let target = new Date(now);
    let daysUntilFriday = (5 - day + 7) % 7;
    if (day === 5 && hours >= 18) daysUntilFriday = 7;
    target.setDate(now.getDate() + daysUntilFriday);
    target.setHours(18, 0, 0, 0);
    
    // Check if currently in Sabbath (Friday 18:00 -> Saturday 18:00)
    const isSabbath = (day === 5 && hours >= 18) || (day === 6 && hours < 18);
    
    const diff = target - now;
    const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((diff % (86400000)) / 3600000);
    const minutesLeft = Math.floor((diff % 3600000) / 60000);
    const secondsLeft = Math.floor((diff % 60000) / 1000);
    
    document.getElementById('days').textContent = String(daysLeft).padStart(2, '0');
    document.getElementById('hours').textContent = String(hoursLeft).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutesLeft).padStart(2, '0');
    document.getElementById('seconds').textContent = String(secondsLeft).padStart(2, '0');
    
    const statusEl = document.getElementById('sabbathStatus');
    if (isSabbath) {
      statusEl.innerHTML = '🕯️ <strong>It is SABBATH!</strong> From Friday 6pm to Saturday 6pm';
    } else {
      statusEl.innerHTML = '⏳ Preparing for the next Sabbath';
    }
  }
  
  update();
  setInterval(update, 1000);
}

// ========== Prayer Form ==========
document.getElementById('prayerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('prayerName').value;
  const request = document.getElementById('prayerRequest').value;
  const messageEl = document.getElementById('prayerMessage');
  
  if (!request.trim()) {
    messageEl.innerHTML = '<span class="text-red-500">Please enter a prayer request.</span>';
    return;
  }
  
  try {
    const res = await fetch(`${API_BASE}/prayers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, request })
    });
    const data = await res.json();
    if (data.success) {
      messageEl.innerHTML = '<span class="text-green-600">✅ Prayer request submitted! Our team will pray for you.</span>';
      document.getElementById('prayerForm').reset();
    } else {
      messageEl.innerHTML = `<span class="text-red-500">❌ ${data.error || 'Submission failed'}</span>`;
    }
  } catch (err) {
    messageEl.innerHTML = '<span class="text-red-500">❌ Network error. Please try again.</span>';
  }
});

// ========== Copy Paybill ==========
window.copyPaybill = function() {
  const paybill = document.getElementById('paybillNumber').textContent;
  navigator.clipboard.writeText(paybill).then(() => {
    alert('Paybill number copied: ' + paybill);
  }).catch(() => {
    prompt('Copy the Paybill number manually:', paybill);
  });
};

// ========== Initialize ==========
loadSettings().then(() => {
  // Load other content after settings are available
  loadRecentSermons();
  loadUpcomingEvents();
  startSabbathCountdown();
});