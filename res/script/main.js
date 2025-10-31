const contentEl = document.getElementById('content');
const defaultMd = '/res/md/default.md';
const baseUrl = "https://md2f.github.io";
const checkSvg = '<svg class="checkButton" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z"/></svg>';

const copyFrom = (elementId, buttonEl) => {
    const inputEl = document.getElementById(elementId);
    const value = inputEl.value;

    navigator.clipboard.writeText(value)
        .then(() => {
            if (buttonEl) {
                const originalSvg = buttonEl.innerHTML;
                buttonEl.innerHTML = checkSvg;
                setTimeout(() => buttonEl.innerHTML = originalSvg, 1000);
            }
        })
        .catch(err => console.error("Copy error: ", err));
};

function loadTheme() {
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get('theme');
    if (!theme || window.location.pathname.includes('/raw/')) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/res/css/${theme}.css`;
    document.head.appendChild(link);
}

function getBasePath() {
    const path = window.location.pathname;
    return path.substring(0, path.lastIndexOf('/') + 1);
}

// ✅ Nová funkce pro korektní řešení relativních cest
function resolveMdPath(mdUrl) {
    if (!mdUrl) return defaultMd;

    // 1️⃣ Pokud začíná http nebo https → necháme beze změny
    if (/^https?:\/\//i.test(mdUrl)) return mdUrl;

    // 2️⃣ Pokud začíná "/" → root v doméně
    if (mdUrl.startsWith("/")) return mdUrl;

    // 3️⃣ Normalizace: pokud nezačíná "./" nebo "../", přidej "./"
    if (!mdUrl.startsWith("./") && !mdUrl.startsWith("../")) {
        mdUrl = "./" + mdUrl;
    }

    // 4️⃣ Pokud jsme uvnitř podsložky jako /html/, /raw/, /print/, přepočítáme relativní cestu
    const path = window.location.pathname;
    let base = getBasePath();
    if (path.includes('/html/') || path.includes('/raw/') || path.includes('/print/')) {
        base = base.replace(/\/(html|raw|print)\//, '/');
        if (mdUrl.startsWith('./')) mdUrl = mdUrl.substring(2);
        mdUrl = '../' + mdUrl;
    }

    // 5️⃣ Přepočítáme absolutní cestu vůči aktuální stránce
    return new URL(mdUrl, window.location.origin + base).href;
}

async function loadMarkdown() {
    const urlParams = new URLSearchParams(window.location.search);
    let mdUrl = urlParams.get('url');
    mdUrl = resolveMdPath(mdUrl);

    // this is shit
    if (mdUrl === "/res/md/default.md") {
        if (document.getElementById('changelog')) {
            loadMarkdownTo('changelog', '/changelog.md');
        }
    } else {
        if (document.getElementById('changelog')) {
            document.getElementById('changelog').remove();
        }
    }

    if (!mdUrl) {
        mdUrl = defaultMd;
    }

    await loadMarkdownTo('content', mdUrl);

    if (document.getElementById('inputUrl')) {
        document.getElementById('inputUrl').value = baseUrl + "/?url=" + mdUrl;
        document.getElementById('inputUrlRaw').value = baseUrl + "/raw/?url=" + mdUrl;
        document.getElementById('inputUrlHtml').value = baseUrl + "/html/?url=" + mdUrl;
    }
}

let open_raw = () => {
    const urlParams = new URLSearchParams(window.location.search);
    let mdUrl = resolveMdPath(urlParams.get('url')) || defaultMd;
    window.open(getBasePath() + 'raw/?url=' + mdUrl, '_self');
};

let open_html = () => {
    const urlParams = new URLSearchParams(window.location.search);
    let mdUrl = resolveMdPath(urlParams.get('url')) || defaultMd;
    window.open(getBasePath() + 'html/?url=' + mdUrl, '_self');
};

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

async function loadMarkdownTo(elementId, mdUrl) {
    const targetEl = document.getElementById(elementId);
    if (!targetEl) return console.error(`Element with ID "${elementId}" not found.`);

    const patternResp = await fetch('/res/assets/markdown.json');
    const patternJson = await patternResp.json();
    const patterns = patternJson.patterns;

    let markdownText = '';
    try {
        const resp = await fetch(mdUrl);
        if (!resp.ok) throw new Error('Not found');
        markdownText = await resp.text();
    } catch {
        const fallback = await fetch('/res/md/404.md');
        markdownText = await fallback.text();
    }

    markdownText = markdownText.replace(/```(\w*)\n([\s\S]*?)```/gm, (m, lang, code) =>
        `<pre><code class='${lang}'>${escapeCode(code)}</code></pre>`
    );
    markdownText = markdownText.replace(/`([^`]+)`/g, (m, code) =>
        `<code>${escapeCode(code)}</code>`
    );

    patterns.forEach(p => {
        if (p.pattern.startsWith("```") || p.pattern.startsWith("`")) return;
        const regex = new RegExp(p.pattern, p.flags || 'g');

        if (p.pattern.startsWith('^(>+)')) {
            markdownText = markdownText.replace(regex, (m, arrows, text) =>
                "<blockquote>".repeat(arrows.length) + text.trim() + "</blockquote>".repeat(arrows.length)
            );
        } else if (p.pattern.startsWith("^([ ]*)([-*+])")) {
            markdownText = markdownText.replace(regex, (m, space, bullet, text) => {
                const level = Math.floor(space.length / 2);
                return "<ul>".repeat(level + 1) + "<li>" + text.trim() + "</li>" + "</ul>".repeat(level + 1);
            });
        } else if (p.pattern.startsWith("^([ ]*)(\\d+\\.)")) {
            markdownText = markdownText.replace(regex, (m, space, num, text) => {
                const level = Math.floor(space.length / 2);
                return "<ol>".repeat(level + 1) + "<li>" + text.trim() + "</li>" + "</ol>".repeat(level + 1);
            });
        } else if (p.pattern.startsWith("^\\|")) {
            markdownText = markdownText.replace(regex, (m, headerLine, sepLine, rows) => {
                const headers = headerLine.split("|").map(h => h.trim()).filter(Boolean);
                let html = "<table><thead><tr>";
                headers.forEach(h => html += `<th>${h}</th>`);
                html += "</tr></thead><tbody>";
                rows.trim().split("\n").forEach(r => {
                    const cells = r.split("|").map(c => c.trim()).filter(Boolean);
                    if (!cells.length) return;
                    html += "<tr>" + cells.map(c => `<td>${c}</td>`).join("") + "</tr>";
                });
                return html + "</tbody></table>";
            });
        } else if (p.pattern.startsWith("!\\[")) {
            markdownText = markdownText.replace(regex, (m, alt, src, title) => {
                if (!src.match(/^https?:\/\//)) {
                    const mdBase = mdUrl.substring(0, mdUrl.lastIndexOf('/') + 1);
                    src = mdBase + src;
                }
                return `<img alt="${alt}" src="${src}" title="${title || ""}">`;
            });
        } else {
            markdownText = markdownText.replace(regex, p.replacement);
        }
    });

    markdownText = markdownText
        .split(/\n{2,}/)
        .map(block => block.trim().match(/^(<h\d|<ul|<ol|<blockquote|<pre|<table|<hr|<img)/)
            ? block.trim()
            : `<p>${block.trim()}</p>`)
        .join("\n\n");

    targetEl.innerHTML += markdownText;
}

const downloadHtml = (elementId, removeId = null) => {
    const contentEl = document.getElementById(elementId);
    if (!contentEl) return console.error(`Element with id "${elementId}" not found.`);

    const clone = contentEl.cloneNode(true);
    if (removeId) clone.querySelector(`#${removeId}`)?.remove();

    const contentText = clone.innerHTML;
    const urlParams = new URLSearchParams(window.location.search);
    const themeUrl = urlParams.get('theme') || 'res/style/html.css';
    const mdUrl = " - " + (urlParams.get('url') || '');
    const title = "MD2F" + mdUrl;

    fetch(themeUrl)
        .then(r => {
            if (!r.ok) throw new Error(`CSS file not found: ${themeUrl}`);
            return r.text();
        })
        .then(cssText => {
            const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>${cssText}</style>
</head>
<body>
<div id="${elementId}">
${contentText}
</div>
</body>
</html>`;
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = title + ".html";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        })
        .catch(err => console.error(err));
};

// --- Start ---
loadTheme();
loadMarkdown();
