import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Drawer, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, message } from "antd";
import { api } from "../api.js";
import { useProto } from "../store.jsx";
const RISK_COLOR = {
  normal: "blue",
  sensitive: "gold",
  high: "red"
};
const RISK_LABEL = {
  normal: "常规",
  sensitive: "敏感",
  high: "高风险"
};
export default function SystemRoles() {
  const {
    hasPerm
  } = useProto();
  const [data, setData] = useState({
    list: [],
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [permRole, setPermRole] = useState(null);
  const [permOpen, setPermOpen] = useState(false);
  const [permTree, setPermTree] = useState([]);
  const [checked, setChecked] = useState(new Set());
  const [activeModule, setActiveModule] = useState("");
  const [permSearch, setPermSearch] = useState("");
  const [permSaving, setPermSaving] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.roles({
        page,
        size,
        keyword: keyword || undefined
      });
      setData(d);
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, size, keyword]);
  useEffect(() => {
    load();
  }, [load]);
  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue({
      name: "",
      code: "",
      level: 1,
      status: 1,
      data_scope: "sub",
      description: ""
    });
    setEditOpen(true);
  };
  const openEdit = r => {
    setEditing(r);
    form.setFieldsValue({
      name: r.name,
      code: r.code,
      level: r.level,
      status: r.status,
      data_scope: r.data_scope,
      description: r.description
    });
    setEditOpen(true);
  };
  const saveRole = async () => {
    const v = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        await api.updateRole(editing.id, {
          name: v.name,
          level: v.level,
          status: v.status,
          data_scope: v.data_scope,
          description: v.description
        });
        message.success("角色已更新");
      } else {
        await api.createRole({
          name: v.name,
          code: v.code,
          level: v.level,
          status: v.status,
          data_scope: v.data_scope,
          description: v.description
        });
        message.success("角色已创建");
      }
      setEditOpen(false);
      load();
    } catch (e) {
      message.error(e.message);
    } finally {
      setSaving(false);
    }
  };
  const openPerm = async r => {
    setPermRole(r);
    setPermOpen(true);
    setPermSearch("");
    setChecked(new Set());
    setPermTree([]);
    try {
      const [tree, cur] = await Promise.all([api.permissionTree(), api.rolePermissions(r.id)]);
      setPermTree(tree.tree);
      setChecked(new Set(cur.perm_ids));
      if (tree.tree.length) setActiveModule(tree.tree[0].module);
    } catch (e) {
      message.error(e.message);
    }
  };
  const savePerm = async () => {
    setPermSaving(true);
    try {
      await api.setRolePermissions(permRole.id, Array.from(checked));
      message.success("权限已保存");
      setPermOpen(false);
    } catch (e) {
      message.error(e.message);
    } finally {
      setPermSaving(false);
    }
  };
  const filteredPerms = useMemo(() => {
    const kw = permSearch.trim().toLowerCase();
    if (!kw) return permTree;
    return permTree.map(m => ({
      ...m,
      perms: m.perms.filter(p => p.name.toLowerCase().includes(kw) || p.code.toLowerCase().includes(kw))
    })).filter(m => m.perms.length);
  }, [permTree, permSearch]);
  const moduleCheckedCount = module => {
    const m = permTree.find(x => x.module === module);
    return m ? m.perms.filter(p => checked.has(p.id)).length : 0;
  };
  const columns = useMemo(() => [{
    title: "角色名称",
    dataIndex: "name",
    width: 130
  }, {
    title: "编码",
    dataIndex: "code",
    width: 120,
    render: v => <Tag>{v}</Tag>
  }, {
    title: "级别",
    dataIndex: "level",
    width: 80,
    render: v => <Tag color={v >= 8 ? "blue" : v >= 4 ? "green" : "default"}>L{v}</Tag>
  }, {
    title: "数据范围",
    dataIndex: "data_scope",
    width: 100,
    render: v => <Tag color={v === "all" ? "green" : "orange"}>{v === "all" ? "整包" : "分包"}</Tag>
  }, {
    title: "状态",
    dataIndex: "status",
    width: 80,
    render: v => <Tag color={v === 1 ? "green" : "red"}>{v === 1 ? "启用" : "禁用"}</Tag>
  }, {
    title: "用户数",
    dataIndex: "user_count",
    width: 80,
    align: "right"
  }, {
    title: "角色描述",
    dataIndex: "description",
    ellipsis: true,
    render: v => v || "-"
  }, {
    title: "更新时间",
    dataIndex: "updated_at",
    width: 150,
    render: v => (v || "-").replace("T", " ").slice(0, 16)
  }, {
    title: "操作",
    width: 180,
    fixed: "right",
    render: (_, r) => <Space size={0}>
            {hasPerm("system:role:update") && !r.builtin && <Button type="link" size="small" onClick={() => openEdit(r)}>编辑</Button>}
            {hasPerm("system:role:permission") && <Button type="link" size="small" onClick={() => openPerm(r)}>权限</Button>}
            {hasPerm("system:role:delete") && !r.builtin && <Popconfirm title="确定删除该角色？" onConfirm={async () => {
        try {
          await api.deleteRole(r.id);
          message.success("已删除");
          load();
        } catch (e) {
          message.error(e.message);
        }
      }}>
                <Button type="link" size="small" danger>删除</Button>
              </Popconfirm>}
          </Space>
  }], [hasPerm]);
  return <Card size="small" title="角色管理" extra={<Space>
        <span style={{
      color: "#86909c",
      fontSize: 12
    }}>共 {data.total} 个角色</span>
        {hasPerm("system:role:create") && <Button type="primary" size="small" onClick={openCreate}>新增角色</Button>}
      </Space>}>
      <Space style={{
      marginBottom: 12
    }} wrap>
        <Input.Search placeholder="搜索角色名称/编码" allowClear style={{
        width: 220
      }} onSearch={v => {
        setPage(1);
        setKeyword(v);
      }} onChange={e => {
        if (!e.target.value) {
          setPage(1);
          setKeyword("");
        }
      }} />
        <span style={{
        color: "#86909c",
        fontSize: 12
      }}>内置角色不可编辑/删除，可复制后调整</span>
      </Space>
      <Table size="small" rowKey="id" loading={loading} columns={columns} dataSource={data.list} scroll={{
      x: 1100
    }} pagination={{
      current: page,
      pageSize: size,
      total: data.total,
      showSizeChanger: true,
      showTotal: t => `共 ${t} 条`,
      onChange: (p, s) => {
        setPage(p);
        setSize(s);
      }
    }} />

      <Modal title={editing ? "编辑角色" : "新增角色"} open={editOpen} width={520} onOk={saveRole} confirmLoading={saving} onCancel={() => setEditOpen(false)}>
        <Form form={form} layout="vertical" initialValues={{
        level: 1,
        status: 1,
        data_scope: "sub"
      }}>
          <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0 16px"
        }}>
            <Form.Item label="角色名称" name="name" rules={[{
            required: true,
            message: "请输入角色名称"
          }]}>
              <Input placeholder="如：S项目管理员" />
            </Form.Item>
            <Form.Item label="角色编码" name="code" rules={[{
            required: true,
            message: "请输入角色编码"
          }]}>
              <Input placeholder="如：PROJECT_ADMIN" disabled={!!editing} />
            </Form.Item>
            <Form.Item label="级别" name="level">
              <InputNumber min={1} max={10} style={{
              width: "100%"
            }} />
            </Form.Item>
            <Form.Item label="数据范围" name="data_scope" rules={[{
            required: true
          }]}>
              <Select options={[{
              value: "all",
              label: "整包（全量）"
            }, {
              value: "sub",
              label: "分包（受限）"
            }]} />
            </Form.Item>
          </div>
          <Form.Item label="状态" name="status">
            <Select options={[{
            value: 1,
            label: "启用"
          }, {
            value: 0,
            label: "禁用"
          }]} />
          </Form.Item>
          <Form.Item label="角色描述" name="description">
            <Input.TextArea rows={3} maxLength={500} placeholder="角色的职责说明、适用范围等备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer title={`权限分配 — ${permRole?.name || ""}`} open={permOpen} width={640} onClose={() => setPermOpen(false)} extra={<Space>
            <span style={{
        color: "#86909c"
      }}>已勾选 {checked.size} 项</span>
            <Button type="primary" size="small" loading={permSaving} onClick={savePerm}>保存权限</Button>
          </Space>}>
        <Space style={{
        marginBottom: 12
      }} wrap>
          <Button size="small" onClick={() => setChecked(new Set(permTree.flatMap(m => m.perms.map(p => p.id))))}>
            全选
          </Button>
          <Button size="small" onClick={() => setChecked(new Set())}>取消全选</Button>
          <Input.Search size="small" style={{
          width: 180
        }} placeholder="搜索权限…" allowClear value={permSearch} onChange={e => setPermSearch(e.target.value)} />
          <span style={{
          fontSize: 12,
          color: "#86909c"
        }}>
            <Tag color="blue">常规</Tag><Tag color="gold">敏感</Tag><Tag color="red">高风险</Tag>
          </span>
        </Space>
        <div style={{
        display: "flex",
        gap: 12
      }}>
          <div style={{
          width: 130,
          flexShrink: 0
        }}>
            {filteredPerms.map(m => <div key={m.module} onClick={() => setActiveModule(m.module)} style={{
            padding: "8px 10px",
            borderRadius: 6,
            cursor: "pointer",
            marginBottom: 4,
            background: activeModule === m.module ? "#e6f4ff" : "transparent",
            fontWeight: activeModule === m.module ? 600 : 400
          }}>
                {m.group}
                <span style={{
              float: "right",
              color: "#86909c",
              fontSize: 12
            }}>
                  {checked.size ? moduleCheckedCount(m.module) : 0}/{m.perms.length}
                </span>
              </div>)}
          </div>
          <div style={{
          flex: 1,
          minWidth: 0
        }}>
            {filteredPerms.filter(m => m.module === activeModule).map(m => <div key={m.module}>
                  <div style={{
              fontWeight: 600,
              marginBottom: 8
            }}>{m.group}</div>
                  <Space size={[6, 8]} wrap>
                    {m.perms.map(p => {
                const on = checked.has(p.id);
                return <Tag key={p.id} color={on ? RISK_COLOR[p.risk] || "blue" : undefined} style={{
                  cursor: "pointer",
                  margin: 0,
                  background: on ? undefined : "#fafafa",
                  color: on ? undefined : "#666"
                }} onClick={() => {
                  const next = new Set(checked);
                  if (on) next.delete(p.id);else next.add(p.id);
                  setChecked(next);
                }}>
                          {p.name}
                        </Tag>;
              })}
                  </Space>
                  <div style={{
              color: "#c9cdd4",
              fontSize: 12,
              margin: "8px 0 16px"
            }}>
                    {m.perms.map(p => p.code).join(" · ")}
                  </div>
                </div>)}
            {filteredPerms.length === 0 && <div style={{
            color: "#86909c",
            textAlign: "center",
            padding: 40
          }}>无匹配权限</div>}
          </div>
        </div>
      </Drawer>
    </Card>;
}
