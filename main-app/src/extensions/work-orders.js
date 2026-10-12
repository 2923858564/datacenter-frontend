(function () {
  "use strict";

  var state = {
    view: "pending",
    page: 1,
    size: 20,
    total: 0,
    user: null,
    stats: {},
    assignees: [],
    assignOrderId: null
  };
  var TYPES = {
    INTRODUCTION: "引入",
    MAINTENANCE: "维护",
    REUSE: "复用",
    AI_HANDOFF: "AI转人工"
  };
  var TYPE_CLASS = {
    INTRODUCTION: "blue",
    MAINTENANCE: "",
    REUSE: "purple"
  };
  var STATUSES = {
    PENDING: "待处理",
    ASSIGNED: "处理中",
    POOL: "公共池",
    COMPLETED: "已完成",
    CANCELLED: "已取消"
  };
  var STATUS_CLASS = {
    PENDING: "orange",
    ASSIGNED: "blue",
    POOL: "",
    COMPLETED: "green",
    CANCELLED: "red"
  };
  var ACTIONS = {
    CREATE: "创建",
    GRAB: "抢单",
    ASSIGN: "指派/改派",
    FOLLOW_UP: "处理记录",
    COMPLETE: "完成",
    TO_POOL: "转入公共池",
    CANCEL: "取消"
  };
  function $(id) {
    return document.getElementById(id);
  }
  ACTIONS.LINK_PLAYER = "关联/刷新玩家";
  function money(value) {
    return value == null ? "未知" : "¥" + Number(value).toFixed(2);
  }
  function canLink(o) {
    return hasPerm("integration:registered_accounts") && (hasPerm("workorder:assign") || hasPerm("workorder:operate") && o.assignee_id === state.user.id);
  }
  function token() {
    return sessionStorage.getItem("dc_token") || localStorage.getItem("dc_token") || localStorage.getItem("sso_token") || "";
  }
  function hasPerm(code) {
    if (!state.user) return false;
    return state.user.is_super || (state.user.perms || []).indexOf("*") >= 0 || (state.user.perms || []).indexOf(code) >= 0;
  }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[c];
    });
  }
  function fmt(value) {
    return value ? String(value).replace("T", " ").slice(0, 16) : "-";
  }
  function api(path, options) {
    options = options || {};
    var headers = Object.assign({
      Authorization: "Bearer " + token()
    }, options.headers || {});
    if (options.body) headers["Content-Type"] = "application/json";
    return fetch(path, Object.assign({}, options, {
      headers: headers
    })).then(function (res) {
      return res.json().catch(function () {
        return {};
      }).then(function (body) {
        if (!res.ok) throw new Error(body.detail || body.message || "请求失败");
        return body;
      });
    });
  }
  function showMessage(text, error) {
    var el = $("message");
    el.textContent = text;
    el.classList.toggle("error", !!error);
    el.classList.remove("hidden");
    clearTimeout(showMessage.timer);
    showMessage.timer = setTimeout(function () {
      el.classList.add("hidden");
    }, 3000);
  }
  function viewFromUrl() {
    var value = new URLSearchParams(location.search).get("view");
    return ["pending", "pool", "mine", "manage"].indexOf(value) >= 0 ? value : "pending";
  }
  function navigate(view) {
    if (window.parent !== window && typeof window.parent.__DC_WORK_ORDER_NAV__ === "function") {
      window.parent.__DC_WORK_ORDER_NAV__(view);
      return;
    }
    location.search = "?view=" + view;
  }
  function renderSummary() {
    var s = state.stats;
    $("summary").innerHTML = [["待处理", (s.PENDING || 0) + (s.ASSIGNED || 0), ""], ["公共池", s.POOL || 0, ""], ["已完成", s.COMPLETED || 0, ""], ["已超时", s.OVERDUE || 0, "alert"]].map(function (item) {
      return '<div class="summary-card ' + item[2] + '"><span>' + item[0] + '</span><strong>' + item[1] + "</strong></div>";
    }).join("");
    $("pendingCount").textContent = state.pendingCount;
    $("poolCount").textContent = s.POOL || 0;
  }
  function slaText(order) {
    if (!order.sla_deadline) return "-";
    var seconds = order.sla_remaining_seconds;
    if (seconds == null) return fmt(order.sla_deadline);
    var abs = Math.abs(seconds);
    var hours = Math.floor(abs / 3600);
    var minutes = Math.floor(abs % 3600 / 60);
    return (seconds < 0 ? "超时 " : "剩余 ") + hours + "h " + minutes + "m";
  }
  function actionHtml(order) {
    var out = ['<button data-action="detail" data-id="' + order.id + '">详情</button>'];
    if (order.order_type === "AI_HANDOFF" && order.assignee_id === state.user.id && order.status === "ASSIGNED") {
      out.push('<button data-action="conversation" data-id="' + order.id + '">打开对话</button>');
    }
    if (state.view === "pool" && (hasPerm("workorder:operate") || hasPerm("workorder:assign"))) out.push('<button data-action="grab" data-id="' + order.id + '">抢单</button>');
    if ((order.status === "PENDING" || order.status === "ASSIGNED") && (order.assignee_id === state.user.id || hasPerm("workorder:assign"))) {
      if (hasPerm("workorder:operate") || hasPerm("workorder:assign")) {
        out.push('<button data-action="follow-up" data-id="' + order.id + '">记录处理情况</button>');
        out.push('<button data-action="complete" data-id="' + order.id + '">完成</button>');
        out.push('<button data-action="pool" data-id="' + order.id + '">转入公共池</button>');
      }
    }
    if (hasPerm("workorder:assign") && order.status !== "COMPLETED" && order.status !== "CANCELLED") {
      out.push('<button data-action="assign" data-id="' + order.id + '">指派</button>');
      out.push('<button class="danger-link" data-action="cancel" data-id="' + order.id + '">取消</button>');
    }
    return out.join("");
  }
  function renderRows(orders) {
    $("orderRows").innerHTML = orders.map(function (o) {
      var player = escapeHtml(o.player_name || "-");
      var project = escapeHtml(o.project_name || "-");
      return "<tr>" + '<td><strong>' + escapeHtml(o.order_no) + '</strong><span class="subline">' + escapeHtml(o.title) + "</span></td>" + '<td><span class="tag ' + (TYPE_CLASS[o.order_type] || "") + '">' + escapeHtml(TYPES[o.order_type] || o.order_type) + "</span></td>" + '<td>' + player + '<span class="subline">' + project + '</span><span class="subline">' + escapeHtml(o.player_star + " · " + (o.grade ? o.grade + "级" : "待定级") + " · 累充 " + money(o.player_cumulative_recharge)) + "</span></td>" + '<td>' + escapeHtml(o.server_name || "-") + '<span class="subline">' + escapeHtml(o.role_id || "-") + "</span></td>" + '<td><span class="tag ' + (STATUS_CLASS[o.status] || "") + '">' + escapeHtml(STATUSES[o.status] || o.status) + "</span></td>" + '<td>' + escapeHtml(o.assignee_name || "-") + "</td>" + (state.view === "manage" ? '<td>' + escapeHtml(fmt(o.assigned_at)) + '</td><td style="overflow-wrap:anywhere">' + escapeHtml(o.processing_remark || (o.processing_at ? "未填写处理说明" : "暂无处理记录")) + '<span class="subline">' + escapeHtml(o.processing_at ? fmt(o.processing_at) : "") + "</span></td>" : "") + '<td class="sla ' + ((o.sla_remaining_seconds || 0) < 0 && ["PENDING", "ASSIGNED"].indexOf(o.status) >= 0 ? "overdue" : "") + '">' + escapeHtml(slaText(o)) + "</td>" + '<td>' + escapeHtml(fmt(o.created_at)) + "</td>" + '<td><div class="row-actions">' + actionHtml(o) + "</div></td></tr>";
    }).join("");
    $("empty").classList.toggle("hidden", orders.length > 0);
  }
  function loadStats() {
    return api("/api/v1/work-orders/stats?view=" + state.view).then(function (res) {
      state.stats = res.data || {};
      state.pendingCount = res.pending_count;
      renderSummary();
    });
  }
  function loadAssignees() {
    if (!hasPerm("workorder:assign")) return Promise.resolve();
    return api("/api/v1/work-orders/assignees").then(function (res) {
      state.assignees = res.data || [];
      var options = state.assignees.map(function (u) {
        return '<option value="' + u.id + '">' + escapeHtml(u.name) + "</option>";
      }).join("");
      $("createAssignee").innerHTML = '<option value="">公共池</option>' + options;
      $("assignAssignee").innerHTML = '<option value="">请选择</option>' + options;
    });
  }
  function loadList() {
    var params = new URLSearchParams({
      view: state.view,
      page: state.page,
      size: state.size
    });
    if ($("typeFilter").value) params.set("order_type", $("typeFilter").value);
    if ($("statusFilter").value) params.set("status", $("statusFilter").value);
    if ($("keywordFilter").value.trim()) params.set("keyword", $("keywordFilter").value.trim());
    $("orderRows").innerHTML = '<tr><td colspan="' + (state.view === "manage" ? 11 : 9) + '" class="loading">正在加载工单…</td></tr>';
    $("empty").classList.add("hidden");
    return api("/api/v1/work-orders/list?" + params).then(function (res) {
      var data = res.data || {};
      state.total = data.total || 0;
      renderRows(data.list || []);
      var pages = Math.max(1, Math.ceil(state.total / state.size));
      $("totalText").textContent = "共 " + state.total + " 条";
      $("pageText").textContent = state.page + " / " + pages;
      $("prevButton").disabled = state.page <= 1;
      $("nextButton").disabled = state.page >= pages;
    }).catch(function (err) {
      $("orderRows").innerHTML = "";
      $("empty").textContent = err.message;
      $("empty").classList.remove("hidden");
    });
  }
  function refresh() {
    return Promise.all([loadStats(), loadList()]);
  }
  function openDetail(id) {
    api("/api/v1/work-orders/" + id).then(function (res) {
      var o = res.data;
      state.detailOrder = o;
      var profile = (o.extra_info || {}).player_profile || {};
      var events = (o.events || []).map(function (event) {
        return '<div class="event"><span>' + escapeHtml(fmt(event.created_at)) + '</span><strong>' + escapeHtml(ACTIONS[event.action] || event.action) + '</strong><span>' + escapeHtml(event.operator_name + (event.remark ? "：" + event.remark : "")) + "</span></div>";
      }).join("") || '<div class="muted">暂无流转记录</div>';
      var context = '<div class="events"><h3>' + (o.order_type === "AI_HANDOFF" ? "转人工问题" : "工单描述") + '</h3><p style="white-space:pre-wrap">' + escapeHtml(o.description || "未填写") + '</p>' + (o.order_type === "AI_HANDOFF" ? '<h3>对话摘要</h3><p style="white-space:pre-wrap">' + escapeHtml((o.extra_info || {}).context_summary) + '</p>' : "") + '</div>';
      $("detailContent").innerHTML = '<div class="dialog-head"><h2>' + escapeHtml(o.order_no) + '</h2><button type="button" class="icon-button" data-close>×</button></div>' + (canLink(o) ? '<div class="detail-body"><button id="linkPlayer" class="button">关联玩家</button> ' + (profile.small_uid ? '<button id="refreshPlayer" class="button">刷新玩家资料</button>' : '') + '</div>' : '') + '<div class="detail-body"><div class="detail-grid">' + [["标题", o.title], ["工单类型", TYPES[o.order_type] || o.order_type], ["状态", STATUSES[o.status] || o.status], ["负责人", o.assignee_name || "-"], ["玩家", o.player_name || "-"], ["玩家ID", o.player_id || "-"], ["项目", o.project_name || "-"], ["区服", o.server_name || "-"], ["角色ID", o.role_id || "-"], ["SLA截止", fmt(o.sla_deadline)], ["创建人", o.creator_name], ["创建时间", fmt(o.created_at)], ["玩家账号", profile.user_name || "-"], ["平台", profile.platform || "-"], ["包体", profile.package || "-"], ["推广员账号", profile.promoter_account || "-"], ["推广员", profile.promoter || "-"], ["渠道", profile.channel || "-"], ["注册时间", fmt(profile.reg_time)], ["玩家累计充值金额", money(o.player_cumulative_recharge)], ["充值口径", profile.recharge_scope || "未关联玩家"], ["资料更新时间", fmt(profile.linked_at)], ["玩家星级", o.player_star], ["工单等级", o.grade ? o.grade + "级" : "待定级"], ["定级依据", o.grade_reason], ["指派时间", fmt(o.assigned_at)], ["完成时间", fmt(o.completed_at)], ["完成人", o.completed_by_name || "-"], ["取消原因", o.cancelled_reason || "-"]].map(function (item) {
        return '<div class="detail-item"><span>' + item[0] + '</span><strong>' + escapeHtml(item[1]) + "</strong></div>";
      }).join("") + '</div>' + context + '<div class="events"><h3>指派与处理记录</h3>' + events + '</div></div>';
      if (!$("detailDialog").open) $("detailDialog").showModal();
    }).catch(function (err) {
      showMessage(err.message, true);
    });
  }
  function linkPlayer(profile, button) {
    var id = state.detailOrder.id;
    button.disabled = true;
    api("/api/v1/work-orders/" + id + "/player", {
      method: "POST",
      body: JSON.stringify({
        platform: profile.platform,
        small_uid: profile.small_uid,
        role_id: profile.role_id
      })
    }).then(function () {
      if ($("playerDialog").open) $("playerDialog").close();
      openDetail(id);
      refresh();
      showMessage("玩家资料已关联");
    }).catch(function (err) {
      showMessage(err.message, true);
    }).finally(function () {
      button.disabled = false;
    });
  }
  function postAction(id, action, body, successText) {
    return api("/api/v1/work-orders/" + id + "/" + action, {
      method: "POST",
      body: JSON.stringify(body || {})
    }).then(function () {
      showMessage(successText);
      return refresh().then(function () {
        return true;
      });
    }).catch(function (err) {
      showMessage(err.message, true);
      return false;
    });
  }
  function openConversation(id) {
    var url = "/ai-chat.html?work_order_id=" + encodeURIComponent(id);
    var host = window.parent;
    var panel = host.document.getElementById("dc-lc-chat-panel");
    var entry = host.document.getElementById("dc-lc-chat-entry");
    if (panel && entry) {
      if (panel.style.display === "none") entry.click();
      var frame = panel.querySelector("iframe");
      if (frame) {
        frame.src = url;
        return;
      }
    }
    host.location.href = url;
  }
  function handleAction(button) {
    var id = Number(button.dataset.id),
      action = button.dataset.action;
    if (action === "detail") return openDetail(id);
    if (action === "follow-up") {
      state.followUpOrderId = id;
      $("followUpForm").reset();
      $("followUpDialog").showModal();
      return;
    }
    if (action === "conversation") return openConversation(id);
    if (action === "grab") {
      button.disabled = true;
      return api("/api/v1/work-orders/" + id + "/grab", {
        method: "POST"
      }).then(function () {
        return api("/api/v1/work-orders/" + id).then(function (res) {
          showMessage("接单成功，已转入你的待办");
          if (res.data.order_type === "AI_HANDOFF") openConversation(id);
          return refresh();
        });
      }).catch(function (err) {
        showMessage(err.message, true);
      }).finally(function () {
        button.disabled = false;
      });
    }
    if (action === "pool" && confirm("确认将该工单转入公共池？")) return postAction(id, "to-pool", {}, "已转入公共池");
    if (action === "complete") {
      var remark = prompt("请填写完成备注（可留空）", "");
      if (remark !== null) return postAction(id, "complete", {
        remark: remark
      }, "工单已完成");
    }
    if (action === "cancel") {
      var reason = prompt("请填写取消原因");
      if (reason && reason.trim()) return postAction(id, "cancel", {
        cancel_reason: reason.trim()
      }, "工单已取消");
    }
    if (action === "assign") {
      state.assignOrderId = id;
      $("assignForm").reset();
      $("assignDialog").showModal();
    }
  }
  function bind() {
    $("detailContent").addEventListener("click", function (event) {
      var o = state.detailOrder;
      if (event.target.id === "linkPlayer") {
        $("playerSearch").reset();
        $("playerSearch").elements.role_id.value = o.role_id || "";
        $("playerResults").textContent = "等待查询";
        $("playerDialog").showModal();
      }
      if (event.target.id === "refreshPlayer") linkPlayer((o.extra_info || {}).player_profile, event.target);
    });
    $("playerSearch").addEventListener("reset", function () {
      state.players = [];
      $("playerResults").textContent = "等待查询";
    });
    $("playerSearch").addEventListener("submit", function (event) {
      event.preventDefault();
      var form = new FormData(event.target),
        params = new URLSearchParams();
      form.forEach(function (value, key) {
        if (value.trim()) params.set(key, value.trim());
      });
      if (!params.toString()) {
        $("playerResults").textContent = "请填写角色ID或角色名后查询";
        return;
      }
      var button = event.target.querySelector('[type="submit"]');
      button.disabled = true;
      $("playerResults").textContent = "正在查询…";
      api("/api/v1/work-orders/players?" + params).then(function (res) {
        state.players = res.data;
        $("playerResults").innerHTML = state.players.map(function (p, index) {
          return '<div class="events"><strong>' + escapeHtml(p.role_name || p.user_name) + '</strong><p>' + escapeHtml([p.platform, p.project, p.package, p.server_name, "角色ID：" + p.role_id, "账号：" + p.user_name, "推广员：" + (p.promoter || "-"), "累计充值：" + money(p.cumulative_recharge)].join(" · ")) + '</p><button class="button" data-link-player="' + index + '">关联此玩家</button></div>';
        }).join("") || "未找到权限范围内的玩家，请核对角色ID或角色名";
        if (res.total > 50) $("playerResults").insertAdjacentHTML("afterbegin", "<p>结果超过50条，请用角色ID精确查询</p>");
      }).catch(function (err) {
        $("playerResults").textContent = err.message;
      }).finally(function () {
        button.disabled = false;
      });
    });
    $("playerResults").addEventListener("click", function (event) {
      var button = event.target.closest("[data-link-player]");
      if (button) linkPlayer(state.players[Number(button.dataset.linkPlayer)], button);
    });
    document.querySelectorAll(".tabs button").forEach(function (button) {
      button.classList.toggle("active", button.dataset.view === state.view);
      button.addEventListener("click", function () {
        navigate(button.dataset.view);
      });
    });
    $("statusFilter").classList.toggle("hidden", state.view !== "mine" && state.view !== "manage");
    $("assignedHeader").classList.toggle("hidden", state.view !== "manage");
    $("processingHeader").classList.toggle("hidden", state.view !== "manage");
    if (state.view === "manage") {
      $("pageTitle").textContent = "工单管理";
      document.title = "工单管理";
      $("orderRows").closest("table").style.minWidth = "1250px";
    }
    $("followUpForm").addEventListener("submit", function (event) {
      event.preventDefault();
      var remark = new FormData(event.target).get("remark").trim();
      if (!remark) {
        showMessage("请填写处理情况", true);
        return;
      }
      var button = event.target.querySelector('button[type="submit"]');
      button.disabled = true;
      postAction(state.followUpOrderId, "follow-up", {
        remark: remark
      }, "处理情况已记录").then(function (ok) {
        if (ok) $("followUpDialog").close();
      }).finally(function () {
        button.disabled = false;
      });
    });
    $("searchButton").addEventListener("click", function () {
      state.page = 1;
      loadList();
    });
    $("refreshButton").addEventListener("click", refresh);
    $("keywordFilter").addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        state.page = 1;
        loadList();
      }
    });
    $("prevButton").addEventListener("click", function () {
      if (state.page > 1) {
        state.page--;
        loadList();
      }
    });
    $("nextButton").addEventListener("click", function () {
      if (state.page * state.size < state.total) {
        state.page++;
        loadList();
      }
    });
    $("orderRows").addEventListener("click", function (event) {
      var button = event.target.closest("button[data-action]");
      if (button) handleAction(button);
    });
    document.addEventListener("click", function (event) {
      if (event.target.matches("[data-close]")) event.target.closest("dialog").close();
    });
    $("createButton").addEventListener("click", function () {
      $("createDialog").showModal();
    });
    $("createForm").addEventListener("submit", function (event) {
      event.preventDefault();
      var form = new FormData(event.target),
        data = {};
      form.forEach(function (value, key) {
        data[key] = value;
      });
      data.sla_hours = Number(data.sla_hours || 24);
      data.assignee_id = data.assignee_id ? Number(data.assignee_id) : null;
      if (!data.assignee_id) data.assignee_name = "";
      api("/api/v1/work-orders", {
        method: "POST",
        body: JSON.stringify(data)
      }).then(function (res) {
        $("createDialog").close();
        event.target.reset();
        showMessage("工单 " + res.data.order_no + " 已创建");
        refresh();
      }).catch(function (err) {
        showMessage(err.message, true);
      });
    });
    $("assignForm").addEventListener("submit", function (event) {
      event.preventDefault();
      var form = new FormData(event.target);
      var targetId = Number(form.get("target_user_id"));
      if (!targetId || !state.assignOrderId) return;
      postAction(state.assignOrderId, "assign", {
        target_user_id: targetId,
        reason: form.get("reason") || ""
      }, "工单已指派").then(function (ok) {
        if (ok) {
          $("assignDialog").close();
          state.assignOrderId = null;
        }
      });
    });
  }
  function boot() {
    if (!token()) {
      window.top.location.replace("/login");
      return;
    }
    state.view = viewFromUrl();
    api("/api/v1/auth/me").then(function (res) {
      state.user = res.user;
      if (!hasPerm("workorder:view")) throw new Error("无权访问工单中心");
      if (state.view === "manage" && !hasPerm("workorder:assign")) throw new Error("无权访问工单管理");
      $("manageTab").classList.toggle("hidden", !hasPerm("workorder:assign"));
      $("createButton").classList.toggle("hidden", !hasPerm("workorder:assign"));
      $("gradingLink").classList.toggle("hidden", !hasPerm("system:config"));
      bind();
      loadAssignees().then(refresh);
    }).catch(function (err) {
      $("orderRows").innerHTML = "";
      $("empty").textContent = err.message;
      $("empty").classList.remove("hidden");
    });
  }
  boot();
})();
