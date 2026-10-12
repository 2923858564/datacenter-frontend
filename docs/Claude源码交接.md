# Claude 源码交接

管理端请求层已有 15 秒超时与 401 处理；花名册通过请求序号只接收最新结果；系统管理入口已有 React.lazy。先阅读实现，再确定实际优化缺口。主站重建源码入口见 [源码索引](源码索引.md)。

## system-console/src/api.js

```js
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
```

## system-console/src/store.jsx

```jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { api, setUnauthorizedHandler } from "./api.js";

const SUB_FACTOR = 1;

const AuthContext = createContext(null);

function readUser() {
  if (!sessionStorage.getItem("dc_token")) return null;
  try {
    return JSON.parse(sessionStorage.getItem("dc_user") || "null");
  } catch {
    return null;
  }
}

export function ProtoProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem("dc_token") || "");
  const [user, setUser] = useState(readUser);
  const [ready, setReady] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authAttempt, setAuthAttempt] = useState(0);
  const [pkg, setPkg] = useState("whole");
  const [dateMode, setDateMode] = useState("today");

  useEffect(() => {
    setUnauthorizedHandler(() => {
      sessionStorage.removeItem("dc_token");
      sessionStorage.removeItem("dc_user");
      setToken("");
      setUser(null);
      setAuthError("");
    });
  }, []);

  useEffect(() => {
    let active = true;
    setAuthError("");
    if (!token) {
      setReady(true);
      return;
    }
    setReady(false);
    api
      .me()
      .then((u) => {
        if (!active) return;
        setUser(u);
        sessionStorage.setItem("dc_user", JSON.stringify(u));
        window.dispatchEvent(new CustomEvent("dc:identity-ready", { detail: u }));
      })
      .catch((error) => {
        if (!active || error.status === 401) return;
        setAuthError(error.message || "身份验证失败，请重试");
      })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, [token, authAttempt]);

  const login = async (username, password) => {
    const res = await api.login(username, password);
    localStorage.removeItem("dc_token");
    localStorage.removeItem("dc_user");
    sessionStorage.setItem("dc_token", res.token);
    sessionStorage.setItem("dc_user", JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // 服务端不可达时仍清理本标签页；会话会在过期后自然失效。
    }
    sessionStorage.removeItem("dc_token");
    sessionStorage.removeItem("dc_user");
    localStorage.removeItem("dc_token");
    localStorage.removeItem("dc_user");
    setToken("");
    setUser(null);
  };

  const hasPerm = (code) =>
    !!user && (user.is_super || (user.perms || []).includes("*") || (user.perms || []).includes(code));
  const hasAny = (codes) => !!user && codes.some(hasPerm);

  const role = user
    ? {
        id: (user.roles && user.roles[0] ? user.roles[0].code : "user").toLowerCase(),
        name: user.roles && user.roles[0] ? user.roles[0].name : user.name,
        scope: user.scope,
        pkg: user.scope === "all",
      }
    : null;
  const canPkg = !!role && role.pkg;
  const isSub = !canPkg || pkg === "sub";
  const scale = isSub ? SUB_FACTOR : 1;

  return (
    <AuthContext.Provider
      value={{
        token, user, ready, authError, retryAuth: () => setAuthAttempt((value) => value + 1), login, logout, hasPerm, hasAny,
        role, pkg, setPkg, dateMode, setDateMode, canPkg, isSub, scale,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useProto() {
  return useContext(AuthContext);
}
```

## system-console/vite.config.js

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), {
    name: "console-route-entry",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const pathname = (req.url || "/").split("?")[0];
        if (pathname === "/login" || pathname === "/admin" || pathname.startsWith("/admin/")) {
          req.url = "/system.html";
        }
        next();
      });
    },
  }],
  base: "/",
  server: {
    host: "127.0.0.1", port: 8399,
    proxy: process.env.DC_API_TARGET ? {
      "/api/": { target: process.env.DC_API_TARGET, changeOrigin: true },
    } : undefined,
  },
  build: {
    rollupOptions: {
      input: "system.html",
    },
  },
});

```

## system-console/vite.dictionary.config.js

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: "dist-dictionary",
    lib: { entry: "src/dictionary-entry.jsx", formats: ["es"], fileName: () => "system-dictionary-20260911.js" },
  },
});

```

## system-console/src/pages/SystemUsers.jsx

```jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button, Card, Form, Input, Modal, Popconfirm, Segmented, Select, Space, Switch, Table, Tag, message,
} from "antd";
import { api } from "../api.js";
import { useProto } from "../store.jsx";

function randPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  let s = "";
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)];
  if (!/\d/.test(s)) s = s.slice(0, -1) + "9";
  if (!/[A-Za-z]/.test(s)) s = s.slice(0, -1) + "a";
  return s;
}

const SCOPE_LABEL = { all: "整包（全量）", sub: "分包（受限）" };

export default function SystemUsers() {
  const { hasPerm, user } = useProto();
  const [data, setData] = useState({ list: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [roleOptions, setRoleOptions] = useState([]);
  const [peopleOptions, setPeopleOptions] = useState([]);
  const listRequestId = useRef(0);
  const statusRequests = useRef(new Set());
  const [pendingStatus, setPendingStatus] = useState(new Set());

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const scopeMode = Form.useWatch("scope_mode", form);

  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdUser, setPwdUser] = useState(null);
  const [pwdValue, setPwdValue] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdResetDone, setPwdResetDone] = useState(false);
  const [currentPwdValue, setCurrentPwdValue] = useState("");
  const [currentPwdLoaded, setCurrentPwdLoaded] = useState(false);
  const [currentPwdVisible, setCurrentPwdVisible] = useState(false);
  const [currentPwdLoading, setCurrentPwdLoading] = useState(false);
  const [currentPwdUnavailable, setCurrentPwdUnavailable] = useState(false);

  const load = useCallback(async (quiet = false) => {
    const requestId = ++listRequestId.current;
    if (!quiet) setLoading(true);
    try {
      const d = await api.users({
        page, size,
        keyword: keyword || undefined,
        status: statusFilter === "" ? undefined : Number(statusFilter),
        role_id: roleFilter === "" ? undefined : Number(roleFilter),
      });
      if (requestId === listRequestId.current) {
        const lastPage = Math.max(1, Math.ceil(d.total / size));
        if (page > lastPage) setPage(lastPage);
        setData(d);
      }
    } catch (e) {
      if (requestId === listRequestId.current) message.error(e.message);
    } finally {
      if (requestId === listRequestId.current) setLoading(false);
    }
  }, [page, size, keyword, statusFilter, roleFilter]);

  useEffect(() => {
    load();
    return () => { listRequestId.current += 1; };
  }, [load]);

  useEffect(() => {
    if (hasPerm("system:user:list") || hasPerm("system:role:list")) {
      api.rolesSimple().then(setRoleOptions).catch(() => {});
      api.peopleOptions().then((p) => setPeopleOptions(p.map((x) => ({ value: x, label: x })))).catch(() => {});
    }
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue({
      username: "", name: "", employee_no: "", mobile: "", email: "",
      position: "", entry_date: "", status: 1, scope_mode: "sub", people_scope: [], role_ids: [], password: "",
    });
    setEditOpen(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    form.setFieldsValue({
      username: r.username, name: r.name, employee_no: r.employee_no, mobile: r.mobile,
      email: r.email, position: r.position, entry_date: r.entry_date || "",
      status: r.status, scope_mode: r.is_super ? "all" : (r.scope_mode || r.scope || "sub"), people_scope: r.people_scope || [],
      role_ids: (r.roles || []).map((x) => x.id),
      password: "",
    });
    setEditOpen(true);
  };

  const saveUser = async () => {
    const v = await form.validateFields();
    setSaving(true);
    let profileSaved = false;
    try {
      if (editing) {
        await api.updateUser(editing.id, {
          name: v.name, employee_no: v.employee_no, mobile: v.mobile, email: v.email,
          position: v.position, entry_date: v.entry_date || "", status: v.status,
          scope_mode: v.scope_mode, people_scope: v.people_scope || [],
        });
        profileSaved = true;
        const previousRoleIds = (editing.roles || []).map((x) => x.id).sort((a, b) => a - b);
        const nextRoleIds = (v.role_ids || []).slice().sort((a, b) => a - b);
        if (hasPerm("system:user:role") && previousRoleIds.join(",") !== nextRoleIds.join(",")) {
          await api.setUserRoles(editing.id, nextRoleIds);
        }
        setData((current) => ({
          ...current,
          list: current.list.map((item) => item.id === editing.id ? {
            ...item,
            name: v.name, employee_no: v.employee_no, mobile: v.mobile, email: v.email,
            position: v.position, entry_date: v.entry_date || "", status: v.status,
            scope: v.scope_mode, scope_mode: v.scope_mode, people_scope: v.people_scope || [],
            roles: hasPerm("system:user:role")
              ? roleOptions.filter((role) => nextRoleIds.includes(role.id)) : item.roles,
          } : item),
        }));
        message.success("已保存");
      } else {
        await api.createUser({
          username: v.username, password: v.password, name: v.name,
          employee_no: v.employee_no, mobile: v.mobile, email: v.email,
          position: v.position, entry_date: v.entry_date || "", status: v.status,
          scope_mode: v.scope_mode, people_scope: v.people_scope || [], role_ids: v.role_ids || [],
        });
        message.success("员工已创建");
      }
      setEditOpen(false);
      load(!!editing);
    } catch (e) {
      message.error(profileSaved ? `资料已保存，角色保存失败：${e.message}` : e.message);
      if (profileSaved) await load(true);
    } finally {
      setSaving(false);
    }
  };

  const openPwd = (r) => {
    setPwdUser(r);
    setPwdValue(randPassword());
    setPwdResetDone(false);
    setCurrentPwdValue("");
    setCurrentPwdLoaded(false);
    setCurrentPwdVisible(false);
    setCurrentPwdLoading(false);
    setCurrentPwdUnavailable(false);
    setPwdOpen(true);
  };

  const closePwd = () => {
    setPwdOpen(false);
    setPwdUser(null);
    setPwdValue("");
    setPwdResetDone(false);
    setCurrentPwdValue("");
    setCurrentPwdLoaded(false);
    setCurrentPwdVisible(false);
    setCurrentPwdLoading(false);
    setCurrentPwdUnavailable(false);
  };

  const revealCurrentPwd = async (visible) => {
    if (!visible) {
      setCurrentPwdVisible(false);
      return;
    }
    if (currentPwdLoaded) {
      setCurrentPwdVisible(true);
      return;
    }
    setCurrentPwdLoading(true);
    try {
      const result = await api.userPassword(pwdUser.id);
      if (!result.available) {
        setCurrentPwdUnavailable(true);
        message.warning("该账号的历史密码未记录，请先重新登录或重置一次");
        return;
      }
      setCurrentPwdValue(result.password);
      setCurrentPwdLoaded(true);
      setCurrentPwdVisible(true);
    } catch (e) {
      message.error(e.message);
    } finally {
      setCurrentPwdLoading(false);
    }
  };

  const savePwd = async () => {
    setPwdSaving(true);
    try {
      await api.resetUserPassword(pwdUser.id, pwdValue);
      message.success("密码已重置");
      setPwdResetDone(true);
      setCurrentPwdValue(pwdValue);
      setCurrentPwdLoaded(true);
      setCurrentPwdVisible(false);
      setCurrentPwdUnavailable(false);
    } catch (e) {
      message.error(e.message);
    } finally {
      setPwdSaving(false);
    }
  };

  const toggleStatus = async (r) => {
    if (statusRequests.current.has(r.id)) return;
    statusRequests.current.add(r.id);
    setPendingStatus(new Set(statusRequests.current));
    try {
      const d = await api.setUserStatus(r.id);
      setData((current) => ({ ...current, list: current.list.map((item) => item.id === r.id ? { ...item, status: d.status } : item) }));
      message.success(d.status === 1 ? "已启用" : "已停用");
      await load();
    } catch (e) {
      message.error(e.message);
    } finally {
      statusRequests.current.delete(r.id);
      setPendingStatus(new Set(statusRequests.current));
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "姓名 / 账号",
        width: 180,
        render: (_, r) => (
          <div>
            <div style={{ fontWeight: 600 }}>{r.name || "-"}</div>
            <div style={{ color: "#86909c", fontSize: 12 }}>{r.username}</div>
          </div>
        ),
      },
      { title: "工号", dataIndex: "employee_no", width: 100, render: (v) => v || "-" },
      { title: "手机号", dataIndex: "mobile", width: 120, render: (v) => v || "-" },
      {
        title: "角色",
        key: "role",
        width: 180,
        filters: roleOptions.map((role) => ({ text: role.name, value: role.id })),
        filterMultiple: false,
        filteredValue: roleFilter === "" ? null : [roleFilter],
        render: (_, r) => (
          <Space size={4} wrap>
            {(r.roles || []).map((x) => (
              <Tag key={x.id} color="blue">{x.name}</Tag>
            ))}
            {!(r.roles || []).length && "-"}
          </Space>
        ),
      },
      {
        title: "数据范围",
        width: 110,
        render: (_, r) => (
          <Tag color={r.scope === "all" ? "green" : "orange"}>{SCOPE_LABEL[r.scope] || r.scope}</Tag>
        ),
      },
      {
        title: "包体数据范围",
        width: 180,
        render: (_, r) => (
          <Tag color={r.scope === "all" ? "green" : "blue"}>
            {r.scope === "all" ? "全部" : "由包体配置管理"}
          </Tag>
        ),
      },
      {
        title: "人员数据范围",
        width: 190,
        render: (_, r) => (
          peopleOptions.length > 0 &&
          (r.people_scope || []).length === peopleOptions.length &&
          peopleOptions.every((option) => (r.people_scope || []).includes(option.value))
            ? <span>全部人员</span>
            : (
              <Space size={2} wrap>
                {(r.people_scope || []).slice(0, 4).map((p) => <Tag key={p} color="purple">{p}</Tag>)}
                {(r.people_scope || []).length === 0 && <span style={{ color: "#86909c" }}>默认仅本人</span>}
              </Space>
            )
        ),
      },
      {
        title: "状态",
        width: 90,
        render: (_, r) => (
          <Switch
            aria-label={`${r.name || r.username}的账号状态`}
            loading={pendingStatus.has(r.id)}
            size="small"
            checked={r.status === 1}
            disabled={pendingStatus.has(r.id) || !hasPerm("system:user:update") || r.id === user?.id}
            checkedChildren="启用"
            unCheckedChildren="停用"
            onChange={() => toggleStatus(r)}
          />
        ),
      },
      { title: "最近登录", dataIndex: "last_login", width: 150, render: (v) => (v ? v.replace("T", " ").slice(0, 16) : "-") },
      {
        title: "操作",
        width: 180,
        fixed: "right",
        render: (_, r) => (
          <Space size={0}>
            {hasPerm("system:user:update") && (
              <Button aria-label={`编辑${r.name || r.username}`} type="link" size="small" onClick={() => openEdit(r)}>编辑</Button>
            )}
            {hasPerm("system:user:resetpwd") && (
              <Button aria-label={`重置${r.name || r.username}的密码`} type="link" size="small" onClick={() => openPwd(r)}>重置密码</Button>
            )}
            {hasPerm("system:user:delete") && !r.is_super && r.id !== user?.id && (
              <Popconfirm title="确定删除该员工？" onConfirm={async () => {
                try {
                  await api.deleteUser(r.id);
                  setData((current) => ({
                    ...current,
                    list: current.list.filter((item) => item.id !== r.id),
                    total: Math.max(0, current.total - 1),
                  }));
                  message.success("已删除");
                  await load();
                } catch (e) {
                  message.error(e.message);
                }
              }}>
                <Button aria-label={`删除${r.name || r.username}`} type="link" size="small" danger>删除</Button>
              </Popconfirm>
            )}
          </Space>
        ),
      },
    ],
    [hasPerm, user, load, roleOptions, roleFilter, peopleOptions, pendingStatus]
  );

  return (
    <Card size="small" title="花名册" extra={
      <Space>
        <span style={{ color: "#86909c", fontSize: 12 }}>共 {data.total} 人</span>
        {hasPerm("system:user:create") && (
          <Button type="primary" size="small" onClick={openCreate}>新增员工</Button>
        )}
      </Space>
    }>
      <Space style={{ marginBottom: 12 }} wrap>
        <Input.Search
          placeholder="搜索姓名/账号/工号/手机号"
          allowClear
          style={{ width: 240 }}
          onSearch={(v) => { setPage(1); setKeyword(v); }}
          onChange={(e) => { if (!e.target.value) { setPage(1); setKeyword(""); } }}
        />
        <Select
          allowClear
          placeholder="状态"
          style={{ width: 110 }}
          value={statusFilter === "" ? undefined : statusFilter}
          onChange={(v) => { setPage(1); setStatusFilter(v ?? ""); }}
          options={[{ value: 1, label: "启用" }, { value: 0, label: "停用" }]}
        />
      </Space>
      <Table
        size="small"
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data.list}
        scroll={{ x: 1480 }}
        onChange={(_, filters, __, extra) => {
          if (extra.action === "filter") {
            setPage(1);
            setRoleFilter(filters.role?.[0] ?? "");
          }
        }}
        pagination={{
          current: page, pageSize: size, total: data.total, showSizeChanger: true, showTotal: (t) => `共 ${t} 条`,
          onChange: (p, s) => { setPage(p); setSize(s); },
        }}
      />

      <Modal
        title={editing ? "编辑员工" : "新增员工"}
        open={editOpen}
        width={680}
        onOk={saveUser}
        confirmLoading={saving}
        onCancel={() => setEditOpen(false)}
      >
        <Form form={form} layout="vertical" initialValues={{ status: 1, scope_mode: "sub", people_scope: [], role_ids: [] }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "0 16px" }}>
            <Form.Item label="姓名" name="name" rules={[{ required: true, message: "请输入姓名" }]}>
              <Input placeholder="真实姓名" />
            </Form.Item>
            <Form.Item label="登录账号" name="username" rules={[{ required: true, message: "请输入登录账号" }]}>
              <Input placeholder="登录账号" disabled={!!editing} />
            </Form.Item>
            <Form.Item label="工号" name="employee_no">
              <Input placeholder="员工编号" />
            </Form.Item>
            <Form.Item label="手机号" name="mobile">
              <Input placeholder="11位手机号" />
            </Form.Item>
            <Form.Item label="邮箱" name="email">
              <Input placeholder="电子邮箱" />
            </Form.Item>
            <Form.Item label="岗位" name="position">
              <Input placeholder="岗位名称" />
            </Form.Item>
            <Form.Item label="入职日期" name="entry_date">
              <Input placeholder="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item label="状态" name="status">
              <Select options={[{ value: 1, label: "启用" }, { value: 0, label: "停用" }]} />
            </Form.Item>
            <Form.Item label="角色" name="role_ids">
              <Select
                mode="multiple"
                placeholder="选择角色"
                disabled={!!editing && !hasPerm("system:user:role")}
                options={roleOptions.map((r) => ({ value: r.id, label: r.name }))}
              />
            </Form.Item>
          </div>
          <Form.Item label="数据范围" name="scope_mode">
            <Segmented
              block
              options={[{ value: "all", label: "整包（全量）" }, { value: "sub", label: "分包（按项目册配置）" }]}
              disabled={!!editing && (editing.is_super || (editing.roles || []).some((role) => role.code === "SUPER_ADMIN"))}
            />
          </Form.Item>
          <Form.Item
            label="人员数据范围"
            name="people_scope"
            extra={scopeMode === "all"
              ? "整包默认查看全量数据，不受项目册分包配置影响。"
              : "分包范围 = 所选人员名下推广账号 ∩ 项目册为账号配置的包体；不选默认仅本人。"}
          >
            <Select
              mode="multiple"
              allowClear
              showSearch
              disabled={scopeMode === "all"}
              placeholder="选择可查看的员工"
              options={[{ value: "__all__", label: "全部" }, ...peopleOptions]}
              onSelect={(value) => {
                if (value === "__all__") {
                  form.setFieldValue("people_scope", peopleOptions.map((option) => option.value));
                }
              }}
            />
          </Form.Item>
          {!editing && (
            <Form.Item
              label="初始密码（≥8位，含字母和数字）"
              name="password"
              rules={[
                { required: true, message: "请输入初始密码" },
                { min: 8, message: "至少 8 位" },
                { pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/, message: "需同时包含字母和数字" },
              ]}
            >
              <Input.Search
                placeholder="输入或随机生成"
                enterButton="随机生成"
                onSearch={(v) => form.setFieldsValue({ password: v || randPassword() })}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title={`重置密码 — ${pwdUser?.name || ""}`}
        open={pwdOpen}
        width={420}
        okText={pwdResetDone ? "关闭" : "确认重置"}
        onOk={pwdResetDone ? closePwd : savePwd}
        confirmLoading={pwdSaving}
        onCancel={closePwd}
      >
        <div style={{ marginBottom: 10, padding: "8px 10px", background: "#f5f6f8", borderRadius: 6, color: "#4e5969", fontSize: 13 }}>
          {user?.is_super
            ? pwdResetDone ? "密码已更新，可通过下方眼睛查看当前密码。" : "点击眼睛查看当前密码。"
            : "仅超级管理员可查看当前密码。"}
        </div>
        {user?.is_super && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ color: "#4e5969", fontSize: 12, marginBottom: 4 }}>当前密码</div>
            <Input.Password
              value={currentPwdLoaded ? currentPwdValue : currentPwdUnavailable ? "" : "********"}
              readOnly
              placeholder={currentPwdLoading ? "读取中…" : currentPwdUnavailable ? "需重新登录或重置一次" : ""}
              visibilityToggle={{ visible: currentPwdVisible, onVisibleChange: revealCurrentPwd }}
            />
          </div>
        )}
        <Space.Compact style={{ width: "100%" }}>
          <Input.Password
            value={pwdValue}
            onChange={(e) => setPwdValue(e.target.value)}
            readOnly={pwdResetDone}
            placeholder="新密码"
            visibilityToggle
          />
          {pwdResetDone ? (
            <Button onClick={async () => {
              try {
                await navigator.clipboard.writeText(pwdValue);
                message.success("密码已复制");
              } catch {
                message.error("复制失败，请手动选择并复制密码");
              }
            }}>复制密码</Button>
          ) : (
            <Button onClick={() => setPwdValue(randPassword())}>随机生成</Button>
          )}
        </Space.Compact>
        <div style={{ color: "#86909c", fontSize: 12, marginTop: 6 }}>密码需 ≥8 位且包含字母和数字。</div>
      </Modal>
    </Card>
  );
}
```

## main-app/vite.config.js

```js
import { defineConfig } from "vite";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const root = fileURLToPath(new URL("./", import.meta.url));
async function files(dir, prefix = "") {
  const result = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    if (["node_modules", "dist", ".git"].includes(item.name)) continue;
    const relative = path.posix.join(prefix, item.name);
    if (item.isDirectory()) result.push(...await files(path.join(dir, item.name), relative));
    else result.push(relative);
  }
  return result;
}
const sourceRoots = [
  ["src/extensions", ""], ["src/modules", "assets/"], ["src/styles", "assets/"], ["static", ""],
];

export default defineConfig({
  publicDir: false,
  plugins: [{
    name: "independent-page-resources",
    resolveId(id) {
      if (!id.startsWith("/") || id.startsWith("/src/")) return;
      const [pathname, query] = id.split("?");
      const directory = path.join(root, "src/extensions");
      const source = path.resolve(directory, pathname.slice(1));
      if (source.startsWith(directory + path.sep) && existsSync(source)) {
        return source + (query ? "?" + query : "");
      }
    },
    async configureServer(server) {
      const resources = new Map();
      for (const [directory, prefix] of sourceRoots) {
        for (const file of await files(path.join(root, directory))) {
          resources.set("/" + prefix + file, path.join(root, directory, file));
        }
      }
      server.middlewares.use(async (req, res, next) => {
        const pathname = (req.url || "").split("?")[0];
        if (pathname.startsWith("/api/") && !process.env.DC_API_TARGET) {
          res.statusCode = 503;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          return res.end(JSON.stringify({ detail: "测试后端未配置" }));
        }
        const source = resources.get(pathname);
        if (!source) return next();
        const types = { ".js": "application/javascript", ".css": "text/css", ".png": "image/png" };
        res.setHeader("Content-Type", types[path.extname(source)] || "application/octet-stream");
        res.end(await readFile(source));
      });
    },
    async generateBundle(_options, bundle) {
      for (const [directory, prefix] of sourceRoots) {
        for (const file of await files(path.join(root, directory))) {
          if (!bundle[prefix + file]) this.emitFile({ type: "asset", fileName: prefix + file, source: await readFile(path.join(root, directory, file)) });
        }
      }
    },
  }],
  server: {
    host: "127.0.0.1", port: 8402,
    proxy: process.env.DC_API_TARGET ? {
      "/api/": { target: process.env.DC_API_TARGET, changeOrigin: true },
    } : undefined,
  },
  build: {
    rollupOptions: {
      external: id => id.startsWith("/") && !id.startsWith("/src/") && /\.js(?:\?|$)/.test(id) && !id.startsWith(root),
      input: Object.fromEntries((await files(root)).filter(file => file.endsWith(".html") && !file.startsWith("node_modules/") && !file.startsWith("dist/") && !file.startsWith("static/")).map(file => [file.replace(/\.html$/, ""), path.join(root, file)])),
    },
  },
});

```


## 构建体积

[查看构建输出与体积表](构建输出.md)。
