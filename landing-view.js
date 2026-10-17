// landing_view (docs/analytics.md, added 17 Oct 2026 by JG): one signal per page load, common parameters + page.
// page = the fixed folder name from the script tag's data-page, only from the list below (JG, 17 Oct 2026).
// clientUser is a random code made new for every page load and never saved, so nothing links two visits
// or a page to the game. Test mode everywhere except timesgalaxy.app without ?test=1, like the game.
import TelemetryDeck from "./vendor/telemetrydeck/telemetrydeck.js";
const PAGES = ["home", "parents", "times-tables-tricks", "how-to-learn-times-tables-5-minutes-a-day", "year-4-multiplication-tables-check", "for-teachers"];
try {
  const tag = document.querySelector("script[data-page]"), page = tag && tag.dataset.page;
  if (PAGES.includes(page)) {
    // test mode like the game: other addresses, ?test=1, or a device the game marked as a test device
    let testDevice = false; try { testDevice = !!(JSON.parse(localStorage.getItem("times-galaxy-proto-v2") || "{}") || {}).testDevice; } catch (e) {}
    const urlTest = /[?&]test=1(&|$)/.test(location.search);
    const test = location.hostname !== "timesgalaxy.app" || urlTest || testDevice;
    if (urlTest) document.querySelectorAll('a[href$="play/"]').forEach((a) => a.setAttribute("href", a.getAttribute("href") + "?test=1")); // "Play free" keeps test mode
    const ua = navigator.userAgent;
    const platform = /iPad/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ? "ipad" : /iPhone|iPod/.test(ua) ? "iphone" : /Android/.test(ua) ? "android" : "desktop";
    const installed = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
    const params = { page, premium: "false", beta: "true", deviceKind: platform, installed: installed ? "true" : "false" };
    const td = new TelemetryDeck({ appID: "D6E0ACED-6790-45A9-9B08-2F987355A201", clientUser: crypto.randomUUID ? crypto.randomUUID() : String(Math.random()), testMode: test });
    if (test) console.log("Analytics sent:", "landing_view", params);
    td.signal("landing_view", params).catch(() => {});
  }
} catch (e) {}
