(function () {
  "use strict";

  if (window.__DC_PAID_USERS_DASHBOARD_INSTALLED__) return;
  window.__DC_PAID_USERS_DASHBOARD_INSTALLED__ = true;
  var ROUTE = "/dashboard/paid-users";
  var SOURCE_URL = "/paid-users/index.html?v=20260930-release";
  var PERMISSION = "integration:registered_accounts";
  var MENU_ID = "dc-paid-users-menu";
  var ROOT_ID = "dc-paid-users-root";
  var STYLE_ID = "dc-paid-users-style";
  var HIDE_CLASS = "dc-paid-users-host-hidden";
  var MENU_LABEL = "付费用户看板";
  var REUSE_LABEL = "复用看板";
  var USER_POOL_LABEL = "用户池";
  var syncTimer = 0;
  var authTimer = 0;
  var hiddenChildren = new Set();
  var pageHost = null;
  var ownedMenu = null;
  function isRoute() {
    return location.pathname === ROUTE;
  }
  function canView() {
    var user = window.__DC_USER__;
    if (!user) return false;
    var perms = Array.isArray(user.perms) ? user.perms : [];
    return !!user.is_super || perms.indexOf("*") >= 0 || perms.indexOf(PERMISSION) >= 0;
  }
  function labelOf(item) {
    var label = item.querySelector(".ant-menu-title-content");
    return (label ? label.textContent : item.textContent || "").trim();
  }
  function findUserManagementMenu() {
    var lists = Array.prototype.slice.call(document.querySelectorAll(".ant-layout-sider ul.ant-menu, aside ul.ant-menu"));
    if (!lists.length) lists = Array.prototype.slice.call(document.querySelectorAll("ul.ant-menu"));
    for (var i = 0; i < lists.length; i += 1) {
      var items = Array.prototype.slice.call(lists[i].children).filter(function (child) {
        return child.matches("li.ant-menu-item");
      });
      var reuse = items.find(function (item) {
        return labelOf(item) === REUSE_LABEL;
      });
      var userPool = items.find(function (item) {
        return labelOf(item) === USER_POOL_LABEL;
      });
      if (reuse && userPool) return {
        list: lists[i],
        reuse: reuse,
        userPool: userPool,
        items: items
      };
    }
    return null;
  }
  function removeOwnedMenu() {
    if (ownedMenu && ownedMenu.parentNode) ownedMenu.remove();
    ownedMenu = null;
  }
  function makeMenuItem(reference) {
    var item = reference.cloneNode(false);
    item.id = MENU_ID;
    item.classList.remove("ant-menu-item-selected");
    item.removeAttribute("data-menu-id");
    item.removeAttribute("data-menu-key");
    item.removeAttribute("aria-describedby");
    item.removeAttribute("aria-selected");
    item.setAttribute("role", "menuitem");
    item.setAttribute("tabindex", "0");
    item.setAttribute("data-paid-users-dashboard-menu", "");
    var icon = reference.querySelector(".ant-menu-item-icon");
    if (icon) item.appendChild(icon.cloneNode(true));
    var label = document.createElement("span");
    label.className = "ant-menu-title-content";
    label.textContent = MENU_LABEL;
    item.appendChild(label);
    item.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      navigateToPage();
    });
    item.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        navigateToPage();
      }
    });
    return item;
  }
  function syncMenu(authorized) {
    if (!authorized) {
      removeOwnedMenu();
      return;
    }
    var context = findUserManagementMenu();
    if (!context) {
      removeOwnedMenu();
      return;
    }
    var sameLabel = context.items.find(function (item) {
      return labelOf(item) === MENU_LABEL;
    });
    if (sameLabel && sameLabel !== ownedMenu) {
      removeOwnedMenu();
      if (context.list.contains(sameLabel) && sameLabel.nextElementSibling !== context.userPool) {
        context.list.insertBefore(sameLabel, context.userPool);
      }
      return;
    }
    if (!ownedMenu) ownedMenu = makeMenuItem(context.reuse);
    if (ownedMenu.parentNode !== context.list || ownedMenu.nextElementSibling !== context.userPool) {
      context.list.insertBefore(ownedMenu, context.userPool);
    }
    ownedMenu.classList.toggle("ant-menu-item-selected", isRoute());
    if (isRoute()) ownedMenu.setAttribute("aria-selected", "true");else ownedMenu.removeAttribute("aria-selected");
  }
  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = ["." + HIDE_CLASS + "{display:none!important}", "#" + ROOT_ID + "{box-sizing:border-box;width:100%;height:calc(100vh - 56px);min-height:640px;overflow:hidden;background:#f2f3f5}", "#" + ROOT_ID + " iframe{display:block;width:100%;height:100%;border:0;background:#f2f3f5}", "#" + MENU_ID + "{min-height:40px;line-height:40px}", "#" + MENU_ID + " .ant-menu-title-content{font-size:14px;line-height:40px}"].join("");
    document.head.appendChild(style);
  }
  function findContentHost() {
    return document.querySelector("main.ant-layout-content") || document.querySelector(".ant-layout-content") || document.querySelector("main");
  }
  function ensurePage(host) {
    var root = document.getElementById(ROOT_ID);
    if (root && root.parentNode !== host) {
      root.remove();
      root = null;
    }
    if (!root) {
      root = document.createElement("div");
      root.id = ROOT_ID;
      var frame = document.createElement("iframe");
      frame.src = SOURCE_URL;
      frame.title = MENU_LABEL;
      frame.loading = "eager";
      root.appendChild(frame);
      host.appendChild(root);
    }
    return root;
  }
  function isVisible(element) {
    return !element.hidden && window.getComputedStyle(element).display !== "none";
  }
  function restoreHostChildren() {
    hiddenChildren.forEach(function (child) {
      child.classList.remove(HIDE_CLASS);
    });
    hiddenChildren.clear();
    pageHost = null;
  }
  function showPage() {
    var host = findContentHost();
    if (!host) return;
    if (pageHost && pageHost !== host) restoreHostChildren();
    var root = ensurePage(host);
    pageHost = host;
    Array.prototype.forEach.call(host.children, function (child) {
      if (child === root || hiddenChildren.has(child) || !isVisible(child)) return;
      child.classList.add(HIDE_CLASS);
      hiddenChildren.add(child);
    });
    root.hidden = false;
  }
  function hidePage() {
    restoreHostChildren();
    var root = document.getElementById(ROOT_ID);
    if (root) root.hidden = true;
  }
  function render() {
    var authorized = canView();
    syncMenu(authorized);
    if (authorized && isRoute()) showPage();else hidePage();
  }
  function scheduleSync() {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(render, 40);
  }
  function navigateToPage() {
    if (location.pathname !== ROUTE) {
      history.pushState({}, "", ROUTE);
      window.dispatchEvent(new PopStateEvent("popstate", {
        state: history.state
      }));
    }
    scheduleSync();
  }
  function onDocumentClick(event) {
    var target = event.target;
    if (!target || !target.closest) return;
    if (target.closest("#" + MENU_ID)) return;
    if (target.closest("a, .ant-menu-item, .ant-menu-submenu-title")) scheduleSync();
  }
  function start() {
    if (!document.head || !document.body) {
      document.addEventListener("DOMContentLoaded", start, {
        once: true
      });
      return;
    }
    installStyle();
    window.addEventListener("popstate", scheduleSync);
    window.addEventListener("pageshow", scheduleSync);
    window.addEventListener("focus", scheduleSync);
    document.addEventListener("click", onDocumentClick, true);
    new MutationObserver(scheduleSync).observe(document.body, {
      childList: true,
      subtree: true
    });
    render();
    var attempts = 0;
    authTimer = setInterval(function () {
      attempts += 1;
      if (window.__DC_USER__ || attempts >= 40) {
        clearInterval(authTimer);
        authTimer = 0;
        scheduleSync();
      }
    }, 250);
  }
  if (document.readyState === "loading" && (!document.head || !document.body)) {
    document.addEventListener("DOMContentLoaded", start, {
      once: true
    });
  } else {
    start();
  }
})();
