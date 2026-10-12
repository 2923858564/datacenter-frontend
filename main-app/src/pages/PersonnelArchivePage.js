import { C, Dl, Ei, Fl, Ge, Ke, Mr, Mt, Ot, Qn, Vt, Yr, Ze, Zr, __API__, cr, dcTableWithSort, dr, fe, fetch, ls, tr, tt, xt } from "../runtime/application.js";

export default function PersonnelArchivePage() {
  const [rows, rowsSet] = Ke.useState([]),
    [keyword, keywordSet] = Ke.useState(""),
    [group, groupSet] = Ke.useState("all"),
    [status, statusSet] = Ke.useState("all"),
    [loading, loadingSet] = Ke.useState(!0),
    [saving, savingSet] = Ke.useState(!1),
    [error, errorSet] = Ke.useState(""),
    [modal, modalSet] = Ke.useState(null),
    [form] = cr.useForm();
  const load = Ke.useCallback(async () => {
    loadingSet(!0);
    errorSet("");
    try {
      const z = await fetch(__API__ + "/api/v1/personnel/archive", {
        cache: "no-store"
      });
      const j = await z.json();
      if (!z.ok) throw new Error(j && j.detail || "加载失败 " + z.status);
      rowsSet(Array.isArray(j.data) ? j.data : []);
    } catch (e) {
      rowsSet([]);
      errorSet(e && e.message || "人员档案加载失败，请刷新重试");
    } finally {
      loadingSet(!1);
    }
  }, []);
  Ke.useEffect(() => {
    load();
  }, [load]);
  const groups = Ke.useMemo(() => [...new Set(rows.map(x => x.group).filter(Boolean))].sort(), [rows]);
  const filtered = Ke.useMemo(() => rows.filter(x => (group === "all" || x.group === group) && (status === "all" || x.status === status) && (!keyword || (x.name || "").includes(keyword) || (x.alias || "").includes(keyword))), [rows, keyword, group, status]);
  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({
      status: "在职"
    });
    modalSet({
      mode: "create"
    });
  };
  const openEdit = row => {
    form.setFieldsValue({
      ...row,
      joinDate: row.joinDate || ""
    });
    modalSet({
      mode: "edit",
      row
    });
  };
  const closeModal = () => {
    if (!saving) modalSet(null);
  };
  const submit = async values => {
    savingSet(!0);
    try {
      const edit = modal && modal.mode === "edit";
      const url = edit ? __API__ + "/api/v1/personnel/archive/" + modal.row.id : __API__ + "/api/v1/personnel/archive";
      const z = await fetch(url, {
        method: edit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...values,
          joinDate: values.joinDate || null
        })
      });
      const j = await z.json();
      if (!z.ok) throw new Error(j && j.detail || "保存失败 " + z.status);
      Yr.success(edit ? "人员档案已更新" : "人员档案已新增");
      modalSet(null);
      await load();
    } catch (e) {
      Yr.error(e && e.message || "保存失败，请重试");
    } finally {
      savingSet(!1);
    }
  };
  const remove = row => {
    ls.confirm({
      title: "确认删除人员档案？",
      content: "删除后该人员将不再参与人员主数据和业绩归属，请确认已核对。",
      okText: "删除",
      okButtonProps: {
        danger: !0
      },
      cancelText: "取消",
      onOk: async () => {
        const z = await fetch(__API__ + "/api/v1/personnel/archive/" + row.id, {
          method: "DELETE"
        });
        const j = await z.json();
        if (!z.ok) throw new Error(j && j.detail || "删除失败 " + z.status);
        Yr.success("人员档案已删除");
        await load();
      }
    });
  };
  const columns = [{
    title: "组名",
    dataIndex: "group",
    key: "group",
    width: 100,
    render: x => C.jsx(Mt, {
      color: Dl[x] || "#86909C",
      children: x
    })
  }, {
    title: "成员",
    dataIndex: "name",
    key: "name",
    width: 90,
    render: x => C.jsx("span", {
      className: "font-medium",
      children: x
    })
  }, {
    title: "职级",
    dataIndex: "rank",
    key: "rank",
    width: 65
  }, {
    title: "花名",
    dataIndex: "alias",
    key: "alias",
    width: 120,
    render: x => x ? C.jsx("span", {
      className: "text-purple-600 font-medium",
      children: x
    }) : C.jsx("span", {
      className: "text-gray-300",
      children: "-"
    })
  }, {
    title: "在职状态",
    dataIndex: "status",
    key: "status",
    width: 85,
    render: x => C.jsx(Mt, {
      color: x === "在职" ? "green" : "red",
      children: x
    })
  }, {
    title: "团队",
    dataIndex: "team",
    key: "team",
    width: 105,
    render: x => x ? C.jsx(Mt, {
      color: Fl[x] || "#86909C",
      children: x
    }) : C.jsx("span", {
      className: "text-gray-300",
      children: "-"
    })
  }, {
    title: "入职时间",
    dataIndex: "joinDate",
    key: "joinDate",
    width: 105,
    render: Ei
  }, {
    title: "操作",
    key: "actions",
    fixed: "right",
    width: 130,
    render: (_, row) => C.jsxs(Ze, {
      size: "small",
      children: [C.jsx(xt, {
        type: "link",
        size: "small",
        onClick: () => openEdit(row),
        children: "编辑"
      }), C.jsx(xt, {
        type: "link",
        danger: !0,
        size: "small",
        onClick: () => remove(row),
        children: "删除"
      })]
    })
  }];
  return C.jsxs("div", {
    className: "space-y-6",
    children: [C.jsxs(Ze, {
      className: "w-full justify-between",
      children: [C.jsxs("h2", {
        className: "text-xl font-semibold",
        children: [C.jsx(Zr, {
          className: "mr-2"
        }), "人员档案"]
      }), C.jsx(xt, {
        type: "primary",
        onClick: openCreate,
        children: "新增人员"
      })]
    }), error && C.jsx("div", {
      style: {
        background: "#fff1f0",
        border: "1px solid #ffa39e",
        color: "#cf1322",
        borderRadius: 8,
        padding: "10px 14px"
      },
      children: error
    }), C.jsxs(tt, {
      gutter: [12, 12],
      children: [C.jsx(fe, {
        xs: 24,
        sm: 6,
        children: C.jsx(Ge, {
          title: "总人数",
          value: Ot(rows.length),
          suffix: "人"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 6,
        children: C.jsx(Ge, {
          title: "在职",
          value: Ot(rows.filter(x => x.status === "在职").length),
          suffix: "人",
          trend: "up"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 6,
        children: C.jsx(Ge, {
          title: "离职",
          value: Ot(rows.filter(x => x.status === "离职").length),
          suffix: "人"
        })
      }), C.jsx(fe, {
        xs: 24,
        sm: 6,
        children: C.jsx(Ge, {
          title: "小组数",
          value: Ot(groups.length),
          suffix: "个"
        })
      })]
    }), C.jsxs(Vt, {
      bodyStyle: {
        padding: "16px 20px"
      },
      children: [C.jsxs(Ze, {
        className: "mb-3 w-full justify-between",
        wrap: !0,
        children: [C.jsxs(Ze, {
          wrap: !0,
          children: [C.jsx(Mr, {
            prefix: C.jsx(Qn, {}),
            placeholder: "搜索姓名/花名...",
            value: keyword,
            onChange: x => keywordSet(x.target.value),
            style: {
              width: 200
            },
            allowClear: !0
          }), C.jsx(dr, {
            value: group,
            onChange: groupSet,
            style: {
              width: 110
            },
            options: [{
              label: "全部组",
              value: "all"
            }, ...groups.map(x => ({
              label: x,
              value: x
            }))]
          }), C.jsx(dr, {
            value: status,
            onChange: statusSet,
            style: {
              width: 100
            },
            options: [{
              label: "全部状态",
              value: "all"
            }, {
              label: "在职",
              value: "在职"
            }, {
              label: "离职",
              value: "离职"
            }]
          })]
        }), C.jsxs("span", {
          className: "text-xs text-gray-400",
          children: ["共 ", filtered.length, " 人"]
        }), C.jsx(tr, {
          filename: "人员档案",
          label: "导出",
          dataSource: filtered.map(x => ({
            ...x,
            joinDate: Ei(x.joinDate)
          })),
          columns: [{
            title: "组名",
            dataIndex: "group"
          }, {
            title: "成员",
            dataIndex: "name"
          }, {
            title: "花名",
            dataIndex: "alias"
          }, {
            title: "在职状态",
            dataIndex: "status"
          }, {
            title: "团队",
            dataIndex: "team"
          }, {
            title: "入职时间",
            dataIndex: "joinDate"
          }]
        })]
      }), C.jsx(dcTableWithSort, {
        loading: loading,
        columns: columns,
        dataSource: filtered,
        size: "small",
        scroll: {
          x: 900
        },
        pagination: {
          defaultPageSize: 15,
          pageSizeOptions: [10, 15, 20, 50, 100],
          showSizeChanger: !0,
          showTotal: x => "共 " + x + " 人"
        }
      })]
    }), C.jsx(ls, {
      title: modal && modal.mode === "edit" ? "编辑人员档案" : "新增人员",
      open: !!modal,
      onCancel: closeModal,
      onOk: () => form.submit(),
      confirmLoading: saving,
      destroyOnClose: !0,
      width: 560,
      children: C.jsxs(cr, {
        form: form,
        layout: "vertical",
        onFinish: submit,
        children: [C.jsx(cr.Item, {
          label: "姓名",
          name: "name",
          rules: [{
            required: !0,
            message: "请输入姓名"
          }],
          children: C.jsx(Mr, {
            disabled: modal && modal.mode === "edit",
            placeholder: "请输入姓名"
          })
        }), C.jsxs(Ze, {
          gutter: 16,
          children: [C.jsx(cr.Item, {
            label: "组名",
            name: "group",
            rules: [{
              required: !0,
              message: "请输入组名"
            }],
            style: {
              flex: 1
            },
            children: C.jsx(Mr, {
              placeholder: "请输入组名"
            })
          }), C.jsx(cr.Item, {
            label: "职级",
            name: "rank",
            style: {
              width: 150
            },
            children: C.jsx(Mr, {
              placeholder: "如 P5"
            })
          })]
        }), C.jsxs(Ze, {
          gutter: 16,
          children: [C.jsx(cr.Item, {
            label: "花名",
            name: "alias",
            style: {
              flex: 1
            },
            children: C.jsx(Mr, {
              placeholder: "可选"
            })
          }), C.jsx(cr.Item, {
            label: "在职状态",
            name: "status",
            style: {
              width: 150
            },
            children: C.jsx(dr, {
              options: [{
                label: "在职",
                value: "在职"
              }, {
                label: "离职",
                value: "离职"
              }]
            })
          })]
        }), C.jsxs(Ze, {
          gutter: 16,
          children: [C.jsx(cr.Item, {
            label: "团队",
            name: "team",
            style: {
              flex: 1
            },
            children: C.jsx(Mr, {
              placeholder: "可选"
            })
          }), C.jsx(cr.Item, {
            label: "入职时间",
            name: "joinDate",
            style: {
              width: 180
            },
            children: C.jsx(Mr, {
              placeholder: "YYYY-MM-DD"
            })
          })]
        })]
      })
    })]
  });
}
