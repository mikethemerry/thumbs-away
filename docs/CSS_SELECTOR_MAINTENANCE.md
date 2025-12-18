# CSS Selector Maintenance Guide

This guide explains how to update CSS selectors when AI platforms change their user interfaces.

## Overview

The extension hides feedback buttons (thumbs up/down) by injecting CSS that targets specific selectors. When platforms update their UI, these selectors may break, causing buttons to become visible again.

## Files to Update

Each platform has its own CSS file in the `styles/` directory:
- `styles/claude.css` - For Claude.ai
- `styles/chatgpt.css` - For ChatGPT (chat.openai.com, chatgpt.com)
- `styles/gemini.css` - For Gemini (gemini.google.com)

## How to Find New Selectors

### Step 1: Identify the Feedback Buttons

1. Open the AI platform in Chrome
2. Open Chrome DevTools (F12 or Right-click → Inspect)
3. Use the element picker (Ctrl+Shift+C / Cmd+Shift+C) to select a feedback button
4. The button should highlight in the Elements panel

### Step 2: Analyze the Button Structure

Look for these attributes in the selected element:

**Most Reliable Selectors (in order of preference):**
1. `data-testid` - Platform-specific test IDs (most stable)
2. `aria-label` - Accessibility labels (usually stable)
3. `data-test-id` - Alternative test ID format
4. `data-tooltip` - Tooltip attributes
5. SVG path data (`d` attribute) - Icon paths (less stable, but useful)
6. Class names - Usually least stable, use as fallback

**Example:**
```html
<button aria-label="Good response" data-testid="good-response-button">
  <svg>...</svg>
</button>
```

### Step 3: Test Your Selectors

1. Add your new selector to the appropriate CSS file
2. Reload the extension (`chrome://extensions/` → Reload)
3. Refresh the AI platform page
4. Verify buttons are hidden
5. Test on multiple pages/conversations

## Selector Patterns

### Claude.ai

Claude uses various patterns:
- `[data-testid="feedback-buttons"]` - Container
- `button[aria-label="Good response"]` - Individual buttons
- SVG paths with specific `d` attributes
- Class-based selectors (less reliable)

**Common patterns:**
```css
/* By aria-label */
button[aria-label="Good response"],
button[aria-label="Bad response"]

/* By data-testid */
[data-testid="feedback-buttons"]

/* By SVG icon */
button:has(svg[class*="lucide-thumbs"])
```

### ChatGPT

ChatGPT patterns:
- `button[aria-label="Thumbs up"]` / `"Thumbs down"`
- `data-testid` attributes like `good-response-turn-action-button`
- SVG paths with specific patterns
- Flex container patterns

**Common patterns:**
```css
/* By aria-label */
button[aria-label="Thumbs up"],
button[aria-label="Thumbs down"]

/* By data-testid */
button[data-testid="good-response-turn-action-button"]

/* By SVG icon */
button:has(svg[data-icon="thumbs-up"])
```

### Gemini

Gemini uses Material Design icons:
- `mat-icon` components with `data-mat-icon-name`
- `data-test-id` attributes
- `data-tooltip` attributes
- Custom element tags like `message-actions`

**Common patterns:**
```css
/* By mat-icon */
button:has(mat-icon[data-mat-icon-name="thumb_up"])

/* By data-test-id */
button[data-test-id="like-button"]

/* By custom elements */
message-actions button:has([data-icon="thumb_up"])
```

## Best Practices

### 1. Use Multiple Selectors

Don't rely on a single selector. Use multiple patterns to catch different UI variations:

```css
/* Good: Multiple fallbacks */
button[aria-label="Good response"],
button[data-testid="good-button"],
button:has(svg[data-icon="thumbs-up"]) {
  display: none !important;
}
```

### 2. Use `!important`

Always use `!important` to override platform styles:

```css
button[aria-label="Good response"] {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
}
```

### 3. Test Edge Cases

- New conversations
- Existing conversations
- Different conversation types
- Mobile vs desktop views (if applicable)
- Dark mode vs light mode

### 4. Use `:has()` Selector

Modern CSS `:has()` selector is powerful for targeting buttons by their content:

```css
/* Target button containing a specific SVG */
button:has(svg path[d*="M12.784 3.096"])
```

### 5. Generic Fallbacks

Include generic selectors as last resort:

```css
/* Generic thumb selectors (less specific, but catches edge cases) */
button[aria-label*="thumb" i],
button[title*="thumb" i] {
  display: none !important;
}
```

## Debugging Tips

### Check if CSS is Injected

1. Open DevTools → Elements tab
2. Look for `<style>` tags in `<head>` or check Computed styles
3. Verify your selectors match elements

### Test Selectors in Console

```javascript
// Test if selector matches elements
document.querySelectorAll('button[aria-label="Good response"]')
```

### Check Extension Logs

1. Go to `chrome://extensions/`
2. Click "service worker" link under the extension
3. Check console for errors

## Common Issues

### Buttons Still Visible

1. **Selector doesn't match**: Use DevTools to verify the actual HTML structure
2. **CSS not injected**: Check extension is enabled and reloaded
3. **Specificity too low**: Add `!important` or more specific selectors
4. **Dynamic content**: Buttons may load after CSS injection - ensure selectors catch dynamically added elements

### CSS Injection Fails

1. **Restricted page**: Some pages (chrome://, extensions://) can't be modified
2. **Tab not ready**: Extension retries automatically
3. **Permissions**: Verify `host_permissions` in manifest.json include the platform

## Updating Process

1. **Identify the issue**: User reports buttons are visible
2. **Investigate**: Use DevTools to find new selectors
3. **Update CSS**: Add new selectors to appropriate file
4. **Test**: Verify on multiple pages
5. **Commit**: Update version in manifest.json
6. **Document**: Note changes in commit message

## Version History

Track selector changes to understand platform evolution:

- **v1.1.0**: Initial selectors for Claude, ChatGPT, Gemini
- (Add new entries as selectors are updated)

## Resources

- [Chrome DevTools Documentation](https://developer.chrome.com/docs/devtools/)
- [CSS Selectors Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)
- [`:has()` Selector Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/:has)

