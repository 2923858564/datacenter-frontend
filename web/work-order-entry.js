(function () {
  "use strict";
  var PREFIX = "/dashboard/work-orders/";
  var MENU_ID = "dc-work-order-menu";
  var ROOT_ID = "dc-work-order-root";
  var STYLE_ID = "dc-work-order-style";
  var timer = 0;
  var coreSwitching = false;

  function currentView() {
    var value = location.pathname.slice(PREFIX.length);
    return ["pending", "pool", "mine", "manage"].indexOf(value) >= 0 ? value : "pending";
  }
  function isRoute() { return location.pathname.indexOf(PREFIX) === 0; }
  function coreMenu() {
    return Array.prototype.slice.call(document.querySelectorAll("header .ant-menu-item, .ant-layout-header .ant-menu-item")).find(function (item) {
      return (item.textContent || "").trim() === "核心看板";
    });
  }
  function isCoreShell(){return true;}

  function findContent() {
    return document.querySelector("main.ant-layout-content") || document.querySelector(".ant-layout-content") || document.querySelector("main");
  }
  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".dc-work-order-host-hidden{display:none!important}",
      "#dc-work-order-root{box-sizing:border-box;width:100%;height:calc(100vh - 56px);min-height:640px;overflow:hidden;background:#f5f6f8}",
      "#dc-work-order-frame{display:block;width:100%;height:100%;border:0;background:#f5f6f8}",
      "#dc-work-order-menu{min-height:40px;line-height:40px}",
      "#dc-work-order-menu .dc-work-order-icon{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;margin-right:13px;vertical-align:middle}",
      "#dc-work-order-menu .dc-work-order-icon svg{width:18px;height:18px;stroke-width:1.9}"
    ].join("");
    document.head.appendChild(style);
  }

  function ensurePage(host) {
    var root = document.getElementById(ROOT_ID);
    if (!root) {
      root = document.createElement("div");
      root.id = ROOT_ID;
      root.innerHTML = '<iframe id="dc-work-order-frame" title="工单中心"></iframe>';
      host.appendChild(root);
    }
    return root;
  }
  function showPage() {
    var host = findContent();
    if (!host) return;
    var root = ensurePage(host);
    Array.prototype.forEach.call(host.children, function (child) { if (child !== root) child.classList.add("dc-work-order-host-hidden"); });
    root.hidden = false;
    var frame = document.getElementById("dc-work-order-frame");
    var src = "/work-orders.html?view=" + currentView();
    if (!frame.getAttribute("src") || frame.contentWindow && frame.contentWindow.location.search !== "?view=" + currentView()) frame.src = src;
    var menu = document.getElementById(MENU_ID);
    if (menu) { menu.classList.add("ant-menu-item-selected"); menu.setAttribute("aria-selected", "true"); }
  }
  function hidePage() {
    var root = document.getElementById(ROOT_ID);
    if (root && root.parentNode) {
      Array.prototype.forEach.call(root.parentNode.children, function (child) { if (child !== root) child.classList.remove("dc-work-order-host-hidden"); });
      root.hidden = true;
    }
    var menu = document.getElementById(MENU_ID);
    if (menu) { menu.classList.remove("ant-menu-item-selected"); menu.removeAttribute("aria-selected"); }
  }
  function navigate(view) {
    var path = PREFIX + view;
    if (location.pathname !== path) history.pushState({}, "", path);
    render();
  }
  window.__DC_WORK_ORDER_NAV__ = navigate;
  function render() {
    if (isRoute() && !isCoreShell()) {
      var core = coreMenu();
      if (core && !coreSwitching) {
        coreSwitching = true;
        core.click();
        setTimeout(function () { coreSwitching = false; render(); }, 80);
      }
      hidePage();
      return;
    }
    coreSwitching = false;
    
    if (isRoute()) showPage(); else hidePage();
  }
  function schedule() { clearTimeout(timer); timer = setTimeout(render, 40); }

  installStyle();
  window.addEventListener("popstate", schedule);
  document.addEventListener("click", function (event) {
    if (event.target && event.target.closest && event.target.closest("a,.ant-menu-item,.ant-menu-submenu-title") && !event.target.closest("#" + MENU_ID)) schedule();
  }, true);
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  render();
})();
