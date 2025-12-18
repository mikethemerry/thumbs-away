// Default settings - all platforms hidden by default
const DEFAULT_SETTINGS = {
  claude: true,
  chatgpt: true,
  gemini: true
};

// Load settings and update UI
async function loadSettings() {
  const result = await chrome.storage.sync.get('settings');
  const settings = result.settings || DEFAULT_SETTINGS;
  
  document.getElementById('toggle-claude').checked = settings.claude;
  document.getElementById('toggle-chatgpt').checked = settings.chatgpt;
  document.getElementById('toggle-gemini').checked = settings.gemini;
  
  updateStatus(settings);
}

// Save settings to storage
async function saveSettings(settings) {
  try {
    await chrome.storage.sync.set({ settings });
    updateStatus(settings);
    
    // Notify background script to update active tabs and get feedback
    try {
      const response = await chrome.runtime.sendMessage({ type: 'settingsUpdated', settings });
      if (response && response.success) {
        if (response.updatedTabs > 0) {
          showTemporaryStatus(`Updated ${response.updatedTabs} tab(s)`, true);
        }
      } else if (response && response.error) {
        console.warn('Error updating tabs:', response.error);
        showTemporaryStatus('Settings saved, but some tabs may need refresh', false);
      }
    } catch (e) {
      // Background script might not be ready, but settings are saved
      console.log('Could not communicate with background script:', e.message);
    }
  } catch (e) {
    console.error('Failed to save settings:', e);
    showTemporaryStatus('Failed to save settings', false);
  }
}

// Update status text
function updateStatus(settings) {
  const statusEl = document.getElementById('status');
  const activeCount = [settings.claude, settings.chatgpt, settings.gemini].filter(Boolean).length;
  
  if (activeCount === 3) {
    statusEl.textContent = 'Feedback buttons hidden on all platforms';
    statusEl.className = 'status active';
  } else if (activeCount === 0) {
    statusEl.textContent = 'Feedback buttons visible on all platforms';
    statusEl.className = 'status';
  } else {
    const platforms = [];
    if (settings.claude) platforms.push('Claude');
    if (settings.chatgpt) platforms.push('ChatGPT');
    if (settings.gemini) platforms.push('Gemini');
    statusEl.textContent = `Hidden on: ${platforms.join(', ')}`;
    statusEl.className = 'status active';
  }
}

// Show temporary status message
function showTemporaryStatus(message, isSuccess) {
  const statusEl = document.getElementById('status');
  const originalText = statusEl.textContent;
  const originalClass = statusEl.className;
  
  statusEl.textContent = message;
  statusEl.className = isSuccess ? 'status active' : 'status';
  
  setTimeout(() => {
    statusEl.textContent = originalText;
    statusEl.className = originalClass;
  }, 2000);
}

// Get current settings from UI
function getCurrentSettings() {
  return {
    claude: document.getElementById('toggle-claude').checked,
    chatgpt: document.getElementById('toggle-chatgpt').checked,
    gemini: document.getElementById('toggle-gemini').checked
  };
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  
  // Add event listeners to toggles
  ['claude', 'chatgpt', 'gemini'].forEach(platform => {
    document.getElementById(`toggle-${platform}`).addEventListener('change', () => {
      saveSettings(getCurrentSettings());
    });
  });
});
