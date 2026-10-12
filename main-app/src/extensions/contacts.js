(function () {
  "use strict";

  var state = {
    user: null,
    accounts: [],
    selectedAccount: null,
    accountPage: 1,
    accountPageSize: 100,
    accountTotal: 0,
    accountLoading: false,
    accountError: "",
    accountCapabilities: {},
    contacts: [],
    contactTotal: null,
    contactCapabilities: {},
    page: 1,
    pageSize: 20,
    nextCursor: "",
    hasMore: false,
    contactError: "",
    loadingContacts: false,
    hasQueried: false,
    contactRequestId: 0,
    detailRequestId: 0,
    appliedContactFilters: null
  };
  function $(id) {
    return document.getElementById(id);
  }
  function token() {
    return sessionStorage.getItem("dc_token") || localStorage.getItem("dc_token") || localStorage.getItem("sso_token") || "";
  }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[character];
    });
  }
  function firstValue(object, names) {
    for (var i = 0; i < names.length; i += 1) {
      var value = object && object[names[i]];
      if (value !== undefined && value !== null && value !== "") return value;
    }
    return "";
  }
  function textValue(value) {
    return value === undefined || value === null || value === "" ? "-" : String(value);
  }
  function formatDate(value) {
    if (!value) return "-";
    var text = String(value).replace("T", " ");
    return text.length > 16 ? text.slice(0, 16) : text;
  }
  function getItems(payload, candidates) {
    for (var i = 0; i < candidates.length; i += 1) {
      if (Array.isArray(payload && payload[candidates[i]])) return payload[candidates[i]];
    }
    if (payload && payload.data && !Array.isArray(payload.data)) return getItems(payload.data, candidates);
    return Array.isArray(payload && payload.data) ? payload.data : [];
  }
  function capabilities(payload) {
    return payload && (payload.capabilities || payload.data && payload.data.capabilities) || {};
  }
  function filterCapabilities(capabilityObject) {
    return capabilityObject && (capabilityObject.filters || capabilityObject) || {};
  }
  function showNotice(message, isError) {
    var notice = $("pageNotice");
    notice.textContent = message;
    notice.classList.toggle("error", !!isError);
    notice.hidden = !message;
  }
  function setAccountStatus(message, isError) {
    var node = $("accountStatus");
    node.textContent = message;
    node.classList.toggle("visible", !!message);
    node.classList.toggle("error", !!isError);
  }
  function setTableState(message, isError) {
    var node = $("tableState");
    node.textContent = message;
    node.classList.toggle("error", !!isError);
    node.hidden = !message;
    $("contactRows").innerHTML = "";
  }
  function errorMessage(error) {
    return error && error.message ? error.message : "读取失败，请稍后重试";
  }
  function api(path, options) {
    options = options || {};
    var headers = Object.assign({
      Authorization: "Bearer " + token()
    }, options.headers || {});
    return fetch(path, Object.assign({
      cache: "no-store"
    }, options, {
      headers: headers
    })).then(function (response) {
      return response.text().then(function (raw) {
        var body = {};
        if (raw) {
          try {
            body = JSON.parse(raw);
          } catch (error) {
            if (response.ok && path.indexOf("/api/v1/address-book/") === 0) throw new Error("CRM通讯录接口尚未配置");
          }
        } else if (response.ok && path.indexOf("/api/v1/address-book/") === 0) {
          throw new Error("CRM通讯录接口尚未配置");
        }
        if (!response.ok) {
          if (response.status === 404 && path.indexOf("/api/v1/address-book/") === 0) throw new Error("CRM通讯录接口尚未配置");
          var detail = body.detail || body.message || body.error;
          throw new Error(detail ? String(detail) : "请求失败（HTTP " + response.status + "）");
        }
        return body;
      });
    });
  }
  function queryString(values) {
    var params = new URLSearchParams();
    Object.keys(values).forEach(function (key) {
      if (values[key] !== undefined && values[key] !== null && values[key] !== "") params.set(key, values[key]);
    });
    return params.toString();
  }
  function avatarMarkup(url, name, extraClass) {
    var label = String(name || "").trim();
    var fallback = escapeHtml(label ? label.slice(0, 1) : "?");
    return '<span class="avatar ' + (extraClass || "") + '">' + (url ? '<img src="' + escapeHtml(url) + '" alt="">' : fallback) + "</span>";
  }
  function accountName(account) {
    return firstValue(account, ["displayName", "accountName", "nickname", "botNickname", "botAlias", "alias", "botWxid", "wxid"]);
  }
  function accountIdentity(account) {
    return firstValue(account, ["botWxid", "wxid", "accountId", "id"]);
  }
  function accountSubtitle(account) {
    var owner = firstValue(account, ["bindUserName", "ownerName"]);
    var wechatId = firstValue(account, ["botAlias", "wechatId", "alias"]);
    if (owner && wechatId) return owner + "（" + wechatId + "）";
    return owner || wechatId || firstValue(account, ["deptName", "departmentName", "department", "projectName", "project"]) || accountIdentity(account);
  }
  function accountKey(account) {
    return String(accountIdentity(account) || accountName(account));
  }
  function accountOptionValues(name) {
    var caps = state.accountCapabilities;
    var value = caps.options && caps.options[name];
    if (!Array.isArray(value) && caps.filterOptions) value = caps.filterOptions[name];
    if (!Array.isArray(value) && name === "departments") value = caps.departmentOptions;
    return Array.isArray(value) ? value : [];
  }
  function namedProjectOptions(options) {
    return options.filter(function (item) {
      return item && typeof item === "object" && item.value !== undefined && item.value !== null && item.value !== "" && typeof item.label === "string" && item.label.trim() !== "";
    });
  }
  function populateSelect(select, title, values) {
    var current = select.value;
    select.innerHTML = '<option value="">' + escapeHtml(title) + "</option>" + values.map(function (item) {
      var value = typeof item === "object" ? firstValue(item, ["value", "id", "name", "label"]) : item;
      var label = typeof item === "object" ? firstValue(item, ["label", "name", "value"]) : item;
      return '<option value="' + escapeHtml(value) + '">' + escapeHtml(label) + "</option>";
    }).join("");
    if (Array.prototype.some.call(select.options, function (option) {
      return option.value === current;
    })) select.value = current;
  }
  function inferAccountOptions(fieldNames) {
    var values = [];
    state.accounts.forEach(function (account) {
      var value = firstValue(account, fieldNames);
      if (value && values.indexOf(value) < 0) values.push(value);
    });
    return values.sort(function (a, b) {
      return String(a).localeCompare(String(b), "zh-CN");
    });
  }
  function renderAccountFilters() {
    var filters = filterCapabilities(state.accountCapabilities);
    var projectEnabled = filters.project === true;
    var departmentEnabled = filters.department === true;
    var keywordEnabled = filters.keyword === true;
    var projectOptions = namedProjectOptions(accountOptionValues("projects"));
    var departmentOptions = accountOptionValues("departments");
    populateSelect($("projectFilter"), "全部项目", projectOptions);
    populateSelect($("departmentFilter"), "全部部门", departmentOptions.length ? departmentOptions : inferAccountOptions(["deptName", "departmentName", "department"]));
    $("projectFilter").disabled = !projectEnabled || !projectOptions.length;
    $("departmentFilter").disabled = !departmentEnabled;
    $("accountKeyword").disabled = !keywordEnabled;
    $("accountSearchButton").disabled = !keywordEnabled;
    $("projectFilter").title = projectOptions.length ? projectEnabled ? "" : "服务暂未支持项目筛选" : "暂未提供项目选项";
    $("departmentFilter").title = departmentEnabled ? "" : "服务暂未支持部门筛选";
    $("accountKeyword").title = keywordEnabled ? "" : "服务暂未支持账号搜索";
  }
  function accountMarkup(account, active) {
    var name = accountName(account);
    var avatar = firstValue(account, ["avatarUrl", "avatar", "headImage", "headImgUrl"]);
    return '<button type="button" class="account-item' + (active ? " active" : "") + '" role="option" aria-selected="' + (active ? "true" : "false") + '" data-account-key="' + escapeHtml(accountKey(account)) + '">' + '<span class="avatar-wrap">' + avatarMarkup(avatar, name) + '</span>' + '<span class="account-copy"><span class="account-name">' + escapeHtml(textValue(name)) + '</span><span class="account-subline">' + escapeHtml(textValue(accountSubtitle(account))) + "</span></span></button>";
  }
  function renderAccounts(append) {
    var list = $("accountList");
    var accounts = state.accounts;
    var selectedKey = state.selectedAccount ? accountKey(state.selectedAccount) : "";
    var html = accounts.map(function (account) {
      return accountMarkup(account, accountKey(account) === selectedKey);
    }).join("");
    if (append) list.insertAdjacentHTML("beforeend", html);else list.innerHTML = html;
    if (!accounts.length && !state.accountLoading) setAccountStatus("暂无可查看的微信账号");else if (accounts.length && !state.accountLoading) setAccountStatus("");
  }
  function accountRequestParams(page) {
    var filters = filterCapabilities(state.accountCapabilities);
    var query = {};
    if (state.accountCapabilities.pagination === true) {
      query.page = page;
      query.pageSize = state.accountPageSize;
    }
    if (filters.keyword === true) query.keyword = $("accountKeyword").value.trim();
    if (filters.project === true) query.project = $("projectFilter").value;
    if (filters.department === true) query.department = $("departmentFilter").value;
    return query;
  }
  function loadAccounts(options) {
    options = options || {};
    if (state.accountLoading) return Promise.resolve();
    state.accountLoading = true;
    state.accountError = "";
    setAccountStatus("正在读取微信账号…");
    var page = options.reset ? 1 : state.accountPage;
    var query = queryString(accountRequestParams(page));
    var url = "/api/v1/address-book/accounts" + (query ? "?" + query : "");
    return api(url).then(function (payload) {
      var items = getItems(payload, ["items", "accounts", "records", "list"]);
      var caps = capabilities(payload);
      if (options.reset) {
        state.accounts = items;
        state.accountPage = 1;
        state.accountCapabilities = caps;
      } else if (page > 1) {
        var seen = {};
        state.accounts.concat(items).forEach(function (item) {
          seen[accountKey(item)] = item;
        });
        state.accounts = Object.keys(seen).map(function (key) {
          return seen[key];
        });
        state.accountCapabilities = caps;
      } else {
        state.accounts = items;
        state.accountCapabilities = caps;
      }
      var accountData = payload.data && !Array.isArray(payload.data) ? payload.data : payload;
      state.accountTotal = Number(accountData.total != null ? accountData.total : state.accounts.length) || 0;
      if (options.reset && state.selectedAccount && !state.accounts.some(function (item) {
        return accountKey(item) === accountKey(state.selectedAccount);
      })) {
        state.selectedAccount = null;
        state.contacts = [];
        state.contactTotal = null;
        state.contactCapabilities = {};
        state.contactError = "";
      }
      state.accountPage = page;
      renderAccountFilters();
      renderAccounts(false);
      if (!state.selectedAccount && state.accounts.length) selectAccount(state.accounts[0]);else if (!state.selectedAccount) renderContacts();
      var hasMore = state.accountCapabilities.pagination === true && state.accounts.length < state.accountTotal;
      if (hasMore) state.accountPage = page + 1;
      return undefined;
    }).catch(function (error) {
      if (options.reset) state.accounts = [];
      renderAccounts(false);
      state.accountError = errorMessage(error);
      setAccountStatus(state.accountError, true);
      return undefined;
    }).then(function () {
      state.accountLoading = false;
      if (state.accounts.length) setAccountStatus("");else if (!state.accountError) setAccountStatus("暂无可查看的微信账号");
    });
  }
  function loadMoreAccounts() {
    if (state.accountCapabilities.pagination !== true || state.accountLoading || state.accounts.length >= state.accountTotal) return;
    var before = state.accounts.length;
    loadAccounts().then(function () {
      if (state.accounts.length > before) renderAccounts(false);
    });
  }
  function contactIdentity(contact) {
    return firstValue(contact, ["contactWxid", "wxid", "contactId", "id"]);
  }
  function contactWechatId(contact) {
    return firstValue(contact, ["wechatId", "alias"]);
  }
  function contactName(contact) {
    return firstValue(contact, ["remark", "crmRemark", "conRemark", "nickname", "displayName", "name"]);
  }
  function contactAvatar(contact) {
    return firstValue(contact, ["avatarUrl", "avatar", "headImage", "headImgUrl"]);
  }
  function labels(value) {
    if (Array.isArray(value)) return value.map(function (item) {
      return typeof item === "object" ? firstValue(item, ["name", "label", "tagName"]) : item;
    }).filter(Boolean);
    if (typeof value === "string") return value.split(/[，,]/).map(function (item) {
      return item.trim();
    }).filter(Boolean);
    return [];
  }
  function friendValue(contact) {
    // Legacy booleans cannot establish a verified relationship.
    return contact.friendStatus === "marked_not_friend" && contact.isFriend === false ? false : null;
  }
  function friendStatusText(contact) {
    return friendValue(contact) === false ? "已标记非好友" : "关系未确认";
  }
  function renderContact(contact) {
    var name = contactName(contact);
    var tags = labels(contact.tags || contact.personalTags || contact.tagList).slice(0, 3);
    var games = labels(contact.games || contact.gameNames || contact.gameName).slice(0, 2);
    var friend = friendValue(contact);
    var friendText = friendStatusText(contact);
    return "<tr>" + '<td class="check-cell"><input type="checkbox" aria-label="选择' + escapeHtml(textValue(name)) + '" disabled title="批量标签接口暂未配置"></td>' + '<td><div class="wechat-person">' + avatarMarkup(contactAvatar(contact), name) + '<span class="person-copy"><span class="person-name">' + escapeHtml(textValue(name)) + '</span><span class="person-subline">' + escapeHtml(textValue(firstValue(contact, ["nickname", "contactWxid", "wxid"]))) + "</span></span></div></td>" + '<td title="' + escapeHtml(contactWechatId(contact)) + '">' + escapeHtml(textValue(contactWechatId(contact))) + "</td>" + '<td class="friend-status ' + (friend === true ? "yes" : friend === false ? "no" : "") + '">' + friendText + "</td>" + "<td>-</td>" + "<td>" + escapeHtml(formatDate(firstValue(contact, ["addedTime"]))) + "</td>" + "<td>-</td>" + '<td><span class="cell-tags">' + (tags.length ? tags.map(function (tag) {
      return '<span class="cell-tag">' + escapeHtml(tag) + "</span>";
    }).join("") : "-") + "</span></td>" + "<td>" + escapeHtml(games.length ? games.join("、") : "-") + "</td>" + '<td title="' + escapeHtml(firstValue(contact, ["accountId"])) + '">' + escapeHtml(textValue(firstValue(contact, ["accountId"]))) + "</td>" + '<td><button class="cell-link" type="button" data-detail-key="' + escapeHtml(contactIdentity(contact)) + '">查看详情</button></td></tr>';
  }
  function currentPageContacts() {
    return state.contacts;
  }
  function renderPager() {
    var paginationEnabled = state.contactCapabilities.pagination === true;
    var pages = typeof state.contactTotal === "number" ? Math.max(1, Math.ceil(state.contactTotal / state.pageSize)) : null;
    $("totalText").textContent = !state.selectedAccount || state.contactTotal === null ? "待查询" : "共 " + state.contactTotal + " 条";
    $("pageText").textContent = "第 " + state.page + (pages ? " / " + pages : "") + " 页";
    $("currentPageButton").textContent = String(state.page);
    $("currentPageButton").disabled = true;
    $("currentPageButton").title = "当前页";
    $("prevPageButton").disabled = !paginationEnabled || state.page <= 1 || state.loadingContacts;
    $("nextPageButton").disabled = !paginationEnabled || !state.hasMore || state.loadingContacts;
    if (pages) $("jumpPageInput").max = String(pages);else $("jumpPageInput").removeAttribute("max");
    $("jumpPageInput").value = String(state.page);
    $("jumpPageInput").disabled = !paginationEnabled || !pages || pages <= 1 || state.loadingContacts;
    $("jumpPageButton").disabled = !paginationEnabled || !pages || pages <= 1 || state.loadingContacts;
    $("pageSizeSelect").disabled = !state.selectedAccount || !paginationEnabled || state.loadingContacts;
    $("exportButton").disabled = !currentPageContacts().length;
    $("exportButton").title = "导出当前页已加载联系人（" + currentPageContacts().length + " 条）";
  }
  function renderContacts() {
    if (state.contactError) {
      setTableState(state.contactError, true);
      renderPager();
      return;
    }
    if (!state.selectedAccount) {
      setTableState("请选择左侧微信账号");
      renderPager();
      return;
    }
    if (state.loadingContacts) {
      setTableState("正在读取联系人…");
      renderPager();
      return;
    }
    var items = currentPageContacts();
    $("contactRows").innerHTML = items.map(renderContact).join("");
    $("tableState").hidden = items.length > 0;
    $("tableState").classList.remove("error");
    $("tableState").textContent = items.length ? "" : state.hasQueried ? "暂无联系人" : "请点击查询读取联系人";
    renderPager();
  }
  function setCapabilityState() {
    var filters = filterCapabilities(state.contactCapabilities);
    var controls = {
      friendStatusFilter: {
        capability: "friendStatus",
        message: "服务暂不支持关系状态筛选"
      },
      contactKeyword: {
        capability: "keyword",
        message: "服务暂不支持联系人搜索"
      },
      customerLevelFilter: {
        capability: "customerLevel",
        message: "服务暂不支持客户层级筛选"
      },
      tagFilter: {
        capability: "tag",
        message: "服务暂不支持标签筛选"
      },
      addedFrom: {
        capability: "addedFrom",
        message: "服务暂不支持添加日期筛选"
      },
      addedTo: {
        capability: "addedTo",
        message: "服务暂不支持添加日期筛选"
      },
      newFriendFilter: {
        capability: "newFriend",
        message: "服务暂不支持新好友筛选"
      }
    };
    Object.keys(controls).forEach(function (id) {
      var enabled = filters[controls[id].capability] === true;
      $(id).disabled = !enabled || state.loadingContacts;
      $(id).title = enabled ? "" : controls[id].message;
    });
    $("contactQueryButton").disabled = !state.selectedAccount || state.loadingContacts;
    $("batchTagButton").disabled = true;
    $("batchTagButton").title = "批量标签接口暂未配置";
    $("pageSizeSelect").disabled = !state.selectedAccount || state.contactCapabilities.pagination !== true || state.loadingContacts;
  }
  function contactRequestParams() {
    var filters = filterCapabilities(state.contactCapabilities);
    var params = {
      botWxid: accountIdentity(state.selectedAccount),
      cursor: state.page <= 1 ? "" : String((state.page - 1) * state.pageSize),
      limit: Math.min(state.pageSize, 100)
    };
    if (state.appliedContactFilters) return Object.assign(params, state.appliedContactFilters);
    if (filters.friendStatus === true) params.friendStatus = $("friendStatusFilter").value;
    if (filters.keyword === true) params.keyword = $("contactKeyword").value.trim();
    if (filters.customerLevel === true) params.customerLevel = $("customerLevelFilter").value;
    if (filters.tag === true) params.tag = $("tagFilter").value;
    if (filters.addedFrom === true) params.addedFrom = $("addedFrom").value;
    if (filters.addedTo === true) params.addedTo = $("addedTo").value;
    if (filters.newFriend === true) params.isNewFriend = $("newFriendFilter").value;
    return params;
  }
  function refreshContacts() {
    if (!state.selectedAccount || state.loadingContacts) return Promise.resolve();
    state.loadingContacts = true;
    var requestId = ++state.contactRequestId;
    state.hasQueried = true;
    state.contactError = "";
    showNotice("");
    setCapabilityState();
    renderContacts();
    var params = contactRequestParams();
    state.appliedContactFilters = {};
    Object.keys(params).forEach(function (key) {
      if (key !== "botWxid" && key !== "cursor" && key !== "limit") state.appliedContactFilters[key] = params[key];
    });
    var query = queryString(params);
    return api("/api/v1/address-book/contacts" + (query ? "?" + query : "")).then(function (payload) {
      if (requestId !== state.contactRequestId) return;
      var responseData = payload.data && !Array.isArray(payload.data) ? payload.data : payload;
      state.contacts = getItems(payload, ["list", "items", "contacts", "records"]);
      state.contactTotal = responseData.total === undefined || responseData.total === null || !Number.isFinite(Number(responseData.total)) ? null : Math.max(0, Math.floor(Number(responseData.total)));
      state.contactCapabilities = capabilities(payload);
      var relation = responseData.relationshipSummary;
      if (relation) showNotice("当前返回联系人：已确认好友 " + relation.confirmedFriend + "，已标记非好友 " + relation.markedNotFriend + "，关系未确认 " + relation.unconfirmed + "。缺少独立好友核验，确认数不代表实际好友总数。");else showNotice("缺少独立好友核验，当前只判断好友关系，未确认记录不代表好友或非好友。");
      state.nextCursor = String(responseData.nextCursor || payload.nextCursor || "");
      state.hasMore = (responseData.hasMore === true || payload.hasMore === true) && !!state.nextCursor;
      if ((responseData.hasMore === true || payload.hasMore === true) && !state.nextCursor) showNotice("联系人服务未返回下一页标识，暂时无法继续读取。", true);
    }).catch(function (error) {
      if (requestId !== state.contactRequestId) return;
      state.contacts = [];
      state.contactTotal = null;
      state.hasMore = false;
      state.nextCursor = "";
      state.contactError = errorMessage(error);
      showNotice(state.contactError, true);
    }).then(function () {
      if (requestId !== state.contactRequestId) return;
      state.loadingContacts = false;
      setCapabilityState();
      renderContacts();
    });
  }
  function selectAccount(account) {
    state.selectedAccount = account;
    state.contactRequestId += 1;
    state.detailRequestId += 1;
    state.loadingContacts = false;
    state.hasQueried = false;
    state.appliedContactFilters = null;
    if ($("detailDialog").open) $("detailDialog").close();
    state.page = 1;
    state.contacts = [];
    state.contactTotal = null;
    state.contactCapabilities = {
      filters: {
        keyword: true,
        friendStatus: true
      }
    };
    state.nextCursor = "";
    state.hasMore = false;
    state.contactError = "";
    $("contactKeyword").value = "";
    $("customerLevelFilter").value = "";
    $("tagFilter").value = "";
    $("addedFrom").value = "";
    $("addedTo").value = "";
    $("newFriendFilter").value = "";
    $("friendStatusFilter").value = "";
    renderAccounts(false);
    setCapabilityState();
    renderContacts();
  }
  function accountScroll() {
    var list = $("accountList");
    if (list.scrollTop + list.clientHeight >= list.scrollHeight - 80) loadMoreAccounts();
  }
  function openDetail(identity) {
    var contact = state.contacts.filter(function (item) {
      return contactIdentity(item) === identity;
    })[0];
    if (!contact || !state.selectedAccount) return;
    var detailId = ++state.detailRequestId;
    var params = queryString({
      botWxid: accountIdentity(state.selectedAccount),
      contactWxid: contactIdentity(contact)
    });
    $("detailTitle").textContent = "联系人详情";
    $("detailSubtitle").textContent = textValue(contactName(contact));
    $("detailBody").innerHTML = '<div class="table-state">正在读取联系人详情…</div>';
    if (typeof $("detailDialog").showModal === "function") $("detailDialog").showModal();else $("detailDialog").setAttribute("open", "open");
    api("/api/v1/address-book/detail?" + params).then(function (payload) {
      if (detailId !== state.detailRequestId) return;
      var detail = payload.contact || payload.data && payload.data.contact || {};
      var hasRoles = Array.isArray(payload.roles) || !!(payload.data && Array.isArray(payload.data.roles));
      var roles = Array.isArray(payload.roles) ? payload.roles : payload.data && Array.isArray(payload.data.roles) ? payload.data.roles : [];
      renderDetail(detail, roles, hasRoles);
    }).catch(function (error) {
      if (detailId !== state.detailRequestId) return;
      $("detailBody").innerHTML = '<div class="table-state error">' + escapeHtml(errorMessage(error)) + "</div>";
    });
  }
  function detailItem(label, value) {
    return '<div class="detail-item"><dt>' + escapeHtml(label) + '</dt><dd>' + escapeHtml(textValue(value)) + "</dd></div>";
  }
  function renderDetail(contact, roles, hasRoles) {
    $("detailSubtitle").textContent = textValue(contactName(contact));
    var details = [["微信昵称", firstValue(contact, ["nickname", "displayName", "name"])], ["备注", firstValue(contact, ["remark", "remarkName"])], ["微信号", firstValue(contact, ["wechatId", "alias"])], ["联系人标识", firstValue(contact, ["contactWxid", "wxid"])], ["好友关系", friendStatusText(contact)], ["标记读取时间", formatDate(contact.friendEvidenceObservedAt)], ["关系依据", contact.friendStatusReason || "没有独立关系核验"], ["客户层级", firstValue(contact, ["customerTier"])], ["添加时间", formatDate(firstValue(contact, ["addedTime"]))], ["账号唯一ID", firstValue(contact, ["accountId"])], ["游戏", firstValue(contact, ["gameName"])], ["标签", labels(contact.tags || contact.personalTags).join("、")]];
    var roleRows = roles.map(function (role) {
      return "<tr><td>" + escapeHtml(textValue(firstValue(role, ["gameName", "game", "projectName"]))) + "</td><td>" + escapeHtml(textValue(firstValue(role, ["roleName", "name"]))) + "</td><td>" + escapeHtml(textValue(firstValue(role, ["roleId", "playerId"]))) + "</td><td>" + escapeHtml(textValue(firstValue(role, ["serverName", "server", "zoneName"]))) + "</td><td>" + escapeHtml(textValue(firstValue(role, ["level", "roleLevel"]))) + "</td></tr>";
    }).join("");
    $("detailBody").innerHTML = '<section class="detail-section"><h3>联系人信息</h3><dl class="detail-grid">' + details.map(function (item) {
      return detailItem(item[0], item[1]);
    }).join("") + '</dl></section>' + (hasRoles ? '<section class="detail-section"><h3>游戏角色（' + roles.length + '）</h3>' + (roles.length ? '<div class="table-scroll"><table class="roles-table"><thead><tr><th>游戏</th><th>角色名</th><th>角色ID</th><th>区服</th><th>等级</th></tr></thead><tbody>' + roleRows + "</tbody></table></div>" : '<div class="roles-empty">暂无游戏角色</div>') + "</section>" : '<section class="detail-section"><h3>游戏角色</h3><div class="roles-empty">游戏角色信息暂未接入</div></section>');
  }
  function csvCell(value) {
    var text = String(value == null ? "" : value);
    return '"' + text.replace(/"/g, '""') + '"';
  }
  function exportCurrentPage() {
    var items = currentPageContacts();
    if (!items.length) return;
    var columns = [["微信昵称", function (item) {
      return contactName(item);
    }], ["微信号", function (item) {
      return contactWechatId(item);
    }], ["好友关系", friendStatusText], ["性别", function () {
      return "-";
    }], ["添加时间", function (item) {
      return formatDate(firstValue(item, ["addedTime"]));
    }], ["省市", function () {
      return "-";
    }], ["标签", function (item) {
      return labels(item.tags || item.personalTags).join("、");
    }], ["游戏", function (item) {
      return textValue(firstValue(item, ["gameName"]));
    }], ["账号唯一ID", function (item) {
      return firstValue(item, ["accountId"]);
    }]];
    var lines = [columns.map(function (column) {
      return csvCell(column[0]);
    }).join(",")];
    items.forEach(function (item) {
      lines.push(columns.map(function (column) {
        return csvCell(column[1](item));
      }).join(","));
    });
    var blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8"
    });
    var link = document.createElement("a");
    var objectUrl = URL.createObjectURL(blob);
    link.href = objectUrl;
    link.download = "微信联系人-当前页-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  }
  function changePage(page) {
    page = Math.floor(Number(page));
    var pages = state.contactTotal === null ? null : Math.max(1, Math.ceil(state.contactTotal / state.pageSize));
    if (!Number.isFinite(page) || page < 1 || pages && page > pages || page === state.page || state.contactCapabilities.pagination !== true) return;
    state.page = page;
    state.hasMore = false;
    refreshContacts();
  }
  function changePageSize() {
    state.pageSize = Number($("pageSizeSelect").value) || 20;
    state.page = 1;
    state.hasMore = false;
    refreshContacts();
  }
  function refreshContactsFromFirstPage() {
    if (state.loadingContacts) return;
    state.appliedContactFilters = null;
    state.page = 1;
    state.contactTotal = null;
    state.hasMore = false;
    state.nextCursor = "";
    refreshContacts();
  }
  function bind() {
    $("accountList").addEventListener("click", function (event) {
      var button = event.target.closest(".account-item");
      if (!button) return;
      var account = state.accounts.filter(function (item) {
        return accountKey(item) === button.dataset.accountKey;
      })[0];
      if (account) selectAccount(account);
    });
    $("accountList").addEventListener("scroll", accountScroll);
    $("accountSearchButton").addEventListener("click", function () {
      loadAccounts({
        reset: true
      });
    });
    $("accountKeyword").addEventListener("keydown", function (event) {
      if (event.key === "Enter") loadAccounts({
        reset: true
      });
    });
    $("projectFilter").addEventListener("change", function () {
      loadAccounts({
        reset: true
      });
    });
    $("departmentFilter").addEventListener("change", function () {
      loadAccounts({
        reset: true
      });
    });
    $("contactRows").addEventListener("click", function (event) {
      var button = event.target.closest("[data-detail-key]");
      if (button) openDetail(button.dataset.detailKey);
    });
    $("contactQueryButton").addEventListener("click", refreshContactsFromFirstPage);
    $("contactKeyword").addEventListener("keydown", function (event) {
      if (event.key === "Enter") refreshContactsFromFirstPage();
    });
    ["customerLevelFilter", "tagFilter", "addedFrom", "addedTo", "newFriendFilter", "friendStatusFilter"].forEach(function (id) {
      $(id).addEventListener("change", function () {
        showNotice("筛选已更改，点击查询生效。");
      });
    });
    $("exportButton").addEventListener("click", exportCurrentPage);
    $("pageSizeSelect").addEventListener("change", changePageSize);
    $("prevPageButton").addEventListener("click", function () {
      changePage(state.page - 1);
    });
    $("nextPageButton").addEventListener("click", function () {
      changePage(state.page + 1);
    });
    $("jumpPageButton").addEventListener("click", function () {
      changePage(Number($("jumpPageInput").value));
    });
    $("jumpPageInput").addEventListener("keydown", function (event) {
      if (event.key === "Enter") changePage(Number(event.target.value));
    });
    $("closeDetailButton").addEventListener("click", function () {
      state.detailRequestId += 1;
      if (typeof $("detailDialog").close === "function") $("detailDialog").close();else $("detailDialog").removeAttribute("open");
    });
    $("detailDialog").addEventListener("click", function (event) {
      if (event.target === $("detailDialog")) {
        state.detailRequestId += 1;
        $("detailDialog").close();
      }
    });
  }
  function boot() {
    bind();
    if (!token()) {
      setAccountStatus("请登录后读取通讯录");
      setTableState("请登录后查看联系人");
      showNotice("请登录后读取通讯录", false);
      return;
    }
    api("/api/v1/auth/me").then(function (payload) {
      state.user = payload.user || payload;
      showNotice("");
      setAccountStatus("正在读取微信账号…");
      return loadAccounts({
        reset: true
      });
    }).catch(function (error) {
      setAccountStatus(errorMessage(error), true);
      setTableState(errorMessage(error), true);
      showNotice(errorMessage(error), true);
    });
  }
  boot();
})();
