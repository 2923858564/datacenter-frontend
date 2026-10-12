import { $r, Bt, C, Jt, Ke, Me, Nt, St, Tr, Ze, __API__, dcTableWithSort, fe, fetch, ft, gr, hr, je, ll, tr, tt, ul, us, xt, zr } from "../runtime/application.js";

export default function PersonProjectPage() {
  const {
      name: W
    } = zr(),
    F = Jt(),
    t = decodeURIComponent(W || ""),
    v = ft(s => s.user),
    [y, V] = Ke.useState(ul[t] || []),
    [meta, mSet] = Ke.useState(null),
    fullRg = window.__RANK_RANGE && window.__RANK_RANGE.length === 2 ? [Me(window.__RANK_RANGE[0]), Me(window.__RANK_RANGE[1])] : null,
    [rg2, rg2Set] = Ke.useState(fullRg ? [fullRg[0], fullRg[1]] : [Me(), Me()]),
    [proj, projSet] = Ke.useState(""),
    [auto, autoSet] = Ke.useState(true),
    [tried, triedSet] = Ke.useState(false);
  Ke.useEffect(() => {
    let on = !0;
    const qr = rg2.length === 2 ? "&date_from=" + rg2[0].format("YYYY-MM-DD") + "&date_to=" + rg2[1].format("YYYY-MM-DD") : "";
    fetch(__API__ + "/api/person-project?person=" + encodeURIComponent(t) + qr).then(z => z.json()).then(j => {
      if (on) {
        const d = j.data || {};
        const rows = Array.isArray(d.rows) ? d.rows : ul[t] || [];
        if (!rows.length && auto && !tried) {
          triedSet(true);
          rg2Set([]);
          return;
        }
        V(rows);
        mSet(d && Array.isArray(d.rows) ? d : null);
        projSet(p => !p || Array.isArray(d.rows) && d.rows.some(s => s.project === p) ? p : "");
        if (!qr && d.date_from) {
          rg2Set([Me(d.date_from), Me(d.date_to || d.date_from)]);
        }
      }
    }).catch(() => {});
    return () => {
      on = !1;
    };
  }, [t, rg2]);
  const tReg = y.reduce((s, o) => s + o.register, 0),
    tPay = y.reduce((s, o) => s + o.totalPaidAmt, 0),
    pReg = meta && meta.prevRegister != null ? meta.prevRegister : null,
    pPay = meta && meta.prevPayAmt != null ? meta.prevPayAmt : null,
    regCmp = pReg == null ? "--" : C.jsxs("span", {
      style: {
        color: tReg >= pReg ? Nt.up : "#f56c6c"
      },
      children: [tReg >= pReg ? "▲" : "▼", gr(Math.abs(tReg - pReg))]
    }),
    payCmp = pPay == null ? "--" : C.jsxs("span", {
      style: {
        color: tPay >= pPay ? Nt.up : "#f56c6c"
      },
      children: [tPay >= pPay ? "▲" : "▼", gr(Math.abs(tPay - pPay))]
    }),
    fy = proj ? y.filter(s => s.project === proj) : y;
  if (!ll((v == null ? void 0 : v.role) || "", t)) return C.jsx("div", {
    className: "flex items-center justify-center",
    style: {
      minHeight: 400
    },
    children: C.jsx(Bt, {
      icon: C.jsx(us, {}),
      status: "403",
      title: "权限不足",
      subTitle: `您没有权限查看 ${t} 的项目明细数据，请联系管理员开通权限`,
      extra: C.jsx(xt, {
        type: "primary",
        onClick: () => F(-1),
        children: "返回"
      })
    })
  });
  const u = [{
    title: "项目",
    dataIndex: "project",
    width: 220,
    render: s => C.jsx("span", {
      className: "font-medium",
      children: s
    })
  }, {
    title: "账号",
    dataIndex: "accounts",
    width: 200,
    render: s => Array.isArray(s) ? s.join("、") || "-" : s || "-"
  }, {
    title: "新注册数",
    dataIndex: "register",
    align: "right",
    sorter: (s, o) => s.register - o.register
  }, {
    title: "新注册付费数",
    dataIndex: "newPaid",
    align: "right",
    sorter: (s, o) => s.newPaid - o.newPaid
  }, {
    title: "新注册付费金额",
    dataIndex: "newPaidAmt",
    align: "right",
    sorter: (s, o) => s.newPaidAmt - o.newPaidAmt,
    render: s => `¥${gr(s)}`
  }, {
    title: "总付费用户数",
    dataIndex: "totalPaid",
    align: "right",
    sorter: (s, o) => s.totalPaid - o.totalPaid
  }, {
    title: "总付费金额",
    dataIndex: "totalPaidAmt",
    align: "right",
    sorter: (s, o) => s.totalPaidAmt - o.totalPaidAmt,
    render: s => `¥${gr(s)}`
  }, {
    title: "ROI",
    dataIndex: "roi",
    align: "right",
    sorter: (s, o) => s.roi - o.roi,
    render: s => s == null ? "--" : s.toFixed(2)
  }];
  return C.jsxs("div", {
    className: "space-y-6",
    children: [C.jsxs(Ze, {
      className: "w-full justify-between",
      children: [C.jsxs(Ze, {
        children: [C.jsx(xt, {
          icon: C.jsx($r, {}),
          onClick: () => F(-1),
          children: "返回"
        }), C.jsx(hr, {
          title: `${meta && meta.name || t} · 项目数据明细`
        })]
      })]
    }), C.jsx(St, {
      orientation: "left",
      plain: !0,
      className: "!text-sm !font-medium",
      children: ["项目概况", meta && meta.date_from ? meta.date_from === meta.date_to ? " " + meta.date_to : " " + meta.date_from + " ~ " + meta.date_to : ""]
    }), C.jsxs(tt, {
      gutter: [12, 12],
      children: [C.jsx(fe, {
        xs: 12,
        sm: 6,
        children: C.jsxs("div", {
          style: {
            background: "#fff",
            border: `1px solid ${Nt.border}`,
            borderRadius: 4,
            padding: "12px 14px",
            minHeight: 100,
            display: "flex",
            flexDirection: "column",
            gap: 3
          },
          children: [C.jsx("span", {
            style: {
              fontSize: 13,
              color: Nt.t2
            },
            children: "参与项目"
          }), C.jsx("span", {
            style: {
              fontSize: 26,
              fontWeight: 600,
              color: Nt.t1
            },
            children: y.length
          })]
        })
      }), C.jsx(fe, {
        xs: 12,
        sm: 6,
        children: C.jsxs("div", {
          style: {
            background: "#fff",
            border: `1px solid ${Nt.border}`,
            borderRadius: 4,
            padding: "12px 14px",
            minHeight: 100,
            display: "flex",
            flexDirection: "column",
            gap: 3
          },
          children: [C.jsx("span", {
            style: {
              fontSize: 13,
              color: Nt.t2
            },
            children: "总新注册数"
          }), C.jsx("span", {
            style: {
              fontSize: 26,
              fontWeight: 600,
              color: Nt.t1
            },
            children: gr(tReg)
          }), C.jsxs("span", {
            style: {
              fontSize: 11,
              color: Nt.t3
            },
            children: ["环比 ", regCmp]
          })]
        })
      }), C.jsx(fe, {
        xs: 12,
        sm: 6,
        children: C.jsxs("div", {
          style: {
            background: "#fff",
            border: `1px solid ${Nt.border}`,
            borderRadius: 4,
            padding: "12px 14px",
            minHeight: 100,
            display: "flex",
            flexDirection: "column",
            gap: 3
          },
          children: [C.jsx("span", {
            style: {
              fontSize: 13,
              color: Nt.t2
            },
            children: "总付费金额"
          }), C.jsxs("span", {
            style: {
              fontSize: 26,
              fontWeight: 600,
              color: Nt.t1
            },
            children: ["¥", gr(tPay)]
          }), C.jsxs("span", {
            style: {
              fontSize: 11,
              color: Nt.t3
            },
            children: ["环比 ", payCmp]
          })]
        })
      }), C.jsx(fe, {
        xs: 12,
        sm: 6,
        children: C.jsxs("div", {
          style: {
            background: "#fff",
            border: `1px solid ${Nt.border}`,
            borderRadius: 4,
            padding: "12px 14px",
            minHeight: 100,
            display: "flex",
            flexDirection: "column",
            gap: 3
          },
          children: [C.jsx("span", {
            style: {
              fontSize: 13,
              color: Nt.t2
            },
            children: "平均ROI"
          }), C.jsx("span", {
            style: {
              fontSize: 26,
              fontWeight: 600,
              color: Nt.t1
            },
            children: y.some(s => s.roi != null) ? (y.reduce((s, o) => s + (o.roi || 0), 0) / y.filter(s => s.roi != null).length).toFixed(2) : "--"
          })]
        })
      })]
    }), C.jsx(St, {
      orientation: "left",
      plain: !0,
      className: "!text-sm !font-medium",
      children: "各项目数据明细"
    }), C.jsxs("div", {
      style: {
        background: "#fff",
        border: "1px solid #f0f0f0",
        borderRadius: 12,
        padding: "12px 16px",
        boxShadow: "0 1px 4px rgba(0,0,0,.06)"
      },
      children: [C.jsxs("div", {
        className: "flex items-center justify-between w-full",
        children: [C.jsx("span", {
          style: {
            fontSize: 15,
            fontWeight: 600,
            color: "#262626"
          },
          children: [meta && meta.name || t, " · 各项目数据"]
        }), C.jsxs("div", {
          className: "flex items-center gap-2",
          children: [C.jsx(Tr.RangePicker, {
            size: "small",
            style: {
              width: 240
            },
            value: rg2.length === 2 ? rg2 : null,
            onChange: v => {
              autoSet(false);
              rg2Set(v && v.length === 2 ? v : [Me(), Me()]);
              window.__RANK_RANGE = v && v.length === 2 ? [v[0].format("YYYY-MM-DD"), v[1].format("YYYY-MM-DD")] : null;
            },
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
          }), C.jsx("select", {
            value: proj,
            onChange: e => projSet(e.target.value),
            style: {
              height: 28,
              fontSize: 13,
              padding: "0 8px",
              border: "1px solid #d9d9d9",
              borderRadius: 6,
              color: "#262626",
              background: "#fff"
            },
            title: "按项目筛选",
            children: [C.jsx("option", {
              value: "",
              children: "全部项目"
            }), ...y.map(s => C.jsx("option", {
              value: s.project,
              key: s.project,
              children: s.project
            }))]
          }), C.jsx(tr, {
            filename: `${t}_项目明细`,
            label: "导出",
            dataSource: fy,
            columns: [{
              title: "项目",
              dataIndex: "project"
            }, {
              title: "账号",
              dataIndex: "accounts"
            }, {
              title: "新注册数",
              dataIndex: "register"
            }, {
              title: "新注册付费数",
              dataIndex: "newPaid"
            }, {
              title: "新注册付费金额",
              dataIndex: "newPaidAmt"
            }, {
              title: "总付费用户数",
              dataIndex: "totalPaid"
            }, {
              title: "总付费金额",
              dataIndex: "totalPaidAmt"
            }, {
              title: "ROI",
              dataIndex: "roi"
            }]
          })]
        })]
      }), C.jsx(dcTableWithSort, {
        className: "mt-2",
        columns: u,
        dataSource: fy.map((s, o) => ({
          ...s,
          key: `d${o}`
        })),
        size: "small",
        pagination: !1,
        bordered: !0,
        scroll: {
          x: 900,
          y: 420
        },
        summary: () => C.jsxs(je.Summary.Row, {
          children: [C.jsx(je.Summary.Cell, {
            index: 0,
            colSpan: 2,
            children: C.jsx("strong", {
              children: "合计"
            })
          }), C.jsx(je.Summary.Cell, {
            index: 2,
            children: C.jsx("strong", {
              children: fy.reduce((s, o) => s + o.register, 0)
            })
          }), C.jsx(je.Summary.Cell, {
            index: 3,
            children: C.jsx("strong", {
              children: fy.reduce((s, o) => s + o.newPaid, 0)
            })
          }), C.jsx(je.Summary.Cell, {
            index: 4,
            children: C.jsxs("strong", {
              children: ["¥", gr(fy.reduce((s, o) => s + o.newPaidAmt, 0))]
            })
          }), C.jsx(je.Summary.Cell, {
            index: 5,
            children: C.jsx("strong", {
              children: fy.reduce((s, o) => s + o.totalPaid, 0)
            })
          }), C.jsx(je.Summary.Cell, {
            index: 6,
            children: C.jsxs("strong", {
              children: ["¥", gr(fy.reduce((s, o) => s + o.totalPaidAmt, 0))]
            })
          }), C.jsx(je.Summary.Cell, {
            index: 7,
            children: C.jsx("strong", {
              children: fy.some(s => s.roi != null) ? (fy.reduce((s, o) => s + (o.roi || 0), 0) / fy.filter(s => s.roi != null).length).toFixed(2) : "--"
            })
          })]
        })
      })]
    })]
  });
}
