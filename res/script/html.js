const contentEl = document.getElementById('content');
const defaultMd = '../res/md/default.md';

async function loadMarkdown() {
    const urlParams = new URLSearchParams(window.location.search);
    let mdUrl = urlParams.get('url');

    if (!mdUrl) {
        mdUrl = defaultMd
        if (document.getElementById('changelog')) {
            loadMarkdownTo('changelog','./changelog.md')
        }
    } else {
        if (document.getElementById('changelog')) {
            document.getElementById('changelog').remove()
        }
    }

    await loadMarkdownTo('content', mdUrl);
}

// ✅ Univerzální funkce pro načtení markdownu do určitého elementu
async function loadMarkdownTo(elementId, mdUrl) {
    const targetEl = document.getElementById(elementId);
    if (!targetEl) {
        console.error(`Element with ID "${elementId}" not found.`);
        return;
    }

    // Načtení patternů z JSON
    const patternResp = await fetch('../res/assets/markdown.json');
    const patternJson = await patternResp.json();
    const patterns = patternJson.patterns;

    // Načtení Markdown souboru
    let markdownText = '';
    try {
        const resp = await fetch(mdUrl);
        if (!resp.ok) throw new Error('Not found');
        markdownText = await resp.text();
    } catch (e) {
        const fallback = await fetch('../res/md/404.md');
        markdownText = await fallback.text();
    }

    // Aplikace patternů
    patterns.forEach(p => {
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
                    const baseUrl = mdUrl.substring(0, mdUrl.lastIndexOf('/') + 1);
                    src = baseUrl + src;
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
        if (block.match(/^(<h\d|<ul|<ol|<blockquote|<pre|<table|<hr|<img)/)) {
            return block;
        }
        return `<p>${block}</p>`;
    }).join("\n\n");

    // Výstup do daného elementu
    targetEl.innerHTML = markdownText;
}

// Spuštění hlavní funkce
loadMarkdown();
