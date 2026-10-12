// ============ 演示数据（基于同事 Web2.0 原型 + V1.2 方案补充） ============
export const NOW = "2026-08-05 13:56";
export const ROLES = [{
  id: "admin",
  name: "系统管理员",
  scope: "全量 + 整包/分包切换 + 管理模块",
  pkg: true,
  group: "全部"
}, {
  id: "exec",
  name: "高管",
  scope: "全局查看 + 导出 + 数据下钻",
  pkg: true,
  group: "全部"
}, {
  id: "manager",
  name: "部门经理",
  scope: "管辖模块完整权限",
  pkg: false,
  group: "开天组"
}, {
  id: "operator",
  name: "运营人员",
  scope: "私域看板 + 业绩排行 + 下钻",
  pkg: false,
  group: "内容组"
}, {
  id: "cs",
  name: "客服",
  scope: "仅自己分包数据（无整包权限）",
  pkg: false,
  group: "聚财组"
}];
export const ADMIN_ROLES = [{
  key: "r1",
  name: "高管",
  desc: "全局查看 + 导出 + 数据下钻",
  users: 3
}, {
  key: "r2",
  name: "部门经理",
  desc: "管辖模块完整权限",
  users: 5
}, {
  key: "r3",
  name: "运营主管",
  desc: "私域看板 + 业绩排行 + 下钻",
  users: 8
}, {
  key: "r4",
  name: "运营专员",
  desc: "看板查看 + 个人数据",
  users: 12
}, {
  key: "r5",
  name: "商务经理",
  desc: "商务模块完整权限",
  users: 4
}, {
  key: "r6",
  name: "财务人员",
  desc: "财务模块完整权限",
  users: 3
}, {
  key: "r7",
  name: "普通员工",
  desc: "个人数据查看",
  users: 38
}];
export const GROUPS = ["开天组", "屠龙组", "聚财组", "内容组"];
export const PEOPLE = [{
  name: "张三",
  group: "开天组",
  sub: "分包A"
}, {
  name: "李四",
  group: "开天组",
  sub: "分包B"
}, {
  name: "王五",
  group: "屠龙组",
  sub: "分包C"
}, {
  name: "赵六",
  group: "屠龙组",
  sub: "分包D"
}, {
  name: "陈七",
  group: "聚财组",
  sub: "分包E"
}, {
  name: "周八",
  group: "聚财组",
  sub: "分包F"
}, {
  name: "吴九",
  group: "内容组",
  sub: "短视频"
}, {
  name: "郑十",
  group: "内容组",
  sub: "公众号"
}];
export const GAMES = [{
  id: "G001",
  name: "聚玩游戏盒子"
}, {
  id: "G002",
  name: "聚玩轻量版"
}, {
  id: "G003",
  name: "聚玩H5版"
}, {
  id: "G004",
  name: "聚玩国际版"
}, {
  id: "G005",
  name: "御龙无双（龙渊）"
}, {
  id: "G006",
  name: "战谷（狂游传奇）"
}, {
  id: "G007",
  name: "开天霸兵（玄尊沉默）"
}, {
  id: "G008",
  name: "盖世强者（封神2）"
}, {
  id: "G009",
  name: "幽火火渊攻速"
}, {
  id: "G010",
  name: "盟世风起沙城"
}, {
  id: "G011",
  name: "流浪传奇1"
}, {
  id: "G012",
  name: "金涛只因封神修仙传"
}, {
  id: "G013",
  name: "金轮暗隐骷髅进化史"
}, {
  id: "G014",
  name: "神绝攻速传奇"
}, {
  id: "G015",
  name: "天德合击"
}, {
  id: "G016",
  name: "牛牛怪物进化"
}, {
  id: "G017",
  name: "归云攻速单职业"
}, {
  id: "G018",
  name: "厉火十二职业"
}, {
  id: "G019",
  name: "天陨攻速专属神器"
}, {
  id: "G020",
  name: "鬼影微变攻速版"
}, {
  id: "G021",
  name: "圆梦三职业"
}];
export const SUB_FACTOR = 0.68;
function seeded(seed) {
  let s = seed >>> 0;
  return function () {
    s = s * 1664525 + 1013904223 >>> 0;
    return s / 4294967296;
  };
}
const rnd = seeded(20260805);
const FIXED_RANK = {
  G001: {
    newAcct: 8,
    payNew: 0,
    payNewAmt: 0,
    active: 420,
    payAcct: 5,
    payAmt: 580
  },
  G002: {
    newAcct: 6,
    payNew: 0,
    payNewAmt: 0,
    active: 310,
    payAcct: 4,
    payAmt: 380
  },
  G003: {
    newAcct: 5,
    payNew: 0,
    payNewAmt: 0,
    active: 225,
    payAcct: 2,
    payAmt: 250
  },
  G004: {
    newAcct: 2,
    payNew: 0,
    payNewAmt: 0,
    active: 120,
    payAcct: 1,
    payAmt: 115
  }
};
export function makeRankings(scale = 1) {
  return GAMES.map((g, i) => {
    const fixed = FIXED_RANK[g.id];
    const s = scale;
    const base = fixed ? {
      ...fixed
    } : (() => {
      const newAcct = Math.max(1, Math.round((2.2 - i * 0.07) * (0.8 + rnd() * 0.4) * s));
      const active = Math.round(newAcct * (38 + rnd() * 22) * s);
      const payAcct = Math.round(active * (0.008 + rnd() * 0.006) * s);
      const payAmt = Math.round(payAcct * (100 + rnd() * 60) * s);
      return {
        newAcct,
        payNew: Math.round(newAcct * 0.08),
        payNewAmt: Math.round(newAcct * 0.08 * 20),
        active,
        payAcct,
        payAmt
      };
    })();
    const payNewRate = base.payNewAmt / Math.max(base.newAcct, 1) / 100;
    return {
      key: g.id,
      id: g.id,
      name: g.name,
      newAcct: base.newAcct,
      payNew: base.payNew,
      payNewAmt: base.payNewAmt,
      payNewRate,
      active: base.active,
      payAcct: base.payAcct,
      payCnt: base.payAcct,
      payAmt: base.payAmt,
      payRate: base.payAcct / Math.max(base.active, 1),
      arpu: base.payAmt / Math.max(base.active, 1),
      arppu: base.payAmt / Math.max(base.payAcct, 1)
    };
  }).sort((a, b) => b.newAcct - a.newAcct);
}
export function sumKey(rows, key) {
  return rows.reduce((s, r) => s + r[key], 0);
}
export const METRICS = {
  today: {
    newAcct: 3,
    newAcctY: 5,
    newAcct7: 5,
    payNew: 0,
    payNewY: 0,
    payNew7: 1,
    payNewAmt: 0,
    payNewAmtY: 0,
    payNewAmt7: 61.43,
    active: 1075,
    activeY: 1096,
    active7: 1176,
    payAcct: 12,
    payAcctY: 22,
    payAcct7: 44,
    payAmt: 1325,
    payAmtY: 2424,
    payAmt7: 6164.29,
    monthReg: 21,
    monthRegPrev: 196,
    monthRegAll: 132573,
    monthPay: 0,
    monthPayPrev: 350600,
    monthPayAll: 18425000
  },
  yesterday: {
    newAcct: 5,
    newAcctY: 3,
    newAcct7: 5,
    payNew: 0,
    payNewY: 0,
    payNew7: 1,
    payNewAmt: 0,
    payNewAmtY: 0,
    payNewAmt7: 61.43,
    active: 1096,
    activeY: 1075,
    active7: 1176,
    payAcct: 22,
    payAcctY: 12,
    payAcct7: 44,
    payAmt: 2424,
    payAmtY: 1325,
    payAmt7: 6164.29,
    monthReg: 19,
    monthRegPrev: 196,
    monthRegAll: 132573,
    monthPay: 310000,
    monthPayPrev: 350600,
    monthPayAll: 18425000
  },
  month: {
    newAcct: 21,
    newAcctY: 196,
    newAcct7: null,
    payNew: 1,
    payNewY: 18,
    payNew7: null,
    payNewAmt: 61.43,
    payNewAmtY: 620,
    payNewAmt7: null,
    active: 1075,
    activeY: 1096,
    active7: 1176,
    payAcct: 44,
    payAcctY: 420,
    payAcct7: null,
    payAmt: 6164.29,
    payAmtY: 58000,
    payAmt7: null,
    monthReg: 21,
    monthRegPrev: 196,
    monthRegAll: 132573,
    monthPay: 350600,
    monthPayPrev: 18425000,
    monthPayAll: 0
  }
};
export function fmt(n) {
  if (n == null) return "-";
  if (n >= 10000) return (n / 10000).toFixed(2) + "万";
  return n.toLocaleString("zh-CN");
}
export function fmtMoney(n) {
  if (n == null) return "-";
  if (n >= 10000) return "¥" + (n / 10000).toFixed(2) + "万";
  return "¥" + n.toLocaleString("zh-CN");
}
export function fmtPct(n) {
  if (n == null) return "-";
  return (n * 100).toFixed(2) + "%";
}
export function dailyRows(scale = 1) {
  const days = [];
  const base = new Date(2026, 7, 5);
  for (let i = 0; i < 30; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    const s = (0.9 + rnd() * 0.25) * scale;
    const newAcct = Math.round((6 + i * 0.12) * s);
    const active = Math.round(1050 + rnd() * 150 * s);
    const payAcct = Math.round(active * 0.02 * s);
    days.push({
      key: d.toISOString(),
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      newAcct,
      payNew: Math.round(newAcct * 0.15),
      payNewAmt: Math.round(newAcct * 0.15 * 22),
      payNewRate: 0.07,
      active,
      payAcct,
      payCnt: payAcct,
      payAmt: Math.round(payAcct * 155),
      payRate: payAcct / active,
      arpu: payAcct * 155 / active,
      arppu: 155
    });
  }
  return days;
}
const GROUP_BASE = {
  开天组: {
    reg: 320,
    regChg: 5,
    payNew: 12,
    pay: 85,
    rate: 3.8,
    flow: 21000,
    flowChg: 8,
    newFlow: 1000
  },
  屠龙组: {
    reg: 290,
    regChg: -2,
    payNew: 10,
    pay: 72,
    rate: 3.4,
    flow: 18000,
    flowChg: 1,
    newFlow: 1000
  },
  聚财组: {
    reg: 260,
    regChg: 3,
    payNew: 8,
    pay: 65,
    rate: 3.1,
    flow: 16000,
    flowChg: 5,
    newFlow: 1000
  },
  内容组: {
    reg: 180,
    regChg: 10,
    payNew: 6,
    pay: 48,
    rate: 3.3,
    flow: 12000,
    flowChg: 12,
    newFlow: 1000
  }
};
export function groupRows(scale = 1) {
  return GROUPS.map(group => {
    const b = GROUP_BASE[group];
    return {
      key: group,
      group,
      reg: Math.round(b.reg * scale),
      regChg: b.regChg,
      payNew: Math.round(b.payNew * scale),
      pay: Math.round(b.pay * scale),
      rate: b.rate,
      flow: Math.round(b.flow * scale),
      flowChg: b.flowChg,
      newFlow: Math.round(b.newFlow * scale)
    };
  });
}
export function projectRows(scale = 1) {
  const base = [{
    name: "聚玩游戏盒子",
    reg: 520,
    payNew: 18,
    pay: 120,
    rate: 3.5,
    flow: 38000,
    newFlow: 5000
  }, {
    name: "聚玩轻量版",
    reg: 380,
    payNew: 13,
    pay: 85,
    rate: 3.4,
    flow: 28000,
    newFlow: 3000
  }, {
    name: "聚玩H5版",
    reg: 280,
    payNew: 10,
    pay: 65,
    rate: 3.6,
    flow: 20000,
    newFlow: 2000
  }, {
    name: "聚玩国际版",
    reg: 150,
    payNew: 5,
    pay: 35,
    rate: 3.3,
    flow: 11000,
    newFlow: 1000
  }];
  return base.map(r => ({
    key: r.name,
    ...r,
    reg: Math.round(r.reg * scale),
    payNew: Math.round(r.payNew * scale),
    pay: Math.round(r.pay * scale),
    flow: Math.round(r.flow * scale),
    newFlow: Math.round(r.newFlow * scale)
  }));
}
export function trendSeries(scale = 1) {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(2026, 7, 5);
    d.setDate(d.getDate() - i);
    days.push([`${d.getMonth() + 1}/${d.getDate()}`, Math.round((6 + i * 0.12) * (0.85 + rnd() * 0.3) * scale)]);
  }
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const m = new Date(2026, 7 - i, 1);
    months.push([`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`, Math.round((90 + i * 8) * scale)]);
  }
  return {
    days,
    months
  };
}
export const CHANNELS = ["瓜游", "贰肆", "瓜玩", "996"];
export function channelDayRows(scale = 1) {
  return CHANNELS.map((c, i) => ({
    key: c,
    channel: c,
    reg: Math.round([445, 405, 589, 394][i] * scale),
    flow: Math.round([30000, 45000, 60000, 75000][i] * scale),
    change: [8, 8, 3, 3][i]
  }));
}
export const PRODUCTS = [{
  key: 1,
  channel: "瓜游",
  name: "聚玩游戏盒子",
  version: "聚玩盒子v3.2.1",
  type: ["整包", "安卓", "iOS"],
  partner: "星河互娱",
  contact: "张经理",
  point: "35%",
  status: "已引入",
  score: "S (5/5)"
}, {
  key: 2,
  channel: "贰肆",
  name: "聚玩轻量版",
  version: "聚玩轻量v2.1.0",
  type: ["分包", "安卓"],
  partner: "云帆科技",
  contact: "李总监",
  point: "28%",
  status: "已引入",
  score: "A (4/5)"
}, {
  key: 3,
  channel: "瓜玩",
  name: "聚玩H5版",
  version: "聚玩H5 v1.8.3",
  type: ["分包", "H5"],
  partner: "星辰网络",
  contact: "王主管",
  point: "30%",
  status: "已引入",
  score: "A (4/5)"
}, {
  key: 4,
  channel: "996",
  name: "聚玩国际版",
  version: "JW Global v1.0.5",
  type: ["整包", "iOS", "安卓", "海外"],
  partner: "GlobalTech",
  contact: "C.Liu",
  point: "25%",
  status: "测试中",
  score: "B (3/5)"
}, {
  key: 5,
  channel: "瓜游",
  name: "聚玩电竞版",
  version: "聚玩电竞v1.2.0",
  type: ["整包", "安卓"],
  partner: "灵动科技",
  contact: "陈经理",
  point: "22%",
  status: "评估中",
  score: "B (2/5)"
}, {
  key: 6,
  channel: "贰肆",
  name: "聚玩小程序版",
  version: "聚玩Mini v0.9.1",
  type: ["分包", "小程序"],
  partner: "锋芒电竞",
  contact: "赵总",
  point: "40%",
  status: "洽谈中",
  score: "C (2/5)"
}];
export const CHANNEL_DETAIL = [{
  key: 1,
  channel: "瓜游",
  project: "聚玩游戏盒子",
  reg: 1280,
  flow: 32.5,
  roi: 2.8,
  status: "优质"
}, {
  key: 2,
  channel: "贰肆",
  project: "聚玩轻量版",
  reg: 960,
  flow: 22.8,
  roi: 2.1,
  status: "优质"
}, {
  key: 3,
  channel: "瓜玩",
  project: "聚玩H5版",
  reg: 850,
  flow: 18.2,
  roi: 1.8,
  status: "正常"
}, {
  key: 4,
  channel: "996",
  project: "聚玩国际版",
  reg: 620,
  flow: 12.5,
  roi: 1.5,
  status: "正常"
}, {
  key: 5,
  channel: "瓜游",
  project: "聚玩电竞版",
  reg: 380,
  flow: 8.2,
  roi: 0.9,
  status: "风险"
}];
export const CHANNEL_REVENUE = [{
  key: 1,
  channel: "渠道A",
  month: "2026-07",
  flow: 320,
  cost: 180,
  profit: 140,
  status: "已结算"
}, {
  key: 2,
  channel: "渠道B",
  month: "2026-07",
  flow: 280,
  cost: 150,
  profit: 130,
  status: "已结算"
}, {
  key: 3,
  channel: "渠道C",
  month: "2026-07",
  flow: 220,
  cost: 130,
  profit: 90,
  status: "待结算"
}, {
  key: 4,
  channel: "渠道D",
  month: "2026-07",
  flow: 180,
  cost: 110,
  profit: 70,
  status: "已结算"
}, {
  key: 5,
  channel: "渠道E",
  month: "2026-07",
  flow: 90,
  cost: 70,
  profit: 20,
  status: "差异"
}];
export const CONTRACTS = [{
  key: 1,
  channel: "渠道A",
  no: "HT-2026-001",
  sign: "2026-01-15",
  due: "2027-01-14",
  amount: 500,
  status: "生效中"
}, {
  key: 2,
  channel: "渠道B",
  no: "HT-2026-002",
  sign: "2026-03-20",
  due: "2026-09-19",
  amount: 300,
  status: "即将到期"
}, {
  key: 3,
  channel: "渠道C",
  no: "HT-2026-003",
  sign: "2026-05-10",
  due: "2027-05-09",
  amount: 420,
  status: "生效中"
}, {
  key: 4,
  channel: "渠道D",
  no: "HT-2025-008",
  sign: "2025-08-01",
  due: "2026-07-31",
  amount: 250,
  status: "已过期"
}, {
  key: 5,
  channel: "渠道E",
  no: "HT-2026-005",
  sign: "2026-06-15",
  due: "2027-06-14",
  amount: 180,
  status: "生效中"
}];
export const PERSONNEL = [{
  key: 1,
  group: "开天组",
  name: "程云",
  nickname: "绿魔",
  status: "在职",
  team: "复用二组",
  join: "2025-08-12"
}, {
  key: 2,
  group: "开天组",
  name: "刘灿",
  nickname: "阎君",
  status: "在职",
  team: "复用二组",
  join: "2024-12-23"
}, {
  key: 3,
  group: "开天组",
  name: "蔡蒙蒙",
  nickname: "北极星",
  status: "在职",
  team: "复用二组",
  join: "2026-03-01"
}, {
  key: 4,
  group: "屠龙组",
  name: "沈向阳",
  nickname: "雷神",
  status: "在职",
  team: "复用一组",
  join: "2025-10-16"
}, {
  key: 5,
  group: "屠龙组",
  name: "周丽芳",
  nickname: "星云",
  status: "在职",
  team: "复用一组",
  join: "2025-11-19"
}, {
  key: 6,
  group: "聚财组",
  name: "朱梓鑫",
  nickname: "索尔",
  status: "在职",
  team: "复用三组",
  join: "2026-04-28"
}, {
  key: 7,
  group: "内容组",
  name: "郑雨鑫",
  nickname: "闪烁",
  status: "离职",
  team: "内容组",
  join: "2024-12-09"
}, {
  key: 8,
  group: "内容组",
  name: "聂丹妮",
  nickname: "蜘蛛侠",
  status: "在职",
  team: "内容组",
  join: "2024-11-12"
}, {
  key: 9,
  group: "养号",
  name: "唐丁玲",
  nickname: "旺达",
  status: "在职",
  team: "-",
  join: "2026-01-22"
}];
export const AUDIT_DATA = [{
  key: 1,
  time: "2026-08-04 14:30:22",
  user: "\u793A\u4F8B\u6210\u5458001",
  action: "查看",
  module: "核心看板",
  detail: "查看全局驾驶舱日维度数据",
  ip: "192.0.2.1",
  result: "成功"
}, {
  key: 2,
  time: "2026-08-04 14:30:05",
  user: "\u793A\u4F8B\u6210\u5458001",
  action: "登录",
  module: "系统认证",
  detail: "通过SSO登录系统",
  ip: "192.0.2.1",
  result: "成功"
}, {
  key: 3,
  time: "2026-08-04 14:28:15",
  user: "\u793A\u4F8B\u6210\u5458002",
  action: "导出",
  module: "核心看板",
  detail: "导出私域数据看板日注册趋势图",
  ip: "192.0.2.1",
  result: "成功"
}, {
  key: 4,
  time: "2026-08-04 14:25:40",
  user: "\u793A\u4F8B\u6210\u5458003",
  action: "查看",
  module: "私域数据看板",
  detail: "查看客服复用-开天组日数据",
  ip: "192.0.2.1",
  result: "成功"
}, {
  key: 5,
  time: "2026-08-04 14:20:10",
  user: "\u793A\u4F8B\u6210\u5458004",
  action: "编辑",
  module: "人员管理",
  detail: "修改个人档案-花名信息",
  ip: "192.0.2.1",
  result: "成功"
}, {
  key: 6,
  time: "2026-08-04 14:15:33",
  user: "\u793A\u4F8B\u6210\u5458005",
  action: "新增",
  module: "渠道合同",
  detail: "新增渠道合同 HT-2026-008",
  ip: "192.0.2.1",
  result: "成功"
}, {
  key: 7,
  time: "2026-08-04 14:10:05",
  user: "\u793A\u4F8B\u6210\u5458006",
  action: "编辑",
  module: "成本台账",
  detail: "修改7月渠道推广费用",
  ip: "192.0.2.1",
  result: "成功"
}, {
  key: 8,
  time: "2026-08-04 14:05:22",
  user: "\u793A\u4F8B\u6210\u5458007",
  action: "导出",
  module: "渠道经营",
  detail: "尝试导出全量渠道数据(权限不足)",
  ip: "192.0.2.1",
  result: "失败"
}, {
  key: 9,
  time: "2026-08-04 13:58:17",
  user: "\u793A\u4F8B\u6210\u5458008",
  action: "删除",
  module: "产品库",
  detail: "移除已下架产品-聚玩Mini版",
  ip: "192.0.2.1",
  result: "成功"
}, {
  key: 10,
  time: "2026-08-04 13:45:50",
  user: "\u793A\u4F8B\u6210\u5458001",
  action: "配置",
  module: "角色权限",
  detail: "修改运营人员角色权限-新增导出权限",
  ip: "192.0.2.1",
  result: "成功"
}, {
  key: 11,
  time: "2026-08-04 13:30:12",
  user: "\u793A\u4F8B\u6210\u5458009",
  action: "查看",
  module: "人员业绩排行",
  detail: "查看个人本月业绩排行",
  ip: "192.0.2.1",
  result: "成功"
}, {
  key: 12,
  time: "2026-08-04 13:25:45",
  user: "\u793A\u4F8B\u6210\u5458010",
  action: "查看",
  module: "人员档案",
  detail: "查看个人档案信息",
  ip: "192.0.2.1",
  result: "成功"
}, {
  key: 13,
  time: "2026-08-04 13:20:00",
  user: "\u793A\u4F8B\u6210\u5458011",
  action: "配置",
  module: "系统管理",
  detail: "修改系统全局配置-数据刷新间隔",
  ip: "192.0.2.1",
  result: "成功"
}, {
  key: 14,
  time: "2026-08-04 13:15:30",
  user: "\u793A\u4F8B\u6210\u5458012",
  action: "登录",
  module: "系统认证",
  detail: "独立账号登录失败-密码错误(第3次)",
  ip: "192.0.2.1",
  result: "失败"
}, {
  key: 15,
  time: "2026-08-04 13:10:02",
  user: "\u793A\u4F8B\u6210\u5458006",
  action: "查看",
  module: "财务总览",
  detail: "查看月度ROI汇总",
  ip: "192.0.2.1",
  result: "成功"
}, {
  key: 16,
  time: "2026-08-04 13:00:48",
  user: "\u793A\u4F8B\u6210\u5458002",
  action: "导出",
  module: "渠道合同",
  detail: "导出合同到期清单",
  ip: "192.0.2.1",
  result: "成功"
}];
