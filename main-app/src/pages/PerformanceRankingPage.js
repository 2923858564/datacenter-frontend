import { C, Ge, Go, IR0, Jt, Ke, Me, St, Tr, Ze, __API__, dcTableWithSort, dt, er, fe, fetch, hr, je, tr, tt, vn } from "../runtime/application.js";

export default function PerformanceRankingPage() {
  const W = Jt(),
    [ir, irSet] = Ke.useState(IR0),
    [rg, rgSet] = Ke.useState(window.__RANK_RANGE && window.__RANK_RANGE.length === 2 ? [Me(window.__RANK_RANGE[0]), Me(window.__RANK_RANGE[1])] : [Me(), Me()]),
    [gp, gpSet] = Ke.useState(""),
    [auto, autoSet] = Ke.useState(true),
    [tried, triedSet] = Ke.useState(false),
    [isLeader, isLeaderSet] = Ke.useState(false),
    [leaderTeam, leaderTeamSet] = Ke.useState("");
  Ke.useEffect(() => {
    let on = !0;
    fetch(__API__ + "/api/ranking/scope").then(z => z.json()).then(j => {
      if (on) {
        const d = j.data || {};
        isLeaderSet(!!d.isLeader);
        leaderTeamSet(d.team || "");
      }
    }).catch(() => {});
    return () => {
      on = !1;
    };
  });
  Ke.useEffect(() => {
    let on = !0;
    const qr = rg.length === 2 ? "?date_from=" + rg[0].format("YYYY-MM-DD") + "&date_to=" + rg[1].format("YYYY-MM-DD") : "";
    window.__RANK_RANGE = rg.length === 2 ? [rg[0].format("YYYY-MM-DD"), rg[1].format("YYYY-MM-DD")] : null;
    fetch(__API__ + "/api/ranking/person" + qr).then(z => z.json()).then(j => {
      if (on) {
        const d = j.data || [];
        const rows = Array.isArray(d) ? d : IR0;
        if (!rows.length && auto && !tried) {
          triedSet(true);
          rgSet([]);
          return;
        }
        irSet(rows.length ? rows.map(q => ({
          team: q.team || "待归属",
          name: q.name,
          account: q.account || q.name,
          register: q.reg,
          newPaid: q.payNew || 0,
          newPaidRate: q.rate || 0,
          newPaidAmt: Math.round(q.payNewAmt || 0),
          totalPaid: q.payTotal,
          totalPaidAmt: Math.round(q.payAmt || 0)
        })) : IR0);
        gpSet(p => !p || Array.isArray(d) && d.some(q => q.team === p) ? p : "");
        if (!qr && rows.length) {
          fetch(__API__ + "/api/overview").then(z => z.json()).then(o => {
            if (on) {
              const l = o && o.data && o.data.latest;
              if (l) rgSet([Me(l), Me(l)]);
            }
          }).catch(() => {});
        }
      }
    }).catch(() => {});
    return () => {
      on = !1;
    };
  }, [rg]);
  const [mrr, mrrSet] = Ke.useState([]);
  Ke.useEffect(() => {
    let on = !0;
    const m0 = Me().startOf("month"),
      m1 = Me();
    fetch(__API__ + "/api/ranking/person?date_from=" + m0.format("YYYY-MM-DD") + "&date_to=" + m1.format("YYYY-MM-DD")).then(z => z.json()).then(j => {
      if (on) {
        const d = j.data || [];
        const rows = Array.isArray(d) ? d : [];
        mrrSet(rows.map(q => ({
          team: q.team || "待归属",
          name: q.name,
          account: q.account || q.name,
          register: q.reg,
          newPaid: q.payNew || 0,
          newPaidRate: q.rate || 0,
          newPaidAmt: Math.round(q.payNewAmt || 0),
          totalPaid: q.payTotal,
          totalPaidAmt: Math.round(q.payAmt || 0)
        })));
      }
    }).catch(() => {});
    return () => {
      on = !1;
    };
  }, []);
  const [crg, crgSet] = Ke.useState([Me().startOf("month"), Me()]);
  const dcRoster = new Set(["侯文杰", "刘灿", "周丽芳", "周鑫", "唐丁玲", "姜华昌", "张功在", "朱梓鑫", "李兆年", "李小龙", "梅春芳", "沈向阳", "程云", "聂丹妮", "肖宇豪", "胡馨木", "蔡强", "蔡蒙蒙", "郑雨鑫", "陈勇钢", "马志刚", "高文馨", "黄诗磊", "龚嘉豪"]);
  const [cdim, cdimSet] = Ke.useState("注册");
  const [cAll, cAllSet] = Ke.useState(!1);
  const [crr, crrSet] = Ke.useState([]);
  Ke.useEffect(() => {
    let on = !0;
    if (crg && crg.length === 2) {
      fetch(__API__ + "/api/ranking/person?date_from=" + crg[0].format("YYYY-MM-DD") + "&date_to=" + crg[1].format("YYYY-MM-DD")).then(z => z.json()).then(j => {
        if (on) {
          const d = j.data || [];
          const rows = Array.isArray(d) ? d : [];
          crrSet(rows.filter(q => dcRoster.has(q.name)).map(q => ({
            team: q.team || "待归属",
            name: q.name,
            account: q.account || q.name,
            register: q.reg,
            newPaid: q.payNew || 0,
            newPaidRate: q.rate || 0,
            newPaidAmt: Math.round(q.payNewAmt || 0),
            totalPaid: q.payTotal,
            totalPaidAmt: Math.round(q.payAmt || 0)
          })));
        }
      }).catch(() => {});
    }
    return () => {
      on = !1;
    };
  }, [crg]);
  const [grg, grgSet] = Ke.useState([Me().startOf("month"), Me()]);
  const [gdim, gdimSet] = Ke.useState("注册");
  const [grr, grrSet] = Ke.useState([]);
  Ke.useEffect(() => {
    let on = !0;
    if (grg && grg.length === 2) {
      fetch(__API__ + "/api/ranking/person?date_from=" + grg[0].format("YYYY-MM-DD") + "&date_to=" + grg[1].format("YYYY-MM-DD")).then(z => z.json()).then(j => {
        if (on) {
          const d = j.data || [];
          const rows = Array.isArray(d) ? d : [];
          grrSet(rows.map(q => ({
            team: q.team || "待归属",
            name: q.name,
            account: q.account || q.name,
            register: q.reg,
            newPaid: q.payNew || 0,
            newPaidRate: q.rate || 0,
            newPaidAmt: Math.round(q.payNewAmt || 0),
            totalPaid: q.payTotal,
            totalPaidAmt: Math.round(q.payAmt || 0)
          })));
        }
      }).catch(() => {});
    }
    return () => {
      on = !1;
    };
  }, [grg]);
  const grpAgg = r => {
    const m = {};
    r.forEach(q => {
      const t = q.team || "待归属";
      m[t] = m[t] || {
        name: t,
        register: 0,
        totalPaidAmt: 0,
        newPaidAmt: 0,
        totalPaid: 0
      };
      m[t].register += q.register;
      m[t].totalPaidAmt += q.totalPaidAmt;
      m[t].newPaidAmt += q.newPaidAmt;
      m[t].totalPaid += q.totalPaid;
    });
    return Object.values(m);
  };
  const crScoped = isLeader ? crr.filter(q => q.team === leaderTeam) : gp ? crr.filter(q => q.team === gp) : crr;
  const crAll = [...crScoped].sort((a, b) => cdim === "流水" ? b.totalPaidAmt - a.totalPaidAmt : b.register - a.register);
  const crt = crAll.slice(0, 10);
  const grt = grpAgg(grr).slice().sort((a, b) => gdim === "流水" ? b.totalPaidAmt - a.totalPaidAmt : b.register - a.register).slice(0, 8);
  const dgr1 = [...ir].sort((a, b) => b.newPaidAmt - a.newPaidAmt)[0] || null,
    dga1 = [...ir].sort((a, b) => b.totalPaid - a.totalPaid)[0] || null;
  const mgr1 = [...mrr].sort((a, b) => b.newPaidAmt - a.newPaidAmt)[0] || null,
    mga1 = [...mrr].sort((a, b) => b.totalPaid - a.totalPaid)[0] || null;
  const rtop = [...ir].sort((a, b) => b.totalPaidAmt - a.totalPaidAmt)[0] || null;
  const mtop = [...mrr].sort((a, b) => b.totalPaidAmt - a.totalPaidAmt)[0] || null;
  const fr = isLeader ? ir.filter(q => q.team === leaderTeam) : gp ? ir.filter(q => q.team === gp) : ir;
  const F = [{
    title: "小组",
    dataIndex: "team",
    width: 110,
    fixed: "left"
  }, {
    title: "姓名",
    dataIndex: "name",
    width: 170,
    render: (t, s) => C.jsx("span", {
      style: {
        color: "#409eff",
        cursor: "pointer",
        textDecoration: "underline"
      },
      onClick: () => W(`/dashboard/person-project/${encodeURIComponent(s.account || s.name)}`),
      children: t
    })
  }, {
    title: "新注册数",
    dataIndex: "register",
    align: "right",
    width: 72,
    sorter: (t, v) => t.register - v.register
  }, {
    title: "新注册付费数",
    dataIndex: "newPaid",
    align: "right",
    width: 84,
    sorter: (t, v) => t.newPaid - v.newPaid
  }, {
    title: "新注册付费率",
    dataIndex: "newPaidRate",
    align: "right",
    width: 96,
    sorter: (t, v) => t.newPaidRate - v.newPaidRate,
    render: t => `${t}%`
  }, {
    title: "新注册付费金额",
    dataIndex: "newPaidAmt",
    align: "right",
    width: 108,
    sorter: (t, v) => t.newPaidAmt - v.newPaidAmt,
    render: t => `¥${t.toLocaleString()}`
  }, {
    title: "总付费用户数",
    dataIndex: "totalPaid",
    align: "right",
    width: 84,
    sorter: (t, v) => t.totalPaid - v.totalPaid
  }, {
    title: "总付费金额",
    dataIndex: "totalPaidAmt",
    align: "right",
    width: 104,
    sorter: (t, v) => t.totalPaidAmt - v.totalPaidAmt,
    render: t => `¥${t.toLocaleString()}`
  }];
  return C.jsxs("div", {
    className: "space-y-6",
    children: [C.jsx(Ze, {
      className: "w-full justify-between",
      children: C.jsx(hr, {
        title: C.jsxs(C.Fragment, {
          children: [C.jsx(vn, {
            className: "mr-2"
          }), "人员业绩排行看板"]
        })
      })
    }), C.jsx(St, {
      orientation: "left",
      plain: !0,
      className: "!text-sm !font-medium",
      children: "日维度排行"
    }), C.jsxs(tt, {
      gutter: [12, 12],
      children: [C.jsx(fe, {
        xs: 24,
        sm: 6,
        children: C.jsx(Ge, {
          title: "日注册TOP1",
          value: ir[0] ? ir[0].name : "-",
          suffix: ir[0] ? ir[0].register + "人" : "",
          trend: "up"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 6,
        children: C.jsx(Ge, {
          title: "日流水TOP1",
          value: rtop ? rtop.name : "-",
          suffix: rtop ? "¥" + rtop.totalPaidAmt.toLocaleString() : "",
          trend: "up"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 6,
        children: C.jsx(Ge, {
          title: "日新注册付费金额TOP1",
          value: dgr1 ? dgr1.name : "-",
          suffix: dgr1 ? "¥" + dgr1.newPaidAmt.toLocaleString() : "",
          trend: "up",
          trend: "up"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 6,
        children: C.jsx(Ge, {
          title: "日总付费用户数TOP1",
          value: dga1 ? dga1.name : "-",
          suffix: dga1 ? dga1.totalPaid + "人" : "",
          trend: "up"
        })
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
          children: "个人日注册流水数据表"
        }), C.jsx(Tr.RangePicker, {
          size: "small",
          style: {
            width: 240
          },
          value: rg.length === 2 ? rg : null,
          onChange: v => {
            autoSet(false);
            rgSet(v && v.length === 2 ? v : [Me(), Me()]);
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
          value: isLeader ? leaderTeam : gp,
          onChange: e => {
            if (!isLeader) gpSet(e.target.value);
          },
          style: {
            height: 28,
            fontSize: 13,
            padding: "0 8px",
            border: "1px solid #d9d9d9",
            borderRadius: 6,
            color: "#262626",
            background: "#fff"
          },
          title: "按小组筛选",
          children: [C.jsx("option", {
            value: "",
            children: "全部小组"
          }), ...[...new Set(ir.map(q => q.team).filter(Boolean))].map(g => C.jsx("option", {
            value: g,
            key: g,
            children: g
          }))]
        }), C.jsx("span", {
          style: {
            fontSize: 12,
            color: "#909399",
            marginRight: 8
          },
          children: "汇总=区间去重（跨账号只计一次）"
        }), C.jsx(tr, {
          filename: "个人日注册流水数据",
          label: "导出",
          dataSource: fr,
          columns: [{
            title: "小组",
            dataIndex: "team"
          }, {
            title: "姓名",
            dataIndex: "name"
          }, {
            title: "新注册数",
            dataIndex: "register"
          }, {
            title: "新注册付费数",
            dataIndex: "newPaid"
          }, {
            title: "新注册付费率",
            dataIndex: "newPaidRate"
          }, {
            title: "新注册付费金额",
            dataIndex: "newPaidAmt"
          }, {
            title: "总付费用户数",
            dataIndex: "totalPaid"
          }, {
            title: "总付费金额",
            dataIndex: "totalPaidAmt"
          }]
        })]
      }), C.jsx("style", {
        children: ".dc-performance-total-top tfoot.ant-table-summary{display:table-header-group!important}"
      }), C.jsx(dcTableWithSort, {
        className: "dc-performance-total-top",
        columns: F,
        dataSource: fr.map((t, v) => ({
          ...t,
          key: `d${v}`
        })),
        size: "small",
        pagination: !1,
        bordered: !0,
        scroll: {
          x: 1000,
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
              children: fr.reduce((t, v) => t + v.register, 0)
            })
          }), C.jsx(je.Summary.Cell, {
            index: 3,
            children: C.jsx("strong", {
              children: fr.reduce((t, v) => t + v.newPaid, 0)
            })
          }), C.jsx(je.Summary.Cell, {
            index: 4,
            children: C.jsxs("strong", {
              children: [fr.length > 0 ? (fr.reduce((t, v) => t + v.newPaid, 0) / fr.reduce((t, v) => t + v.register, 0) * 100).toFixed(1) : "0", "%"]
            })
          }), C.jsx(je.Summary.Cell, {
            index: 5,
            children: C.jsxs("strong", {
              children: ["¥", fr.reduce((t, v) => t + v.newPaidAmt, 0).toLocaleString()]
            })
          }), C.jsx(je.Summary.Cell, {
            index: 6,
            children: C.jsx("strong", {
              children: fr.reduce((t, v) => t + v.totalPaid, 0)
            })
          }), C.jsx(je.Summary.Cell, {
            index: 7,
            children: C.jsxs("strong", {
              children: ["¥", fr.reduce((t, v) => t + v.totalPaidAmt, 0).toLocaleString()]
            })
          })]
        })
      })]
    }), C.jsx(St, {
      orientation: "left",
      plain: !0,
      className: "!text-sm !font-medium",
      children: "月维度排行"
    }), C.jsxs(tt, {
      gutter: [12, 12],
      children: [C.jsx(fe, {
        xs: 24,
        sm: 6,
        children: C.jsx(Ge, {
          title: "月注册TOP1",
          value: mrr[0] ? mrr[0].name : "-",
          suffix: mrr[0] ? mrr[0].register + "人" : "",
          trend: "up"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 6,
        children: C.jsx(Ge, {
          title: "月流水TOP1",
          value: mtop ? mtop.name : "-",
          suffix: mtop ? "¥" + mtop.totalPaidAmt.toLocaleString() : "",
          trend: "up"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 6,
        children: C.jsx(Ge, {
          title: "月新注册付费金额TOP1",
          value: mgr1 ? mgr1.name : "-",
          suffix: mgr1 ? "¥" + mgr1.newPaidAmt.toLocaleString() : "",
          trend: "up"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 6,
        children: C.jsx(Ge, {
          title: "月总付费用户数TOP1",
          value: mga1 ? mga1.name : "-",
          suffix: mga1 ? mga1.totalPaid + "人" : "",
          trend: "up"
        })
      })]
    }), C.jsxs(tt, {
      gutter: [16, 16],
      children: [C.jsx(fe, {
        xs: 24,
        lg: isLeader ? 24 : 12,
        children: C.jsx(dt, {
          title: "个人排行",
          height: 440,
          children: C.jsxs("div", {
            className: "space-y-2",
            children: [C.jsxs(Ze, {
              children: [C.jsx(Tr.RangePicker, {
                size: "small",
                style: {
                  width: 240
                },
                value: crg && crg.length === 2 ? crg : null,
                onChange: v => crgSet(v && v.length === 2 ? v : [Me().startOf("month"), Me()]),
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
                value: cdim,
                onChange: e => cdimSet(e.target.value),
                style: {
                  height: 28,
                  fontSize: 13,
                  padding: "0 8px",
                  border: "1px solid #d9d9d9",
                  borderRadius: 6,
                  color: "#262626",
                  background: "#fff"
                },
                title: "数据维度",
                children: [C.jsx("option", {
                  value: "注册",
                  children: "按注册"
                }), C.jsx("option", {
                  value: "流水",
                  children: "按流水"
                })]
              }), C.jsx("button", {
                type: "button",
                onClick: () => cAllSet(!0),
                style: {
                  height: 28,
                  fontSize: 13,
                  padding: "0 12px",
                  border: "1px solid #409eff",
                  borderRadius: 6,
                  color: "#fff",
                  background: "#409eff",
                  cursor: "pointer"
                },
                children: "显示全部"
              })]
            }), C.jsx(er, {
              option: Go(crt.map(q => cdim === "流水" ? q.totalPaidAmt : q.register), crt.map(q => q.name)),
              height: 280
            }), cAll && C.jsx("div", {
              "data-dc-person-modal": "1",
              onClick: () => cAllSet(!1),
              style: {
                position: "fixed",
                inset: 0,
                zIndex: 3000,
                background: "rgba(0,0,0,.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24
              },
              children: C.jsxs("div", {
                onClick: e => e.stopPropagation(),
                style: {
                  width: "min(1080px,94vw)",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  background: "#fff",
                  borderRadius: 12,
                  padding: "16px 20px 20px",
                  boxShadow: "0 16px 48px rgba(0,0,0,.25)"
                },
                children: [C.jsxs("div", {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "sticky",
                    top: -16,
                    background: "#fff",
                    zIndex: 2,
                    padding: "10px 0",
                    borderBottom: "1px solid #f0f0f0",
                    marginBottom: 10
                  },
                  children: [C.jsxs("span", {
                    style: {
                      fontSize: 16,
                      fontWeight: 600
                    },
                    children: ["个人排行 · 全部员工（", crAll.length, "人）"]
                  }), C.jsx("button", {
                    type: "button",
                    onClick: () => cAllSet(!1),
                    style: {
                      height: 30,
                      padding: "0 12px",
                      border: "1px solid #d9d9d9",
                      borderRadius: 6,
                      background: "#fff",
                      cursor: "pointer"
                    },
                    children: "关闭"
                  })]
                }), C.jsx(er, {
                  option: Go(crAll.map(q => cdim === "流水" ? q.totalPaidAmt : q.register), crAll.map(q => q.name)),
                  height: Math.max(660, crAll.length * 30)
                })]
              })
            })]
          })
        })
      }), !isLeader && C.jsx(fe, {
        xs: 24,
        lg: 12,
        children: C.jsx(dt, {
          title: "小组排行",
          height: 440,
          children: C.jsxs("div", {
            className: "space-y-2",
            children: [C.jsxs(Ze, {
              children: [C.jsx(Tr.RangePicker, {
                size: "small",
                style: {
                  width: 240
                },
                value: grg && grg.length === 2 ? grg : null,
                onChange: v => grgSet(v && v.length === 2 ? v : [Me().startOf("month"), Me()]),
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
                value: gdim,
                onChange: e => gdimSet(e.target.value),
                style: {
                  height: 28,
                  fontSize: 13,
                  padding: "0 8px",
                  border: "1px solid #d9d9d9",
                  borderRadius: 6,
                  color: "#262626",
                  background: "#fff"
                },
                title: "数据维度",
                children: [C.jsx("option", {
                  value: "注册",
                  children: "按注册"
                }), C.jsx("option", {
                  value: "流水",
                  children: "按流水"
                })]
              })]
            }), C.jsx(er, {
              option: Go(grt.map(q => gdim === "流水" ? q.totalPaidAmt : q.register), grt.map(q => q.name)),
              height: 280
            })]
          })
        })
      })]
    })]
  });
}
