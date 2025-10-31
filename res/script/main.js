const contentEl = document.getElementById('content');
const defaultMd = '/res/md/default.md';
const baseUrl = "https://md2f.github.io";
const checkSvg = '<svg class="checkButton" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z"/></svg>'

const copyFrom = (elementId, buttonEl) => {
    const inputEl = document.getElementById(elementId);
    const value = inputEl.value;

    navigator.clipboard.writeText(value)
        .then(() => {
            if (buttonEl) {
                const originalSvg = buttonEl.innerHTML;

                buttonEl.innerHTML = checkSvg;

                setTimeout(() => {
                    buttonEl.innerHTML = originalSvg;
                }, 1000);
            }
        })
        .catch(err => {
            console.error("Copy error: ", err);
        });
}

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

    if (document.getElementById('inputUrl')) {
        document.getElementById('inputUrl').value = baseUrl + "/?url=" + mdUrl
        document.getElementById('inputUrlRaw').value = baseUrl + "/raw/?url=" + mdUrl
        document.getElementById('inputUrlHtml').value = baseUrl + "/html/?url=" + mdUrl
    }
}

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
    if (!targetEl) {
        console.error(`Element with ID "${elementId}" not found.`);
        return;
    }

    const patternResp = await fetch('/res/assets/markdown.json');
    const patternJson = await patternResp.json();
    const patterns = patternJson.patterns;

    let markdownText = '';
    try {
        const resp = await fetch(mdUrl);
        if (!resp.ok) throw new Error('Not found');
        markdownText = await resp.text();
    } catch (e) {
        const fallback = await fetch('/res/md/404.md');
        markdownText = await fallback.text();
    }

    markdownText = markdownText.replace(/```(\w*)\n([\s\S]*?)```/gm, (match, lang, code) => {
        return `<pre><code class='${lang}'>${escapeCode(code)}</code></pre>`;
    });
    markdownText = markdownText.replace(/`([^`]+)`/g, (match, code) => {
        return `<code>${escapeCode(code)}</code>`;
    });

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

    markdownText = markdownText.split(/\n{2,}/).map(block => {
        block = block.trim();
        if (block.match(/^(<h\d|<ul|<ol|<blockquote|<pre|<table|<hr|<img)/)) return block;
        return `<p>${block}</p>`;
    }).join("\n\n");

    targetEl.innerHTML += markdownText;
}

const downloadHtml = (elementId, removeId = null) => {
    const contentEl = document.getElementById(elementId);
    if (!contentEl) {
        console.error(`Element with id "${elementId}" not found.`);
        return;
    }

    // Klonujeme obsah, aby nedošlo k úpravě původního DOM
    const clone = contentEl.cloneNode(true);

    // Odstraníme element s removeId, pokud existuje
    if (removeId) {
        const toRemove = clone.querySelector(`#${removeId}`);
        if (toRemove) toRemove.remove();
    }

    const contentText = clone.innerHTML;    

    const urlParams = new URLSearchParams(window.location.search);
    const themeUrl = urlParams.get('theme') || 'res/style/html.css';
    const mdUrl = " - " + (urlParams.get('url') || '');
    const title = "MD2F" + mdUrl;

    fetch(themeUrl)
        .then(response => {
            if (!response.ok) throw new Error(`CSS file not found: ${themeUrl}`);
            return response.text();
        })
        .then(cssText => {
            const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
${cssText}

/* Content from element #${elementId} */
${contentText}
</style>
</head>
<body>
<div id="${elementId}">
${contentText}
</div>
</body>
</html>
`;

            // Vytvoření blobu a stažení
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
}


// --- Start ---
loadTheme();
loadMarkdown();
