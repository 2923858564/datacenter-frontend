import { $r, Bs, C, Jt, Ke, Me, St, Tr, Ze, dcPrivateMetricColumns, dcPrivateSummary, dcTableWithSort, fetch, hr, tr, xt, zr } from "../runtime/application.js";

export default function GamePersonPage() {
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
    fetch("/api/game-detail?name=" + encodeURIComponent(t) + "&date_from=" + df + "&date_to=" + dt2).then(z => z.json()).then(j => {
      if (on) {
        const d = j.data || {};
        V((Array.isArray(d.promoters) ? d.promoters : []).filter(q => !q.sum && q.name !== "汇总").map((q, i) => ({
          key: String(i),
          name: q.name,
          owner: q.owner || "--",
          team: q.team || "--",
          register: q.reg,
          newPaid: q.payNew,
          newRegRevenue: q.payNewAmt,
          active: q.active,
          paidUsers: q.payAcct,
          revenue: q.payAmt
        })));
      }
    }).catch(() => {});
    return () => {
      on = !1;
    };
  }, [t, df, dt2]);
  const rs = v || [];
  const r1 = rs.reduce((a, b) => a + (Number(b.register) || 0), 0),
    r2 = rs.reduce((a, b) => a + (Number(b.newPaid) || 0), 0),
    r3 = rs.reduce((a, b) => a + (Number(b.paidUsers) || 0), 0),
    r4 = rs.reduce((a, b) => a + (Number(b.revenue) || 0), 0),
    r5 = rs.reduce((a, b) => a + (Number(b.newPaidAmt) || 0), 0);
  const y = dcPrivateMetricColumns([{
    title: "推广员账号",
    dataIndex: "name",
    width: 130
  }, {
    title: "归属人",
    dataIndex: "owner",
    width: 90
  }, {
    title: "小组",
    dataIndex: "team",
    width: 100
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
          title: `${t} · 人员数据（${df}~${dt2}）`
        })]
      }), C.jsx(tr, {
        filename: `${t}_人员数据`,
        label: "导出",
        dataSource: rs,
        columns: [{
          title: "推广员账号",
          dataIndex: "name"
        }, {
          title: "归属人",
          dataIndex: "owner"
        }, {
          title: "小组",
          dataIndex: "team"
        }, {
          title: "新注册数",
          dataIndex: "register"
        }, {
          title: "新账号付费数",
          dataIndex: "newPaid"
        }, {
          title: "新付费总额",
          dataIndex: "newPaidAmt"
        }, {
          title: "日付费",
          dataIndex: "paidUsers"
        }, {
          title: "日流水",
          dataIndex: "revenue"
        }]
      })]
    }), C.jsx(St, {
      orientation: "left",
      plain: !0,
      className: "!text-sm !font-medium",
      children: "各组人员数据"
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
        children: [C.jsxs("span", {
          style: {
            fontSize: 15,
            fontWeight: 600,
            color: "#262626"
          },
          children: [t, " · 推广员人员数据明细"]
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
      }), C.jsx(dcTableWithSort, {
        className: "mt-2",
        columns: y,
        dataSource: rs,
        size: "small",
        pagination: !1,
        bordered: !0,
        scroll: {
          x: 1450,
          y: 380
        },
        summary: () => dcPrivateSummary(rs, 3)
      })]
    })]
  });
}
