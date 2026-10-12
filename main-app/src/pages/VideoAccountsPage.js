import { $r, C, Jt, Ke, Kt, Me, St, Tr, Ze, dcTableWithSort, dl, fe, hr, mn, tr, tt, xt, zr } from "../runtime/application.js";

export default function VideoAccountsPage() {
  const {
      name: W
    } = zr(),
    F = Jt(),
    t = decodeURIComponent(W || ""),
    [v, y] = Ke.useState(Me().subtract(1, "d")),
    u = dl[t] || [],
    s = [{
      title: "发布时间",
      dataIndex: "pubTime",
      width: 90
    }, {
      title: "抖音名",
      dataIndex: "name",
      width: 130,
      render: o => C.jsx("span", {
        className: "font-medium",
        children: o
      })
    }, {
      title: "粉丝数",
      dataIndex: "fans",
      align: "right",
      width: 90,
      render: o => mn(o)
    }, {
      title: "抖音号",
      dataIndex: "id",
      width: 120,
      render: o => C.jsx("span", {
        style: {
          fontFamily: "monospace"
        },
        children: o
      })
    }, {
      title: "是否更新",
      dataIndex: "updated",
      width: 80,
      render: o => C.jsx("span", {
        style: {
          color: o ? "#00B42A" : "#86909C"
        },
        children: o ? "已更新" : "未更新"
      })
    }, {
      title: "标题",
      dataIndex: "title",
      width: 180,
      ellipsis: !0
    }, {
      title: "播放量",
      dataIndex: "views",
      align: "right",
      width: 90,
      render: o => mn(o)
    }, {
      title: "点赞量",
      dataIndex: "likes",
      align: "right",
      width: 80,
      render: o => mn(o)
    }, {
      title: "评论量",
      dataIndex: "comments",
      align: "right",
      width: 80
    }, {
      title: "分享量",
      dataIndex: "shares",
      align: "right",
      width: 80
    }, {
      title: "收藏量",
      dataIndex: "saves",
      align: "right",
      width: 80
    }, {
      title: "弹幕量",
      dataIndex: "danmaku",
      align: "right",
      width: 80
    }, {
      title: "完播率",
      dataIndex: "completion",
      align: "right",
      width: 80,
      render: o => `${o}%`
    }, {
      title: "2S跳出率",
      dataIndex: "bounce",
      align: "right",
      width: 90,
      render: o => `${o}%`
    }];
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
          title: `${t} · 账号明细`
        }), C.jsx(Tr, {
          size: "small",
          value: v,
          onChange: o => o && y(o),
          placeholder: "选择日期"
        })]
      }), C.jsx(tr, {
        filename: `${t}_视频账号数据`,
        label: "导出",
        dataSource: u.map(o => ({
          ...o,
          updated: o.updated ? "是" : "否"
        })),
        columns: [{
          title: "抖音名",
          dataIndex: "name"
        }, {
          title: "粉丝数",
          dataIndex: "fans"
        }, {
          title: "抖音号",
          dataIndex: "id"
        }, {
          title: "是否更新",
          dataIndex: "updated"
        }, {
          title: "标题",
          dataIndex: "title"
        }, {
          title: "播放量",
          dataIndex: "views"
        }, {
          title: "点赞量",
          dataIndex: "likes"
        }, {
          title: "评论量",
          dataIndex: "comments"
        }, {
          title: "分享量",
          dataIndex: "shares"
        }, {
          title: "收藏量",
          dataIndex: "saves"
        }, {
          title: "弹幕量",
          dataIndex: "danmaku"
        }, {
          title: "完播率",
          dataIndex: "completion"
        }, {
          title: "2S跳出率",
          dataIndex: "bounce"
        }]
      })]
    }), C.jsxs(St, {
      orientation: "left",
      plain: !0,
      className: "!text-sm !font-medium",
      children: ["账号概况 · ", v.format("YYYY-MM-DD")]
    }), C.jsxs(tt, {
      gutter: [12, 12],
      children: [C.jsx(fe, {
        xs: 12,
        sm: 6,
        children: C.jsxs("div", {
          style: {
            background: "#fff",
            border: `1px solid ${Kt.border}`,
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
              color: Kt.t2
            },
            children: "账号总数"
          }), C.jsx("span", {
            style: {
              fontSize: 26,
              fontWeight: 600,
              color: Kt.t1
            },
            children: u.length
          })]
        })
      }), C.jsx(fe, {
        xs: 12,
        sm: 6,
        children: C.jsxs("div", {
          style: {
            background: "#fff",
            border: `1px solid ${Kt.border}`,
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
              color: Kt.t2
            },
            children: "今日更新"
          }), C.jsx("span", {
            style: {
              fontSize: 26,
              fontWeight: 600,
              color: Kt.t1
            },
            children: u.filter(o => o.updated).length
          })]
        })
      }), C.jsx(fe, {
        xs: 12,
        sm: 6,
        children: C.jsxs("div", {
          style: {
            background: "#fff",
            border: `1px solid ${Kt.border}`,
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
              color: Kt.t2
            },
            children: "总播放量"
          }), C.jsx("span", {
            style: {
              fontSize: 26,
              fontWeight: 600,
              color: Kt.t1
            },
            children: mn(u.reduce((o, n) => o + n.views, 0))
          })]
        })
      }), C.jsx(fe, {
        xs: 12,
        sm: 6,
        children: C.jsxs("div", {
          style: {
            background: "#fff",
            border: `1px solid ${Kt.border}`,
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
              color: Kt.t2
            },
            children: "平均完播率"
          }), C.jsxs("span", {
            style: {
              fontSize: 26,
              fontWeight: 600,
              color: Kt.t1
            },
            children: [u.length > 0 ? (u.reduce((o, n) => o + n.completion, 0) / u.length).toFixed(1) : "0", "%"]
          })]
        })
      })]
    }), C.jsx(St, {
      orientation: "left",
      plain: !0,
      className: "!text-sm !font-medium",
      children: "各账号数据明细"
    }), C.jsxs("div", {
      style: {
        background: "#fff",
        border: "1px solid #f0f0f0",
        borderRadius: 12,
        padding: "12px 16px",
        boxShadow: "0 1px 4px rgba(0,0,0,.06)"
      },
      children: [C.jsxs("span", {
        style: {
          fontSize: 15,
          fontWeight: 600,
          color: "#262626"
        },
        children: [t, " · 各账号", v.format("MM-DD"), "数据"]
      }), C.jsx(dcTableWithSort, {
        className: "mt-2",
        columns: s,
        dataSource: u.map((o, n) => ({
          ...o,
          key: `a${n}`
        })),
        size: "small",
        pagination: !1,
        bordered: !0,
        scroll: {
          x: 1300
        }
      })]
    })]
  });
}
