import { C, Ge, Mr, Mt, Qn, Xr, Ze, biFetch, biPct, dcTableWithSort, dt, fe, na, tt } from "../runtime/application.js";

export default function ProductsPage() {
  const A = Xr.useState({
      products: [],
      summary: {}
    }),
    D = A[0],
    S = A[1];
  const Q = Xr.useState(""),
    K = Q[0],
    setK = Q[1];
  const [showPoints, setShowPoints] = Xr.useState(false);
  Xr.useEffect(() => {
    let current = true;
    biFetch("/api/v1/business/products?show_points=" + showPoints).then(data => {
      if (current) S(data);
    });
    return () => {
      current = false;
    };
  }, [showPoints]);
  const pointText = v => showPoints && D.points_access?.visible ? biPct(v) : "***";
  const pointSwitch = C.jsx("button", {
    type: "button",
    disabled: !D.points_access?.can_view,
    onClick: () => setShowPoints(!showPoints),
    "aria-label": showPoints ? "隐藏点位" : "查看点位",
    title: D.points_access?.can_view ? "点击切换点位显示" : "暂无查看点位权限",
    style: {
      fontSize: 14,
      marginLeft: 16,
      padding: "5px 12px",
      border: "1px solid #d9d9d9",
      borderRadius: 6,
      background: "white",
      cursor: D.points_access?.can_view ? "pointer" : "not-allowed"
    },
    children: [C.jsx("svg", {
      width: 18,
      height: 18,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      style: {
        verticalAlign: "middle",
        marginRight: 6
      },
      children: [C.jsx("path", {
        d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"
      }), C.jsx("circle", {
        cx: 12,
        cy: 12,
        r: 3
      })]
    }), showPoints ? "隐藏点位" : "查看点位"]
  });
  const sm = D.summary || {};
  const rows = (D.products || []).filter(x => !K || (x.product || "").indexOf(K) >= 0 || (x.company || "").indexOf(K) >= 0).map((x, i) => ({
    ...x,
    key: String(i)
  }));
  const cols = [{
    title: "产品名",
    dataIndex: "product",
    width: 150,
    ellipsis: !0,
    render: v => C.jsx("span", {
      className: "font-medium",
      children: v
    })
  }, {
    title: "业务项目",
    dataIndex: "project",
    width: 130,
    ellipsis: !0,
    render: v => v || "--"
  }, {
    title: "接入渠道",
    dataIndex: "channel_code",
    width: 100,
    render: (v, r) => C.jsx("span", {
      title: r.company,
      children: C.jsx(Mt, {
        children: v || "--"
      })
    })
  }, {
    title: "接入点位",
    dataIndex: "access_point",
    width: 80,
    align: "right",
    render: pointText
  }, {
    title: "包体/版号",
    dataIndex: "packages",
    width: 220,
    render: v => Array.isArray(v) && v.length ? C.jsx("div", {
      style: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      },
      title: v.join("、"),
      children: v.join("、")
    }) : "--"
  }, {
    title: "放出渠道",
    dataIndex: "releases",
    width: 180,
    render: v => Array.isArray(v) && v.length ? C.jsx("div", {
      style: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      },
      title: v.map(x => x.channel_code + " " + pointText(x.point)).join("、"),
      children: v.map(x => x.channel_code + " " + pointText(x.point)).join("、")
    }) : "--"
  }];
  const kpi = C.jsxs(tt, {
    gutter: [12, 12],
    children: [C.jsx(fe, {
      xs: 24,
      sm: 6,
      children: C.jsx(Ge, {
        title: "产品总数",
        value: sm.product_count || 0,
        suffix: "个"
      })
    }), C.jsx(fe, {
      xs: 24,
      sm: 6,
      children: C.jsx(Ge, {
        title: "涉及渠道",
        value: sm.channel_count || 0,
        suffix: "家"
      })
    }), C.jsx(fe, {
      xs: 24,
      sm: 6,
      children: C.jsx(Ge, {
        title: "平均接入点位",
        value: pointText(sm.avg_point)
      })
    }), C.jsx(fe, {
      xs: 24,
      sm: 6,
      children: C.jsx(Ge, {
        title: "点位区间",
        value: pointText(sm.min_point) + " ~ " + pointText(sm.max_point)
      })
    })]
  });
  const search = C.jsx(Mr, {
    prefix: C.jsx(Qn, {}),
    placeholder: "搜索产品/渠道...",
    style: {
      width: 260
    },
    allowClear: !0,
    onChange: e => setK(e.target.value)
  });
  const table = C.jsx(dcTableWithSort, {
    columns: cols,
    dataSource: rows,
    size: "small",
    pagination: !1,
    scroll: {
      x: 990
    }
  });
  const card = C.jsx(dt, {
    title: "产品列表",
    subtitle: "财务产品 × 渠道点位（真实数据）",
    children: [C.jsxs(Ze, {
      className: "mb-3",
      children: [search]
    }), table]
  });
  return C.jsxs("div", {
    className: "space-y-6",
    children: [C.jsxs("h2", {
      className: "text-xl font-semibold",
      children: [C.jsx(na, {
        className: "mr-2"
      }), "产品库", pointSwitch]
    }), kpi, card]
  });
}
