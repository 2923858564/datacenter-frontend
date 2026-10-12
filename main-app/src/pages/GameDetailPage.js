import { $r, Bs, C, Ci, Dc, Jt, Ke, Me, Qr, St, Ti, Tr, Ze, aggM, br, dcTableWithSort, dr, el, en, fe, fetch, hr, kn, lr, tr, tt, xt, zr } from "../runtime/application.js";

export default function GameDetailPage() {
  const {
      name: W
    } = zr(),
    [D] = Bs(),
    F = Jt(),
    t = decodeURIComponent(W || ""),
    dz = decodeURIComponent(D.get("date") || ""),
    [v, y] = Ke.useState([]),
    [T, S] = Ke.useState([]),
    [P, Q] = Ke.useState([]),
    [K, U] = Ke.useState([]),
    [rptG, rptGSet] = Ke.useState("day");
  Ke.useEffect(() => {
    let on = !0;
    window.__DETAIL_DATE = dz || null;
    window.__PROMO_RANGE = dz || null;
    fetch("/api/game-detail?name=" + encodeURIComponent(t) + (dz ? "&date=" + encodeURIComponent(dz) : "")).then(z => z.json()).then(j => {
      if (on) {
        const d = j.data || {};
        S(d.cards || []);
        Q(d.promoters || []);
        U(d.packages || []);
        const dl = d.daily || [];
        dl.reverse();
        y(dl);
        window.__GD_DAILY = dl;
      }
    }).catch(() => {});
    return () => {
      on = !1;
      window.__DETAIL_DATE = null;
      window.__PROMO_RANGE = null;
    };
  }, [t, dz]);
  const u = async s => {
    if (s && s[0] && s[1]) {
      const a = s[0].format("YYYY-MM-DD"),
        b = s[1].format("YYYY-MM-DD");
      try {
        const z = await fetch("/api/game-detail?name=" + encodeURIComponent(t) + (dz ? "&date=" + encodeURIComponent(dz) : "") + "&date_from=" + a + "&date_to=" + b);
        const j = await z.json();
        const dl = j.data && j.data.daily || [];
        dl.reverse();
        y(dl);
        window.__GD_DAILY = dl;
        Q(j.data && j.data.promoters || []);
        U(j.data && j.data.packages || []);
        window.__PROMO_RANGE = b;
      } catch (e) {}
    }
  };
  return C.jsxs("div", {
    className: "space-y-6",
    children: [C.jsx(Ze, {
      className: "w-full justify-between",
      children: C.jsxs(Ze, {
        children: [C.jsx(xt, {
          icon: C.jsx($r, {}),
          onClick: () => F(-1),
          children: "返回驾驶舱"
        }), C.jsx(hr, {
          title: `${t} · 项目详情`
        })]
      })
    }), C.jsxs(St, {
      orientation: "left",
      plain: !0,
      className: "!text-sm !font-medium",
      children: ["基础数据展示 ", C.jsx(br, {
        className: "ml-1",
        style: {
          color: lr.t3,
          fontSize: 12
        }
      })]
    }), C.jsx(tt, {
      gutter: [12, 12],
      children: T.map(s => C.jsx(fe, {
        xs: 12,
        sm: 12,
        md: 6,
        children: C.jsxs("div", {
          style: {
            background: "#fff",
            border: `1px solid ${lr.border}`,
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
                color: lr.t2
              },
              children: s.t
            }), C.jsx(en, {
              title: s.tt,
              children: C.jsx(br, {
                style: {
                  color: lr.t3,
                  fontSize: 11,
                  cursor: "help"
                }
              })
            })]
          }), C.jsx("div", {
            style: {
              fontSize: 11,
              color: lr.t3
            },
            children: el(0)
          }), C.jsxs("div", {
            className: "flex items-center justify-between flex-1",
            children: [C.jsx("span", {
              style: {
                fontSize: 26,
                fontWeight: 600,
                color: lr.t1
              },
              children: s.v
            }), C.jsx("div", {
              style: {
                width: 32,
                height: 32,
                opacity: .85,
                background: s.t.includes("付费") ? "#e6a23c" : "#409eff",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                color: "#fff"
              },
              children: s.t[0]
            })]
          }), C.jsxs("div", {
            style: {
              fontSize: 11,
              color: lr.t3
            },
            children: [C.jsxs("span", {
              className: "mr-2",
              children: [s.sl || "昨日同期", " ", C.jsx("span", {
                style: {
                  color: lr.up
                },
                children: typeof s.y == "number" ? "▲" + s.y : s.y
              })]
            }), C.jsxs("span", {
              children: [s.tl || "七日均值", " ", s.a7]
            })]
          })]
        })
      }, s.t))
    }), C.jsxs(St, {
      orientation: "left",
      plain: !0,
      className: "!text-sm !font-medium",
      children: ["包体数据（下钻）"]
    }), C.jsx("div", {
      className: "mb-1 text-xs",
      style: {
        color: "#909399"
      },
      children: "注：活跃=当日登录去重账号，仅含注册可查的包体账号（贰肆老账号无包体信息，计入项目活跃）"
    }), C.jsx("div", {
      className: "mb-2",
      children: C.jsx(Tr.RangePicker, {
        size: "small",
        style: {
          width: 240
        },
        onChange: u,
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
      })
    }), C.jsx("div", {
      style: {
        background: "#fff",
        border: "1px solid #f0f0f0",
        borderRadius: 12,
        padding: "12px 16px",
        boxShadow: "0 1px 4px rgba(0,0,0,.06)"
      },
      children: C.jsx(dcTableWithSort, {
        dataSource: K.map((s, o) => ({
          ...s,
          key: o
        })),
        size: "small",
        pagination: !1,
        columns: [{
          title: "包体名称",
          dataIndex: "name",
          width: 220,
          render: (s, r) => r.sum ? C.jsx("strong", {
            children: s
          }) : C.jsx("span", {
            style: {
              color: "#409eff",
              cursor: "pointer",
              textDecoration: "underline"
            },
            onClick: () => F(`/dashboard/package-detail/${encodeURIComponent(s)}?game=${encodeURIComponent(t)}&date=${window.__PROMO_RANGE || dz}&pkg=1`),
            children: s
          })
        }, {
          title: "新账号",
          dataIndex: "reg",
          align: "right"
        }, {
          title: "新付费数",
          dataIndex: "payNew",
          align: "right"
        }, {
          title: "新付费总额",
          dataIndex: "payNewAmt",
          align: "right",
          render: s => `¥${Number(s).toLocaleString("zh-CN")}`
        }, {
          title: "活跃",
          dataIndex: "active",
          align: "right"
        }, {
          title: "付费账号数",
          dataIndex: "payAcct",
          align: "right"
        }, {
          title: "付费总额",
          dataIndex: "payAmt",
          align: "right",
          render: s => `¥${Number(s).toLocaleString("zh-CN")}`
        }]
      })
    }), C.jsxs(St, {
      orientation: "left",
      plain: !0,
      className: "!text-sm !font-medium mt-4",
      children: ["推广员数据（下钻）"]
    }), C.jsx("div", {
      className: "mb-2",
      children: C.jsx(Tr.RangePicker, {
        size: "small",
        style: {
          width: 240
        },
        onChange: u,
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
      })
    }), C.jsx("div", {
      style: {
        background: "#fff",
        border: "1px solid #f0f0f0",
        borderRadius: 12,
        padding: "12px 16px",
        boxShadow: "0 1px 4px rgba(0,0,0,.06)"
      },
      children: C.jsx(dcTableWithSort, {
        dataSource: P.map((s, o) => ({
          ...s,
          key: o
        })),
        size: "small",
        pagination: !1,
        columns: [{
          title: "推广员账号",
          dataIndex: "name",
          width: 150,
          render: (s, r) => r.sum ? C.jsx("strong", {
            children: s
          }) : C.jsx("span", {
            style: {
              color: "#409eff",
              cursor: "pointer",
              textDecoration: "underline"
            },
            onClick: () => F(`/dashboard/package-detail/${encodeURIComponent(s)}?game=${encodeURIComponent(t)}&date=${window.__PROMO_RANGE || dz}`),
            children: s
          })
        }, {
          title: "推广员",
          dataIndex: "owner",
          width: 100,
          render: s => s || "--"
        }, {
          title: "新账号",
          dataIndex: "reg",
          align: "right"
        }, {
          title: "新付费数",
          dataIndex: "payNew",
          align: "right"
        }, {
          title: "新付费总额",
          dataIndex: "payNewAmt",
          align: "right",
          render: s => `¥${Number(s).toLocaleString("zh-CN")}`
        }, {
          title: "活跃",
          dataIndex: "active",
          align: "right"
        }, {
          title: "付费账号数",
          dataIndex: "payAcct",
          align: "right"
        }, {
          title: "付费总额",
          dataIndex: "payAmt",
          align: "right",
          render: s => `¥${Number(s).toLocaleString("zh-CN")}`
        }]
      })
    }), C.jsxs(St, {
      orientation: "left",
      plain: !0,
      className: "!text-sm !font-medium",
      children: ["基础数据报表 ", C.jsx(br, {
        className: "ml-1",
        style: {
          color: lr.t3,
          fontSize: 12
        }
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
        children: [C.jsxs("span", {
          style: {
            fontSize: 15,
            fontWeight: 600,
            color: "#262626"
          },
          children: [t, " · 基础数据报表"]
        }), C.jsxs(Ze, {
          children: [C.jsx(tr, {
            filename: `${t}_基础数据报表`,
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
            dataSource: rptG === "day" ? v : aggM(v),
            label: "导出"
          }), C.jsx(xt, {
            size: "small",
            icon: C.jsx(Qr, {})
          }), C.jsx(xt, {
            size: "small",
            icon: C.jsx(kn, {})
          })]
        })]
      }), C.jsxs(Ze, {
        className: "mb-2",
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
          onChange: u,
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
        dataSource: (rptG === "day" ? v : aggM(v)).map((s, o) => ({
          ...s,
          key: `d${o}`
        })),
        size: "small",
        pagination: !1,
        scroll: {
          y: 380
        },
        columns: [{
          title: "日期",
          dataIndex: "date",
          width: 130
        }, {
          title: "新账号",
          dataIndex: "na",
          align: "right",
          width: 65
        }, {
          title: "新付费数",
          dataIndex: "np",
          align: "right",
          width: 75
        }, {
          title: "新付费总额",
          dataIndex: "npa",
          align: "right",
          width: 90,
          render: s => `¥${Ci(s)}`
        }, {
          title: "新付费率",
          dataIndex: "npr",
          align: "right",
          width: 75,
          render: s => Ti(s)
        }, {
          title: "活跃",
          dataIndex: "ac",
          align: "right",
          width: 75
        }, {
          title: "付费数",
          dataIndex: "pc",
          align: "right",
          width: 65
        }, {
          title: "付费总额",
          dataIndex: "pa",
          align: "right",
          width: 85,
          render: s => `¥${Ci(s)}`
        }, {
          title: "付费率",
          dataIndex: "pr",
          align: "right",
          width: 65,
          render: s => Ti(s)
        }, {
          title: "ARPU",
          dataIndex: "ap",
          align: "right",
          width: 60,
          render: s => s == null ? "--" : s.toFixed(2)
        }, {
          title: "ARPPU",
          dataIndex: "app",
          align: "right",
          width: 60,
          render: s => s == null ? "--" : s.toFixed(2)
        }]
      })]
    }), C.jsx(Dc, {
      rows: v,
      name: t
    })]
  });
}
