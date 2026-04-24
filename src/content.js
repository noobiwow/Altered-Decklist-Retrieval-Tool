(function () {

    const DECKS_PATTERN = /^\/[a-z]{2}-[a-z]{2}\/decks/;
    if (!DECKS_PATTERN.test(location.pathname)) return;

    function extractDecks() {
    const data = Array.from(document.querySelectorAll('a[href*="/decks/"]'))
    .filter(a => !a.href.includes('/decks/create'))
    .map(a => {
        const id = a.href.match(/\/decks\/([^/?]+)/)?.[1];
        return { id };
    });
    return data;
    }

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === "extract") {
        const decks = extractDecks();

        sendResponse({ success: true, decks });
    }
    });

    function injectButton() {
    if (document.getElementById("id-extractor-btn")) return;

    const btn = document.createElement("button");
    btn.id = "id-extractor-btn";
    btn.innerHTML = `
        <svg fill="#000000" width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.71,6.29a1,1,0,0,0-1.42,0l-5,5a1,1,0,0,0,0,1.42l5,5a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42L5.41,12l4.3-4.29A1,1,0,0,0,9.71,6.29Zm11,5-5-5a1,1,0,0,0-1.42,1.42L18.59,12l-4.3,4.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0l5-5A1,1,0,0,0,20.71,11.29Z"/>
        </svg>
        <span id="id-extractor-label">EXTRACT</span>
    `;

    Object.assign(btn.style, {
        position:       "fixed",
        bottom:         "24px",
        right:          "24px",
        zIndex:         "999999",
        display:        "flex",
        alignItems:     "center",
        gap:            "10px",
        padding:        "14px 24px",
        background:     "#C9A84C",
        color:          "#2d2a22",
        border:         "none",
        borderRadius:   "16px",
        fontSize:       "15px",
        fontWeight:     "600",
        letterSpacing:  "0.08em",
        textTransform:  "uppercase",
        cursor:         "pointer",
        boxShadow:      "0 4px 16px rgba(0,0,0,0.25)",
        fontFamily:     "'Work Sans', 'Work Sans Fallback'",
        transition:     "background 0.15s, transform 0.1s, box-shadow 0.15s",
    });

    btn.addEventListener("mouseenter", () => {
        btn.style.background  = "#b8943e";
        btn.style.boxShadow   = "0 6px 20px rgba(0,0,0,0.32)";
        btn.style.transform   = "scale(1.04)";
    });
    btn.addEventListener("mouseleave", () => {
        btn.style.background  = "#C9A84C";
        btn.style.boxShadow   = "0 4px 16px rgba(0,0,0,0.25)";
        btn.style.transform   = "scale(1)";
    });
    btn.addEventListener("mousedown", () => {
        btn.style.transform   = "scale(0.97)";
        btn.style.boxShadow   = "0 2px 8px rgba(0,0,0,0.2)";
    });
    btn.addEventListener("mouseup", () => {
        btn.style.transform   = "scale(1.04)";
        btn.style.boxShadow   = "0 6px 20px rgba(0,0,0,0.32)";
    });

    btn.addEventListener("click", () => triggerExtraction(btn));

    document.body.appendChild(btn);
    }

    // --- Toast de notification ---
    function showToast(message, isError = false) {
    const existing = document.getElementById("id-extractor-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "id-extractor-toast";
    toast.textContent = message;

    Object.assign(toast.style, {
        position:     "fixed",
        bottom:       "80px",
        right:        "24px",
        zIndex:       "999999",
        padding:      "10px 16px",
        background:   isError ? "#dc2626" : "#059669",
        color:        "#fff",
        borderRadius: "8px",
        fontSize:     "13px",
        fontWeight:   "500",
        boxShadow:    "0 4px 12px rgba(0,0,0,0.2)",
        opacity:      "0",
        transition:   "opacity 0.2s",
    });

    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = "1"; });
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
    }

    async function triggerExtraction(btn) {
    const label = document.getElementById("id-extractor-label");
    btn.disabled = true;
    label.textContent = "En cours…";

    const items = extractDecks();

    if (items.length === 0) {
        showToast("Aucun deck trouvé sur cette page.", true);
        btn.disabled = false;
        label.textContent = "Extraire";
        return;
    }

    try {
        label.textContent = `0 / ${items.length}`;

        const results = [];
        for (const [i, { id, name, type }] of items.entries()) {
        const res = await fetch(`https://api.altered.gg/deck_user_lists/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status} pour l'id ${id}`);
        const data = await res.json();
        results.push({ data });
        label.textContent = `${i + 1} / ${items.length}`;
        }

        console.log(results);

        //TODO : Implement Toxicity's API call to send decks to deck builder.
        showToast(`✓ ${results.length} decks transfered !`);
        chrome.runtime.sendMessage({ action: "save", decks: items, url: location.href });

    } catch (err) {
        showToast(`Erreur : ${err.message}`, true);
    } finally {
        btn.disabled = false;
        label.textContent = "Extract";
    }
    }

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === "extract") {
        const decks = extractDecks();
        sendResponse({ success: true, decks });
    }
    });

    injectButton();
})();