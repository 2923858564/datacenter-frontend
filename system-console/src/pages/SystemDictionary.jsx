import GameServerDirectory from "./GameServerDirectory.jsx";
import WorkOrderGrading from "./WorkOrderGrading.jsx";
import { Tabs } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Descriptions, Empty, Form, Input, Modal, Select, Space, Table, Tag, Typography, message } from "antd";
import { metrics } from "../data/metricDictionary.js";
import { api } from "../api.js";

const { Title, Text } = Typography;
const fields = [
  ["name", "中文名称"], ["definition", "定义"], ["formula", "公式"],
  ["grain", "统计颗粒度"], ["time", "时间口径"], ["unit", "单位"],
  ["nullMeaning", "空值含义"], ["source", "来源表"],
  ["refresh", "刷新时间"], ["owner", "负责人"],
];
const groups = [...new Set([...metrics.map(row => row.group), "自定义指标"])];

function MetricDictionary() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editing, setEditing] = useState(null);
  const [overrides, setOverrides] = useState({});
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState(null);
  const [expanded, setExpanded] = useState([]);
  const [published, setPublished] = useState("");
  const [refreshStatus, setRefreshStatus] = useState("");
  useEffect(() => {
    if (!query) return;
    let current = true;
    setLoading(true);
    setLoadError("");
    api.dictionary().then(data => { if (current) setOverrides(data); })
      .catch(error => { if (current) setLoadError(error.message); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [query]);
  const catalog = useMemo(() => [
    ...metrics.map(row => ({ ...row, ...overrides[row.id], refreshKind: overrides[row.id]?.refresh !== undefined ? "source" : row.refreshKind })),
    ...Object.entries(overrides).filter(([id, row]) => row.custom === "1" && !metrics.some(m => m.id === id)).map(([id, row]) => ({ ...row, id, refreshKind: "source" })),
  ], [overrides]);
  const startCreate = () => {
    editForm.resetFields();
    editForm.setFieldsValue({ group: "自定义指标" });
    setEditing({ isNew: true });
  };
  const startEdit = row => {
    const item = catalog.find(item => item.id === row.id);
    setEditing(item);
    editForm.setFieldsValue(Object.fromEntries(fields.map(([key]) => [key, item[key]])));
  };
  const save = async () => {
    const values = await editForm.validateFields().catch(() => null);
    if (!values) return;
    const changes = Object.fromEntries(Object.entries(values).filter(([key, value]) => value !== editing[key]));
    if (!Object.keys(changes).length) { setEditing(null); return; }
    setSaving(true);
    try {
      if (editing.isNew) {
        await api.createDictionary(values);
        form.resetFields(); setQuery({}); setExpanded([]);
      } else {
        const saved = await api.editDictionary(editing.id, changes);
        setOverrides(current => ({ ...current, [editing.id]: saved }));
      }
      setEditing(null);
      message.success("指标说明已保存");
    } catch (error) { message.error(error.message); }
    finally { setSaving(false); }
  };
  useEffect(() => {
    if (!query) return;
    let current = true;
    setPublished("");
    setRefreshStatus("正在读取业务数据发布时间…");
    api.health().then(snapshot => {
      if (!current) return;
      const timestamp = snapshot?.updated_at || snapshot?.generated_at;
      setPublished(typeof timestamp === "string" ? timestamp : "");
      setRefreshStatus(timestamp ? "" : "数据源未提供业务数据发布时间");
    }).catch(() => { if (current) setRefreshStatus("业务数据发布时间读取失败，可重新查询"); });
    return () => { current = false; };
  }, [query]);
  const rows = useMemo(() => {
    if (!query || loadError || loading) return [];
    const keyword = (query.keyword || "").trim().toLowerCase();
    return catalog.filter(row => (!query.group || row.group === query.group)
      && (!keyword || [row.group, row.aliases, ...fields.map(([key]) => row[key])]
        .join(" ").toLowerCase().includes(keyword)))
      .map(row => row.refreshKind === "business" && published
        ? { ...row, refresh: `最近业务数据发布：${published}。计划每小时刷新；该时间是注册、充值数据的整体发布时刻，不是每张源表各自的采集时刻。` }
        : row);
  }, [query, published, catalog, loadError, loading]);
  const columns = [
    { title: "中文名称", dataIndex: "name", width: 190, render: (value, row) => <><Text strong>{value}</Text><div><Text type="secondary" style={{ fontSize: 12 }}>{row.group}</Text></div></> },
    { title: "定义", dataIndex: "definition", width: 280 },
    { title: "公式", dataIndex: "formula", width: 300 },
    { title: "统计颗粒度", dataIndex: "grain", width: 180 },
    { title: "单位", dataIndex: "unit", width: 90 },
    { title: "负责人", dataIndex: "owner", width: 160 },
    { title: "操作", key: "edit", width: 100, fixed: "right", render: (_, row) => <Button type="link" size="small" onClick={() => startEdit(row)}>编辑</Button> },
  ];
  return <div style={{ maxWidth: 1600, margin: "0 auto" }}>
    <Title level={3} style={{ margin: "0 0 8px" }}>数据字典</Title>
    <Space style={{ display: "flex", justifyContent: "space-between" }}><Text type="secondary">指标名称、计算口径与数据来源</Text><Button type="primary" onClick={startCreate}>新增指标</Button></Space>
    <Card style={{ marginTop: 20 }}>
      <Form form={form} layout="inline" onFinish={values => { setQuery(values); setExpanded([]); }} style={{ gap: 12 }}>
        <Form.Item name="keyword" label="指标搜索" style={{ margin: 0 }}><Input allowClear placeholder="名称、公式、来源表" style={{ width: 240 }} /></Form.Item>
        <Form.Item name="group" label="使用场景" style={{ margin: 0 }}><Select allowClear placeholder="全部场景" style={{ width: 200 }} options={groups.map(value => ({ value, label: value }))} /></Form.Item>
        <Form.Item style={{ margin: 0 }}><Space><Button type="primary" htmlType="submit">查询</Button><Button onClick={() => { form.resetFields(); setQuery(null); setExpanded([]); }}>重置</Button></Space></Form.Item>
      </Form>
    </Card>
    <Card style={{ marginTop: 16 }} styles={{ body: { padding: 16 } }}>
      {query && loadError && <Alert type="error" showIcon message={`指标说明读取失败：${loadError}`} style={{ marginBottom: 16 }} />}
      <Space wrap style={{ marginBottom: 16 }}><Text strong>{query ? `查询结果 ${rows.length} 项` : "点击查询查看已收录指标"}</Text><Tag>每项 10 项说明</Tag>{query && refreshStatus && <Text type="secondary">{refreshStatus}</Text>}</Space>
      <Table rowKey="id" columns={columns} dataSource={rows} loading={loading && !!query} size="middle" scroll={{ x: 1360 }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: [10, 20, 50], showTotal: total => `共 ${total} 项` }}
        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={query ? "未找到匹配指标，请调整查询条件" : "等待查询"} /> }}
        expandable={{ columnWidth: 70, expandIcon: ({ expanded: open, onExpand, record }) => <Button type="link" size="small" aria-expanded={open} onClick={event => onExpand(record, event)}>{open ? "收起" : "详情"}</Button>, expandedRowKeys: expanded, onExpandedRowsChange: setExpanded, expandedRowRender: row => <Descriptions bordered size="small" column={{ xs: 1, sm: 1, md: 2, lg: 2 }} items={fields.map(([key, label]) => ({ key, label, children: row[key], span: ["definition", "formula", "source", "refresh"].includes(key) ? 2 : 1 }))} /> }} />
    </Card>
    <Modal title={editing?.isNew ? "新增指标" : "编辑指标说明"} open={!!editing} width={760} okText="保存" cancelText="取消" confirmLoading={saving} closable={!saving} maskClosable={false} cancelButtonProps={{ disabled: saving }} onOk={save} onCancel={() => { if (!saving) setEditing(null); }}>
      <Form form={editForm} layout="vertical" disabled={saving}>
        {editing?.isNew && <Form.Item name="group" label="使用场景" rules={[{ required: true, message: "请选择使用场景" }]}><Select options={groups.map(value => ({ value, label: value }))} /></Form.Item>}
        {fields.map(([key, label]) => <Form.Item key={key} name={key} label={label} rules={key === "name" ? [{ required: true, whitespace: true, message: "请输入中文名称" }] : []}>
          {["name", "unit", "owner"].includes(key) ? <Input maxLength={200} /> : <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} maxLength={3000} />}
        </Form.Item>)}
      </Form>
    </Modal>
  </div>;
}

export default function SystemDictionary() {
  const view = new URLSearchParams(window.location.search).get("view");
  return <Tabs defaultActiveKey={["servers", "workorders"].includes(view) ? view : "metrics"} items={[{ key: "metrics", label: "指标口径", children: <MetricDictionary /> }, { key: "servers", label: "游戏区服", children: <GameServerDirectory /> }, { key: "workorders", label: "工单分级", children: <WorkOrderGrading /> }]} />;
}
