/* 数据中台 · 登录权限叠加层（不改动 Web2.0 主包）
 * 1) 无登录态 -> 跳转 /login
 * 2) 数据请求统一改走本域 /api/* 并携带 JWT（Web2.0 老包硬编码了 8378）
 * 3) 退出登录统一使用 SPA 右上角菜单（sso_token 移除时同步清除 dc_token 并跳转登录页）
 */
(function () {
  // 登录应用自身负责提交、超时和错误提示；门禁只保护登录后的业务页面。
  if (location.pathname === "/login") return;
  var systemConsole = document.documentElement.hasAttribute("data-dc-system-console");
  var initialChatRoute = location.pathname === "/dashboard/chat-risk";
  var initialHeroRiskRoute = location.pathname === "/risk/quality";
  document.addEventListener("click", function (event) {
    if (systemConsole) return;
    var item = event.target && event.target.closest && event.target.closest("header .ant-menu-item");
    if (!item || (item.textContent || "").trim() !== "风控质检") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (location.pathname !== "/risk/quality") history.pushState({}, "", "/risk/quality");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, true);

  var TOKEN_KEY = "dc_token";
  var VIEW_SCOPE_KEY = "dc_view_scope";
  var CORE_DASHBOARD_ROUTES = {
    "/": true,
    "/dashboard/private-domain": true,
    "/dashboard/performance-ranking": true,
    "/dashboard/devices": true
  };
  var CORE_DASHBOARD_ROUTE_PREFIXES = [
    "/dashboard/game-detail", "/dashboard/game-person",
    "/dashboard/package-detail", "/dashboard/person-project",
    "/dashboard/team-detail", "/dashboard/video-accounts"
  ];
  var CORE_SCOPE_APIS = {
    "/api/dashboard/snapshot": true,
    "/api/overview": true, "/api/game-ranking": true,
    "/api/game-ranking/options": true, "/api/daily-report": true,
    "/api/games": true, "/api/ranking/person": true,
    "/api/ranking/scope": true, "/api/ranking/team": true,
    "/api/person-project": true, "/api/channels": true,
    "/api/private/projects": true, "/api/private/teams": true,
    "/api/private/persons": true, "/api/period-summary": true,
    "/api/dashboard-extra": true, "/api/game-detail": true,
    "/api/promoter-detail": true, "/api/promoter-tables": true
  };
  function isCoreDashboardRoute() {
    if (CORE_DASHBOARD_ROUTES[location.pathname]) return true;
    return CORE_DASHBOARD_ROUTE_PREFIXES.some(function (prefix) {
      return location.pathname === prefix || location.pathname.indexOf(prefix + "/") === 0;
    });
  }
  function isCoreScopeApi(url) {
    try {
      var path = new URL(String(url), location.href).pathname.replace(/\/$/, "");
      if (path.indexOf("/api/v1/") === 0) path = "/api/" + path.slice(8);
      return !!CORE_SCOPE_APIS[path];
    } catch (e) { return false; }
  }
  function token() {
    // The system.html login stores dc_token in localStorage; older Web2 pages
    // used sessionStorage/different sso_token.  Accept the existing system
    // session in that order so every same-origin API call uses one identity.
    return sessionStorage.getItem(TOKEN_KEY) ||
      localStorage.getItem(TOKEN_KEY) ||
      localStorage.getItem("sso_token") || "";
  }

  // 旧主包会把原型用户持久化到跨标签页共享的 app-store；真实身份只认 /auth/me。
  try {
    var initialStore = JSON.parse(localStorage.getItem("app-store") || "{}");
    if (initialStore.state && initialStore.state.user) {
      initialStore.state.user = null;
      localStorage.setItem("app-store", JSON.stringify(initialStore));
    }
  } catch (e) { /* 损坏的原型缓存不影响真实鉴权 */ }

  // ---- 同步 SPA 内置退出登录 ----
  // SPA 的「退出登录」只移除 sso_token 不触碰 dc_token，
  // 因此包装 localStorage.removeItem，确保同时清除两个 token 并跳转登录页。
  var _origRemoveItem = localStorage.removeItem.bind(localStorage);
  localStorage.removeItem = function (key) {
    var activeToken = token();
    var hadLegacyToken = key === "sso_token" && localStorage.getItem(key) !== null;
    _origRemoveItem(key);
    // SPA 初始化也会清理一次不存在的 sso_token，不能将其误判为用户主动退出。
    var hasSystemToken = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    if (key === "sso_token" && hadLegacyToken && !hasSystemToken) {
      if (activeToken) {
        origFetch("/api/v1/auth/logout", {
          method: "POST",
          keepalive: true,
          headers: { Authorization: "Bearer " + activeToken }
        }).catch(function () {});
      }
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem("dc_user");
      _origRemoveItem(TOKEN_KEY);
      _origRemoveItem("dc_user");
      // 这里不调用 redirectLogin，由下方的 history 拦截负责跳转
    }
  };
  // 首页默认数据统一读取已发布快照：多个旧接口共享一次请求，不改变筛选和下钻请求。
  var coreDashboardSnapshotFlight = null;
  var coreDashboardSnapshotData = null;
  function coreDashboardSnapshotResponse(payload) {
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  function coreDashboardSnapshotPayload(url, data) {
    if (!data) return null;
    var parsed;
    try { parsed = new URL(String(url), location.href); } catch (e) { return null; }
    var path = parsed.pathname.replace(/\/$/, "");
    var query = parsed.searchParams;
    var latest = String(data.latest_date || "");
    if (!latest) return null;
    var sameLatestRange = function () {
      return (!query.has("date") && !query.has("date_from") && !query.has("date_to")) ||
        (query.get("date") === latest) ||
        (query.get("date_from") === latest && query.get("date_to") === latest);
    };
    if (path === "/api/overview" && !query.has("date_from") && !query.has("date_to")) {
      return { ok: true, data: data.overview || {} };
    }
    if (path === "/api/daily-report" && query.get("days") === "30" &&
        !query.has("date_from") && !query.has("date_to") && !query.has("game")) {
      return { ok: true, data: data.daily_report || [] };
    }
    if (path === "/api/game-ranking" && !query.get("team") && !query.get("person") &&
        (query.get("date") === latest ||
         (query.get("date_from") === latest && query.get("date_to") === latest))) {
      return { ok: true, data: data.game_ranking || [] };
    }
    if (path === "/api/ranking/person" && query.get("date") === latest) {
      return { ok: true, data: data.person_ranking_today || [] };
    }
    if (path === "/api/ranking/person" &&
        query.get("date_from") === latest && query.get("date_to") === latest) {
      return { ok: true, data: data.person_ranking_today || [] };
    }
    if (path === "/api/ranking/person" &&
        query.get("date_from") === latest.slice(0, 8) + "01" &&
        query.get("date_to") === latest) {
      return { ok: true, data: data.person_ranking_month || [] };
    }
    if (path === "/api/ranking/team" && sameLatestRange()) {
      return { ok: true, data: data.team_ranking_today || [] };
    }
    if (path === "/api/private/projects" && sameLatestRange()) {
      return { ok: true, data: data.game_ranking || [] };
    }
    if (path === "/api/private/teams" && sameLatestRange() && data.private_teams) {
      return { ok: true, data: data.private_teams };
    }
    if (path === "/api/private/persons" && sameLatestRange() && data.private_persons) {
      var privatePersons = data.private_persons;
      var team = query.get("team") || "";
      if (team) {
        privatePersons = Object.assign({}, privatePersons, {
          persons: (privatePersons.persons || []).filter(function (row) {
            return String(row.team || "") === team;
          }),
          team: team
        });
      }
      return { ok: true, data: privatePersons };
    }
    if (path === "/api/dashboard-extra" && query.get("date") === latest) {
      return { ok: true, data: data.dashboard_extra || {} };
    }
    return null;
  }
  function loadCoreDashboardSnapshot(headers, viewScope) {
    if (coreDashboardSnapshotData) return Promise.resolve(coreDashboardSnapshotData);
    if (coreDashboardSnapshotFlight) return coreDashboardSnapshotFlight;
    var snapshotHeaders = new Headers(headers || {});
    var scope = viewScope || "";
    if (scope === "all" || scope === "sub") snapshotHeaders.set("X-Data-Scope-Mode", scope);
    coreDashboardSnapshotFlight = origFetch("/api/v1/dashboard/snapshot", {
      headers: snapshotHeaders,
      credentials: "same-origin",
      cache: "no-store"
    }).then(function (response) {
      if (!response.ok) throw new Error("dashboard snapshot HTTP " + response.status);
      return response.json();
    }).then(function (payload) {
      var data = payload && payload.data;
      if (!data || !data.latest_date) throw new Error("dashboard snapshot unavailable");
      coreDashboardSnapshotData = data;
      return data;
    }).catch(function (error) {
      coreDashboardSnapshotFlight = null;
      throw error;
    });
    return coreDashboardSnapshotFlight;
  }

  // 1) 先装 fetch 包装：8378 -> 本域 /api/*，并附带 JWT
  var authMeFlight = null;
  var authMeFlightToken = "";
  var authMeRecord = null;
  function authMeResponse(record) {
    return new Response(record.body, {
      status: record.status,
      headers: { "Content-Type": record.contentType || "application/json" }
    });
  }
  function loadAuthMe(url, opts, headers, authToken) {
    if (authMeRecord && authMeFlightToken === authToken) {
      return Promise.resolve(authMeResponse(authMeRecord));
    }
    if (authMeFlight && authMeFlightToken === authToken) return authMeFlight.then(authMeResponse);
    authMeFlightToken = authToken;
    authMeFlight = origFetch(url, Object.assign({}, opts, { headers: headers }))
      .then(function (response) {
        return response.clone().text().then(function (body) {
          var record = {
            body: body,
            status: response.status,
            contentType: response.headers.get("Content-Type") || "application/json"
          };
          if (response.ok) authMeRecord = record;
          return record;
        });
      })
      .finally(function () { authMeFlight = null; });
    return authMeFlight.then(authMeResponse);
  }
  // 同一页面的旧组件可能同时请求同一份明细。只合并并发 GET，
  // 不缓存失败结果，也不改变筛选参数和权限边界。
  var coreApiFlights = Object.create(null);
  function coreApiResponse(record) {
    return new Response(record.body, {
      status: record.status,
      headers: { "Content-Type": record.contentType || "application/json" }
    });
  }
  function fetchCoreApiOnce(u, opts, headers, authToken) {
    var method = String(opts.method || "GET").toUpperCase();
    if (method !== "GET" || !isCoreScopeApi(u)) {
      return origFetch(u, Object.assign({}, opts, { headers: headers }));
    }
    var key = method + " " + u + " " + String(authToken || "");
    if (coreApiFlights[key]) return coreApiFlights[key].then(coreApiResponse);
    var flight = origFetch(u, Object.assign({}, opts, { headers: headers }))
      .then(function (response) {
        return response.clone().text().then(function (body) {
          return {
            body: body,
            status: response.status,
            contentType: response.headers.get("Content-Type") || "application/json"
          };
        });
      })
      .finally(function () { delete coreApiFlights[key]; });
    coreApiFlights[key] = flight;
    return flight.then(coreApiResponse);
  }
  var origFetch = window.fetch;
  window.fetch = function (url, opts) {
    opts = opts || {};
    var u = String(url);
    if (/^https?:\/\/[^/]+:8378\/api/.test(u)) {
      u = u.replace(/^https?:\/\/[^/]+:8378\/api/, "/api");
    }
    var headers = new Headers(opts.headers || {});
    var t = token();
    // Web2 bundle uses absolute same-origin URLs (location.origin + "/api/...")
    // while older callers use relative paths.  Both must carry the real
    // session token; checking only startsWith("/api") silently produced 401s.
    var isApi = u.indexOf("/api") === 0;
    try {
      var parsed = new URL(u, location.href);
      isApi = parsed.origin === location.origin && parsed.pathname.indexOf("/api") === 0;
    } catch (e) { /* keep the relative-path check */ }
    if (t && isApi) headers.set("Authorization", "Bearer " + t);
    var viewScope = sessionStorage.getItem(VIEW_SCOPE_KEY) || "";
    if (isApi && isCoreDashboardRoute() && isCoreScopeApi(u) &&
        (viewScope === "all" || viewScope === "sub")) {
      headers.set("X-Data-Scope-Mode", viewScope);
      var scopedUrl = new URL(u, location.href);
      scopedUrl.searchParams.set("__dc_scope", viewScope);
      u = scopedUrl.pathname + scopedUrl.search + scopedUrl.hash;
    }
    var requestMethod = String(opts.method || "GET").toUpperCase();
    var requestPath = "";
    try { requestPath = new URL(u, location.href).pathname; } catch (e) {}
    if (t && isApi && requestMethod === "GET" && requestPath === "/api/v1/auth/me") {
      return loadAuthMe(u, opts, headers, t);
    }
    var snapshotPayload = coreDashboardSnapshotPayload(u, coreDashboardSnapshotData);
    if (snapshotPayload) return Promise.resolve(coreDashboardSnapshotResponse(snapshotPayload));
    if (isApi && isCoreDashboardRoute()) {
      var snapshotCandidate = coreDashboardSnapshotPayload(u, { latest_date: "" });
      if (!snapshotCandidate && /^(?:https?:\/\/[^/]+)?\/api\/(?:overview|daily-report|game-ranking|ranking\/person|ranking\/team|ranking\/scope|dashboard-extra|private\/projects|private\/teams|private\/persons|person-project|game-detail|period-summary|channels)(?:[/?]|$)/.test(u)) {
        return loadCoreDashboardSnapshot(headers, viewScope).then(function (data) {
          var payload = coreDashboardSnapshotPayload(u, data);
          return payload ? coreDashboardSnapshotResponse(payload) :
            fetchCoreApiOnce(u, opts, headers, t);
        }).catch(function () {
          return fetchCoreApiOnce(u, opts, headers, t);
        });
      }
    }
    return fetchCoreApiOnce(u, opts, headers, t);
  };

  function redirectLogin() { location.replace("/login"); }

  // ---- 拦截 SPA 客户端路由到 /login → 强制走服务端静态登录页 ----
  // SPA 内部 navigate("/login") 会渲染内置 React Login 组件，
  // 与 /login（login.html）样式不一致。此处拦截 history API 和 popstate，
  // 当 URL 变为 /login 时，硬跳转一次，让服务端返回 login.html。
  (function interceptLoginRoute() {
    var _push = history.pushState.bind(history);
    var _replace = history.replaceState.bind(history);
    function forceLogin(url) {
      var path = String(url || "").replace(/^\//, "");
      // 只拦截纯净的 /login（不含子路由），避免影响 /login/sso-callback 等
      if (path === "login" || path.startsWith("login?")) {
        location.replace("/login");
      }
    }
    history.pushState = function (s, t, u) {
      _push(s, t, u);
      if (u) forceLogin(u);
      if (currentPerms && currentPerms.length) setTimeout(enforceRoute, 0);
    };
    history.replaceState = function (s, t, u) {
      _replace(s, t, u);
      if (u) forceLogin(u);
      if (currentPerms && currentPerms.length) setTimeout(enforceRoute, 0);
    };
    window.addEventListener("popstate", function () {
      if (location.pathname === "/login") location.replace("/login");
      else if (currentPerms && currentPerms.length) setTimeout(enforceRoute, 0);
    });
  })();

  // 系统管理由独立入口加载，离开主应用时结束其页面和后台任务。
  function interceptAdminNav() {
    if (systemConsole || window.self !== window.top) return;
    document.addEventListener("click", function (event) {
      var target = event.target;
      var item = target && target.closest ? target.closest("a,[role=menuitem]") : null;
      if (!item) return;
      var href = item.getAttribute("href") || "";
      if (href.indexOf("/admin") !== 0 && (item.textContent || "").trim() !== "系统管理") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      location.assign(href.indexOf("/admin") === 0 ? href : "/admin");
    }, true);
  }
  interceptAdminNav();

  // ---- 权限菜单 / 路由控制（角色管理里配置的权限在此生效）----
  var MODULE_PERMS = {"核心看板":["dashboard:view","dashboard:private","dashboard:performance","assets:view"],"风控质检":["dashboard:chat_risk","dashboard:itemlog","personnel:review","assets:view"],"用户管理":["personnel:view","personnel:archive","workorder:view","integration:registered_accounts","dashboard:reuse"],"商务":["business:sdk_game_analysis","business:channel","business:revenue","business:contract"],"资产库":["business:products","assets:view","assets:digital","assets:media","assets:sop"],"数据集":["integration:view"],"财务":["finance:view","finance:cost","finance:revenue","finance:roi","finance:settlement"],"系统管理":["system:user:list","system:role:list","system:audit:list","system:config"]};
  var PAGE_PERMS = {"流失预警":"integration:view","注册明细":"integration:view","活跃明细":"integration:view","订单明细":"integration:view",
    "全局驾驶舱": "dashboard:view",
    "私域数据看板": "dashboard:private",
    "人员业绩排行": "dashboard:performance",
    "物品管理": "dashboard:itemlog",
    "物品记录": "dashboard:itemlog",
    "聊天风控": "dashboard:chat_risk",
    "复用看板": "dashboard:reuse",
    "工单中心": "workorder:view",
    "用户池": "integration:registered_accounts",
    "产品库": "business:products",
    "渠道详情": "business:channel",
    "渠道收益": "business:revenue",
    "渠道合同": "business:contract",
    "渠道SDK游戏分析": "business:sdk_game_analysis",
    "财务总览": "finance:view",
    "成本台账": "finance:cost",
    "营收台账": "finance:revenue",
    "ROI核算": "finance:roi",
    "渠道结算对账": "finance:settlement",
    "人员总览": "personnel:view",
    "人员档案": "personnel:view",
    "任务派发": "personnel:tasks",
    "工作复盘": "personnel:review",
    "资产总览": "assets:view",
    "数字资产": "assets:digital",
    "业务文档": "assets:docs",
    "短视频素材库": "assets:media",
    "SOP知识库": "assets:sop",
    "数据集成": "integration:view",
    "工单派发":"workorder:view","产品洞察":"business:sdk_game_analysis","渠道库":"business:channel","合同管理":"business:contract","人员业绩排行榜":"dashboard:performance","资产总览看板":"assets:view","设备驾驶舱":"assets:view","设备管理":"assets:view","设备映射表":"assets:view","盘点功能":"assets:view","员工设备绑定":"assets:view","IP库":"assets:view","员工质检":"personnel:review",
    "角色权限": "system:role:list",
  };
  var ROUTE_PERMS = {"/integration/role": ["integration:view"], "/integration/active": ["integration:view"], "/integration/registration": ["integration:view"], "/integration/inactive": ["integration:view"], "/admin": ["system:user:list"], "/admin/config": ["system:config"], "/admin/departments": ["system:user:list"], "/admin/dictionary": ["system:config"], "/admin/audit": ["system:audit:list"], "/admin/devices": ["system:config"], "/admin/users": ["system:role:list"],"/dashboard/devices":["assets:view"],"/risk/ip-library":["assets:view"],"/risk/quality":["personnel:review"],"/assets/devices":["assets:view"],"/assets/devices/mapping":["assets:view"],"/assets/devices/inventory":["assets:view"],"/assets/devices/bindings":["assets:view"],
    "/": ["dashboard:view"],
    "/dashboard/private-domain": ["dashboard:private"],
    "/dashboard/performance-ranking": ["dashboard:performance"],
    "/dashboard/item-log": ["dashboard:itemlog"],
    "/dashboard/chat-risk": ["dashboard:chat_risk"],
    "/dashboard/reuse": ["dashboard:reuse"],
    "/dashboard/work-orders/pending": ["workorder:view"],
    "/dashboard/work-orders/pool": ["workorder:view"],
    "/dashboard/work-orders/mine": ["workorder:view"],
    "/dashboard/work-orders/manage": ["workorder:assign"],
    "/business/products": ["business:products"],
    "/business/channel-detail": ["business:channel"],
    "/business/channel-revenue": ["business:revenue"],
    "/business/channel-contract": ["business:contract"],
    "/business/sdk-game-analysis": ["business:sdk_game_analysis"],
    "/business/sdk-game-analysis/game-detail": ["business:sdk_game_analysis"],
    "/finance": ["finance:view"],
    "/finance/cost": ["finance:cost"],
    "/finance/revenue": ["finance:revenue"],
    "/finance/roi": ["finance:roi"],
    "/finance/settlement": ["finance:settlement"],
    "/personnel": ["personnel:view"],
    "/personnel/archive": ["personnel:archive"],
    "/personnel/tasks": ["personnel:tasks"],
    "/personnel/review": ["personnel:review"],
    "/assets": ["assets:view"],
    "/assets/documents": ["assets:docs"],
    "/assets/media": ["assets:media"],
    "/assets/sop": ["assets:sop"],
    "/integration": ["integration:view"],
    "/assets?view=digital": ["assets:digital"],
    "/dashboard/registered-accounts": ["integration:registered_accounts"],
    "/dashboard/contacts": ["integration:registered_accounts"],
  };
  var PREFIX_ROUTE_PERMS = [
    ["/dashboard/team-detail", ["dashboard:private"]],
    ["/dashboard/person", ["dashboard:performance"]],
    ["/dashboard/", ["dashboard:view"]],
    ["/business/", ["business:products", "business:channel", "business:revenue", "business:contract", "business:sdk_game_analysis"]],
    ["/finance", ["finance:view", "finance:cost", "finance:revenue", "finance:roi", "finance:settlement"]],
    ["/personnel", ["personnel:view", "personnel:archive", "personnel:tasks", "personnel:review"]],
    ["/assets", ["assets:view", "assets:docs", "assets:media", "assets:sop", "assets:digital"]],
    ["/integration", ["integration:view"]],
  ];
  var currentPerms = [];

  function hasPerm(code) { return currentPerms.indexOf("*") >= 0 || currentPerms.indexOf(code) >= 0; }
  function hasAny(codes) {
    for (var i = 0; i < codes.length; i++) if (hasPerm(codes[i])) return true;
    return false;
  }

  function installMenuAlignmentUI() {
    if (document.getElementById("dc-injected-menu-alignment")) return;
    var style = document.createElement("style");
    style.id = "dc-injected-menu-alignment";
    style.textContent = [
      "#dc-itemlog-menu,#dc-chat-risk-menu,#dc-reuse-menu,#dc-work-order-menu{min-height:40px;line-height:40px}",
      "#dc-itemlog-menu .dc-itemlog-menu-icon,#dc-chat-risk-menu .dc-chat-risk-menu-icon,#dc-reuse-menu .dc-reuse-menu-icon,#dc-work-order-menu .dc-work-order-icon{display:inline-flex!important;align-items:center;justify-content:center;width:16px!important;height:16px!important;margin-right:0!important;vertical-align:-.125em;flex:0 0 16px!important}",
      "#dc-itemlog-menu svg,#dc-chat-risk-menu svg,#dc-reuse-menu svg,#dc-work-order-menu svg{width:16px!important;height:16px!important}",
      "#dc-itemlog-menu>.ant-menu-title-content,#dc-chat-risk-menu>.ant-menu-title-content,#dc-reuse-menu>.ant-menu-title-content,#dc-work-order-menu>.ant-menu-title-content{display:inline-block;margin-inline-start:10px;line-height:40px!important}",
      ".ant-menu-inline-collapsed>#dc-itemlog-menu>.ant-menu-title-content,.ant-menu-inline-collapsed>#dc-chat-risk-menu>.ant-menu-title-content,.ant-menu-inline-collapsed>#dc-reuse-menu>.ant-menu-title-content,.ant-menu-inline-collapsed>#dc-work-order-menu>.ant-menu-title-content{opacity:0;pointer-events:none}"
    ].join("");
    document.head.appendChild(style);
  }
  installMenuAlignmentUI();

  var NAVIGATION_ROUTES = {"dashboard": ["/", "/dashboard/private-domain", "/dashboard/performance-ranking", "/dashboard/devices"], "risk": ["/dashboard/chat-risk", "/dashboard/item-log", "/risk/ip-library", "/risk/quality"], "personnel": ["/dashboard/reuse", "/dashboard/registered-accounts", "/dashboard/contacts", "/dashboard/work-orders/pending", "/personnel"], "business": ["/business/sdk-game-analysis", "/business/channel-detail", "/business/channel-revenue", "/business/channel-contract"], "assets": ["/assets", "/assets/devices/mapping", "/assets/devices/inventory", "/assets/devices/bindings", "/assets?view=digital", "/assets/media", "/assets/sop", "/business/products"], "integration": ["/integration", "/integration/role", "/integration/active", "/integration/registration", "/integration/inactive"], "finance": ["/finance", "/finance/cost", "/finance/revenue", "/finance/roi", "/finance/settlement"], "admin": ["/admin", "/admin/config", "/admin/departments", "/admin/dictionary", "/admin/audit", "/admin/devices", "/admin/users"]};
  function navigationAllowed(path) {
    if (!window.__DC_NAVIGATION__.ready) return false;
    var url = new URL(path, location.origin);
    var key = url.pathname === "/assets" && url.searchParams.get("view") === "digital" ? "/assets?view=digital" : url.pathname;
    var need = ROUTE_PERMS[key];
    return !!need && hasAny(need);
  }
  function navigationTarget(module) {
    var routes = NAVIGATION_ROUTES[module] || [];
    for (var i = 0; i < routes.length; i++) if (navigationAllowed(routes[i])) return routes[i];
    return null;
  }
  function navigationItems(items) {
    return (items || []).reduce(function (result, item) {
      if (item.children) {
        var children = navigationItems(item.children);
        if (children.length) result.push(Object.assign({}, item, {children: children}));
      } else if (navigationAllowed(item.key)) result.push(item);
      return result;
    }, []);
  }
  window.__DC_NAVIGATION__ = {ready: false, target: navigationTarget, items: navigationItems};

  function routeNeed() {
    var p = location.pathname;
    if (p === "/assets" && new URLSearchParams(location.search).get("view") === "digital") return ["assets:digital"];
    if (ROUTE_PERMS[p]) return ROUTE_PERMS[p];
    for (var i = 0; i < PREFIX_ROUTE_PERMS.length; i++) {
      if (p.indexOf(PREFIX_ROUTE_PERMS[i][0]) === 0) return PREFIX_ROUTE_PERMS[i][1];
    }
    return null;
  }

  function firstAllowedRoute() {
    for (var module in NAVIGATION_ROUTES) {
      var target = navigationTarget(module);
      if (target) return target;
    }
    return null;
  }

  function enforceRoute() {
    if (location.pathname === "/login") return;
    var need = routeNeed();
    if (!need) return;
    if (hasAny(need)) return;
    var module = Object.keys(NAVIGATION_ROUTES).find(function (key) {
      return NAVIGATION_ROUTES[key].some(function (path) { return path.split("?")[0] === location.pathname; });
    });
    var target = navigationTarget(module) || firstAllowedRoute();
    if (target && target !== location.pathname) location.replace(target);
  }

  // ---- 右上角账号名与登录账号联通（Web2.0 原型内置假用户 张明）----
  function installRealUserUI(u) {
    var realName = u.name || u.username;
    var roleText = (u.roles || []).map(function (r) { return r.name; }).join("/");
    var realLabel = realName + (roleText ? " · " + roleText : "") + " · " +
      (u.scope === "all" ? "整包" : "分包");
    var mockName = "张明";
    try {
      var st = JSON.parse(localStorage.getItem("app-store") || "{}");
      var mu = st.state && st.state.user;
      if (mu && mu.name) mockName = String(mu.name);
    } catch (e) { /* 保持默认 */ }
    function setLastText(el, text) {
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      if (nodes.length) nodes[nodes.length - 1].nodeValue = text;
      else el.appendChild(document.createTextNode(text));
    }
    setInterval(function () {
      document.querySelectorAll(".ant-avatar").forEach(function (av) { av.title = realLabel; });
      document.querySelectorAll(".ant-dropdown:not(.ant-dropdown-hidden) .ant-dropdown-menu-item").forEach(function (li) {
        var t = (li.textContent || "").trim();
        if (t === mockName || t === "用户") setLastText(li, realLabel);
      });
    }, 400);
  }

  // 分包用户：隐藏「整包」切换，强制只显示分包数据
  function installSubScopeUI() {
    setInterval(function () {
      // 1) 若当前处于「分包」占位视图（value=sub），切回数据视图（整包形式渲染，数据由后端按分包过滤）
      document.querySelectorAll('.ant-segmented-item-label[title="分包"]').forEach(function (label) {
        var item = label.closest("label.ant-segmented-item");
        var input = item && item.querySelector("input");
        if (input && input.checked) {
          var whole = item.parentElement && item.parentElement.querySelector('.ant-segmented-item-label[title="整包"]');
          if (whole) whole.click();
        }
        // 隐藏整包/分包切换控件，避免误操作
        var seg = label.closest(".ant-segmented");
        if (seg) seg.style.display = "none";
      });
      // 2) 头部标签：把「整包 · 管理后台数据 / 分包 · 三级账号数据待接入」统一改为「分包」
      document.querySelectorAll("div,span").forEach(function (el) {
        if (el.children.length === 0) {
          var t = (el.textContent || "").trim();
          if (t === "整包 · 管理后台数据" || t === "分包 · 三级账号数据待接入") {
            el.textContent = "分包";
          }
        }
      });
    }, 500);
  }

  function installDashboardChromeCleanup() {
    if (!document.getElementById("dc-dashboard-chrome-cleanup")) {
      var style = document.createElement("style");
      style.id = "dc-dashboard-chrome-cleanup";
      style.textContent = [
        "header.ant-layout-header > div.flex.items-center.gap-1:first-child{flex:1 1 auto;min-width:0}",
        "header.ant-layout-header > div.flex.items-center.gap-1:first-child > ul.ant-menu{flex:1 1 auto!important;min-width:476px!important}",
        "footer.ant-layout-footer,.dc-hide-package-switch{display:none!important}"
      ].join("");
      document.head.appendChild(style);
    }

    function cleanup() {
      if (!isCoreDashboardRoute()) {
        document.querySelectorAll(".dc-hide-package-switch").forEach(function (segmented) {
          segmented.classList.remove("dc-hide-package-switch");
        });
        return;
      }
      document.querySelectorAll("main .ant-segmented").forEach(function (segmented) {
        var whole = segmented.querySelector('.ant-segmented-item-label[title="整包"]');
        var sub = segmented.querySelector('.ant-segmented-item-label[title="分包"]');
        if (!whole || !sub) return;
        segmented.classList.add("dc-hide-package-switch");
      });
    }

    cleanup();
    new MutationObserver(cleanup).observe(document.body, { childList: true, subtree: true });
  }

  function installDataScopeSwitch(u) {
    var allowedAll = (u.default_scope || u.scope) === "all";
    var mode = sessionStorage.getItem(VIEW_SCOPE_KEY);
    if (!allowedAll) mode = "sub";
    else if (mode !== "all" && mode !== "sub") mode = "all";
    sessionStorage.setItem(VIEW_SCOPE_KEY, mode);

    if (!document.getElementById("dc-data-scope-switch-style")) {
      var style = document.createElement("style");
      style.id = "dc-data-scope-switch-style";
      style.textContent = ".dc-original-scope-badge{display:none!important}.dc-data-scope-switch{position:fixed!important;right:28px!important;top:72px!important;left:auto!important;bottom:auto!important;z-index:1000;display:inline-flex;padding:2px;background:#f2f3f5;border:1px solid #d9d9d9;border-radius:6px;gap:2px;box-shadow:0 1px 4px rgba(0,0,0,.08)}.dc-data-scope-switch button{border:0;background:transparent;color:#4e5969;padding:3px 10px;border-radius:4px;cursor:pointer;font-size:12px;line-height:20px}.dc-data-scope-switch button.active{background:#1677ff;color:#fff}.dc-data-scope-switch button:disabled{cursor:not-allowed;color:#c9cdd4}";
      document.head.appendChild(style);
    }

    function render() {
      var existing = document.getElementById("dc-data-scope-switch");
      if (!isCoreDashboardRoute()) {
        if (existing) existing.remove();
        document.querySelectorAll(".dc-original-scope-badge").forEach(function (el) {
          el.classList.remove("dc-original-scope-badge");
        });
        return;
      }
      document.querySelectorAll("main div,main span").forEach(function (el) {
        if (el.children.length) return;
        var text = (el.textContent || "").trim();
        if (text !== "整包 · 管理后台数据" && text !== "分包 · 三级账号数据待接入") return;
        el.classList.add("dc-original-scope-badge");
      });
      if (existing) return;
      var control = document.createElement("span");
      control.id = "dc-data-scope-switch";
      control.className = "dc-data-scope-switch";
      [["all", "整包"], ["sub", "分包"]].forEach(function (item) {
        var button = document.createElement("button");
        button.type = "button";
        button.textContent = item[1];
        button.className = mode === item[0] ? "active" : "";
        button.disabled = item[0] === "all" && !allowedAll;
        button.addEventListener("click", function () {
          if (button.disabled || mode === item[0]) return;
          sessionStorage.setItem(VIEW_SCOPE_KEY, item[0]);
          location.reload();
        });
        control.appendChild(button);
      });
      document.body.appendChild(control);
    }
    render();
    new MutationObserver(render).observe(document.body, { childList: true, subtree: true });
    setInterval(render, 500);
  }

  function installLCChatEntry() {
    if (!hasPerm("ai:employee:view")) return;
    var entry = document.getElementById("dc-lc-chat-entry");
    if (!entry) {
      entry = document.createElement("button");
      entry.id = "dc-lc-chat-entry";
      entry.type = "button";
      entry.textContent = "AI员工LC（beta版）";
      entry.setAttribute("aria-label", "在数据中台内打开 AI员工LC（beta版）");
      entry.style.cssText = [
        "position:fixed", "z-index:10001", "display:inline-flex",
        "align-items:center", "justify-content:center", "height:32px",
        "padding:0 12px", "border:0", "border-radius:6px",
        "background:transparent", "color:rgba(255,255,255,.88)",
        "font-size:14px", "white-space:nowrap", "cursor:pointer"
      ].join(";");
      document.body.appendChild(entry);
    }

    var panel = document.getElementById("dc-lc-chat-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "dc-lc-chat-panel";
      panel.style.cssText = [
        "position:fixed", "right:0", "bottom:0", "z-index:10000",
        "display:none", "width:min(440px,100vw)", "background:#fff", "overflow:hidden",
        "border-left:1px solid #e5e7eb", "box-shadow:-12px 0 32px rgba(15,23,42,.16)"
      ].join(";");
      document.body.appendChild(panel);
    }

    function layoutEntry() {
      var header = document.querySelector("header.ant-layout-header") ||
        document.querySelector("header") || document.querySelector(".ant-layout-header");
      var messageButton = null;
      if (header) {
        Array.prototype.some.call(header.querySelectorAll("button"), function (button) {
          if (button.getAttribute("aria-label") === "通知" || button.querySelector('[aria-label="bell"], .anticon-bell')) {
            messageButton = button;
            return true;
          }
          return false;
        });
      }
      if (!header || !messageButton) return;
      var headerRect = header.getBoundingClientRect();
      var messageRect = messageButton.getBoundingClientRect();
      var entryWidth = entry.getBoundingClientRect().width || 128;
      entry.style.top = Math.round(headerRect.top + (headerRect.height - 32) / 2) + "px";
      entry.style.left = Math.round(messageRect.left - entryWidth - 8) + "px";
      panel.style.top = Math.round(headerRect.bottom) + "px";
    }

    function closePanel() {
      panel.style.display = "none";
      entry.style.background = "transparent";
      entry.setAttribute("aria-pressed", "false");
    }

    if (!entry.dataset.lcBound) {
      entry.dataset.lcBound = "1";
      entry.addEventListener("click", function () {
        if (panel.style.display !== "none") {
          closePanel();
          return;
        }
        var frame = panel.querySelector("iframe");
        if (!frame) {
          frame = document.createElement("iframe");
          frame.src = "/ai-chat.html?v=20260901-lc-route-v2";
          frame.title = "AI员工LC（beta版）聊天区域";
          frame.style.cssText = "width:100%;height:100%;border:0;background:#fff";
          panel.appendChild(frame);
        }
        layoutEntry();
        panel.style.display = "block";
        entry.style.background = "rgba(255,255,255,.16)";
        entry.style.color = "#fff";
        entry.setAttribute("aria-pressed", "true");
      });
      document.addEventListener("click", function (event) {
        var item = event.target && event.target.closest && event.target.closest(".ant-menu-item");
        if (item && item !== entry && panel.style.display !== "none") closePanel();
      }, true);
      window.addEventListener("resize", layoutEntry);
    }

    layoutEntry();
    setInterval(layoutEntry, 500);
  }

  function boot() {
    if (!token()) { redirectLogin(); return; }
    fetch("/api/v1/auth/me", { headers: { Authorization: "Bearer " + token() } })
      .then(function (r) { if (!r.ok) throw new Error("unauth"); return r.json(); })
      .then(function (j) {
        var u = j.user;
        var savedScope = sessionStorage.getItem(VIEW_SCOPE_KEY);
        if ((u.default_scope || u.scope) !== "all") sessionStorage.setItem(VIEW_SCOPE_KEY, "sub");
        else if (savedScope !== "all" && savedScope !== "sub") sessionStorage.setItem(VIEW_SCOPE_KEY, "all");
        window.__DC_USER__ = u;
        currentPerms = u.is_super ? ["*"] : (u.perms || []);
        window.__DC_NAVIGATION__.ready = true;
        window.dispatchEvent(new Event("dc:navigation-ready"));
        if (systemConsole) {
          if (window.self === window.top && new URLSearchParams(location.search).get("embedded") !== "1") installLCChatEntry();
          enforceRoute();
          return;
        }
        installRealUserUI(u);
        installDashboardChromeCleanup();
        installDataScopeSwitch(u);
        installLCChatEntry();
        if (hasPerm("dashboard:itemlog") && !document.querySelector('script[data-dc-itemlog]')) {
          var itemLogScript = document.createElement("script");
          itemLogScript.src = "/item-log-prototype.js?v=20261006-rate-limit-lazy-v1";
          itemLogScript.dataset.dcItemlog = "1";
          document.head.appendChild(itemLogScript);
        }
        if (hasPerm("dashboard:chat_risk") && !document.querySelector('script[data-dc-chat-risk]')) {
          var chatRiskScript = document.createElement("script");
          chatRiskScript.src = "/chat-risk-prototype.js?v=20261006-rate-limit-lazy-v1";
          if (initialChatRoute) chatRiskScript.dataset.entryRoute = "/dashboard/chat-risk";
          chatRiskScript.dataset.dcChatRisk = "1";
          document.head.appendChild(chatRiskScript);
        }
        if (hasPerm("personnel:review") && !document.querySelector('script[data-dc-hero-risk]')) {
          var heroRiskScript = document.createElement("script");
          heroRiskScript.src = "/risk-control-prototype-source.js?v=20261006-rate-limit-lazy-v1";
          if (initialHeroRiskRoute) heroRiskScript.dataset.entryRoute = "/risk/quality";
          heroRiskScript.dataset.dcHeroRisk = "1";
          document.head.appendChild(heroRiskScript);
        }
        if (hasPerm("business:sdk_game_analysis") && !document.querySelector('script[data-dc-sdk-analysis]')) {
          var sdkAnalysisScript = document.createElement("script");
          sdkAnalysisScript.src = "/sdk-game-analysis.js?v=20260916-product-insight-db-v2";
          sdkAnalysisScript.dataset.dcSdkAnalysis = "1";
          document.head.appendChild(sdkAnalysisScript);
        }
        if (hasPerm("dashboard:reuse") && !document.querySelector('script[data-dc-reuse]')) {
          var reuseScript = document.createElement("script");
          reuseScript.src = "/reuse-dashboard.js?v=20261006-reuse-game-label-v1";
          reuseScript.dataset.dcReuse = "1";
          document.head.appendChild(reuseScript);
        }
        if (hasPerm("workorder:view") && !document.querySelector('script[data-dc-work-order]')) {
          var workOrderScript = document.createElement("script");
          workOrderScript.src = "/work-order-entry.js?v=20260911-management";
          workOrderScript.dataset.dcWorkOrder = "1";
          document.head.appendChild(workOrderScript);
        }
        if (hasPerm("integration:registered_accounts") && !document.querySelector('script[data-dc-contacts]')) {
          var contactsScript = document.createElement("script");
          contactsScript.src = "/contacts-entry.js?v=20261002-contacts-v2";
          contactsScript.dataset.dcContacts = "1";
          document.head.appendChild(contactsScript);
        }
        enforceRoute();
        if (u.scope === "sub") document.body.classList.add("dc-scope-sub");
        // 用户信息与退出统一由 Web2.0 右上角菜单承担，不再注入右下角浮层
      })
      .catch(function () {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem("dc_user");
        redirectLogin();
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
