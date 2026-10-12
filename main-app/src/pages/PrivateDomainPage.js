import { C, Ge, Hr, Is, Jt, Ke, Me, St, Tr, Tt, Ze, __API__, dcPrivateMetricColumns, dcPrivateSummary, dcTableWithSort, dt, ea, fe, fetch, ft, hr, nn, pn, tt } from "../runtime/application.js";

export default function PrivateDomainPage() {
  const W = ft(e => e.packageType),
    F = ft(e => e.setPackageType),
    t = ft(e => e.customerTeamFilter),
    v = ft(e => e.setCustomerTeamFilter),
    y = Jt();
  const [re, reSet] = Ke.useState(null),
    [hrSt, hrSet] = Ke.useState(Hr),
    [ds1, ds1Set] = Ke.useState([Me().format("YYYY-MM-DD"), Me().format("YYYY-MM-DD")]),
    [ds2, ds2Set] = Ke.useState([Me().format("YYYY-MM-DD"), Me().format("YYYY-MM-DD")]),
    [ds3, ds3Set] = Ke.useState([Me().format("YYYY-MM-DD"), Me().format("YYYY-MM-DD")]);
  Ke.useEffect(() => {
    let on = !0;
    fetch("/api/private/projects" + (ds1 && ds1.length === 2 ? "?date_from=" + ds1[0] + "&date_to=" + ds1[1] : "")).then(z => z.json()).then(j => {
      if (on) {
        const d = j.data || [];
        reSet(Array.isArray(d) ? d : []);
      }
    }).catch(() => {});
    return () => {
      on = !1;
    };
  }, [ds1]);
  const [td, tdSet] = Ke.useState(null),
    [tm, tmSet] = Ke.useState([]),
    [pd, pdSet] = Ke.useState(null);
  Ke.useEffect(() => {
    let on = !0;
    fetch("/api/private/teams" + (ds2 && ds2.length === 2 ? "?date_from=" + ds2[0] + "&date_to=" + ds2[1] : "")).then(z => z.json()).then(j => {
      if (on) {
        const d = j.data || {};
        tdSet(Array.isArray(d.teams) ? d.teams : []);
        tmSet(Array.isArray(d.meta) ? d.meta : []);
        window.__PRIVATE_DATE = d.date || "";
      }
    }).catch(() => {});
    return () => {
      on = !1;
    };
  }, [ds2]);
  Ke.useEffect(() => {
    let on = !0;
    fetch("/api/private/persons" + (ds3 && ds3.length === 2 ? "?date_from=" + ds3[0] + "&date_to=" + ds3[1] : "")).then(z => z.json()).then(j => {
      if (on) {
        const d = j.data || {};
        pdSet(Array.isArray(d.persons) ? d.persons : []);
      }
    }).catch(() => {});
    return () => {
      on = !1;
    };
  }, [ds3]);
  Ke.useEffect(() => {
    let on = true;
    const load = async () => {
      try {
        const z = await (await fetch(__API__ + "/api/channels?date=" + Me().format("YYYY-MM-DD"))).json();
        const c = Array.isArray(z.data) ? z.data : [];
        if (on) hrSet({
          active: c.filter(x => x.reg > 0).length,
          quality: "--",
          risk: "--",
          totalRevenue: Math.round(c.reduce((s, x) => s + (x.flow || 0), 0) * 100) / 100,
          totalROI: "--"
        });
      } catch (e) {}
    };
    load();
    return () => {
      on = false;
    };
  }, []);
  const u = td || [],
    s = Ke.useMemo(() => t === "all" ? u : u.filter(q => q.name === t), [u, t]),
    o = Ke.useMemo(() => s.map((e, r) => ({
      ...e,
      team: e.name,
      key: e.name
    })), [s]),
    n = dcPrivateMetricColumns([{
      title: "小组",
      dataIndex: "team",
      key: "team",
      width: 80,
      sorter: (a, b) => String(a.team || "").localeCompare(String(b.team || ""), "zh"),
      render: e => C.jsx("span", {
        style: {
          color: "#409eff",
          cursor: "pointer",
          textDecoration: "underline"
        },
        onClick: () => y(`/dashboard/team-detail/${encodeURIComponent(e)}?date_from=${ds2 && ds2.length === 2 ? ds2[0] : window.__PRIVATE_DATE || ""}&date_to=${ds2 && ds2.length === 2 ? ds2[1] : window.__PRIVATE_DATE || ""}`),
        children: e
      })
    }]);
  return C.jsxs("div", {
    className: "space-y-6",
    children: [C.jsxs(Ze, {
      className: "w-full justify-between",
      children: [C.jsx(hr, {
        title: "私域数据看板"
      }), C.jsx(nn, {
        value: W,
        onChange: F
      })]
    }), C.jsx(Ze, {
      className: "mb-2",
      children: C.jsxs(Ze, {
        children: [C.jsx(Is, {
          teams: tm.length ? tm.map(x => ({
            id: x,
            name: x
          })) : pn,
          value: t,
          onChange: v
        }), C.jsxs("span", {
          style: {
            fontSize: 12,
            color: Tt.t3
          },
          children: ["最新业务日 ", window.__PRIVATE_DATE || "--"]
        })]
      })
    }), C.jsx(dt, {
      title: "各小组日数据汇总",
      extra: C.jsx(Tr.RangePicker, {
        size: "small",
        style: {
          width: 220
        },
        value: ds2 && ds2.length === 2 ? [Me(ds2[0]), Me(ds2[1])] : null,
        onChange: h => ds2Set(h && h.length === 2 ? [h[0].format("YYYY-MM-DD"), h[1].format("YYYY-MM-DD")] : [Me().format("YYYY-MM-DD"), Me().format("YYYY-MM-DD")]),
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
      }),
      height: null,
      children: C.jsx(dcTableWithSort, {
        columns: n,
        dataSource: W === "sub" ? [{
          key: "sub",
          team: "分包数据待接入",
          register: "--",
          newPaid: "--",
          paidUsers: "--",
          revenue: "--",
          newRegRevenue: "--"
        }] : o,
        pagination: !1,
        size: "small",
        bordered: !0,
        scroll: {
          x: 1250,
          y: 380
        },
        summary: () => dcPrivateSummary(W === "sub" ? [] : o, 1)
      })
    }), C.jsx(St, {
      orientation: "left",
      plain: !0,
      className: "!text-sm !font-medium",
      children: "分人数据"
    }), C.jsx(dt, {
      title: "分人数据汇总",
      extra: C.jsx(Tr.RangePicker, {
        size: "small",
        style: {
          width: 220
        },
        value: ds3 && ds3.length === 2 ? [Me(ds3[0]), Me(ds3[1])] : null,
        onChange: h => ds3Set(h && h.length === 2 ? [h[0].format("YYYY-MM-DD"), h[1].format("YYYY-MM-DD")] : [Me().format("YYYY-MM-DD"), Me().format("YYYY-MM-DD")]),
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
      }),
      height: null,
      children: C.jsx(dcTableWithSort, {
        columns: dcPrivateMetricColumns([{
          title: "人员",
          dataIndex: "name",
          width: 100,
          sorter: (a, b) => String(a.name || "").localeCompare(String(b.name || ""), "zh")
        }, {
          title: "小组",
          dataIndex: "team",
          width: 100,
          sorter: (a, b) => String(a.team || "").localeCompare(String(b.team || ""), "zh")
        }]),
        dataSource: W === "sub" ? [{
          key: "sub",
          name: "分包数据待接入",
          team: "--",
          register: "--",
          newPaid: "--",
          paidUsers: "--",
          revenue: "--",
          newRegRevenue: "--"
        }] : (pd || []).filter(q => t === "all" || q.team === t).map((q, x) => ({
          ...q,
          key: String(x)
        })),
        size: "small",
        pagination: !1,
        bordered: !0,
        scroll: {
          x: 1350,
          y: 380
        }
      })
    }), !1 && C.jsx(St, {
      orientation: "left",
      plain: !0,
      className: "!text-sm !font-medium",
      children: "游戏数据排行"
    }), !1 && C.jsx(dt, {
      title: "各项目数据汇总",
      extra: C.jsx(Tr.RangePicker, {
        size: "small",
        style: {
          width: 220
        },
        value: ds1 && ds1.length === 2 ? [Me(ds1[0]), Me(ds1[1])] : null,
        onChange: h => ds1Set(h && h.length === 2 ? [h[0].format("YYYY-MM-DD"), h[1].format("YYYY-MM-DD")] : [Me().format("YYYY-MM-DD"), Me().format("YYYY-MM-DD")]),
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
      }),
      height: null,
      children: C.jsx(dcTableWithSort, {
        columns: dcPrivateMetricColumns([{
          title: "游戏名称",
          dataIndex: "name",
          width: 130,
          sorter: (a, b) => String(a.name || "").localeCompare(String(b.name || ""), "zh"),
          render: e => C.jsx("span", {
            style: {
              color: "#409eff",
              cursor: "pointer",
              textDecoration: "underline"
            },
            onClick: () => y(`/dashboard/game-person/${encodeURIComponent(e)}?date_from=${ds1 && ds1.length === 2 ? ds1[0] : window.__PRIVATE_DATE || "2026-08-07"}&date_to=${ds1 && ds1.length === 2 ? ds1[1] : window.__PRIVATE_DATE || "2026-08-07"}`),
            children: e
          })
        }]),
        dataSource: W === "sub" ? [{
          key: "sub",
          name: "分包数据待接入",
          register: "--",
          newPaid: "--",
          paidUsers: "--",
          revenue: "--",
          newRegRevenue: "--"
        }] : (re || []).map((q, x) => ({
          key: String(x),
          name: q.name,
          register: q.newAcct,
          newPaid: q.payNew,
          newRegRevenue: q.payNewAmt,
          active: q.active,
          paidUsers: q.payAcct,
          revenue: q.payAmt
        })),
        size: "small",
        pagination: !1,
        bordered: !0,
        scroll: {
          x: 1300,
          y: 380
        },
        summary: () => dcPrivateSummary(re || [], 1)
      })
    }), C.jsx(St, {
      orientation: "left",
      plain: !0,
      className: "!text-sm !font-medium",
      children: "公众号每日更新数据"
    }), C.jsx(dt, {
      height: null,
      title: "公众号最新数据 · 截至 2026-09-23",
      children: C.jsx(dcTableWithSort, {
        columns: [{
          title: "公众号归属",
          dataIndex: "owner",
          width: 100
        }, {
          title: "发布时间",
          dataIndex: "pubTime",
          width: 100
        }, {
          title: "公众号名",
          dataIndex: "name",
          width: 130
        }, {
          title: "公众号ID",
          dataIndex: "id",
          width: 120
        }, {
          title: "是否更新",
          dataIndex: "updated",
          width: 80,
          render: e => C.jsx("span", {
            style: {
              color: e ? "#00B42A" : "#86909C"
            },
            children: e ? "已更新" : "未更新"
          })
        }, {
          title: "标题",
          dataIndex: "title",
          width: 200,
          ellipsis: !0
        }, {
          title: "阅读人数",
          dataIndex: "reads",
          align: "right",
          width: 80
        }, {
          title: "点赞人数",
          dataIndex: "likes",
          align: "right",
          width: 80
        }, {
          title: "分享人数",
          dataIndex: "shares",
          align: "right",
          width: 80
        }, {
          title: "推荐人数",
          dataIndex: "recommends",
          align: "right",
          width: 80
        }, {
          title: "留言条数",
          dataIndex: "comments",
          align: "right",
          width: 80
        }],
        dataSource: [{
          "owner": "瓜玩复古",
          "pubTime": "-",
          "name": "瓜玩复古",
          "id": "gh_5fdf6e79422b",
          "updated": false,
          "title": "-",
          "reads": 0,
          "likes": 0,
          "shares": 0,
          "recommends": 0,
          "comments": 0,
          "key": "mp1"
        }, {
          "owner": "瓜玩手游",
          "pubTime": "-",
          "name": "瓜玩手游",
          "id": "gh_4c53bf9a7853",
          "updated": false,
          "title": "-",
          "reads": 0,
          "likes": 0,
          "shares": 0,
          "recommends": 0,
          "comments": 0,
          "key": "mp2"
        }, {
          "owner": "185合击",
          "pubTime": "-",
          "name": "185合击",
          "id": "gh_d2368c85089f",
          "updated": false,
          "title": "-",
          "reads": 0,
          "likes": 0,
          "shares": 0,
          "recommends": 0,
          "comments": 0,
          "key": "mp3"
        }],
        size: "small",
        pagination: !1,
        bordered: !0,
        scroll: {
          x: 1100
        }
      })
    }), !1 && C.jsx(St, {
      orientation: "left",
      plain: !0,
      className: "!text-sm !font-medium",
      children: "短视频发布数据"
    }), !1 && C.jsxs("div", {
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
          children: "短视频发布数据 · 昨日汇总"
        }), C.jsx(Ze, {
          children: C.jsx(Tr, {
            size: "small",
            defaultValue: Me().subtract(1, "d"),
            placeholder: "选择日期",
            onChange: () => {}
          })
        })]
      }), C.jsx(dcTableWithSort, {
        columns: [{
          title: "账号归属",
          dataIndex: "owner",
          width: 100,
          render: e => C.jsx("span", {
            style: {
              color: "#409eff",
              cursor: "pointer",
              textDecoration: "underline"
            },
            onClick: () => y(`/dashboard/video-accounts/${encodeURIComponent(e)}`),
            children: e
          })
        }, {
          title: "账号数",
          dataIndex: "accountCount",
          align: "right",
          width: 70
        }, {
          title: "更新数",
          dataIndex: "updatedCount",
          align: "right",
          width: 70
        }, {
          title: "总粉丝数",
          dataIndex: "totalFans",
          align: "right",
          width: 90,
          render: e => Number(e).toLocaleString("zh-CN")
        }, {
          title: "播放量",
          dataIndex: "totalViews",
          align: "right",
          width: 90,
          render: e => Number(e).toLocaleString("zh-CN")
        }, {
          title: "点赞量",
          dataIndex: "totalLikes",
          align: "right",
          width: 80,
          render: e => Number(e).toLocaleString("zh-CN")
        }, {
          title: "评论量",
          dataIndex: "totalComments",
          align: "right",
          width: 80
        }, {
          title: "分享量",
          dataIndex: "totalShares",
          align: "right",
          width: 80
        }, {
          title: "收藏量",
          dataIndex: "totalSaves",
          align: "right",
          width: 80
        }, {
          title: "弹幕量",
          dataIndex: "totalDanmaku",
          align: "right",
          width: 80
        }, {
          title: "完播率",
          dataIndex: "avgCompletion",
          align: "right",
          width: 80,
          render: e => `${e}%`
        }, {
          title: "2S跳出率",
          dataIndex: "avgBounce",
          align: "right",
          width: 90,
          render: e => `${e}%`
        }],
        dataSource: [{
          owner: "开天组",
          accountCount: 3,
          updatedCount: 3,
          totalFans: 58e4,
          totalViews: 505e3,
          totalLikes: 25600,
          totalComments: 5200,
          totalShares: 9400,
          totalSaves: 7e3,
          totalDanmaku: 3200,
          avgCompletion: 43,
          avgBounce: 19,
          key: "va1"
        }, {
          owner: "屠龙组",
          accountCount: 2,
          updatedCount: 2,
          totalFans: 285e3,
          totalViews: 185e3,
          totalLikes: 9800,
          totalComments: 2100,
          totalShares: 3800,
          totalSaves: 2800,
          totalDanmaku: 1200,
          avgCompletion: 38,
          avgBounce: 22,
          key: "va2"
        }, {
          owner: "聚财组",
          accountCount: 2,
          updatedCount: 2,
          totalFans: 65e4,
          totalViews: 52e4,
          totalLikes: 28500,
          totalComments: 5800,
          totalShares: 9200,
          totalSaves: 6800,
          totalDanmaku: 3500,
          avgCompletion: 48,
          avgBounce: 15,
          key: "va3"
        }, {
          owner: "内容组",
          accountCount: 3,
          updatedCount: 2,
          totalFans: 11e4,
          totalViews: 72e3,
          totalLikes: 4200,
          totalComments: 890,
          totalShares: 1500,
          totalSaves: 1100,
          totalDanmaku: 580,
          avgCompletion: 35,
          avgBounce: 25,
          key: "va4"
        }],
        size: "small",
        pagination: !1,
        bordered: !0
      })]
    }), !1 && C.jsxs(St, {
      orientation: "left",
      plain: !0,
      className: "!text-sm !font-medium",
      children: [C.jsx(ea, {
        className: "mr-1"
      }), "渠道"]
    }), !1 && C.jsxs(tt, {
      gutter: [12, 12],
      children: [C.jsx(fe, {
        xs: 24,
        sm: 12,
        md: 4,
        children: C.jsx(Ge, {
          title: "在投渠道",
          value: hrSt.active,
          suffix: "个"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 12,
        md: 4,
        children: C.jsx(Ge, {
          title: "优质渠道",
          value: hrSt.quality,
          suffix: "个",
          trend: "up"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 12,
        md: 4,
        children: C.jsx(Ge, {
          title: "风险渠道",
          value: hrSt.risk,
          suffix: "个",
          trend: "down"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 12,
        md: 6,
        children: C.jsx(Ge, {
          title: "渠道总流水",
          value: `¥${hrSt.totalRevenue.toLocaleString("zh-CN")}`,
          trend: "up",
          trendValue: "+12%",
          compareLabel: "环比"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 12,
        md: 6,
        children: C.jsx(Ge, {
          title: "总ROI",
          value: `${hrSt.totalROI}`,
          trend: "up"
        })
      })]
    })]
  });
}
