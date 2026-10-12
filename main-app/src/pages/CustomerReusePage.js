import { $o, Bo, C, Fo, Is, Ke, Lo, Si, St, Uo, Vr, Ze, _i, dcPrivateSummary, dcTableWithSort, dt, er, fe, ft, nn, ta, tt, xi, yr, zo } from "../runtime/application.js";

export default function CustomerReusePage() {
  const W = ft(i => i.packageType),
    F = ft(i => i.setPackageType),
    t = ft(i => i.customerTeamFilter),
    v = ft(i => i.setCustomerTeamFilter),
    y = Fo[W],
    u = Lo[W],
    s = Ke.useMemo(() => t === "all" ? y : [y[Vr.findIndex(i => i.id === t)] ?? y[0]], [y, t]),
    o = Ke.useMemo(() => t === "all" ? u : [u[Vr.findIndex(i => i.id === t)] ?? u[0]], [u, t]),
    n = Ke.useMemo(() => s.map((i, a) => {
      var d;
      return {
        ...i,
        team: ((d = Vr[a]) == null ? void 0 : d.name) ?? `小组${a + 1}`,
        key: `d-${a}`
      };
    }), [s]),
    e = Ke.useMemo(() => o.map((i, a) => {
      var d;
      return {
        ...i,
        team: ((d = Vr[a]) == null ? void 0 : d.name) ?? `小组${a + 1}`,
        key: `m-${a}`
      };
    }), [o]),
    r = Ke.useMemo(() => ({
      tooltip: {
        trigger: "axis"
      },
      grid: {
        left: 80,
        right: 20,
        top: 10,
        bottom: 20
      },
      xAxis: {
        type: "value",
        name: "万元"
      },
      yAxis: {
        type: "category",
        data: n.map(i => i.team).reverse()
      },
      series: [{
        type: "bar",
        data: n.map(i => i.revenue / 1e4).reverse(),
        label: {
          show: !0,
          position: "right",
          formatter: "{c}"
        },
        itemStyle: {
          borderRadius: [0, 4, 4, 0]
        }
      }]
    }), [n]),
    l = (i, a) => C.jsx(dcTableWithSort, {
      columns: a,
      dataSource: i,
      pagination: !1,
      size: "small",
      bordered: !0,
      summary: () => dcPrivateSummary(re || [], 1)
    });
  return C.jsxs("div", {
    className: "space-y-6",
    children: [C.jsxs(Ze, {
      className: "w-full justify-between",
      children: [C.jsxs("h2", {
        className: "text-xl font-semibold",
        children: [C.jsx(ta, {
          className: "mr-2"
        }), "客服复用看板"]
      }), C.jsxs(Ze, {
        children: [C.jsx(nn, {
          value: W,
          onChange: F
        }), C.jsx(Is, {
          teams: Vr,
          value: t,
          onChange: v
        })]
      })]
    }), C.jsx(St, {
      orientation: "left",
      plain: !0,
      className: "!text-sm !font-medium",
      children: "日维度 · 各小组（昨日 vs 今日）"
    }), C.jsx(dt, {
      title: `${W === "full" ? "整包" : "分包"} · 日维度`,
      children: l(n, Si("day"))
    }), C.jsxs(tt, {
      gutter: [16, 16],
      children: [C.jsx(fe, {
        xs: 24,
        lg: 12,
        children: C.jsx(dt, {
          title: "日总注册趋势",
          children: C.jsx(yr, {
            option: xi("注册", Bo),
            height: 280
          })
        })
      }), C.jsx(fe, {
        xs: 24,
        lg: 12,
        children: C.jsx(dt, {
          title: "日总流水趋势",
          children: C.jsx(yr, {
            option: xi("流水", zo),
            height: 280
          })
        })
      })]
    }), C.jsx(St, {
      orientation: "left",
      plain: !0,
      className: "!text-sm !font-medium",
      children: "月维度 · 各小组"
    }), C.jsx(dt, {
      title: `${W === "full" ? "整包" : "分包"} · 月维度`,
      children: l(e, Si("month"))
    }), C.jsxs(tt, {
      gutter: [16, 16],
      children: [C.jsx(fe, {
        xs: 24,
        lg: 12,
        children: C.jsx(dt, {
          title: "月总注册趋势",
          children: C.jsx(er, {
            option: _i("注册", $o),
            height: 280
          })
        })
      }), C.jsx(fe, {
        xs: 24,
        lg: 12,
        children: C.jsx(dt, {
          title: "月总流水趋势",
          children: C.jsx(er, {
            option: _i("流水", Uo),
            height: 280
          })
        })
      })]
    }), C.jsx(tt, {
      gutter: [16, 16],
      children: C.jsx(fe, {
        xs: 24,
        lg: 12,
        children: C.jsx(dt, {
          title: "各小组流水对比",
          children: C.jsx(er, {
            option: r,
            height: 340
          })
        })
      })
    })]
  });
}
