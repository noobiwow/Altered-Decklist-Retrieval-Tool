// background.js
const browser = typeof browser !== "undefined" ? browser : chrome;
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "save") {
    chrome.storage.local.set(
      { lastResult: { decks: message.decks, url: message.url } },
      () => sendResponse({ success: true })
    );
    return true; // indique une réponse asynchrone
  }

  if (message.action === "load") {
    chrome.storage.local.get("lastResult", (data) => {
      sendResponse(data.lastResult || null);
    });
    return true;
  }
});