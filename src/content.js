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

    function showResultModal(json) {
    const overlay = document.createElement("div");
    overlay.id = "id-extractor-modal-overlay";
    Object.assign(overlay.style, {
        position:       "fixed",
        inset:          "0",
        zIndex:         "1000000",
        background:     "rgba(0,0,0,0.6)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontFamily:     "inherit",
    });

    const modal = document.createElement("div");
    Object.assign(modal.style, {
        background:   "#1e1c16",
        color:        "#f5f0e0",
        borderRadius: "16px",
        padding:      "24px",
        width:        "min(600px, 90vw)",
        maxHeight:    "80vh",
        display:      "flex",
        flexDirection:"column",
        gap:          "16px",
        boxShadow:    "0 8px 40px rgba(0,0,0,0.5)",
    });

    const header = document.createElement("div");
    Object.assign(header.style, {
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
    });
    const title = document.createElement("span");
    title.textContent = "Résultats JSON";
    Object.assign(title.style, {
        fontWeight:    "800",
        fontSize:      "16px",
        letterSpacing: "0.05em",
        color:         "#C9A84C",
    });
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✕";
    Object.assign(closeBtn.style, {
        background:   "transparent",
        border:       "none",
        color:        "#f5f0e0",
        fontSize:     "18px",
        cursor:       "pointer",
        lineHeight:   "1",
        padding:      "0 4px",
    });
    closeBtn.addEventListener("click", () => overlay.remove());
    header.appendChild(title);
    header.appendChild(closeBtn);

    const textarea = document.createElement("textarea");
    textarea.value = json;
    textarea.readOnly = true;
    Object.assign(textarea.style, {
        flex:        "1",
        minHeight:   "300px",
        background:  "#2a2720",
        color:       "#f5f0e0",
        border:      "1px solid #C9A84C44",
        borderRadius:"8px",
        padding:     "12px",
        fontSize:    "12px",
        fontFamily:  "monospace",
        resize:      "vertical",
        outline:     "none",
    });

    const copyBtn = document.createElement("button");
    copyBtn.textContent = "COPIER";
    Object.assign(copyBtn.style, {
        padding:       "12px",
        background:    "#C9A84C",
        color:         "#2d2a22",
        border:        "none",
        borderRadius:  "10px",
        fontWeight:    "800",
        fontSize:      "13px",
        letterSpacing: "0.08em",
        cursor:        "pointer",
        transition:    "background 0.15s",
    });
    copyBtn.addEventListener("mouseenter", () => copyBtn.style.background = "#b8943e");
    copyBtn.addEventListener("mouseleave", () => copyBtn.style.background = "#C9A84C");
    copyBtn.addEventListener("click", () => {
        textarea.select();
        document.execCommand("copy");
        copyBtn.textContent = "COPIÉ !";
        setTimeout(() => copyBtn.textContent = "COPIER", 1500);
    });

    modal.appendChild(header);
    modal.appendChild(textarea);
    modal.appendChild(copyBtn);
    overlay.appendChild(modal);

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.remove();
    });

    document.body.appendChild(overlay);
    setTimeout(() => textarea.select(), 50);
    }

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
    label.textContent = "Progressing…";

    const items = extractDecks();

    if (items.length === 0) {
        showToast("No decks found.", true);
        btn.disabled = false;
        label.textContent = "Extract";
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

        const json = JSON.stringify(results, null, 2);

        try {
        await navigator.clipboard.writeText(json);
        showToast(`✓ ${results.length} résultat(s) copié(s) en JSON !`);
        } catch (_clipboardErr) {
        // Pas de permission clipboard → fallback modal
        showResultModal(json);
        }
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