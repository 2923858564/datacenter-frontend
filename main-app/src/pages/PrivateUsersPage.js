import { C, Dt, Io, No, Oo, Po, Pt, St, Ze, dt, er, fe, ft, nn, qt, rr, rs, tt, vi, wi, yr } from "../runtime/application.js";

export default function PrivateUsersPage() {
  const W = ft(t => t.packageType),
    F = ft(t => t.setPackageType);
  return C.jsxs("div", {
    className: "space-y-6",
    children: [C.jsxs(Ze, {
      className: "w-full justify-between",
      children: [C.jsxs("h2", {
        className: "text-xl font-semibold",
        children: [C.jsx(rs, {
          className: "mr-2"
        }), "私域用户维护看板"]
      }), C.jsx(nn, {
        value: W,
        onChange: F
      })]
    }), C.jsx(St, {
      orientation: "left",
      plain: !0,
      className: "!text-sm !font-medium",
      children: "日维度指标（昨日 vs 今日）"
    }), C.jsxs(tt, {
      gutter: [12, 12],
      children: [C.jsx(fe, {
        xs: 24,
        sm: 12,
        md: 4,
        children: C.jsx(Dt, {
          title: "日注册",
          todayValue: rr.today.register,
          yesterdayValue: rr.yesterday.register,
          trendPercent: null,
          trendDirection: "up"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 12,
        md: 5,
        children: C.jsx(Dt, {
          title: "日流水",
          todayValue: rr.today.revenue,
          yesterdayValue: rr.yesterday.revenue,
          format: "currency",
          trendPercent: null,
          trendDirection: "up"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 12,
        md: 5,
        children: C.jsx(Dt, {
          title: "日付费用户",
          todayValue: rr.today.paidUsers,
          yesterdayValue: rr.yesterday.paidUsers,
          trendPercent: null,
          trendDirection: "up"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 12,
        md: 5,
        children: C.jsx(Dt, {
          title: "日新增付费用户",
          todayValue: rr.today.newPaid,
          yesterdayValue: rr.yesterday.newPaid,
          trendPercent: null,
          trendDirection: "up"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 12,
        md: 5,
        children: C.jsx(Dt, {
          title: "日新增付费流水",
          todayValue: rr.today.newRev,
          yesterdayValue: rr.yesterday.newRev,
          format: "currency",
          trendPercent: null,
          trendDirection: "up"
        })
      })]
    }), C.jsxs(tt, {
      gutter: [16, 16],
      children: [C.jsx(fe, {
        xs: 24,
        lg: 12,
        children: C.jsx(dt, {
          title: "日总注册趋势（近30天）",
          children: C.jsx(yr, {
            option: vi("注册", Io),
            height: 300
          })
        })
      }), C.jsx(fe, {
        xs: 24,
        lg: 12,
        children: C.jsx(dt, {
          title: "日总流水趋势（近30天）",
          children: C.jsx(yr, {
            option: vi("流水", Po),
            height: 300
          })
        })
      })]
    }), C.jsx(St, {
      orientation: "left",
      plain: !0,
      className: "!text-sm !font-medium",
      children: "月维度指标"
    }), C.jsxs(tt, {
      gutter: [12, 12],
      children: [C.jsx(fe, {
        xs: 24,
        sm: 12,
        md: 4,
        children: C.jsx(Pt, {
          title: "月总注册",
          currentValue: qt.cur.register,
          compareValue: qt.cmp.register,
          compareLabel: "环比上月",
          trendPercent: null,
          trendDirection: "up"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 12,
        md: 4,
        children: C.jsx(Pt, {
          title: "月总流水",
          currentValue: qt.cur.revenue,
          compareValue: qt.cmp.revenue,
          compareLabel: "环比上月",
          trendPercent: null,
          trendDirection: "up"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 12,
        md: 4,
        children: C.jsx(Pt, {
          title: "月总付费数",
          currentValue: qt.cur.paid,
          compareValue: qt.cmp.paid,
          compareLabel: "环比上月",
          trendPercent: null,
          trendDirection: "up"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 12,
        md: 4,
        children: C.jsx(Pt, {
          title: "月新增付费",
          currentValue: qt.cur.newPaid,
          compareValue: qt.cmp.newPaid,
          compareLabel: "上月同期",
          trendPercent: null,
          trendDirection: "up"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 12,
        md: 4,
        children: C.jsx(Pt, {
          title: "新增用户流水",
          currentValue: qt.cur.newRev,
          compareValue: qt.cmp.newRev,
          compareLabel: "上月同期",
          trendPercent: null,
          trendDirection: "up"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 12,
        md: 4,
        children: C.jsx(Pt, {
          title: "非本月新增流水",
          currentValue: qt.cur.oldRev,
          compareValue: qt.cmp.oldRev,
          compareLabel: "上月数据",
          trendPercent: null,
          trendDirection: "up"
        })
      })]
    }), C.jsxs(tt, {
      gutter: [16, 16],
      children: [C.jsx(fe, {
        xs: 24,
        lg: 12,
        children: C.jsx(dt, {
          title: "月总注册趋势（近12月）",
          children: C.jsx(er, {
            option: wi("注册", Oo),
            height: 300
          })
        })
      }), C.jsx(fe, {
        xs: 24,
        lg: 12,
        children: C.jsx(dt, {
          title: "月总流水趋势（近12月）",
          children: C.jsx(er, {
            option: wi("流水", No),
            height: 300
          })
        })
      })]
    })]
  });
}
