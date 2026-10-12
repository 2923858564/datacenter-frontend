import React, { useState } from "react";
import { Alert, Button, Card, Form, Input, Modal, Select, Space, Table, Typography, message } from "antd";
import { api } from "../api.js";

export default function GameServerDirectory() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState(null);
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const startEdit = row => {
    setEditing(row);
    editForm.setFieldsValue({ project: row.project || "", listName: row.listName || "" });
  };
  const saveEdit = async () => {
    const values = await editForm.validateFields().catch(() => null);
    if (!values) return;
    const changes = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, (v || "").trim()]).filter(([k, v]) => v !== (editing[k] || "")));
    if (!Object.keys(changes).length) { setEditing(null); return; }
    setSaving(true);
    try {
      await api.editGameServer(editing.gameId, editing.serverId, changes);
      setEditing(null);
      message.success("已保存；数字资产下次查询将使用更新后的关联信息");
      await search(query || {}, page, size);
    } catch (e) { message.error(e.message); }
    finally { setSaving(false); }
  };
  const search = async (values, nextPage = 1, nextSize = size) => {
    setLoading(true); setError(""); setQuery(values); setPage(nextPage); setSize(nextSize);
    try { setData(await api.gameServers({ ...values, page: nextPage, page_size: nextSize })); }
    catch (e) { setData(null); setError(e.message); }
    finally { setLoading(false); }
  };
  const columns = [
    { title: "平台", dataIndex: "platform", width: 90 },
    { title: "源游戏", dataIndex: "gameName", width: 250 },
    { title: "游戏ID", dataIndex: "gameId", width: 100 },
    { title: "对应项目", dataIndex: "project", width: 190, render: value => value || "待确认" },
    { title: "原始区服", dataIndex: "listName", width: 170 },
    { title: "区服ID", dataIndex: "serverId", width: 120 },
    { title: "类型", dataIndex: "isMainServer", width: 90, render: value => value ? "主区" : "子区" },
    { title: "当前主区", dataIndex: "mainServerListName", width: 170 },
    { title: "主区ID", dataIndex: "mainServerId", width: 120 },
    { title: "操作", key: "edit", fixed: "right", width: 90, render: (_, row) => <Button type="link" size="small" onClick={() => startEdit(row)}>编辑</Button> },
  ];
  return <>
    <Typography.Paragraph type="secondary">996SDK · 玩家战力查询 · 游戏与原始区服、当前主区关系</Typography.Paragraph>
    <Card>
      <Form form={form} layout="inline" onFinish={values => search(values)} style={{ gap: 12 }}>
        <Form.Item name="keyword" label="搜索"><Input allowClear placeholder="游戏、项目、区服名称或ID" style={{ width: 260 }} /></Form.Item>
        <Form.Item name="game_id" label="游戏"><Select showSearch optionFilterProp="label" allowClear placeholder="全部游戏" style={{ width: 290 }} options={(data?.games || []).map(g => ({ value: g.gameId, label: `${g.gameName}（${g.count}区服）` }))} /></Form.Item>
        <Form.Item name="kind" label="类型"><Select allowClear placeholder="全部类型" style={{ width: 120 }} options={[{ value: "main", label: "主区" }, { value: "sub", label: "子区" }]} /></Form.Item>
        <Form.Item><Space><Button type="primary" htmlType="submit" loading={loading}>查询</Button><Button disabled={loading} onClick={() => { form.resetFields(); setQuery(null); setData(null); setError(""); }}>重置</Button></Space></Form.Item>
      </Form>
    </Card>
    {error && <Alert type="error" showIcon message={error} style={{ marginTop: 16 }} />}
    {data && <Alert style={{ marginTop: 16 }} type="info" message={`游戏 ${data.games.length} 款 · 区服 ${data.serverCount} 条 · 源站返回空目录 ${data.emptyGameCount} 款 · 采集时间 ${data.updatedAt}`} description="对应项目待确认的游戏仍展示源站名称；跨游戏同名区服不自动关联。区服为空的游戏可在游戏筛选中查看。" />}
    <Table style={{ marginTop: 16 }} rowKey={row => `${row.gameId}:${row.serverId}`} columns={columns} dataSource={data?.records || []} loading={loading} scroll={{ x: 1400 }}
      locale={{ emptyText: query ? "当前条件下没有区服记录" : "等待查询" }}
      pagination={{ current: page, pageSize: size, total: data?.total || 0, showSizeChanger: true, pageSizeOptions: [20, 50, 100], showTotal: n => `共 ${n} 条`, onChange: (p, s) => search(query || {}, p, s) }} />
    <Modal title="编辑游戏区服" open={!!editing} onOk={saveEdit} onCancel={() => { if (!saving) setEditing(null); }} okText="保存" cancelText="取消" confirmLoading={saving} closable={!saving} maskClosable={false} cancelButtonProps={{ disabled: saving }}>
      <Typography.Paragraph>{editing?.gameName} · 游戏ID {editing?.gameId} · 区服ID {editing?.serverId}</Typography.Paragraph>
      <Form form={editForm} layout="vertical" disabled={saving}>
        <Form.Item name="project" label="对应项目" extra="应用于这款游戏的所有区服；留空表示项目待确认。"><Input maxLength={200} placeholder="填写系统中的项目名称" /></Form.Item>
        <Form.Item name="listName" label="区服名称" rules={[{ required: true, whitespace: true, message: "请输入区服名称" }]} extra="应用于当前区服；如果当前区服是主区，其子区的当前主区名称也会同步更新。"><Input maxLength={200} /></Form.Item>
      </Form>
    </Modal>
  </>;
}
