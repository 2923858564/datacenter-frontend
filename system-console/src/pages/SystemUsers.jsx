import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button, Card, Form, Input, Modal, Popconfirm, Segmented, Select, Space, Switch, Table, Tag, message,
} from "antd";
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

const SCOPE_LABEL = { all: "整包（全量）", sub: "分包（受限）" };

export default function SystemUsers() {
  const { hasPerm, user } = useProto();
  const [data, setData] = useState({ list: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [roleOptions, setRoleOptions] = useState([]);
  const [peopleOptions, setPeopleOptions] = useState([]);
  const listRequestId = useRef(0);
  const statusRequests = useRef(new Set());
  const [pendingStatus, setPendingStatus] = useState(new Set());

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const scopeMode = Form.useWatch("scope_mode", form);

  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdUser, setPwdUser] = useState(null);
  const [pwdValue, setPwdValue] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdResetDone, setPwdResetDone] = useState(false);
  const [currentPwdValue, setCurrentPwdValue] = useState("");
  const [currentPwdLoaded, setCurrentPwdLoaded] = useState(false);
  const [currentPwdVisible, setCurrentPwdVisible] = useState(false);
  const [currentPwdLoading, setCurrentPwdLoading] = useState(false);
  const [currentPwdUnavailable, setCurrentPwdUnavailable] = useState(false);

  const load = useCallback(async (quiet = false) => {
    const requestId = ++listRequestId.current;
    if (!quiet) setLoading(true);
    try {
      const d = await api.users({
        page, size,
        keyword: keyword || undefined,
        status: statusFilter === "" ? undefined : Number(statusFilter),
        role_id: roleFilter === "" ? undefined : Number(roleFilter),
      });
      if (requestId === listRequestId.current) {
        const lastPage = Math.max(1, Math.ceil(d.total / size));
        if (page > lastPage) setPage(lastPage);
        setData(d);
      }
    } catch (e) {
      if (requestId === listRequestId.current) message.error(e.message);
    } finally {
      if (requestId === listRequestId.current) setLoading(false);
    }
  }, [page, size, keyword, statusFilter, roleFilter]);

  useEffect(() => {
    load();
    return () => { listRequestId.current += 1; };
  }, [load]);

  useEffect(() => {
    if (hasPerm("system:user:list") || hasPerm("system:role:list")) {
      api.rolesSimple().then(setRoleOptions).catch(() => {});
      api.peopleOptions().then((p) => setPeopleOptions(p.map((x) => ({ value: x, label: x })))).catch(() => {});
    }
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue({
      username: "", name: "", employee_no: "", mobile: "", email: "",
      position: "", entry_date: "", status: 1, scope_mode: "sub", people_scope: [], role_ids: [], password: "",
    });
    setEditOpen(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    form.setFieldsValue({
      username: r.username, name: r.name, employee_no: r.employee_no, mobile: r.mobile,
      email: r.email, position: r.position, entry_date: r.entry_date || "",
      status: r.status, scope_mode: r.is_super ? "all" : (r.scope_mode || r.scope || "sub"), people_scope: r.people_scope || [],
      role_ids: (r.roles || []).map((x) => x.id),
      password: "",
    });
    setEditOpen(true);
  };

  const saveUser = async () => {
    const v = await form.validateFields();
    setSaving(true);
    let profileSaved = false;
    try {
      if (editing) {
        await api.updateUser(editing.id, {
          name: v.name, employee_no: v.employee_no, mobile: v.mobile, email: v.email,
          position: v.position, entry_date: v.entry_date || "", status: v.status,
          scope_mode: v.scope_mode, people_scope: v.people_scope || [],
        });
        profileSaved = true;
        const previousRoleIds = (editing.roles || []).map((x) => x.id).sort((a, b) => a - b);
        const nextRoleIds = (v.role_ids || []).slice().sort((a, b) => a - b);
        if (hasPerm("system:user:role") && previousRoleIds.join(",") !== nextRoleIds.join(",")) {
          await api.setUserRoles(editing.id, nextRoleIds);
        }
        setData((current) => ({
          ...current,
          list: current.list.map((item) => item.id === editing.id ? {
            ...item,
            name: v.name, employee_no: v.employee_no, mobile: v.mobile, email: v.email,
            position: v.position, entry_date: v.entry_date || "", status: v.status,
            scope: v.scope_mode, scope_mode: v.scope_mode, people_scope: v.people_scope || [],
            roles: hasPerm("system:user:role")
              ? roleOptions.filter((role) => nextRoleIds.includes(role.id)) : item.roles,
          } : item),
        }));
        message.success("已保存");
      } else {
        await api.createUser({
          username: v.username, password: v.password, name: v.name,
          employee_no: v.employee_no, mobile: v.mobile, email: v.email,
          position: v.position, entry_date: v.entry_date || "", status: v.status,
          scope_mode: v.scope_mode, people_scope: v.people_scope || [], role_ids: v.role_ids || [],
        });
        message.success("员工已创建");
      }
      setEditOpen(false);
      load(!!editing);
    } catch (e) {
      message.error(profileSaved ? `资料已保存，角色保存失败：${e.message}` : e.message);
      if (profileSaved) await load(true);
    } finally {
      setSaving(false);
    }
  };

  const openPwd = (r) => {
    setPwdUser(r);
    setPwdValue(randPassword());
    setPwdResetDone(false);
    setCurrentPwdValue("");
    setCurrentPwdLoaded(false);
    setCurrentPwdVisible(false);
    setCurrentPwdLoading(false);
    setCurrentPwdUnavailable(false);
    setPwdOpen(true);
  };

  const closePwd = () => {
    setPwdOpen(false);
    setPwdUser(null);
    setPwdValue("");
    setPwdResetDone(false);
    setCurrentPwdValue("");
    setCurrentPwdLoaded(false);
    setCurrentPwdVisible(false);
    setCurrentPwdLoading(false);
    setCurrentPwdUnavailable(false);
  };

  const revealCurrentPwd = async (visible) => {
    if (!visible) {
      setCurrentPwdVisible(false);
      return;
    }
    if (currentPwdLoaded) {
      setCurrentPwdVisible(true);
      return;
    }
    setCurrentPwdLoading(true);
    try {
      const result = await api.userPassword(pwdUser.id);
      if (!result.available) {
        setCurrentPwdUnavailable(true);
        message.warning("该账号的历史密码未记录，请先重新登录或重置一次");
        return;
      }
      setCurrentPwdValue(result.password);
      setCurrentPwdLoaded(true);
      setCurrentPwdVisible(true);
    } catch (e) {
      message.error(e.message);
    } finally {
      setCurrentPwdLoading(false);
    }
  };

  const savePwd = async () => {
    setPwdSaving(true);
    try {
      await api.resetUserPassword(pwdUser.id, pwdValue);
      message.success("密码已重置");
      setPwdResetDone(true);
      setCurrentPwdValue(pwdValue);
      setCurrentPwdLoaded(true);
      setCurrentPwdVisible(false);
      setCurrentPwdUnavailable(false);
    } catch (e) {
      message.error(e.message);
    } finally {
      setPwdSaving(false);
    }
  };

  const toggleStatus = async (r) => {
    if (statusRequests.current.has(r.id)) return;
    statusRequests.current.add(r.id);
    setPendingStatus(new Set(statusRequests.current));
    try {
      const d = await api.setUserStatus(r.id);
      setData((current) => ({ ...current, list: current.list.map((item) => item.id === r.id ? { ...item, status: d.status } : item) }));
      message.success(d.status === 1 ? "已启用" : "已停用");
      await load();
    } catch (e) {
      message.error(e.message);
    } finally {
      statusRequests.current.delete(r.id);
      setPendingStatus(new Set(statusRequests.current));
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "姓名 / 账号",
        width: 180,
        render: (_, r) => (
          <div>
            <div style={{ fontWeight: 600 }}>{r.name || "-"}</div>
            <div style={{ color: "#86909c", fontSize: 12 }}>{r.username}</div>
          </div>
        ),
      },
      { title: "工号", dataIndex: "employee_no", width: 100, render: (v) => v || "-" },
      { title: "手机号", dataIndex: "mobile", width: 120, render: (v) => v || "-" },
      {
        title: "角色",
        key: "role",
        width: 180,
        filters: roleOptions.map((role) => ({ text: role.name, value: role.id })),
        filterMultiple: false,
        filteredValue: roleFilter === "" ? null : [roleFilter],
        render: (_, r) => (
          <Space size={4} wrap>
            {(r.roles || []).map((x) => (
              <Tag key={x.id} color="blue">{x.name}</Tag>
            ))}
            {!(r.roles || []).length && "-"}
          </Space>
        ),
      },
      {
        title: "数据范围",
        width: 110,
        render: (_, r) => (
          <Tag color={r.scope === "all" ? "green" : "orange"}>{SCOPE_LABEL[r.scope] || r.scope}</Tag>
        ),
      },
      {
        title: "包体数据范围",
        width: 180,
        render: (_, r) => (
          <Tag color={r.scope === "all" ? "green" : "blue"}>
            {r.scope === "all" ? "全部" : "由包体配置管理"}
          </Tag>
        ),
      },
      {
        title: "人员数据范围",
        width: 190,
        render: (_, r) => (
          peopleOptions.length > 0 &&
          (r.people_scope || []).length === peopleOptions.length &&
          peopleOptions.every((option) => (r.people_scope || []).includes(option.value))
            ? <span>全部人员</span>
            : (
              <Space size={2} wrap>
                {(r.people_scope || []).slice(0, 4).map((p) => <Tag key={p} color="purple">{p}</Tag>)}
                {(r.people_scope || []).length === 0 && <span style={{ color: "#86909c" }}>默认仅本人</span>}
              </Space>
            )
        ),
      },
      {
        title: "状态",
        width: 90,
        render: (_, r) => (
          <Switch
            aria-label={`${r.name || r.username}的账号状态`}
            loading={pendingStatus.has(r.id)}
            size="small"
            checked={r.status === 1}
            disabled={pendingStatus.has(r.id) || !hasPerm("system:user:update") || r.id === user?.id}
            checkedChildren="启用"
            unCheckedChildren="停用"
            onChange={() => toggleStatus(r)}
          />
        ),
      },
      { title: "最近登录", dataIndex: "last_login", width: 150, render: (v) => (v ? v.replace("T", " ").slice(0, 16) : "-") },
      {
        title: "操作",
        width: 180,
        fixed: "right",
        render: (_, r) => (
          <Space size={0}>
            {hasPerm("system:user:update") && (
              <Button aria-label={`编辑${r.name || r.username}`} type="link" size="small" onClick={() => openEdit(r)}>编辑</Button>
            )}
            {hasPerm("system:user:resetpwd") && (
              <Button aria-label={`重置${r.name || r.username}的密码`} type="link" size="small" onClick={() => openPwd(r)}>重置密码</Button>
            )}
            {hasPerm("system:user:delete") && !r.is_super && r.id !== user?.id && (
              <Popconfirm title="确定删除该员工？" onConfirm={async () => {
                try {
                  await api.deleteUser(r.id);
                  setData((current) => ({
                    ...current,
                    list: current.list.filter((item) => item.id !== r.id),
                    total: Math.max(0, current.total - 1),
                  }));
                  message.success("已删除");
                  await load();
                } catch (e) {
                  message.error(e.message);
                }
              }}>
                <Button aria-label={`删除${r.name || r.username}`} type="link" size="small" danger>删除</Button>
              </Popconfirm>
            )}
          </Space>
        ),
      },
    ],
    [hasPerm, user, load, roleOptions, roleFilter, peopleOptions, pendingStatus]
  );

  return (
    <Card size="small" title="花名册" extra={
      <Space>
        <span style={{ color: "#86909c", fontSize: 12 }}>共 {data.total} 人</span>
        {hasPerm("system:user:create") && (
          <Button type="primary" size="small" onClick={openCreate}>新增员工</Button>
        )}
      </Space>
    }>
      <Space style={{ marginBottom: 12 }} wrap>
        <Input.Search
          placeholder="搜索姓名/账号/工号/手机号"
          allowClear
          style={{ width: 240 }}
          onSearch={(v) => { setPage(1); setKeyword(v); }}
          onChange={(e) => { if (!e.target.value) { setPage(1); setKeyword(""); } }}
        />
        <Select
          allowClear
          placeholder="状态"
          style={{ width: 110 }}
          value={statusFilter === "" ? undefined : statusFilter}
          onChange={(v) => { setPage(1); setStatusFilter(v ?? ""); }}
          options={[{ value: 1, label: "启用" }, { value: 0, label: "停用" }]}
        />
      </Space>
      <Table
        size="small"
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data.list}
        scroll={{ x: 1480 }}
        onChange={(_, filters, __, extra) => {
          if (extra.action === "filter") {
            setPage(1);
            setRoleFilter(filters.role?.[0] ?? "");
          }
        }}
        pagination={{
          current: page, pageSize: size, total: data.total, showSizeChanger: true, showTotal: (t) => `共 ${t} 条`,
          onChange: (p, s) => { setPage(p); setSize(s); },
        }}
      />

      <Modal
        title={editing ? "编辑员工" : "新增员工"}
        open={editOpen}
        width={680}
        onOk={saveUser}
        confirmLoading={saving}
        onCancel={() => setEditOpen(false)}
      >
        <Form form={form} layout="vertical" initialValues={{ status: 1, scope_mode: "sub", people_scope: [], role_ids: [] }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "0 16px" }}>
            <Form.Item label="姓名" name="name" rules={[{ required: true, message: "请输入姓名" }]}>
              <Input placeholder="真实姓名" />
            </Form.Item>
            <Form.Item label="登录账号" name="username" rules={[{ required: true, message: "请输入登录账号" }]}>
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
              <Select options={[{ value: 1, label: "启用" }, { value: 0, label: "停用" }]} />
            </Form.Item>
            <Form.Item label="角色" name="role_ids">
              <Select
                mode="multiple"
                placeholder="选择角色"
                disabled={!!editing && !hasPerm("system:user:role")}
                options={roleOptions.map((r) => ({ value: r.id, label: r.name }))}
              />
            </Form.Item>
          </div>
          <Form.Item label="数据范围" name="scope_mode">
            <Segmented
              block
              options={[{ value: "all", label: "整包（全量）" }, { value: "sub", label: "分包（按项目册配置）" }]}
              disabled={!!editing && (editing.is_super || (editing.roles || []).some((role) => role.code === "SUPER_ADMIN"))}
            />
          </Form.Item>
          <Form.Item
            label="人员数据范围"
            name="people_scope"
            extra={scopeMode === "all"
              ? "整包默认查看全量数据，不受项目册分包配置影响。"
              : "分包范围 = 所选人员名下推广账号 ∩ 项目册为账号配置的包体；不选默认仅本人。"}
          >
            <Select
              mode="multiple"
              allowClear
              showSearch
              disabled={scopeMode === "all"}
              placeholder="选择可查看的员工"
              options={[{ value: "__all__", label: "全部" }, ...peopleOptions]}
              onSelect={(value) => {
                if (value === "__all__") {
                  form.setFieldValue("people_scope", peopleOptions.map((option) => option.value));
                }
              }}
            />
          </Form.Item>
          {!editing && (
            <Form.Item
              label="初始密码（≥8位，含字母和数字）"
              name="password"
              rules={[
                { required: true, message: "请输入初始密码" },
                { min: 8, message: "至少 8 位" },
                { pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/, message: "需同时包含字母和数字" },
              ]}
            >
              <Input.Search
                placeholder="输入或随机生成"
                enterButton="随机生成"
                onSearch={(v) => form.setFieldsValue({ password: v || randPassword() })}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title={`重置密码 — ${pwdUser?.name || ""}`}
        open={pwdOpen}
        width={420}
        okText={pwdResetDone ? "关闭" : "确认重置"}
        onOk={pwdResetDone ? closePwd : savePwd}
        confirmLoading={pwdSaving}
        onCancel={closePwd}
      >
        <div style={{ marginBottom: 10, padding: "8px 10px", background: "#f5f6f8", borderRadius: 6, color: "#4e5969", fontSize: 13 }}>
          {user?.is_super
            ? pwdResetDone ? "密码已更新，可通过下方眼睛查看当前密码。" : "点击眼睛查看当前密码。"
            : "仅超级管理员可查看当前密码。"}
        </div>
        {user?.is_super && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ color: "#4e5969", fontSize: 12, marginBottom: 4 }}>当前密码</div>
            <Input.Password
              value={currentPwdLoaded ? currentPwdValue : currentPwdUnavailable ? "" : "********"}
              readOnly
              placeholder={currentPwdLoading ? "读取中…" : currentPwdUnavailable ? "需重新登录或重置一次" : ""}
              visibilityToggle={{ visible: currentPwdVisible, onVisibleChange: revealCurrentPwd }}
            />
          </div>
        )}
        <Space.Compact style={{ width: "100%" }}>
          <Input.Password
            value={pwdValue}
            onChange={(e) => setPwdValue(e.target.value)}
            readOnly={pwdResetDone}
            placeholder="新密码"
            visibilityToggle
          />
          {pwdResetDone ? (
            <Button onClick={async () => {
              try {
                await navigator.clipboard.writeText(pwdValue);
                message.success("密码已复制");
              } catch {
                message.error("复制失败，请手动选择并复制密码");
              }
            }}>复制密码</Button>
          ) : (
            <Button onClick={() => setPwdValue(randPassword())}>随机生成</Button>
          )}
        </Space.Compact>
        <div style={{ color: "#86909c", fontSize: 12, marginTop: 6 }}>密码需 ≥8 位且包含字母和数字。</div>
      </Modal>
    </Card>
  );
}
