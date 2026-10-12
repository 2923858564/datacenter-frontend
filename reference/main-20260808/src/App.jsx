import React, { useEffect, useState } from "react";
import { Button, Layout, Menu, Space, Spin, Tag, Tooltip } from "antd";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { ProtoProvider, useProto } from "./store.jsx";
import { NOW } from "./data.js";
import { api } from "./api.js";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PrivateUsers from "./pages/PrivateUsers.jsx";
import PerformanceRanking from "./pages/PerformanceRanking.jsx";
import ChannelPage from "./pages/Channel.jsx";
import FinancePage from "./pages/Finance.jsx";
import PersonnelPage from "./pages/Personnel.jsx";
import Placeholder from "./components/Placeholder.jsx";
import SystemUsers from "./pages/SystemUsers.jsx";
import SystemRoles from "./pages/SystemRoles.jsx";
import SystemAudit from "./pages/SystemAudit.jsx";
const {
  Header,
  Sider,
  Content,
  Footer
} = Layout;

// 一级导航：key / 入口路径 / 可见权限
const NAV = [{
  key: "dashboard",
  label: "核心看板",
  path: "/",
  perms: ["dashboard:view", "dashboard:private", "dashboard:performance"]
}, {
  key: "business",
  label: "商务",
  path: "/business/products",
  perms: ["business:products", "business:channel", "business:revenue", "business:contract"]
}, {
  key: "finance",
  label: "财务",
  path: "/finance",
  perms: ["finance:view", "finance:cost", "finance:revenue", "finance:roi", "finance:settlement"]
}, {
  key: "personnel",
  label: "人员",
  path: "/personnel",
  perms: ["personnel:view", "personnel:archive", "personnel:tasks", "personnel:review"]
}, {
  key: "assets",
  label: "资产库",
  path: "/assets",
  perms: ["assets:view", "assets:docs", "assets:media", "assets:sop"]
}, {
  key: "integration",
  label: "数据集",
  path: "/integration",
  perms: ["integration:view"]
}, {
  key: "system",
  label: "系统",
  path: "/system/users",
  perms: ["system:user:list", "system:role:list", "system:audit:list", "system:config"]
}];
const SIDEBAR = {
  dashboard: [{
    key: "/",
    label: "全局驾驶舱",
    perms: ["dashboard:view"]
  }, {
    key: "/dashboard/private-domain",
    label: "私域数据看板",
    perms: ["dashboard:private"]
  }, {
    key: "/dashboard/performance-ranking",
    label: "人员业绩排行",
    perms: ["dashboard:performance"]
  }],
  business: [{
    key: "/business/products",
    label: "产品库",
    perms: ["business:products"]
  }, {
    key: "/business/channel-detail",
    label: "渠道详情",
    perms: ["business:channel"]
  }, {
    key: "/business/channel-revenue",
    label: "渠道收益",
    perms: ["business:revenue"]
  }, {
    key: "/business/channel-contract",
    label: "渠道合同",
    perms: ["business:contract"]
  }],
  finance: [{
    key: "/finance",
    label: "财务总览",
    perms: ["finance:view"]
  }, {
    key: "/finance/cost",
    label: "成本台账",
    perms: ["finance:cost"]
  }, {
    key: "/finance/revenue",
    label: "营收台账",
    perms: ["finance:revenue"]
  }, {
    key: "/finance/roi",
    label: "ROI核算",
    perms: ["finance:roi"]
  }, {
    key: "/finance/settlement",
    label: "渠道结算对账",
    perms: ["finance:settlement"]
  }],
  personnel: [{
    key: "/personnel",
    label: "人员总览",
    perms: ["personnel:view"]
  }, {
    key: "/personnel/archive",
    label: "人员档案",
    perms: ["personnel:archive"]
  }, {
    key: "/personnel/tasks",
    label: "任务派发",
    perms: ["personnel:tasks"]
  }, {
    key: "/personnel/review",
    label: "工作复盘",
    perms: ["personnel:review"]
  }],
  assets: [{
    key: "/assets",
    label: "资产总览",
    perms: ["assets:view"]
  }, {
    key: "/assets/documents",
    label: "业务文档",
    perms: ["assets:docs"]
  }, {
    key: "/assets/media",
    label: "短视频素材库",
    perms: ["assets:media"]
  }, {
    key: "/assets/sop",
    label: "SOP知识库",
    perms: ["assets:sop"]
  }],
  integration: [{
    key: "/integration",
    label: "数据集成",
    perms: ["integration:view"]
  }],
  system: [{
    key: "/system/users",
    label: "花名册",
    perms: ["system:user:list"]
  }, {
    key: "/system/roles",
    label: "角色管理",
    perms: ["system:role:list"]
  }, {
    key: "/system/audit",
    label: "日志审计",
    perms: ["system:audit:list"]
  }, {
    key: "/system/config",
    label: "系统配置",
    perms: ["system:config"]
  }]
};
function sectionOf(path) {
  if (path === "/" || path.startsWith("/dashboard")) return "dashboard";
  if (path.startsWith("/system")) return "system";
  const s = path.split("/")[1] || "dashboard";
  return NAV.some(n => n.key === s) ? s : "dashboard";
}
function RequirePerm({
  perms,
  children
}) {
  const {
    hasAny
  } = useProto();
  return hasAny(perms) ? children : <div style={{
    textAlign: "center",
    padding: "80px 0",
    color: "#86909c"
  }}>
      无权访问该页面（403）<br />
      <span style={{
      fontSize: 12
    }}>如需开通权限，请联系系统管理员在「角色管理」中配置。</span>
    </div>;
}
function Shell() {
  const nav = useNavigate();
  const loc = useLocation();
  const {
    ready,
    user,
    logout,
    hasAny,
    hasPerm
  } = useProto();
  const [snapshot, setSnapshot] = useState(null);
  useEffect(() => {
    api.health().then(setSnapshot).catch(() => {});
  }, []);
  if (!ready) {
    return <div style={{
      display: "flex",
      justifyContent: "center",
      paddingTop: 160
    }}><Spin size="large" /></div>;
  }
  if (!user) return <Login />;
  const visibleNav = NAV.filter(n => hasAny(n.perms));
  const section = sectionOf(loc.pathname);
  const selected = loc.pathname;
  const sidebar = (SIDEBAR[section] || []).filter(i => hasAny(i.perms));
  const titleMap = {};
  Object.values(SIDEBAR).forEach(arr => arr.forEach(i => titleMap[i.key] = i.label));
  const activeNav = visibleNav.find(n => n.key === section);
  const userTags = (user.roles || []).map(r => r.name);
  const scopeLabel = user.scope === "all" ? "整包" : "分包";
  return <Layout style={{
    minHeight: "100vh"
  }}>
      <Header style={{
      display: "flex",
      alignItems: "center",
      gap: 8
    }}>
        <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginRight: 20
      }}>
          <img src="./logo.png" alt="logo" style={{
          height: 30
        }} />
          <span className="header-title">聚玩经营数据中台</span>
        </div>
        {visibleNav.length > 0 && <Menu theme="dark" mode="horizontal" selectedKeys={[activeNav?.key || section]} style={{
        flex: 1,
        borderBottom: "none"
      }} onClick={({
        key
      }) => {
        const n = NAV.find(x => x.key === key);
        if (n) nav(n.path);
      }} items={visibleNav.map(n => ({
        key: n.key,
        label: n.label
      }))} />}
        {snapshot?.latest_date ? <Tag color="green" style={{
        marginRight: 4
      }}>真实数据 · 最新 {snapshot.latest_date}</Tag> : <Tag color="red" style={{
        marginRight: 4
      }}>演示数据</Tag>}
        <Tooltip title="方案 V1.2：当日数据每小时刷新；全量数据每日 3:00 后更新">
          <span className="header-muted" style={{
          marginRight: 12
        }}>数据最后更新时间：{NOW}</span>
        </Tooltip>
        <Space size={6}>
          <span className="header-muted">{user.name || user.username}</span>
          {userTags.map(t => <Tag key={t} color="blue">{t}</Tag>)}
          <Tag color={user.scope === "all" ? "green" : "orange"}>{scopeLabel}</Tag>
          <Button size="small" onClick={logout}>退出</Button>
        </Space>
      </Header>
      <Layout>
        <Sider width={220} style={{
        overflow: "auto"
      }}>
          <Menu mode="inline" selectedKeys={[selected]} onClick={({
          key
        }) => nav(key)} items={sidebar.map(i => ({
          key: i.key,
          label: i.label
        }))} />
        </Sider>
        <Layout style={{
        background: "#f5f6f8"
      }}>
          <Content style={{
          padding: 16
        }}>
            <Routes>
              <Route path="/" element={<RequirePerm perms={["dashboard:view", "dashboard:private", "dashboard:performance"]}><Dashboard /></RequirePerm>} />
              <Route path="/dashboard/private-domain" element={<RequirePerm perms={["dashboard:private"]}><PrivateUsers /></RequirePerm>} />
              <Route path="/dashboard/performance-ranking" element={<RequirePerm perms={["dashboard:performance"]}><PerformanceRanking /></RequirePerm>} />
              <Route path="/business/products" element={<RequirePerm perms={["business:products"]}><ChannelPage page="products" /></RequirePerm>} />
              <Route path="/business/channel-detail" element={<RequirePerm perms={["business:channel"]}><ChannelPage page="channel-detail" /></RequirePerm>} />
              <Route path="/business/channel-revenue" element={<RequirePerm perms={["business:revenue"]}><ChannelPage page="channel-revenue" /></RequirePerm>} />
              <Route path="/business/channel-contract" element={<RequirePerm perms={["business:contract"]}><ChannelPage page="channel-contract" /></RequirePerm>} />
              <Route path="/finance" element={<RequirePerm perms={["finance:view"]}><FinancePage /></RequirePerm>} />
              <Route path="/finance/cost" element={<RequirePerm perms={["finance:cost"]}><Placeholder title="全维度成本台账" desc="成本分类管理、趋势分析与预算对比将在后续版本实现" /></RequirePerm>} />
              <Route path="/finance/revenue" element={<RequirePerm perms={["finance:revenue"]}><Placeholder title="营收数据台账" desc="营收明细、构成分析与趋势预测将在后续版本实现" /></RequirePerm>} />
              <Route path="/finance/roi" element={<RequirePerm perms={["finance:roi"]}><Placeholder title="ROI & 经营利润核算" desc="按项目/渠道/活动维度的 ROI 分析将在后续版本实现" /></RequirePerm>} />
              <Route path="/finance/settlement" element={<RequirePerm perms={["finance:settlement"]}><Placeholder title="渠道结算对账" desc="结算单管理、数据对比与状态流转将在后续版本实现" /></RequirePerm>} />
              <Route path="/personnel" element={<RequirePerm perms={["personnel:view"]}><PersonnelPage /></RequirePerm>} />
              <Route path="/personnel/archive" element={<RequirePerm perms={["personnel:archive"]}><PersonnelPage /></RequirePerm>} />
              <Route path="/personnel/tasks" element={<RequirePerm perms={["personnel:tasks"]}><Placeholder title="任务派发 & 进度管控" desc="任务看板、分配与进度跟踪将在后续版本实现" /></RequirePerm>} />
              <Route path="/personnel/review" element={<RequirePerm perms={["personnel:review"]}><Placeholder title="工作复盘 & KPI 统计" desc="复盘记录、KPI 设定与绩效趋势将在后续版本实现" /></RequirePerm>} />
              <Route path="/assets" element={<RequirePerm perms={["assets:view"]}><Placeholder title="业务文档归档" desc="文件夹树导航、文档上传预览与版本管理将在后续版本实现" /></RequirePerm>} />
              <Route path="/assets/documents" element={<RequirePerm perms={["assets:docs"]}><Placeholder title="业务文档归档" desc="文件夹树导航、文档上传预览与版本管理将在后续版本实现" /></RequirePerm>} />
              <Route path="/assets/media" element={<RequirePerm perms={["assets:media"]}><Placeholder title="短视频图文素材库" desc="素材网格展示、标签筛选与效果关联将在后续版本实现" /></RequirePerm>} />
              <Route path="/assets/sop" element={<RequirePerm perms={["assets:sop"]}><Placeholder title="部门 SOP 知识库" desc="SOP 文档管理、Markdown 编辑与搜索将在后续版本实现" /></RequirePerm>} />
              <Route path="/integration" element={<RequirePerm perms={["integration:view"]}><Placeholder title="数据集成 & 自动同步" desc="第三方数据抓取、飞书多维表格同步与定时报表将在后续版本实现" /></RequirePerm>} />
              <Route path="/system/users" element={<RequirePerm perms={["system:user:list"]}><SystemUsers /></RequirePerm>} />
              <Route path="/system/roles" element={<RequirePerm perms={["system:role:list"]}><SystemRoles /></RequirePerm>} />
              <Route path="/system/audit" element={<RequirePerm perms={["system:audit:list"]}><SystemAudit /></RequirePerm>} />
              <Route path="/system/config" element={<RequirePerm perms={["system:config"]}><Placeholder title="系统全局配置" desc="系统参数、预警规则与基础配置将在后续版本实现" /></RequirePerm>} />
              <Route path="/admin" element={<Navigate to="/system/users" replace />} />
              <Route path="/admin/users" element={<Navigate to="/system/roles" replace />} />
              <Route path="/admin/audit" element={<Navigate to="/system/audit" replace />} />
              <Route path="/admin/config" element={<Navigate to="/system/config" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Content>
          <Footer style={{
          textAlign: "center",
          color: "#86909c",
          fontSize: 12,
          padding: "10px 0"
        }}>
            聚玩经营数据中台 · 登录与权限体系（参考聚玩助手 CRM） · 数据更新：当日每小时刷新 / 全量每日 3:00
          </Footer>
        </Layout>
      </Layout>
    </Layout>;
}
export default function App() {
  return <ProtoProvider>
      <Shell />
    </ProtoProvider>;
}
