import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Card, Statistic, Segmented, Select, Table, Tabs, Tooltip, Tag, Button, Space, message } from "antd";
import Chart from "../components/Chart.jsx";
import { useProto } from "../store.jsx";
import { METRICS, makeRankings, sumKey, dailyRows, fmt, fmtMoney, fmtPct, groupRows, channelDayRows, GROUPS, CHANNELS, NOW } from "../data.js";
import { api, buildRealMetrics } from "../api.js";
const DATE_OPTIONS = [{
  label: "今日",
  value: "today"
}, {
  label: "昨日",
  value: "yesterday"
}, {
  label: "本月",
  value: "month"
}];
const CARDS = [["新账号数", "newAcct", "newAcctY", "newAcct7", "当日新增注册账号数（按统一 user_key 去重）", false], ["新账号付费数", "payNew", "payNewY", "payNew7", "首充 = 历史无充值 + 当日首笔（8/5 已确认）", false], ["新账号付费总额", "payNewAmt", "payNewAmtY", "payNewAmt7", "当日新账号付费金额合计，剔除退款/撤销", true], ["当月注册账号总数", "monthReg", "monthRegPrev", "monthRegAll", "自然月（1 日–今日）累计注册（8/5 已确认）", false, "month"], ["活跃账号数", "active", "activeY", "active7", "活跃定义待确认，建议对齐 996 后台活跃口径", false], ["账号付费数", "payAcct", "payAcctY", "payAcct7", "当日有效付费去重账号数（按 user_key 按天去重，8/5 已确认）", false], ["账号付费总额", "payAmt", "payAmtY", "payAmt7", "当日实际支付金额合计，剔除退款/撤销（8/5 已确认）", true], ["当月付费总额", "monthPay", "monthPayPrev", "monthPayAll", "自然月（1 日–今日）累计付费金额（8/5 已确认）", true, "month"]];
export default function Dashboard() {
  const {
    role,
    dateMode,
    setDateMode,
    pkg,
    setPkg,
    scale,
    canPkg
  } = useProto();
  const [gameTab, setGameTab] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [real, setReal] = useState(null);
  const [rank, setRank] = useState(null);
  const [daily, setDaily] = useState(null);
  const [chan, setChan] = useState(null);
  useEffect(() => {
    api.overview().then(setReal).catch(() => setReal(null));
    api.ranking().then(setRank).catch(() => setRank(null));
    api.daily(30).then(setDaily).catch(() => setDaily(null));
    api.channels().then(setChan).catch(() => setChan(null));
  }, []);
  const m = real ? buildRealMetrics(real) : METRICS[dateMode];
  const mockRows = useMemo(() => makeRankings(scale), [scale]);
  const mockDays = useMemo(() => dailyRows(scale), [scale]);
  const mockChannels = useMemo(() => channelDayRows(scale), [scale]);
  const groups = useMemo(() => groupRows(scale), [scale]);
  const rows = rank || mockRows;
  const days = daily || mockDays;
  const channels = chan || mockChannels;
  const exportMock = () => message.info("导出为演示交互，接入真实数据后可用（Excel/CSV）");
  const rankColumns = [{
    title: "排序",
    width: 60,
    render: (_, __, i) => i + 1
  }, {
    title: "游戏名称",
    dataIndex: "name",
    width: 180
  }, {
    title: "游戏ID",
    dataIndex: "id",
    width: 80
  }, {
    title: "新账号",
    dataIndex: "newAcct",
    align: "right",
    render: v => v.toLocaleString()
  }, {
    title: "新付费数",
    dataIndex: "payNew",
    align: "right",
    render: v => v.toLocaleString()
  }, {
    title: "新付费总额",
    dataIndex: "payNewAmt",
    align: "right",
    render: v => fmtMoney(v)
  }, {
    title: "新付费率",
    dataIndex: "payNewRate",
    align: "right",
    render: v => fmtPct(v)
  }, {
    title: "活跃",
    dataIndex: "active",
    align: "right",
    render: v => v.toLocaleString()
  }, {
    title: "付费数",
    dataIndex: "payAcct",
    align: "right",
    render: v => v.toLocaleString()
  }, {
    title: "付费总额",
    dataIndex: "payAmt",
    align: "right",
    render: v => fmtMoney(v)
  }, {
    title: "付费率",
    dataIndex: "payRate",
    align: "right",
    render: v => fmtPct(v)
  }, {
    title: "ARPU",
    dataIndex: "arpu",
    align: "right",
    render: v => v == null ? "--" : Number(v).toFixed(2)
  }, {
    title: "ARPPU",
    dataIndex: "arppu",
    align: "right",
    render: v => v == null ? "--" : Number(v).toFixed(2)
  }];
  const dayColumns = [{
    title: "日期",
    dataIndex: "date"
  }, {
    title: "新账号",
    dataIndex: "newAcct",
    align: "right",
    render: v => v.toLocaleString()
  }, {
    title: "新付费数",
    dataIndex: "payNew",
    align: "right",
    render: v => v.toLocaleString()
  }, {
    title: "新付费总额",
    dataIndex: "payNewAmt",
    align: "right",
    render: v => fmtMoney(v)
  }, {
    title: "新付费率",
    dataIndex: "payNewRate",
    align: "right",
    render: v => fmtPct(v)
  }, {
    title: "活跃",
    dataIndex: "active",
    align: "right",
    render: v => v.toLocaleString()
  }, {
    title: "付费数",
    dataIndex: "payAcct",
    align: "right",
    render: v => v.toLocaleString()
  }, {
    title: "付费总数",
    dataIndex: "payCnt",
    align: "right",
    render: v => v.toLocaleString()
  }, {
    title: "付费总额",
    dataIndex: "payAmt",
    align: "right",
    render: v => fmtMoney(v)
  }, {
    title: "付费率",
    dataIndex: "payRate",
    align: "right",
    render: v => fmtPct(v)
  }, {
    title: "ARPU",
    dataIndex: "arpu",
    align: "right",
    render: v => v == null ? "--" : Number(v).toFixed(2)
  }, {
    title: "ARPPU",
    dataIndex: "arppu",
    align: "right",
    render: v => v == null ? "--" : Number(v).toFixed(2)
  }];
  const payAmtBar = {
    tooltip: {},
    grid: {
      left: 60,
      right: 20,
      top: 30,
      bottom: 40
    },
    xAxis: {
      type: "category",
      data: rows.slice(0, 10).map(r => r.name),
      axisLabel: {
        rotate: 30,
        fontSize: 10
      }
    },
    yAxis: {
      type: "value"
    },
    series: [{
      type: "bar",
      data: rows.slice(0, 10).map(r => r.payAmt),
      itemStyle: {
        color: "#1677ff"
      }
    }]
  };
  const payAcctBar = {
    tooltip: {},
    grid: {
      left: 60,
      right: 20,
      top: 30,
      bottom: 40
    },
    xAxis: {
      type: "category",
      data: rows.slice(0, 10).map(r => r.name),
      axisLabel: {
        rotate: 30,
        fontSize: 10
      }
    },
    yAxis: {
      type: "value"
    },
    series: [{
      type: "bar",
      data: rows.slice(0, 10).map(r => r.payAcct),
      itemStyle: {
        color: "#00b42a"
      }
    }]
  };
  const groupBar = {
    tooltip: {},
    grid: {
      left: 60,
      right: 20,
      top: 30,
      bottom: 30
    },
    xAxis: {
      type: "category",
      data: GROUPS
    },
    yAxis: {
      type: "value"
    },
    series: [{
      type: "bar",
      data: groups.map(g => +(g.flow / 10000).toFixed(2)),
      itemStyle: {
        color: "#1677ff"
      }
    }]
  };
  const channelPie = {
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
  };
  const dayTabs = [{
    label: "全部游戏(121)",
    key: "all"
  }, {
    label: "我的游戏(0)",
    key: "mine"
  }, {
    label: "授权游戏(121)",
    key: "auth"
  }, {
    label: "接联运游戏(0)",
    key: "join"
  }, {
    label: "放联运游戏(0)",
    key: "out"
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
        }}>全局驾驶舱</span>
          <span style={{
          color: "#86909c",
          fontSize: 12
        }}>更新于 {NOW.split(" ")[1]}</span>
          <Tabs size="small" activeKey={gameTab} onChange={setGameTab} items={dayTabs} style={{
          marginBottom: 0
        }} />
          <Segmented size="small" options={DATE_OPTIONS} value={dateMode} onChange={setDateMode} />
          {canPkg && <Segmented size="small" options={[{
          label: "整包",
          value: "whole"
        }, {
          label: "分包",
          value: "sub"
        }]} value={pkg} onChange={setPkg} />}
          <Select size="small" style={{
          width: 130
        }} value={platform} onChange={setPlatform} options={[{
          value: "all",
          label: "全部平台"
        }, ...CHANNELS.map(c => ({
          value: c,
          label: c
        }))]} />
          <Tag color="blue">数据范围：{role.scope}</Tag>
          {real ? <Tag color="green">真实数据（注册/充值）· 最新 {real.latest}</Tag> : <Tag>演示数据</Tag>}
        </div>
      </Card>

      <Card size="small" title="项目数据报表" style={{
      marginBottom: 12
    }}>
        <div style={{
        color: "#86909c",
        fontSize: 12,
        marginBottom: 10
      }}>基础数据展示</div>
        <Row gutter={[12, 12]}>
          {CARDS.map(([name, vk, yk, k7, tip, money, mode]) => <Col xs={24} sm={12} lg={6} key={name}>
              <Tooltip title={tip}>
                <Card size="small">
                  <div style={{
                color: "#86909c",
                fontSize: 12
              }}>{name}</div>
                  <Statistic value={money ? fmtMoney(m[vk] * scale) : fmt(m[vk] * scale)} valueStyle={{
                fontSize: 22,
                fontWeight: 700
              }} />
                  <div style={{
                fontSize: 12,
                color: "#86909c",
                lineHeight: 1.8
              }}>
                    {mode === "month" ? <>
                        上月累计 ▼{money ? fmtMoney(m[yk] * scale) : fmt(m[yk] * scale)}
                        <span style={{
                    marginLeft: 8
                  }}>历史累计 {money ? fmtMoney(m[k7] * scale) : fmt(m[k7] * scale)}</span>
                      </> : <>
                        昨日周期 ▼{money ? fmtMoney(m[yk] * scale) : fmt(m[yk] * scale)}
                        {m[k7] != null && <span style={{
                    marginLeft: 8
                  }}>七日均值 {money ? fmtMoney(m[k7] * scale) : fmt(m[k7] * scale)}</span>}
                      </>}
                  </div>
                </Card>
              </Tooltip>
            </Col>)}
        </Row>
      </Card>

      <Row gutter={[12, 12]} style={{
      marginTop: 12
    }}>
        <Col xs={24} lg={12}>
          <Card size="small" title="付费金额排行" extra={<Tag>演示数据</Tag>}>
            <Chart option={payAmtBar} height={250} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card size="small" title="付费账号数排行(按游戏)" extra={<Tag>演示数据</Tag>}>
            <Chart option={payAcctBar} height={250} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card size="small" title="小组流水排行" extra={<Tag>{real ? "演示（小组映射未建）" : "演示数据"}</Tag>}>
            <Chart option={groupBar} height={250} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card size="small" title="渠道贡献排行 Top5" extra={<Tag>演示数据</Tag>}>
            <Chart option={channelPie} height={250} />
          </Card>
        </Col>
      </Row>

      <Card size="small" title="游戏数据排行 · 2026-08-05(三)" style={{
      marginTop: 12
    }} extra={<Space>
            <span style={{
        color: "#86909c",
        fontSize: 12
      }}>首行为汇总 · 13 列与 Web2.0 对齐</span>
            <Button size="small" onClick={exportMock}>导出</Button>
          </Space>}>
        <Table size="small" columns={rankColumns} dataSource={rows} pagination={false} scroll={{
        x: 1400
      }} summary={() => <Table.Summary.Row style={{
        background: "#fafafa",
        fontWeight: 600
      }}>
              <Table.Summary.Cell index={0} colSpan={3}>汇总</Table.Summary.Cell>
              <Table.Summary.Cell index={3} align="right">{sumKey(rows, "newAcct").toLocaleString()}</Table.Summary.Cell>
              <Table.Summary.Cell index={4} align="right">{sumKey(rows, "payNew").toLocaleString()}</Table.Summary.Cell>
              <Table.Summary.Cell index={5} align="right">{fmtMoney(sumKey(rows, "payNewAmt"))}</Table.Summary.Cell>
              <Table.Summary.Cell index={6} align="right">{fmtPct(sumKey(rows, "payNewAmt") / Math.max(sumKey(rows, "newAcct"), 1) / 100)}</Table.Summary.Cell>
              <Table.Summary.Cell index={7} align="right">{sumKey(rows, "active").toLocaleString()}</Table.Summary.Cell>
              <Table.Summary.Cell index={8} align="right">{sumKey(rows, "payAcct").toLocaleString()}</Table.Summary.Cell>
              <Table.Summary.Cell index={9} align="right">{fmtMoney(sumKey(rows, "payAmt"))}</Table.Summary.Cell>
              <Table.Summary.Cell index={10} align="right">{fmtPct(sumKey(rows, "payAcct") / Math.max(sumKey(rows, "active"), 1))}</Table.Summary.Cell>
              <Table.Summary.Cell index={11} align="right">{(sumKey(rows, "payAmt") / Math.max(sumKey(rows, "active"), 1)).toFixed(2)}</Table.Summary.Cell>
              <Table.Summary.Cell index={12} align="right">{(sumKey(rows, "payAmt") / Math.max(sumKey(rows, "payAcct"), 1)).toFixed(2)}</Table.Summary.Cell>
            </Table.Summary.Row>} />
      </Card>

      <Card size="small" title="基础数据报表" style={{
      marginTop: 12
    }} extra={<Space><Tag>按天 · 最近 30 天</Tag><Button size="small" onClick={exportMock}>导出</Button></Space>}>
        <Table size="small" columns={dayColumns} dataSource={days} scroll={{
        x: 1300
      }} pagination={{
        pageSize: 10,
        showSizeChanger: false
      }} />
      </Card>
    </div>;
}
