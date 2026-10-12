(function () {
  "use strict";

  var ROUTE = "/dashboard/item-log";
  var MENU_ID = "dc-itemlog-menu";
  var ROOT_ID = "dc-itemlog-root";
  var STYLE_ID = "dc-itemlog-style";
  var syncTimer = 0;
  var projectReference = null;

  function isItemLogRoute() {
    return location.pathname === ROUTE;
  }

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".dc-itemlog-host-hidden{display:none!important}",
      "#dc-itemlog-root{box-sizing:border-box;width:100%;min-height:calc(100vh - 56px);padding:24px;background:#f3f6fa;color:#1f2937}",
      "#dc-itemlog-root *{box-sizing:border-box}",
      ".dc-itemlog-head{display:flex;align-items:center;gap:10px;margin:0 0 18px}",
      ".dc-itemlog-head svg{width:22px;height:22px;color:#1677ff}",
      ".dc-itemlog-head h1{margin:0;font-size:20px;line-height:28px;font-weight:650;color:#182230}",
      ".dc-itemlog-card{background:#fff;border:1px solid #e5eaf0;border-radius:12px;box-shadow:0 1px 2px rgba(16,24,40,.03);overflow:hidden}",
      ".dc-itemlog-filter{display:flex;align-items:center;flex-wrap:wrap;gap:10px;padding:16px 20px;border-bottom:1px solid #edf0f4}",
      ".dc-itemlog-control{width:100%;height:34px;border:1px solid #d9dfe8;border-radius:6px;background:#fff;color:#344054;padding:0 11px;font-family:inherit;font-size:14px;line-height:32px;outline:none}",
      ".dc-itemlog-control:focus{border-color:#1677ff;box-shadow:0 0 0 2px rgba(22,119,255,.12)}",
      ".dc-itemlog-control::placeholder{color:#98a2b3}",
      ".dc-itemlog-filter>select{flex:0 0 132px}",
      ".dc-itemlog-game-field{display:flex;align-items:center;flex:0 0 330px;gap:6px}",
      ".dc-itemlog-game-search{flex:1 1 auto;min-width:0}",
      ".dc-itemlog-clear{height:34px;padding:0 10px;border:1px solid #d9dfe8;border-radius:6px;background:#fff;color:#667085;font-family:inherit;font-size:13px;cursor:pointer}",
      ".dc-itemlog-clear:hover{border-color:#1677ff;color:#1677ff}",
      ".dc-itemlog-filter>input{flex:0 0 150px}",
      ".dc-itemlog-range{display:flex;align-items:center;flex:0 0 240px;width:240px;height:34px;border:1px solid #d9dfe8;border-radius:6px;background:#fff;padding:0 9px;transition:border-color .2s,box-shadow .2s;cursor:text}",
      ".dc-itemlog-range:focus-within{border-color:#1677ff;box-shadow:0 0 0 2px rgba(22,119,255,.12)}",
      ".dc-itemlog-range-value{min-width:0;flex:1;color:#344054;font-size:14px;text-align:center;white-space:nowrap}",
      ".dc-itemlog-range-separator{display:inline-flex;align-items:center;justify-content:center;width:28px;color:#98a2b3;font-size:15px}",
      ".dc-itemlog-range-calendar{display:inline-flex;align-items:center;justify-content:center;margin-left:4px;color:#667085;cursor:pointer}",
      ".dc-itemlog-range-calendar svg{width:15px;height:15px}",
      ".dc-itemlog-picker{position:fixed;z-index:11050;display:none;width:696px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 24px rgba(15,23,42,.18);overflow:hidden;color:#344054}",
      ".dc-itemlog-picker.open{display:flex}",
      ".dc-itemlog-presets{flex:0 0 120px;padding:12px 0;border-right:1px solid #edf0f4;background:#fff}",
      ".dc-itemlog-preset{display:block;width:100%;height:36px;padding:0 16px;border:0;background:transparent;color:#344054;text-align:left;font-family:inherit;font-size:14px;line-height:36px;cursor:pointer}",
      ".dc-itemlog-preset:hover{background:#f5f8ff;color:#1677ff}",
      ".dc-itemlog-calendars{display:grid;grid-template-columns:1fr 1fr;flex:1;min-width:0}",
      ".dc-itemlog-month{padding:10px 14px 14px}",
      ".dc-itemlog-month+.dc-itemlog-month{border-left:1px solid #f1f3f6}",
      ".dc-itemlog-month-head{display:grid;grid-template-columns:64px 1fr 64px;align-items:center;height:36px;margin-bottom:6px}",
      ".dc-itemlog-month-title{text-align:center;font-size:14px;font-weight:650;color:#1f2937}",
      ".dc-itemlog-month-navs{display:flex;align-items:center;justify-content:center}",
      ".dc-itemlog-month-nav{width:28px;height:28px;border:0;border-radius:6px;background:transparent;color:#98a2b3;font-size:20px;line-height:26px;cursor:pointer}",
      ".dc-itemlog-month-nav:hover{background:#f3f6fa;color:#1677ff}",
      ".dc-itemlog-week,.dc-itemlog-days{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}",
      ".dc-itemlog-week span{height:28px;text-align:center;font-size:13px;line-height:28px;color:#475467}",
      ".dc-itemlog-day{height:32px;border:0;border-radius:6px;background:transparent;color:#344054;font-family:inherit;font-size:14px;line-height:32px;text-align:center;cursor:pointer}",
      ".dc-itemlog-day:hover{background:#eaf3ff;color:#1677ff}",
      ".dc-itemlog-day.muted{color:#c5cbd3}",
      ".dc-itemlog-day.in-range{border-radius:0;background:#edf5ff;color:#1677ff}",
      ".dc-itemlog-day.selected{border-radius:6px;background:#1677ff;color:#fff;font-weight:600}",
      ".dc-itemlog-actions{display:flex;gap:10px}",
      ".dc-itemlog-btn{height:34px;padding:0 18px;border-radius:6px;border:1px solid #d9dfe8;background:#fff;color:#344054;font-family:inherit;font-size:14px;line-height:32px;cursor:pointer}",
      ".dc-itemlog-btn:hover{border-color:#1677ff;color:#1677ff}",
      ".dc-itemlog-btn-primary{border-color:#1677ff;background:#1677ff;color:#fff}",
      ".dc-itemlog-btn-primary:hover{background:#4096ff;color:#fff}",
      ".dc-itemlog-count{padding:14px 20px 12px;font-size:14px;color:#475467}",
      ".dc-itemlog-count strong{color:#f04438;font-weight:650}",
      ".dc-itemlog-source-badge{display:inline-flex;align-items:center;height:22px;margin-right:10px;padding:0 8px;border-radius:999px;background:#fff7e6;color:#d46b08;font-size:12px;font-weight:600}",
      ".dc-itemlog-table-wrap{margin:0 20px;border:1px solid #e5eaf0;border-radius:8px;overflow:auto}",
      ".dc-itemlog-table{width:100%;min-width:1180px;border-collapse:separate;border-spacing:0;font-size:13px}",
      ".dc-itemlog-table th{height:44px;padding:0 12px;background:#f8fafc;border-bottom:1px solid #e5eaf0;border-right:1px solid #edf0f4;color:#475467;font-weight:600;text-align:left;white-space:nowrap}",
      ".dc-itemlog-table th:last-child{border-right:0}",
      ".dc-itemlog-table td{height:44px;padding:0 12px;border-bottom:1px solid #edf0f4;color:#344054;white-space:nowrap}",
      ".dc-itemlog-table tbody tr:hover td{background:#f8fbff}",
      ".dc-itemlog-table tbody tr:last-child td{border-bottom:0}",
      ".dc-itemlog-sort{padding:0;border:0;background:transparent;color:inherit;font:inherit;font-weight:inherit;cursor:pointer}",
      ".dc-itemlog-sort:hover{color:#1677ff}",
      ".dc-itemlog-action{display:inline-flex;align-items:center;height:24px;padding:0 8px;border-radius:4px;background:#eaf3ff;color:#1677ff;font-size:12px}",
      ".dc-itemlog-action.consume{background:#fff1f0;color:#cf1322}",
      ".dc-itemlog-action.trade{background:#fff7e6;color:#d46b08}",
      ".dc-itemlog-change.positive{color:#16a34a}",
      ".dc-itemlog-change.negative{color:#dc2626}",
      ".dc-itemlog-empty{height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#98a2b3;font-size:14px}",
      ".dc-itemlog-empty svg{width:44px;height:44px;margin-bottom:10px;color:#cbd5e1}",
      ".dc-itemlog-pagination{display:flex;align-items:center;justify-content:flex-end;gap:12px;padding:16px 20px;color:#667085;font-size:13px}",
      ".dc-itemlog-pagesize{width:92px}",
      ".dc-itemlog-pagebtn{width:32px;height:32px;border:1px solid #e5eaf0;border-radius:6px;background:#fff;color:#98a2b3}",
      ".dc-itemlog-pagebtn.active{border-color:#1677ff;color:#1677ff;background:#eaf3ff}",
      ".dc-itemlog-pagebtn:disabled{cursor:not-allowed;background:#f8fafc}",
      ".dc-itemlog-pages{display:flex;align-items:center;gap:6px}",
      ".dc-itemlog-jump{width:48px;height:32px;text-align:center}",
      "#dc-itemlog-menu{min-height:40px;line-height:40px}",
      "#dc-itemlog-menu .dc-itemlog-menu-icon{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;margin-right:13px;flex:0 0 18px}",
      "#dc-itemlog-menu .dc-itemlog-menu-icon svg{width:18px;height:18px;stroke-width:2.1}",
      "#dc-itemlog-menu .ant-menu-title-content{font-size:14px;line-height:40px}",
      "@media(max-width:1180px){.dc-itemlog-range{flex:1 1 260px;width:auto}.dc-itemlog-actions{margin-left:auto}}",
      "@media(max-width:760px){#dc-itemlog-root{padding:16px}.dc-itemlog-game-field,.dc-itemlog-filter>select,.dc-itemlog-filter>input,.dc-itemlog-range{flex:1 1 100%;width:100%}.dc-itemlog-actions{width:100%;margin-left:0}.dc-itemlog-btn{flex:1}.dc-itemlog-pagination{justify-content:flex-start;overflow:auto}.dc-itemlog-picker{width:calc(100vw - 24px)}.dc-itemlog-presets{display:none}.dc-itemlog-calendars{grid-template-columns:1fr}.dc-itemlog-month+.dc-itemlog-month{display:none}}"
    ].join("");
    document.head.appendChild(style);
  }

  function menuMarkup() {
    return '<span class="dc-itemlog-menu-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 8h12l-1 11H7L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg></span><span class="ant-menu-title-content">物品记录</span>';
  }


  function openItemLog(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!isItemLogRoute()) history.pushState({}, "", ROUTE);
    renderRoute();
  }

  function pageMarkup() {
    return [
      '<div class="dc-itemlog-head">',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 8h12l-1 11H7L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>',
      '<h1>物品记录</h1></div>',
      '<section class="dc-itemlog-card" aria-label="物品记录查询">',
      '<form class="dc-itemlog-filter" id="dc-itemlog-form">',
      '<div class="dc-itemlog-game-field"><input class="dc-itemlog-control dc-itemlog-game-search" name="gameSearch" list="dc-itemlog-games" placeholder="搜索并选择游戏" aria-label="游戏"><button class="dc-itemlog-clear" data-game-clear type="button">清空</button></div><input type="hidden" name="game"><datalist id="dc-itemlog-games"></datalist>',
      '<select class="dc-itemlog-control" name="zone" aria-label="区服"><option value="">全部区服</option></select>',
      '<input class="dc-itemlog-control" name="role" placeholder="角色名/角色ID" aria-label="角色名或角色ID">',
      '<input class="dc-itemlog-control" name="itemId" placeholder="物品唯一ID" aria-label="物品唯一ID">',
      '<div class="dc-itemlog-range ant-picker ant-picker-range" role="button" tabindex="0" aria-label="日期范围" aria-expanded="false"><input type="hidden" name="start"><input type="hidden" name="end"><span class="dc-itemlog-range-value" data-range-start></span><span class="dc-itemlog-range-separator" aria-hidden="true">→</span><span class="dc-itemlog-range-value" data-range-end></span><span class="dc-itemlog-range-calendar" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg></span></div>',
      '<div class="dc-itemlog-actions"><button class="dc-itemlog-btn dc-itemlog-btn-primary" type="submit">查询</button><button class="dc-itemlog-btn" type="reset">重置</button></div>',
      '</form>',
      '<div class="dc-itemlog-count"><span class="dc-itemlog-source-badge">996 实时查询</span><span data-record-summary>等待查询</span><span data-query-message role="status" style="display:block;margin-top:6px;font-size:12px;color:#667085"></span></div>',
      '<div class="dc-itemlog-table-wrap">',
      '<table class="dc-itemlog-table"><thead><tr><th>序号</th><th><button type="button" class="dc-itemlog-sort" data-sort="time">时间 ↕</button></th><th>游戏</th><th>区服</th><th>角色ID</th><th>角色名</th><th>充值金额</th><th>动作</th><th>物品名称</th><th>物品唯一ID</th><th><button type="button" class="dc-itemlog-sort" data-sort="change">变化数量 ↕</button></th></tr></thead><tbody data-table-body></tbody></table>',
      '<div class="dc-itemlog-empty" role="status"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 14h24v25H12z"/><path d="M18 14a6 6 0 0 1 12 0M18 25h12"/></svg><span>暂无数据</span></div>',
      '</div>',
      '<div class="dc-itemlog-pagination" aria-label="分页"><span data-pagination-total>共 0 条</span><select class="dc-itemlog-control dc-itemlog-pagesize" data-page-size aria-label="每页条数"><option value="10">10条/页</option><option value="20">20条/页</option><option value="30" selected>30条/页</option></select><button class="dc-itemlog-pagebtn" data-page-prev aria-label="上一页">‹</button><span class="dc-itemlog-pages" data-pages></span><button class="dc-itemlog-pagebtn" data-page-next aria-label="下一页">›</button><span>前往</span><input class="dc-itemlog-control dc-itemlog-jump" data-page-jump value="1" inputmode="numeric" aria-label="页码"><span>页</span></div>',
      '</section>'
    ].join("");
  }

  function findContentHost() {
    return document.querySelector("main.ant-layout-content") ||
      document.querySelector(".ant-layout-content") ||
      document.querySelector("main");
  }

  function installSourceTable(root, form) {
    var game = form.elements.game, gameSearch = form.elements.gameSearch, gameList = root.querySelector("#dc-itemlog-games"), zone = form.elements.zone;
    var tbody = root.querySelector("[data-table-body]"), empty = root.querySelector(".dc-itemlog-empty");
    var summary = root.querySelector("[data-record-summary]"), message = root.querySelector("[data-query-message]");
    var total = root.querySelector("[data-pagination-total]"), size = root.querySelector("[data-page-size]");
    var prev = root.querySelector("[data-page-prev]"), next = root.querySelector("[data-page-next]");
    var pages = root.querySelector("[data-pages]"), jump = root.querySelector("[data-page-jump]");
    var state = { rows: [], games: [], gamesLoaded: false, gamesLoading: false, zonesGameId: "", page: 1, pageSize: 30, hasNext: false, busy: false, ready: false, request: 0, applied: null, sortKey: "", sortDir: "desc" };
    function esc(value) {
      return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]; });
    }
    async function api(path, payload) {
      var token = sessionStorage.getItem("dc_token") || localStorage.getItem("dc_token") || localStorage.getItem("sso_token") || "";
      var response = await fetch("/api/v1/item-log/" + path, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: JSON.stringify(payload) });
      var result;
      try { result = await response.json(); } catch (_) { throw new Error("查询服务返回异常，请稍后重试"); }
      if (!response.ok || !result.ok) throw new Error(typeof result.detail === "string" ? result.detail : (response.status === 401 ? "中台登录已失效，请重新登录" : "物品记录查询失败，请稍后重试"));
      return result.data;
    }
    function fill(select, values, placeholder) {
      select.innerHTML = (placeholder ? '<option value="">' + esc(placeholder) + '</option>' : "") + values.map(function (v) { return '<option value="' + esc(v.id) + '">' + esc(v.name) + '</option>'; }).join("");
    }
    function fillGames(values) {
      state.games = orderGames(values, projectReference);
      gameList.innerHTML = state.games.map(function (v) { return '<option value="' + esc(gameLabel(v)) + '"></option>'; }).join("");
    }
    function selectedGameId() {
      var value = gameSearch.value.trim();
      var selected = state.games.find(function (item) { return value === item.id || value === item.name || value === gameLabel(item) || value === item.name + "（" + item.id + "）"; });
      game.value = selected ? selected.id : "";
      return game.value;
    }
    async function loadProjectReference() {
      if (projectReference) return projectReference;
      try {
        var token = sessionStorage.getItem("dc_token") || localStorage.getItem("dc_token") || localStorage.getItem("sso_token") || "";
        var response = await fetch("/api/v1/risk-dashboard/games", { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: "{}" });
        var result = await response.json();
        if (!response.ok || !result.ok) return null;
        projectReference = result.data.games || [];
        return projectReference;
      } catch (error) {
        return null;
      }
    }
    function gameLabel(item) {
      return item && item.project ? (item.project + " · " + item.name) : String(item && item.name || "");
    }
        function orderGames(values, reference, ranking) {
      var list = (values || []).map(function (row) { return { id: String(row.id), name: String(row.name || "") }; });
      var position = {}, project = {};
      (reference || []).forEach(function (row, index) {
        position[String(row.id)] = index;
        project[String(row.id)] = row.project || "";
      });
      var rank = {};
      (ranking || []).forEach(function (name, index) { rank[name] = index; });
      list.forEach(function (row) {
        row.project = project[row.id] || "";
        row.position = position[row.id] === undefined ? 1000000 : position[row.id];
        row.rank = Object.prototype.hasOwnProperty.call(rank, row.project) ? rank[row.project] : 1000000 + row.position;
      });
      list.sort(function (a, b) {
        if (a.rank !== b.rank) return a.rank - b.rank;
        if (a.position !== b.position) return a.position - b.position;
        return a.name.localeCompare(b.name, "zh-Hans-CN");
      });
      return list;
    }
    function busy(value) {
      state.busy = value;
      root.setAttribute("aria-busy", String(value));
      form.querySelectorAll("input,select,button").forEach(function (c) { c.disabled = value; });
      size.disabled = jump.disabled = value || !state.ready;
      prev.disabled = value || !state.ready || state.page <= 1;
      next.disabled = value || !state.ready || !state.hasNext;
      pages.querySelectorAll("button").forEach(function (c) { c.disabled = value || !state.ready; });
      root.querySelectorAll("[data-sort]").forEach(function (c) { c.disabled = value || !state.rows.length; });
    }
    function render() {
      var visible = state.rows.slice();
      if (state.sortKey) visible.sort(function (a, b) {
        var av = a[state.sortKey], bv = b[state.sortKey], cmp = av < bv ? -1 : (av > bv ? 1 : 0);
        return state.sortDir === "asc" ? cmp : -cmp;
      });
      tbody.innerHTML = visible.map(function (r) {
        var id = String(r.roleId || ""), shortId = id.length > 12 ? id.slice(0, 12) + "…" : id;
        return '<tr><td>' + esc(r.seq) + '</td><td>' + esc(r.time) + '</td><td title="' + esc(r.game) + '">' + esc(r.game) + '</td><td>' + esc(r.zone) + '</td><td title="' + esc(id) + '">' + esc(shortId) + '</td><td>' + esc(r.roleName) + '</td><td title="' + esc(r.rechargeNote || '未匹配到已采集充值订单') + '">' + (typeof r.recharge === 'number' && isFinite(r.recharge) ? '¥' + r.recharge.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—') + '</td><td><span class="dc-itemlog-action">' + esc(r.action) + '</span></td><td>' + esc(r.itemName) + '</td><td>' + esc(r.itemId) + '</td><td><span class="dc-itemlog-change ' + (r.change < 0 ? "negative" : "") + '">' + esc(r.change) + '</span></td></tr>';
      }).join("");
      empty.style.display = visible.length ? "none" : "flex";
      empty.querySelector("span").textContent = state.ready ? "暂无符合条件的物品记录" : "等待查询";
      summary.textContent = state.ready ? "本页 " + visible.length + " 条物品记录" : "等待查询";
      total.textContent = "第 " + state.page + " 页";
      total.title = "来源接口未提供准确总条数，按上一页、下一页查询";
      var buttons = [];
      for (var page = Math.max(1, state.page - 2); page <= state.page + (state.hasNext ? 1 : 0); page++) {
        buttons.push('<button type="button" class="dc-itemlog-pagebtn' + (page === state.page ? " active" : "") + '" data-page="' + page + '"' + (page === state.page ? ' aria-current="page"' : "") + ">" + page + "</button>");
      }
      pages.innerHTML = buttons.join("");
      jump.value = state.page;
      root.querySelectorAll("[data-sort]").forEach(function (button) {
        var key = button.dataset.sort, label = key === "time" ? "时间" : "变化数量";
        button.textContent = label + (state.sortKey === key ? (state.sortDir === "asc" ? " ↑" : " ↓") : " ↕");
        button.title = "仅对当前页排序";
        button.setAttribute("aria-label", label + "（当前页排序）");
      });
      busy(state.busy);
    }
    function fail(error) {
      state.rows = []; state.hasNext = false; state.ready = false;
      render();
      message.textContent = error.message || "查询失败，请稍后重试";
      message.style.color = "#d92d20";
      empty.querySelector("span").textContent = "数据未加载";
    }
    function filters() {
      return { gameId: Number(game.value), serverId: zone.value, role: form.elements.role.value.trim(), itemUniqueId: form.elements.itemId.value.trim(), start: form.elements.start.value, end: form.elements.end.value };
    }
    async function loadRecords(page) {
      if (state.busy) return;
      var requestedPage = page == null ? 1 : page;
      if (page == null || !state.applied) state.applied = filters();
      if (!state.applied.gameId) { fail(new Error("请先选择游戏")); return; }
      var requestId = ++state.request;
      busy(true); state.rows = []; render();
      message.style.color = "#667085"; message.textContent = "查询中…";
      try {
        var data = await api("records", Object.assign({}, state.applied, { pageNum: requestedPage, pageSize: state.pageSize }));
        if (requestId !== state.request || !root.isConnected) return;
        state.rows = data.records; state.page = data.pageNum; state.hasNext = data.hasNext; state.ready = true;
        message.textContent = "更新于 " + String(data.fetchedAt || "").replace("T", " ").replace(/\+08:00$/, "");
        render();
      } catch (error) { if (requestId === state.request) fail(error); }
      finally { if (requestId === state.request) busy(false); }
    }
    async function loadOptions(gameId, loadRecordsAfter) {
      var requestId = ++state.request;
      state.ready = false; state.rows = []; state.hasNext = false; state.page = 1;
      busy(true); render(); message.style.color = "#667085"; message.textContent = "加载游戏与区服…";
      var succeeded = false;
      try {
        var data = await api("options", { gameId: Number(gameId || 213739) });
        if (requestId !== state.request || !root.isConnected) return;
        fillGames(data.games); game.value = String(data.gameId);
        var selected = state.games.find(function (item) { return item.id === game.value; });
        if (selected) gameSearch.value = gameLabel(selected);
        fill(zone, data.zones, "全部区服"); state.zonesGameId = game.value; state.applied = null; message.textContent = "区服已加载，等待查询"; succeeded = true;
      } catch (error) { if (requestId === state.request) fail(error); }
      finally { if (requestId === state.request) busy(false); }
      if (succeeded && loadRecordsAfter) loadRecords();
    }
    async function loadGames() {
      if (state.gamesLoaded || state.gamesLoading) return;
      state.gamesLoading = true;
      var requestId = ++state.request;
      message.style.color = "#667085"; message.textContent = "加载可查询游戏…";
      try {
        var reference = await loadProjectReference();
        var games = reference !== null ? reference : (await api("games", {})).games;
        if (requestId !== state.request || !root.isConnected) return;
        fillGames(games); state.gamesLoaded = true; message.textContent = ""; render();
      } catch (error) { if (requestId === state.request) fail(error); }
      finally { state.gamesLoading = false; }
    }
    gameSearch.addEventListener("focus", loadGames);
    form.elements.role.title = "纯数字按完整角色ID查询，其他内容按角色名查询";
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var gameId = selectedGameId();
      if (!gameId) { fail(new Error("请从搜索结果中选择游戏")); return; }
      if (state.zonesGameId !== gameId) loadOptions(gameId, true); else loadRecords();
    });
    gameSearch.addEventListener("input", function () {
      var gameId = selectedGameId();
      if (state.zonesGameId !== gameId) { fill(zone, [], "全部区服"); state.zonesGameId = ""; }
      state.applied = null; state.rows = []; state.hasNext = false; state.ready = false; state.page = 1; message.textContent = ""; render();
      if (gameId && state.zonesGameId !== gameId) loadOptions(gameId, false);
    });
    root.querySelector("[data-game-clear]").addEventListener("click", function () {
      if (state.busy) return;
      gameSearch.value = "";
      gameSearch.dispatchEvent(new Event("input", { bubbles: true }));
      gameSearch.focus();
    });
    root.querySelectorAll("[data-sort]").forEach(function (button) {
      button.addEventListener("click", function () { state.sortDir = state.sortKey === button.dataset.sort && state.sortDir === "desc" ? "asc" : "desc"; state.sortKey = button.dataset.sort; render(); });
    });
    size.addEventListener("change", function () { state.pageSize = Number(size.value); loadRecords(1); });
    prev.addEventListener("click", function () { if (state.page > 1) loadRecords(state.page - 1); });
    next.addEventListener("click", function () { if (state.hasNext) loadRecords(state.page + 1); });
    pages.addEventListener("click", function (event) { var button = event.target.closest("[data-page]"); if (button) loadRecords(Number(button.dataset.page)); });
    function jumpPage() { var page = Number(jump.value); if (Number.isInteger(page) && page >= 1 && page <= 100000) loadRecords(page); else jump.value = state.page; }
    jump.addEventListener("change", jumpPage);
    jump.addEventListener("keydown", function (event) { if (event.key === "Enter") { event.preventDefault(); jumpPage(); } });
    form.addEventListener("reset", function () {
      if (state.busy) return;
      setTimeout(function () { game.value = ""; fill(zone, [], "全部区服"); state.zonesGameId = ""; state.rows = []; state.hasNext = false; state.ready = false; state.applied = null; state.page = 1; state.pageSize = Number(size.value); state.sortKey = ""; state.sortDir = "desc"; message.textContent = ""; render(); }, 0);
    });
    render();
  }

  function installRangePicker(root, form) {
    var range = root.querySelector(".dc-itemlog-range");
    var startInput = range.querySelector('input[name="start"]');
    var endInput = range.querySelector('input[name="end"]');
    var startText = range.querySelector("[data-range-start]");
    var endText = range.querySelector("[data-range-end]");
    var oldPicker = document.getElementById("dc-itemlog-picker");
    if (oldPicker) oldPicker.remove();
    var picker = document.createElement("div");
    picker.id = "dc-itemlog-picker";
    picker.className = "dc-itemlog-picker";
    picker.setAttribute("role", "dialog");
    picker.setAttribute("aria-label", "选择日期范围");
    document.body.appendChild(picker);

    function dayDate(value) {
      return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }
    function addDays(value, amount) {
      var date = dayDate(value);
      date.setDate(date.getDate() + amount);
      return date;
    }
    function addMonths(value, amount) {
      return new Date(value.getFullYear(), value.getMonth() + amount, 1);
    }
    function iso(value) {
      var y = value.getFullYear();
      var m = String(value.getMonth() + 1).padStart(2, "0");
      var d = String(value.getDate()).padStart(2, "0");
      return y + "-" + m + "-" + d;
    }
    function fromIso(value) {
      var parts = String(value).split("-").map(Number);
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    function monday(value) {
      var date = dayDate(value);
      date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
      return date;
    }
    var today = dayDate(new Date());
    var selectedStart = today;
    var selectedEnd = today;
    var viewMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    var waitingForEnd = false;

    function updateValue() {
      startInput.value = iso(selectedStart);
      endInput.value = iso(selectedEnd);
      startText.textContent = startInput.value;
      endText.textContent = endInput.value;
    }
    function setRange(start, end, closeAfter) {
      selectedStart = dayDate(start);
      selectedEnd = dayDate(end);
      if (selectedStart > selectedEnd) {
        var swap = selectedStart;
        selectedStart = selectedEnd;
        selectedEnd = swap;
      }
      viewMonth = new Date(selectedStart.getFullYear(), selectedStart.getMonth(), 1);
      waitingForEnd = false;
      updateValue();
      renderPicker();
      if (closeAfter) closePicker();
    }
    function monthGrid(month) {
      var first = new Date(month.getFullYear(), month.getMonth(), 1);
      var offset = (first.getDay() + 6) % 7;
      var gridStart = addDays(first, -offset);
      var cells = [];
      for (var i = 0; i < 42; i++) {
        var date = addDays(gridStart, i);
        var key = iso(date);
        var classes = ["dc-itemlog-day"];
        if (date.getMonth() !== month.getMonth()) classes.push("muted");
        if (key > iso(selectedStart) && key < iso(selectedEnd)) classes.push("in-range");
        if (key === iso(selectedStart) || key === iso(selectedEnd)) classes.push("selected");
        cells.push('<button type="button" class="' + classes.join(" ") + '" data-date="' + key + '">' + date.getDate() + '</button>');
      }
      return cells.join("");
    }
    function monthMarkup(month, side) {
      var leftNav = side === "left" ? '<span class="dc-itemlog-month-navs"><button type="button" class="dc-itemlog-month-nav" data-month-shift="-12">«</button><button type="button" class="dc-itemlog-month-nav" data-month-shift="-1">‹</button></span>' : "<span></span>";
      var rightNav = side === "right" ? '<span class="dc-itemlog-month-navs"><button type="button" class="dc-itemlog-month-nav" data-month-shift="1">›</button><button type="button" class="dc-itemlog-month-nav" data-month-shift="12">»</button></span>' : "<span></span>";
      return '<section class="dc-itemlog-month"><div class="dc-itemlog-month-head">' + leftNav + '<div class="dc-itemlog-month-title">' + month.getFullYear() + '年&nbsp; ' + (month.getMonth() + 1) + '月</div>' + rightNav + '</div><div class="dc-itemlog-week"><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span></div><div class="dc-itemlog-days">' + monthGrid(month) + '</div></section>';
    }
    function renderPicker() {
      picker.innerHTML = [
        '<aside class="dc-itemlog-presets">',
        '<button type="button" class="dc-itemlog-preset" data-preset="yesterday">昨日</button>',
        '<button type="button" class="dc-itemlog-preset" data-preset="today">今日</button>',
        '<button type="button" class="dc-itemlog-preset" data-preset="lastWeek">上周</button>',
        '<button type="button" class="dc-itemlog-preset" data-preset="thisWeek">本周</button>',
        '<button type="button" class="dc-itemlog-preset" data-preset="lastMonth">上月</button>',
        '<button type="button" class="dc-itemlog-preset" data-preset="thisMonth">本月</button>',
        '<button type="button" class="dc-itemlog-preset" data-preset="last30">最近30天</button>',
        '<button type="button" class="dc-itemlog-preset" data-preset="last90">最近90天</button>',
        '</aside><div class="dc-itemlog-calendars">',
        monthMarkup(viewMonth, "left"), monthMarkup(addMonths(viewMonth, 1), "right"),
        '</div>'
      ].join("");
    }
    function positionPicker() {
      var rect = range.getBoundingClientRect();
      var width = Math.min(696, window.innerWidth - 24);
      var left = Math.min(rect.left, window.innerWidth - width - 12);
      picker.style.width = width + "px";
      picker.style.left = Math.max(12, left) + "px";
      picker.style.top = Math.round(rect.bottom + 6) + "px";
    }
    function openPicker() {
      positionPicker();
      picker.classList.add("open");
      range.setAttribute("aria-expanded", "true");
    }
    function closePicker() {
      picker.classList.remove("open");
      range.setAttribute("aria-expanded", "false");
    }
    function usePreset(name) {
      var start = today;
      var end = today;
      if (name === "yesterday") start = end = addDays(today, -1);
      if (name === "lastWeek") { end = addDays(monday(today), -1); start = addDays(end, -6); }
      if (name === "thisWeek") start = monday(today);
      if (name === "lastMonth") { start = new Date(today.getFullYear(), today.getMonth() - 1, 1); end = new Date(today.getFullYear(), today.getMonth(), 0); }
      if (name === "thisMonth") start = new Date(today.getFullYear(), today.getMonth(), 1);
      if (name === "last30") start = addDays(today, -29);
      if (name === "last90") start = addDays(today, -89);
      setRange(start, end, true);
    }

    range.addEventListener("click", function (event) {
      event.preventDefault();
      if (picker.classList.contains("open")) closePicker(); else openPicker();
    });
    range.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openPicker(); }
      if (event.key === "Escape") closePicker();
    });
    picker.addEventListener("click", function (event) {
      var preset = event.target.closest("[data-preset]");
      if (preset) { usePreset(preset.dataset.preset); return; }
      var nav = event.target.closest("[data-month-shift]");
      if (nav) { viewMonth = addMonths(viewMonth, Number(nav.dataset.monthShift)); renderPicker(); return; }
      var day = event.target.closest("[data-date]");
      if (!day) return;
      var value = fromIso(day.dataset.date);
      if (!waitingForEnd) {
        selectedStart = value;
        selectedEnd = value;
        waitingForEnd = true;
        updateValue();
        renderPicker();
      } else {
        setRange(selectedStart, value, true);
      }
    });
    document.addEventListener("click", function (event) {
      if (!range.contains(event.target) && !picker.contains(event.target)) closePicker();
    });
    window.addEventListener("resize", function () { if (picker.classList.contains("open")) positionPicker(); });
    form.addEventListener("reset", function () { setTimeout(function () { setRange(today, today, false); }, 0); });
    updateValue();
    renderPicker();
  }

  function showPage() {
    var host = findContentHost();
    if (!host) return;
    var root = document.getElementById(ROOT_ID);
    if (!root || root.parentNode !== host) {
      root = document.createElement("div");
      root.id = ROOT_ID;
      root.innerHTML = pageMarkup();
      host.appendChild(root);
      var form = root.querySelector("#dc-itemlog-form");
      form.addEventListener("submit", function (event) { event.preventDefault(); });
      installRangePicker(root, form);
      installSourceTable(root, form);
    }
    Array.prototype.forEach.call(host.children, function (child) {
      if (child !== root) child.classList.add("dc-itemlog-host-hidden");
    });
    root.hidden = false;
    var menu = document.getElementById(MENU_ID);
    if (menu) {
      document.querySelectorAll("aside .ant-menu-item-selected, .ant-layout-sider .ant-menu-item-selected").forEach(function (item) {
        if (item !== menu) item.classList.remove("ant-menu-item-selected");
      });
      menu.classList.add("ant-menu-item-selected");
      menu.setAttribute("aria-selected", "true");
    }
  }

  function hidePage() {
    var root = document.getElementById(ROOT_ID);
    var picker = document.getElementById("dc-itemlog-picker");
    if (picker) picker.classList.remove("open");
    if (root && root.parentNode) {
      Array.prototype.forEach.call(root.parentNode.children, function (child) {
        if (child !== root) child.classList.remove("dc-itemlog-host-hidden");
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
    
    if (isItemLogRoute()) showPage(); else hidePage();
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
    if (event.target.closest("a,.ant-menu-item,.ant-menu-submenu-title")) scheduleSync();
  }, true);
  new MutationObserver(scheduleSync).observe(document.body, { childList: true, subtree: true });
  renderRoute();
})();
