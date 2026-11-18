(() => {
  const cfg = window.ISUPPLY_PWA_CONFIG || {};
  const appUrl = String(cfg.appsScriptUrl || "").trim();
  const frame = document.getElementById("appFrame");
  const message = document.getElementById("message");
  const messageText = document.getElementById("messageText");
  const directOpen = document.getElementById("directOpen");

  function validUrl(value) {
    try {
      const u = new URL(value);
      return u.protocol === "https:" && /^(script\.google\.com|script\.googleusercontent\.com)$/.test(u.hostname);
    } catch (_) { return false; }
  }

  function showMessage(text, showDirect = false) {
    messageText.textContent = text;
    message.hidden = false;
    frame.hidden = true;
    directOpen.hidden = !showDirect;
  }

  function loadApp() {
    if (!navigator.onLine) {
      showMessage("Connect to the internet to use iSupply. The PWA shell can open offline, but inventory and transactions require a live connection.");
      return;
    }
    if (!validUrl(appUrl) || appUrl.includes("PASTE_YOUR_")) {
      showMessage("The Apps Script Web App URL is missing or invalid in app-config.js.");
      return;
    }
    directOpen.href = appUrl;
    message.hidden = true;
    frame.hidden = false;
    if (frame.src !== appUrl) frame.src = appUrl;
  }

  document.getElementById("retryButton").addEventListener("click", loadApp);
  window.addEventListener("online", loadApp);
  window.addEventListener("offline", () => showMessage("Connect to the internet to use iSupply. Inventory and transactions are not available offline."));

  // Keep the PWA shell installable; installation can be started from the browser's Install App menu.
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js", {scope:"./"})
      .catch(err => console.warn("Service worker registration failed", err)));
  }
  loadApp();
})();
