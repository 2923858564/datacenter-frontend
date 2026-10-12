import { C, Ge, Ke, Kl, Mr, Mt, Ot, Pi, Qn, Sr, Vt, Xl, Yl, Ze, bn, dcTableWithSort, dr, fe, kr, ql, tt } from "../runtime/application.js";

export default function LegacyAuditPage() {
  const [W, F] = Ke.useState(""),
    [t, v] = Ke.useState("all"),
    [y, u] = Ke.useState("all"),
    [s, o] = Ke.useState("all"),
    n = Ke.useMemo(() => {
      let i = kr;
      return t !== "all" && (i = i.filter(a => a.user === t)), y !== "all" && (i = i.filter(a => a.action === y)), s !== "all" && (i = i.filter(a => a.module === s)), W && (i = i.filter(a => a.detail.includes(W) || a.user.includes(W) || a.ip.includes(W))), i;
    }, [t, y, s, W]),
    e = kr.filter(i => i.result === "成功").length,
    r = kr.filter(i => i.result === "失败").length,
    l = [{
      title: "时间",
      dataIndex: "time",
      key: "time",
      width: 160,
      sorter: (i, a) => i.time.localeCompare(a.time),
      defaultSortOrder: "descend"
    }, {
      title: "用户",
      dataIndex: "user",
      key: "user",
      width: 80,
      render: (i, a) => C.jsxs("span", {
        children: [C.jsx(bn, {
          className: "mr-1 text-gray-400"
        }), i, C.jsxs("span", {
          className: "text-gray-400 ml-1 text-xs",
          children: ["(", a.role, ")"]
        })]
      })
    }, {
      title: "操作",
      dataIndex: "action",
      key: "action",
      width: 70,
      render: i => C.jsx(Mt, {
        color: Xl[i] || "default",
        children: i
      })
    }, {
      title: "模块",
      dataIndex: "module",
      key: "module",
      width: 100,
      render: i => C.jsx(Mt, {
        children: i
      })
    }, {
      title: "操作详情",
      dataIndex: "detail",
      key: "detail",
      ellipsis: !0
    }, {
      title: "IP地址",
      dataIndex: "ip",
      key: "ip",
      width: 130,
      render: i => C.jsx("span", {
        style: {
          fontFamily: "monospace",
          fontSize: 12
        },
        children: i
      })
    }, {
      title: "结果",
      dataIndex: "result",
      key: "result",
      width: 70,
      render: i => C.jsx(Mt, {
        color: i === "成功" ? "green" : i === "失败" ? "red" : "orange",
        children: i
      })
    }];
  return C.jsxs("div", {
    className: "space-y-6",
    children: [C.jsxs("h2", {
      className: "text-xl font-semibold",
      children: [C.jsx(Sr, {
        className: "mr-2"
      }), "日志审计中心"]
    }), C.jsxs(tt, {
      gutter: [12, 12],
      children: [C.jsx(fe, {
        xs: 24,
        sm: 6,
        children: C.jsx(Ge, {
          title: "今日操作",
          value: Ot(kr.length),
          suffix: "条"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 6,
        children: C.jsx(Ge, {
          title: "成功",
          value: Ot(e),
          suffix: "条",
          trend: "up"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 6,
        children: C.jsx(Ge, {
          title: "失败",
          value: Ot(r),
          suffix: "条",
          trend: "down"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 6,
        children: C.jsx(Ge, {
          title: "活跃用户",
          value: Ot(Pi.length),
          suffix: "人"
        })
      })]
    }), C.jsxs(Vt, {
      bodyStyle: {
        padding: "16px 20px"
      },
      children: [C.jsxs(Ze, {
        className: "mb-3 w-full justify-between",
        wrap: !0,
        children: [C.jsxs(Ze, {
          wrap: !0,
          children: [C.jsx(Mr, {
            prefix: C.jsx(Qn, {}),
            placeholder: "搜索用户/详情/IP...",
            value: W,
            onChange: i => F(i.target.value),
            style: {
              width: 220
            },
            allowClear: !0
          }), C.jsx(dr, {
            value: t,
            onChange: v,
            style: {
              width: 100
            },
            options: [{
              label: "全部用户",
              value: "all"
            }, ...Pi.map(i => ({
              label: i,
              value: i
            }))]
          }), C.jsx(dr, {
            value: y,
            onChange: u,
            style: {
              width: 100
            },
            options: [{
              label: "全部操作",
              value: "all"
            }, ...Kl.map(i => ({
              label: i,
              value: i
            }))]
          }), C.jsx(dr, {
            value: s,
            onChange: o,
            style: {
              width: 120
            },
            options: [{
              label: "全部模块",
              value: "all"
            }, ...Yl.map(i => ({
              label: i,
              value: i
            }))]
          }), C.jsx(ql, {
            size: "small"
          })]
        }), C.jsxs("span", {
          className: "text-xs text-gray-400",
          children: ["共 ", n.length, " 条记录"]
        })]
      }), C.jsx(dcTableWithSort, {
        columns: l,
        dataSource: n,
        size: "small",
        pagination: {
          defaultPageSize: 15,
          pageSizeOptions: [10, 15, 20, 50, 100],
          showSizeChanger: !0,
          showTotal: i => `共 ${i} 条`
        },
        scroll: {
          x: 900
        }
      })]
    })]
  });
}
