import { C, Ge, Gr, Mt, Xr, Ze, biFetch, cs, dcTableWithSort, dt, fe, ia, tt, xt } from "../runtime/application.js";

export default function ChannelContractPage() {
  const A = Xr.useState({
      rows: [],
      summary: {}
    }),
    D = A[0],
    S = A[1];
  Xr.useEffect(() => {
    biFetch("/api/v1/channel-contract").then(S);
  }, []);
  const sm = D.summary || {};
  const rows = (D.rows || []).map((x, i) => ({
    ...x,
    key: String(i)
  }));
  const cols = [{
    title: "渠道",
    dataIndex: "channel_code",
    width: 70,
    render: v => C.jsx(Mt, {
      children: v
    })
  }, {
    title: "公司全称",
    dataIndex: "channel_name",
    width: 200,
    ellipsis: !0
  }, {
    title: "合作角色",
    dataIndex: "partner_type",
    width: 100
  }, {
    title: "合同编号",
    dataIndex: "contract_no",
    width: 100,
    render: v => C.jsx("span", {
      style: {
        fontFamily: "monospace"
      },
      children: v
    })
  }, {
    title: "签署日期",
    dataIndex: "sign_date",
    width: 90,
    render: () => "--"
  }, {
    title: "到期日期",
    dataIndex: "expire_date",
    width: 90,
    render: () => "--"
  }, {
    title: "金额",
    dataIndex: "amount",
    width: 80,
    align: "right",
    render: () => "--"
  }, {
    title: "状态",
    dataIndex: "status",
    width: 80,
    render: v => C.jsx(Mt, {
      color: "orange",
      children: v
    })
  }, {
    title: "操作",
    key: "act",
    width: 70,
    render: () => C.jsx(xt, {
      type: "link",
      size: "small",
      icon: C.jsx(ia, {}),
      children: "查看"
    })
  }];
  const kpi = C.jsxs(tt, {
    gutter: [12, 12],
    children: [C.jsx(fe, {
      xs: 24,
      sm: 6,
      children: C.jsx(Ge, {
        title: "渠道总数",
        value: sm.total || 0,
        suffix: "家"
      })
    }), C.jsx(fe, {
      xs: 24,
      sm: 6,
      children: C.jsx(Ge, {
        title: "待确认合同",
        value: sm.pending || 0,
        suffix: "份",
        trend: "down"
      })
    }), C.jsx(fe, {
      xs: 24,
      sm: 6,
      children: C.jsx(Ge, {
        title: "即将到期",
        value: sm.expiring || 0,
        suffix: "份"
      })
    }), C.jsx(fe, {
      xs: 24,
      sm: 6,
      children: C.jsx(Ge, {
        title: "已过期",
        value: sm.expired || 0,
        suffix: "份"
      })
    })]
  });
  const addBtn = C.jsx(xt, {
    type: "primary",
    size: "small",
    icon: C.jsx(cs, {}),
    children: "新增合同"
  });
  const table = C.jsx(dcTableWithSort, {
    columns: cols,
    dataSource: rows,
    size: "small",
    pagination: !1,
    scroll: {
      x: 880
    }
  });
  const card = C.jsx(dt, {
    title: "合同列表",
    subtitle: "合同表在财务侧 Base，当前标注待接入（渠道清单为真实数据）",
    children: [C.jsxs(Ze, {
      className: "mb-3",
      children: [addBtn]
    }), table]
  });
  return C.jsxs("div", {
    className: "space-y-6",
    children: [C.jsxs("h2", {
      className: "text-xl font-semibold",
      children: [C.jsx(Gr, {
        className: "mr-2"
      }), "渠道合同"]
    }), kpi, card]
  });
}
