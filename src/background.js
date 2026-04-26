chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "save") {
    chrome.storage.local.set({ lastResult: { decks: message.decks, url: message.url } })
      .then(() => sendResponse({ success: true }))
      .catch(() => sendResponse({ success: false }));
    return true;
  }

  if (message.action === "load") {
    chrome.storage.local.get("lastResult")
      .then((data) => sendResponse(data.lastResult || null))
      .catch(() => sendResponse(null));
    return true;
  }
});