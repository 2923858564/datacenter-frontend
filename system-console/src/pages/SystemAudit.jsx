import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Card, DatePicker, Input, Select, Space, Table, Tag, message } from "antd";
import dayjs from "dayjs";
import zhCN from "antd/es/date-picker/locale/zh_CN";
import { api } from "../api.js";

const ACTION_LABEL = {
  login: "登录", login_fail: "登录失败", login_blocked: "登录拦截", change_password: "修改密码",
  user_create: "新增员工", user_update: "编辑员工", user_status: "启用/停用",
  user_resetpwd: "重置密码", user_delete: "删除员工", user_roles: "分配角色",
  role_create: "新增角色", role_update: "编辑角色", role_delete: "删除角色", role_perms: "分配权限",
  snapshot_upload: "快照上传",
};

export default function SystemAudit() {
  const [data, setData] = useState({ list: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const listRequestId = useRef(0);
  const [keyword, setKeyword] = useState("");
  const [module, setModule] = useState("");
  const [action, setAction] = useState("");
  const [operatorInput, setOperatorInput] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const load = useCallback(async () => {
    const requestId = ++listRequestId.current;
    setLoading(true);
    try {
      const d = await api.auditLogs({ page, size, operator: keyword || undefined, operation_page: module || undefined, action: action || undefined, date_from: dateFrom || undefined, date_to: dateTo || undefined });
      if (requestId === listRequestId.current) setData(d);
    } catch (e) {
      if (requestId === listRequestId.current) message.error(e.message);
    } finally {
      if (requestId === listRequestId.current) setLoading(false);
    }
  }, [page, size, keyword, module, action, dateFrom, dateTo]);

  useEffect(() => {
    load();
    return () => { listRequestId.current += 1; };
  }, [load]);

  const columns = [
    { title: "时间", dataIndex: "op_time", width: 160, render: (v) => (v || "-").replace("T", " ").slice(0, 19) },
    { title: "操作人", dataIndex: "operator", width: 120 },
    { title: "操作", dataIndex: "action", width: 120, render: (v) => ACTION_LABEL[v] || v },
    { title: "模块", dataIndex: "module", width: 110, render: (v) => <Tag>{v}</Tag> },
    { title: "操作页面", dataIndex: "operation_page", width: 160 },
    { title: "IP", dataIndex: "ip", width: 130 },
  ];

  const modules = data.options?.pages || [];
  const moduleLabels = { auth: "登录与账号", data: "数据管理", personnel: "人员管理", system: "系统管理" };

  return (
    <Card size="small" title="日志审计" extra={<span style={{ color: "#86909c", fontSize: 12 }}>共 {data.total} 条</span>}>
      <Space style={{ marginBottom: 12 }} size={8} wrap>
        <Select placeholder="全部项目" disabled style={{ width: 120 }} title="日志暂未记录项目归属" />
        <Select placeholder="全部部门" disabled style={{ width: 120 }} title="日志暂未记录部门归属" />
        <Select allowClear placeholder="操作类型" style={{ width: 120 }} value={action || undefined}
          onChange={(v) => { setPage(1); setAction(v || ""); }}
          options={(data.options?.actions || []).map((v) => ({ value: v, label: ACTION_LABEL[v] || v }))} />
        <Select allowClear placeholder="操作页面" style={{ width: 120 }} value={module || undefined}
          onChange={(v) => { setPage(1); setModule(v || ""); }}
          options={modules.map((v) => ({ value: v, label: moduleLabels[v] || v }))} />
        <Input.Search placeholder="操作人" allowClear style={{ width: 150 }} value={operatorInput}
          onSearch={(v) => { setPage(1); setKeyword(v); }}
          onChange={(e) => { setOperatorInput(e.target.value); if (!e.target.value) { setPage(1); setKeyword(""); } }} />
        <DatePicker.RangePicker size="small" style={{ width: 240 }} locale={zhCN}
          placeholder={["开始日期", "结束日期"]}
          value={dateFrom && dateTo ? [dayjs(dateFrom), dayjs(dateTo)] : null}
          onChange={(dates) => { setPage(1); setDateFrom(dates?.[0]?.format("YYYY-MM-DD") || ""); setDateTo(dates?.[1]?.format("YYYY-MM-DD") || ""); }}
          presets={[
            { label: "昨日", value: [dayjs().subtract(1, "d"), dayjs().subtract(1, "d")] },
            { label: "今日", value: [dayjs(), dayjs()] },
            { label: "上周", value: [dayjs().subtract(1, "w").startOf("w"), dayjs().subtract(1, "w").endOf("w")] },
            { label: "本周", value: [dayjs().startOf("w"), dayjs()] },
            { label: "上月", value: [dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month").endOf("month")] },
            { label: "本月", value: [dayjs().startOf("month"), dayjs()] },
            { label: "最近30天", value: [dayjs().subtract(29, "d"), dayjs()] },
            { label: "最近90天", value: [dayjs().subtract(89, "d"), dayjs()] },
          ]} />
        <Button onClick={() => { setPage(1); setKeyword(""); setOperatorInput(""); setModule(""); setAction(""); setDateFrom(""); setDateTo(""); }}>重置</Button>
      </Space>
      <Table
        size="small"
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data.list}
        scroll={{ x: 900 }}
        pagination={{
          current: page, pageSize: size, total: data.total, showSizeChanger: true, showTotal: (t) => `共 ${t} 条`,
          onChange: (p, s) => { setPage(p); setSize(s); },
        }}
      />
    </Card>
  );
}
