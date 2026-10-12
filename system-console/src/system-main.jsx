import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, NavLink, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Button, Dropdown, Form, Input, Layout, Menu, Modal, Space, Spin, message } from "antd";
import { api } from "./api.js";
import { ProtoProvider, useProto } from "./store.jsx";
import LoginPage from "./pages/LoginPage.jsx";
const SystemUsers = React.lazy(() => import("./pages/SystemUsers.jsx"));
const SystemRoles = React.lazy(() => import("./pages/SystemRoles.jsx"));
const SystemAudit = React.lazy(() => import("./pages/SystemAudit.jsx"));
const PackageConfig = React.lazy(() => import("./pages/PackageConfig.jsx"));
const SystemDictionary = React.lazy(() => import("./pages/SystemDictionary.jsx"));
const PersonnelArchive = React.lazy(() => import("./pages/PersonnelArchive.jsx"));

const { Header, Sider, Content } = Layout;

const MAIN_NAV = [{"key":"dashboard","label":"核心看板","path":"/"},{"key":"risk","label":"风控质检","path":"/dashboard/chat-risk"},{"key":"personnel","label":"用户管理","path":"/personnel"},{"key":"business","label":"商务","path":"/business/sdk-game-analysis"},{"key":"assets","label":"资产库","path":"/assets"},{"key":"integration","label":"数据集","path":"/integration"},{"key":"finance","label":"财务","path":"/finance"},{"key":"admin","label":"系统管理","path":"/admin"}];

const ADMIN_NAV = [{"key":"/admin","label":"花名册","perm":"system:user:list"},{"key":"/admin/config","label":"项目册","perm":"system:config"},{"key":"/admin/departments","label":"部门管理","perm":"system:user:list"},{"key":"/admin/dictionary","label":"数据字典","perm":"system:config"},{"key":"/admin/audit","label":"操作日志","perm":"system:audit:list"},{"key":"/admin/devices","label":"设备管理","perm":"system:config"},{"key":"/admin/risk-config","label":"风控配置","perms":["system:config","personnel:review"],"hidden":true},{"key":"/admin/churn-config","label":"流失配置","perm":"system:config","hidden":true}];

const MODULE_PERMS = {"dashboard":["dashboard:view","dashboard:private","dashboard:performance","assets:view"],"risk":["dashboard:chat_risk","dashboard:itemlog","personnel:review","assets:view"],"personnel":["personnel:view","personnel:archive","workorder:view","integration:registered_accounts","dashboard:reuse"],"business":["business:sdk_game_analysis","business:channel","business:revenue","business:contract"],"assets":["business:products","assets:view","assets:digital","assets:media","assets:sop"],"integration":["integration:view"],"finance":["finance:view","finance:cost","finance:revenue","finance:roi","finance:settlement"],"admin":["system:user:list","system:role:list","system:audit:list","system:config"]};

function RequireAuth({ children }) {
  const { ready, user } = useProto();
  if (!ready) {
    return (
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 140 }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  const canSys = user.is_super ||
    (user.perms || []).includes("*") ||
    ["system:user:list", "system:role:list", "system:audit:list", "system:config"].some((p) =>
      (user.perms || []).includes(p));
  if (!canSys) {
    return (
      <div style={{ textAlign: "center", paddingTop: 120, color: "#86909c" }}>
        无权访问系统管理（403）
      </div>
    );
  }
  return children;
}

function useNavigationAccess() {
  const [, update] = React.useState(0);
  React.useEffect(() => {
    const changed = () => update(value => value + 1);
    window.addEventListener("dc:navigation-ready", changed);
    changed();
    return () => window.removeEventListener("dc:navigation-ready", changed);
  }, []);
  return window.__DC_NAVIGATION__;
}

function AdminLayout() {
  const navigation = useNavigationAccess();
  const { user, logout, hasPerm, hasAny } = useProto();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [personalOpen, setPersonalOpen] = React.useState(false);
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [passwordForm] = Form.useForm();
  const loc = useLocation();
  const embedded = window.self !== window.top || new URLSearchParams(loc.search).get("embedded") === "1";
  const adminNav = ADMIN_NAV.concat([{ key: "/admin/users", label: "角色管理", perm: "system:role:list", hidden: false }])
    .filter((n) => n.perms ? n.perms.every(hasPerm) : hasPerm(n.perm));
  const mainNav = MAIN_NAV.filter((n) => navigation?.target(n.key));
  const activeNav = adminNav.find((n) => n.key === loc.pathname)?.key || null;
  const forbidden = !activeNav;
  const userTitle = `${user.name || user.username || "用户"} · ${(user.roles || []).map((role) => role.name).join("/") || "普通用户"} · ${user.scope === "all" ? "整包" : "分包"}`;
  const accountMenu = [
    { key: "identity", label: userTitle, disabled: true },
    { key: "personal", label: "个人管理" },
    { type: "divider" },
    { key: "logout", label: "退出登录", danger: true },
  ];

  const submitPassword = async (values) => {
    setChangingPassword(true);
    try {
      await api.changePassword(values.currentPassword, values.newPassword);
      message.success("密码修改成功，请重新登录");
      passwordForm.resetFields();
      setPersonalOpen(false);
      await logout();
      location.href = "/login";
    } catch (error) {
      message.error(error.message || "密码修改失败");
    } finally {
      setChangingPassword(false);
    }
  };
  if (forbidden) {
    return (
      <div style={{ textAlign: "center", paddingTop: 120, color: "#86909c" }}>
        无权访问该页面（403）
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", width: "100%", minWidth: 0, overflowX: "hidden", paddingTop: embedded ? 0 : 56 }}>
      {!embedded && <Header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, lineHeight: "56px", background: "#001529", padding: "0 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1, minWidth: 0 }}>
          <Button
            type="text"
            aria-label={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
            onClick={() => setSidebarCollapsed((value) => !value)}
            style={{ color: "#fff", width: 32, height: 32, padding: 0 }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
          <div style={{ display: "flex", alignItems: "center", marginRight: 16 }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: 2, fontFamily: "'PingFang SC','Microsoft YaHei',sans-serif", textShadow: "0 0 20px rgba(22,119,255,0.5)", whiteSpace: "nowrap" }}>聚玩互动</span>
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={["admin"]}
            style={{ flex: 1, minWidth: 0, borderBottom: "none", lineHeight: "54px", background: "transparent" }}
            onClick={({ key }) => {
              const n = MAIN_NAV.find((x) => x.key === key);
              if (n && key !== "admin" && navigation.target(n.key)) location.href = navigation.target(n.key);
            }}
            items={mainNav.map((n) => ({ key: n.key, label: n.label }))}
          />
        </div>
        <Space size={8} style={{ paddingLeft: hasPerm("ai:employee:view") ? 160 : 0 }}>
          <Button type="text" aria-label="通知" style={{ color: "#fff", width: 32, height: 32, padding: 0 }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
            </svg>
          </Button>
          <Dropdown
            menu={{
              items: accountMenu,
              onClick: async ({ key }) => {
                if (key === "personal") setPersonalOpen(true);
                if (key === "logout") { await logout(); location.href = "/login"; }
              },
            }}
            placement="bottomRight"
          >
            <Button
              type="primary"
              shape="circle"
              size="small"
              title={userTitle}
              aria-label="用户菜单"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />
              </svg>
            </Button>
          </Dropdown>
        </Space>
      </Header>}
      <Modal
        title="个人管理"
        open={personalOpen}
        onCancel={() => { setPersonalOpen(false); passwordForm.resetFields(); }}
        footer={null}
        destroyOnClose
      >
        <div style={{ marginBottom: 20, padding: 12, background: "#f5f6f8", borderRadius: 8 }}>
          <div><span style={{ color: "#86909c" }}>姓名：</span>{user.name || "--"}</div>
          <div style={{ marginTop: 6 }}><span style={{ color: "#86909c" }}>账号：</span>{user.username || "--"}</div>
        </div>
        <Form form={passwordForm} layout="vertical" onFinish={submitPassword} autoComplete="off">
          <Form.Item name="currentPassword" label="原密码" rules={[{ required: true, message: "请输入原密码" }]}>
            <Input.Password placeholder="请输入原密码" autoComplete="current-password" />
          </Form.Item>
          <Form.Item name="newPassword" label="新密码" rules={[
            { required: true, message: "请输入新密码" },
            { min: 8, message: "密码至少 8 位" },
            { pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/, message: "密码需同时包含字母和数字" },
          ]}>
            <Input.Password placeholder="至少 8 位，包含字母和数字" autoComplete="new-password" />
          </Form.Item>
          <Form.Item name="confirmPassword" label="确认新密码" dependencies={["newPassword"]} rules={[
            { required: true, message: "请再次输入新密码" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                return !value || getFieldValue("newPassword") === value
                  ? Promise.resolve()
                  : Promise.reject(new Error("两次输入的新密码不一致"));
              },
            }),
          ]}>
            <Input.Password placeholder="请再次输入新密码" autoComplete="new-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={changingPassword} block>修改密码</Button>
        </Form>
      </Modal>
      <Layout style={{ width: "100%", minWidth: 0 }}>
        <Sider collapsible collapsed={sidebarCollapsed} trigger={null} width={200} style={{
          background: "#fff", position: "fixed", top: embedded ? 0 : 56, bottom: 0, left: 0,
          height: embedded ? "100vh" : "calc(100vh - 56px)", overflowY: "auto", zIndex: 20,
        }}>
          <Menu
            mode="inline"
            selectedKeys={[activeNav]}
            style={{ borderInlineEnd: "none", paddingTop: 8 }}
          >
            {adminNav.filter((n) => !n.hidden).map((n) => (
              <Menu.Item key={n.key}>
                <NavLink to={n.key} style={{ color: "inherit" }}>{n.label}</NavLink>
              </Menu.Item>
            ))}
          </Menu>
        </Sider>
        <Content style={{
          marginLeft: sidebarCollapsed ? 80 : 200,
          padding: 16,
          background: "#f5f6f8",
          minHeight: embedded ? "100vh" : "calc(100vh - 56px)",
          minWidth: 0,
          width: 0,
          flex: "1 1 auto",
          overflowX: "auto",
          transition: "margin-left .2s",
          "--admin-page-height": embedded ? "calc(100vh - 32px)" : "calc(100vh - 88px)",
        }}>
          <div style={{ width: "100%", minWidth: 0 }}>
            <React.Suspense fallback={<div style={{ display: "flex", justifyContent: "center", paddingTop: 72 }}><Spin size="large" /></div>}>
              <Outlet />
            </React.Suspense>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {
  React.useEffect(() => {
    document.getElementById("dc-boot-header")?.remove();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route index element={<SystemUsers />} />
          <Route path="users" element={<SystemRoles />} />
          <Route path="audit" element={<SystemAudit />} />
          <Route path="config" element={<PackageConfig />} />
          <Route path="departments" element={<PersonnelArchive />} />
          <Route path="dictionary" element={<SystemDictionary />} />
          <Route path="devices" element={<NavigationEmpty title="设备管理" />} />
          <Route path="risk-config" element={<iframe title="风控配置" src="/parameter-config.html?mode=risk" style={{ display: "block", width: "100%", minWidth: 0, height: "var(--admin-page-height)", border: 0 }} />} />
          <Route path="churn-config" element={<iframe title="流失配置" src="/parameter-config.html?mode=churn" style={{ display: "block", width: "100%", minWidth: 0, height: "var(--admin-page-height)", border: 0 }} />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(
  <ProtoProvider>
    <App />
  </ProtoProvider>
);

function NavigationEmpty({ title }) { return <div style={{ textAlign: "center", padding: "48px 32px", color: "#86909c" }}><svg width="72" height="72" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="5"><path d="M10 18h22l10 10h28v42H10z" /></svg><h2 style={{ fontSize: 24, fontWeight: 400, color: "#34495e", margin: "24px 0 8px" }}>{title}</h2><p>暂无真实数据</p></div>; }
