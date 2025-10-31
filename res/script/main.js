const contentEl = document.getElementById('content');
const defaultMd = '/res/md/default.md';

// --- Funkce pro načtení custom theme ---
function loadTheme() {
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get('theme');
    
    // Nedělej nic, pokud je RAW stránka
    if (!theme || window.location.pathname.includes('/raw/')) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/res/css/${theme}.css`;
    document.head.appendChild(link);
}

// --- Funkce pro získání base path podle umístění HTML ---
function getBasePath() {
    const path = window.location.pathname;
    return path.substring(0, path.lastIndexOf('/') + 1);
}

// --- Načtení hlavního Markdown ---
async function loadMarkdown() {
    const urlParams = new URLSearchParams(window.location.search);
    let mdUrl = urlParams.get('url');

    if (!mdUrl) {
        mdUrl = defaultMd;
        if (document.getElementById('changelog')) {
            loadMarkdownTo('changelog', '/changelog.md');
        }
    } else {
        if (document.getElementById('changelog')) {
            document.getElementById('changelog').remove();
        }
    }

    await loadMarkdownTo('content', mdUrl);
}

// --- Funkce pro otevření RAW / HTML ---
let open_raw = () => {
    const urlParams = new URLSearchParams(window.location.search);
    let mdUrl = urlParams.get('url') || defaultMd;
    window.open(getBasePath() + 'raw/?url=' + mdUrl, '_self');
}

let open_html = () => {
    const urlParams = new URLSearchParams(window.location.search);
    let mdUrl = urlParams.get('url') || defaultMd;
    window.open(getBasePath() + 'html/?url=' + mdUrl, '_self');
}

// --- Escapování speciálních znaků v code blocích ---
function escapeCode(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\*/g, "&ast;")
        .replace(/#/g, "&#35;")
        .replace(/~/g, "&#126;")
        .replace(/!/g, "&#33;")
        .replace(/\[/g, "&#91;")
        .replace(/\]/g, "&#93;")
        .replace(/\(/g, "&#40;")
        .replace(/\)/g, "&#41;");
}

// ✅ Univerzální funkce pro načtení markdownu do elementu
async function loadMarkdownTo(elementId, mdUrl) {
    const targetEl = document.getElementById(elementId);
    if (!targetEl) {
        console.error(`Element with ID "${elementId}" not found.`);
        return;
    }

    // Načtení patternů z JSON (vždy root-relative)
    const patternResp = await fetch('/res/assets/markdown.json');
    const patternJson = await patternResp.json();
    const patterns = patternJson.patterns;

    // Načtení Markdown souboru, fallback na 404
    let markdownText = '';
    try {
        const resp = await fetch(mdUrl);
        if (!resp.ok) throw new Error('Not found');
        markdownText = await resp.text();
    } catch (e) {
        const fallback = await fetch('/res/md/404.md');
        markdownText = await fallback.text();
    }

    // --- Escapování code bloků a inline code ---
    markdownText = markdownText.replace(/```(\w*)\n([\s\S]*?)```/gm, (match, lang, code) => {
        return `<pre><code class='${lang}'>${escapeCode(code)}</code></pre>`;
    });
    markdownText = markdownText.replace(/`([^`]+)`/g, (match, code) => {
        return `<code>${escapeCode(code)}</code>`;
    });

    // --- Aplikace patternů ---
    patterns.forEach(p => {
        if (p.pattern.startsWith("```") || p.pattern.startsWith("`")) return;

        const regex = new RegExp(p.pattern, p.flags || 'g');

        if (p.pattern.startsWith('^(>+)')) {
            markdownText = markdownText.replace(regex, (m, arrows, text) => {
                return "<blockquote>".repeat(arrows.length) + text.trim() + "</blockquote>".repeat(arrows.length);
            });
        } else if (p.pattern.startsWith("^([ ]*)([-*+])")) {
            markdownText = markdownText.replace(regex, (m, space, bullet, text) => {
                const level = Math.floor(space.length / 2);
                return "<ul>".repeat(level+1) + "<li>" + text.trim() + "</li>" + "</ul>".repeat(level+1);
            });
        } else if (p.pattern.startsWith("^([ ]*)(\\d+\\.)")) {
            markdownText = markdownText.replace(regex, (m, space, num, text) => {
                const level = Math.floor(space.length / 2);
                return "<ol>".repeat(level+1) + "<li>" + text.trim() + "</li>" + "</ol>".repeat(level+1);
            });
        } else if (p.pattern.startsWith("^\\|")) {
            markdownText = markdownText.replace(regex, (m, headerLine, sepLine, rows) => {
                const headers = headerLine.split("|").map(h => h.trim()).filter(h => h.length > 0);
                let html = "<table><thead><tr>";
                headers.forEach(h => html += `<th>${h}</th>`);
                html += "</tr></thead><tbody>";

                const rowLines = rows.trim().split("\n");
                rowLines.forEach(r => {
                    const cells = r.split("|").map(c => c.trim()).filter(c => c.length > 0);
                    if(cells.length === 0) return;
                    html += "<tr>";
                    cells.forEach(c => html += `<td>${c}</td>`);
                    html += "</tr>";
                });

                html += "</tbody></table>";
                return html;
            });
        } else if (p.pattern.startsWith("!\\[")) {
            markdownText = markdownText.replace(regex, (m, alt, src, title) => {
                if (!src.match(/^https?:\/\//)) {
                    const mdBase = mdUrl.substring(0, mdUrl.lastIndexOf('/') + 1);
                    src = mdBase + src;
                }
                title = title || "";
                return `<img alt="${alt}" src="${src}" title="${title}">`;
            });
        } else {
            markdownText = markdownText.replace(regex, p.replacement);
        }
    });

    // --- Automatické odstavce ---
    markdownText = markdownText.split(/\n{2,}/).map(block => {
        block = block.trim();
        if (block.match(/^(<h\d|<ul|<ol|<blockquote|<pre|<table|<hr|<img)/)) return block;
        return `<p>${block}</p>`;
    }).join("\n\n");

    targetEl.innerHTML += markdownText;
}

// --- Start ---
loadTheme();
loadMarkdown();
