import { C, Gr, Hn, Ke, Mr, Mt, On, St, Vl, Vt, Yr, Ze, aa, cr, cs, dcTableWithSort, fe, la, ls, oa, tt, ua, xt } from "../runtime/application.js";

export default function LegacyRolesPage() {
  const [W, F] = Ke.useState(Vl),
    [t, v] = Ke.useState(null),
    [y, u] = Ke.useState(!1),
    [s, o] = Ke.useState(null),
    [n, e] = Ke.useState([]),
    [r] = cr.useForm(),
    l = p => {
      v(p), e(p.permissions);
    },
    i = () => {
      r.validateFields().then(p => {
        if (s) F(h => h.map(x => x.id === s.id ? {
          ...x,
          name: p.name,
          description: p.description
        } : x)), (t == null ? void 0 : t.id) === s.id && v(h => h ? {
          ...h,
          name: p.name,
          description: p.description
        } : null);else {
          const h = {
            id: `r${Date.now()}`,
            name: p.name,
            description: p.description,
            permissions: [],
            userCount: 0
          };
          F(x => [...x, h]);
        }
        u(!1), o(null), r.resetFields(), Yr.success(s ? "角色更新成功" : "角色创建成功");
      });
    },
    a = p => {
      F(h => h.filter(x => x.id !== p)), (t == null ? void 0 : t.id) === p && v(null), Yr.success("角色已删除");
    },
    d = () => {
      t && (F(p => p.map(h => h.id === t.id ? {
        ...h,
        permissions: n
      } : h)), v({
        ...t,
        permissions: n
      }), Yr.success("权限已保存"));
    },
    f = [{
      title: "角色",
      dataIndex: "name",
      key: "name",
      width: 100,
      render: p => C.jsxs(Ze, {
        children: [C.jsx(Gr, {
          style: {
            color: "#1677FF"
          }
        }), p]
      })
    }, {
      title: "描述",
      dataIndex: "description",
      key: "desc",
      ellipsis: !0
    }, {
      title: "用户",
      dataIndex: "userCount",
      key: "uc",
      width: 50,
      align: "center"
    }, {
      title: "",
      key: "action",
      width: 80,
      render: (p, h) => C.jsxs(Ze, {
        size: "small",
        children: [C.jsx(xt, {
          type: "link",
          size: "small",
          icon: C.jsx(oa, {}),
          onClick: x => {
            x.stopPropagation(), o(h), r.setFieldsValue(h), u(!0);
          }
        }), C.jsx(la, {
          title: "确认删除？",
          onConfirm: () => a(h.id),
          children: C.jsx(xt, {
            type: "link",
            size: "small",
            danger: !0,
            icon: C.jsx(ua, {})
          })
        })]
      })
    }],
    c = t ? Hn.map(p => {
      var h, x;
      return {
        label: p.title,
        total: ((h = p.children) == null ? void 0 : h.length) ?? 0,
        granted: ((x = p.children) == null ? void 0 : x.filter(S => t.permissions.includes(S.key)).length) ?? 0
      };
    }) : [];
  return C.jsxs("div", {
    className: "space-y-6",
    children: [C.jsxs("h2", {
      className: "text-xl font-semibold",
      children: [C.jsx(On, {
        className: "mr-2"
      }), "角色权限配置"]
    }), C.jsxs(tt, {
      gutter: 16,
      children: [C.jsx(fe, {
        xs: 24,
        lg: 9,
        children: C.jsx(Vt, {
          title: C.jsxs(Ze, {
            children: [C.jsx(Gr, {}), "角色列表"]
          }),
          extra: C.jsx(xt, {
            type: "primary",
            size: "small",
            icon: C.jsx(cs, {}),
            onClick: () => {
              o(null), r.resetFields(), u(!0);
            },
            children: "新建"
          }),
          bodyStyle: {
            padding: 0
          },
          children: C.jsx(dcTableWithSort, {
            columns: f,
            dataSource: W,
            rowKey: "id",
            size: "small",
            pagination: !1,
            scroll: {
              y: 420
            },
            onRow: p => ({
              onClick: () => l(p),
              style: {
                cursor: "pointer",
                background: (t == null ? void 0 : t.id) === p.id ? "#E6F4FF" : void 0
              }
            })
          })
        })
      }), C.jsx(fe, {
        xs: 24,
        lg: 15,
        children: t ? C.jsxs(Vt, {
          title: C.jsxs(Ze, {
            children: [C.jsx(On, {}), t.name, " · 权限配置"]
          }),
          extra: C.jsx(xt, {
            type: "primary",
            size: "small",
            onClick: d,
            children: "保存"
          }),
          children: [C.jsx(tt, {
            gutter: 6,
            className: "mb-3",
            children: c.map(p => C.jsx(fe, {
              children: C.jsxs(Mt, {
                color: p.granted === p.total ? "green" : p.granted > 0 ? "blue" : "default",
                children: [p.label, ": ", p.granted, "/", p.total]
              })
            }, p.label))
          }), C.jsx(St, {
            className: "!my-2"
          }), C.jsx(aa, {
            checkable: !0,
            defaultExpandAll: !0,
            checkedKeys: n,
            onCheck: p => e(p),
            treeData: Hn
          }), C.jsx(St, {
            className: "!my-3"
          }), C.jsxs("div", {
            className: "text-xs text-gray-400",
            children: [C.jsx("strong", {
              children: "权限层级："
            }), "页面权限（·查看）→ 操作权限（·编辑）→ 导出权限（·导出）→ 数据权限（数据权限）。勾选后点「保存」生效。"]
          })]
        }) : C.jsx(Vt, {
          className: "flex items-center justify-center",
          style: {
            minHeight: 480
          },
          children: C.jsxs("div", {
            className: "text-center text-gray-400",
            children: [C.jsx(On, {
              style: {
                fontSize: 48
              },
              className: "mb-4 block"
            }), C.jsx("p", {
              children: "选择左侧角色以配置权限"
            })]
          })
        })
      })]
    }), C.jsx(ls, {
      title: s ? "编辑角色" : "新建角色",
      open: y,
      onOk: i,
      onCancel: () => {
        u(!1), o(null), r.resetFields();
      },
      destroyOnClose: !0,
      children: C.jsxs(cr, {
        form: r,
        layout: "vertical",
        children: [C.jsx(cr.Item, {
          name: "name",
          label: "角色名称",
          rules: [{
            required: !0,
            message: "请输入角色名称"
          }],
          children: C.jsx(Mr, {
            placeholder: "例如：部门经理"
          })
        }), C.jsx(cr.Item, {
          name: "description",
          label: "角色描述",
          children: C.jsx(Mr.TextArea, {
            rows: 2,
            placeholder: "简要描述职责和权限范围"
          })
        })]
      })
    })]
  });
}
