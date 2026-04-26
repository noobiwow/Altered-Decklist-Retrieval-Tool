(function () {

    const DECKS_PATTERN = /^\/[a-z]{2}-[a-z]{2}\/decks/;
    if (!DECKS_PATTERN.test(location.pathname)) return;

    async function extractAllDecks() {
        const nextData = document.getElementById("__NEXT_DATA__");
        if(!nextData) return;
        let token;
        token = JSON.parse(nextData.innerHTML).props.pageProps.session.accessToken;
        const storage = chrome.storage.local;
        storage.set({accessToken: token});
        const targetUrl = "https://api.altered.gg/deck_user_lists";
        const entries = performance.getEntriesByType("resource");
        const match = entries.find(e => e.name.includes(targetUrl));

        let results = []; 
        if (match) {
            let page = 1;
            let hasNext = true;
            let nextUrl = `${match.name}`;
            while (hasNext) {
                const {accessToken: token} = await storage.get("accessToken");
                const res = await fetch(nextUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (!res.ok) {
                    throw new Error(`Erreur page ${page}`);
                }
                if(!token){
                    throw new Error('No token found');
                }
                const data = await res.json();
                results.push(...(data["hydra:member"] || []));
                nextUrl = data["hydra:view"]?.["hydra:next"] ? nextUrl + data["hydra:view"]["hydra:next"]: null;
                if(nextUrl == null){
                    hasNext = false;
                }
            }
        }
        return results;
    }

    async function extractDecks() {
        const decks = await extractAllDecks();

        const data = decks.map(item => {
            const id = item["@id"].split("/").pop();
            return { id };
        });
        return data;
    }

    function showResultModal(json) {
        const overlay = document.createElement("div");
        overlay.id = "id-extractor-modal-overlay";

        const modal = document.createElement("div");
        modal.id = "id-extractor-modal";

        const header = document.createElement("div");
        header.id = "id-extractor-modal-header"
        
        const title = document.createElement("span");
        title.id = "id-extractor-modal-title"
        title.textContent = "JSON";

        const closeBtn = document.createElement("button");
        closeBtn.id = "id-extractor-modal-close-button"
        closeBtn.textContent = "✕";
        closeBtn.addEventListener("click", () => overlay.remove());
        header.appendChild(title);
        header.appendChild(closeBtn);

        const textarea = document.createElement("textarea");
        textarea.id = "id-extractor-modal-textarea"
        textarea.value = json;
        textarea.readOnly = true;

        modal.appendChild(header);
        modal.appendChild(textarea);
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
    label.textContent = "Initialization...";

    const items = await extractDecks();

    if (items.length === 0) {
        showToast("No decks found.", true);
        btn.disabled = false;
        label.textContent = "Extract";
        return;
    }

    try {
        label.textContent = `0 / ${items.length}`;

        const results = [];
        for (const [i, { id }] of items.entries()) {
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
            showResultModal(json);
        }
        showToast(`✓ ${results.length} decks copied in the clipboard !`);
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