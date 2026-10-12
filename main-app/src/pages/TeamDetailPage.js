import { $r, Bs, C, Jt, Ke, Me, St, Tr, Tt, Yt, Ze, dcPrivateMetricColumns, dcPrivateSummary, dcTableWithSort, dt, fe, fetch, hr, tr, tt, xt, zr } from "../runtime/application.js";

export default function TeamDetailPage() {
  const {
      name: W
    } = zr(),
    [D] = Bs(),
    F = Jt(),
    t = decodeURIComponent(W || ""),
    df0 = decodeURIComponent(D.get("date_from") || "") || Me().format("YYYY-MM-DD"),
    dt20 = decodeURIComponent(D.get("date_to") || "") || df0,
    [rg, rgSet] = Ke.useState([df0, dt20]),
    df = rg[0],
    dt2 = rg[1],
    [v, V] = Ke.useState(null);
  Ke.useEffect(() => {
    let on = !0;
    fetch("/api/private/teams" + (df ? "?date_from=" + df + "&date_to=" + dt2 : "")).then(z => z.json()).then(j => {
      if (!on) return;
      const d = j.data || {},
        tm = (Array.isArray(d.teams) ? d.teams : []).find(q => q.name === t) || null,
        dd = d.date || df;
      fetch("/api/private/persons?team=" + encodeURIComponent(t) + (df ? "&date_from=" + df + "&date_to=" + dt2 : "")).then(z2 => z2.json()).then(j2 => {
        if (on) {
          const d2 = j2.data || {};
          V({
            team: tm,
            persons: Array.isArray(d2.persons) ? d2.persons : [],
            date: dd,
            df: df,
            dt2: dt2
          });
        }
      });
    }).catch(() => {});
    return () => {
      on = !1;
    };
  }, [t, df, dt2]);
  const rs = (v && Array.isArray(v.persons) ? v.persons : []) || [],
    tm = v && v.team || null,
    dd = v && v.date || df,
    df2 = v && v.df || df,
    dt3 = v && v.dt2 || dt2,
    has = tm != null || rs.length > 0,
    s1 = rs.reduce((a, b) => a + (Number(b.register) || 0), 0),
    s2 = rs.reduce((a, b) => a + (Number(b.newPaid) || 0), 0),
    s3 = rs.reduce((a, b) => a + (Number(b.paidUsers) || 0), 0),
    s4 = rs.reduce((a, b) => a + (Number(b.revenue) || 0), 0),
    s5 = rs.reduce((a, b) => a + (Number(b.newRegRevenue) || 0), 0);
  const pct = (cur, prev) => prev == null ? "--" : prev === 0 ? cur > 0 ? "新增" : "--" : `${((cur - prev) / prev * 100).toFixed(1)}%`,
    pv1 = pct(has ? s1 : null, (tm && tm.prevRegister) != null ? tm.prevRegister : null),
    pv2 = pct(has ? s2 : null, (tm && tm.prevNewPaid) != null ? tm.prevNewPaid : null),
    pv3 = pct(has ? s3 : null, (tm && tm.prevPaidUsers) != null ? tm.prevPaidUsers : null),
    pv4 = pct(has ? s4 : null, (tm && tm.prevRevenue) != null ? tm.prevRevenue : null);
  const y = dcPrivateMetricColumns([{
    title: "成员",
    dataIndex: "name",
    width: 120,
    sorter: (a, b) => String(a.name || "").localeCompare(String(b.name || ""), "zh"),
    render: u => C.jsx("span", {
      className: "font-medium",
      children: u
    })
  }]);
  return C.jsxs("div", {
    className: "space-y-6",
    children: [C.jsxs(Ze, {
      className: "w-full justify-between",
      children: [C.jsxs(Ze, {
        children: [C.jsx(xt, {
          icon: C.jsx($r, {}),
          onClick: () => F(-1),
          children: "返回私域看板"
        }), C.jsx(hr, {
          title: `${t} · 小组详情`
        })]
      }), C.jsx(tr, {
        filename: `${t}_小组数据`,
        label: "导出",
        dataSource: rs,
        columns: [{
          title: "成员",
          dataIndex: "name"
        }, {
          title: "新注册数",
          dataIndex: "register"
        }, {
          title: "新账号付费数",
          dataIndex: "newPaid"
        }, {
          title: "日付费",
          dataIndex: "paidUsers"
        }, {
          title: "日流水",
          dataIndex: "revenue"
        }, {
          title: "日新注册流水",
          dataIndex: "newRegRevenue"
        }]
      }), C.jsx(Tr.RangePicker, {
        size: "small",
        style: {
          width: 240
        },
        value: [Me(df), Me(dt2)],
        onChange: h => rgSet(h && h.length === 2 ? [h[0].format("YYYY-MM-DD"), h[1].format("YYYY-MM-DD")] : [df, dt2]),
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
    }), C.jsx(St, {
      orientation: "left",
      plain: !0,
      className: "!text-sm !font-medium",
      children: "小组概况（" + df2 + "~" + dt3 + "）"
    }), C.jsxs(tt, {
      gutter: [12, 12],
      children: [C.jsx(fe, {
        xs: 12,
        sm: 6,
        children: C.jsxs("div", {
          style: {
            background: "#fff",
            border: `1px solid ${Tt.border}`,
            borderRadius: 4,
            padding: "12px 14px",
            minHeight: 110,
            display: "flex",
            flexDirection: "column",
            gap: 3
          },
          children: [C.jsx("span", {
            style: {
              fontSize: 13,
              color: Tt.t2
            },
            children: "总新注册数"
          }), C.jsx("span", {
            style: {
              fontSize: 26,
              fontWeight: 600,
              color: Tt.t1
            },
            children: has ? Yt(s1) : "--"
          }), C.jsxs("span", {
            style: {
              fontSize: 11,
              color: Tt.t3
            },
            children: ["环比 ", C.jsx("span", {
              children: pv1
            })]
          })]
        })
      }), C.jsx(fe, {
        xs: 12,
        sm: 6,
        children: C.jsxs("div", {
          style: {
            background: "#fff",
            border: `1px solid ${Tt.border}`,
            borderRadius: 4,
            padding: "12px 14px",
            minHeight: 110,
            display: "flex",
            flexDirection: "column",
            gap: 3
          },
          children: [C.jsx("span", {
            style: {
              fontSize: 13,
              color: Tt.t2
            },
            children: "总新账号付费数"
          }), C.jsx("span", {
            style: {
              fontSize: 26,
              fontWeight: 600,
              color: Tt.t1
            },
            children: has ? Yt(s2) : "--"
          }), C.jsxs("span", {
            style: {
              fontSize: 11,
              color: Tt.t3
            },
            children: ["环比 ", C.jsx("span", {
              children: pv2
            })]
          })]
        })
      }), C.jsx(fe, {
        xs: 12,
        sm: 6,
        children: C.jsxs("div", {
          style: {
            background: "#fff",
            border: `1px solid ${Tt.border}`,
            borderRadius: 4,
            padding: "12px 14px",
            minHeight: 110,
            display: "flex",
            flexDirection: "column",
            gap: 3
          },
          children: [C.jsx("span", {
            style: {
              fontSize: 13,
              color: Tt.t2
            },
            children: "总流水"
          }), C.jsxs("span", {
            style: {
              fontSize: 26,
              fontWeight: 600,
              color: Tt.t1
            },
            children: has ? ["¥", Yt(s4)] : "--"
          }), C.jsxs("span", {
            style: {
              fontSize: 11,
              color: Tt.t3
            },
            children: ["环比 ", C.jsx("span", {
              children: pv3
            })]
          })]
        })
      }), C.jsx(fe, {
        xs: 12,
        sm: 6,
        children: C.jsxs("div", {
          style: {
            background: "#fff",
            border: `1px solid ${Tt.border}`,
            borderRadius: 4,
            padding: "12px 14px",
            minHeight: 110,
            display: "flex",
            flexDirection: "column",
            gap: 3
          },
          children: [C.jsx("span", {
            style: {
              fontSize: 13,
              color: Tt.t2
            },
            children: "当日付费数"
          }), C.jsx("span", {
            style: {
              fontSize: 26,
              fontWeight: 600,
              color: Tt.t1
            },
            children: has ? Yt(s3) : "--"
          }), C.jsxs("span", {
            style: {
              fontSize: 11,
              color: Tt.t3
            },
            children: ["环比 ", C.jsx("span", {
              children: pv4
            })]
          })]
        })
      })]
    }), C.jsx(St, {
      orientation: "left",
      plain: !0,
      className: "!text-sm !font-medium",
      children: "成员数据"
    }), C.jsx(dt, {
      title: `${t} · 成员日数据明细`,
      height: 430,
      children: C.jsx(dcTableWithSort, {
        columns: y,
        dataSource: rs.map((u, s) => ({
          ...u,
          key: `m${s}`
        })),
        size: "small",
        pagination: !1,
        bordered: !0,
        scroll: {
          x: 1250,
          y: 380
        },
        summary: () => dcPrivateSummary(rs, 1)
      })
    })]
  });
}
