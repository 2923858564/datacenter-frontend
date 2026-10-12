// 数据中台 API 客户端：全部走 /api/v1/*，自动附带 JWT；401 时触发登出
let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

function readableApiError(detail, status, method) {
  if (status >= 500) {
    return method === "GET" ? `加载失败（${status}）` : `操作失败（${status}）`;
  }
  const labels = { name: "名称", code: "角色编码", level: "级别", status: "状态", data_scope: "数据范围", description: "描述" };
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map(item => readableApiError(item, status, method)).join("；");
  if (detail && typeof detail === "object") {
    const field = labels[detail.loc?.at(-1)] || detail.loc?.at(-1) || "提交内容";
    const messages = {
      string_too_short: `至少填写 ${detail.ctx?.min_length} 个字符`,
      string_too_long: `最多填写 ${detail.ctx?.max_length} 个字符`,
      missing: "不能为空", string_type: "请填写文字", int_type: "请填写整数", int_parsing: "请填写整数",
    };
    if (messages[detail.type]) return `${field}：${messages[detail.type]}`;
    if (typeof detail.msg === "string") return `${field}：${detail.msg}`;
    if (typeof detail.message === "string") return detail.message;
  }
  return method === "GET" ? `加载失败（${status}）` : `提交失败，请检查填写内容（${status}）`;
}

async function request(path, opts = {}) {
  const { timeoutMs = 15000, authenticated = true, ...fetchOptions } = opts;
  const method = (fetchOptions.method || "GET").toUpperCase();
  const token = sessionStorage.getItem("dc_token") || "";
  const headers = new Headers(fetchOptions.headers);
  if (fetchOptions.body != null && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (authenticated && token) headers.set("Authorization", `Bearer ${token}`);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(path, { ...fetchOptions, headers, signal: ctrl.signal });
    if (res.status === 401 && authenticated) {
      if (onUnauthorized && (sessionStorage.getItem("dc_token") || "") === token) onUnauthorized();
      throw Object.assign(new Error("登录已过期，请重新登录"), { status: 401 });
    }
    const text = await res.text();
    let j = {};
    try {
      if (text.trim()) j = JSON.parse(text);
    } catch {
      if (res.ok) throw new Error("服务返回数据异常，请重试");
    }
    if (!res.ok) throw Object.assign(new Error(readableApiError(j?.detail || j?.message, res.status, method)), { status: res.status });
    if (res.status === 204 || (!text.trim() && method !== "GET")) return {};
    if (!text.trim() || !j || typeof j !== "object" || Array.isArray(j)) throw new Error("服务返回数据异常，请重试");
    return j;
  } catch (error) {
    if (ctrl.signal.aborted) throw new Error("请求超时，请稍后重试");
    if (error instanceof TypeError) throw new Error("网络异常，请检查连接后重试");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function qs(params) {
  const p = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") p.set(k, v);
  });
  const s = p.toString();
  return s ? "?" + s : "";
}

export const api = {
  syncPackageConfig: async () => (await request("/api/v1/system/package-config/sync-feishu", { method: "POST", timeoutMs: 120000 })).data,
  personnelArchive: async () => (await request("/api/v1/personnel/archive")).data,
  createPersonnelArchive: (body) => request("/api/v1/personnel/archive", { method: "POST", body: JSON.stringify(body) }),
  updatePersonnelArchive: (id, body) => request(`/api/v1/personnel/archive/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(body) }),
  deletePersonnelArchive: (id) => request(`/api/v1/personnel/archive/${encodeURIComponent(id)}`, { method: "DELETE" }),
  workOrderGrading: async () => (await request("/api/v1/work-orders/grading")).data,
  saveWorkOrderGrading: async (values) => (await request("/api/v1/work-orders/grading", { method: "PUT", body: JSON.stringify(values) })).data,
  createDictionary: (values) => request("/api/v1/system/dictionary", { method: "POST", body: JSON.stringify(values) }),
  editGameServer: (gameId, serverId, changes) => request(`/api/v1/system/game-servers/${encodeURIComponent(gameId)}/${encodeURIComponent(serverId)}`, { method: "PATCH", body: JSON.stringify(changes) }),
  gameServers: async (params) => (await request("/api/v1/system/game-servers" + qs(params))).data,
  dictionary: async () => (await request("/api/v1/system/dictionary")).data,
  editDictionary: async (id, changes) => (await request(`/api/v1/system/dictionary/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(changes) })).data,
  // 健康/快照状态（公开）
  health: async () => (await request("/api/v1/health")).snapshot,

  // 认证
  login: (username, password) =>
    request("/api/v1/auth/login", { method: "POST", authenticated: false, body: JSON.stringify({ username, password }) }).then((j) => {
      if (typeof j.token !== "string" || !j.token || !j.user || typeof j.user !== "object" || Array.isArray(j.user)) throw new Error("服务返回登录数据异常，请重试");
      return j;
    }),
  logout: () => request("/api/v1/auth/logout", { method: "POST" }),
  me: async () => {
    const j = await request("/api/v1/auth/me");
    if (!j.user || typeof j.user !== "object" || Array.isArray(j.user)) throw new Error("服务返回身份数据异常，请重试");
    return j.user;
  },
  changePassword: (currentPassword, newPassword) =>
    request("/api/v1/auth/password", {
      method: "PUT",
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    }),

  // 看板数据
  overview: async () => (await request("/api/v1/overview")).data,
  ranking: (date) => request("/api/v1/game-ranking" + qs({ date })).then((j) => j.data),
  daily: (days) => request("/api/v1/daily-report" + qs({ days })).then((j) => j.data),
  person: (date) => request("/api/v1/ranking/person" + qs({ date })).then((j) => j.data),
  channels: (date) => request("/api/v1/channels" + qs({ date })).then((j) => j.data),
  projects: (date) => request("/api/v1/private/projects" + qs({ date })).then((j) => j.data),

  // 花名册
  users: (params) => request("/api/v1/system/users" + qs({ ...params, _ts: Date.now() })).then((j) => {
    const data = j.data;
    if (!data || !Array.isArray(data.list) || !Number.isInteger(data.total) || data.total < 0 || data.list.some((row) => !row || typeof row !== "object" || Array.isArray(row))) throw new Error("服务返回花名册数据异常，请重试");
    return data;
  }),
  peopleOptions: () => request("/api/v1/system/user-options/people").then((j) => j.data),
  createUser: (body) => request("/api/v1/system/users", { method: "POST", body: JSON.stringify(body) }),
  updateUser: (id, body) =>
    request(`/api/v1/system/users/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteUser: (id) => request(`/api/v1/system/users/${id}`, { method: "DELETE" }),
  setUserStatus: (id) => request(`/api/v1/system/users/${id}/status`, { method: "PUT" }).then((j) => {
    if (j.data?.status !== 0 && j.data?.status !== 1) throw new Error("服务返回账号状态异常，请刷新列表后重试");
    return j.data;
  }),
  resetUserPassword: (id, password) =>
    request(`/api/v1/system/users/${id}/password`, { method: "PUT", body: JSON.stringify({ password }) }),
  userPassword: (id) => request(`/api/v1/system/users/${id}/password`).then((j) => j.data),
  userRoles: (id) => request(`/api/v1/system/users/${id}/roles`).then((j) => j.data),
  setUserRoles: (id, role_ids) =>
    request(`/api/v1/system/users/${id}/roles`, { method: "PUT", body: JSON.stringify({ role_ids }) }),

  // 角色管理
  roles: (params) => request("/api/v1/system/roles" + qs(params)).then((j) => j.data),
  rolesSimple: () => request("/api/v1/system/roles/simple").then((j) => j.data),
  createRole: (body) => request("/api/v1/system/roles", { method: "POST", body: JSON.stringify(body) }),
  updateRole: (id, body) =>
    request(`/api/v1/system/roles/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteRole: (id) => request(`/api/v1/system/roles/${id}`, { method: "DELETE" }),
  rolePermissions: (id) => request(`/api/v1/system/roles/${id}/permissions`).then((j) => j.data),
  setRolePermissions: (id, perm_ids) =>
    request(`/api/v1/system/roles/${id}/permissions`, { method: "PUT", body: JSON.stringify({ perm_ids }) }),
  permissionTree: () => request("/api/v1/system/permissions").then((j) => j.data),
  packages: () => request("/api/v1/system/packages").then((j) => j.data),
  packageConfigProjects: (scope_type) =>
    request("/api/v1/system/package-config/projects" + qs({ scope_type })).then((j) => j.data),
  packageConfigProjectCatalog: (q = "") =>
    request("/api/v1/system/package-config/catalog/projects" + qs({ q })).then((j) => j.data),
  packageConfigPackageCatalog: (project, q = "") =>
    request("/api/v1/system/package-config/catalog/packages" + qs({ project, q })).then((j) => j.data),
  searchPackageConfig: (scope_type, q) =>
    request("/api/v1/system/package-config/search" + qs({ scope_type, q })).then((j) => j.data),
  createPackageProject: (body) =>
    request("/api/v1/system/package-config/projects", { method: "POST", body: JSON.stringify(body) }).then((j) => j.data),
  updatePackageProject: (id, body) =>
    request(`/api/v1/system/package-config/projects/${id}`, { method: "PUT", body: JSON.stringify(body) }).then((j) => j.data),
  updatePackageProjectMode: (id, mode) =>
    request(`/api/v1/system/package-config/projects/${id}/mode`, {
      method: "PUT", body: JSON.stringify({ mode }),
    }).then((j) => j.data),
  restorePackageProjectDefault: (id) =>
    request(`/api/v1/system/package-config/projects/${id}/restore-default`, { method: "POST" }).then((j) => j.data),
  deletePackageProject: (id) => request(`/api/v1/system/package-config/projects/${id}`, { method: "DELETE" }),
  packageConfigPeople: () => request("/api/v1/system/package-config/people").then((j) => j.data),
  packageConfigPackages: (project_id) =>
    request(`/api/v1/system/package-config/projects/${project_id}/packages`).then((j) => j.data),
  createPackageItem: (body) =>
    request("/api/v1/system/package-config/packages", { method: "POST", body: JSON.stringify(body) }).then((j) => j.data),
  updatePackageItem: (id, body) =>
    request(`/api/v1/system/package-config/packages/${id}`, { method: "PUT", body: JSON.stringify(body) }).then((j) => j.data),
  deletePackageItem: (id) => request(`/api/v1/system/package-config/packages/${id}`, { method: "DELETE" }),
  packageConfigAccounts: (project_id) =>
    request("/api/v1/system/package-config/accounts" + qs({ project_id })).then((j) => j.data),
  createPackageAccount: (body) =>
    request("/api/v1/system/package-config/accounts", { method: "POST", body: JSON.stringify(body) }).then((j) => j.data),
  updatePackageAccount: (id, body) =>
    request(`/api/v1/system/package-config/accounts/${id}`, { method: "PUT", body: JSON.stringify(body) }).then((j) => j.data),
  deletePackageAccount: (id) => request(`/api/v1/system/package-config/accounts/${id}`, { method: "DELETE" }),
  packageConfigChannels: () =>
    request("/api/v1/system/package-config/channels").then((j) => j.data),
  searchPackageConfigChannels: (q) =>
    request("/api/v1/system/package-config/channels/search" + qs({ q })).then((j) => j.data),
  createPackageChannel: (body) =>
    request("/api/v1/system/package-config/channels", { method: "POST", body: JSON.stringify(body) }).then((j) => j.data),
  updatePackageChannel: (id, body) =>
    request(`/api/v1/system/package-config/channels/${id}`, { method: "PUT", body: JSON.stringify(body) }).then((j) => j.data),
  deletePackageChannel: (id) => request(`/api/v1/system/package-config/channels/${id}`, { method: "DELETE" }),
  packageConfigChannelProjects: (channel_id) =>
    request(`/api/v1/system/package-config/channels/${channel_id}/projects`).then((j) => j.data),
  createPackageChannelProject: (body) =>
    request("/api/v1/system/package-config/channel-projects", { method: "POST", body: JSON.stringify(body) }).then((j) => j.data),
  updatePackageChannelProject: (id, body) =>
    request(`/api/v1/system/package-config/channel-projects/${id}`, { method: "PUT", body: JSON.stringify(body) }).then((j) => j.data),
  updatePackageChannelProjectMode: (id, mode) =>
    request(`/api/v1/system/package-config/channel-projects/${id}/mode`, {
      method: "PUT", body: JSON.stringify({ mode }),
    }).then((j) => j.data),
  restorePackageChannelProjectDefault: (id) =>
    request(`/api/v1/system/package-config/channel-projects/${id}/restore-default`, { method: "POST" }).then((j) => j.data),
  deletePackageChannelProject: (id) =>
    request(`/api/v1/system/package-config/channel-projects/${id}`, { method: "DELETE" }),
  packageConfigChannelPackages: (project_id) =>
    request(`/api/v1/system/package-config/channel-projects/${project_id}/packages`).then((j) => j.data),
  createPackageChannelItem: (body) =>
    request("/api/v1/system/package-config/channel-packages", { method: "POST", body: JSON.stringify(body) }).then((j) => j.data),
  updatePackageChannelItem: (id, body) =>
    request(`/api/v1/system/package-config/channel-packages/${id}`, { method: "PUT", body: JSON.stringify(body) }).then((j) => j.data),
  deletePackageChannelItem: (id) =>
    request(`/api/v1/system/package-config/channel-packages/${id}`, { method: "DELETE" }),
  packageConfigChannelAccounts: (channel_project_id) =>
    request("/api/v1/system/package-config/channel-accounts" + qs({ channel_project_id })).then((j) => j.data),
  createPackageChannelAccount: (body) =>
    request("/api/v1/system/package-config/channel-accounts", { method: "POST", body: JSON.stringify(body) }).then((j) => j.data),
  updatePackageChannelAccount: (id, body) =>
    request(`/api/v1/system/package-config/channel-accounts/${id}`, { method: "PUT", body: JSON.stringify(body) }).then((j) => j.data),
  deletePackageChannelAccount: (id) =>
    request(`/api/v1/system/package-config/channel-accounts/${id}`, { method: "DELETE" }),

  // 审计
  auditLogs: (params) => request("/api/v1/system/audit-logs" + qs(params)).then((j) => j.data),
};

export function buildRealMetrics(o) {
  const t = o.today, y = o.yesterday, w = o.weekAvg, m = o.month;
  return {
    newAcct: t.newAcct, newAcctY: y.newAcct, newAcct7: w.reg,
    payNew: t.newPayAcct, payNewY: y.newPayAcct, payNew7: null,
    payNewAmt: t.newPayAmt, payNewAmtY: y.newPayAmt, payNewAmt7: null,
    active: null, activeY: null, active7: null,
    payAcct: t.payAcct, payAcctY: y.payAcct, payAcct7: null,
    payAmt: t.payAmt, payAmtY: y.payAmt, payAmt7: w.payAmt,
    monthReg: m.reg, monthRegPrev: m.prevReg, monthRegAll: null,
    monthPay: m.payAmt, monthPayPrev: m.prevPay, monthPayAll: null,
  };
}
