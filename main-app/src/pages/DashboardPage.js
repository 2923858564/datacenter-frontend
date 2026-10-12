import { $n, $t, As, C, Co, Dc, Dt, Go, IR0, Jt, Ke, Me, Mo, Mt, Nr, Pt, Qr, RP, St, To, Tq, Tr, Wt, Ze, Zt, __API__, aggM, bi, br, dcTableWithSort, dr, dt, en, er, fe, fetch, fn, ft, gi, grpAgg2, hr, jo, kn, ls, nn, tr, tt, xr, xt } from "../runtime/application.js";

export default function DashboardPage() {
  const [rptG, rptGSet] = Ke.useState("day"),
    W = ft(h => h.packageType),
    F = ft(h => h.setPackageType),
    [t, v] = Ke.useState(!1),
    [isSub, isSubSet] = Ke.useState(false),
    [y, u] = Ke.useState(""),
    [s, o] = Ke.useState(null),
    [ir, irSet] = Ke.useState(IR0),
    [joSt, joSet] = Ke.useState(jo),
    [toSt, toSet] = Ke.useState(To),
    [moSt, moSet] = Ke.useState(Mo),
    [tSt, tSet] = Ke.useState($t),
    [wSt, wSet] = Ke.useState(Wt),
    [rkRg, rkRgSet] = Ke.useState([Me().startOf("month"), Me()]),
    [rkDim, rkDimSet] = Ke.useState("注册"),
    [rkRows, rkRowsSet] = Ke.useState([]),
    [rkRg2, rkRg2Set] = Ke.useState([Me().startOf("month"), Me()]),
    [rkDim2, rkDim2Set] = Ke.useState("注册"),
    [rkRows2, rkRows2Set] = Ke.useState([]),
    n = Jt(),
    [e, r] = Ke.useState(gi),
    [grRange, grRangeSet] = Ke.useState([Me(), Me()]),
    [grTeam, grTeamSet] = Ke.useState(""),
    [grPerson, grPersonSet] = Ke.useState(""),
    [grOpts, grOptsSet] = Ke.useState({
      teams: [],
      persons: []
    }),
    [grLoading, grLoadingSet] = Ke.useState(!1),
    l = async (h, gf) => {
      if (h && h[0] && h[1]) {
        grRangeSet([h[0], h[1]]);
        const a = h[0].format("YYYY-MM-DD"),
          b = h[1].format("YYYY-MM-DD"),
          qTeam = gf && gf.__filters ? gf.team : grTeam,
          qPerson = gf && gf.__filters ? gf.person : grPerson;
        window.__RANK_DATE = b;
        window.__DC_GAME_RANKING_FILTERS__ = 1;
        grLoadingSet(!0);
        if (!(grOpts.teams || []).length && !(grOpts.persons || []).length) try {
          const oz = await fetch(__API__ + "/api/game-ranking/options", {
              cache: "no-store"
            }),
            oj = await oz.json();
          grOptsSet(oj.data || {
            teams: [],
            persons: []
          });
        } catch (e) {}
        try {
          const z = await fetch(__API__ + "/api/game-ranking?date_from=" + a + "&date_to=" + b + "&team=" + encodeURIComponent(qTeam || "") + "&person=" + encodeURIComponent(qPerson || ""), {
            cache: "no-store"
          });
          const j = await z.json();
          const dd = j.data || {};
          const v = Array.isArray(dd) ? dd : dd.list || [];
          const S = Array.isArray(dd) ? null : dd.summary || null;
          let A = 0,
            B = 0,
            C = 0,
            D = 0,
            E = 0;
          v.forEach(q => {
            A += q.newAcct;
            B += q.payAcct;
            C += q.payAmt;
            D += q.payNew || 0;
            E += q.payNewAmt || 0;
          });
          const sr = S ? {
            r: "汇总",
            n: "新锐汇总",
            id: "-",
            na: S.newAcct,
            np: S.payNew,
            npa: S.payNewAmt,
            npr: S.payNewRate,
            ac: S.active == null ? "--" : S.active,
            pc: S.payAcct,
            pa: S.payAmt,
            pr: S.payRate,
            ap: S.arpu,
            app: S.arppu,
            sum: !0
          } : {
            r: "汇总",
            n: "新锐汇总",
            id: "-",
            na: A,
            np: D,
            npa: E,
            npr: A ? Math.round(D / A * 10000) / 10000 : null,
            ac: "--",
            pc: B,
            pa: C,
            pr: Array.isArray(dd) ? null : dd.payRate == null ? null : dd.payRate,
            ap: A ? Math.round(E / A * 100) / 100 : null,
            app: B ? Math.round(C / B * 100) / 100 : null,
            sum: !0
          };
          r([sr, ...v.map((q, i) => ({
            r: String(i + 1),
            n: q.name,
            id: q.id,
            na: q.newAcct,
            np: q.payNew || 0,
            npa: q.payNewAmt || 0,
            npr: q.payNewRate,
            ac: q.active,
            pc: q.payAcct,
            pa: q.payAmt,
            pr: q.payRate,
            ap: q.arpu,
            app: q.arppu,
            sum: !1
          }))]);
        } catch (e) {} finally {
          grLoadingSet(!1);
        }
      }
    },
    [, i] = Ke.useState([Me(), Me()]),
    [a, d] = Ke.useState(Co),
    [m, n2] = Ke.useState([]),
    f = async h => {
      if (h && h[0] && h[1]) {
        i([h[0], h[1]]);
        const a = h[0].format("YYYY-MM-DD"),
          b = h[1].format("YYYY-MM-DD");
        try {
          const z = await fetch(__API__ + "/api/daily-report?date_from=" + a + "&date_to=" + b);
          const j = await z.json();
          const dd = j.data || {};
          const rows = Array.isArray(dd) ? dd : dd.rows || [];
          const S = Array.isArray(dd) ? null : dd.summary || null;
          const dl = rows.slice().reverse().map(x => ({
            date: x.date,
            na: x.newAcct,
            np: x.payNew,
            npa: x.payNewAmt,
            npr: x.payNewRate,
            ac: x.active == null ? "--" : x.active,
            pc: x.payAcct,
            pa: x.payAmt,
            pr: x.payRate,
            ap: x.arpu,
            app: x.arppu
          }));
          const sr = S ? {
            date: "新锐汇总",
            na: S.newAcct,
            np: S.payNew,
            npa: S.payNewAmt,
            npr: S.payNewRate,
            ac: S.active == null ? "--" : S.active,
            pc: S.payAcct,
            pa: S.payAmt,
            pr: S.payRate,
            ap: S.arpu,
            app: S.arppu,
            sum: !0
          } : null;
          d(sr && dl.length ? [sr, ...dl] : dl);
        } catch (e) {}
      }
    },
    c = (h, x) => {
      if (!h) return;
      u(h);
      o(null);
      const K = {
        日注册: "newAcct",
        日流水: "payAmt",
        日付费用户: "payAcct",
        日新增付费: "payNew",
        日新增流水: "payNewAmt",
        日非新增流水: "diff"
      };
      const key = K[h.replace("明细", "")] || "newAcct";
      const money = key === "payAmt" || key === "payNewAmt" || key === "diff";
      Promise.all([fetch(__API__ + "/api/game-ranking?date=" + Me().format("YYYY-MM-DD")), fetch(__API__ + "/api/game-ranking?date=" + Me().subtract(1, "day").format("YYYY-MM-DD"))]).then(rs => Promise.all(rs.map(z => z.json()))).then(js => {
        const A = Array.isArray(js[0].data) ? js[0].data : js[0].data.list || [];
        const B = Array.isArray(js[1].data) ? js[1].data : js[1].data.list || [];
        const names = new Set([...A.map(g => g.name), ...B.map(g => g.name)]);
        const rows = [];
        let S1 = 0,
          S2 = 0;
        names.forEach(nm => {
          const a = A.find(g => g.name === nm),
            b = B.find(g => g.name === nm);
          const v1 = key === "diff" ? a ? a.payAmt - a.payNewAmt : 0 : a ? a[key] : 0;
          const v2 = key === "diff" ? b ? b.payAmt - b.payNewAmt : 0 : b ? b[key] : 0;
          S1 += v1;
          S2 += v2;
          rows.push({
            name: nm,
            t: Math.round(v1 * 100) / 100,
            y: Math.round(v2 * 100) / 100,
            r: v2 ? Math.round((v1 - v2) / v2 * 1000) / 10 : null,
            money
          });
        });
        rows.sort((a, b) => b.t - a.t);
        rows.unshift({
          name: "汇总",
          t: Math.round(S1 * 100) / 100,
          y: Math.round(S2 * 100) / 100,
          r: S2 ? Math.round((S1 - S2) / S2 * 1000) / 10 : null,
          sum: !0,
          money
        });
        n2(rows);
        v(!0);
      });
    },
    p = s ? bi.filter(h => h.channel === s) : bi;
  Ke.useEffect(() => {
    let on = !0;
    fetch(__API__ + "/api/v1/auth/me").then(z => z.json()).then(j => {
      if (on) {
        const u = j && j.user;
        if (u) isSubSet(u.scope === "sub");
      }
    }).catch(() => {});
    return () => {
      on = !1;
    };
  });
  Ke.useEffect(() => {
    let on = true;
    const load = async () => {
      try {
        const z = await (window.__DC_DASHBOARD_SNAPSHOT_PROMISE__ || (window.__DC_DASHBOARD_SNAPSHOT_PROMISE__ = fetch(__API__ + "/api/v1/dashboard/snapshot").then(q => {
          if (!q.ok) throw new Error("dashboard snapshot " + q.status);
          return q.json();
        })));
        if (!on) return;
        const sd = z && z.data || {},
          od = sd.overview || {},
          T = od.today || {},
          Y = od.yesterday || {},
          YS = od.yesterdaySame || Y,
          W = od.weekAvg || {},
          M = od.month || {};
        joSet([{
          t: "新账号数",
          v: T.newAcct,
          y: YS.newAcct,
          a7: W.reg,
          tt: "当日新增注册的去重账号数"
        }, {
          t: "新账号付费数",
          v: T.newPayAcct,
          y: YS.newPayAcct,
          a7: W.newPayAcct,
          tt: "当日新增账号中产生付费的账号数"
        }, {
          t: "新账号付费总额",
          v: Math.round(T.newPayAmt || 0),
          y: Math.round(YS.newPayAmt || 0),
          a7: Math.round(W.newPayAmt || 0),
          tt: "新增账号当日付费总金额(元)",
          u: "¥"
        }, {
          t: "当月注册账号总数",
          v: M.reg,
          y: M.prevReg,
          a7: M.historyReg,
          tt: "本月累计注册/上月累计/历史累计",
          sl: "上月累计",
          tl: "历史累计"
        }, {
          t: "活跃账号数",
          v: T.active == null ? "--" : T.active,
          y: YS.active == null ? "--" : YS.active,
          a7: W.active == null ? "--" : W.active,
          tt: "当日最后登录=今天的全局去重账号数（瓜游+贰肆+瓜玩，按平台+小号UID去重）"
        }, {
          t: "账号付费数",
          v: T.payAcct,
          y: YS.payAcct,
          a7: W.payAcct,
          tt: "当日有付费行为的去重账号数"
        }, {
          t: "账号付费总额",
          v: Math.round(T.payAmt || 0),
          y: Math.round(YS.payAmt || 0),
          a7: Math.round(W.payAmt || 0),
          tt: "当日所有账号付费总金额(元)",
          u: "¥"
        }, {
          t: "当月付费总额",
          v: M.payAmt,
          y: M.prevPay,
          a7: Math.round(M.historyPayAmt || 0),
          tt: "本月累计付费/上月累计/历史累计",
          sl: "上月累计",
          tl: "历史累计",
          u: "¥"
        }]);
        tSet({
          today: {
            register: T.newAcct,
            revenue: T.payAmt,
            paidUsers: T.payAcct,
            newPaid: T.newPayAcct,
            newRev: T.newPayAmt
          },
          yesterday: {
            register: Y.newAcct,
            revenue: Y.payAmt,
            paidUsers: Y.payAcct,
            newPaid: Y.newPayAcct,
            newRev: Y.newPayAmt
          }
        });
        wSet({
          cur: {
            register: M.reg,
            revenue: M.payAmt,
            paid: M.payAcct,
            newPaid: M.newPayAcct,
            newRev: M.newPayAmt,
            oldRev: (M.payAmt || 0) - (M.newPayAmt || 0)
          },
          cmp: {
            register: M.prevReg,
            revenue: M.prevPay,
            paid: M.prevPayAcct,
            newPaid: M.prevNewPayAcct,
            newRev: M.prevNewPayAmt,
            oldRev: (M.prevPay || 0) - (M.prevNewPayAmt || 0)
          }
        });
        const dr = sd.daily_report || {},
          rows = Array.isArray(dr) ? dr : dr.rows || [];
        d(rows.slice().reverse().map(x => ({
          date: x.date,
          na: x.newAcct,
          np: x.payNew,
          npa: x.payNewAmt,
          npr: x.payNewRate,
          ac: x.active == null ? "--" : x.active,
          pc: x.payAcct,
          pa: x.payAmt,
          pr: x.payRate,
          ap: x.arpu,
          app: x.arppu
        })));
        const pt = Array.isArray(sd.person_ranking_today) ? sd.person_ranking_today : [];
        irSet(pt.map(x => ({
          team: x.team || x.group || "待归属",
          name: x.name,
          account: x.account || x.name,
          register: x.reg,
          newPaid: x.payNew || 0,
          newPaidRate: x.rate || 0,
          newPaidAmt: Math.round((x.payNewAmt || 0) * 100) / 100,
          totalPaid: x.payTotal,
          totalPaidAmt: Math.round((x.payAmt || 0) * 100) / 100
        })));
        const pm = Array.isArray(sd.person_ranking_month) ? sd.person_ranking_month : [],
          pmRows = pm.map(x => ({
            team: x.team || "待归属",
            name: x.name,
            account: x.account || x.name,
            register: x.reg,
            newPaid: x.payNew || 0,
            newPaidRate: x.rate || 0,
            newPaidAmt: Math.round(x.payNewAmt || 0),
            totalPaid: x.payTotal,
            totalPaidAmt: Math.round(x.payAmt || 0)
          }));
        rkRowsSet(pmRows);
        rkRows2Set(pmRows);
        const ex = sd.dashboard_extra || {},
          gt = ex.gameTop || [],
          at = ex.gameAcctTop || [],
          cs = ["#409eff", "#67c23a", "#e6a23c", "#f56c6c", "#909399"],
          to = JSON.parse(JSON.stringify(To)),
          mo = JSON.parse(JSON.stringify(Mo));
        if (to.series && to.series[0]) to.series[0].data = gt.map((x, i) => ({
          value: x.flow,
          name: x.name,
          itemStyle: {
            color: cs[i % cs.length]
          }
        }));
        toSet(to);
        if (mo.series && mo.series[0]) mo.series[0].data = at.map((x, i) => ({
          value: x.cnt,
          name: x.name,
          itemStyle: {
            color: cs[i % cs.length]
          }
        }));
        moSet(mo);
        grOptsSet(sd.game_ranking_options || {
          teams: [],
          persons: []
        });
        const gd = sd.game_ranking || {},
          gv = Array.isArray(gd) ? gd : gd.list || [],
          gs = Array.isArray(gd) ? null : gd.summary || null;
        let A = 0,
          B = 0,
          Cc = 0,
          Dd = 0,
          Ee = 0;
        gv.forEach(q => {
          A += q.newAcct;
          B += q.payAcct;
          Cc += q.payAmt;
          Dd += q.payNew || 0;
          Ee += q.payNewAmt || 0;
        });
        const sr = gs ? {
          r: "汇总",
          n: "新锐汇总",
          id: "-",
          na: gs.newAcct,
          np: gs.payNew,
          npa: gs.payNewAmt,
          npr: gs.payNewRate,
          ac: gs.active == null ? "--" : gs.active,
          pc: gs.payAcct,
          pa: gs.payAmt,
          pr: gs.payRate,
          ap: gs.arpu,
          app: gs.arppu,
          sum: !0
        } : {
          r: "汇总",
          n: "新锐汇总",
          id: "-",
          na: A,
          np: Dd,
          npa: Ee,
          npr: A ? Math.round(Dd / A * 10000) / 10000 : null,
          ac: "--",
          pc: B,
          pa: Cc,
          pr: Array.isArray(gd) ? null : gd.payRate == null ? null : gd.payRate,
          ap: A ? Math.round(Ee / A * 100) / 100 : null,
          app: B ? Math.round(Cc / B * 100) / 100 : null,
          sum: !0
        };
        r([sr, ...gv.map((q, i) => ({
          r: String(i + 1),
          n: q.name,
          id: q.id,
          na: q.newAcct,
          np: q.payNew || 0,
          npa: q.payNewAmt || 0,
          npr: q.payNewRate,
          ac: q.active,
          pc: q.payAcct,
          pa: q.payAmt,
          pr: q.payRate,
          ap: q.arpu,
          app: q.arppu,
          sum: !1
        }))]);
        window.__RANK_DATE = sd.latest_date || Me().format("YYYY-MM-DD");
        window.__DC_DASHBOARD_HYDRATED__ = !0;
      } catch (e) {}
    };
    load();
    return () => {
      on = false;
    };
  }, []);
  Ke.useEffect(() => {
    if (!window.__DC_DASHBOARD_HYDRATED__) return;
    let on = true;
    const q = async () => {
      try {
        const r = await (await fetch(__API__ + "/api/ranking/person?date_from=" + rkRg[0].format("YYYY-MM-DD") + "&date_to=" + rkRg[1].format("YYYY-MM-DD"))).json();
        const d = r.data || [];
        if (on) rkRowsSet(Array.isArray(d) ? d.map(x => ({
          team: x.team || "待归属",
          name: x.name,
          account: x.account || x.name,
          register: x.reg,
          newPaid: x.payNew || 0,
          newPaidRate: x.rate || 0,
          newPaidAmt: Math.round(x.payNewAmt || 0),
          totalPaid: x.payTotal,
          totalPaidAmt: Math.round(x.payAmt || 0)
        })) : []);
      } catch (e) {}
    };
    q();
    return () => {
      on = false;
    };
  }, [rkRg]);
  ;
  Ke.useEffect(() => {
    if (!window.__DC_DASHBOARD_HYDRATED__) return;
    let on = true;
    const q = async () => {
      try {
        const r = await (await fetch(__API__ + "/api/ranking/person?date_from=" + rkRg2[0].format("YYYY-MM-DD") + "&date_to=" + rkRg2[1].format("YYYY-MM-DD"))).json();
        const d = r.data || [];
        if (on) rkRows2Set(Array.isArray(d) ? d.map(x => ({
          team: x.team || "待归属",
          name: x.name,
          account: x.account || x.name,
          register: x.reg,
          newPaid: x.payNew || 0,
          newPaidRate: x.rate || 0,
          newPaidAmt: Math.round(x.payNewAmt || 0),
          totalPaid: x.payTotal,
          totalPaidAmt: Math.round(x.payAmt || 0)
        })) : []);
      } catch (e) {}
    };
    q();
    return () => {
      on = false;
    };
  }, [rkRg2]);
  ;
  const rkT = grpAgg2(rkRows2).slice().sort((a, b) => rkDim2 === "流水" ? b.totalPaidAmt - a.totalPaidAmt : b.register - a.register).slice(0, 8);
  const rkC = [...rkRows].sort((a, b) => rkDim === "流水" ? b.totalPaidAmt - a.totalPaidAmt : b.register - a.register).slice(0, 8);
  return C.jsxs("div", {
    className: "space-y-6",
    children: [C.jsxs(Ze, {
      className: "w-full justify-between",
      children: [C.jsx(hr, {
        title: C.jsxs(C.Fragment, {
          children: [C.jsx(Nr, {
            className: "mr-2"
          }), "全局驾驶舱"]
        })
      }), C.jsxs(Ze, {
        children: [C.jsx(nn, {
          value: W,
          onChange: F
        }), W === "sub" ? C.jsx(Mt, {
          color: "orange",
          children: "分包 · 三级账号数据待接入"
        }) : C.jsx(Mt, {
          color: "blue",
          children: "整包 · 管理后台数据"
        })]
      })]
    }), W === "sub" ? C.jsx("div", {
      className: "space-y-6",
      children: [C.jsx("div", {
        style: {
          background: "#fff",
          border: "1px solid #f0f0f0",
          borderRadius: 12,
          padding: "16px 20px",
          boxShadow: "0 1px 4px rgba(0,0,0,.06)"
        },
        children: [C.jsx("div", {
          className: "text-base font-semibold",
          children: "分包数据（三级账号）"
        }), C.jsx("div", {
          className: "text-sm text-gray-400 mt-1",
          children: "当前数据库仅接入管理后台（整包）注册/充值数据；分包=三级账号抓取数据，尚未采集，待接入后自动填充（8/5 定稿口径）。"
        })]
      }), C.jsx(dcTableWithSort, {
        dataSource: [{
          key: "sub",
          date: "分包数据待接入",
          na: "--",
          np: "--",
          npa: "--",
          pc: "--",
          pa: "--"
        }],
        columns: [{
          title: Tq("日期", "报表日期（切到按月时为 YYYY-MM）"),
          dataIndex: "date",
          sorter: (a, b) => String(a.date == null ? "" : a.date).localeCompare(String(b.date == null ? "" : b.date))
        }, {
          title: Tq("新账号", "当日首次创角的账号数量"),
          dataIndex: "na",
          align: "right",
          sorter: (a, b) => (a.na == null ? -1e9 : a.na) - (b.na == null ? -1e9 : b.na)
        }, {
          title: Tq("新付费数", "当日注册成功的账号中，产生过付费行为的账号总数(按账号去重)"),
          dataIndex: "np",
          align: "right",
          sorter: (a, b) => (a.np == null ? -1e9 : a.np) - (b.np == null ? -1e9 : b.np)
        }, {
          title: Tq("新付费总额", "当日注册成功的账号产生的付费总额"),
          dataIndex: "npa",
          align: "right",
          sorter: (a, b) => (a.npa == null ? -1e9 : a.npa) - (b.npa == null ? -1e9 : b.npa)
        }, {
          title: Tq("付费数", "产生过付费行为的账号总数(按账号去重)"),
          dataIndex: "pc",
          align: "right",
          sorter: (a, b) => (a.pc == null ? -1e9 : a.pc) - (b.pc == null ? -1e9 : b.pc)
        }, {
          title: Tq("付费总额", "以账号为单位统计的付费总额"),
          dataIndex: "pa",
          align: "right",
          sorter: (a, b) => (a.pa == null ? -1e9 : a.pa) - (b.pa == null ? -1e9 : b.pa)
        }],
        size: "small",
        pagination: !1
      })]
    }) : C.jsxs(C.Fragment, {
      children: [C.jsx(St, {
        orientation: "left",
        plain: !0,
        className: "!text-sm !font-medium",
        children: "项目数据报表"
      }), C.jsxs("div", {
        className: "text-xs text-gray-400 mb-2",
        children: ["基础数据展示 ", C.jsx(br, {
          className: "ml-1"
        })]
      }), C.jsx(tt, {
        gutter: [12, 12],
        children: joSt.map(h => {
          const x = h.v > h.y;
          return C.jsx(fe, {
            xs: 12,
            sm: 12,
            md: 6,
            children: C.jsxs("div", {
              style: {
                background: "#fff",
                border: `1px solid ${Zt.border}`,
                borderRadius: 4,
                padding: "12px 14px",
                minHeight: 120,
                display: "flex",
                flexDirection: "column",
                gap: 3
              },
              children: [C.jsxs("div", {
                className: "flex items-center gap-1",
                children: [C.jsx("span", {
                  style: {
                    fontSize: 13,
                    color: Zt.t2
                  },
                  children: h.t
                }), C.jsx(en, {
                  title: h.tt,
                  children: C.jsx(br, {
                    style: {
                      color: Zt.t3,
                      fontSize: 11,
                      cursor: "help"
                    }
                  })
                })]
              }), C.jsx("div", {
                style: {
                  fontSize: 11,
                  color: Zt.t3
                },
                children: As(0)
              }), C.jsxs("div", {
                className: "flex items-center justify-between flex-1",
                children: [C.jsxs("span", {
                  style: {
                    fontSize: 26,
                    fontWeight: 600,
                    color: Zt.t1
                  },
                  children: [h.u || "", h.uw ? h.v : xr(h.v), h.uw ? "万" : ""]
                }), C.jsx("div", {
                  style: {
                    width: 32,
                    height: 32,
                    opacity: .85,
                    background: h.t.includes("付费") ? "#e6a23c" : "#409eff",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    color: "#fff"
                  },
                  children: h.t[0]
                })]
              }), C.jsxs("div", {
                style: {
                  fontSize: 11,
                  color: Zt.t3
                },
                children: [C.jsxs("span", {
                  className: "mr-2",
                  children: [h.sl || "昨日同期", C.jsxs("span", {
                    style: {
                      color: x ? Zt.up : Zt.down
                    },
                    children: [" ", x ? "▲" : "▼", h.u || "", xr(h.y), h.uw ? "万" : ""]
                  })]
                }), C.jsxs("span", {
                  children: [h.tl || "七日均值", " ", h.u || "", xr(h.a7), h.uw ? "万" : ""]
                })]
              })]
            })
          }, h.t);
        })
      }), C.jsxs("div", {
        style: {
          background: "#fff",
          border: "1px solid #f0f0f0",
          borderRadius: 12,
          padding: "12px 16px",
          boxShadow: "0 1px 4px rgba(0,0,0,.06)"
        },
        children: [C.jsxs("div", {
          className: "flex items-center justify-between mb-2",
          children: [C.jsx("span", {
            style: {
              fontSize: 15,
              fontWeight: 600,
              color: "#262626"
            },
            children: "游戏数据排行"
          }), C.jsxs(Ze, {
            children: [C.jsx(dr, {
              size: "small",
              allowClear: !0,
              showSearch: !0,
              optionFilterProp: "label",
              placeholder: "全部小组",
              style: {
                width: 120
              },
              value: grTeam || void 0,
              options: (grOpts.teams || []).map(h => ({
                label: h,
                value: h
              })),
              onChange: h => {
                const x = h || "",
                  p = (grOpts.persons || []).some(q => q.name === grPerson && (!x || q.team === x)) ? grPerson : "";
                grTeamSet(x);
                grPersonSet(p);
                l(grRange, {
                  __filters: 1,
                  team: x,
                  person: p
                });
              }
            }), C.jsx(dr, {
              size: "small",
              allowClear: !0,
              showSearch: !0,
              optionFilterProp: "label",
              placeholder: "全部人员",
              style: {
                width: 120
              },
              value: grPerson || void 0,
              options: (grOpts.persons || []).filter(h => !grTeam || h.team === grTeam).map(h => ({
                label: h.name,
                value: h.name
              })),
              onChange: h => {
                const x = h || "";
                grPersonSet(x);
                l(grRange, {
                  __filters: 1,
                  team: grTeam,
                  person: x
                });
              }
            }), C.jsx(Tr.RangePicker, {
              size: "small",
              style: {
                width: 240
              },
              defaultValue: [Me(), Me()],
              onChange: l,
              presets: [{
                label: "昨日",
                value: [Me().subtract(1, "d"), Me().subtract(1, "d")]
              }, {
                label: "今日",
                value: [Me(), Me()]
              }, {
                label: "上周",
                value: [Me().subtract(1, "w").startOf("w"), Me().subtract(1, "w").endOf("w")]
              }, {
                label: "本周",
                value: [Me().startOf("w"), Me()]
              }, {
                label: "上月",
                value: [Me().subtract(1, "month").startOf("month"), Me().subtract(1, "month").endOf("month")]
              }, {
                label: "本月",
                value: [Me().startOf("month"), Me()]
              }, {
                label: "最近30天",
                value: [Me().subtract(30, "d"), Me()]
              }, {
                label: "最近90天",
                value: [Me().subtract(90, "d"), Me()]
              }]
            }), C.jsx("span", {
              style: {
                fontSize: 12,
                color: "#909399",
                marginRight: 8
              },
              children: "汇总=区间去重（跨游戏账号只计一次）"
            }), C.jsx(tr, {
              filename: "游戏数据排行",
              label: "导出",
              columns: [{
                title: "排序",
                dataIndex: "r"
              }, {
                title: "游戏名称",
                dataIndex: "n"
              }, {
                title: "新账号",
                dataIndex: "na"
              }, {
                title: "新付费数",
                dataIndex: "np"
              }, {
                title: "新付费总额",
                dataIndex: "npa"
              }, {
                title: "新付费率",
                dataIndex: "npr"
              }, {
                title: "活跃",
                dataIndex: "ac"
              }, {
                title: "付费数",
                dataIndex: "pc"
              }, {
                title: "付费总额",
                dataIndex: "pa"
              }, {
                title: "付费率",
                dataIndex: "pr"
              }, {
                title: "ARPU",
                dataIndex: "ap"
              }, {
                title: "ARPPU",
                dataIndex: "app"
              }],
              dataSource: e.map(h => ({
                ...h
              }))
            })]
          })]
        }), C.jsx(dcTableWithSort, {
          fixedSummary: !0,
          columns: [{
            title: Tq("排序", "行号（点击表头可升/降序）"),
            dataIndex: "r",
            width: 55,
            render: (h, q, i) => q && q.sum ? "汇总" : i,
            sorter: (a, b) => String(a.r == null ? "" : a.r).localeCompare(String(b.r == null ? "" : b.r))
          }, {
            title: Tq("游戏名称", "游戏项目名称（按项目资料的游戏名/包体映射口径）"),
            dataIndex: "n",
            width: 130,
            render: h => h === "新锐汇总" ? C.jsx("strong", {
              children: h
            }) : C.jsx("span", {
              style: {
                color: Zt.primary,
                cursor: "pointer",
                textDecoration: "underline"
              },
              onClick: () => n(`/dashboard/game-detail/${encodeURIComponent(h)}?date=${window.__RANK_DATE || Me().format("YYYY-MM-DD")}`),
              children: h
            }),
            sorter: (a, b) => String(a.n == null ? "" : a.n).localeCompare(String(b.n == null ? "" : b.n))
          }, {
            title: Tq("新账号", "当日首次创角的账号数量"),
            dataIndex: "na",
            width: 70,
            align: "right",
            sorter: (a, b) => (a.na == null ? -1e9 : a.na) - (b.na == null ? -1e9 : b.na)
          }, {
            title: Tq("新付费数", "当日注册成功的账号中，产生过付费行为的账号总数(按账号去重)"),
            dataIndex: "np",
            width: 80,
            align: "right",
            sorter: (a, b) => (a.np == null ? -1e9 : a.np) - (b.np == null ? -1e9 : b.np)
          }, {
            title: Tq("新付费总额", "当日注册成功的账号产生的付费总额"),
            dataIndex: "npa",
            width: 100,
            align: "right",
            render: h => h == null ? "--" : "¥" + xr(h),
            sorter: (a, b) => (a.npa == null ? -1e9 : a.npa) - (b.npa == null ? -1e9 : b.npa)
          }, {
            title: Tq("新付费率", "当日注册并产生付费行为的账号数占当日注册的账号数的比例。公式：新账号付费数/新账号数。"),
            dataIndex: "npr",
            width: 80,
            align: "right",
            render: h => h == null ? "--" : fn(h),
            sorter: (a, b) => (a.npr == null ? -1e9 : a.npr) - (b.npr == null ? -1e9 : b.npr)
          }, {
            title: Tq("活跃", "进行过任意游戏行为的账号数量（按账号去重），包含新账号和老账号，跨天在线的账号不计入活跃统计"),
            dataIndex: "ac",
            width: 80,
            align: "right",
            sorter: (a, b) => (a.ac == null || a.ac === "--" ? -1e9 : Number(a.ac)) - (b.ac == null || b.ac === "--" ? -1e9 : Number(b.ac))
          }, {
            title: Tq("付费数", "产生过付费行为的账号总数(按账号去重)"),
            dataIndex: "pc",
            width: 70,
            align: "right",
            sorter: (a, b) => (a.pc == null ? -1e9 : a.pc) - (b.pc == null ? -1e9 : b.pc)
          }, {
            title: Tq("付费总额", "以账号为单位统计的付费总额"),
            dataIndex: "pa",
            width: 90,
            align: "right",
            render: h => h == null ? "--" : "¥" + xr(h),
            sorter: (a, b) => (a.pa == null ? -1e9 : a.pa) - (b.pa == null ? -1e9 : b.pa)
          }, {
            title: Tq("付费率", "产生过付费行为的账号总数，占所有活跃账号数的比例。公式：账号付费数/活跃账号数"),
            dataIndex: "pr",
            width: 70,
            align: "right",
            render: h => h == null ? "--" : fn(h),
            sorter: (a, b) => (a.pr == null ? -1e9 : a.pr) - (b.pr == null ? -1e9 : b.pr)
          }, {
            title: Tq("ARPU", "平均每个活跃账号(启动游戏的账号)的付费金额。公式：付费总金额/活跃账号。"),
            dataIndex: "ap",
            width: 60,
            align: "right",
            render: h => h == null ? "--" : h.toFixed(2),
            sorter: (a, b) => (a.ap == null ? -1e9 : a.ap) - (b.ap == null ? -1e9 : b.ap)
          }, {
            title: Tq("ARPPU", "每个付费账号的平均付费金额。公式：付费总金额/付费账号。"),
            dataIndex: "app",
            width: 60,
            align: "right",
            render: h => h == null ? "--" : h.toFixed(2),
            sorter: (a, b) => (a.app == null ? -1e9 : a.app) - (b.app == null ? -1e9 : b.app)
          }],
          dataSource: e.map(h => ({
            ...h,
            key: h.r
          })),
          loading: grLoading,
          size: "small",
          pagination: !1
        })]
      }), C.jsxs("div", {
        style: {
          background: "#fff",
          border: "1px solid #f0f0f0",
          borderRadius: 12,
          padding: "12px 16px",
          boxShadow: "0 1px 4px rgba(0,0,0,.06)"
        },
        children: [C.jsxs("div", {
          className: "flex items-center justify-between mb-2",
          children: [C.jsx("span", {
            style: {
              fontSize: 15,
              fontWeight: 600,
              color: "#262626"
            },
            children: "基础数据报表"
          }), C.jsxs(Ze, {
            children: [C.jsx("span", {
              style: {
                fontSize: 12,
                color: "#909399",
                marginRight: 8
              },
              children: "汇总=区间去重（跨游戏账号只计一次）"
            }), C.jsx(tr, {
              filename: "基础数据报表",
              columns: [{
                title: "日期",
                dataIndex: "date"
              }, {
                title: "新账号",
                dataIndex: "na"
              }, {
                title: "新付费数",
                dataIndex: "np"
              }, {
                title: "新付费总额",
                dataIndex: "npa"
              }, {
                title: "新付费率",
                dataIndex: "npr"
              }, {
                title: "活跃",
                dataIndex: "ac"
              }, {
                title: "付费数",
                dataIndex: "pc"
              }, {
                title: "付费总额",
                dataIndex: "pa"
              }, {
                title: "付费率",
                dataIndex: "pr"
              }, {
                title: "ARPU",
                dataIndex: "ap"
              }, {
                title: "ARPPU",
                dataIndex: "app"
              }],
              dataSource: rptG === "day" ? a : aggM(a),
              label: "导出"
            }), C.jsx(xt, {
              size: "small",
              icon: C.jsx(Qr, {})
            }), C.jsx(xt, {
              size: "small",
              icon: C.jsx(kn, {})
            })]
          })]
        }), C.jsx(Ze, {
          className: "mb-2 w-full justify-between",
          children: C.jsxs(Ze, {
            children: [C.jsx(dr, {
              size: "small",
              value: rptG,
              onChange: e => rptGSet(e.target.value),
              style: {
                width: 90
              },
              options: [{
                label: "按天",
                value: "day"
              }, {
                label: "按月",
                value: "month"
              }]
            }), C.jsx(Tr.RangePicker, {
              size: "small",
              style: {
                width: 240
              },
              onChange: s => {
                if (s && s[0] && s[1]) {
                  window.__GD_RANGE = [s[0].format("YYYY-MM-DD"), s[1].format("YYYY-MM-DD")];
                  window.dispatchEvent(new Event("dc:gd-range"));
                }
                f(s);
              },
              presets: [{
                label: "昨日",
                value: [Me().subtract(1, "d"), Me().subtract(1, "d")]
              }, {
                label: "今日",
                value: [Me(), Me()]
              }, {
                label: "上周",
                value: [Me().subtract(1, "w").startOf("w"), Me().subtract(1, "w").endOf("w")]
              }, {
                label: "本周",
                value: [Me().startOf("w"), Me()]
              }, {
                label: "上月",
                value: [Me().subtract(1, "month").startOf("month"), Me().subtract(1, "month").endOf("month")]
              }, {
                label: "本月",
                value: [Me().startOf("month"), Me()]
              }, {
                label: "最近30天",
                value: [Me().subtract(30, "d"), Me()]
              }, {
                label: "最近90天",
                value: [Me().subtract(90, "d"), Me()]
              }]
            })]
          })
        }), C.jsx(dcTableWithSort, {
          style: {
            width: "100%"
          },
          dataSource: (rptG === "day" ? a : aggM(a)).map((h, x) => ({
            ...h,
            key: `s${x}`
          })),
          size: "small",
          pagination: !1,
          scroll: {
            y: 380
          },
          onRow: h => ({
            style: {
              background: h.sum ? Zt.bgRow : void 0,
              fontWeight: h.sum ? 600 : void 0
            }
          }),
          columns: [{
            title: Tq("日期", "报表日期（切到按月时为 YYYY-MM）"),
            dataIndex: "date",
            width: 130,
            fixed: "left",
            sorter: (a, b) => String(a.date == null ? "" : a.date).localeCompare(String(b.date == null ? "" : b.date))
          }, {
            title: Tq("新账号", "当日首次创角的账号数量"),
            dataIndex: "na",
            align: "right",
            width: 65,
            sorter: (a, b) => (a.na == null ? -1e9 : a.na) - (b.na == null ? -1e9 : b.na)
          }, {
            title: Tq("新付费数", "当日注册成功的账号中，产生过付费行为的账号总数(按账号去重)"),
            dataIndex: "np",
            align: "right",
            width: 75,
            sorter: (a, b) => (a.np == null ? -1e9 : a.np) - (b.np == null ? -1e9 : b.np)
          }, {
            title: Tq("新付费总额", "当日注册成功的账号产生的付费总额"),
            dataIndex: "npa",
            align: "right",
            width: 90,
            render: h => h == null ? "--" : "¥" + xr(h),
            sorter: (a, b) => (a.npa == null ? -1e9 : a.npa) - (b.npa == null ? -1e9 : b.npa)
          }, {
            title: Tq("新付费率", "当日注册并产生付费行为的账号数占当日注册的账号数的比例。公式：新账号付费数/新账号数。"),
            dataIndex: "npr",
            align: "right",
            width: 75,
            render: h => h == null ? "--" : fn(h),
            sorter: (a, b) => (a.npr == null ? -1e9 : a.npr) - (b.npr == null ? -1e9 : b.npr)
          }, {
            title: Tq("活跃", "进行过任意游戏行为的账号数量（按账号去重），包含新账号和老账号，跨天在线的账号不计入活跃统计"),
            dataIndex: "ac",
            align: "right",
            width: 75,
            sorter: (a, b) => String(a.ac == null ? "" : a.ac).localeCompare(String(b.ac == null ? "" : b.ac))
          }, {
            title: Tq("付费数", "产生过付费行为的账号总数(按账号去重)"),
            dataIndex: "pc",
            align: "right",
            width: 65,
            sorter: (a, b) => (a.pc == null ? -1e9 : a.pc) - (b.pc == null ? -1e9 : b.pc)
          }, {
            title: Tq("付费总额", "以账号为单位统计的付费总额"),
            dataIndex: "pa",
            align: "right",
            width: 85,
            render: h => h == null ? "--" : "¥" + xr(h),
            sorter: (a, b) => (a.pa == null ? -1e9 : a.pa) - (b.pa == null ? -1e9 : b.pa)
          }, {
            title: Tq("付费率", "产生过付费行为的账号总数，占所有活跃账号数的比例。公式：账号付费数/活跃账号数"),
            dataIndex: "pr",
            align: "right",
            width: 65,
            render: h => h == null ? "--" : fn(h),
            sorter: (a, b) => (a.pr == null ? -1e9 : a.pr) - (b.pr == null ? -1e9 : b.pr)
          }, {
            title: Tq("ARPU", "平均每个活跃账号(启动游戏的账号)的付费金额。公式：付费总金额/活跃账号。"),
            dataIndex: "ap",
            align: "right",
            width: 60,
            render: h => h == null ? "--" : h.toFixed(2),
            sorter: (a, b) => (a.ap == null ? -1e9 : a.ap) - (b.ap == null ? -1e9 : b.ap)
          }, {
            title: Tq("ARPPU", "每个付费账号的平均付费金额。公式：付费总金额/付费账号。"),
            dataIndex: "app",
            align: "right",
            width: 60,
            render: h => h == null ? "--" : h.toFixed(2),
            sorter: (a, b) => (a.app == null ? -1e9 : a.app) - (b.app == null ? -1e9 : b.app)
          }]
        })]
      }), C.jsx(Dc, {
        rows: a,
        games: 1
      }), C.jsxs(tt, {
        gutter: [14, 14],
        children: [C.jsx(fe, {
          xs: 24,
          lg: 12,
          children: C.jsx(dt, {
            title: "付费金额排行",
            children: C.jsx($n, {
              option: toSt,
              height: 320
            })
          })
        }), C.jsx(fe, {
          xs: 24,
          lg: 12,
          children: C.jsx(dt, {
            title: "付费账号数排行(按游戏)",
            children: C.jsx($n, {
              option: moSt,
              height: 320
            })
          })
        })]
      }), C.jsxs(St, {
        orientation: "left",
        plain: !0,
        className: "!text-sm !font-medium",
        children: ["私域汇总 · 日维度（昨日 vs 今日）", C.jsx("span", {
          className: "text-gray-400 ml-2 text-xs",
          children: "点击卡片查看明细"
        })]
      }), C.jsxs(tt, {
        gutter: [8, 8],
        children: [C.jsx(fe, {
          xs: 12,
          sm: 8,
          md: 4,
          children: C.jsx("div", {
            onClick: () => c("日注册明细"),
            children: C.jsx(Dt, {
              title: "日注册",
              todayValue: tSt.today.register,
              yesterdayValue: tSt.yesterday.register,
              trendPercent: -68.7,
              trendDirection: "down"
            })
          })
        }), C.jsx(fe, {
          xs: 12,
          sm: 8,
          md: 4,
          children: C.jsx("div", {
            onClick: () => c("日流水明细"),
            children: C.jsx(Dt, {
              title: "日流水",
              todayValue: tSt.today.revenue,
              yesterdayValue: tSt.yesterday.revenue,
              format: "currency",
              trendPercent: -72.5,
              trendDirection: "down"
            })
          })
        }), C.jsx(fe, {
          xs: 12,
          sm: 8,
          md: 4,
          children: C.jsx("div", {
            onClick: () => c("日付费用户明细"),
            children: C.jsx(Dt, {
              title: "日付费用户",
              todayValue: tSt.today.paidUsers,
              yesterdayValue: tSt.yesterday.paidUsers,
              trendPercent: -52.6,
              trendDirection: "down"
            })
          })
        }), C.jsx(fe, {
          xs: 12,
          sm: 8,
          md: 4,
          children: C.jsx("div", {
            onClick: () => c("日新增付费明细"),
            children: C.jsx(Dt, {
              title: "日新增付费",
              todayValue: tSt.today.newPaid,
              yesterdayValue: tSt.yesterday.newPaid,
              trendPercent: -81.2,
              trendDirection: "down"
            })
          })
        }), C.jsx(fe, {
          xs: 12,
          sm: 8,
          md: 4,
          children: C.jsx("div", {
            onClick: () => c("日新增流水明细"),
            children: C.jsx(Dt, {
              title: "日新增流水",
              todayValue: tSt.today.newRev,
              yesterdayValue: tSt.yesterday.newRev,
              format: "currency",
              trendPercent: -79.8,
              trendDirection: "down"
            })
          })
        }), C.jsx(fe, {
          xs: 12,
          sm: 8,
          md: 4,
          children: C.jsx("div", {
            onClick: () => c("日非新增流水明细"),
            children: C.jsx(Dt, {
              title: "日非新增用户流水",
              todayValue: tSt.today.revenue - tSt.today.newRev,
              yesterdayValue: tSt.yesterday.revenue - tSt.yesterday.newRev,
              format: "currency",
              trendPercent: -72.2,
              trendDirection: "down"
            })
          })
        })]
      }), C.jsxs(tt, {
        gutter: [10, 10],
        children: [C.jsx(fe, {
          xs: 24,
          sm: 12,
          md: 4,
          children: C.jsx(Pt, {
            title: "月总注册",
            currentValue: wSt.cur.register,
            compareValue: wSt.cmp.register,
            compareLabel: "环比上月",
            trendPercent: -57.7,
            trendDirection: "down"
          })
        }), C.jsx(fe, {
          xs: 24,
          sm: 12,
          md: 4,
          children: C.jsx(Pt, {
            title: "月总流水",
            currentValue: wSt.cur.revenue,
            compareValue: wSt.cmp.revenue,
            compareLabel: "环比上月",
            trendPercent: -41.6,
            trendDirection: "down"
          })
        }), C.jsx(fe, {
          xs: 24,
          sm: 12,
          md: 4,
          children: C.jsx(Pt, {
            title: "月总付费",
            currentValue: wSt.cur.paid,
            compareValue: wSt.cmp.paid,
            compareLabel: "环比上月",
            trendPercent: -56.9,
            trendDirection: "down"
          })
        }), C.jsx(fe, {
          xs: 24,
          sm: 12,
          md: 4,
          children: C.jsx(Pt, {
            title: "月新增付费",
            currentValue: wSt.cur.newPaid,
            compareValue: wSt.cmp.newPaid,
            compareLabel: "上月同期",
            trendPercent: -66.8,
            trendDirection: "down"
          })
        }), C.jsx(fe, {
          xs: 24,
          sm: 12,
          md: 4,
          children: C.jsx(Pt, {
            title: "新增用户流水",
            currentValue: wSt.cur.newRev,
            compareValue: wSt.cmp.newRev,
            compareLabel: "上月同期",
            trendPercent: -66.9,
            trendDirection: "down"
          })
        }), C.jsx(fe, {
          xs: 24,
          sm: 12,
          md: 4,
          children: C.jsx(Pt, {
            title: "非新增流水",
            currentValue: wSt.cur.oldRev,
            compareValue: wSt.cmp.oldRev,
            compareLabel: "上月数据",
            trendPercent: 17.1,
            trendDirection: "up"
          })
        })]
      }), C.jsxs(tt, {
        gutter: [14, 14],
        children: [!isSub && C.jsx(fe, {
          xs: 24,
          children: C.jsx(dt, {
            title: "小组排行",
            height: 440,
            children: C.jsxs("div", {
              className: "space-y-2",
              children: [RP(rkRg2, rkRg2Set, rkDim2, rkDim2Set), C.jsx(er, {
                option: Go(rkT.map(q => rkDim2 === "流水" ? q.totalPaidAmt : q.register), rkT.map(q => q.name)),
                height: 280
              })]
            })
          })
        })]
      }), C.jsx(ls, {
        title: `📊 ${y} — 今日 vs 昨日（按项目）`,
        open: t,
        onCancel: () => v(!1),
        footer: null,
        width: 760,
        destroyOnClose: !0,
        children: C.jsx(dcTableWithSort, {
          columns: [{
            title: "项目",
            dataIndex: "name",
            width: 220,
            fixed: "left",
            sorter: (a, b) => String(a.name == null ? "" : a.name).localeCompare(String(b.name == null ? "" : b.name))
          }, {
            title: "今日",
            dataIndex: "t",
            align: "right",
            render: h => h == null ? "--" : (m[0] && m[0].money ? "¥" : "") + xr(h),
            sorter: (a, b) => (a.t == null ? -1e9 : a.t) - (b.t == null ? -1e9 : b.t)
          }, {
            title: "昨日",
            dataIndex: "y",
            align: "right",
            render: h => h == null ? "--" : (m[0] && m[0].money ? "¥" : "") + xr(h),
            sorter: (a, b) => (a.y == null ? -1e9 : a.y) - (b.y == null ? -1e9 : b.y)
          }, {
            title: "环比",
            dataIndex: "r",
            align: "right",
            render: h => h == null || !isFinite(h) ? "--" : (h > 0 ? "+" : "") + h + "%",
            sorter: (a, b) => (a.r == null ? -1e9 : a.r) - (b.r == null ? -1e9 : b.r)
          }],
          dataSource: m.map((r, i) => ({
            ...r,
            key: i
          })),
          size: "small",
          pagination: !1,
          scroll: {
            y: 420
          },
          onRow: h => ({
            style: {
              background: h.sum ? "#fafafa" : void 0,
              fontWeight: h.sum ? 600 : void 0
            }
          })
        })
      })]
    })]
  });
}
