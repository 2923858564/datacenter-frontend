import { C, Ge, Me, Tr, Xr, Ze, biFetch, biMoney, dcTableWithSort, dt, fe, jr, tt, yr } from "../runtime/application.js";

export default function ChannelRevenuePage() {
  const A = Xr.useState({
      rows: [],
      trend: [],
      summary: {},
      detail: []
    }),
    D = A[0],
    S = A[1];
  const DR = Xr.useState([Me().startOf("month"), Me()]),
    rg = DR[0],
    setRg = DR[1];
  const CH = Xr.useState("all"),
    ch = CH[0],
    setCh = CH[1];
  Xr.useEffect(() => {
    biFetch("/api/v1/channel-revenue").then(S);
  }, []);
  const f0 = rg[0].format("YYYY-MM-DD"),
    f1 = rg[1].format("YYYY-MM-DD");
  const detail = (D.detail || []).filter(r => {
    if (!r.date) return false;
    if (ch !== "all" && r.company !== ch) return false;
    return r.date >= f0 && r.date <= f1;
  });
  const companies = Array.from(new Set((D.detail || []).map(r => r.company).filter(Boolean))).sort();
  const byComp = {};
  detail.forEach(r => {
    const c = r.company || "--";
    const b = byComp[c] || (byComp[c] = {
      company: c,
      flow: 0,
      settle_in: 0,
      settle_out: 0,
      profit: 0
    });
    b.flow += r.flow || 0;
    b.settle_in += r.settle_in || 0;
    b.settle_out += r.settle_out || 0;
    b.profit += r.channel_profit || 0;
  });
  const rows = Object.values(byComp).sort((a, b) => b.profit - a.profit).map((x, i) => ({
    ...x,
    key: String(i)
  }));
  const byDate = {};
  detail.forEach(r => {
    const b = byDate[r.date] || (byDate[r.date] = {
      date: r.date,
      flow: 0,
      profit: 0
    });
    b.flow += r.flow || 0;
    b.profit += r.channel_profit || 0;
  });
  const tr = Object.keys(byDate).sort().map(d => byDate[d]);
  const sumFlow = rows.reduce((s, x) => s + (x.flow || 0), 0);
  const sumProfit = rows.reduce((s, x) => s + (x.profit || 0), 0);
  const line = {
    tooltip: {
      trigger: "axis"
    },
    legend: {
      data: ["流水", "毛利"],
      bottom: 0
    },
    grid: {
      left: 70,
      right: 20,
      top: 20,
      bottom: 40
    },
    xAxis: {
      type: "category",
      data: tr.map(x => x.date.slice(5))
    },
    yAxis: {
      type: "value",
      name: "元"
    },
    series: [{
      name: "流水",
      type: "line",
      smooth: !0,
      data: tr.map(x => Math.round(x.flow || 0))
    }, {
      name: "毛利",
      type: "line",
      smooth: !0,
      data: tr.map(x => Math.round(x.profit || 0))
    }]
  };
  const cols = [{
    title: "渠道公司",
    dataIndex: "company",
    width: 200,
    ellipsis: !0
  }, {
    title: "区间流水",
    dataIndex: "flow",
    width: 110,
    align: "right",
    render: biMoney
  }, {
    title: "应结(回)",
    dataIndex: "settle_in",
    width: 110,
    align: "right",
    render: biMoney
  }, {
    title: "应结(出)",
    dataIndex: "settle_out",
    width: 110,
    align: "right",
    render: biMoney
  }, {
    title: "区间渠道毛利",
    dataIndex: "profit",
    width: 120,
    align: "right",
    render: v => C.jsx("span", {
      style: {
        color: v >= 0 ? "#00B42A" : "#F53F3F"
      },
      children: biMoney(v)
    })
  }];
  const sel = C.jsx("select", {
    value: ch,
    onChange: e => setCh(e.target.value),
    style: {
      width: 220,
      height: 32,
      border: "1px solid #d9d9d9",
      borderRadius: 6,
      padding: "0 8px",
      background: "#fff"
    },
    children: [C.jsx("option", {
      value: "all",
      children: "全部渠道"
    })].concat(companies.map(c => C.jsx("option", {
      value: c,
      children: c
    }, c)))
  });
  const picker = C.jsx(Tr.RangePicker, {
    size: "small",
    style: {
      width: 240
    },
    value: rg,
    onChange: v => setRg(v && v.length === 2 ? v : [Me().startOf("month"), Me()]),
    placeholder: ["开始日期", "结束日期"],
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
  });
  const filters = C.jsxs(Ze, {
    className: "mb-3",
    children: [sel, picker]
  });
  const kpi = C.jsxs(tt, {
    gutter: [12, 12],
    children: [C.jsx(fe, {
      xs: 24,
      sm: 6,
      children: C.jsx(Ge, {
        title: "区间渠道流水",
        value: biMoney(sumFlow)
      })
    }), C.jsx(fe, {
      xs: 24,
      sm: 6,
      children: C.jsx(Ge, {
        title: "区间渠道毛利",
        value: biMoney(sumProfit),
        trend: "up"
      })
    }), C.jsx(fe, {
      xs: 24,
      sm: 6,
      children: C.jsx(Ge, {
        title: "覆盖渠道公司",
        value: rows.length,
        suffix: "家"
      })
    }), C.jsx(fe, {
      xs: 24,
      sm: 6,
      children: C.jsx(Ge, {
        title: "覆盖天数",
        value: tr.length,
        suffix: "天"
      })
    })]
  });
  const trendCard = C.jsx(dt, {
    title: "渠道毛利趋势",
    subtitle: "口径：渠道类账号流水×点位(回−出)",
    children: C.jsx(yr, {
      option: line,
      height: 360
    })
  });
  const tableCard = C.jsx(dt, {
    title: "渠道收益明细",
    children: C.jsx(dcTableWithSort, {
      columns: cols,
      dataSource: rows,
      size: "small",
      pagination: !1,
      scroll: {
        x: 760
      }
    })
  });
  const body = C.jsxs(tt, {
    gutter: [16, 16],
    children: [C.jsx(fe, {
      xs: 24,
      lg: 12,
      children: trendCard
    }), C.jsx(fe, {
      xs: 24,
      lg: 12,
      children: tableCard
    })]
  });
  return C.jsxs("div", {
    className: "space-y-6",
    children: [C.jsxs("h2", {
      className: "text-xl font-semibold",
      children: [C.jsx(jr, {
        className: "mr-2"
      }), "渠道收益"]
    }), filters, kpi, body]
  });
}
