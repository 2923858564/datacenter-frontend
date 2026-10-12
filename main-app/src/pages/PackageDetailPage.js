import { $r, Bs, C, Dc, Jt, Ke, Me, Mi, Qr, Ri, St, Tr, Ze, __API__, aggM, br, dcPTDetailTable, dcTableWithSort, dr, en, fe, fetch, hr, kn, pl, tr, tt, ur, xt, zr } from "../runtime/application.js";

export default function PackageDetailPage() {
  const {
      name: W
    } = zr(),
    [F] = Bs(),
    t = Jt(),
    v = decodeURIComponent(W || ""),
    y = decodeURIComponent(F.get("game") || ""),
    dz = decodeURIComponent(F.get("date") || ""),
    pk = decodeURIComponent(F.get("pkg") || ""),
    [s, o] = Ke.useState([]),
    [M, R] = Ke.useState([]),
    [P, Q] = Ke.useState([]),
    [rptG, rptGSet] = Ke.useState("day"),
    [err, errSet] = Ke.useState("");
  Ke.useEffect(() => {
    let on = !0;
    window.__DETAIL_DATE = dz || null;
    const ua = pk ? __API__ + "/api/game-detail?name=" + encodeURIComponent(y) + "&package=" + encodeURIComponent(v) : __API__ + "/api/promoter-detail?game=" + encodeURIComponent(y) + "&promoter=" + encodeURIComponent(v);
    fetch(ua + (dz ? "&date=" + encodeURIComponent(dz) : "")).then(z => {
      if (!z.ok) {
        return z.json().then(j => {
          throw new Error(j && j.detail || "加载失败 " + z.status);
        });
      }
      return z.json();
    }).then(j => {
      if (on) {
        const d = j.data || {};
        R(d.cards || []);
        Q(pk ? d.promoters || [] : []);
        const dl = d.daily || [];
        dl.reverse();
        o(dl);
        window.__PD_DAILY = dl;
      }
    }).catch(e => {
      if (on) errSet(e && e.message || "数据加载失败，请刷新重试");
    });
    return () => {
      on = !1;
      window.__DETAIL_DATE = null;
    };
  }, [v, y, dz]);
  const n = async e => {
    if (e && e[0] && e[1]) {
      const a = e[0].format("YYYY-MM-DD"),
        b = e[1].format("YYYY-MM-DD");
      try {
        const ua = pk ? __API__ + "/api/game-detail?name=" + encodeURIComponent(y) + "&package=" + encodeURIComponent(v) : __API__ + "/api/promoter-detail?game=" + encodeURIComponent(y) + "&promoter=" + encodeURIComponent(v);
        const z = await fetch(ua + (dz ? "&date=" + encodeURIComponent(dz) : "") + "&date_from=" + a + "&date_to=" + b);
        if (!z.ok) {
          const j0 = await z.json().catch(() => ({}));
          throw new Error(j0 && j0.detail || "加载失败 " + z.status);
        }
        const j = await z.json();
        const dl = j.data && j.data.daily || [];
        dl.reverse();
        o(dl);
        window.__PD_DAILY = dl;
        if (pk) {
          Q(j.data && j.data.promoters || []);
          window.__PROMO_RANGE = b;
        }
      } catch (e) {
        errSet(e && e.message || "区间数据加载失败，请重试");
      }
    }
  };
  return C.jsxs("div", {
    className: "space-y-6",
    children: [err ? C.jsx("div", {
      style: {
        background: "#fff1f0",
        border: "1px solid #ffa39e",
        color: "#cf1322",
        borderRadius: 8,
        padding: "10px 14px",
        marginBottom: 12
      },
      children: err
    }) : null, C.jsxs(Ze, {
      className: "w-full justify-between",
      children: [C.jsxs(Ze, {
        children: [C.jsx(xt, {
          icon: C.jsx($r, {}),
          onClick: () => t(-1),
          children: "返回"
        }), C.jsx(hr, {
          title: `${v} · ${pk ? "包体详情" : "推广员详情"}`
        })]
      }), C.jsxs("span", {
        className: "text-gray-400 text-sm",
        children: ["所属游戏：", y]
      })]
    }), C.jsxs(St, {
      orientation: "left",
      plain: !0,
      className: "!text-sm !font-medium",
      children: ["基础数据展示 ", C.jsx(br, {
        className: "ml-1",
        style: {
          color: ur.t3,
          fontSize: 12
        }
      })]
    }), C.jsx(tt, {
      gutter: [12, 12],
      children: M.map(e => C.jsx(fe, {
        xs: 12,
        sm: 12,
        md: 6,
        children: C.jsxs("div", {
          style: {
            background: "#fff",
            border: `1px solid ${ur.border}`,
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
                color: ur.t2
              },
              children: e.t
            }), C.jsx(en, {
              title: e.tt,
              children: C.jsx(br, {
                style: {
                  color: ur.t3,
                  fontSize: 11,
                  cursor: "help"
                }
              })
            })]
          }), C.jsx("div", {
            style: {
              fontSize: 11,
              color: ur.t3
            },
            children: pl(0)
          }), C.jsxs("div", {
            className: "flex items-center justify-between flex-1",
            children: [C.jsx("span", {
              style: {
                fontSize: 26,
                fontWeight: 600,
                color: ur.t1
              },
              children: e.v
            }), C.jsx("div", {
              style: {
                width: 32,
                height: 32,
                opacity: .85,
                background: e.t.includes("付费") ? "#e6a23c" : "#409eff",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                color: "#fff"
              },
              children: e.t[0]
            })]
          }), C.jsxs("div", {
            style: {
              fontSize: 11,
              color: ur.t3
            },
            children: [C.jsxs("span", {
              className: "mr-2",
              children: [e.sl || "昨日同期", " ", C.jsx("span", {
                style: {
                  color: ur.up
                },
                children: typeof e.y == "number" ? "▲" + e.y : e.y
              })]
            }), C.jsxs("span", {
              children: [e.tl || "七日均值", " ", e.a7]
            })]
          })]
        })
      }, e.t))
    }), pk ? C.jsxs(C.Fragment, {
      children: [C.jsxs(St, {
        orientation: "left",
        plain: !0,
        className: "!text-sm !font-medium",
        children: ["推广员数据（下钻）"]
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
            title: "推广员",
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
              onClick: () => t(`/dashboard/package-detail/${encodeURIComponent(s)}?game=${encodeURIComponent(y)}&date=${window.__PROMO_RANGE || dz}`),
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
      })]
    }) : null, C.jsxs(St, {
      orientation: "left",
      plain: !0,
      className: "!text-sm !font-medium",
      children: ["基础数据报表 ", C.jsx(br, {
        className: "ml-1",
        style: {
          color: ur.t3,
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
          children: [y, " · ", v, " · 基础数据报表"]
        }), C.jsxs(Ze, {
          children: [C.jsx(tr, {
            filename: `${y}_${v}_报表`,
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
            dataSource: rptG === "day" ? s : aggM(s),
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
          onChange: n,
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
        dataSource: (rptG === "day" ? s : aggM(s)).map((e, r) => ({
          ...e,
          key: `d${r}`
        })),
        size: "small",
        pagination: !1,
        scroll: {
          y: 380
        },
        columns: [{
          title: "日期",
          dataIndex: "date",
          width: 130,
          fixed: "left"
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
          render: e => e == null ? "--" : "¥" + Mi(e)
        }, {
          title: "新付费率",
          dataIndex: "npr",
          align: "right",
          width: 75,
          render: e => e == null ? "--" : Ri(e)
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
          render: e => e == null ? "--" : "¥" + Mi(e)
        }, {
          title: "付费率",
          dataIndex: "pr",
          align: "right",
          width: 65,
          render: e => e == null ? "--" : Ri(e)
        }, {
          title: "ARPU",
          dataIndex: "ap",
          align: "right",
          width: 60,
          render: e => e == null ? "--" : e.toFixed(2)
        }, {
          title: "ARPPU",
          dataIndex: "app",
          align: "right",
          width: 60,
          render: e => e == null ? "--" : e.toFixed(2)
        }]
      })]
    }), C.jsx(Dc, {
      rows: s,
      name: y + " · " + v
    }), pk ? null : C.jsx(dcPTDetailTable, {
      game: y,
      promoter: v,
      kind: "recharge",
      title: "充值明细"
    }), pk ? null : C.jsx(dcPTDetailTable, {
      game: y,
      promoter: v,
      kind: "reg",
      title: "注册明细"
    })]
  });
}
