(function () {
  "use strict";

  var ROUTE = "/dashboard/reuse";
  var SOURCE_URL = "/reuse-standalone.html?v=20261006-reuse-game-label-v1";
  var MENU_ID = "dc-reuse-menu";
  var ROOT_ID = "dc-reuse-root";
  var STYLE_ID = "dc-reuse-style";
  var CORE_LABEL = "核心看板";
  var syncTimer = 0;
  var coreSyncTimer = 0;
  var coreSyncInFlight = false;

  function isRoute() {
    return location.pathname === ROUTE;
  }

  function canView() {
    var user = window.__DC_USER__ || {};
    var perms = user.perms || [];
    return !!user.is_super || perms.indexOf("*") >= 0 || perms.indexOf("dashboard:reuse") >= 0;
  }

  function findCoreMenu() {
    var items = Array.prototype.slice.call(document.querySelectorAll("header .ant-menu-item, .ant-layout-header .ant-menu-item"));
    return items.find(function (item) {
      return (item.textContent || "").trim() === CORE_LABEL;
    });
  }

  function isCoreShell(){return true;}

  function removeMenu() {
    var existing = document.getElementById(MENU_ID);
    if (existing) existing.remove();
  }

  function finishCoreSync(attempt) {
    if (!coreSyncInFlight) return;
    if (!isCoreShell() && attempt < 12) {
      clearTimeout(coreSyncTimer);
      coreSyncTimer = setTimeout(function () { finishCoreSync(attempt + 1); }, 50);
      return;
    }
    coreSyncInFlight = false;
    clearTimeout(coreSyncTimer);
    if (!isCoreShell()) return;
    if (!isRoute()) history.pushState({}, "", ROUTE);
    renderRoute();
  }

  function ensureCoreShell() {
    if (isCoreShell()) return true;
    removeMenu();
    if (coreSyncInFlight) return false;
    var item = findCoreMenu();
    if (!item) return false;
    coreSyncInFlight = true;
    item.click();
    finishCoreSync(0);
    return false;
  }

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".dc-reuse-host-hidden{display:none!important}",
      "#dc-reuse-root{box-sizing:border-box;width:100%;height:calc(100vh - 56px);min-height:640px;overflow:hidden;background:#f2f3f5}",
      "#dc-reuse-frame-shell{width:100%;height:100%;overflow:hidden;background:#f2f3f5}",
      "#dc-reuse-frame{display:block;width:100%;height:100%;border:0;background:#f2f3f5}",
      "#dc-reuse-menu{min-height:40px;line-height:40px}",
      "#dc-reuse-menu .dc-reuse-menu-icon{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;margin-right:13px;flex:0 0 18px}",
      "#dc-reuse-menu .dc-reuse-menu-icon svg{width:18px;height:18px;stroke-width:1.9}",
      "#dc-reuse-menu .ant-menu-title-content{font-size:14px;line-height:40px}"
    ].join("");
    document.head.appendChild(style);
  }

  function menuMarkup() {
    return '<span class="dc-reuse-menu-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M6.1 9a7 7 0 0 1 11.8-2L20 9"/><path d="M17.9 15a7 7 0 0 1-11.8 2L4 15"/></svg></span><span class="ant-menu-title-content">复用看板</span>';
  }


  function openPage(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!isRoute()) history.pushState({}, "", ROUTE);
    renderRoute();
  }

  function findContentHost() {
    return document.querySelector("main.ant-layout-content") ||
      document.querySelector(".ant-layout-content") || document.querySelector("main");
  }

  function ensurePage(host) {
    var root = document.getElementById(ROOT_ID);
    if (root && root.parentNode === host) return root;
    root = document.createElement("div");
    root.id = ROOT_ID;
    root.innerHTML = '<div id="dc-reuse-frame-shell"><iframe id="dc-reuse-frame" src="' + SOURCE_URL + '" title="复用看板" loading="eager" allow="clipboard-read; clipboard-write"></iframe></div>';
    host.appendChild(root);
    return root;
  }

  function showPage() {
    var host = findContentHost();
    if (!host) return;
    var root = ensurePage(host);
    Array.prototype.forEach.call(host.children, function (child) {
      if (child !== root) child.classList.add("dc-reuse-host-hidden");
    });
    root.hidden = false;
    var menu = document.getElementById(MENU_ID);
    if (menu) {
      menu.classList.add("ant-menu-item-selected");
      menu.setAttribute("aria-selected", "true");
    }
  }

  function hidePage() {
    var root = document.getElementById(ROOT_ID);
    if (root && root.parentNode) {
      Array.prototype.forEach.call(root.parentNode.children, function (child) {
        if (child !== root) child.classList.remove("dc-reuse-host-hidden");
      });
      root.hidden = true;
    }
    var menu = document.getElementById(MENU_ID);
    if (menu) {
      menu.classList.remove("ant-menu-item-selected");
      menu.removeAttribute("aria-selected");
    }
  }

  function renderRoute() {
    if (isRoute() && !ensureCoreShell()) {
      hidePage();
      return;
    }
    
    if (isRoute()) showPage(); else hidePage();
  }

  function scheduleSync() {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(renderRoute, 40);
  }

  installStyle();
  window.addEventListener("popstate", scheduleSync);
  document.addEventListener("click", function (event) {
    if (!event.target || !event.target.closest) return;
    if (event.target.closest("#" + MENU_ID)) return;
    var topItem = event.target.closest("header .ant-menu-item, .ant-layout-header .ant-menu-item");
    if (topItem && (topItem.textContent || "").trim() !== CORE_LABEL) {
      coreSyncInFlight = false;
      clearTimeout(coreSyncTimer);
      removeMenu();
    }
    if (event.target.closest("a,.ant-menu-item,.ant-menu-submenu-title")) scheduleSync();
  }, true);
  new MutationObserver(scheduleSync).observe(document.body, { childList: true, subtree: true });
  renderRoute();
})();
