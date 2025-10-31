// default path relative to the current HTML file (adjust if needed)
const defaultMd = '../res/md/404.md';

document.addEventListener("DOMContentLoaded", async () => {
  const pre = document.querySelector("pre");
  if (!pre) {
    console.error("Missing <pre> element in HTML!");
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const rawParam = urlParams.get("url");
  const param = rawParam ? decodeURIComponent(rawParam) : null;
  function resolveUrl(path) {
    try {
      return new URL(path, window.location.href).toString();
    } catch (e) {
      return path;
    }
  }

  const fileUrl = param ? resolveUrl(param) : resolveUrl(defaultMd);

  async function loadFile(url, isFallback = false) {
    try {
      console.log(`Attempting to fetch: ${url}`);
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
      const text = await res.text();
      pre.textContent = text;
    } catch (err) {
      console.warn(`⚠️ Fetch failed for ${url}:`, err);
      if (!isFallback && url !== resolveUrl(defaultMd)) {
        const defaultUrlResolved = resolveUrl(defaultMd);
        console.warn(`Loading fallback default: ${defaultUrlResolved}`);
        await loadFile(defaultUrlResolved, true);
      } else {
        pre.textContent = `❌ Failed to load file:\n${url}\n\nError: ${err.message || err}`;
        pre.textContent += `\n\nTips:\n- Are you running this file over http(s)? Try a local server (e.g. 'python -m http.server').\n- If file is on another domain, check CORS headers on that server.\n- Check DevTools Network tab for more info.`;
      }
    }
  }

  loadFile(fileUrl);
});
