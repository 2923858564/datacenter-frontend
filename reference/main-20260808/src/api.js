// 数据中台 API 客户端：全部走 /api/v1/*，自动附带 JWT；401 时触发登出
let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}
async function request(path, opts = {}) {
  const token = localStorage.getItem("dc_token") || "";
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {})
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(path, {
      ...opts,
      headers,
      signal: ctrl.signal
    });
    if (res.status === 401) {
      if (onUnauthorized) onUnauthorized();
      throw new Error("登录已过期，请重新登录");
    }
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j.detail || j.message || `请求失败(${res.status})`);
    return j;
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
  // 健康/快照状态（公开）
  health: async () => (await request("/api/v1/health")).snapshot,
  // 认证
  login: (username, password) => request("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({
      username,
      password
    })
  }),
  me: async () => (await request("/api/v1/auth/me")).user,
  changePassword: password => request("/api/v1/auth/password", {
    method: "PUT",
    body: JSON.stringify({
      password
    })
  }),
  // 看板数据
  overview: async () => (await request("/api/v1/overview")).data,
  ranking: date => request("/api/v1/game-ranking" + qs({
    date
  })).then(j => j.data),
  daily: days => request("/api/v1/daily-report" + qs({
    days
  })).then(j => j.data),
  person: date => request("/api/v1/ranking/person" + qs({
    date
  })).then(j => j.data),
  channels: date => request("/api/v1/channels" + qs({
    date
  })).then(j => j.data),
  projects: date => request("/api/v1/private/projects" + qs({
    date
  })).then(j => j.data),
  // 花名册
  users: params => request("/api/v1/system/users" + qs(params)).then(j => j.data),
  createUser: body => request("/api/v1/system/users", {
    method: "POST",
    body: JSON.stringify(body)
  }),
  updateUser: (id, body) => request(`/api/v1/system/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(body)
  }),
  deleteUser: id => request(`/api/v1/system/users/${id}`, {
    method: "DELETE"
  }),
  setUserStatus: id => request(`/api/v1/system/users/${id}/status`, {
    method: "PUT"
  }),
  resetUserPassword: (id, password) => request(`/api/v1/system/users/${id}/password`, {
    method: "PUT",
    body: JSON.stringify({
      password
    })
  }),
  userRoles: id => request(`/api/v1/system/users/${id}/roles`).then(j => j.data),
  setUserRoles: (id, role_ids) => request(`/api/v1/system/users/${id}/roles`, {
    method: "PUT",
    body: JSON.stringify({
      role_ids
    })
  }),
  // 角色管理
  roles: params => request("/api/v1/system/roles" + qs(params)).then(j => j.data),
  rolesSimple: () => request("/api/v1/system/roles/simple").then(j => j.data),
  createRole: body => request("/api/v1/system/roles", {
    method: "POST",
    body: JSON.stringify(body)
  }),
  updateRole: (id, body) => request(`/api/v1/system/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(body)
  }),
  deleteRole: id => request(`/api/v1/system/roles/${id}`, {
    method: "DELETE"
  }),
  rolePermissions: id => request(`/api/v1/system/roles/${id}/permissions`).then(j => j.data),
  setRolePermissions: (id, perm_ids) => request(`/api/v1/system/roles/${id}/permissions`, {
    method: "PUT",
    body: JSON.stringify({
      perm_ids
    })
  }),
  permissionTree: () => request("/api/v1/system/permissions").then(j => j.data),
  packages: () => request("/api/v1/system/packages").then(j => j.data),
  // 审计
  auditLogs: params => request("/api/v1/system/audit-logs" + qs(params)).then(j => j.data)
};
export function buildRealMetrics(o) {
  const t = o.today,
    y = o.yesterday,
    w = o.weekAvg,
    m = o.month;
  return {
    newAcct: t.newAcct,
    newAcctY: y.newAcct,
    newAcct7: w.reg,
    payNew: t.newPayAcct,
    payNewY: y.newPayAcct,
    payNew7: null,
    payNewAmt: t.newPayAmt,
    payNewAmtY: y.newPayAmt,
    payNewAmt7: null,
    active: null,
    activeY: null,
    active7: null,
    payAcct: t.payAcct,
    payAcctY: y.payAcct,
    payAcct7: null,
    payAmt: t.payAmt,
    payAmtY: y.payAmt,
    payAmt7: w.payAmt,
    monthReg: m.reg,
    monthRegPrev: m.prevReg,
    monthRegAll: null,
    monthPay: m.payAmt,
    monthPayPrev: m.prevPay,
    monthPayAll: null
  };
}
