(() => {
  const cfg = window.ISUPPLY_PWA_CONFIG || {};
  const appUrl = String(cfg.appsScriptUrl || "").trim();
  const frame = document.getElementById("appFrame");
  const loading = document.getElementById("frameLoading");
  const statusText = document.getElementById("connectionText");
  const statusDot = document.getElementById("connectionState");
  const offlineNotice = document.getElementById("offlineNotice");
  const directOpen = document.getElementById("directOpen");
  const installButton = document.getElementById("installButton");
  let installPrompt = null;

  function setStatus(text, state) {
    statusText.textContent = text;
    statusDot.className = "status-dot" + (state ? " " + state : "");
  }
  function validUrl(value) {
    try {
      const u = new URL(value);
      return u.protocol === "https:" && /^(script\.google\.com|script\.googleusercontent\.com)$/.test(u.hostname);
    } catch (_) { return false; }
  }
  function loadApp() {
    if (!navigator.onLine) {
      offlineNotice.hidden = false;
      loading.classList.add("hide");
      setStatus("Offline — app transactions require internet", "bad");
      return;
    }
    if (!validUrl(appUrl) || appUrl.includes("PASTE_YOUR_")) {
      setStatus("Setup required — add the Apps Script /exec URL in app-config.js", "bad");
      loading.classList.add("hide");
      offlineNotice.hidden = false;
      offlineNotice.innerHTML = '<h2>Connect your Apps Script deployment</h2><p>Open <code>app-config.js</code> in this repository and replace the placeholder with your deployed Google Apps Script Web App URL ending in <code>/exec</code>. Commit the change, then reload this page.</p>';
      return;
    }
    directOpen.href = appUrl;
    directOpen.hidden = false;
    offlineNotice.hidden = true;
    loading.classList.remove("hide");
    setStatus("Connecting to the school inventory system…", "");
    frame.src = appUrl;
  }
  frame.addEventListener("load", () => {
    loading.classList.add("hide");
    if (navigator.onLine) setStatus("Connected to DES iSupply", "ok");
  });
  document.getElementById("retryButton").addEventListener("click", loadApp);
  window.addEventListener("online", loadApp);
  window.addEventListener("offline", () => {
    offlineNotice.hidden = false;
    setStatus("Offline — reconnect to use iSupply", "bad");
  });

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    installButton.hidden = false;
  });
  installButton.addEventListener("click", async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installButton.hidden = true;
  });
  window.addEventListener("appinstalled", () => {
    installButton.hidden = true;
    setStatus("iSupply installed", "ok");
  });

  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js", {scope:"./"})
      .then(() => {})
      .catch(err => console.warn("Service worker registration failed", err)));
  }
  loadApp();
})();
