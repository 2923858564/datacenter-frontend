import React, { useCallback, useEffect, useState } from "react";
import { Card, Input, Select, Space, Table, Tag, message } from "antd";
import { api } from "../api.js";
const ACTION_LABEL = {
  login: "登录",
  login_fail: "登录失败",
  login_blocked: "登录拦截",
  change_password: "修改密码",
  user_create: "新增员工",
  user_update: "编辑员工",
  user_status: "启用/停用",
  user_resetpwd: "重置密码",
  user_delete: "删除员工",
  user_roles: "分配角色",
  role_create: "新增角色",
  role_update: "编辑角色",
  role_delete: "删除角色",
  role_perms: "分配权限",
  snapshot_upload: "快照上传"
};
export default function SystemAudit() {
  const [data, setData] = useState({
    list: [],
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [module, setModule] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.auditLogs({
        page,
        size,
        keyword: keyword || undefined,
        module: module || undefined
      });
      setData(d);
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, size, keyword, module]);
  useEffect(() => {
    load();
  }, [load]);
  const columns = [{
    title: "时间",
    dataIndex: "op_time",
    width: 160,
    render: v => (v || "-").replace("T", " ").slice(0, 19)
  }, {
    title: "操作人",
    dataIndex: "operator",
    width: 120
  }, {
    title: "操作",
    dataIndex: "action",
    width: 120,
    render: v => ACTION_LABEL[v] || v
  }, {
    title: "模块",
    dataIndex: "module",
    width: 110,
    render: v => <Tag>{v}</Tag>
  }, {
    title: "对象",
    dataIndex: "target",
    ellipsis: true
  }, {
    title: "IP",
    dataIndex: "ip",
    width: 130
  }];
  const modules = Array.from(new Set((data.list || []).map(r => r.module))).filter(Boolean);
  return <Card size="small" title="日志审计" extra={<span style={{
    color: "#86909c",
    fontSize: 12
  }}>共 {data.total} 条</span>}>
      <Space style={{
      marginBottom: 12
    }} wrap>
        <Input.Search placeholder="搜索操作人/操作/对象" allowClear style={{
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
        <Select allowClear placeholder="模块" style={{
        width: 130
      }} value={module || undefined} onChange={v => {
        setPage(1);
        setModule(v ?? "");
      }} options={modules.map(m => ({
        value: m,
        label: m
      }))} />
      </Space>
      <Table size="small" rowKey="id" loading={loading} columns={columns} dataSource={data.list} scroll={{
      x: 900
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
    </Card>;
}
