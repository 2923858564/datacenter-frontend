import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Switch, Table, Tag, message } from "antd";
import { api } from "../api.js";
import { useProto } from "../store.jsx";
function randPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  let s = "";
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)];
  if (!/\d/.test(s)) s = s.slice(0, -1) + "9";
  if (!/[A-Za-z]/.test(s)) s = s.slice(0, -1) + "a";
  return s;
}
const SCOPE_LABEL = {
  all: "整包（全量）",
  sub: "分包（受限）"
};
export default function SystemUsers() {
  const {
    hasPerm,
    user
  } = useProto();
  const [data, setData] = useState({
    list: [],
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleOptions, setRoleOptions] = useState([]);
  const [pkgOptions, setPkgOptions] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [roleOpen, setRoleOpen] = useState(false);
  const [roleUser, setRoleUser] = useState(null);
  const [roleIds, setRoleIds] = useState([]);
  const [roleSaving, setRoleSaving] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdUser, setPwdUser] = useState(null);
  const [pwdValue, setPwdValue] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.users({
        page,
        size,
        keyword: keyword || undefined,
        status: statusFilter === "" ? undefined : Number(statusFilter)
      });
      setData(d);
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, size, keyword, statusFilter]);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    if (hasPerm("system:user:list") || hasPerm("system:role:list")) {
      api.rolesSimple().then(setRoleOptions).catch(() => {});
      api.packages().then(p => setPkgOptions(p.map(x => ({
        value: x,
        label: x
      })))).catch(() => {});
    }
  }, []);
  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue({
      username: "",
      name: "",
      employee_no: "",
      mobile: "",
      email: "",
      position: "",
      entry_date: "",
      status: 1,
      packages: [],
      role_ids: [],
      password: ""
    });
    setEditOpen(true);
  };
  const openEdit = r => {
    setEditing(r);
    form.setFieldsValue({
      username: r.username,
      name: r.name,
      employee_no: r.employee_no,
      mobile: r.mobile,
      email: r.email,
      position: r.position,
      entry_date: r.entry_date || "",
      status: r.status,
      packages: r.packages || [],
      role_ids: (r.roles || []).map(x => x.id),
      password: ""
    });
    setEditOpen(true);
  };
  const saveUser = async () => {
    const v = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        await api.updateUser(editing.id, {
          name: v.name,
          employee_no: v.employee_no,
          mobile: v.mobile,
          email: v.email,
          position: v.position,
          entry_date: v.entry_date || "",
          status: v.status,
          packages: v.packages || []
        });
        message.success("已保存");
      } else {
        await api.createUser({
          username: v.username,
          password: v.password,
          name: v.name,
          employee_no: v.employee_no,
          mobile: v.mobile,
          email: v.email,
          position: v.position,
          entry_date: v.entry_date || "",
          status: v.status,
          packages: v.packages || [],
          role_ids: v.role_ids || []
        });
        message.success("员工已创建");
      }
      setEditOpen(false);
      load();
    } catch (e) {
      message.error(e.message);
    } finally {
      setSaving(false);
    }
  };
  const openRoles = async r => {
    setRoleUser(r);
    try {
      const d = await api.userRoles(r.id);
      setRoleIds(d.role_ids);
    } catch (e) {
      message.error(e.message);
    }
    setRoleOpen(true);
  };
  const saveRoles = async () => {
    setRoleSaving(true);
    try {
      await api.setUserRoles(roleUser.id, roleIds);
      message.success("角色已更新");
      setRoleOpen(false);
      load();
    } catch (e) {
      message.error(e.message);
    } finally {
      setRoleSaving(false);
    }
  };
  const openPwd = r => {
    setPwdUser(r);
    setPwdValue(randPassword());
    setPwdOpen(true);
  };
  const savePwd = async () => {
    setPwdSaving(true);
    try {
      await api.resetUserPassword(pwdUser.id, pwdValue);
      message.success("密码已重置");
      setPwdOpen(false);
    } catch (e) {
      message.error(e.message);
    } finally {
      setPwdSaving(false);
    }
  };
  const toggleStatus = async r => {
    try {
      const d = await api.setUserStatus(r.id);
      message.success(d.status === 1 ? "已启用" : "已停用");
      load();
    } catch (e) {
      message.error(e.message);
    }
  };
  const columns = useMemo(() => [{
    title: "姓名 / 账号",
    width: 180,
    render: (_, r) => <div>
            <div style={{
        fontWeight: 600
      }}>{r.name || "-"}</div>
            <div style={{
        color: "#86909c",
        fontSize: 12
      }}>{r.username}</div>
          </div>
  }, {
    title: "工号",
    dataIndex: "employee_no",
    width: 100,
    render: v => v || "-"
  }, {
    title: "手机号",
    dataIndex: "mobile",
    width: 120,
    render: v => v || "-"
  }, {
    title: "角色",
    width: 180,
    render: (_, r) => <Space size={4} wrap>
            {(r.roles || []).map(x => <Tag key={x.id} color="blue">{x.name}</Tag>)}
            {!(r.roles || []).length && "-"}
          </Space>
  }, {
    title: "数据范围",
    width: 110,
    render: (_, r) => <Tag color={r.scope === "all" ? "green" : "orange"}>{SCOPE_LABEL[r.scope] || r.scope}</Tag>
  }, {
    title: "分包范围",
    width: 180,
    render: (_, r) => <Space size={2} wrap>
            {(r.packages || []).slice(0, 3).map(p => <Tag key={p}>{p}</Tag>)}
            {(r.packages || []).length === 0 && <span style={{
        color: "#86909c"
      }}>不限</span>}
          </Space>
  }, {
    title: "状态",
    width: 90,
    render: (_, r) => <Switch size="small" checked={r.status === 1} disabled={!hasPerm("system:user:update") || r.id === user?.id} checkedChildren="启用" unCheckedChildren="停用" onChange={() => toggleStatus(r)} />
  }, {
    title: "最近登录",
    dataIndex: "last_login",
    width: 150,
    render: v => v ? v.replace("T", " ").slice(0, 16) : "-"
  }, {
    title: "操作",
    width: 220,
    fixed: "right",
    render: (_, r) => <Space size={0}>
            {hasPerm("system:user:update") && <Button type="link" size="small" onClick={() => openEdit(r)}>编辑</Button>}
            {hasPerm("system:user:role") && <Button type="link" size="small" onClick={() => openRoles(r)}>角色</Button>}
            {hasPerm("system:user:resetpwd") && <Button type="link" size="small" onClick={() => openPwd(r)}>重置密码</Button>}
            {hasPerm("system:user:delete") && !r.is_super && r.id !== user?.id && <Popconfirm title="确定删除该员工？" onConfirm={async () => {
        try {
          await api.deleteUser(r.id);
          message.success("已删除");
          load();
        } catch (e) {
          message.error(e.message);
        }
      }}>
                <Button type="link" size="small" danger>删除</Button>
              </Popconfirm>}
          </Space>
  }], [hasPerm, user]);
  return <Card size="small" title="花名册" extra={<Space>
        <span style={{
      color: "#86909c",
      fontSize: 12
    }}>共 {data.total} 人</span>
        {hasPerm("system:user:create") && <Button type="primary" size="small" onClick={openCreate}>新增员工</Button>}
      </Space>}>
      <Space style={{
      marginBottom: 12
    }} wrap>
        <Input.Search placeholder="搜索姓名/账号/工号/手机号" allowClear style={{
        width: 240
      }} onSearch={v => {
        setPage(1);
        setKeyword(v);
      }} onChange={e => {
        if (!e.target.value) {
          setPage(1);
          setKeyword("");
        }
      }} />
        <Select allowClear placeholder="状态" style={{
        width: 110
      }} value={statusFilter || undefined} onChange={v => {
        setPage(1);
        setStatusFilter(v ?? "");
      }} options={[{
        value: 1,
        label: "启用"
      }, {
        value: 0,
        label: "停用"
      }]} />
      </Space>
      <Table size="small" rowKey="id" loading={loading} columns={columns} dataSource={data.list} scroll={{
      x: 1250
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

      <Modal title={editing ? "编辑员工" : "新增员工"} open={editOpen} width={680} onOk={saveUser} confirmLoading={saving} onCancel={() => setEditOpen(false)}>
        <Form form={form} layout="vertical" initialValues={{
        status: 1,
        packages: [],
        role_ids: []
      }}>
          <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "0 16px"
        }}>
            <Form.Item label="姓名" name="name" rules={[{
            required: true,
            message: "请输入姓名"
          }]}>
              <Input placeholder="真实姓名" />
            </Form.Item>
            <Form.Item label="登录账号" name="username" rules={[{
            required: true,
            message: "请输入登录账号"
          }]}>
              <Input placeholder="登录账号" disabled={!!editing} />
            </Form.Item>
            <Form.Item label="工号" name="employee_no">
              <Input placeholder="员工编号" />
            </Form.Item>
            <Form.Item label="手机号" name="mobile">
              <Input placeholder="11位手机号" />
            </Form.Item>
            <Form.Item label="邮箱" name="email">
              <Input placeholder="电子邮箱" />
            </Form.Item>
            <Form.Item label="岗位" name="position">
              <Input placeholder="岗位名称" />
            </Form.Item>
            <Form.Item label="入职日期" name="entry_date">
              <Input placeholder="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item label="状态" name="status">
              <Select options={[{
              value: 1,
              label: "启用"
            }, {
              value: 0,
              label: "停用"
            }]} />
            </Form.Item>
            <Form.Item label="角色" name="role_ids">
              <Select mode="multiple" placeholder="选择角色" options={roleOptions.map(r => ({
              value: r.id,
              label: r.name
            }))} />
            </Form.Item>
          </div>
          <Form.Item label="分包范围（sub 范围角色按此过滤数据；不选=不限/空）" name="packages">
            <Select mode="multiple" allowClear placeholder="选择分包/游戏" options={pkgOptions} />
          </Form.Item>
          {!editing && <Form.Item label="初始密码（≥8位，含字母和数字）" name="password" rules={[{
          required: true,
          message: "请输入初始密码"
        }, {
          min: 8,
          message: "至少 8 位"
        }, {
          pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/,
          message: "需同时包含字母和数字"
        }]}>
              <Input.Search placeholder="输入或随机生成" enterButton="随机生成" onSearch={v => form.setFieldsValue({
            password: v || randPassword()
          })} />
            </Form.Item>}
        </Form>
      </Modal>

      <Modal title={`编辑角色 — ${roleUser?.name || ""}`} open={roleOpen} width={480} onOk={saveRoles} confirmLoading={roleSaving} onCancel={() => setRoleOpen(false)}>
        <p style={{
        color: "#86909c",
        marginTop: 0
      }}>
          可多选；数据范围由角色决定（任一角色为整包范围即全部可见）。
        </p>
        <Select mode="multiple" style={{
        width: "100%"
      }} placeholder="选择角色" value={roleIds} onChange={setRoleIds} options={roleOptions.map(r => ({
        value: r.id,
        label: `${r.name}（${r.data_scope === "all" ? "整包" : "分包"}）`
      }))} />
      </Modal>

      <Modal title={`重置密码 — ${pwdUser?.name || ""}`} open={pwdOpen} width={420} onOk={savePwd} confirmLoading={pwdSaving} onCancel={() => setPwdOpen(false)}>
        <Input.Search value={pwdValue} onChange={e => setPwdValue(e.target.value)} enterButton="随机生成" onSearch={() => setPwdValue(randPassword())} placeholder="新密码" />
        <div style={{
        color: "#86909c",
        fontSize: 12,
        marginTop: 6
      }}>密码需 ≥8 位且包含字母和数字。</div>
      </Modal>
    </Card>;
}
