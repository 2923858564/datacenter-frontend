(function () {
  "use strict";

  var ROUTE = "/dashboard/chat-risk";
  var restoreEntryRoute = document.currentScript && document.currentScript.dataset.entryRoute === ROUTE;
  var MENU_ID = "dc-chat-risk-menu";
  var ROOT_ID = "dc-chat-risk-root";
  var STYLE_ID = "dc-chat-risk-style";
  var syncTimer = 0;
  var activeStatus = "pending";
  var activeGame = "__live__";
  var liveRecords = [];
  var livePage = 1;
  var liveHasMore = false;
  var liveBusy = false;
  var liveError = "";
  var liveFetchedAt = "";
  var liveRequest = 0;
  var liveController = null;
  var sourceGames = [];
  var gamesLoaded = false;
  var gamesLoading = null;
  var projectReference = null;
  var chatJumpBusy = false;
  var chatJumpNeedle = "";
  var zoneRequest = 0;
  var ignoredRecords = new Map();
  var sourceMessages = new Map();
  var groupIds = new Map();
  var reviewStates = new Map();
  var sourceScope = "";
  var groupSequence = 1;
  var editingRuleId = null;
  var cleaningStats = { empty: 0, groups: 0, matched: 0 };
  var demoRules = [
    { id: 1, keyword: "嘉引", tag: "引流", level: "medium", game: "全部游戏" },
    { id: 2, keyword: "佳引", tag: "引流", level: "medium", game: "全部游戏" },
    { id: 3, keyword: "豪引", tag: "引流", level: "medium", game: "全部游戏" },
    { id: 4, keyword: "绿泡泡", tag: "联系方式", level: "medium", game: "全部游戏" },
    { id: 5, keyword: "vx", tag: "联系方式", level: "medium", game: "全部游戏" },
    { id: 6, keyword: "回收·商人", tag: "交易风险", level: "high", game: "全部游戏" },
    { id: 7, keyword: "加群·手拉", tag: "引流", level: "medium", game: "全部游戏" },
    { id: 8, keyword: "滴加", tag: "联系方式", level: "high", game: "全部游戏" },
    { id: 9, keyword: "wx", tag: "联系方式", level: "medium", game: "全部游戏" },
    { id: 10, keyword: "微信", tag: "联系方式", level: "medium", game: "全部游戏" }
  ];
  var demoRuleSequence = 11;
  var demoRecords = [];

  function isRoute() {
    return location.pathname === ROUTE;
  }

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".dc-chat-risk-host-hidden{display:none!important}",
      "#dc-chat-risk-root{box-sizing:border-box;width:100%;min-height:calc(100vh - 56px);padding:24px;background:#f3f6fa;color:#1f2937}",
      "#dc-chat-risk-root *{box-sizing:border-box}",
      ".dc-chat-risk-head{display:flex;align-items:center;gap:10px;margin:0 0 18px}",
      ".dc-chat-risk-head svg{width:22px;height:22px;color:#1677ff}",
      ".dc-chat-risk-head h1{margin:0;font-size:20px;line-height:28px;font-weight:650;color:#182230}",
      ".dc-chat-risk-demo-label{padding:2px 8px;border:1px solid #ffc069;border-radius:10px;background:#fff7e6;color:#d46b08;font-size:12px}",
      ".dc-chat-risk-card{background:#fff;border:1px solid #e5eaf0;border-radius:12px;box-shadow:0 1px 2px rgba(16,24,40,.03);overflow:hidden}",
      ".dc-chat-risk-tabs{display:flex;align-items:center;gap:36px;height:56px;padding:0 20px;border-bottom:1px solid #e5eaf0;overflow-x:auto;white-space:nowrap}",
      ".dc-chat-risk-tab{position:relative;height:56px;border:0;background:transparent;color:#475467;font-family:inherit;font-size:14px;cursor:pointer}",
      ".dc-chat-risk-tab.active{color:#1677ff;font-weight:600}",
      ".dc-chat-risk-tab.active:after{content:'';position:absolute;left:0;right:0;bottom:0;height:2px;background:#1677ff}",
      ".dc-chat-risk-badge{display:inline-flex;align-items:center;justify-content:center;min-width:28px;height:18px;margin-left:5px;padding:0 5px;border-radius:9px;background:#ff4d4f;color:#fff;font-size:12px;line-height:18px}",
      ".dc-chat-risk-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:58px;padding:11px 20px;border-bottom:1px solid #edf0f4}",
      ".dc-chat-risk-toolbar-left,.dc-chat-risk-toolbar-right{display:flex;align-items:center;gap:10px;flex-wrap:wrap}",
      ".dc-chat-risk-switch{display:inline-flex;align-items:center;gap:8px;padding:0;border:0;background:transparent;color:#1677ff;font-family:inherit;font-size:14px;cursor:pointer}",
      ".dc-chat-risk-switch-track{position:relative;width:40px;height:22px;border-radius:11px;background:#1677ff}",
      ".dc-chat-risk-switch-track:after{content:'';position:absolute;top:2px;right:2px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2)}",
      ".dc-chat-risk-switch.off{color:#667085}.dc-chat-risk-switch.off .dc-chat-risk-switch-track{background:#b9c0ca}.dc-chat-risk-switch.off .dc-chat-risk-switch-track:after{right:20px}",
      ".dc-chat-risk-btn{height:34px;padding:0 14px;border:1px solid #d9dfe8;border-radius:6px;background:#fff;color:#344054;font-family:inherit;font-size:14px;line-height:32px;cursor:pointer}",
      ".dc-chat-risk-btn-primary{border-color:#1677ff;color:#1677ff;background:#f5f9ff}",
      ".dc-chat-risk-btn-scan{border-color:#f5c36b;background:#f5c36b;color:#fff}",
      ".dc-chat-risk-summary{color:#667085;font-size:13px}.dc-chat-risk-summary strong{color:#f04438;font-size:14px}.dc-chat-risk-summary b{color:#344054;font-size:14px}",
      ".dc-chat-risk-list-tabs{display:flex;align-items:center;height:54px;padding:0 20px;border-bottom:1px solid #edf0f4}",
      ".dc-chat-risk-list-tab{height:32px;padding:0 14px;border:1px solid #d9dfe8;background:#fff;color:#475467;font-family:inherit;line-height:30px;cursor:pointer}",
      ".dc-chat-risk-list-tab:first-child{border-radius:6px 0 0 6px}.dc-chat-risk-list-tab:last-child{margin-left:-1px;border-radius:0 6px 6px 0}",
      ".dc-chat-risk-list-tab.active{z-index:1;border-color:#1677ff;background:#1677ff;color:#fff}",
      ".dc-chat-risk-filter{display:flex;align-items:center;gap:10px;padding:16px 20px 12px}",
      ".dc-chat-risk-search{width:360px;height:34px;border:1px solid #d9dfe8;border-radius:6px;padding:0 11px;font-family:inherit;font-size:14px;outline:none}",
      ".dc-chat-risk-search:focus{border-color:#1677ff;box-shadow:0 0 0 2px rgba(22,119,255,.12)}",
      ".dc-chat-risk-count{color:#98a2b3;font-size:13px}",
      ".dc-chat-risk-table-wrap{margin:0 20px 20px;border:1px solid #e5eaf0;border-radius:8px;overflow:auto}",
      ".dc-chat-risk-table{width:100%;min-width:1280px;border-collapse:separate;border-spacing:0;font-size:13px}",
      ".dc-chat-risk-table th{height:44px;padding:0 10px;background:#f8fafc;border-bottom:1px solid #e5eaf0;border-right:1px solid #edf0f4;color:#475467;font-weight:600;text-align:left;white-space:nowrap}",
      ".dc-chat-risk-table th:last-child{border-right:0}",
      ".dc-chat-risk-table td{height:46px;max-width:240px;padding:7px 10px;border-bottom:1px solid #edf0f4;color:#475467;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".dc-chat-risk-table tbody tr:hover td{background:#f7fbff}",
      ".dc-chat-risk-table tr.dc-chat-risk-row-hit td{background:#fff8e6}",
      ".dc-chat-risk-table tr.dc-chat-risk-row-hit td:first-child{box-shadow:inset 3px 0 0 #fa8c16}",
      ".dc-chat-risk-tag{display:inline-flex;padding:1px 7px;border:1px solid #ffccc7;border-radius:4px;background:#fff2f0;color:#ff4d4f}",
      ".dc-chat-risk-fragment{display:inline-flex;padding:1px 7px;border-radius:4px;background:#fff7e6;color:#fa8c16}",
      ".dc-chat-risk-action{height:26px;margin-right:6px;padding:0 9px;border:1px solid #1677ff;border-radius:4px;background:#1677ff;color:#fff;font-family:inherit;cursor:pointer}",
      ".dc-chat-risk-action.delete{border-color:#ff4d4f;background:#fff;color:#ff4d4f}",
      ".dc-chat-risk-toast{position:fixed;top:72px;left:50%;z-index:12000;transform:translateX(-50%);padding:9px 16px;border-radius:6px;background:rgba(31,41,55,.92);color:#fff;font-size:13px;box-shadow:0 5px 18px rgba(0,0,0,.18)}",
      ".dc-chat-risk-settings-mask{position:fixed;inset:56px 0 0;z-index:11900;background:rgba(15,23,42,.28)}",
      ".dc-chat-risk-settings{position:fixed;top:56px;right:0;bottom:0;z-index:11910;width:min(560px,100vw);padding:18px 22px;background:#fff;box-shadow:-10px 0 28px rgba(15,23,42,.16);overflow:auto}",
      ".dc-chat-risk-settings[hidden],.dc-chat-risk-settings-mask[hidden]{display:none!important}",
      ".dc-chat-risk-settings-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}",
      ".dc-chat-risk-settings-head h2{margin:0;color:#344054;font-size:20px;font-weight:500}",
      ".dc-chat-risk-settings-close{width:30px;height:30px;border:0;background:transparent;color:#98a2b3;font-size:22px;cursor:pointer}",
      ".dc-chat-risk-settings-title{display:flex;align-items:center;gap:6px;margin-bottom:12px;color:#344054;font-size:14px;font-weight:600}",
      ".dc-chat-risk-settings-title span{color:#98a2b3;font-weight:400}",
      ".dc-chat-risk-rule-form{display:grid;grid-template-columns:1.3fr 1.1fr 1fr 1.2fr auto;gap:8px;align-items:center}",
      ".dc-chat-risk-rule-control{min-width:0;height:34px;border:1px solid #d9dfe8;border-radius:5px;background:#fff;padding:0 9px;color:#475467;font-family:inherit;font-size:13px;outline:none}",
      ".dc-chat-risk-rule-control:focus{border-color:#1677ff;box-shadow:0 0 0 2px rgba(22,119,255,.1)}",
      ".dc-chat-risk-game-field{display:flex;align-items:center;gap:6px}",
      ".dc-chat-risk-game-field .dc-chat-risk-rule-control{width:180px}",
      ".dc-chat-risk-clear{height:34px;padding:0 10px;border:1px solid #d9dfe8;border-radius:5px;background:#fff;color:#667085;font-family:inherit;font-size:13px;cursor:pointer}",
      ".dc-chat-risk-clear:hover{border-color:#1677ff;color:#1677ff}",
      ".dc-chat-risk-rule-add{height:34px;padding:0 15px;border:0;border-radius:5px;background:#1677ff;color:#fff;font-family:inherit;cursor:pointer}",
      ".dc-chat-risk-rule-help{margin:10px 0 12px;color:#98a2b3;font-size:13px;line-height:20px}",
      ".dc-chat-risk-rule-list{display:flex;flex-wrap:wrap;gap:8px}",
      ".dc-chat-risk-rule-chip{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 7px;border:1px solid #ffd8bf;border-radius:5px;background:#fff7e6;color:#fa8c16;font-size:12px}",
      ".dc-chat-risk-rule-chip.high{border-color:#ffccc7;background:#fff2f0;color:#ff4d4f}",
      ".dc-chat-risk-rule-remove{padding:0;border:0;background:transparent;color:inherit;font-size:15px;line-height:1;cursor:pointer}",
      ".dc-chat-risk-empty{height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#98a2b3;font-size:14px}",
      ".dc-chat-risk-empty svg{width:46px;height:46px;margin-bottom:10px;color:#cbd5e1}",
      ".dc-risk-level{display:inline-block;padding:2px 8px;border-radius:4px;background:#fff7e6;color:#b54708}.dc-risk-level.high{background:#fef3f2;color:#d92d20}.dc-risk-level.low{background:#eff8ff;color:#175cd3}.dc-chat-risk-table td.dc-risk-evidence{white-space:normal;min-width:270px;max-width:360px;overflow:visible;word-break:break-word}.dc-risk-evidence details{margin-top:6px}.dc-risk-evidence summary{cursor:pointer;color:#1677ff}.dc-risk-evidence article{padding:8px 0;border-top:1px solid #edf0f4}.dc-risk-evidence p{margin:4px 0;white-space:pre-wrap}.dc-risk-meta{font-size:12px;color:#98a2b3}.dc-risk-rule-edit{border:0;background:none;color:inherit;font:inherit;cursor:pointer}.dc-risk-evidence-list{max-height:260px;overflow:auto}.dc-risk-category{line-height:22px}",
      "#dc-chat-risk-root [hidden]{display:none!important}.dc-chat-risk-query{display:flex;flex-wrap:wrap;gap:8px;padding:12px 20px}.dc-chat-risk-query input,.dc-chat-risk-query select{max-width:180px}.dc-chat-risk-btn:disabled{opacity:.5;cursor:not-allowed}.dc-chat-risk-source-status{padding:0 20px 12px;color:#667085;font-size:12px}.dc-chat-risk-source-status.error{color:#d92d20}",
      "#dc-chat-risk-menu{min-height:40px;line-height:40px}",
      "#dc-chat-risk-menu .dc-chat-risk-menu-icon{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;margin-right:13px;flex:0 0 18px}",
      "#dc-chat-risk-menu .dc-chat-risk-menu-icon svg{width:18px;height:18px;stroke-width:2.1}",
      "#dc-chat-risk-menu .ant-menu-title-content{font-size:14px;line-height:40px}",
      "@media(max-width:900px){.dc-chat-risk-toolbar{align-items:flex-start;flex-direction:column}.dc-chat-risk-search{width:100%}.dc-chat-risk-filter{align-items:flex-start;flex-direction:column}.dc-chat-risk-tabs{gap:22px}.dc-chat-risk-rule-form{grid-template-columns:1fr 1fr}.dc-chat-risk-rule-add{grid-column:1/-1}}"
    ].join("");
    document.head.appendChild(style);
  }

  function iconMarkup() {
    return '<span class="dc-chat-risk-menu-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 17h.01"/></svg></span>';
  }


  function openPage(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!isRoute()) history.pushState({}, "", ROUTE);
    renderRoute();
  }

  function pageMarkup() {
    return [
      '<div class="dc-chat-risk-head">',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 17h.01"/></svg>',
      '<h1>聊天风控</h1><span class="dc-chat-risk-demo-label">996真实聊天</span></div>',
      '<section class="dc-chat-risk-card" aria-label="聊天风控">',
      '<nav class="dc-chat-risk-tabs" aria-label="聊天风控分类">',
      '<button class="dc-chat-risk-tab" data-game="" type="button">风控记录<span class="dc-chat-risk-badge" data-total-count>0</span></button>',
      '<button class="dc-chat-risk-tab active" data-live-tab type="button">实时聊天</button>',
      '</nav>',
      '<div class="dc-chat-risk-toolbar">',
      '<div class="dc-chat-risk-toolbar-left"></div>',
      '<div class="dc-chat-risk-toolbar-right">',
      '<button class="dc-chat-risk-btn dc-chat-risk-btn-scan" data-scan type="button">扫描新增消息进风控</button>',
      '<button class="dc-chat-risk-btn dc-chat-risk-btn-primary" data-settings type="button">风控设置</button>',
      '<span class="dc-chat-risk-summary">待处理 <strong data-pending-count>0</strong>&nbsp;&nbsp; 已处理 <b data-processed-count>0</b></span>',
      '</div></div>',
      '<div class="dc-chat-risk-query" data-live-query><div class="dc-chat-risk-game-field"><input class="dc-chat-risk-rule-control" data-game-search list="dc-chat-risk-games" placeholder="搜索并选择游戏" aria-label="游戏"><button class="dc-chat-risk-clear" data-game-clear type="button">清空</button></div><datalist id="dc-chat-risk-games"></datalist><input class="dc-chat-risk-rule-control" data-date type="date" aria-label="聊天日期"><input class="dc-chat-risk-rule-control" data-role-name placeholder="角色名" aria-label="角色名"><input class="dc-chat-risk-rule-control" data-role-id placeholder="角色ID" aria-label="角色ID"><select class="dc-chat-risk-rule-control" data-server-id aria-label="区服"><option value="">全部区服</option></select><select class="dc-chat-risk-rule-control" data-channel aria-label="频道"><option value="">全部频道</option><option value="0">综合</option><option value="1">系统</option><option value="2">喊话</option><option value="3">私聊</option><option value="4">行会</option><option value="5">组队</option><option value="6">附近</option><option value="7">世界</option></select><button class="dc-chat-risk-btn dc-chat-risk-btn-primary" data-query type="button">查询</button></div>',
      '<div class="dc-chat-risk-source-status" data-source-status role="status"></div>',
      '<div class="dc-chat-risk-list-tabs"><button class="dc-chat-risk-list-tab active" data-status="pending" type="button">待处理 <span data-pending-tab-count>0</span></button><button class="dc-chat-risk-list-tab" data-status="processed" type="button">已处理 <span data-processed-tab-count>0</span></button></div>',
      '<div class="dc-chat-risk-filter"><input class="dc-chat-risk-search" data-search placeholder="筛选已加载的角色名 / 角色ID / 内容" aria-label="筛选已加载记录"><span class="dc-chat-risk-count">当前显示 <span data-visible-count>0</span> 条</span></div>',
      '<div class="dc-chat-risk-table-wrap">',
      '<table class="dc-chat-risk-table"><thead><tr></tr></thead><tbody data-records></tbody></table>',
      '<div class="dc-chat-risk-empty" data-empty role="status" hidden><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M8 10h32v25H18l-8 6v-6H8z"/><path d="M16 19h16M16 26h11"/></svg><span>暂无风控记录</span></div>',
      '</div><div class="dc-chat-risk-query" data-pagination><button class="dc-chat-risk-btn" data-prev type="button">上一页</button><span data-page></span><button class="dc-chat-risk-btn" data-next type="button">下一页</button></div></section>',
      '<div class="dc-chat-risk-settings-mask" data-settings-mask hidden></div>',
      '<aside class="dc-chat-risk-settings" data-settings-panel aria-label="风控设置" hidden>',
      '<div class="dc-chat-risk-settings-head"><h2>风控设置</h2><button class="dc-chat-risk-settings-close" data-settings-close type="button" aria-label="关闭风控设置">×</button></div>',
      '<div class="dc-chat-risk-settings-title">ⓘ 敏感关键词 <span>（命中后自动进入风控表）</span></div>',
      '<form class="dc-chat-risk-rule-form" data-rule-form>',
      '<input class="dc-chat-risk-rule-control" name="keyword" maxlength="100" placeholder="关键词（·表示同时包含）" aria-label="关键词">',
      '<input class="dc-chat-risk-rule-control" name="tag" maxlength="30" placeholder="风险分类" aria-label="风险分类">',
      '<select class="dc-chat-risk-rule-control" name="level" aria-label="风险等级"><option value="low">低</option><option value="medium" selected>中</option><option value="high">高</option></select>',
      '<select class="dc-chat-risk-rule-control" name="game" aria-label="适用游戏"><option value="全部游戏">全部已接入游戏</option></select>',
      '<button class="dc-chat-risk-rule-add" type="submit">添加</button>',
      '<button class="dc-chat-risk-btn" data-rule-cancel type="button" hidden>取消编辑</button>',
      '</form>',
      '<p class="dc-chat-risk-rule-help">点击规则可编辑；新增、修改、删除均重算当前查询已加载消息。统一全半角、大小写，清理控制及零宽字符，匹配时忽略空白与常见分隔符；不还原星号遮挡内容。·连接的词需同时命中；“联系方式”分类还需至少5位数字或字母数字混合串。等级取全部命中规则中的最高级。规则及处理状态仅本次会话有效，不执行游戏内处罚。</p>',
      '<div class="dc-chat-risk-rule-list" data-rule-list></div>',
      '</aside>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function showToast(message) {
    var oldToast = document.querySelector(".dc-chat-risk-toast");
    if (oldToast) oldToast.remove();
    var toast = document.createElement("div");
    toast.className = "dc-chat-risk-toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function () { if (toast.parentNode) toast.remove(); }, 1600);
  }

  function renderRules(root) {
    root.querySelector("[data-rule-list]").innerHTML = demoRules.map(function (rule) {
      return '<span class="dc-chat-risk-rule-chip ' + (rule.level === "high" ? "high" : "") + '" title="分类：' + escapeHtml(rule.tag) + '；适用：' + escapeHtml(rule.game) + '"><button class="dc-risk-rule-edit" type="button" data-rule-edit="' + rule.id + '">' + escapeHtml(rule.keyword) + ' · ' + escapeHtml(rule.tag) + ' · ' + levelLabel(rule.level) + '</button><button class="dc-chat-risk-rule-remove" data-rule-remove="' + rule.id + '" type="button" aria-label="删除' + escapeHtml(rule.keyword) + '">×</button></span>';
    }).join("");
  }

  function selectedGame(root) {
    var value = root.querySelector("[data-game-search]").value.trim();
    return sourceGames.find(function (game) {
      return value === gameLabel(game) || value === game.name + "（" + game.id + "）" || value === String(game.id) || value === game.name;
    }) || null;
  }

  async function loadProjectReference() {
    if (projectReference) return projectReference;
    try {
      var token = sessionStorage.getItem("dc_token") || localStorage.getItem("dc_token") || localStorage.getItem("sso_token") || "";
      var response = await fetch("/api/v1/risk-dashboard/games", { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: "{}" });
      var body = await response.json();
      if (!response.ok || !body.ok) return null;
      projectReference = body.data.games || [];
      return projectReference;
    } catch (error) {
      return null;
    }
  }

  function gameLabel(game) {
    return game && game.project ? (game.project + " · " + game.name) : String(game && game.name || "");
  }

    function orderGames(games, reference, ranking) {
    var list = (games || []).map(function (row) { return { id: String(row.id), name: String(row.name || "") }; });
    var position = {};
    var project = {};
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

  function fillZones(root, zones) {
    root.querySelector("[data-server-id]").innerHTML = '<option value="">全部区服</option>' + zones.map(function (zone) {
      return '<option value="' + escapeHtml(zone.id) + '">' + escapeHtml(zone.name) + '</option>';
    }).join("");
  }

  async function loadZones(root, game) {
    var requestId = ++zoneRequest;
    var status = root.querySelector("[data-source-status]");
    fillZones(root, []);
    status.classList.remove("error");
    status.textContent = "正在加载对应区服…";
    try {
      var token = sessionStorage.getItem("dc_token") || localStorage.getItem("dc_token") || localStorage.getItem("sso_token") || "";
      var response = await fetch("/api/v1/chat-risk/options", { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: JSON.stringify({ gameId: Number(game.id) }) });
      var body = await response.json();
      if (requestId !== zoneRequest || !root.isConnected) return;
      if (response.status === 401) throw new Error("数据中台登录已过期，请重新登录数据中台后刷新页面");
      if (!response.ok || !body.ok) throw new Error(typeof body.detail === "string" ? body.detail : "区服列表加载失败");
      fillZones(root, body.data.zones || []);
      status.textContent = "区服已加载，等待查询";
    } catch (error) {
      if (requestId !== zoneRequest) return;
      status.classList.add("error");
      status.textContent = error.message;
    }
  }

  async function loadGames(root) {
    if (gamesLoaded) return;
    if (gamesLoading) return gamesLoading;
    var status = root.querySelector("[data-source-status]");
    status.textContent = "正在加载可查询游戏…";
    gamesLoading = (async function () {
      try {
        var token = sessionStorage.getItem("dc_token") || localStorage.getItem("dc_token") || localStorage.getItem("sso_token") || "";
        var response = await fetch("/api/v1/chat-risk/games", { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: "{}" });
        var body = await response.json();
        if (response.status === 401) throw new Error("数据中台登录已过期，请重新登录数据中台后刷新页面");
        if (!response.ok || !body.ok) throw new Error(typeof body.detail === "string" ? body.detail : "游戏列表加载失败");
        sourceGames = orderGames(body.data.games || [], await loadProjectReference());
        root.querySelector("#dc-chat-risk-games").innerHTML = sourceGames.map(function (game) { return '<option value="' + escapeHtml(gameLabel(game)) + '"></option>'; }).join("");
        root.querySelector('[name="game"]').innerHTML = '<option value="全部游戏">全部已接入游戏</option>' + sourceGames.map(function (game) { return '<option value="' + escapeHtml(game.name) + '">' + escapeHtml(game.name) + '</option>'; }).join("");
        gamesLoaded = true;
        status.classList.remove("error");
        status.textContent = "等待查询";
      } catch (error) {
        sourceGames = [];
        status.classList.add("error");
        status.textContent = error.message;
      } finally {
        gamesLoading = null;
      }
    }());
    return gamesLoading;
  }

  function setSettingsOpen(root, open) {
    root.querySelector("[data-settings-panel]").hidden = !open;
    root.querySelector("[data-settings-mask]").hidden = !open;
    if (open) {
      renderRules(root);
      setTimeout(function () { root.querySelector('[name="keyword"]').focus(); }, 0);
    }
  }

  function recordMarkup(record) {
    var actionLabel = record.status === "pending" ? "处理" : "恢复";
    return [
      '<tr data-record-id="', record.id, '">',
      '<td><span class="dc-risk-level ', record.riskLevel, '">', levelLabel(record.riskLevel), '</span></td>',
      '<td class="dc-risk-category">', record.tags.map(function (tag) { return '<div>' + escapeHtml(tag) + '</div>'; }).join(''), '</td>',
      '<td>', escapeHtml(record.role), '<div class="dc-risk-meta">', escapeHtml(record.roleId), '</div></td>',
      '<td title="', escapeHtml(record.game), '">', escapeHtml(record.server), '<div class="dc-risk-meta">', escapeHtml(record.game), '</div></td>',
      '<td>', escapeHtml(record.channel), '</td>',
      '<td class="dc-risk-evidence">', escapeHtml(record.cleanedContent), '<details><summary>原文与清洗详情</summary><div class="dc-risk-evidence-list">',
      record.messages.map(function (message) {
        return '<article><div class="dc-risk-meta">' + escapeHtml(message.time) + ' · 对象：' + escapeHtml(message.recipient || '—') + '</div><p>原文：' + escapeHtml(message.content) + '</p><p>清洗：' + escapeHtml(message.clean.text) + '</p><div class="dc-risk-meta">' + escapeHtml(message.clean.notes.join('、') || '原文无需格式清洗') + '</div></article>';
      }).join(''), '</div></details></td>',
      '<td class="dc-risk-evidence">', record.matches.map(function (match) {
        return '<div>规则 #' + match.id + '：' + escapeHtml(match.keyword) + '（' + escapeHtml(match.tag) + ' / ' + levelLabel(match.level) + '）' + (match.account ? '；账号特征：' + escapeHtml(match.account) : '') + '</div>';
      }).join(''), '<div class="dc-risk-meta">规则命中，待人工复核</div></td>',
      '<td><span class="dc-chat-risk-fragment">', record.messages.length, '条</span></td>',
      '<td>', escapeHtml(record.firstTime), '</td>',
      '<td>', escapeHtml(record.time), '</td>',
      '<td>', record.status === 'processed' ? '已处理' : '待处理', '</td>',
      '<td><button class="dc-chat-risk-action" data-toggle-record="', record.id, '" type="button">', actionLabel, '</button><button class="dc-chat-risk-action delete" data-delete-record="', record.id, '" type="button">删除</button></td>',
      '</tr>'
    ].join("");
  }

  function renderDemo(root) {
    var pendingCount = demoRecords.filter(function (record) { return record.status === "pending"; }).length;
    var processedCount = demoRecords.filter(function (record) { return record.status === "processed"; }).length;
    var search = (root.querySelector("[data-search]").value || "").trim().toLowerCase();
    var visible = demoRecords.filter(function (record) {
      if (record.status !== activeStatus) return false;
      if (!search) return true;
      return [record.roleId, record.role, record.cleanedContent, record.server, record.tags.join(' '), levelLabel(record.riskLevel), record.matches.map(function (match) { return match.keyword; }).join(' ')].join(" ").toLowerCase().indexOf(search) !== -1;
    });
    root.querySelector("[data-total-count]").textContent = pendingCount;
    root.querySelector("[data-pending-count]").textContent = pendingCount;
    root.querySelector("[data-processed-count]").textContent = processedCount;
    root.querySelector("[data-pending-tab-count]").textContent = pendingCount;
    root.querySelector("[data-processed-tab-count]").textContent = processedCount;
    root.querySelector("[data-visible-count]").textContent = visible.length;
    root.querySelector("[data-records]").innerHTML = visible.map(recordMarkup).join("");
    root.querySelector("[data-empty]").hidden = visible.length !== 0;
    renderLive(root);
  }

  function levelLabel(level) { return { high: '高', medium: '中', low: '低' }[level] || '低'; }

  function cleanChat(value) {
    var original = String(value == null ? '' : value);
    var text = original.normalize('NFKC');
    var notes = [];
    if (text !== original) notes.push('全半角及兼容字符统一');
    var withoutHidden = text.replace(/[\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');
    if (withoutHidden !== text) notes.push('移除零宽及控制字符');
    text = withoutHidden;
    var compactSpace = text.replace(/\s+/g, ' ').trim();
    if (compactSpace !== text) notes.push('合并空白');
    text = compactSpace;
    if (text.toLowerCase() !== text) notes.push('统一大小写');
    text = text.toLowerCase();
    // Keep asterisks: source-side censored text must never be reconstructed.
    var compact = text.replace(/[\s.,，。:：;；!！?？、·_\-—~～\/\\()（）\[\]【】{}<>《》"'“”‘’|]/g, '');
    if (compact !== text) notes.push('匹配时忽略空白及分隔符');
    return { text: text, compact: compact, notes: notes };
  }

  function matchRules(message, rules) {
    var clean = message.clean;
    return rules.map(function (rule) {
      if (rule.game !== '全部游戏' && rule.game !== message.game) return null;
      var words = rule.keyword.split('·').map(function (word) { return cleanChat(word).compact; });
      if (!words.length || words.some(function (word) { return !word || clean.compact.indexOf(word) === -1; })) return null;
      var account = '';
      if (rule.tag === '联系方式') {
        // Remove matched prompts first so the prompt itself cannot become part of an account.
        var accountText = clean.compact;
        words.forEach(function (word) { accountText = accountText.split(word).join(' '); });
        var candidates = accountText.match(/[a-z0-9]+/g) || [];
        account = candidates.find(function (word) { return /^\d{5,}$/.test(word) || (word.length >= 5 && /[a-z]/.test(word) && /\d/.test(word)); }) || '';
        if (!account) return null;
      }
      return { id: rule.id, keyword: rule.keyword, tag: rule.tag, level: rule.level, game: rule.game, account: account };
    }).filter(Boolean);
  }

  function sourceKey(record) {
    return JSON.stringify([record.gameId, record.serverId, record.roleId, record.channel, record.recipient, record.time, record.content, record.id]);
  }

  function scanLoaded(root) {
    var previous = new Set(demoRecords.map(function (record) { return record.id + record.signature; }));
    var groups = new Map();
    cleaningStats = { empty: 0, groups: 0, matched: 0 };
    sourceMessages.forEach(function (record) {
      var clean = cleanChat(record.content);
      if (!clean.text) { cleaningStats.empty++; return; }
      var key = JSON.stringify([record.gameId, record.serverId, record.roleId, record.channel, record.recipient, record.time.slice(0, 10), clean.compact || clean.text]);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(Object.assign({}, record, { clean: clean }));
    });
    cleaningStats.groups = groups.size;
    var results = [];
    groups.forEach(function (messages, key) {
      messages.sort(function (a, b) { return a.time.localeCompare(b.time) || sourceKey(a).localeCompare(sourceKey(b)); });
      var record = messages[messages.length - 1];
      var matches = matchRules(record, demoRules);
      if (!matches.length) return;
      cleaningStats.matched += messages.length;
      if (!groupIds.has(key)) groupIds.set(key, 'risk-' + groupSequence++);
      var id = groupIds.get(key);
      var signature = JSON.stringify([messages.map(sourceKey), matches]);
      if (ignoredRecords.get(id) === signature) return;
      var saved = reviewStates.get(id);
      var ranks = { low: 1, medium: 2, high: 3 };
      var riskLevel = matches.reduce(function (level, rule) { return ranks[rule.level] > ranks[level] ? rule.level : level; }, 'low');
      results.push(Object.assign({}, record, { id: id, signature: signature, matches: matches, messages: messages,
        tags: Array.from(new Set(matches.map(function (rule) { return rule.tag; }))), riskLevel: riskLevel,
        cleanedContent: record.clean.text, firstTime: messages[0].time,
        status: saved && saved.signature === signature ? saved.status : 'pending' }));
    });
    demoRecords = results.sort(function (a, b) { return b.time.localeCompare(a.time); });
    var added = demoRecords.filter(function (record) { return !previous.has(record.id + record.signature); }).length;
    renderDemo(root);
    return added;
  }

  function renderLive(root) {
    var live = activeGame !== "";
    root.querySelector("[data-live-query]").hidden = !live;
    root.querySelector("[data-pagination]").hidden = !live;
    root.querySelector(".dc-chat-risk-list-tabs").hidden = live;
    var status = root.querySelector("[data-source-status]");
    status.classList.toggle("error", !!liveError);
    status.textContent = liveBusy ? "正在读取996聊天数据…" : liveError || (liveFetchedAt ? "996接口 · 更新于 " + liveFetchedAt + " · 当前查询已加载 " + sourceMessages.size + " 条，空消息 " + cleaningStats.empty + " 条，清洗聚合 " + cleaningStats.groups + " 组，命中消息 " + cleaningStats.matched + " 条 · 仅覆盖已加载页，非全量扫描 · 配置及处理仅本次会话有效" : "等待查询");
    root.querySelectorAll("[data-query],[data-scan]").forEach(function (button) { button.disabled = liveBusy; });
    root.querySelector("[data-prev]").disabled = liveBusy || livePage <= 1;
    root.querySelector("[data-next]").disabled = liveBusy || !liveHasMore || !!liveError;
    root.querySelector("[data-page]").textContent = "第 " + livePage + " 页 · 每页30条";
    root.querySelector("[data-game='']").classList.toggle("active", !live);
    root.querySelector("[data-live-tab]").classList.toggle("active", live);
    var columns = live ? ["角色ID", "区服", "游戏", "角色", "等级", "聊天对象", "频道", "原始内容", "时间"] : ["风险等级", "风险分类", "角色 / 角色ID", "区服 / 游戏", "频道", "清洗内容 / 原文", "命中依据", "关联消息数", "首次消息时间", "最近消息时间", "处理状态", "操作"];
    var header = columns.map(function (title) { return '<th>' + title + '</th>'; }).join('');
    root.querySelector("thead tr").innerHTML = header;
    if (!live) { root.querySelector("[data-empty] span").textContent = liveBusy ? "正在加载并判定聊天消息" : !sourceMessages.size ? "尚无已加载的聊天消息" : demoRecords.length ? "当前状态或筛选条件下暂无命中记录" : "已加载消息按当前配置无待展示命中，可在风控设置中调整规则"; return; }
    var search = root.querySelector("[data-search]").value.trim().toLowerCase();
    var visible = liveRecords.filter(function (record) { return [record.roleId, record.role, record.content, record.server].join(" ").toLowerCase().indexOf(search) !== -1; });
    root.querySelector("[data-visible-count]").textContent = visible.length;
    var jumpMarked = false;
    root.querySelector("[data-records]").innerHTML = visible.map(function (record) {
      var hit = !jumpMarked && !!chatJumpNeedle && (String(record.content || "").indexOf(chatJumpNeedle) !== -1 || String(record.recipient || "").indexOf(chatJumpNeedle) !== -1);
      if (hit) jumpMarked = true;
      return '<tr' + (hit ? ' class="dc-chat-risk-row-hit"' : '') + '>' + [record.roleId, record.server, record.game, record.role, record.level, record.recipient || "—", record.channel, record.content, record.time].map(function (value) { return '<td title="' + escapeHtml(value) + '">' + escapeHtml(value) + '</td>'; }).join('') + '</tr>';
    }).join('');
    root.querySelector("[data-empty]").hidden = visible.length !== 0;
    root.querySelector("[data-empty] span").textContent = liveBusy ? "正在加载" : liveError ? "查询失败，请查看上方提示" : "当前条件暂无聊天记录";
  }

  async function loadLive(root, page) {
    var game = selectedGame(root);
    if (!game) {
      liveError = "请先从游戏筛选器中选择一个游戏";
      liveRecords = [];
      liveHasMore = false;
      renderDemo(root);
      return;
    }
    activeGame = String(game.id);
    if (liveController) liveController.abort();
    var requestId = ++liveRequest;
    liveController = new AbortController();
    var timeout = setTimeout(function () { if (requestId === liveRequest) liveController.abort(); }, 35000);
    liveBusy = true;
    liveError = "";
    liveRecords = [];
    liveHasMore = false;
    livePage = Math.max(1, page);
    var query = { gameId: Number(game.id), date: root.querySelector("[data-date]").value, roleId: root.querySelector("[data-role-id]").value.trim(), roleName: root.querySelector("[data-role-name]").value.trim(), serverId: root.querySelector("[data-server-id]").value.trim(), channel: root.querySelector("[data-channel]").value };
    var scope = JSON.stringify(query);
    if (sourceScope !== scope) {
      sourceScope = scope;
      sourceMessages.clear(); groupIds.clear(); reviewStates.clear(); ignoredRecords.clear();
      demoRecords = [];
      cleaningStats = { empty: 0, groups: 0, matched: 0 };
    }
    renderDemo(root);
    try {
      var response = await fetch("/api/v1/chat-risk/messages", {
        method: "POST", signal: liveController.signal, cache: "no-store",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + (sessionStorage.getItem("dc_token") || localStorage.getItem("dc_token") || localStorage.getItem("sso_token") || "") },
        body: JSON.stringify(Object.assign({}, query, { pageNum: livePage, pageSize: 30 }))
      });
      var body = await response.json();
      if (response.status === 401) throw new Error("数据中台登录已过期，请重新登录数据中台后刷新聊天");
      if (!response.ok || !body.ok) throw new Error(typeof body.detail === "string" ? body.detail : "查询失败，请检查日期及筛选条件");
      if (requestId !== liveRequest || !isRoute()) return;
      liveRecords = body.data.records;
      liveRecords.forEach(function (record) { sourceMessages.set(sourceKey(record), record); });
      liveHasMore = body.data.hasMore;
      liveFetchedAt = body.data.fetchedAt.replace('T', ' ').replace('+08:00', '');
      scanLoaded(root);
    } catch (error) {
      if (requestId !== liveRequest) return;
      liveError = error.name === "AbortError" ? "聊天查询超时，请点击刷新重试" : error.message;
    } finally {
      clearTimeout(timeout);
      if (requestId === liveRequest) { liveBusy = false; renderDemo(root); }
    }
  }

  function resetRuleForm(root) {
    editingRuleId = null;
    var form = root.querySelector('[data-rule-form]');
    form.reset();
    form.querySelector('[type="submit"]').textContent = '添加';
    root.querySelector('[data-rule-cancel]').hidden = true;
  }

  function installDemo(root) {
    if (root.dataset.demoBound) return;
    root.dataset.demoBound = "1";
    root.querySelector("[data-game-search]").addEventListener("focus", function () { loadGames(root); });
    root.addEventListener("input", function (event) {
      if (event.target.matches("[data-search]")) renderDemo(root);
      if (event.target.matches("[data-game-search]")) {
        if (liveController) liveController.abort();
        zoneRequest++;
        fillZones(root, []);
        activeGame = "__live__"; liveRecords = []; liveHasMore = false; liveError = ""; liveFetchedAt = ""; sourceScope = "";
        sourceMessages.clear(); groupIds.clear(); reviewStates.clear(); ignoredRecords.clear(); demoRecords = [];
        cleaningStats = { empty: 0, groups: 0, matched: 0 };
        renderDemo(root);
        var game = selectedGame(root);
        if (game) loadZones(root, game);
      }
    });
    root.querySelector("[data-rule-form]").addEventListener("submit", function (event) {
      event.preventDefault();
      var form = event.currentTarget;
      var keyword = form.elements.keyword.value.trim();
      var tag = form.elements.tag.value.trim() || "自定义";
      if (!keyword || keyword.split('·').some(function (word) { return !cleanChat(word).compact; })) { showToast("请输入有效关键词，组合词之间用·连接且不能留空"); form.elements.keyword.focus(); return; }
      var game = form.elements.game.value;
      var ruleKey = function (value) { return JSON.stringify(value.split('·').map(function (word) { return cleanChat(word).compact; }).sort()); };
      if (demoRules.some(function (rule) { return rule.id !== editingRuleId && ruleKey(rule.keyword) === ruleKey(keyword) && rule.tag === tag && rule.game === game; })) { showToast("相同分类和游戏的关键词已存在，请点击原规则编辑"); return; }
      var rule = { id: editingRuleId || demoRuleSequence++, keyword: keyword, tag: tag, level: form.elements.level.value, game: game };
      if (editingRuleId) demoRules = demoRules.map(function (item) { return item.id === editingRuleId ? rule : item; });
      else demoRules.push(rule);
      resetRuleForm(root);
      renderRules(root);
      scanLoaded(root);
      showToast("规则已保存，已重算当前查询全部已加载消息");
    });
    root.addEventListener("click", function (event) {
      if (event.target.closest("[data-game-clear]")) {
        var gameSearch = root.querySelector("[data-game-search]");
        gameSearch.value = "";
        gameSearch.dispatchEvent(new Event("input", { bubbles: true }));
        gameSearch.focus();
        return;
      }
      var modeTab = event.target.closest("[data-game],[data-live-tab]");
      if (modeTab) {
        activeGame = modeTab.hasAttribute("data-live-tab") ? ((selectedGame(root) || {}).id || "__live__") + "" : "";
        renderDemo(root);
        return;
      }
      var statusTab = event.target.closest("[data-status]");
      if (statusTab) {
        activeStatus = statusTab.dataset.status;
        root.querySelectorAll("[data-status]").forEach(function (tab) { tab.classList.toggle("active", tab === statusTab); });
        renderDemo(root);
        return;
      }
      var toggle = event.target.closest("[data-toggle-record]");
      if (toggle) {
        var record = demoRecords.find(function (item) { return item.id === toggle.dataset.toggleRecord; });
        if (record) {
          record.status = record.status === "pending" ? "processed" : "pending";
          reviewStates.set(record.id, { signature: record.signature, status: record.status });
          showToast(record.status === "processed" ? "本次会话已标记处理" : "已恢复待处理");
          renderDemo(root);
        }
        return;
      }
      var remove = event.target.closest("[data-delete-record]");
      if (remove) {
        var deletedRecord = demoRecords.find(function (item) { return item.id === remove.dataset.deleteRecord; });
        if (deletedRecord) ignoredRecords.set(deletedRecord.id, deletedRecord.signature);
        demoRecords = demoRecords.filter(function (item) { return item.id !== remove.dataset.deleteRecord; });
        showToast("已从本次会话移除，源站记录不变");
        renderDemo(root);
        return;
      }
      if (event.target.closest("[data-scan]")) {
        if (liveBusy || liveError || !sourceMessages.size) { showToast("请先成功加载聊天数据"); return; }
        var added = scanLoaded(root);
        activeStatus = "pending";
        root.querySelectorAll("[data-status]").forEach(function (tab) { tab.classList.toggle("active", tab.dataset.status === "pending"); });
        activeGame = "";
        showToast("已重算全部已加载消息，新增或变更命中 " + added + " 组");
        renderDemo(root);
        return;
      }
      if (event.target.closest("[data-query]")) { loadLive(root, 1); return; }
      if (event.target.closest("[data-prev]")) { loadLive(root, livePage - 1); return; }
      if (event.target.closest("[data-next]")) { loadLive(root, livePage + 1); return; }
      if (event.target.closest("[data-settings]")) { setSettingsOpen(root, true); return; }
      if (event.target.closest("[data-settings-close]") || event.target.closest("[data-settings-mask]")) { setSettingsOpen(root, false); return; }
      if (event.target.closest('[data-rule-cancel]')) { resetRuleForm(root); return; }
      var editRule = event.target.closest('[data-rule-edit]');
      if (editRule) {
        var selectedRule = demoRules.find(function (item) { return item.id === Number(editRule.dataset.ruleEdit); });
        if (!selectedRule) return;
        editingRuleId = selectedRule.id;
        var editForm = root.querySelector('[data-rule-form]');
        ['keyword', 'tag', 'level', 'game'].forEach(function (field) { editForm.elements[field].value = selectedRule[field]; });
        editForm.querySelector('[type="submit"]').textContent = '保存';
        root.querySelector('[data-rule-cancel]').hidden = false;
        editForm.elements.keyword.focus();
        return;
      }
      var removeRule = event.target.closest("[data-rule-remove]");
      if (removeRule) {
        demoRules = demoRules.filter(function (rule) { return rule.id !== Number(removeRule.dataset.ruleRemove); });
        if (editingRuleId === Number(removeRule.dataset.ruleRemove)) resetRuleForm(root);
        renderRules(root);
        scanLoaded(root);
        showToast("规则已删除，已重算当前查询全部已加载消息");
      }
    });
    document.addEventListener("keydown", function (event) { if (event.key === "Escape") setSettingsOpen(root, false); });
    renderDemo(root);
    renderRules(root);
    root.querySelector("[data-date]").value = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date());
  }

  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function chatJumpMessage(record, needle) {
    return String(record.content || "").indexOf(needle) !== -1 || String(record.recipient || "").indexOf(needle) !== -1;
  }

  async function runChatJump(root) {
    if (chatJumpBusy) return;
    var raw = "";
    try { raw = sessionStorage.getItem("dc_chat_jump") || ""; } catch (error) { raw = ""; }
    if (!raw) return;
    try { sessionStorage.removeItem("dc_chat_jump"); } catch (error) { }
    var target = null;
    try { target = JSON.parse(raw); } catch (error) { target = null; }
    if (!target || !target.roleId || !target.needle) return;
    chatJumpBusy = true;
    chatJumpNeedle = String(target.needle);
    try {
      for (var wait = 0; wait < 150 && !sourceGames.length; wait += 1) await sleep(100);
      var game = sourceGames.filter(function (item) { return String(item.id) === String(target.gameId); })[0];
      if (!game) {
        liveError = "游戏列表未就绪或当前账号没有该记录对应游戏，无法定位原文";
        renderDemo(root);
        return;
      }
      root.querySelector("[data-game-search]").value = gameLabel(game);
      root.querySelector("[data-role-id]").value = String(target.roleId);
      root.querySelector("[data-role-name]").value = String(target.roleName || "");
      fillZones(root, []);
      var dates = (target.dates || []).slice(0, 3);
      for (var index = 0; index < dates.length; index += 1) {
        root.querySelector("[data-date]").value = dates[index];
        for (var page = 1; page <= 3; page += 1) {
          await loadLive(root, page);
          if (!isRoute()) return;
          if (liveError) break;
          var found = (liveRecords || []).filter(function (record) { return chatJumpMessage(record, chatJumpNeedle); })[0];
          if (found) {
            var row = root.querySelector("tr.dc-chat-risk-row-hit");
            if (row) row.scrollIntoView({ block: "center" });
            showToast("已定位聊天原文 · " + dates[index]);
            return;
          }
          if (!liveHasMore) break;
        }
      }
      showToast("本页未找到原文，可调整日期或条件后重试");
    } finally {
      chatJumpBusy = false;
    }
  }

  function findContentHost() {
    return document.querySelector("main.ant-layout-content") || document.querySelector(".ant-layout-content") || document.querySelector("main");
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
      installDemo(root);
    }
    Array.prototype.forEach.call(host.children, function (child) {
      if (child !== root) child.classList.add("dc-chat-risk-host-hidden");
    });
    root.hidden = false;
    runChatJump(root);
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
    if (root && root.parentNode) {
      Array.prototype.forEach.call(root.parentNode.children, function (child) {
        if (child !== root) child.classList.remove("dc-chat-risk-host-hidden");
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
    
    if (restoreEntryRoute && document.getElementById(MENU_ID) && findContentHost()) {
      restoreEntryRoute = false;
      if (location.pathname === "/") history.replaceState({}, "", ROUTE);
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
    if (event.target.closest("a,.ant-menu-item,.ant-menu-submenu-title")) scheduleSync();
  }, true);
  new MutationObserver(scheduleSync).observe(document.body, { childList: true, subtree: true });
  renderRoute();
})();
