(function () {
  "use strict";

  var API = "/api/v1/ip-library";
  var STYLE_ID = "dc-ip-library-style";
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }
  function token() {
    return localStorage.getItem("dc_token") || "";
  }
  async function post(path, body) {
    var response = await fetch(API + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token()
      },
      body: JSON.stringify(body || {})
    });
    var payload = await response.json().catch(function () {
      return {};
    });
    if (!response.ok || payload.ok === false) throw new Error(payload.detail || payload.message || "请求失败");
    return payload.data;
  }
  function today() {
    var now = new Date();
    return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
  }
  var projectReference = null;
  var sourceGames = null;
  var gamesLoading = null;
  var gamesError = "";
  async function loadProjectReference() {
    if (projectReference) return projectReference;
    try {
      var response = await fetch("/api/v1/risk-dashboard/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token()
        },
        body: "{}"
      });
      var payload = await response.json().catch(function () {
        return {};
      });
      if (!response.ok || !payload.ok) return null;
      projectReference = payload.data.games || [];
      return projectReference;
    } catch (error) {
      return null;
    }
  }
  function gameLabel(row) {
    return row && row.project ? row.project + " · " + row.name : String(row && row.name || "");
  }
  function orderGames(values, reference, ranking) {
    var list = (values || []).map(function (row) {
      return {
        id: String(row.id),
        name: String(row.name || "")
      };
    });
    var position = {},
      project = {};
    (reference || []).forEach(function (row, index) {
      position[String(row.id)] = index;
      project[String(row.id)] = row.project || "";
    });
    var rank = {};
    (ranking || []).forEach(function (name, index) {
      rank[name] = index;
    });
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
  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [".dc-ip-shell{padding:24px;background:#f4f7fc;min-height:calc(100vh - 64px);color:#0f2747}", ".dc-ip-head{margin-bottom:18px}.dc-ip-head h1{margin:0 0 8px;font-size:26px}.dc-ip-head p{margin:0;color:#64748b}", ".dc-ip-panel{background:#fff;border:1px solid #dbe5f1;border-radius:10px;padding:16px;margin-bottom:16px}", ".dc-ip-filters{display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr 1fr;gap:12px;align-items:end}", ".dc-ip-field label{display:block;font-size:13px;color:#52657f;margin-bottom:6px}.dc-ip-field input,.dc-ip-field select{width:100%;height:36px;border:1px solid #cbd7e6;border-radius:6px;padding:0 10px;background:#fff;box-sizing:border-box}", ".dc-ip-actions{display:flex;gap:8px;margin-top:14px}.dc-ip-btn{height:36px;border:0;border-radius:6px;padding:0 18px;background:#1677ff;color:#fff;cursor:pointer}.dc-ip-btn:disabled{opacity:.55;cursor:not-allowed}.dc-ip-btn.secondary{background:#fff;color:#31506f;border:1px solid #cbd7e6}", ".dc-ip-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px}.dc-ip-card{background:#fff;border:1px solid #dbe5f1;border-radius:10px;padding:15px}.dc-ip-card span{display:block;color:#718096;font-size:13px}.dc-ip-card strong{display:block;font-size:25px;margin-top:6px}", ".dc-ip-status{padding:45px 16px;text-align:center;color:#718096}.dc-ip-error{color:#cf1322}", ".dc-ip-table-wrap{overflow:auto}.dc-ip-table{width:100%;border-collapse:collapse;white-space:nowrap;font-size:13px}.dc-ip-table th{background:#f2f6fb;color:#52657f;font-weight:600;text-align:left}.dc-ip-table th,.dc-ip-table td{padding:11px 10px;border-bottom:1px solid #e8eef5}.dc-ip-table td.code{font-family:Consolas,monospace}", ".dc-ip-foot{display:flex;justify-content:space-between;align-items:center;padding-top:14px;color:#718096;font-size:13px}", "@media(max-width:1100px){.dc-ip-filters{grid-template-columns:repeat(2,1fr)}.dc-ip-summary{grid-template-columns:1fr}}"].join("");
    document.head.appendChild(style);
  }
  function markup() {
    var date = today();
    return '<div class="dc-ip-shell">' + '<header class="dc-ip-head"><h1>IP库</h1><p>996玩家登出日志与关联账号查询</p></header>' + '<section class="dc-ip-panel"><div class="dc-ip-filters">' + '<div class="dc-ip-field"><label>游戏</label><select data-ip="game"><option value="">点击选择以加载游戏</option></select></div>' + '<div class="dc-ip-field"><label>区服</label><select data-ip="server"><option value="">全部区服</option></select></div>' + '<div class="dc-ip-field"><label>开始日期</label><input data-ip="start" type="date" value="' + date + '"></div>' + '<div class="dc-ip-field"><label>结束日期</label><input data-ip="end" type="date" value="' + date + '"></div>' + '<div class="dc-ip-field"><label>角色ID</label><input data-ip="role" placeholder="精确查询"></div>' + '<div class="dc-ip-field"><label>账号</label><input data-ip="account" placeholder="精确查询"></div>' + '</div><div class="dc-ip-actions"><button class="dc-ip-btn" data-ip="query">查询</button><button class="dc-ip-btn secondary" data-ip="reset">重置</button></div></section>' + '<div data-ip="result"><section class="dc-ip-panel dc-ip-status">请选择条件后点击查询</section></div></div>';
  }
  function renderResult(root, data) {
    var records = data.records || [];
    var uniqueIps = new Set(records.map(function (row) {
      return row.ip;
    }).filter(Boolean)).size;
    var uniqueRoles = new Set(records.map(function (row) {
      return row.roleId;
    }).filter(Boolean)).size;
    var rows = records.map(function (row) {
      return '<tr><td>' + row.seq + '</td><td class="code">' + escapeHtml(row.ip) + '</td><td>' + escapeHtml(row.game) + '</td><td>' + escapeHtml(row.server) + '</td><td>' + escapeHtml(row.roleName) + '</td><td class="code">' + escapeHtml(row.roleId) + '</td><td>' + escapeHtml(row.account) + '</td><td class="code">' + escapeHtml(row.accountId) + '</td><td>' + escapeHtml(row.map) + '</td><td>' + escapeHtml(row.onlineDuration) + '</td><td>' + escapeHtml(row.logoutTime) + '</td></tr>';
    }).join("");
    root.querySelector('[data-ip="result"]').innerHTML = '<div class="dc-ip-summary"><div class="dc-ip-card"><span>查询结果</span><strong>' + data.total + '</strong></div><div class="dc-ip-card"><span>本页独立IP</span><strong>' + uniqueIps + '</strong></div><div class="dc-ip-card"><span>本页独立角色</span><strong>' + uniqueRoles + '</strong></div></div>' + '<section class="dc-ip-panel">' + (rows ? '<div class="dc-ip-table-wrap"><table class="dc-ip-table"><thead><tr><th>序号</th><th>IP地址</th><th>游戏</th><th>区服</th><th>角色名称</th><th>角色ID</th><th>账号</th><th>账号ID</th><th>地图</th><th>在线时长</th><th>登出时间</th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '<div class="dc-ip-status">当前条件暂无登出日志</div>') + '<div class="dc-ip-foot"><span>第 ' + data.pageNum + ' 页，每页 ' + data.pageSize + ' 条</span><div><button class="dc-ip-btn secondary" data-ip="prev"' + (data.pageNum <= 1 ? ' disabled' : '') + '>上一页</button> <button class="dc-ip-btn secondary" data-ip="next"' + (!data.hasNext ? ' disabled' : '') + '>下一页</button></div></div></section>';
  }
  async function mount(root) {
    installStyle();
    root.innerHTML = markup();
    var page = 1;
    var game = root.querySelector('[data-ip="game"]');
    var server = root.querySelector('[data-ip="server"]');
    var result = root.querySelector('[data-ip="result"]');
    function renderGames(values) {
      game.innerHTML = values.length ? values.map(function (row) {
        return '<option value="' + escapeHtml(row.id) + '">' + escapeHtml(gameLabel(row)) + '</option>';
      }).join("") : '<option value="">无可用游戏</option>';
    }
    async function loadGames() {
      if (sourceGames === null && !gamesLoading) {
        result.innerHTML = '<section class="dc-ip-panel dc-ip-status">正在加载可查询游戏…</section>';
        gamesLoading = async function () {
          try {
            var data = await post("/games");
            sourceGames = orderGames(data.games || [], await loadProjectReference());
            gamesError = sourceGames.length ? "" : "当前996 GM账号无可查询游戏";
          } catch (error) {
            gamesError = error.message;
          }
        }();
      }
      var pending = gamesLoading;
      if (pending) {
        await pending;
        if (gamesLoading === pending) gamesLoading = null;
      }
      if (!root.isConnected) return;
      if (sourceGames !== null) renderGames(sourceGames);
      if (gamesError) {
        result.innerHTML = '<section class="dc-ip-panel dc-ip-status dc-ip-error">' + escapeHtml(gamesError) + '</section>';
      }
    }
    async function loadOptions() {
      if (!game.value) return;
      server.innerHTML = '<option value="">全部区服</option>';
      var data = await post("/options", {
        gameId: Number(game.value)
      });
      data.zones.forEach(function (zone) {
        server.insertAdjacentHTML("beforeend", '<option value="' + escapeHtml(zone.id) + '">' + escapeHtml(zone.name) + '</option>');
      });
    }
    async function query() {
      var button = root.querySelector('[data-ip="query"]');
      if (!game.value) {
        result.innerHTML = '<section class="dc-ip-panel dc-ip-status dc-ip-error">请先选择游戏</section>';
        return;
      }
      button.disabled = true;
      result.innerHTML = '<section class="dc-ip-panel dc-ip-status">正在查询996玩家登出日志...</section>';
      try {
        var data = await post("/records", {
          gameId: Number(game.value),
          serverId: server.value,
          roleId: root.querySelector('[data-ip="role"]').value.trim(),
          account: root.querySelector('[data-ip="account"]').value.trim(),
          start: root.querySelector('[data-ip="start"]').value,
          end: root.querySelector('[data-ip="end"]').value,
          pageNum: page,
          pageSize: 30
        });
        renderResult(root, data);
      } catch (error) {
        result.innerHTML = '<section class="dc-ip-panel dc-ip-status dc-ip-error">' + escapeHtml(error.message) + '</section>';
      } finally {
        button.disabled = false;
      }
    }
    root.onclick = function (event) {
      var action = event.target && event.target.getAttribute("data-ip");
      if (action === "query") {
        page = 1;
        query();
      }
      if (action === "reset") {
        root.querySelector('[data-ip="start"]').value = today();
        root.querySelector('[data-ip="end"]').value = today();
        root.querySelector('[data-ip="role"]').value = "";
        root.querySelector('[data-ip="account"]').value = "";
        server.value = "";
        result.innerHTML = '<section class="dc-ip-panel dc-ip-status">请选择条件后点击查询</section>';
      }
      if (action === "prev" && page > 1) {
        page -= 1;
        query();
      }
      if (action === "next") {
        page += 1;
        query();
      }
    };
    game.addEventListener("focus", loadGames);
    game.onchange = function () {
      loadOptions().catch(function (error) {
        result.innerHTML = '<section class="dc-ip-panel dc-ip-status dc-ip-error">' + escapeHtml(error.message) + '</section>';
      });
    };
    if (sourceGames !== null) renderGames(sourceGames);
  }
  window.DCIpLibrary = {
    mount: mount
  };
})();
