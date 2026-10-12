import React, { useState } from "react";
import { Alert, Button, Card, Empty, InputNumber, Select, Space, Table, Typography, message } from "antd";
import { api } from "../api.js";

const stars = [["one", "一星"], ["two", "二星"], ["three", "三星"], ["four", "四星"], ["five_star", "五星"], ["S", "S级玩家"]];
const types = [["INTRODUCTION", "引入"], ["MAINTENANCE", "维护"], ["REUSE", "复用"], ["AI_HANDOFF", "AI转人工"]];

export default function WorkOrderGrading() {
  const [config, setConfig] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function load() {
    setBusy(true); setError("");
    try { setConfig(await api.workOrderGrading()); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function save() {
    setBusy(true); setError("");
    try { setConfig(await api.saveWorkOrderGrading(config)); message.success("工单分级配置已保存"); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  function threshold(star, minimum) {
    setConfig(c => ({ ...c, thresholds: [...c.thresholds.filter(r => r.star !== star), ...(minimum == null ? [] : [{ star, minimum }])] }));
  }
  function grade(star, order_type, value) {
    setConfig(c => ({ ...c, rules: [...c.rules.filter(r => r.star !== star || r.order_type !== order_type), ...(value ? [{ star, order_type, grade: value }] : [])] }));
  }
  const columns = [
    { title: "玩家星级", dataIndex: "label", width: 110 },
    { title: "累计充值起点（元，含）", width: 210, render: (_, row) => <InputNumber aria-label={`${row.label}累计充值起点`} value={config.thresholds.find(r => r.star === row.star)?.minimum ?? null} min={0} precision={2} placeholder="未配置" disabled={busy} onChange={v => threshold(row.star, v)} style={{ width: 170 }} /> },
    ...types.map(([type, label]) => ({ title: `${label}工单等级`, render: (_, row) => <Select aria-label={`${row.label}${label}工单等级`} allowClear placeholder="待定级" disabled={busy} value={config.rules.find(r => r.star === row.star && r.order_type === type)?.grade} options={["S", "A", "B", "C", "D"].map(value => ({ value, label: `${value}级` }))} onChange={v => grade(row.star, type, v)} style={{ width: 110 }} /> })),
  ];
  return <Card title="工单分级配置">
    <Typography.Paragraph>玩家累计充值金额按同平台小号统计，与用户池一致。星级按已配置的充值起点计算，取满足条件的最高星级；区间上限为下一已配置星级的起点（不含）。</Typography.Paragraph>
    <Typography.Paragraph type="secondary">星级门槛或对应工单类型的等级未配置时，工单显示“待定级”。保存后，工单按已关联的充值资料与当前规则评估；新增充值后需在工单详情刷新玩家资料。</Typography.Paragraph>
    <Space style={{ marginBottom: 16 }}><Button onClick={load} loading={busy}>查询配置</Button><Button disabled={busy} onClick={() => { setConfig(null); setError(""); }}>重置</Button><Button type="primary" disabled={!config} loading={busy} onClick={save}>保存配置</Button></Space>
    {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}
    <Table rowKey="star" columns={columns} dataSource={config ? stars.map(([star, label]) => ({ star, label })) : []} pagination={false} scroll={{ x: 950 }} locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="等待查询" /> }} />
  </Card>;
}
