import { C, Dt, Pt, St, Vo, Wo, Xn, Xo, Xt, Ze, dt, er, fe, ft, ji, ki, nn, nr, qo, tt, yr } from "../runtime/application.js";

export default function ContentPage() {
  const W = ft(t => t.packageType),
    F = ft(t => t.setPackageType);
  return C.jsxs("div", {
    className: "space-y-6",
    children: [C.jsxs(Ze, {
      className: "w-full justify-between",
      children: [C.jsxs("h2", {
        className: "text-xl font-semibold",
        children: [C.jsx(Xn, {
          className: "mr-2"
        }), "短视频 & 公众号看板"]
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
          todayValue: nr.today.register,
          yesterdayValue: nr.yesterday.register,
          trendPercent: null,
          trendDirection: "up"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 12,
        md: 5,
        children: C.jsx(Dt, {
          title: "日流水",
          todayValue: nr.today.revenue,
          yesterdayValue: nr.yesterday.revenue,
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
          todayValue: nr.today.paidUsers,
          yesterdayValue: nr.yesterday.paidUsers,
          trendPercent: null,
          trendDirection: "up"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 12,
        md: 5,
        children: C.jsx(Dt, {
          title: "日新增付费用户",
          todayValue: nr.today.newPaid,
          yesterdayValue: nr.yesterday.newPaid,
          trendPercent: null,
          trendDirection: "up"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 12,
        md: 5,
        children: C.jsx(Dt, {
          title: "日新增付费流水",
          todayValue: nr.today.newRev,
          yesterdayValue: nr.yesterday.newRev,
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
            option: ki("注册", Vo),
            height: 300
          })
        })
      }), C.jsx(fe, {
        xs: 24,
        lg: 12,
        children: C.jsx(dt, {
          title: "日总流水趋势（近30天）",
          children: C.jsx(yr, {
            option: ki("流水", Wo),
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
          currentValue: Xt.cur.register,
          compareValue: Xt.cmp.register,
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
          currentValue: Xt.cur.revenue,
          compareValue: Xt.cmp.revenue,
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
          currentValue: Xt.cur.paid,
          compareValue: Xt.cmp.paid,
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
          currentValue: Xt.cur.newPaid,
          compareValue: Xt.cmp.newPaid,
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
          currentValue: Xt.cur.newRev,
          compareValue: Xt.cmp.newRev,
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
          currentValue: Xt.cur.oldRev,
          compareValue: Xt.cmp.oldRev,
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
            option: ji("注册", qo),
            height: 300
          })
        })
      }), C.jsx(fe, {
        xs: 24,
        lg: 12,
        children: C.jsx(dt, {
          title: "月总流水趋势（近12月）",
          children: C.jsx(er, {
            option: ji("流水", Xo),
            height: 300
          })
        })
      })]
    })]
  });
}
