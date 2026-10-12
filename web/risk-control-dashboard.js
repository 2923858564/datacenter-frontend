const PERIODS = {
  yesterday: {
    label: "昨日",
    query: "Yesterday",
    rows: 227,
    roles: 225,
    violations: [["工作室（同IP同战区10个角色以上）", 219], ["商人", 152], ["IP关联商人", 26]],
    statuses: [["永久封禁", 157], ["封小保大", 30], ["不处理", 16], ["封停角色15天", 16], ["禁言7天", 8]],
  },
  week: {
    label: "上周",
    query: "LastWeek",
    rows: 255,
    roles: 254,
    violations: [["IP关联商人", 154], ["工作室（同IP同战区10个角色以上）", 75], ["商人", 49], ["手拉", 5]],
    statuses: [["永久封禁", 200], ["封停角色15天", 30], ["封小保大", 17], ["不处理", 5], ["禁言7天", 3]],
  },
  month: {
    label: "上月",
    query: "LastMonth",
    rows: 2028,
    roles: 1990,
    violations: [["IP关联商人", 678], ["手拉", 646], ["工作室（同IP同战区10个角色以上）", 604], ["商人", 89], ["发送联系方式", 11]],
    statuses: [["永久封禁", 1718], ["封停角色15天", 135], ["封小保大", 83], ["待处理", 42], ["不处理", 28], ["禁言7天", 21], ["追封15天", 13], ["禁言3天", 1], ["解散行会", 1]],
  },
};

const SOURCES = [
  {name: "幻斗聊天预警，每日更新", key: "角色ID", output: "聊天预警", rule: "聊天内容命中规则词或连续数字"},
  {name: "幻斗IP预警，每日更新", key: "角色ID", output: "IP预警", rule: "命中幻斗IP库，或同IP角色数≥4"},
  {name: "幻斗物品丢弃预警", key: "角色ID", output: "行为预警", rule: "按物品名称和变化数量阈值判定"},
  {name: "幻斗充值预警", key: "角色ID", output: "充值预警", rule: "充值总金额＜200元"},
];

const STYLE = `
.dc-hr{min-height:calc(100vh - 88px);padding:24px;background:#f4f7fb;color:#1d2939}.dc-hr *{box-sizing:border-box}.dc-hr-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:18px}.dc-hr-title{display:flex;align-items:center;gap:10px}.dc-hr-title h1{margin:0;font-size:24px}.dc-hr-badge{padding:3px 9px;border:1px solid #ffb8b8;border-radius:999px;background:#fff1f0;color:#cf1322;font-size:12px}.dc-hr-sub{margin:7px 0 0;color:#667085}.dc-hr-actions{display:flex;gap:8px;align-items:center}.dc-hr-btn{height:36px;padding:0 14px;border:1px solid #d0d5dd;border-radius:7px;background:#fff;cursor:pointer}.dc-hr-btn.primary{border-color:#1677ff;background:#1677ff;color:#fff}.dc-hr-tabs{display:flex;gap:8px;margin-bottom:16px}.dc-hr-tabs button{padding:8px 20px;border:1px solid #d0d5dd;border-radius:7px;background:#fff;cursor:pointer}.dc-hr-tabs button.active{border-color:#1677ff;background:#eaf3ff;color:#0958d9;font-weight:600}.dc-hr-empty{display:grid;place-items:center;min-height:420px;border:1px dashed #b9c3d0;border-radius:12px;background:#fff;color:#667085}.dc-hr-empty strong{display:block;margin-bottom:8px;color:#344054;font-size:18px}.dc-hr-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:16px}.dc-hr-card{border:1px solid #e4e7ec;border-radius:12px;background:#fff;box-shadow:0 1px 2px rgba(16,24,40,.04)}.dc-hr-metric{grid-column:span 3;padding:18px}.dc-hr-metric .label{color:#667085;font-size:13px}.dc-hr-metric .value{margin-top:8px;font-size:34px;font-weight:700;line-height:1}.dc-hr-metric .hint{margin-top:9px;color:#98a2b3;font-size:12px}.dc-hr-chart{grid-column:span 6;padding:18px}.dc-hr-card h2{margin:0 0 16px;font-size:16px}.dc-hr-bars{display:flex;flex-direction:column;gap:13px}.dc-hr-bar-row{display:grid;grid-template-columns:minmax(130px,1.35fr) 2fr 56px;gap:12px;align-items:center;font-size:13px}.dc-hr-bar-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#475467}.dc-hr-track{height:12px;border-radius:99px;background:#eef2f6;overflow:hidden}.dc-hr-fill{height:100%;min-width:4px;border-radius:99px;background:linear-gradient(90deg,#ff7a45,#faad14)}.dc-hr-status .dc-hr-fill{background:linear-gradient(90deg,#1677ff,#36cfc9)}.dc-hr-bar-value{text-align:right;font-weight:600}.dc-hr-note{grid-column:span 12;padding:13px 16px;border-left:4px solid #faad14;background:#fffbe6;color:#7a5600;font-size:13px}.dc-hr-index{grid-column:span 12;padding:18px}.dc-hr-flow{display:grid;grid-template-columns:1.2fr 60px 1.2fr 60px 1fr;gap:12px;align-items:center}.dc-hr-source-list{display:grid;gap:8px}.dc-hr-source{padding:11px;border:1px solid #e4e7ec;border-radius:8px;background:#f9fafb}.dc-hr-source strong{display:block;font-size:13px}.dc-hr-source span{display:block;margin-top:4px;color:#667085;font-size:12px}.dc-hr-arrow{text-align:center;color:#1677ff;font-size:24px}.dc-hr-node{padding:16px;border:1px solid #91caff;border-radius:10px;background:#eaf3ff}.dc-hr-node strong{display:block}.dc-hr-node span{display:block;margin-top:6px;color:#475467;font-size:12px}.dc-hr-table{width:100%;border-collapse:collapse}.dc-hr-table th,.dc-hr-table td{padding:11px 12px;border-bottom:1px solid #eaecf0;text-align:left;font-size:13px}.dc-hr-table th{color:#475467;background:#f9fafb}.dc-hr-foot{margin-top:14px;color:#667085;font-size:12px}.dc-hr-viewtabs{display:flex;gap:16px;margin-bottom:16px;border-bottom:1px solid #e4e7ec}.dc-hr-viewtabs button{padding:9px 2px;border:0;border-bottom:2px solid transparent;background:transparent;color:#667085;cursor:pointer}.dc-hr-viewtabs button.active{border-color:#1677ff;color:#0958d9;font-weight:600}@media(max-width:1100px){.dc-hr-metric{grid-column:span 6}.dc-hr-chart{grid-column:span 12}.dc-hr-flow{grid-template-columns:1fr}.dc-hr-arrow{transform:rotate(90deg)}}
`;

function formatNumber(value) {
  return new Intl.NumberFormat("zh-CN").format(value);
}

export default function createHeroRiskDashboard({Xr, C}) {
  function useStyle() {
    Xr.useEffect(() => {
      if (document.getElementById("dc-hero-risk-style")) return;
      const style = document.createElement("style");
      style.id = "dc-hero-risk-style";
      style.textContent = STYLE;
      document.head.appendChild(style);
    }, []);
  }

  function Bars({rows, status}) {
    const max = Math.max(...rows.map((item) => item[1]), 1);
    return C.jsx("div", {className: `dc-hr-bars${status ? " dc-hr-status" : ""}`, children: rows.map(([label, value]) => C.jsxs("div", {className: "dc-hr-bar-row", children: [
      C.jsx("span", {className: "dc-hr-bar-label", title: label, children: label}),
      C.jsx("div", {className: "dc-hr-track", children: C.jsx("div", {className: "dc-hr-fill", style: {width: `${Math.max(3, value / max * 100)}%`}})}),
      C.jsx("span", {className: "dc-hr-bar-value", children: formatNumber(value)}),
    ]}, label))});
  }

  return function HeroRiskDashboard() {
    useStyle();
    const [loaded, setLoaded] = Xr.useState(false);
    const [periodKey, setPeriodKey] = Xr.useState("yesterday");
    const [view, setView] = Xr.useState("dashboard");
    const period = PERIODS[periodKey];
    const duplicates = period.rows - period.roles;
    const statusTotal = period.statuses.reduce((sum, item) => sum + item[1], 0);
    return C.jsxs("main", {className: "dc-hr", children: [
      C.jsxs("header", {className: "dc-hr-head", children: [
        C.jsxs("div", {children: [C.jsxs("div", {className: "dc-hr-title", children: [C.jsx("h1", {children: "风控看板"}), C.jsx("span", {className: "dc-hr-badge", children: "原型"})]}), C.jsx("p", {className: "dc-hr-sub", children: "当前项目：幻斗英雄 · 风险记录、去重角色、违规类型与处理状态分层展示"})]}),
        C.jsx("div", {className: "dc-hr-actions", children: C.jsx("button", {type: "button", className: "dc-hr-btn primary", onClick: () => setLoaded(true), children: loaded ? "刷新原型数据" : "查询"})}),
      ]}),
      C.jsxs("nav", {className: "dc-hr-viewtabs", "aria-label": "看板视图", children: [
        C.jsx("button", {type: "button", className: view === "dashboard" ? "active" : "", onClick: () => setView("dashboard"), children: "风控概览"}),
        C.jsx("button", {type: "button", className: view === "index" ? "active" : "", onClick: () => setView("index"), children: "数据索引关系"}),
      ]}),
      !loaded ? C.jsx("section", {className: "dc-hr-empty", children: C.jsxs("div", {children: [C.jsx("strong", {children: "等待查询"}), C.jsx("span", {children: "点击“查询”载入已核对的飞书看板原型快照"})]})}) : view === "dashboard" ? C.jsxs(C.Fragment, {children: [
        C.jsx("div", {className: "dc-hr-tabs", children: Object.entries(PERIODS).map(([key, item]) => C.jsx("button", {type: "button", className: key === periodKey ? "active" : "", onClick: () => setPeriodKey(key), children: item.label}, key))}),
        C.jsxs("section", {className: "dc-hr-grid", children: [
          C.jsxs("article", {className: "dc-hr-card dc-hr-metric", children: [C.jsx("div", {className: "label", children: `${period.label}风控记录`}), C.jsx("div", {className: "value", children: formatNumber(period.rows)}), C.jsx("div", {className: "hint", children: `云端口径：日期=${period.query} 后按行计数`})]}),
          C.jsxs("article", {className: "dc-hr-card dc-hr-metric", children: [C.jsx("div", {className: "label", children: `${period.label}去重风险角色`}), C.jsx("div", {className: "value", children: formatNumber(period.roles)}), C.jsx("div", {className: "hint", children: "按角色ID去重"})]}),
          C.jsxs("article", {className: "dc-hr-card dc-hr-metric", children: [C.jsx("div", {className: "label", children: "重复记录差值"}), C.jsx("div", {className: "value", children: formatNumber(duplicates)}), C.jsx("div", {className: "hint", children: "记录数 − 去重角色数"})]}),
          C.jsxs("article", {className: "dc-hr-card dc-hr-metric", children: [C.jsx("div", {className: "label", children: "处理状态计数"}), C.jsx("div", {className: "value", children: formatNumber(statusTotal)}), C.jsx("div", {className: "hint", children: "多选字段按选项展开计数"})]}),
          C.jsxs("article", {className: "dc-hr-card dc-hr-chart", children: [C.jsx("h2", {children: `${period.label}违规类型`}), C.jsx(Bars, {rows: period.violations})]}),
          C.jsxs("article", {className: "dc-hr-card dc-hr-chart", children: [C.jsx("h2", {children: `${period.label}处理状态`}), C.jsx(Bars, {rows: period.statuses, status: true})]}),
          C.jsx("div", {className: "dc-hr-note", children: "口径提醒：“违规类型”和“处理状态”均为多选字段，分类计数之和可以大于风险角色数，不能用分类合计反推账号数。"}),
        ]}),
      ]}) : C.jsxs("section", {className: "dc-hr-grid", children: [
        C.jsxs("article", {className: "dc-hr-card dc-hr-index", children: [
          C.jsx("h2", {children: "生态预警数据链路"}),
          C.jsxs("div", {className: "dc-hr-flow", children: [
            C.jsx("div", {className: "dc-hr-source-list", children: SOURCES.map((source) => C.jsxs("div", {className: "dc-hr-source", children: [C.jsx("strong", {children: source.name}), C.jsx("span", {children: `${source.rule} → ${source.output}`})]}, source.name))}),
            C.jsx("div", {className: "dc-hr-arrow", children: "→"}),
            C.jsxs("div", {className: "dc-hr-node", children: [C.jsx("strong", {children: "幻斗异常账号汇总"}), C.jsx("span", {children: "连接键：角色ID"}), C.jsx("span", {children: "预警星级=充值+聊天+IP+行为四类命中数"}), C.jsx("span", {children: "建议状态：1项追踪，2–3项待排查，4项待封禁"})]}),
            C.jsx("div", {className: "dc-hr-arrow", children: "→"}),
            C.jsxs("div", {className: "dc-hr-node", children: [C.jsx("strong", {children: "人工巡查闭环"}), C.jsx("span", {children: "是否巡查 / 巡查人员"}), C.jsx("span", {children: "是否封禁：是 / 否，证据链未闭环"})]}),
          ]}),
        ]}),
        C.jsxs("article", {className: "dc-hr-card dc-hr-index", children: [C.jsx("h2", {children: "看板展示口径"}), C.jsx("table", {className: "dc-hr-table", children: C.jsxs("tbody", {children: [
          C.jsxs("tr", {children: [C.jsx("th", {children: "数据表"}), C.jsx("td", {children: "幻斗英雄风控表"})]}),
          C.jsxs("tr", {children: [C.jsx("th", {children: "时间窗口"}), C.jsx("td", {children: "昨日=Yesterday；上周=LastWeek；上月=LastMonth（文档时区自然周/月）"})]}),
          C.jsxs("tr", {children: [C.jsx("th", {children: "风控记录"}), C.jsx("td", {children: "日期筛选后按记录行计数"})]}),
          C.jsxs("tr", {children: [C.jsx("th", {children: "风险角色"}), C.jsx("td", {children: "日期筛选后对角色ID去重计数"})]}),
          C.jsxs("tr", {children: [C.jsx("th", {children: "违规/处理分布"}), C.jsx("td", {children: "多选字段按每个选项展开后分组计数"})]}),
          C.jsxs("tr", {children: [C.jsx("th", {children: "明细唯一键"}), C.jsx("td", {children: "记录ID用于定位；角色ID用于跨表归并，不用账号ID或角色名代替"})]}),
        ]})})]}),
        C.jsx("p", {className: "dc-hr-foot", children: "原型快照核对日期：2026-09-15。当前只读飞书数据口径，未写入飞书，未接入本地实时采集接口。"}),
      ]}),
    ]});
  };
}
