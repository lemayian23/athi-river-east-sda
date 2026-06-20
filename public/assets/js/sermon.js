// public/assets/js/sermon.js
const API_BASE = 'http://localhost:3000/api';

// Get sermon ID from URL
function getSermonId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Load and render single sermon
async function loadSermon() {
  const sermonId = getSermonId();
  
  if (!sermonId) {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('errorState').classList.remove('hidden');
    document.getElementById('errorState').innerHTML = '<p class="text-red-500">❌ No sermon ID provided. <a href="/sermons.html" class="text-sda-blue underline">View all sermons</a></p>';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/sermons/${sermonId}`);
    
    if (!res.ok) {
      if (res.status === 404) {
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('errorState').classList.remove('hidden');
        return;
      }
      throw new Error('Failed to fetch sermon');
    }

    const sermon = await res.json();

    // Hide loading, show content
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('sermonContent').classList.remove('hidden');

    // Populate content
    document.getElementById('sermonTitle').textContent = sermon.title || 'Untitled Sermon';
    document.getElementById('sermonSpeaker').textContent = sermon.speaker || 'Unknown Speaker';
    document.getElementById('sermonDate').textContent = sermon.date ? new Date(sermon.date).toLocaleDateString() : 'Date unknown';
    document.getElementById('sermonViews').textContent = `Views: ${sermon.views || 0}`;
    document.getElementById('sermonScripture').textContent = sermon.scripture || 'No scripture reference';
    document.getElementById('sermonDescription').textContent = sermon.description || 'No description available.';

    // Audio player
    const audioContainer = document.getElementById('sermonAudio');
    if (sermon.audio_url) {
      audioContainer.innerHTML = `
        <audio controls class="w-full max-w-md">
          <source src="${sermon.audio_url}" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
        <p class="text-sm text-gray-500 mt-1"><a href="${sermon.audio_url}" download class="text-sda-blue hover:underline">Download MP3</a></p>
      `;
    } else {
      audioContainer.innerHTML = '<p class="text-gray-500">No audio available for this sermon.</p>';
    }

    // Video player
    const videoContainer = document.getElementById('sermonVideo');
    if (sermon.video_url) {
      // Check if it's a YouTube URL
      if (sermon.video_url.includes('youtube.com') || sermon.video_url.includes('youtu.be')) {
        const videoId = getYouTubeId(sermon.video_url);
        if (videoId) {
          videoContainer.innerHTML = `
            <div class="aspect-w-16 aspect-h-9">
              <iframe src="https://www.youtube.com/embed/${videoId}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
                class="w-full max-w-2xl h-64 md:h-96 rounded"></iframe>
            </div>
          `;
        } else {
          videoContainer.innerHTML = `<p class="text-gray-500"><a href="${sermon.video_url}" target="_blank" class="text-sda-blue hover:underline">Watch video</a></p>`;
        }
      } else {
        videoContainer.innerHTML = `<p class="text-gray-500"><a href="${sermon.video_url}" target="_blank" class="text-sda-blue hover:underline">Watch video</a></p>`;
      }
    } else {
      videoContainer.innerHTML = '<p class="text-gray-500">No video available for this sermon.</p>';
    }

    // Update page title
    document.title = `${sermon.title} - Athi River East SDA`;

  } catch (err) {
    console.error(err);
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('errorState').classList.remove('hidden');
  }
}

// Helper function to extract YouTube video ID
function getYouTubeId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Load on page load
document.addEventListener('DOMContentLoaded', loadSermon);