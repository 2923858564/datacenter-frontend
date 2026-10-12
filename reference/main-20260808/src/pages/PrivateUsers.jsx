import React, { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Table, Segmented, Select, Tag, Statistic } from "antd";
import Chart from "../components/Chart.jsx";
import { useProto } from "../store.jsx";
import { groupRows, projectRows, trendSeries, GROUPS, PEOPLE, fmtMoney, fmtPct, channelDayRows } from "../data.js";
import { api } from "../api.js";
const fmtWan = v => "¥" + (v / 10000).toFixed(1) + "万";
export default function PrivateUsers() {
  const {
    role,
    pkg,
    setPkg,
    scale,
    canPkg
  } = useProto();
  const [group, setGroup] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [realProjects, setRealProjects] = useState(null);
  const [realChannels, setRealChannels] = useState(null);
  useEffect(() => {
    api.projects().then(setRealProjects).catch(() => setRealProjects(null));
    api.channels().then(setRealChannels).catch(() => setRealChannels(null));
  }, []);
  const groups = useMemo(() => groupRows(scale).filter(r => group === "all" || r.group === group), [scale, group]);
  const mockProjects = useMemo(() => projectRows(scale), [scale]);
  const mockChannels = useMemo(() => channelDayRows(scale), [scale]);
  const td = useMemo(() => trendSeries(scale), [scale]);
  const projects = realProjects ? realProjects.map(r => ({
    key: r.name,
    name: r.name,
    reg: r.newAcct,
    payNew: r.payNew || 0,
    pay: r.payAcct,
    rate: r.payRate == null ? "--" : (r.payRate * 100).toFixed(1),
    flow: r.payAmt,
    newFlow: 0
  })) : mockProjects;
  const channels = realChannels || mockChannels;
  const groupCols = [{
    title: "小组",
    dataIndex: "group",
    render: v => <a onClick={() => setSelectedGroup(selectedGroup === v ? null : v)}>{v} {selectedGroup === v ? "▲" : "▼"}</a>
  }, {
    title: "新注册数",
    dataIndex: "reg",
    align: "right",
    render: (v, r) => <>{v.toLocaleString()}<span style={{
        color: r.regChg >= 0 ? "#00b42a" : "#f53f3f",
        marginLeft: 4
      }}>{r.regChg >= 0 ? "+" : ""}{r.regChg}%</span></>
  }, {
    title: "新账号付费数",
    dataIndex: "payNew",
    align: "right",
    render: v => v.toLocaleString()
  }, {
    title: "日付费",
    dataIndex: "pay",
    align: "right",
    render: v => v.toLocaleString()
  }, {
    title: "新用户付费率",
    dataIndex: "rate",
    align: "right",
    render: v => v + "%"
  }, {
    title: "日流水",
    dataIndex: "flow",
    align: "right",
    render: (v, r) => <>{fmtWan(v)}<span style={{
        color: r.flowChg >= 0 ? "#00b42a" : "#f53f3f",
        marginLeft: 4
      }}>{r.flowChg >= 0 ? "+" : ""}{r.flowChg}%</span></>
  }, {
    title: "日新注册流水",
    dataIndex: "newFlow",
    align: "right",
    render: v => fmtWan(v)
  }];
  const projectCols = [{
    title: "游戏名称",
    dataIndex: "name"
  }, {
    title: "新注册数",
    dataIndex: "reg",
    align: "right",
    render: v => v.toLocaleString()
  }, {
    title: "新账号付费数",
    dataIndex: "payNew",
    align: "right",
    render: v => v.toLocaleString()
  }, {
    title: "日付费",
    dataIndex: "pay",
    align: "right",
    render: v => v.toLocaleString()
  }, {
    title: "新用户付费率",
    dataIndex: "rate",
    align: "right",
    render: v => v + "%"
  }, {
    title: "日流水",
    dataIndex: "flow",
    align: "right",
    render: v => fmtWan(v)
  }, {
    title: "日新注册流水",
    dataIndex: "newFlow",
    align: "right",
    render: v => fmtWan(v)
  }];
  const people = selectedGroup ? PEOPLE.filter(p => p.group === selectedGroup) : [];
  const personCols = [{
    title: "人员",
    dataIndex: "name"
  }, {
    title: "分包",
    dataIndex: "sub"
  }, {
    title: "新注册数",
    align: "right",
    render: () => 38
  }, {
    title: "日流水",
    align: "right",
    render: () => "¥9,600"
  }, {
    title: "日付费",
    align: "right",
    render: () => 6
  }];
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
        }}>私域数据看板</span>
          <span style={{
          color: "#86909c",
          fontSize: 12
        }}>更新于 13:56:18</span>
          {canPkg && <Segmented size="small" options={[{
          label: "整包",
          value: "whole"
        }, {
          label: "分包",
          value: "sub"
        }]} value={pkg} onChange={setPkg} />}
          <Select size="small" style={{
          width: 140
        }} value={group} onChange={setGroup} options={[{
          value: "all",
          label: "全部小组"
        }, ...GROUPS.map(g => ({
          value: g,
          label: g
        }))]} />
          <Tag color="blue">数据范围：{role.scope}</Tag>
          <span style={{
          color: "#86909c",
          fontSize: 12
        }}>下钻：小组 → 分人分项目（V1.2）</span>
          {realProjects ? <Tag color="green">各项目为真实数据</Tag> : <Tag>演示数据</Tag>}
        </div>
      </Card>

      <Card size="small" title="各小组日数据汇总" style={{
      marginBottom: 12
    }} extra={<Tag>演示数据</Tag>}>
        <Table size="small" columns={groupCols} dataSource={groups} pagination={false} summary={() => <Table.Summary.Row style={{
        background: "#fafafa",
        fontWeight: 600
      }}>
              <Table.Summary.Cell index={0}>合计</Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">{groups.reduce((s, r) => s + r.reg, 0).toLocaleString()}</Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="right">{groups.reduce((s, r) => s + r.payNew, 0).toLocaleString()}</Table.Summary.Cell>
              <Table.Summary.Cell index={3} align="right">{groups.reduce((s, r) => s + r.pay, 0).toLocaleString()}</Table.Summary.Cell>
              <Table.Summary.Cell index={4} align="right">{(groups.reduce((s, r) => s + r.payNew, 0) / Math.max(groups.reduce((s, r) => s + r.reg, 0), 1) * 100).toFixed(1)}%</Table.Summary.Cell>
              <Table.Summary.Cell index={5} align="right">{fmtWan(groups.reduce((s, r) => s + r.flow, 0))}</Table.Summary.Cell>
              <Table.Summary.Cell index={6} align="right">{fmtWan(groups.reduce((s, r) => s + r.newFlow, 0))}</Table.Summary.Cell>
            </Table.Summary.Row>} />
      </Card>

      {selectedGroup && <Card size="small" title={`${selectedGroup} · 分人分项目明细`} style={{
      marginBottom: 12
    }} extra={<Tag color="green">V1.2 下钻</Tag>}>
          <Table size="small" columns={personCols} dataSource={people} pagination={false} rowKey="name" />
        </Card>}

      <Card size="small" title="游戏数据排行" style={{
      marginBottom: 12
    }} extra={<Tag>演示数据</Tag>}>
        <Chart option={{
        tooltip: {},
        grid: {
          left: 60,
          right: 20,
          top: 30,
          bottom: 40
        },
        xAxis: {
          type: "category",
          data: [...projects].sort((a, b) => b.reg - a.reg).map(r => r.name),
          axisLabel: {
            rotate: 20,
            fontSize: 10
          }
        },
        yAxis: {
          type: "value"
        },
        series: [{
          type: "bar",
          data: [...projects].sort((a, b) => b.reg - a.reg).map(r => r.reg),
          itemStyle: {
            color: "#1677ff"
          }
        }]
      }} height={240} />
      </Card>

      <Card size="small" title="各项目数据汇总" style={{
      marginBottom: 12
    }} extra={<Tag>{realProjects ? "真实数据（ODS）" : "演示数据"}</Tag>}>
        <Table size="small" columns={projectCols} dataSource={projects} pagination={false} summary={() => <Table.Summary.Row style={{
        background: "#fafafa",
        fontWeight: 600
      }}>
              <Table.Summary.Cell index={0}>合计</Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">{projects.reduce((s, r) => s + r.reg, 0).toLocaleString()}</Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="right">{projects.reduce((s, r) => s + r.payNew, 0).toLocaleString()}</Table.Summary.Cell>
              <Table.Summary.Cell index={3} align="right">{projects.reduce((s, r) => s + r.pay, 0).toLocaleString()}</Table.Summary.Cell>
              <Table.Summary.Cell index={4} align="right">{(projects.reduce((s, r) => s + r.payNew, 0) / Math.max(projects.reduce((s, r) => s + r.reg, 0), 1) * 100).toFixed(1)}%</Table.Summary.Cell>
              <Table.Summary.Cell index={5} align="right">{fmtWan(projects.reduce((s, r) => s + r.flow, 0))}</Table.Summary.Cell>
              <Table.Summary.Cell index={6} align="right">{fmtWan(projects.reduce((s, r) => s + r.newFlow, 0))}</Table.Summary.Cell>
            </Table.Summary.Row>} />
      </Card>

      <Row gutter={[12, 12]}>
        <Col xs={24} lg={8}>
          <Card size="small" style={{
          marginBottom: 12
        }}>
            <Row gutter={8}>
              <Col span={6}><Statistic title="在投渠道" value={realChannels ? channels.filter(c => c.reg > 0).length : 28} suffix="个" /></Col>
              <Col span={6}><Statistic title="风险渠道" value={realChannels ? "-" : 2} suffix={realChannels ? "" : "个"} /></Col>
              <Col span={6}><Statistic title="渠道总流水" value={realChannels ? Math.round(channels.reduce((s, c) => s + c.flow, 0) / 10000) : 1520} suffix="万" /></Col>
              <Col span={6}><Statistic title="总ROI" value={2.23} precision={2} /></Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card size="small" title="渠道贡献排行 Top5" extra={<Tag>演示数据</Tag>}>
            <Chart option={{
            tooltip: {
              trigger: "item",
              formatter: "{b}: {c}万 ({d}%)"
            },
            series: [{
              type: "pie",
              radius: ["40%", "65%"],
              data: channels.map(c => ({
                name: c.channel,
                value: +(c.flow / 10000).toFixed(2)
              }))
            }]
          }} height={200} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} lg={12}>
          <Card size="small" title="日注册趋势（近 30 天）" extra={<Tag>演示数据</Tag>}>
            <Chart option={{
            tooltip: {
              trigger: "axis"
            },
            grid: {
              left: 50,
              right: 20,
              top: 30,
              bottom: 30
            },
            xAxis: {
              type: "category",
              data: td.days.map(x => x[0])
            },
            yAxis: {
              type: "value"
            },
            series: [{
              type: "line",
              smooth: true,
              data: td.days.map(x => x[1]),
              areaStyle: {
                opacity: 0.12
              }
            }]
          }} height={250} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card size="small" title="日流水趋势（近 30 天）" extra={<Tag>演示数据</Tag>}>
            <Chart option={{
            tooltip: {
              trigger: "axis"
            },
            grid: {
              left: 60,
              right: 20,
              top: 30,
              bottom: 30
            },
            xAxis: {
              type: "category",
              data: td.days.map(x => x[0])
            },
            yAxis: {
              type: "value"
            },
            series: [{
              type: "line",
              smooth: true,
              data: td.days.map(x => x[1] * 1200),
              areaStyle: {
                opacity: 0.12
              }
            }]
          }} height={250} />
          </Card>
        </Col>
      </Row>
    </div>;
}
