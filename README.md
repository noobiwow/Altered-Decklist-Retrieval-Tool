# Altered Decklist Retrieval Tool

A Firefox Extension that extracts decklists from [Altered.gg](https://www.altered.gg) and get transfer them to deckbuilder.

## How It Works

1. Navigate to any `/decks` page on `www.altered.gg` (e.g., `https://www.altered.gg/en-en/decks`)
2. A floating gold button labeled "EXTRACT" appears in the bottom-right corner
3. Click the button to:
   - Extract all deck IDs from the current page
   - Fetch deck data from the Altered.gg API (`https://api.altered.gg/deck_user_lists/{id}`)
   - Display the results in console log
   - Save the decks to local storage

## Files

| File | Description |
|------|-------------|
| `manifest.json` | Extension manifest (Manifest V3) |
| `content.js` | Injected into pages matching `https://www.altered.gg/*/decks*` |
| `background.js` | Handles storage for saved decks |

## Permissions

- `storage` - Persist extracted decks
- `activeTab` - Access current tab
- `scripting` - Execute content scripts
- Host access to `api.altered.gg` and `www.altered.gg`

## Installation

Before installing, install the correct package for your browser:
- For Firefox: Copy manifest.firefox.json in the root folder as manifest.json

1. Open Firefox and go to `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**
4. Select the `Altered Decklist Retrieval Tool` folder

- For Chrome: Copy manifest.chrome.json in the root folder as manifest.json

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `Altered Decklist Retrieval Tool` folder

## Usage

1. Visit decks list page on Altered.gg
2. If the button is not showing up, refresh the page
3. Click the "EXTRACT" button
4. Open DevTools Console (`F12`) to view the JSON results