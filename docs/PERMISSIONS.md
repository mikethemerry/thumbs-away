# Permission Justifications

This document provides detailed justifications for each permission requested by the Thumbs Away extension, explaining why each permission is necessary for the extension's functionality.

## Overview

Thumbs Away requests minimal permissions required to function. All permissions are scoped to the specific functionality needed to hide feedback buttons on AI chat platforms. The extension does not request broad permissions that would allow access to unrelated websites or user data.

## Standard Permissions

### `storage`

**Purpose**: Persist user preferences across browser sessions and sync settings across devices.

**Justification**:
- The extension stores user toggle preferences (which platforms should have feedback buttons hidden)
- Uses Chrome's `chrome.storage.sync` API to save settings
- Settings need to persist when the browser is closed and reopened
- Sync storage allows preferences to follow users across their Chrome browsers (via their Google account)
- This is essential for the "per-platform toggles" feature

**Code Usage**:
- `background.js`: Lines 35, 137-139 - Reading and initializing settings
- `popup.js`: Lines 10, 23 - Reading and saving user preferences

**Privacy Impact**: Low - Only stores boolean preferences for three platforms. No personal data or conversation content is stored.

**Alternative Considered**: `storage.local` was considered but rejected because users benefit from syncing preferences across devices.

---

### `activeTab`

**Purpose**: Access the currently active tab when the user interacts with the extension.

**Justification**:
- Required to apply CSS changes immediately when users toggle settings via the popup
- Allows the extension to access tab information when the user clicks the extension icon
- Works in conjunction with `scripting` permission to inject CSS into the active tab
- More privacy-friendly than requesting broad `tabs` permission, as it only grants access when the user explicitly invokes the extension

**Code Usage**:
- Used implicitly when `chrome.scripting.insertCSS()` and `chrome.scripting.removeCSS()` are called on tabs
- Enables the "instant updates" feature - changes apply immediately without page refresh

**Privacy Impact**: Low - Only accesses tabs when the user explicitly clicks the extension icon. No background tab access.

**Note**: The code uses `chrome.tabs.query({})` in `background.js` line 63 to update all matching tabs. In Manifest V3, querying all tabs may require the `tabs` permission instead of `activeTab`. However, with host_permissions, Chrome may allow querying tabs matching those hosts. If issues arise, consider either:
1. Adding `tabs` permission (less privacy-friendly but more reliable)
2. Modifying the code to query only tabs matching host_permissions: `chrome.tabs.query({url: ['https://claude.ai/*', 'https://chat.openai.com/*', 'https://chatgpt.com/*', 'https://gemini.google.com/*']})`

**Alternative Considered**: `tabs` permission was considered but rejected because it would grant access to all tabs at all times, which is unnecessary and less privacy-friendly.

---

### `scripting`

**Purpose**: Dynamically inject and remove CSS stylesheets to hide/show feedback buttons.

**Justification**:
- Core functionality requires injecting platform-specific CSS files (`styles/claude.css`, `styles/chatgpt.css`, `styles/gemini.css`)
- CSS must be injected/removed dynamically based on user preferences
- Required for the "instant updates" feature - CSS can be added or removed without page refresh
- Uses `chrome.scripting.insertCSS()` and `chrome.scripting.removeCSS()` APIs

**Code Usage**:
- `background.js`: Lines 41-44, 48-51 - Injecting and removing CSS based on settings
- `background.js`: Lines 89-108 - Injecting CSS when tabs load to prevent flash of visible buttons

**Privacy Impact**: Low - Only injects CSS rules to hide elements. Does not execute JavaScript or access page content. CSS injection is read-only styling.

**Alternative Considered**: Content scripts were considered but rejected because they require page reloads. The scripting API allows dynamic injection without reloads.

---

## Host Permissions

### `https://claude.ai/*`
### `https://chat.openai.com/*`
### `https://chatgpt.com/*`
### `https://gemini.google.com/*`

**Purpose**: Grant the extension permission to inject CSS on the specific AI chat platforms.

**Justification**:
- Required for `scripting` API to work on these domains
- Chrome's security model requires explicit host permissions for any website the extension needs to modify
- These are the only four domains where the extension needs to function
- Scoped to exact domains - no wildcard patterns that would grant access to other sites
- Includes both `chat.openai.com` and `chatgpt.com` because OpenAI uses both domains for ChatGPT

**Code Usage**:
- `background.js`: Lines 16-28 - Platform detection from URLs
- `background.js`: Lines 31-59 - CSS injection/removal on matching platforms
- `background.js`: Lines 89-108 - Automatic CSS injection on page load

**Privacy Impact**: Low - Only grants access to the three AI platforms. No access to any other websites, including subdomains or related services.

**Alternative Considered**: 
- `*://*/*` (all websites) was never considered - too broad and unnecessary
- Individual subdomain permissions were considered but the `/*` pattern covers all subdomains and paths, which is appropriate for these platforms

---

## Permissions NOT Requested

The extension deliberately does **not** request several permissions that might seem useful but are unnecessary:

- **`tabs`** - Not needed; `activeTab` is sufficient and more privacy-friendly
- **`webRequest`** - Not needed; extension doesn't intercept or modify network traffic
- **`cookies`** - Not needed; extension doesn't access cookies
- **`history`** - Not needed; extension doesn't access browsing history
- **`bookmarks`** - Not needed; extension doesn't access bookmarks
- **`downloads`** - Not needed; extension doesn't manage downloads
- **`notifications`** - Not needed; extension doesn't send notifications
- **`geolocation`** - Not needed; extension doesn't access location data

---

## Security Considerations

1. **Principle of Least Privilege**: The extension requests only the minimum permissions necessary for its functionality.

2. **Scoped Access**: Host permissions are limited to exactly four domains, preventing access to any other websites.

3. **No Data Collection**: The extension does not collect, transmit, or store any user data beyond boolean preferences.

4. **No Network Requests**: The extension makes no network requests - all functionality is local.

5. **Read-Only CSS**: The `scripting` permission is used only to inject CSS, not JavaScript, so the extension cannot execute code or access page content.

---

## Chrome Web Store Review

When submitting to the Chrome Web Store, reviewers will verify:

1. Each permission is used in the code
2. Permissions are necessary for stated functionality
3. Host permissions are scoped to minimum required domains
4. No unnecessary broad permissions are requested

This document serves as justification for reviewers and can be referenced during the review process.

---

## References

- [Chrome Extension Permissions Documentation](https://developer.chrome.com/docs/extensions/mv3/declare_permissions/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Chrome Scripting API](https://developer.chrome.com/docs/extensions/reference/scripting/)
- [Chrome ActiveTab Permission](https://developer.chrome.com/docs/extensions/mv3/manifest/activeTab/)
