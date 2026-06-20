// public/admin/sermons.js
let allSermons = [];

// ---------- Load Sermons ----------
async function loadSermons() {
  try {
    allSermons = await apiRequest('/sermons');
    renderSermons(allSermons);
  } catch (err) {
    console.error(err);
    document.getElementById('sermonsTableBody').innerHTML =
      '<tr><td colspan="5" class="p-3 text-center text-red-500">Failed to load sermons</td></tr>';
  }
}

// ---------- Render Table ----------
function renderSermons(sermons) {
  const tbody = document.getElementById('sermonsTableBody');
  if (sermons.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="p-3 text-center text-gray-500">No sermons found</td></tr>';
    return;
  }

  tbody.innerHTML = sermons.map(s => `
    <tr class="border-b hover:bg-gray-50">
      <td class="p-3">${s.title}</td>
      <td class="p-3">${s.speaker}</td>
      <td class="p-3">${new Date(s.date).toLocaleDateString()}</td>
      <td class="p-3">${s.views || 0}</td>
      <td class="p-3">
        <button onclick="editSermon(${s.id})" class="text-blue-600 hover:underline mr-2">Edit</button>
        <button onclick="deleteSermon(${s.id})" class="text-red-600 hover:underline">Delete</button>
      </td>
    </tr>
  `).join('');
}

// ---------- Search Filter ----------
document.getElementById('searchInput').addEventListener('input', function() {
  const query = this.value.toLowerCase();
  const filtered = allSermons.filter(s =>
    s.title.toLowerCase().includes(query) ||
    s.speaker.toLowerCase().includes(query)
  );
  renderSermons(filtered);
});

// ---------- Modal Controls ----------
function openAddModal() {
  document.getElementById('modalTitle').textContent = 'Add Sermon';
  document.getElementById('sermonForm').reset();
  document.getElementById('sermonId').value = '';
  document.getElementById('sermonModal').classList.add('open');
}

function openEditModal(sermon) {
  document.getElementById('modalTitle').textContent = 'Edit Sermon';
  document.getElementById('sermonId').value = sermon.id;
  document.getElementById('title').value = sermon.title;
  document.getElementById('speaker').value = sermon.speaker;
  document.getElementById('scripture').value = sermon.scripture || '';
  document.getElementById('description').value = sermon.description || '';
  document.getElementById('audioUrl').value = sermon.audio_url || '';
  document.getElementById('videoUrl').value = sermon.video_url || '';
  document.getElementById('date').value = sermon.date;
  document.getElementById('sermonModal').classList.add('open');
}

function closeModal() {
  document.getElementById('sermonModal').classList.remove('open');
}

// ---------- Edit Sermon ----------
async function editSermon(id) {
  try {
    const sermon = await apiRequest(`/sermons/${id}`);
    openEditModal(sermon);
  } catch (err) {
    alert('Failed to load sermon details');
  }
}

// ---------- Delete Sermon ----------
async function deleteSermon(id) {
  if (!confirm('Delete this sermon?')) return;
  try {
    await apiRequest(`/sermons/${id}`, { method: 'DELETE' });
    loadSermons();
  } catch (err) {
    alert('Failed to delete sermon');
  }
}

// ---------- Form Submit (Add/Edit) ----------
document.getElementById('sermonForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const id = document.getElementById('sermonId').value;
  const data = {
    title: document.getElementById('title').value,
    speaker: document.getElementById('speaker').value,
    scripture: document.getElementById('scripture').value,
    description: document.getElementById('description').value,
    audio_url: document.getElementById('audioUrl').value,
    video_url: document.getElementById('videoUrl').value,
    date: document.getElementById('date').value
  };

  try {
    if (id) {
      await apiRequest(`/sermons/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } else {
      await apiRequest('/sermons', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
    closeModal();
    loadSermons();
  } catch (err) {
    alert('Failed to save sermon');
  }
});

// ---------- Load on page load ----------
loadSermons();