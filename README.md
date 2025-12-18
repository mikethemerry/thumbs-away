# Thumbs Away

A Chrome extension that hides thumbs up/down feedback buttons on Claude, ChatGPT, and Gemini to keep your business data out of AI training.

## Why Use This?

When you click feedback buttons on AI chat platforms, your conversation data may be flagged for review or included in training datasets. For business users handling sensitive information, this creates data governance risks. This extension removes those buttons entirely, eliminating the possibility of accidental clicks.

## Features

- **Per-platform toggles** - Enable or disable hiding for each platform independently
- **Defaults to hidden** - All three platforms have feedback buttons hidden by default
- **Instant updates** - Changes take effect immediately without refreshing
- **Synced settings** - Your preferences sync across Chrome browsers via your Google account

## Supported Platforms

- **Claude** (claude.ai)
- **ChatGPT** (chat.openai.com, chatgpt.com)
- **Gemini** (gemini.google.com)

## Installation

### From Chrome Web Store

*(Coming soon)*

### Load as Unpacked Extension (Developer Mode)

1. Download and unzip this extension folder
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `thumbs-away` folder
6. The extension is now active with all platforms hidden by default

## Usage

1. Click the extension icon in your Chrome toolbar
2. Toggle each platform on (hidden) or off (visible)
3. Changes apply immediately to all open tabs

## Enterprise Deployment

For IT administrators deploying across an organization:

1. Host the extension folder on an internal server or include in your device management solution
2. Use Chrome Enterprise policies to force-install the extension
3. Optionally pre-configure default settings via managed storage
4. See [Chrome Enterprise documentation](https://support.google.com/chrome/a/answer/187202) for details

## How It Works

The extension uses Chrome's scripting API to inject platform-specific CSS that hides feedback buttons. When you toggle a platform:

- **On**: CSS is injected to hide the buttons
- **Off**: CSS is removed, buttons become visible

Settings are stored in Chrome's sync storage, so they persist and sync across your browsers.

## Permissions Explained

- `storage` - Save your toggle preferences
- `activeTab` - Apply CSS to the current tab when you change settings
- `scripting` - Inject/remove CSS dynamically
- Host permissions - Only for the three AI platforms, nothing else

## Privacy

This extension:
- Collects no personal data
- Makes no network requests
- Only accesses the three specified AI platforms
- Settings sync via Chrome's built-in sync (your Google account)

## Files

```
thumbs-away/
├── manifest.json        # Extension configuration
├── background.js        # Service worker for CSS injection
├── popup.html          # Toggle interface
├── popup.js            # Toggle logic
├── styles/
│   ├── claude.css      # Claude-specific hiding rules
│   ├── chatgpt.css     # ChatGPT-specific hiding rules
│   └── gemini.css      # Gemini-specific hiding rules
├── docs/
│   └── CSS_SELECTOR_MAINTENANCE.md  # Guide for updating selectors
├── icon48.png          # Toolbar icon
├── icon128.png         # Store icon
└── README.md           # This file
```

## Updating CSS Selectors

AI platforms occasionally update their interfaces. If feedback buttons become visible:

1. See [CSS Selector Maintenance Guide](./docs/CSS_SELECTOR_MAINTENANCE.md) for detailed instructions
2. Identify the new button selectors using Chrome DevTools
3. Edit the appropriate CSS file in the `styles/` folder
4. Reload the extension

For detailed guidance on finding and updating selectors, see the [CSS Selector Maintenance Guide](./docs/CSS_SELECTOR_MAINTENANCE.md).

## License

MIT License - Free for personal and commercial use.

## Support

If you encounter issues or platforms update their interfaces, please open an issue on the project repository.
