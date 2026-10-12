/* 数据中台 · AI速览入口
 *
 * 位置：全局驾驶舱（A）、风控看板（B）、私域复用·数据看板（C）三处标题行右侧，
 *      点击后在标题下方展开速览面板（含「内容由 AI 生成」与重新生成、关闭）。
 *
 * 接入方式（任选其一，在 ai-overview.js 之后执行）：
 *   1) window.DC_AI_OVERVIEW.setEndpoint('/api/v1/ai-overview')
 *      GET {endpoint}?scene=core|risk|reuse，期望返回 {summary?, items?}
 *   2) window.DC_AI_OVERVIEW.register('core', function (ctx) {
 *        return Promise.resolve({ summary: '…', items: ['…', {title: '…', text: '…'}] })
 *      })
 *   ctx = { scene: 'core'|'risk'|'reuse', path: '/…' }
 *
 * 运行控制：window.DC_AI_OVERVIEW.open(scene) / close() / refresh()
 */
(function () {
  "use strict";

  if (window.__DC_AI_OVERVIEW__) return;

  var STYLE_ID = "dc-ai-overview-style";
  var ENTRY_ID = "dc-ai-overview-entry";
  var PANEL_ID = "dc-ai-overview-panel";
  var TICK_MS = 400;
  var CACHE_PREFIX = "dc-ai-overview-cache-v7:";
  var CACHE_MAX_STALE_MS = {
    reuse: 26 * 60 * 60 * 1000,
    core: 26 * 60 * 60 * 1000,
    risk: 26 * 60 * 60 * 1000
  };

  var SCENES = [
    { key: "reuse", path: "/dashboard/reuse", standalone: "/reuse-standalone.html", title: "私域复用·数据看板" },
    { key: "risk", path: "/risk/quality", title: "风控看板" },
    { key: "core", path: "/", title: "全局驾驶舱" }
  ];

  var config = { endpoint: "/api/v1/ai-overview" };
  var providers = {};
  var state = { scene: "", open: false, loading: false, error: false, pending: false,
    loaded: false, requested: false, summary: "", items: [], cache: null };
  var entry = null;
  var panel = null;
  var body = null;
  var timer = 0;

  function sceneByKey(key) {
    for (var i = 0; i < SCENES.length; i += 1) if (SCENES[i].key === key) return SCENES[i];
    return null;
  }

  function currentScene() {
    var path = location.pathname;
    if (window.__REUSE_STANDALONE__ || path === SCENES[0].standalone) return SCENES[0];
    for (var i = 0; i < SCENES.length; i += 1) if (SCENES[i].path === path) return SCENES[i];
    return null;
  }

  function contentRoot() {
    return document.querySelector("main.ant-layout-content") ||
      document.querySelector(".ant-layout-content") ||
      document.querySelector("main") ||
      document.body;
  }

  /* 以标题文字定位标题行：取文字完全一致的最小元素，向上找到横跨内容区的弹性行 */
  function titleRow(root, title) {
    var nodes = root.querySelectorAll("h1,h2,h3,h4,span,div,p");
    var best = null;
    var bestArea = Infinity;
    for (var i = 0; i < nodes.length; i += 1) {
      var node = nodes[i];
      if ((node.textContent || "").trim() !== title) continue;
      var rect = node.getBoundingClientRect();
      var area = rect.width * rect.height;
      if (area < bestArea) { best = node; bestArea = area; }
    }
    if (!best) return null;
    var rootWidth = root.getBoundingClientRect().width || document.documentElement.clientWidth;
    var cursor = best.parentElement;
    for (var hop = 0; cursor && cursor !== root && hop < 10; hop += 1) {
      var style = getComputedStyle(cursor);
      var width = cursor.getBoundingClientRect().width;
      if ((style.display === "flex" || style.display === "inline-flex") && width >= rootWidth * 0.5) return cursor;
      cursor = cursor.parentElement;
    }
    return best.parentElement;
  }

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".dc-ai-entry{margin-left:auto;display:inline-flex;align-items:center;gap:6px;padding:3px 10px;",
      "border:1px solid #dfe1f7;border-radius:8px;background:#f7f8ff;color:#4f46e5;font-size:13px;",
      "font-weight:600;line-height:20px;cursor:pointer;white-space:nowrap;transition:background .15s,border-color .15s}",
      ".dc-ai-entry:hover{background:#eef1ff;border-color:#c3c7f5}",
      ".dc-ai-entry[aria-expanded='true']{background:#eef1ff;border-color:#c3c7f5}",
      ".dc-ai-entry svg{width:14px;height:14px;display:block}",
      ".dc-ai-entry-tag{padding:0 6px;border:1px solid #dfe1f7;border-radius:6px;background:#fff;",
      "color:#8c95a8;font-size:11px;font-weight:400;line-height:16px}",
      ".dc-ai-panel{margin:12px 0 0;border:1px solid #e6e8f0;border-radius:10px;background:#fff;",
      "box-shadow:0 1px 3px rgba(16,24,40,.05);overflow:hidden}",
      ".dc-ai-panel-body{padding:16px 18px 4px;color:#344054;font-size:13px;line-height:1.9}",
      ".dc-ai-summary{margin:0 0 6px}",
      ".dc-ai-list{margin:0;padding-left:20px}",
      ".dc-ai-list li{margin:2px 0;padding-left:2px}",
      ".dc-ai-list strong{color:#1d2939}",
      ".dc-ai-empty{margin:0;color:#98a2b3}",
      ".dc-ai-panel-footer{display:flex;align-items:center;justify-content:space-between;",
      "padding:6px 14px 10px;color:#98a2b3;font-size:12px}",
      ".dc-ai-panel-actions{display:inline-flex;align-items:center;gap:4px}",
      ".dc-ai-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;",
      "border:0;border-radius:6px;background:transparent;color:#98a2b3;cursor:pointer}",
      ".dc-ai-icon-btn:hover{background:#f2f4f7;color:#475467}",
      ".dc-ai-icon-btn svg{width:14px;height:14px;display:block}"
    ].join("");
    document.head.appendChild(style);
  }

  function icon(paths) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + "</svg>";
  }

  function buildEntry() {
    var button = document.createElement("button");
    button.id = ENTRY_ID;
    button.type = "button";
    button.className = "dc-ai-entry";
    button.setAttribute("aria-expanded", "false");
    button.innerHTML =
      icon('<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>') +
      "<span>AI速览</span><span class=\"dc-ai-entry-tag\">试用</span>";
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (state.open) close(); else open(state.scene || (currentScene() || {}).key);
    });
    return button;
  }

  function buildPanel() {
    var node = document.createElement("section");
    node.id = PANEL_ID;
    node.className = "dc-ai-panel";
    node.hidden = true;
    node.setAttribute("aria-label", "AI速览");
    node.innerHTML =
      '<div class="dc-ai-panel-body"></div>' +
      '<div class="dc-ai-panel-footer"><span>内容由 AI 生成</span>' +
      '<span class="dc-ai-panel-actions">' +
      '<button type="button" class="dc-ai-icon-btn" data-dc-ai-refresh title="重新生成" aria-label="重新生成">' +
      icon('<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/>') + "</button>" +
      '<button type="button" class="dc-ai-icon-btn" data-dc-ai-close title="关闭" aria-label="关闭">' +
      icon('<path d="M18 6L6 18"/><path d="M6 6l12 12"/>') + "</button>" +
      "</span></div>";
    body = node.querySelector(".dc-ai-panel-body");
    node.querySelector("[data-dc-ai-close]").addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      close();
    });
    node.querySelector("[data-dc-ai-refresh]").addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      load(state.scene, true);
    });
    return node;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function renderBody() {
    if (!body) return;
    if (state.loading) { body.innerHTML = '<p class="dc-ai-empty">正在生成速览…</p>'; return; }
    if (state.pending) { body.innerHTML = '<p class="dc-ai-empty">速览接口待接入</p>'; return; }
    if (state.error) { body.innerHTML = '<p class="dc-ai-empty">速览生成失败，请稍后重试</p>'; return; }
    if (!state.summary && !state.items.length) {
      body.innerHTML = '<p class="dc-ai-empty">暂无速览内容</p>';
      return;
    }
    var html = state.summary ? '<p class="dc-ai-summary">' + escapeHtml(state.summary) + "</p>" : "";
    if (state.items.length) {
      html += "<ol class=\"dc-ai-list\">" + state.items.map(function (item) {
        if (item && typeof item === "object") {
          var head = item.title ? "<strong>" + escapeHtml(item.title) + "</strong>：" : "";
          return "<li>" + head + escapeHtml(item.text) + "</li>";
        }
        return "<li>" + escapeHtml(item) + "</li>";
      }).join("") + "</ol>";
    }
    body.innerHTML = html;
  }

  function token() {
    try {
      return sessionStorage.getItem("dc_token") || localStorage.getItem("dc_token") ||
        localStorage.getItem("sso_token") || "";
    } catch (error) { return ""; }
  }

  function cacheNamespace() {
    var value = token() || "anonymous";
    var hash = 2166136261;
    for (var i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16);
  }

  function cacheKey(scene) {
    return CACHE_PREFIX + cacheNamespace() + ":" + scene;
  }

  function readCache(scene) {
    try {
      var raw = localStorage.getItem(cacheKey(scene));
      if (!raw) return null;
      var value = JSON.parse(raw);
      if (!value || typeof value !== "object" || !value.savedAt) return null;
      var maxStale = CACHE_MAX_STALE_MS[scene] || 6 * 60 * 60 * 1000;
      if (Date.now() - Number(value.savedAt) > maxStale) {
        localStorage.removeItem(cacheKey(scene));
        return null;
      }
      return value;
    } catch (error) { return null; }
  }

  function writeCache(scene, result) {
    try {
      localStorage.setItem(cacheKey(scene), JSON.stringify({
        savedAt: Date.now(),
        summary: result.summary || "",
        items: result.items || [],
        cache: result.cache || null
      }));
    } catch (error) { /* 本地缓存不可用时仍走服务端缓存 */ }
  }

  function applyResult(result) {
    state.summary = result.summary || "";
    state.items = result.items || [];
    state.cache = result.cache || null;
    state.loaded = !!(state.summary || state.items.length);
  }

  function normalize(payload) {
    var data = payload && payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)
      ? payload.data : payload;
    if (!data || typeof data !== "object") return { summary: "", items: [] };
    var items = Array.isArray(data.items) ? data.items : (Array.isArray(data.list) ? data.list : []);
    return {
      summary: typeof data.summary === "string" ? data.summary : (typeof data.text === "string" ? data.text : ""),
      items: items.filter(function (item) { return typeof item === "string" || (item && typeof item === "object"); }),
      cache: data.cache && typeof data.cache === "object" ? data.cache :
        (payload && payload.cache && typeof payload.cache === "object" ? payload.cache : null)
    };
  }

  function request(params) {
    var headers = { Accept: "application/json" };
    var value = token();
    if (value) headers.Authorization = "Bearer " + value;
    var query = "?scene=" + encodeURIComponent(params.scene);
    if (params.force) query += "&force=1&_dc=20260923-template-v3";
    return fetch(params.endpoint + query, {
      headers: headers, credentials: "same-origin"
    }).then(function (response) {
      var type = (response.headers.get("content-type") || "").toLowerCase();
      if (response.status === 404 || response.status === 501 || type.indexOf("json") < 0) {
        var pending = new Error("endpoint pending");
        pending.pending = true;
        throw pending;
      }
      if (!response.ok) {
        var failure = new Error("HTTP " + response.status);
        failure.status = response.status;
        throw failure;
      }
      return response.json();
    });
  }

  function load(scene, force) {
    var target = sceneByKey(scene) || currentScene();
    if (!target) return;
    if (!force && state.requested && state.scene === target.key) { renderBody(); return; }
    if (state.scene !== target.key) {
      state.scene = target.key;
      state.requested = false;
      state.loaded = false;
      state.summary = "";
      state.items = [];
      state.cache = null;
    }
    if (!state.loaded) {
      var cached = readCache(target.key);
      if (cached) applyResult(cached);
    }
    state.scene = target.key;
    state.requested = true;
    var hadContent = state.loaded;
    state.loading = !hadContent;
    state.error = false;
    state.pending = false;
    renderBody();
    var context = { scene: target.key, path: location.pathname };
    var loader = providers[target.key];
    var task = loader ? Promise.resolve().then(function () { return loader(context); })
      : request({ endpoint: config.endpoint, scene: target.key, force: !!force });
    task.then(function (payload) {
      var result = normalize(payload);
      if (state.scene !== target.key) return;
      state.loading = false;
      state.error = false;
      state.pending = false;
      applyResult(result);
      writeCache(target.key, result);
      renderBody();
    }).catch(function (failure) {
      if (state.scene !== target.key) return;
      state.loading = false;
      if (hadContent) {
        state.error = false;
        state.pending = false;
        state.loaded = true;
        renderBody();
        return;
      }
      state.pending = !!(failure && (failure.pending || failure.status === 404 || failure.status === 501));
      state.error = !state.pending;
      state.loaded = false;
      state.summary = "";
      state.items = [];
      renderBody();
    });
  }

  function open(scene) {
    var target = sceneByKey(scene) || currentScene();
    if (!target) return;
    if (state.scene !== target.key) {
      state.scene = target.key;
      state.loaded = false;
      state.error = false;
      state.pending = false;
      state.summary = "";
      state.items = [];
      state.cache = null;
      state.requested = false;
    }
    state.open = true;
    sync();
    if (!state.loaded) load(target.key);
    else renderBody();
  }

  function close() {
    state.open = false;
    sync();
  }

  function mount() {
    var scene = currentScene();
    if (!scene) return false;
    var root = contentRoot();
    if (!root) return false;
    var row = titleRow(root, scene.title);
    if (!row || !row.parentElement) return false;
    installStyle();
    if (!entry) entry = buildEntry();
    if (entry.parentElement !== row) row.appendChild(entry);
    if (!panel) panel = buildPanel();
    if (panel.previousElementSibling !== row) row.parentElement.insertBefore(panel, row.nextSibling);
    clearFixedControls(row);
    return true;
  }

  /* 核心看板右上角有固定的整包/分包切换，按钮需让位，避免叠在一起 */
  function clearFixedControls(row) {
    if (!entry) return;
    var offset = 0;
    var scope = document.getElementById("dc-data-scope-switch");
    var scopeRect = scope ? scope.getBoundingClientRect() : null;
    if (scopeRect && scopeRect.width > 0 && scopeRect.height > 0) {
      var rowRect = row.getBoundingClientRect();
      var verticalHit = scopeRect.bottom > rowRect.top && scopeRect.top < rowRect.bottom;
      if (scopeRect.width && verticalHit) offset = Math.round(scopeRect.width) + 8;
    }
    var value = offset ? offset + "px" : "";
    if (entry.style.marginRight !== value) entry.style.marginRight = value;
  }

  function unmount() {
    if (entry && entry.parentElement) entry.remove();
    if (panel && panel.parentElement) panel.remove();
  }

  function sync() {
    if (entry) entry.setAttribute("aria-expanded", state.open ? "true" : "false");
    if (panel) panel.hidden = !state.open;
  }

  function ensure() {
    if (!currentScene()) {
      if (entry || panel) { close(); unmount(); }
      return;
    }
    if (!mount()) return;
    sync();
    if (state.open && body && !body.childNodes.length) renderBody();
  }

  timer = setInterval(ensure, TICK_MS);
  window.addEventListener("popstate", function () { setTimeout(ensure, 0); });
  window.addEventListener("resize", function () { if (state.open) ensure(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ensure);
  else ensure();

  window.DC_AI_OVERVIEW = {
    version: "20260923-ai-overview-template-v2",
    scenes: SCENES.map(function (scene) { return scene.key; }),
    setEndpoint: function (url) { if (url) config.endpoint = String(url); return config.endpoint; },
    register: function (scene, loader) {
      if (sceneByKey(scene) && typeof loader === "function") providers[scene] = loader;
      return providers[scene] || null;
    },
    open: function (scene) { open(scene); },
    close: function () { close(); },
    refresh: function () { load(state.scene || (currentScene() || {}).key, true); },
    getScene: function () { return (currentScene() || {}).key || ""; }
  };
  window.__DC_AI_OVERVIEW__ = window.DC_AI_OVERVIEW;
})();
