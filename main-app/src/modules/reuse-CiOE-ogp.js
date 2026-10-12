import { d as createCommentVNode } from "./runtime-core.esm-bundler-Bx3NYHNM.js";
import { n as e } from "./chunk-QTnfLwEv.js";
import { C as t, f as n, p as r } from "./InsightRank-UG5EYt59.js";
import { $ as i, A as a, At as o, F as s, G as c, L as l, N as u, X as d, _ as f, c as p, ct as m, f as h, g, i as ee, j as _, l as v, tt as y, u as b } from "./runtime-core.esm-bundler-Bx3NYHNM.js";
import { t as x } from "./common-D9V9KONM.js";
function S(e, t) {
  return r({
    url: `/reuse/dashboard/kpi`,
    method: `get`,
    params: {
      projectId: e,
      deptId: t
    }
  });
}
function C(e = 14, t, n, i, a) {
  return r({
    url: `/reuse/dashboard/trend`,
    method: `get`,
    params: {
      days: e,
      startDate: t,
      endDate: n,
      projectId: i,
      deptId: a
    }
  });
}
var backlogPeriod = `today`,
  backlogStartDate = null,
  backlogEndDate = null;
function w(e = `project`, t, n) {
  return r({
    url: `/reuse/dashboard/backlog`,
    method: `get`,
    params: {
      dimension: e,
      projectId: t,
      deptId: n,
      period: backlogPeriod,
      startDate: backlogStartDate,
      endDate: backlogEndDate
    }
  });
}
function T(e = 100, t, n, i, a) {
  return r({
    url: `/reuse/dashboard/success-rank`,
    method: `get`,
    params: {
      limit: e,
      startDate: t,
      endDate: n,
      projectId: i,
      deptId: a
    }
  });
}
function E(e, t) {
  return r({
    url: `/reuse/dashboard/cohort`,
    method: `get`,
    params: {
      projectId: e,
      deptId: t
    }
  });
}
function te(e, t, n, i) {
  return r({
    url: `/reuse/dashboard/sankey`,
    method: `get`,
    params: {
      startDate: e,
      endDate: t,
      projectId: n,
      deptId: i
    }
  });
}
function D(e) {
  return r({
    url: `/reuse/dashboard/sankey-detail`,
    method: `get`,
    params: e
  });
}
function O(e) {
  return r({
    url: `/reuse/dashboard/promoter/list`,
    method: `get`,
    params: e
  });
}
function k(e, t, n, i) {
  return r({
    url: `/reuse/dashboard/promoter/${encodeURIComponent(e)}/players`,
    method: `get`,
    params: {
      limit: t,
      startDate: n,
      endDate: i
    }
  });
}
var A = e => Number(e) || 0,
  j = e => `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, `0`)}-${String(e.getDate()).padStart(2, `0`)}`,
  M = () => new Date(),
  N = () => {
    let e = new Date();
    return e.setDate(1), e;
  };
function P() {
  let e = i({
      time: `过去7天`,
      project: `全部项目`,
      dept: `全部部门`,
      emp: `全部员工`,
      startDate: null,
      endDate: null,
      sankeyMode: `both`,
      sankeyTime: `昨日`,
      sankeyStartDate: null,
      sankeyEndDate: null,
      successTime: `昨日`,
      successStartDate: null,
      successEndDate: null
    }),
    filters = e,
    t = y(`project`),
    n = y([`全部项目`]),
    r = y([`全部部门`]),
    a = y([`全部员工`]),
    o = y([]),
    s = y({}),
    c = y({}),
    l = y([]),
    u = y(!1),
    d = y(0),
    f = y(null),
    m = y([]),
    h = y([]),
    g = y([]),
    ee = y([]),
    _ = y([]),
    v = y([]),
    b = y([]),
    sankeyLoading = y(!1),
    successLoading = y(!1);
  async function D(e, t) {
    u.value = !0;
    try {
      let [i, u, p, y, D, k, A, P, I, L] = await Promise.all([S(e, t).catch(() => ({
        data: null
      })), C(31, j(N()), j(M()), e, t).catch(() => ({
        data: []
      })), w(`project`, e, t).catch(() => ({
        data: []
      })), w(`dept`, e, t).catch(() => ({
        data: []
      })), w(`staff`, e, t).catch(() => ({
        data: []
      })), T(100, filters.successStartDate || void 0, filters.successEndDate || void 0, e, t).catch(() => ({
        data: []
      })), E(e, t).catch(() => ({
        data: []
      })), te(filters.sankeyStartDate || void 0, filters.sankeyEndDate || void 0, e, t).catch(() => ({
        data: []
      })), x().catch(() => ({
        data: null
      })), O({
        sortField: `payAmount`,
        sortOrder: `desc`,
        pageNum: 1,
        pageSize: 10
      }).catch(() => ({
        data: {}
      }))]);
      f.value = i.data || {}, m.value = Array.isArray(u.data) ? u.data : [], h.value = Array.isArray(p.data) ? p.data : [], g.value = Array.isArray(y.data) ? y.data : [], ee.value = Array.isArray(D.data) ? D.data : [], _.value = Array.isArray(k.data) ? k.data : [], v.value = Array.isArray(A.data) ? A.data : [], b.value = Array.isArray(P.data) ? P.data : [];
      let R = L.data || {};
      if (z.value = R.records || R.list || [], V.value = Number(R.total || R.records?.length || 0), I.data) {
        let e = I.data;
        d.value = e.version || 0, n.value = [`全部项目`, ...(e.projects || []).map(e => e.projectName).filter(Boolean)];
        let t = {};
        (e.projects || []).forEach(e => {
          e.projectId && (t[e.projectName] = e.projectId);
        }), c.value = t, r.value = [`全部部门`, ...F(e.departments || []).map(e => e.deptName).filter(Boolean)], o.value = e.departments || [], s.value = ne(e.departments || []), l.value = (e.employees || []).map(e => ({
          value: e.value,
          label: e.label,
          deptId: e.deptId,
          deptName: e.deptName,
          projectId: e.projectId,
          projectName: e.projectName
        })), a.value = [`全部员工`, ...l.value.map(e => e.label)];
      }
    } catch (e) {
      console.error(`[useReuseData] 数据加载失败:`, e);
    } finally {
      u.value = !1;
    }
  }
  async function P(e, t, n, r) {
    sankeyLoading.value = !0;
    try {
      let response = await te(e || void 0, t || void 0, n, r);
      b.value = Array.isArray(response.data) ? response.data : [];
    } catch (e) {
      console.error(`[useReuseData] 桑基图数据加载失败:`, e);
    } finally {
      sankeyLoading.value = !1;
    }
  }
  function ne(e) {
    let t = {};
    function n(e) {
      for (let r of e) t[r.deptId] = r.deptName, r.children && r.children.length > 0 && n(r.children);
    }
    return n(e), t;
  }
  function F(e) {
    let t = [];
    function n(e) {
      for (let r of e) t.push(r), r.children && r.children.length > 0 && n(r.children);
    }
    return n(e), t;
  }
  async function I() {
    try {
      let e = await x();
      if (e.data) {
        let t = e.data;
        d.value = t.version || 0, n.value = [`全部项目`, ...(t.projects || []).map(e => e.projectName).filter(Boolean)];
        let i = {};
        (t.projects || []).forEach(e => {
          e.projectId && (i[e.projectName] = e.projectId);
        }), c.value = i, r.value = [`全部部门`, ...F(t.departments || []).map(e => e.deptName).filter(Boolean)], l.value = (t.employees || []).map(e => ({
          value: e.value,
          label: e.label,
          deptId: e.deptId,
          deptName: e.deptName,
          projectId: e.projectId,
          projectName: e.projectName
        })), a.value = [`全部员工`, ...l.value.map(e => e.label)];
      }
    } catch (e) {
      console.error(`[useReuseData] 加载花名册选项失败:`, e);
    }
  }
  let L = p(() => {
      let e = f.value || {},
        t = {
          newPool: A(e.newPool || e.silentAssetCount) - A(e.silentAssetCountYesterday),
          newPoolDiff: A(e.newPoolDiff || 0),
          newReused: A(e.newReused || e.activatedCount) - A(e.activatedCountYesterday),
          newReusedDiff: A(e.newReusedDiff || 0),
          newPending: A(e.newPending || 0),
          newPendingDiff: A(e.newPendingDiff || 0),
          yesterdayRevenue: A(e.yesterdayRevenue || 0),
          yesterdayRevenueDiff: A(e.yesterdayRevenueDiff || 0),
          monthPool: A(e.monthPool || e.silentAssetCount),
          monthPoolPrev: A(e.monthPoolPrev || 0),
          silentAssetCount: A(e.silentAssetCount),
          monthReused: A(e.monthReused || e.activatedCount),
          monthReusedPrev: A(e.monthReusedPrev || 0),
          reusedPrev: A(e.reusedPrev || 0),
          monthPending: A(e.monthPending || 0),
          monthPendingPrev: A(e.monthPendingPrev || 0),
          pendingPrev: A(e.pendingPrev || 0),
          monthRevenue: A(e.monthRevenue || 0),
          monthRevenuePrev: A(e.monthRevenuePrev || 0),
          revenuePrev: A(e.revenuePrev || 0),
          reusedTotal: A(e.reusedTotal || 0),
          revenueTotal: A(e.revenueTotal || 0),
          poolTotal: A(e.poolTotal || 0),
          pendingTotal: A(e.pendingTotal || 0)
        },
        n = (m.value || []).map(e => ({
          date: (e.date || ``).slice(5),
          activatedCount: A(e.activatedCount),
          revenue: A(e.revenue || 0)
        })),
        r = [{
          name: `复用成功人数`,
          key: `users`,
          color: `#165DFF`,
          type: `bar`,
          yAxisIndex: 0,
          data: n.map(e => ({
            date: e.date,
            value: e.activatedCount
          }))
        }, {
          name: `复用产生流水`,
          key: `revenue`,
          color: `#FF7D00`,
          type: `line`,
          yAxisIndex: 1,
          data: n.map(e => ({
            date: e.date,
            value: e.revenue
          }))
        }],
        i = {
          byProject: (h.value || []).map(e => ({
            name: e.name,
            count: A(e.count)
          })),
          byDepartment: (g.value || []).map(e => ({
            name: e.name,
            count: A(e.count)
          })),
          byEmployee: (ee.value || []).map(e => ({
            name: e.name,
            count: A(e.count)
          }))
        },
        a = [`#165DFF`, `#00B42A`, `#FF7D00`, `#722ED1`, `#F53F3F`, `#0FC6C2`, `#EB2F96`],
        o = b.value || [],
        s = new Map(),
        l = new Map(),
        u = [];
      for (let e of o) {
        let t = e.source || ``,
          n = e.target || ``,
          r = A(e.count),
          i = A(e.revenue);
        !t || !n || r <= 0 || (s.has(t) || s.set(t, {
          name: t,
          itemStyle: {
            color: a[s.size % a.length]
          }
        }), l.has(n) || l.set(n, {
          name: n,
          itemStyle: {
            color: `#00B42A`
          }
        }), u.push({
          source: t,
          target: n,
          value: r,
          moneyValue: i
        }));
      }
      for (let [e, t] of l) if (s.has(e)) {
        let n = e + `（转）`;
        t.name = n;
        for (let t of u) t.target === e && (t.target = n);
      }
      let d = {
          nodes: [...[...s.values()].map(e => ({
            ...e,
            depth: 0
          })), ...[...l.values()].map(e => ({
            ...e,
            depth: 1
          }))],
          links: u
        },
        p = _.value || [],
        v = p.reduce((e, t) => e + A(t.revenue), 0),
        y = p.map(e => ({
          name: e.gsName || e.name || ``,
          dept: e.deptName || e.dept || ``,
          users: A(e.users) || A(e.convertedUsers) || 1,
          revenue: A(e.revenue) || 0,
          pct: v > 0 ? (A(e.revenue) / v * 100).toFixed(1) : `0.0`
        })),
        x = new Map();
      for (let e of p) {
        let t = e.deptName || e.dept || e.name || `未知部门`,
          n = x.get(t);
        n ? (n.users += A(e.users) || A(e.convertedUsers) || 1, n.revenue += A(e.revenue) || 0) : x.set(t, {
          name: t,
          dept: ``,
          users: A(e.users) || 1,
          revenue: A(e.revenue) || 0
        });
      }
      let S = [...x.values()].reduce((e, t) => e + t.revenue, 0);
      return {
        projectMap: c,
        kpi: t,
        trend: r,
        backlog: i,
        sankey: d,
        insight: y,
        insightDept: [...x.values()].sort((e, t) => t.revenue - e.revenue || t.users - e.users || String(e.name).localeCompare(String(t.name))).map(e => ({
          ...e,
          pct: S > 0 ? (e.revenue / S * 100).toFixed(1) : `0.0`
        }))
      };
    }),
    R = p(() => {
      let n = L.value.backlog;
      return e.project === `全部项目` ? t.value === `department` ? n.byDepartment : t.value === `employee` ? n.byEmployee : n.byProject : n.byEmployee;
    }),
    re = p(() => e.dept && e.dept !== `全部部门` ? L.value.insight : L.value.insightDept);
  async function ie(e, t, n, r) {
    successLoading.value = !0;
    try {
      let i = await T(100, e, t, n, r);
      _.value = Array.isArray(i.data) ? i.data : [];
    } catch (e) {
      console.error(`[useReuseData] 成功复用排名加载失败:`, e);
    } finally {
      successLoading.value = !1;
    }
  }
  async function ae(e, t) {
    try {
      let n = await C(14, e, t);
      m.value = Array.isArray(n.data) ? n.data : [];
    } catch (e) {
      console.error(`[useReuseData] 趋势数据加载失败:`, e);
    }
  }
  let z = y([]),
    B = y(!1),
    V = y(0),
    H = y(``),
    U = y(1),
    W = y(10),
    G = y([]),
    K = y(!1),
    q = y(null),
    promoterStartDate = null,
    promoterEndDate = null;
  return {
    projectMap: c,
    filters: e,
    backlogTab: t,
    projectOptions: n,
    deptOptions: r,
    deptTree: o,
    deptIdToName: s,
    empOptions: a,
    result: L,
    backlogData: R,
    insightData: re,
    loading: u,
    sankeyLoading,
    successLoading,
    loadAll: D,
    syncFilterOptions: I,
    dataVersion: d,
    loadSankey: P,
    loadSuccessRank: ie,
    loadTrend: ae,
    apiSankey: b,
    promoterList: z,
    promoterLoading: B,
    promoterTotal: V,
    promoterKeyword: H,
    promoterPage: U,
    promoterPageSize: W,
    promoterPlayers: G,
    promoterPlayersLoading: K,
    promoterExpanded: q,
    setPromoterRange: (e, t) => {
      promoterStartDate = e, promoterEndDate = t;
    },
    loadPromoterList: async () => {
      B.value = !0;
      try {
        let e = (await O({
          keyword: H.value || void 0,
          pageNum: U.value,
          pageSize: W.value,
          sortField: `payAmount`,
          sortOrder: `desc`,
          startDate: promoterStartDate || void 0,
          endDate: promoterEndDate || void 0
        })).data || {};
        z.value = e.records || e.list || [], V.value = Number(e.total || e.records?.length || 0);
      } catch (e) {
        console.warn(`推广员列表加载失败:`, e), z.value = [];
      } finally {
        B.value = !1;
      }
    },
    loadPromoterPlayers: async e => {
      K.value = !0, q.value = e;
      try {
        let t = (await k(e, 200, promoterStartDate || void 0, promoterEndDate || void 0)).data || {};
        G.value = t.players || t.list || [];
      } catch (e) {
        console.warn(`玩家明细加载失败:`, e), G.value = [];
      } finally {
        K.value = !1;
      }
    }
  };
}
var ne = e({
    default: () => J
  }),
  F = {
    class: `system-page reuse-page`
  },
  I = {
    class: `top-bar`
  },
  L = {
    class: `top-selectors`
  },
  R = {
    class: `kpi-row`
  },
  re = {
    class: `kpi-row`
  },
  ie = {
    class: `kpi-sub`
  },
  ae = {
    class: `kpi-sub`
  },
  z = {
    class: `kpi-sub`
  },
  B = {
    class: `kpi-sub`
  },
  V = {
    class: `kpi-sub`
  },
  H = {
    class: `kpi-sub`
  },
  U = {
    class: `kpi-sub`
  },
  W = {
    class: `kpi-sub`
  },
  G = {
    class: `triple-panel`
  },
  K = {
    class: `panel-block`,
    style: {
      position: `relative`
    }
  },
  q = {
    style: {
      position: `absolute`,
      top: `12px`,
      right: `16px`,
      "z-index": `10`
    }
  },
  oe = {
    class: `panel-title`,
    style: {
      "padding-right": `80px`
    }
  },
  se = {
    class: `panel-block`,
    style: {
      position: `relative`
    }
  },
  ce = {
    style: {
      position: `absolute`,
      top: `12px`,
      right: `16px`,
      "z-index": `10`,
      display: `flex`,
      gap: `6px`,
      "align-items": `center`
    }
  },
  le = {
    class: `panel-title`,
    style: {
      "padding-right": `200px`
    }
  },
  ue = {
    class: `panel-block`,
    style: {
      position: `relative`
    }
  },
  de = {
    style: {
      position: `absolute`,
      top: `12px`,
      right: `16px`,
      "z-index": `10`
    }
  },
  fe = {
    class: `panel-title`,
    style: {
      "padding-right": `80px`
    }
  },
  pe = {
    style: {
      "text-align": `right`,
      display: `block`
    }
  },
  J = t({
    __name: `reuse`,
    setup(e) {
      let {
        filters: t,
        backlogTab: r,
        projectOptions: x,
        deptOptions: S,
        deptTree: C,
        deptIdToName: w,
        projectMap: T,
        result: E,
        backlogData: te,
        insightData: O,
        loading: reuseLoading,
        sankeyLoading,
        successLoading,
        loadAll: k,
        syncFilterOptions: A,
        loadSankey: j,
        loadSuccessRank: M,
        loadTrend: N,
        promoterList: ne,
        promoterLoading: J,
        promoterTotal: me,
        promoterKeyword: he,
        promoterPage: Y,
        promoterPageSize: ge,
        promoterPlayers: _e,
        promoterPlayersLoading: ve,
        promoterExpanded: ye,
        setPromoterRange: promoterSetRange,
        loadPromoterList: be,
        loadPromoterPlayers: xe
      } = P();
      a(() => k());
      let Se = null;
      function Ce() {
        Se = setInterval(() => {
          A();
        }, 300 * 1e3);
      }
      a(() => Ce()), _(() => {
        Se && clearInterval(Se);
      });
      async function we() {
        await A();
      }
      let X = y(!1);
      function Te(e) {
        X.value = !0, xe(e);
      }
      function promoterRangeChanged(e) {
        let n = e => e ? `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, `0`)}-${String(e.getDate()).padStart(2, `0`)}` : null;
        promoterSetRange(n(e.start), n(e.end)), Y.value = 1, be();
      }
      y([]);
      let Z = p(() => E.value.kpi),
        Ee = p(() => E.value.trend),
        De = p(() => E.value.sankey);
      function Oe(e) {
        return !e || e <= 0 ? `—` : e.toLocaleString();
      }
      function Q(e) {
        if (e == null || e === ``) return `—`;
        let t = typeof e == `string` ? parseFloat(e) : e;
        return isNaN(t) ? `—` : `¥` + t.toLocaleString(void 0, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      }
      function ke(e) {
        let n = t => t ? `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, `0`)}-${String(t.getDate()).padStart(2, `0`)}` : null;
        backlogPeriod = e && e.key ? e.key : `today`;
        backlogStartDate = n(e && e.start);
        backlogEndDate = n(e && e.end);
        window.__REUSE_BACKLOG_RANGE__ = {
          period: backlogPeriod,
          startDate: backlogStartDate,
          endDate: backlogEndDate
        };
        Ne();
      }
      function Ae(e) {
        let n = e => e ? `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, `0`)}-${String(e.getDate()).padStart(2, `0`)}` : null;
        t.sankeyStartDate = n(e.start), t.sankeyEndDate = n(e.end), j(n(e.start), n(e.end), Pe(), Fe());
      }
      function je(e) {
        let n = e => {
          if (e) return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, `0`)}-${String(e.getDate()).padStart(2, `0`)}`;
        };
        t.successTime = e.short || `自定义`, t.successStartDate = e.start ? n(e.start) : null, t.successEndDate = e.end ? n(e.end) : null, M(e.start ? n(e.start) : void 0, e.end ? n(e.end) : void 0, Pe(), Fe());
      }
      function Me(e) {
        let t = e => {
          if (e) return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, `0`)}-${String(e.getDate()).padStart(2, `0`)}`;
        };
        N(e.start ? t(e.start) : void 0, e.end ? t(e.end) : void 0);
      }
      function Ne() {
        t.project ||= `全部项目`;
        let e = Pe(),
          n = Fe();
        console.log(`[reuse] filter change:`, {
          project: t.project,
          dept: t.dept,
          pid: e,
          did: n
        }), k(e, n);
      }
      function Pe() {
        return t.project && t.project !== `全部项目` ? T.value[t.project] : void 0;
      }
      function Fe() {
        return t.dept && t.dept !== `全部部门` ? t.dept : void 0;
      }
      let $ = i({
          visible: !1,
          loading: !1,
          list: []
        }),
        Ie = y(`desc`);
      p(() => {
        let e = [...$.list];
        return e.sort((e, t) => {
          let n = e.totalRecharge || 0,
            r = t.totalRecharge || 0;
          return Ie.value === `desc` ? r - n : n - r;
        }), e;
      });
      async function Le(e) {
        $.visible = !0, $.loading = !0, $.list = [];
        try {
          let n = {};
          e.source && (n.source = e.source), e.target && (n.target = e.target), t.sankeyStartDate && (n.startDate = t.sankeyStartDate), t.sankeyEndDate && (n.endDate = t.sankeyEndDate);
          let r = await D(n);
          $.list = Array.isArray(r.data) ? r.data : [];
        } catch (e) {
          console.error(`[reuse] 桑基图详情加载失败:`, e), $.list = [];
        } finally {
          $.loading = !1;
        }
      }
      function queryOverlay() {
        return v(`div`, {
          class: `reuse-query-overlay`,
          role: `status`,
          "aria-live": `polite`
        }, [v(`span`, {
          class: `reuse-query-spinner`,
          "aria-hidden": `true`
        }), v(`span`, null, `正在查询…`)]);
      }
      return (e, i) => {
        let a = l(`PageHeader`),
          p = l(`a-option`),
          _ = l(`a-select`),
          y = l(`a-tree-select`),
          S = l(`KpiCard`),
          w = l(`a-tooltip`),
          T = l(`BacklogBar`),
          E = l(`SankeyChart`),
          D = l(`InsightRank`),
          k = l(`TrendChart`),
          A = l(`ChartCard`),
          j = l(`a-table-column`),
          M = l(`a-table`),
          N = l(`a-modal`),
          P = l(`a-input-search`),
          xe = l(`a-button`);
        return u(), h(`div`, F, [f(a, {
          title: `私域复用·数据看板`
        }), v(`div`, I, [i[13] ||= v(`span`, {
          class: `status-indicator`
        }, `每日凌晨 01:00~04:00 更新数据，数据统计截至今日凌晨 00:00`, -1), v(`div`, L, [f(_, {
          modelValue: m(t).project,
          "onUpdate:modelValue": i[0] ||= e => m(t).project = e,
          style: {
            width: `120px`
          },
          size: `small`,
          "allow-clear": ``,
          onChange: Ne
        }, {
          default: c(() => [(u(!0), h(ee, null, s(m(x), e => (u(), b(p, {
            key: e,
            value: e
          }, {
            default: c(() => [g(o(e), 1)]),
            _: 2
          }, 1032, [`value`]))), 128))]),
          _: 1
        }, 8, [`modelValue`]), f(y, {
          modelValue: m(t).dept,
          "onUpdate:modelValue": i[1] ||= e => m(t).dept = e,
          class: `dept-tree-select`,
          data: m(C),
          "field-names": {
            key: `deptId`,
            title: `deptName`,
            children: `children`
          },
          style: {
            width: `140px`
          },
          placeholder: `全部部门`,
          size: `small`,
          "allow-clear": ``,
          onChange: Ne
        }, null, 8, [`modelValue`, `data`]), v(`span`, {
          class: `sync-btn`,
          onClick: we,
          title: `同步数据`
        }, [...(i[12] ||= [v(`svg`, {
          width: `18`,
          height: `18`,
          viewBox: `0 0 24 24`,
          fill: `none`,
          stroke: `currentColor`,
          "stroke-width": `1.8`,
          "stroke-linecap": `round`,
          "stroke-linejoin": `round`
        }, [v(`path`, {
          d: `M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2`
        })], -1)])])])]), v(`div`, R, [f(S, {
          title: `新增可复用数`,
          value: Z.value.newPool,
          tooltip: `昨日新增的可复用（统一断登超过24小时，进入复用流程）用户数量`,
          trend: Z.value.newPoolDiff,
          format: `number`
        }, null, 8, [`value`, `trend`]), f(S, {
          title: `新增已复用数`,
          value: Z.value.newReused,
          tooltip: `昨日新增的已成功复用（有新游戏注册行为）的用户数量`,
          trend: Z.value.newReusedDiff,
          format: `number`
        }, null, 8, [`value`, `trend`]), f(S, {
          title: `新增待复用数`,
          value: Z.value.newPending,
          tooltip: `昨日新增未成功复用的用户数量（新增可复用数 - 新增已复用数）`,
          trend: Z.value.newPendingDiff,
          format: `number`
        }, null, 8, [`value`, `trend`]), f(S, {
          title: `昨日新增流水`,
          value: Z.value.yesterdayRevenue,
          tooltip: `昨日复用成功的用户在游戏内产生的充值流水总额`,
          trend: Z.value.yesterdayRevenueDiff,
          format: `money`
        }, null, 8, [`value`, `trend`])]), v(`div`, re, [f(S, {
          title: `本月可复用数`,
          value: Z.value.monthPool,
          tooltip: `本月累计的可复用用户数量`
        }, {
          footer: c(() => [v(`span`, ie, `上月累计 ` + o(Oe(Z.value.monthPoolPrev)), 1), v(`span`, ae, `历史累计 ` + o(Z.value.poolTotal), 1)]),
          _: 1
        }, 8, [`value`]), f(S, {
          title: `本月已复用数`,
          value: Z.value.monthReused,
          tooltip: `本月累计的已成功复用（有新游戏注册行为）的用户数量`
        }, {
          footer: c(() => [v(`span`, z, `上月累计 ` + o(Oe(Z.value.monthReusedPrev)), 1), v(`span`, B, `历史累计 ` + o(Z.value.reusedTotal), 1)]),
          _: 1
        }, 8, [`value`]), f(S, {
          title: `本月待复用数`,
          value: Z.value.monthPending,
          tooltip: `本月累计未成功复用的用户数量（本月可复用数 - 本月已复用数）`
        }, {
          footer: c(() => [v(`span`, V, `上月累计 ` + o(Oe(Z.value.monthPendingPrev)), 1), v(`span`, H, `历史累计 ` + o(Z.value.pendingTotal), 1)]),
          _: 1
        }, 8, [`value`]), f(S, {
          title: `本月复用产生流水`,
          value: Z.value.monthRevenue,
          tooltip: `本月成功复用用户在游戏内产生的充值流水总额`,
          format: `money`
        }, {
          footer: c(() => [v(`span`, U, `上月累计 ¥` + o(Z.value.monthRevenuePrev ? Z.value.monthRevenuePrev.toLocaleString() : `—`), 1), v(`span`, W, `历史累计 ¥` + o(Z.value.revenueTotal ? Z.value.revenueTotal.toLocaleString() : `—`), 1)]),
          _: 1
        }, 8, [`value`])]), v(`div`, G, [v(`div`, K, [v(`div`, q, [f(n, {
          default: `today`,
          extra: [{
            key: `total`,
            label: `历史累计`
          }],
          onChange: ke
        })]), v(`div`, oe, [v(`span`, null, [i[15] ||= g(`项目待复用数据 `, -1), f(w, {
          content: `按所选区间统计未成功复用的用户数量；选“历史累计”为截至今日的存量`,
          position: `top`,
          mini: ``
        }, {
          default: c(() => [...(i[14] ||= [v(`span`, {
            class: `field-tip`
          }, `ⓘ`, -1)])]),
          _: 1
        })])]), f(T, {
          data: m(te),
          "active-tab": m(r),
          "onUpdate:activeTab": i[2] ||= e => {
            r.value = e, Ne();
          }
        }, null, 8, [`data`, `active-tab`]), m(reuseLoading) ? queryOverlay() : createCommentVNode(``, !0)]), v(`div`, se, [v(`div`, ce, [f(_, {
          modelValue: m(t).sankeyMode,
          "onUpdate:modelValue": i[3] ||= e => m(t).sankeyMode = e,
          size: `small`,
          style: {
            width: `110px`
          }
        }, {
          default: c(() => [f(p, {
            value: `both`
          }, {
            default: c(() => [...(i[16] ||= [g(`人数和流水`, -1)])]),
            _: 1
          }), f(p, {
            value: `count`
          }, {
            default: c(() => [...(i[17] ||= [g(`仅人数`, -1)])]),
            _: 1
          }), f(p, {
            value: `money`
          }, {
            default: c(() => [...(i[18] ||= [g(`仅流水`, -1)])]),
            _: 1
          })]),
          _: 1
        }, 8, [`modelValue`]), f(n, {
          default: `yesterday`,
          onChange: Ae
        })]), v(`div`, le, [v(`span`, null, [i[20] ||= g(`用户复用轨迹 `, -1), f(w, {
          content: `呈现已成功复用（有新游戏注册行为）的用户从一个项目流出、向另一个项目流入的转化链路。默认按复用人数由多到少降序展示。`,
          position: `top`,
          mini: ``
        }, {
          default: c(() => [...(i[19] ||= [v(`span`, {
            class: `field-tip`
          }, `ⓘ`, -1)])]),
          _: 1
        })])]), f(E, {
          data: De.value,
          height: 420,
          mode: m(t).sankeyMode,
          onDetail: Le
        }, null, 8, [`data`, `mode`]), m(reuseLoading) || m(sankeyLoading) ? queryOverlay() : createCommentVNode(``, !0)]), v(`div`, ue, [v(`div`, de, [f(n, {
          default: `yesterday`,
          onChange: je
        })]), v(`div`, fe, [v(`span`, null, [i[22] ||= g(`成功复用数据 `, -1), f(w, {
          content: `各项目/部门/员工成功复用用户后产生的流水金额。`,
          position: `top`,
          mini: ``
        }, {
          default: c(() => [...(i[21] ||= [v(`span`, {
            class: `field-tip`
          }, `ⓘ`, -1)])]),
          _: 1
        })])]), f(D, {
          data: m(O)
        }, null, 8, [`data`]), m(reuseLoading) || m(successLoading) ? queryOverlay() : createCommentVNode(``, !0)])]), f(A, {
          title: `复用成功人数与流水趋势`
        }, {
          toolbar: c(() => [f(n, {
            default: `month`,
            onChange: Me
          })]),
          default: c(() => [f(k, {
            data: Ee.value,
            height: 280,
            "dual-axis": !0,
            "dual-axis-config": {
              leftTitle: `人数（人）`,
              rightTitle: `流水（元）`,
              rightFormat: `money`
            },
            "show-bar-label": !0
          }, null, 8, [`data`])]),
          _: 1
        }), f(N, {
          visible: $.visible,
          "onUpdate:visible": i[4] ||= e => $.visible = e,
          title: `流转明细`,
          width: 960,
          footer: !1,
          onCancel: i[5] ||= e => $.visible = !1
        }, {
          default: c(() => [f(M, {
            data: $.list,
            loading: $.loading,
            "row-key": `recordId`,
            pagination: {
              pageSize: 10,
              showTotal: !0
            },
            scroll: {
              x: 900
            }
          }, {
            columns: c(() => [f(j, {
              title: `游戏账号`,
              "data-index": `gameAccount`,
              width: 120
            }), f(j, {
              title: `星级`,
              "data-index": `starLevel`,
              width: 80
            }), f(j, {
              title: `累计充值金额`,
              width: 130
            }, {
              cell: c(({
                record: e
              }) => [g(o(Q((e.totalRecharge || 0) / 100)), 1)]),
              _: 1
            }), f(j, {
              title: `推广员`,
              "data-index": `gsName`,
              width: 100
            }), f(j, {
              title: `部门`,
              "data-index": `deptName`,
              width: 100
            }), f(j, {
              title: `复用人员`,
              "data-index": `wxNickname`,
              width: 120
            }), f(j, {
              title: `日期`,
              width: 110
            }, {
              cell: c(({
                record: e
              }) => [g(o((e.createdAt || ``).substring(0, 10)), 1)]),
              _: 1
            }), f(j, {
              title: `最后充值时间`,
              "data-index": `lastRechargeTime`,
              width: 150
            }), f(j, {
              title: `原项目`,
              "data-index": `originalProjectName`,
              width: 120
            }), f(j, {
              title: `目标项目`,
              "data-index": `reuseProjectName`,
              width: 120
            })]),
            _: 1
          }, 8, [`data`, `loading`])]),
          _: 1
        }, 8, [`visible`]), f(A, {
          title: `推广员数据明细`
        }, {
          toolbar: c(() => [f(n, {
            default: `yesterday`,
            onChange: promoterRangeChanged
          }), f(P, {
            modelValue: m(he),
            "onUpdate:modelValue": i[6] ||= e => d(he) ? he.value = e : null,
            placeholder: `搜索推广员账号或姓名/ID`,
            style: {
              width: `220px`
            },
            onSearch: i[7] ||= e => {
              Y.value = 1, m(be)();
            },
            onClear: i[8] ||= e => {
              Y.value = 1, m(be)();
            },
            "allow-clear": ``
          }, null, 8, [`modelValue`])]),
          default: c(() => [f(M, {
            data: m(ne),
            loading: m(J),
            pagination: {
              current: m(Y),
              pageSize: m(ge),
              total: m(me),
              showTotal: !0
            },
            scroll: {
              y: 500,
              x: 920
            },
            onPageSizeChange: i[9] ||= e => {
              ge.value = e, Y.value = 1, m(be)();
            },
            "row-key": `unionId`
          }, {
            columns: c(() => [f(j, {
              title: `推广员账号`,
              "data-index": `unionName`,
              width: 130
            }), f(j, {
              title: `游戏名称`,
              "data-index": `gameName`,
              width: 140
            }), f(j, {
              title: `推广员ID`,
              "data-index": `unionId`,
              width: 100
            }), f(j, {
              title: `注册玩家数`,
              "data-index": `regUserCount`,
              width: 100,
              sortable: {
                sortDirections: [`ascend`, `descend`]
              },
              align: `right`
            }), f(j, {
              title: `充值玩家数`,
              "data-index": `payUserCount`,
              width: 100,
              sortable: {
                sortDirections: [`ascend`, `descend`]
              },
              align: `right`
            }), f(j, {
              title: `总流水金额`,
              width: 130,
              sortable: {
                sortDirections: [`ascend`, `descend`]
              },
              align: `right`
            }, {
              cell: c(({
                record: e
              }) => [g(o(Q(e.payMoney || e.payAmount)), 1)]),
              _: 1
            }), f(j, {
              title: `充值次数`,
              "data-index": `payCount`,
              width: 90,
              sortable: {
                sortDirections: [`ascend`, `descend`]
              },
              align: `right`
            }), f(j, {
              title: `操作`,
              width: 100
            }, {
              cell: c(({
                record: e
              }) => [f(xe, {
                type: `text`,
                size: `small`,
                onClick: t => Te(e.unionId)
              }, {
                default: c(() => [...(i[23] ||= [g(`查看玩家`, -1)])]),
                _: 1
              }, 8, [`onClick`])]),
              _: 1
            })]),
            _: 1
          }, 8, [`data`, `loading`, `pagination`]), f(N, {
            visible: X.value,
            "onUpdate:visible": i[10] ||= e => X.value = e,
            title: (m(ye) || ``) + ` - 玩家充值明细`,
            width: 900,
            footer: !1,
            onCancel: i[11] ||= e => {
              X.value = !1, ye.value = null;
            }
          }, {
            default: c(() => [f(M, {
              data: m(_e),
              loading: m(ve),
              "row-key": `uid`,
              pagination: {
                pageSize: 10,
                showTotal: !0
              },
              scroll: {
                x: 800
              }
            }, {
              columns: c(() => [f(j, {
                title: `玩家账号`,
                "data-index": `uid`,
                width: 160
              }), f(j, {
                title: `角色名`,
                "data-index": `roleName`,
                width: 100
              }), f(j, {
                title: `区服`,
                "data-index": `serverName`,
                width: 120
              }), f(j, {
                title: `游戏名称`,
                "data-index": `gameName`,
                width: 150
              }), f(j, {
                title: `充值金额`,
                width: 110
              }, {
                cell: c(({
                  record: e
                }) => [v(`span`, pe, o(Q(e.payMoney)), 1)]),
                _: 1
              }), f(j, {
                title: `最后充值时间`,
                "data-index": `payTime`,
                width: 150
              }), f(j, {
                title: `最后登录时间`,
                "data-index": `lastLoginTime`,
                width: 150
              })]),
              _: 1
            }, 8, [`data`, `loading`])]),
            _: 1
          }, 8, [`visible`, `title`])]),
          _: 1
        })]);
      };
    }
  }, [[`__scopeId`, `data-v-0fc773ed`]]);
export { ne as n, J as t };
