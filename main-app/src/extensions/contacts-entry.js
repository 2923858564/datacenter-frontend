(function () {
  "use strict";

  var ROUTE = "/dashboard/contacts";
  var CHAT_ROUTE = ROUTE + "?view=wecom-chat";
  var USER_POOL_ROUTE = "/dashboard/registered-accounts";
  var PERMISSION = "integration:registered_accounts";
  var MENU_PATCH_KEY = "__dcContactsEntry";
  var ROOT_ID = "dc-contacts-root";
  var STYLE_ID = "dc-contacts-style";
  var HIDDEN_CLASS = "dc-contacts-host-hidden";
  var scheduled = 0;
  function isWecomChatPage() {
    return location.pathname === ROUTE && new URLSearchParams(location.search).get("view") === "wecom-chat";
  }
  function syncMenuSelection() {
    var chatActive = isWecomChatPage();
    Array.prototype.forEach.call(document.querySelectorAll("[data-menu-id]"), function (entry) {
      var key = entry.getAttribute("data-menu-id");
      if (key.slice(-CHAT_ROUTE.length) === CHAT_ROUTE) entry.classList.toggle("ant-menu-item-selected", chatActive);
      if (key.slice(-ROUTE.length) === ROUTE) entry.classList.toggle("ant-menu-item-selected", !chatActive && location.pathname === ROUTE);
    });
  }
  function hasPermission() {
    var user = window.__DC_USER__ || {};
    var permissions = Array.isArray(user.perms) ? user.perms : [];
    return !!user.is_super || permissions.indexOf("*") >= 0 || permissions.indexOf(PERMISSION) >= 0;
  }
  function navigation() {
    var value = window.__DC_NAVIGATION__;
    return value && value.ready && typeof value.items === "function" && typeof value.target === "function" ? value : null;
  }
  function patchNavigation() {
    var nav = navigation();
    if (!nav || !hasPermission() || !nav.target("personnel")) return false;
    if (nav.items[MENU_PATCH_KEY]) return true;
    var originalItems = nav.items;
    function allowed(items) {
      return originalItems.call(nav, items);
    }
    function item(key, label) {
      return {
        key: key,
        label: label
      };
    }
    function withContacts(items) {
      var result = Array.isArray(items) ? items.slice() : [];
      var contactItems = allowed([item(ROUTE, "通讯录")]);
      if (!contactItems.length) return result;
      var chatItems = allowed([item(CHAT_ROUTE, "企微对话")]);
      var userPoolIndex = result.findIndex(function (entry) {
        return entry && entry.key === USER_POOL_ROUTE;
      });
      var contactIndex = result.findIndex(function (entry) {
        return entry && entry.key === ROUTE;
      });
      if (contactIndex < 0 && userPoolIndex >= 0) {
        var contactItem = contactItems[0];
        if (result[userPoolIndex].icon) {
          contactItem = Object.assign({}, contactItem, {
            icon: result[userPoolIndex].icon
          });
        }
        result.splice(userPoolIndex + 1, 0, contactItem);
      }
      if (!chatItems.length) return result;
      contactIndex = result.findIndex(function (entry) {
        return entry && entry.key === ROUTE;
      });
      var hasUserManagementAnchor = result.some(function (entry) {
        if (!entry) return false;
        var key = typeof entry.key === "string" ? entry.key : "";
        return key === USER_POOL_ROUTE || key === ROUTE || key === "personnel" || key === "/personnel" || key.slice(-10) === "/personnel" || entry.label === "人员档案";
      });
      if (!hasUserManagementAnchor) return result;
      var hasChatItem = result.some(function (entry) {
        return entry && entry.key === CHAT_ROUTE;
      });
      if (!hasChatItem) {
        var personnelIndex = result.findIndex(function (entry) {
          if (!entry) return false;
          var key = typeof entry.key === "string" ? entry.key : "";
          return key === "personnel" || key === "/personnel" || key.slice(-10) === "/personnel" || entry.label === "人员档案";
        });
        var anchorIndex = personnelIndex >= 0 ? personnelIndex : contactIndex;
        if (anchorIndex < 0) anchorIndex = result.findIndex(function (entry) {
          return entry && entry.key === USER_POOL_ROUTE;
        });
        if (anchorIndex >= 0) {
          var anchorItem = result[anchorIndex];
          if (!anchorItem.icon && contactIndex >= 0) anchorItem = result[contactIndex];
          var chatItem = Object.assign({}, chatItems[0]);
          if (anchorItem && anchorItem.icon) chatItem.icon = anchorItem.icon;
          result.splice(anchorIndex + 1, 0, chatItem);
        }
      }
      return result;
    }
    function itemsWithContacts(items) {
      return withContacts(originalItems.call(nav, items || []));
    }
    itemsWithContacts[MENU_PATCH_KEY] = true;
    nav.items = itemsWithContacts;
    window.dispatchEvent(new Event("dc:navigation-ready"));
    return true;
  }
  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = ["." + HIDDEN_CLASS + "{display:none!important}", "#" + ROOT_ID + "{box-sizing:border-box;width:100%;height:calc(100vh - 56px);min-height:640px;overflow:hidden;background:#f5f6f8}", "#dc-contacts-frame{display:block;width:100%;height:100%;border:0;background:#f5f6f8}"].join("");
    document.head.appendChild(style);
  }
  function contentHost() {
    return document.querySelector("main.ant-layout-content") || document.querySelector(".ant-layout-content") || document.querySelector("main");
  }
  function ensurePage(host) {
    var root = document.getElementById(ROOT_ID);
    if (!root) {
      root = document.createElement("div");
      root.id = ROOT_ID;
      var frame = document.createElement("iframe");
      frame.id = "dc-contacts-frame";
      var chatPage = isWecomChatPage();
      frame.title = chatPage ? "企微对话（原型演示）" : "通讯录";
      frame.src = chatPage ? "/wecom-chat.html?v=20261002-wecom-prototype-v1" : "/contacts.html?v=20261002-contacts-v2";
      root.appendChild(frame);
    }
    if (root.parentNode && root.parentNode !== host) {
      Array.prototype.forEach.call(root.parentNode.children, function (child) {
        if (child !== root && child.classList.contains(HIDDEN_CLASS)) child.classList.remove(HIDDEN_CLASS);
      });
    }
    if (root.parentNode !== host) host.appendChild(root);
    var frame = root.querySelector("#dc-contacts-frame");
    if (frame) {
      var chatPage = isWecomChatPage();
      var source = chatPage ? "/wecom-chat.html?v=20261002-wecom-prototype-v1" : "/contacts.html?v=20261002-contacts-v2";
      if (frame.getAttribute("src") !== source) frame.setAttribute("src", source);
      frame.title = chatPage ? "企微对话（原型演示）" : "通讯录";
    }
    return root;
  }
  function showPage() {
    var host = contentHost();
    if (!host) return;
    var root = ensurePage(host);
    Array.prototype.forEach.call(host.children, function (child) {
      if (child !== root && !child.classList.contains(HIDDEN_CLASS)) child.classList.add(HIDDEN_CLASS);
    });
    root.hidden = false;
  }
  function hidePage() {
    var root = document.getElementById(ROOT_ID);
    if (!root || !root.parentNode) return;
    Array.prototype.forEach.call(root.parentNode.children, function (child) {
      if (child !== root && child.classList.contains(HIDDEN_CLASS)) child.classList.remove(HIDDEN_CLASS);
    });
    root.hidden = true;
  }
  function renderRoute() {
    if (!hasPermission()) {
      hidePage();
      return;
    }
    patchNavigation();
    if (location.pathname === ROUTE) showPage();else hidePage();
    syncMenuSelection();
  }
  function schedule() {
    clearTimeout(scheduled);
    scheduled = setTimeout(renderRoute, 40);
  }
  function watchHistory(method) {
    var original = history[method];
    if (typeof original !== "function" || original.__dcContactsEntry) return;
    var wrapped = function () {
      var result = original.apply(this, arguments);
      schedule();
      return result;
    };
    wrapped.__dcContactsEntry = true;
    history[method] = wrapped;
  }
  if (!hasPermission()) return;
  installStyle();
  patchNavigation();
  watchHistory("pushState");
  watchHistory("replaceState");
  window.addEventListener("popstate", schedule);
  window.addEventListener("dc:navigation-ready", schedule);
  document.addEventListener("click", function (event) {
    if (event.target && event.target.closest && event.target.closest("a,.ant-menu-item,.ant-menu-submenu-title")) schedule();
  }, true);
  new MutationObserver(schedule).observe(document.body, {
    childList: true,
    subtree: true
  });
  renderRoute();
})();
