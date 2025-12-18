// Default settings - all platforms hidden by default
const DEFAULT_SETTINGS = {
  claude: true,
  chatgpt: true,
  gemini: true,
};

// Map platforms to their URL patterns
const PLATFORM_PATTERNS = {
  claude: ["claude.ai"],
  chatgpt: ["chat.openai.com", "chatgpt.com"],
  gemini: ["gemini.google.com"],
};

// Get platform from URL
function getPlatformFromUrl(url) {
  try {
    const hostname = new URL(url).hostname;
    for (const [platform, domains] of Object.entries(PLATFORM_PATTERNS)) {
      if (domains.some((domain) => hostname.includes(domain))) {
        return platform;
      }
    }
  } catch (e) {
    // Invalid URL
  }
  return null;
}

// Inject or remove CSS for a tab
async function updateTab(tabId, url) {
  const platform = getPlatformFromUrl(url);
  if (!platform) return { success: true, skipped: true };

  const result = await chrome.storage.sync.get("settings");
  const settings = result.settings || DEFAULT_SETTINGS;

  try {
    if (settings[platform]) {
      // Inject the CSS early to prevent flash of visible buttons
      await chrome.scripting.insertCSS({
        target: { tabId },
        files: [`styles/${platform}.css`],
      });
      return { success: true, platform, action: "injected" };
    } else {
      // Remove the CSS
      await chrome.scripting.removeCSS({
        target: { tabId },
        files: [`styles/${platform}.css`],
      });
      return { success: true, platform, action: "removed" };
    }
  } catch (e) {
    // Tab might not be ready or might be a restricted page
    console.warn(`Could not update tab ${tabId} (${platform}):`, e.message);
    return { success: false, platform, error: e.message };
  }
}

// Update all matching tabs when settings change
async function updateAllTabs(settings) {
  const tabs = await chrome.tabs.query({});

  // Update tabs in parallel for better performance
  const updatePromises = tabs
    .filter((tab) => tab.url)
    .map((tab) => updateTab(tab.id, tab.url));

  const results = await Promise.allSettled(updatePromises);

  // Log any failures for debugging
  const failures = results.filter(
    (r) =>
      r.status === "rejected" ||
      (r.status === "fulfilled" &&
        r.value &&
        !r.value.success &&
        !r.value.skipped)
  );
  if (failures.length > 0) {
    console.warn(`Failed to update ${failures.length} tab(s)`);
  }

  return results;
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Try to inject CSS as early as possible to prevent flash
  // Try on 'loading' first, fallback to 'complete' if that fails
  if (tab.url && changeInfo.status) {
    const platform = getPlatformFromUrl(tab.url);
    if (platform) {
      if (changeInfo.status === "loading") {
        // Try early injection (may fail if page not ready, that's OK)
        updateTab(tabId, tab.url).catch(() => {
          // Will retry on 'complete'
        });
      } else if (changeInfo.status === "complete") {
        // Ensure CSS is applied when page fully loads
        updateTab(tabId, tab.url).catch((err) => {
          console.warn(`Failed to update tab ${tabId}:`, err);
        });
      }
    }
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "settingsUpdated") {
    // Handle async operation properly
    updateAllTabs(message.settings)
      .then((results) => {
        const successCount = results.filter(
          (r) =>
            r.status === "fulfilled" &&
            r.value &&
            r.value.success &&
            !r.value.skipped
        ).length;
        sendResponse({ success: true, updatedTabs: successCount });
      })
      .catch((error) => {
        console.error("Error updating tabs:", error);
        sendResponse({ success: false, error: error.message });
      });

    // Return true to indicate we will send a response asynchronously
    return true;
  }
});

// Initialize settings on install
chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.sync.get("settings");
  if (!result.settings) {
    await chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
  }
});
