import React, { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Table, Tag, Statistic, Button, Space, message } from "antd";
import Chart from "../components/Chart.jsx";
import { useProto } from "../store.jsx";
import { fmtMoney } from "../data.js";
import { api } from "../api.js";
const exportMock = () => message.info("导出为演示交互，接入真实数据后可用（Excel/CSV）");
const DAY_BASE = [{
  name: "张三",
  group: "开天组",
  reg: 128,
  payNew: 15,
  rate: 11.7,
  payNewAmt: 5200,
  payTotal: 42,
  payAmt: 32000
}, {
  name: "李四",
  group: "开天组",
  reg: 115,
  payNew: 12,
  rate: 10.4,
  payNewAmt: 3900,
  payTotal: 38,
  payAmt: 28000
}, {
  name: "王五",
  group: "屠龙组",
  reg: 102,
  payNew: 10,
  rate: 9.8,
  payNewAmt: 3100,
  payTotal: 35,
  payAmt: 22000
}, {
  name: "赵六",
  group: "屠龙组",
  reg: 88,
  payNew: 8,
  rate: 9.1,
  payNewAmt: 2400,
  payTotal: 30,
  payAmt: 18000
}, {
  name: "陈七",
  group: "聚财组",
  reg: 76,
  payNew: 7,
  rate: 9.2,
  payNewAmt: 2100,
  payTotal: 28,
  payAmt: 15000
}, {
  name: "周八",
  group: "聚财组",
  reg: 65,
  payNew: 6,
  rate: 9.2,
  payNewAmt: 1800,
  payTotal: 25,
  payAmt: 12000
}, {
  name: "吴九",
  group: "内容组",
  reg: 52,
  payNew: 4,
  rate: 7.7,
  payNewAmt: 1200,
  payTotal: 20,
  payAmt: 8500
}, {
  name: "郑十",
  group: "内容组",
  reg: 41,
  payNew: 3,
  rate: 7.3,
  payNewAmt: 900,
  payTotal: 16,
  payAmt: 6000
}];
export default function PerformanceRanking() {
  const {
    scale
  } = useProto();
  const [realPerson, setRealPerson] = useState(null);
  useEffect(() => {
    api.person().then(setRealPerson).catch(() => setRealPerson(null));
  }, []);
  const mockDay = useMemo(() => DAY_BASE.map(r => ({
    ...r,
    reg: Math.round(r.reg * scale),
    payNew: Math.round(r.payNew * scale),
    payNewAmt: Math.round(r.payNewAmt * scale),
    payTotal: Math.round(r.payTotal * scale),
    payAmt: Math.round(r.payAmt * scale)
  })), [scale]);
  const dayRows = realPerson ? realPerson.map(r => ({
    name: r.name,
    group: r.group || "渠道",
    reg: r.reg,
    payNew: r.payNew || 0,
    rate: r.rate || 0,
    payNewAmt: r.payNewAmt || 0,
    payTotal: r.payTotal,
    payAmt: r.payAmt
  })) : mockDay;
  const monthRows = useMemo(() => dayRows.map(r => ({
    ...r,
    reg: r.reg * 10,
    payNew: r.payNew * 10,
    payNewAmt: r.payNewAmt * 10,
    payTotal: r.payTotal * 10,
    payAmt: r.payAmt * 10
  })), [dayRows]);
  const top1 = dayRows[0] || {
    name: "-",
    reg: 0,
    payAmt: 0
  };
  const cols = [{
    title: "小组",
    dataIndex: "group"
  }, {
    title: "姓名",
    dataIndex: "name"
  }, {
    title: "新注册数",
    dataIndex: "reg",
    align: "right",
    render: v => v.toLocaleString()
  }, {
    title: "新注册付费数",
    dataIndex: "payNew",
    align: "right",
    render: v => v.toLocaleString()
  }, {
    title: "新注册付费率",
    dataIndex: "rate",
    align: "right",
    render: v => v + "%"
  }, {
    title: "新注册付费金额",
    dataIndex: "payNewAmt",
    align: "right",
    render: v => fmtMoney(v)
  }, {
    title: "总付费用户数",
    dataIndex: "payTotal",
    align: "right",
    render: v => v.toLocaleString()
  }, {
    title: "总付费金额",
    dataIndex: "payAmt",
    align: "right",
    render: v => fmtMoney(v)
  }];
  const summary = rows => <Table.Summary.Row style={{
    background: "#fafafa",
    fontWeight: 600
  }}>
      <Table.Summary.Cell index={0} colSpan={2}>合计</Table.Summary.Cell>
      <Table.Summary.Cell index={2} align="right">{rows.reduce((s, r) => s + r.reg, 0).toLocaleString()}</Table.Summary.Cell>
      <Table.Summary.Cell index={3} align="right">{rows.reduce((s, r) => s + r.payNew, 0).toLocaleString()}</Table.Summary.Cell>
      <Table.Summary.Cell index={4} align="right">{(rows.reduce((s, r) => s + r.payNew, 0) / Math.max(rows.reduce((s, r) => s + r.reg, 0), 1) * 100).toFixed(1)}%</Table.Summary.Cell>
      <Table.Summary.Cell index={5} align="right">{fmtMoney(rows.reduce((s, r) => s + r.payNewAmt, 0))}</Table.Summary.Cell>
      <Table.Summary.Cell index={6} align="right">{rows.reduce((s, r) => s + r.payTotal, 0).toLocaleString()}</Table.Summary.Cell>
      <Table.Summary.Cell index={7} align="right">{fmtMoney(rows.reduce((s, r) => s + r.payAmt, 0))}</Table.Summary.Cell>
    </Table.Summary.Row>;
  return <div>
      <Card size="small" style={{
      marginBottom: 12
    }}>
        <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "center"
      }}>
          <span style={{
          fontWeight: 600
        }}>人员业绩排行看板</span>
          <span style={{
          color: "#86909c",
          fontSize: 12
        }}>更新于 13:56:20</span>
          <span style={{
          color: "#86909c",
          fontSize: 12
        }}>口径：注册量 + 流水；KPI 目标每月月初敲定</span>
          {realPerson ? <Tag color="green">真实数据（按推广员）</Tag> : <Tag>演示数据</Tag>}
        </div>
      </Card>

      <Card size="small" title="日维度排行" style={{
      marginBottom: 12
    }}>
        <Row gutter={[12, 12]}>
          <Col xs={12} lg={6}><Card size="small"><Statistic title="日注册TOP1" value={top1.name} suffix={`${top1.reg}人`} /></Card></Col>
          <Col xs={12} lg={6}><Card size="small"><Statistic title="日流水TOP1" value={top1.name} suffix={fmtMoney(top1.payAmt)} /></Card></Col>
          <Col xs={12} lg={6}><Card size="small"><Statistic title="上升最快" value={realPerson ? "-" : "张三"} suffix={realPerson ? "" : "+3位"} /></Card></Col>
          <Col xs={12} lg={6}><Card size="small"><Statistic title="日KPI达成率" value={78.0} precision={1} suffix="%" /></Card></Col>
        </Row>
        <Card size="small" title="个人日注册流水数据表" style={{
        marginTop: 12
      }} extra={<Button size="small" onClick={exportMock}>导出</Button>}>
          <Table size="small" columns={cols} dataSource={dayRows} pagination={false} rowKey="name" summary={() => summary(dayRows)} />
        </Card>
      </Card>

      <Card size="small" title="月维度排行" style={{
      marginBottom: 12
    }}>
        <Row gutter={[12, 12]}>
          <Col xs={12} lg={6}><Card size="small"><Statistic title="月注册TOP1" value="张三" suffix="1280人" /></Card></Col>
          <Col xs={12} lg={6}><Card size="small"><Statistic title="月流水TOP1" value="张三" suffix="¥320万" /></Card></Col>
          <Col xs={12} lg={6}><Card size="small"><Statistic title="全员KPI达成率" value={92} suffix="%" /></Card></Col>
          <Col xs={12} lg={6}><Card size="small"><Statistic title="环比" value={15.0} suffix="%" valueStyle={{
              color: "#00b42a"
            }} /></Card></Col>
        </Row>
        <Card size="small" title="个人月排行" style={{
        marginTop: 12
      }} extra={<Button size="small" onClick={exportMock}>导出</Button>}>
          <Table size="small" columns={cols} dataSource={monthRows} pagination={false} rowKey="name" summary={() => summary(monthRows)} />
        </Card>
      </Card>

      <Row gutter={[12, 12]}>
        <Col xs={24} lg={12}>
          <Card size="small" title="排名变动轨迹（近 30 天）" extra={<Tag>演示数据</Tag>}>
            <Chart option={{
            tooltip: {
              trigger: "axis"
            },
            legend: {
              top: 0
            },
            grid: {
              left: 50,
              right: 20,
              top: 34,
              bottom: 30
            },
            xAxis: {
              type: "category",
              data: Array.from({
                length: 30
              }, (_, i) => `${29 - i}天前`).reverse()
            },
            yAxis: {
              type: "value",
              inverse: true,
              min: 1
            },
            series: [1, 2, 3, 4, 5].map(i => ({
              name: "TOP" + i,
              type: "line",
              smooth: true,
              data: Array.from({
                length: 30
              }, (_, j) => i + (j % 4 === 0 ? 1 : 0) + (i * 7 + j * 13) % 3)
            }))
          }} height={280} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card size="small" title="KPI 完成率" extra={<Tag>演示数据</Tag>}>
            <Chart option={{
            tooltip: {},
            grid: {
              left: 60,
              right: 20,
              top: 20,
              bottom: 30
            },
            xAxis: {
              type: "category",
              data: dayRows.map(r => r.name)
            },
            yAxis: {
              type: "value",
              max: 120
            },
            series: [{
              type: "bar",
              data: dayRows.map(r => Math.round((60 + r.reg / 3) * scale)),
              itemStyle: {
                color: p => p.value >= 100 ? "#00b42a" : "#1677ff"
              }
            }]
          }} height={280} />
          </Card>
        </Col>
      </Row>
    </div>;
}
