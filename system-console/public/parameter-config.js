(function () {
  "use strict";

  var root = document.getElementById("app");
  var mode = new URLSearchParams(location.search).get("mode") === "risk" ? "risk" : "churn";
  var state = { payload: null, draft: null, original: "", loading: false, saving: false, error: "", notice: "" };
  var categories = ["引流", "联系方式", "交易风险", "手拉", "商人", "工作室"];
  var levels = [{ value: "high", label: "高" }, { value: "medium", label: "中" }, { value: "low", label: "低" }];

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[character];
    });
  }

  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function normalizeRules(value) {
    value = value || {};
    return {
      chat: (value.chat || []).map(function (row) { return [String(row[0] || ""), String(row[1] || ""), String(row[2] || "medium")]; }),
      guides: (value.guides || []).map(function (row) { return [String(row[0] || ""), String(row[1] || "引流"), String(row[2] || "medium")]; }),
      trade: (value.trade || []).map(String),
      whitelist: (value.whitelist || []).map(String),
      item_actions: (value.item_actions || []).map(String),
      ip_role_threshold: Number(value.ip_role_threshold == null ? 4 : value.ip_role_threshold),
      recharge_threshold: Number(value.recharge_threshold == null ? 0 : value.recharge_threshold),
      segment_window_sec: Number(value.segment_window_sec == null ? 300 : value.segment_window_sec),
      segment_max_msgs: Number(value.segment_max_msgs == null ? 10 : value.segment_max_msgs),
      repeat_threshold: Number(value.repeat_threshold == null ? 3 : value.repeat_threshold)
    };
  }

  function changed() { return !!state.draft && JSON.stringify(state.draft) !== state.original; }

  function requestHeaders() {
    var token = sessionStorage.getItem("dc_token") || localStorage.getItem("dc_token") || localStorage.getItem("sso_token") || "";
    var headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = "Bearer " + token;
    return headers;
  }

  async function request(path, options) {
    var response = await fetch(path, Object.assign({ cache: "no-store", headers: requestHeaders() }, options || {}));
    var body = await response.json().catch(function () { return {}; });
    if (!response.ok || body.ok === false) {
      var detail = body.detail || body.message || (response.status === 401 ? "登录已过期，请重新登录" : "请求失败（" + response.status + "）");
      if (Array.isArray(detail)) detail = detail.map(function (item) { return item.msg || item.message || "提交内容不符合要求"; }).join("；");
      throw new Error(typeof detail === "string" ? detail : "请求失败（" + response.status + "）");
    }
    return body;
  }

  function levelLabel(value) { return levels.find(function (item) { return item.value === value; })?.label || "中"; }
  function levelClass(value) { return value === "high" ? "high" : value === "low" ? "low" : ""; }

  function heading(title, description, links) {
    return '<header class="page-head"><div><h1>' + title + '</h1><span class="muted">' + description + '</span></div><div class="actions">' + links + '</div></header>';
  }

  function statusMarkup() {
    return (state.error ? '<div class="error" role="alert">' + escapeHtml(state.error) + '</div>' : "") +
      (state.notice ? '<div class="success" role="status">' + escapeHtml(state.notice) + '</div>' : "");
  }

  function cardHead(title, extra) {
    return '<div class="card-head"><h2>' + title + '</h2>' + (extra || "") + '</div>';
  }

  function wordCard(title, field, description, values) {
    var rows = values.map(function (value, index) {
      var word = field === "guides" ? value[0] : value;
      return '<span class="tag">' + escapeHtml(word) + '<button type="button" aria-label="删除' + escapeHtml(word) + '" data-word-remove="' + field + ':' + index + '">×</button></span>';
    }).join("");
    return '<section class="card rule-card">' + cardHead(title, '<span class="muted">' + values.length + ' 条</span>') +
      '<div class="muted">' + description + '</div><div class="tags">' + (rows || '<span class="muted">暂无规则</span>') + '</div>' +
      '<div class="toolbar"><input data-new-word="' + field + '" maxlength="80" placeholder="' + (field === "guides" ? "如 微信、vx、绿泡泡" : field === "trade" ? "如 收、卖、代练、回收" : field === "whitelist" ? "如地图分享字段" : "如 丢弃") + '" /><button class="button" type="button" data-word-add="' + field + '">添加</button></div></section>';
  }

  function numberField(field, label, unit, min, max) {
    return '<div class="field"><label for="' + field + '">' + label + '</label><div class="toolbar"><input id="' + field + '" type="number" data-threshold="' + field + '" min="' + min + '" max="' + max + '" value="' + escapeHtml(state.draft[field]) + '" /><span class="unit">' + unit + '</span></div></div>';
  }

  function riskPage() {
    var payload = state.payload || {};
    var rules = state.draft;
    var links = '<a class="link-button" href="/risk/quality" target="_blank" rel="noopener">打开风控看板</a>';
    var html = heading("风控配置", "维护风控看板使用的关键词、判定阈值与消息聚合规则。", links) + statusMarkup();
    if (state.loading && !rules) return html + '<div class="card loading">正在读取风控规则…</div>';
    if (!rules) return html + '<div class="card"><span class="muted">暂时无法显示配置。</span><button class="button" type="button" data-action="reload">重新读取</button></div>';

    var engine = payload.engine || {};
    var priority = (engine.priority || []).map(function (key) { return (engine.types || []).find(function (item) { return item.key === key; })?.label || key; }).join(" → ");
    var engineCards = (engine.types || []).map(function (item) {
      return '<article class="card"><div class="card-head"><h2>' + escapeHtml(item.label) + '</h2><span class="level ' + levelClass(item.level) + '">' + levelLabel(item.level) + '风险</span></div>' +
        '<div><strong>判定条件：</strong>' + escapeHtml(item.rule) + '</div><p class="muted"><strong>防误判：</strong>' + escapeHtml(item.guard) + '</p></article>';
    }).join("");
    var chatRows = rules.chat.map(function (row, index) {
      var categoryOptions = categories.slice();
      if (row[1] && categoryOptions.indexOf(row[1]) < 0) categoryOptions.unshift(row[1]);
      return '<tr><td><input data-chat-index="' + index + '" data-chat-field="0" maxlength="80" value="' + escapeHtml(row[0]) + '" /></td>' +
        '<td><select data-chat-index="' + index + '" data-chat-field="1">' + categoryOptions.map(function (item) { return '<option value="' + escapeHtml(item) + '"' + (row[1] === item ? ' selected' : '') + '>' + escapeHtml(item) + '</option>'; }).join("") + '</select></td>' +
        '<td><select data-chat-index="' + index + '" data-chat-field="2">' + levels.map(function (item) { return '<option value="' + item.value + '"' + (row[2] === item.value ? ' selected' : '') + '>' + item.label + '</option>'; }).join("") + '</select></td>' +
        '<td><button class="button danger" type="button" data-chat-remove="' + index + '">删除</button></td></tr>';
    }).join("");
    var limits = payload.limits || {};
    var defaults = payload.defaults || {};

    html += '<div class="notice">保存后立即供风控看板使用；规则处理顺序与防误判条件沿用当前风控模型。</div>' +
      '<section class="card" style="margin-bottom:16px">' + cardHead("风险判定模型", '<span class="tag">' + escapeHtml(priority || "现行顺序") + '</span>') +
      '<div class="grid">' + engineCards + '</div></section>' +
      '<section class="card" style="margin-bottom:16px">' + cardHead("聊天敏感词", '<span class="muted">命中后归入对应违规类型</span>') +
      '<div class="table-wrap"><table><thead><tr><th>关键词</th><th>风险分类</th><th>风险等级</th><th>操作</th></tr></thead><tbody>' + (chatRows || '<tr><td colspan="4" class="muted">暂无规则</td></tr>') + '</tbody></table></div>' +
      '<div class="toolbar" style="margin-top:14px"><input data-new-chat maxlength="80" placeholder="关键词；多个词用 · 连接表示需同时命中" style="min-width:260px" />' +
      '<select data-new-chat-category>' + categories.map(function (item) { return '<option value="' + item + '">' + item + '</option>'; }).join("") + '</select>' +
      '<select data-new-chat-level>' + levels.map(function (item) { return '<option value="' + item.value + '">' + item.label + '</option>'; }).join("") + '</select>' +
      '<button class="button primary" type="button" data-action="add-chat">添加规则</button></div></section>' +
      '<div class="grid" style="margin-bottom:16px">' +
      '<div class="col-6">' + wordCard("引流引导词", "guides", "与像账号的字符串同时出现时命中。", rules.guides) + '</div>' +
      '<div class="col-6">' + wordCard("交易意图词", "trade", "用于交易刷屏与标价意图识别。", rules.trade) + '</div>' +
      '<div class="col-6">' + wordCard("系统消息白名单", "whitelist", "命中白名单的整段消息跳过风险判断。", rules.whitelist) + '</div>' +
      '<div class="col-6">' + wordCard("物品动作规则", "item_actions", "识别物品记录中的对应动作。", rules.item_actions) + '</div></div>' +
      '<section class="card" style="margin-bottom:16px">' + cardHead("判定阈值") + '<div class="grid">' +
      '<div class="col-4">' + numberField("ip_role_threshold", "同区服同 IP 风险角色数 ≥", "个角色", 2, 200) + '</div>' +
      '<div class="col-4">' + numberField("recharge_threshold", "低充值线 <", "元", 0, 1000000) + '</div>' +
      '<div class="col-4">' + numberField("segment_window_sec", "同角色消息聚合窗口", "秒", 30, 3600) + '</div>' +
      '<div class="col-4">' + numberField("segment_max_msgs", "每段最多合并消息", "条", 1, 100) + '</div>' +
      '<div class="col-4">' + numberField("repeat_threshold", "同段相同内容刷屏阈值 ≥", "次", 2, 20) + '</div></div></section>' +
      '<section class="card">' + cardHead("看板查询范围") + '<dl class="definition">' +
      '<dt>最大查询天数</dt><dd>' + escapeHtml(limits.max_days == null ? "—" : limits.max_days + " 天") + '</dd>' +
      '<dt>每类读取上限</dt><dd>' + escapeHtml(limits.max_records_per_source == null ? "—" : limits.max_records_per_source + " 条") + '</dd>' +
      '<dt>单页读取数</dt><dd>' + escapeHtml(limits.page_size == null ? "—" : limits.page_size + " 条") + '</dd></dl></section>' +
      '<div class="bottom-actions"><button class="button" type="button" data-action="restore"' + (defaults.chat ? "" : " disabled") + '>恢复系统默认</button>' +
      '<button class="button" type="button" data-action="reload"' + (state.saving ? " disabled" : "") + '>重新读取</button>' +
      '<button class="button primary" type="button" data-action="save"' + (!changed() || state.saving ? " disabled" : "") + '>' + (state.saving ? "保存中…" : "保存规则") + '</button></div>';
    return html;
  }

  function churnPage() {
    var links = '<a class="link-button" href="/dashboard/reuse" target="_blank" rel="noopener">打开复用看板</a>' +
      '<a class="link-button" href="/dashboard/registered-accounts" target="_blank" rel="noopener">打开代引入清单</a>';
    return heading("流失配置", "沿用复用看板当前的待复用判定口径，并关联代引入清单查看用户资料。", links) +
      '<div class="notice">当前判定沿用复用看板的统一 24 小时断登规则。</div>' +
      '<div class="grid"><section class="card col-4"><div class="stat-label">当前断登阈值</div><div class="stat">24 <span style="font-size:16px;font-weight:500">小时</span></div><p class="muted">复用看板“待复用”统计使用此统一阈值。</p></section>' +
      '<section class="card col-8">' + cardHead("待复用判定条件") + '<dl class="definition">' +
      '<dt>统计对象</dt><dd>玩家当前最后一款游戏</dd>' +
      '<dt>断登条件</dt><dd>最后登录超过 24 小时；缺少最后登录时间时，以注册时间起算</dd>' +
      '<dt>后续注册</dt><dd>没有后续游戏注册记录</dd>' +
      '<dt>统计结果</dt><dd>符合以上条件的玩家计入待复用</dd></dl></section>' +
      '<section class="card col-12">' + cardHead("关联代引入清单") + '<dl class="definition">' +
      '<dt>清单范围</dt><dd>用户池已登记的注册记录及可识别充值小号，包含活跃和不活跃记录</dd>' +
      '<dt>跨游戏识别</dt><dd>优先使用游戏账号；账号缺失时，仅使用唯一且无歧义的微信 ID 关联</dd>' +
      '<dt>角色资料</dt><dd>角色、区服、登录和充值资料按已确认的账号关系补充；缺少可靠关联时保留空值</dd>' +
      '<dt>数据范围</dt><dd>沿用当前登录账号的业务数据权限</dd></dl></section></div>';
  }

  function render() {
    root.innerHTML = mode === "risk" ? riskPage() : churnPage();
  }

  async function loadRules() {
    state.loading = true;
    state.error = "";
    state.notice = "";
    render();
    try {
      var response = await request("/api/v1/risk-dashboard/rules");
      if (!response.data || !response.data.rules) throw new Error("风控规则数据格式异常");
      state.payload = response.data;
      state.draft = normalizeRules(response.data.rules);
      state.original = JSON.stringify(state.draft);
    } catch (error) {
      state.error = error.message || "风控规则读取失败";
    } finally {
      state.loading = false;
      render();
    }
  }

  function saveRules() {
    if (!state.draft || state.saving || !changed()) return;
    state.error = "";
    state.notice = "";
    state.saving = true;
    render();
    request("/api/v1/risk-dashboard/rules", { method: "PUT", body: JSON.stringify(state.draft) })
      .then(function (response) {
        if (!response.data || !response.data.rules) throw new Error("规则保存后未返回最新配置");
        state.payload = response.data;
        state.draft = normalizeRules(response.data.rules);
        state.original = JSON.stringify(state.draft);
        state.notice = "风控规则已保存";
      })
      .catch(function (error) { state.error = error.message || "风控规则保存失败"; })
      .finally(function () { state.saving = false; render(); });
  }

  root.addEventListener("input", function (event) {
    var element = event.target;
    if (!state.draft) return;
    if (element.hasAttribute("data-chat-index")) {
      state.draft.chat[Number(element.dataset.chatIndex)][Number(element.dataset.chatField)] = element.value;
    } else if (element.hasAttribute("data-threshold")) {
      var field = element.dataset.threshold;
      state.draft[field] = element.value === "" ? 0 : Number(element.value);
    }
    var saveButton = root.querySelector('[data-action="save"]');
    if (saveButton) saveButton.disabled = !changed() || state.saving;
  });

  root.addEventListener("change", function (event) {
    var element = event.target;
    if (state.draft && element.hasAttribute("data-chat-index")) {
      state.draft.chat[Number(element.dataset.chatIndex)][Number(element.dataset.chatField)] = element.value;
      var saveButton = root.querySelector('[data-action="save"]');
      if (saveButton) saveButton.disabled = !changed() || state.saving;
    }
  });

  root.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && event.target.hasAttribute("data-new-word")) {
      event.preventDefault();
      var addButton = root.querySelector('[data-word-add="' + event.target.dataset.newWord + '"]');
      if (addButton) addButton.click();
    }
    if (event.key === "Enter" && event.target.hasAttribute("data-new-chat")) {
      event.preventDefault();
      var chatButton = root.querySelector('[data-action="add-chat"]');
      if (chatButton) chatButton.click();
    }
  });

  root.addEventListener("click", function (event) {
    var button = event.target.closest("button");
    if (!button || button.disabled) return;
    if (button.dataset.action === "reload") loadRules();
    else if (button.dataset.action === "save") saveRules();
    else if (button.dataset.action === "restore" && state.payload?.defaults) {
      state.draft = normalizeRules(state.payload.defaults);
      state.notice = "已载入系统默认规则，保存后生效";
      state.error = "";
      render();
    } else if (button.dataset.action === "add-chat") {
      var keyword = root.querySelector("[data-new-chat]").value.trim();
      if (!keyword) return;
      state.draft.chat.push([
        keyword,
        root.querySelector("[data-new-chat-category]").value,
        root.querySelector("[data-new-chat-level]").value,
      ]);
      state.notice = "";
      render();
    } else if (button.hasAttribute("data-chat-remove")) {
      state.draft.chat.splice(Number(button.dataset.chatRemove), 1);
      render();
    } else if (button.hasAttribute("data-word-add")) {
      var field = button.dataset.wordAdd;
      var input = root.querySelector('[data-new-word="' + field + '"]');
      var word = input.value.trim();
      if (!word) return;
      if (field === "guides") state.draft.guides.push([word, "引流", "medium"]);
      else state.draft[field].push(word);
      state.notice = "";
      render();
    } else if (button.hasAttribute("data-word-remove")) {
      var parts = button.dataset.wordRemove.split(":");
      var wordField = parts[0];
      var wordIndex = Number(parts[1]);
      state.draft[wordField].splice(wordIndex, 1);
      render();
    }
  });

  if (mode === "risk") loadRules();
  else render();
})();
