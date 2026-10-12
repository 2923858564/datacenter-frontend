import React, { useMemo } from "react";
import { Card, Row, Col, Statistic, Table, Tag } from "antd";
import Chart from "../components/Chart.jsx";
import { GAMES, fmtMoney } from "../data.js";
function seeded(seed) {
  let s = seed >>> 0;
  return function () {
    s = s * 1664525 + 1013904223 >>> 0;
    return s / 4294967296;
  };
}
export default function FinancePage() {
  const rows = useMemo(() => {
    const rnd = seeded(20260805);
    return GAMES.slice(0, 6).map(g => {
      const s = 0.8 + rnd() * 0.4;
      return {
        key: g.id,
        name: g.name,
        flow: Math.round(800000 * s),
        cost: Math.round(560000 * s),
        roi: 1.2 + rnd() * 0.8
      };
    }).sort((a, b) => b.roi - a.roi);
  }, []);
  const cols = [{
    title: "价值排名",
    render: (_, __, i) => i + 1,
    width: 70
  }, {
    title: "项目",
    dataIndex: "name"
  }, {
    title: "累计流水",
    dataIndex: "flow",
    align: "right",
    render: v => fmtMoney(v)
  }, {
    title: "累计成本",
    dataIndex: "cost",
    align: "right",
    render: v => fmtMoney(v)
  }, {
    title: "ROI",
    dataIndex: "roi",
    align: "right",
    render: v => v == null ? "--" : v.toFixed(2)
  }, {
    title: "建议",
    render: (_, r) => r.roi > 1.8 ? <span style={{
      color: "#00b42a"
    }}>倾斜资源 ↑</span> : r.roi < 1.2 ? <span style={{
      color: "#f53f3f"
    }}>关注 ↓</span> : "持平"
  }];
  return <div>
      <Card size="small" style={{
      marginBottom: 12
    }}>
        <span style={{
        fontSize: 13
      }}>财务定位（郭总）：<b>评估产品价值，给决策层提供资源倾斜思路</b>；公式后续给出，本期仅展示结构。</span>
      </Card>
      <Card size="small" title="成本 & 财务收益" style={{
      marginBottom: 12
    }}>
        <Row gutter={[12, 12]}>
          <Col xs={12} lg={6}><Statistic title="总营收" value={7200} suffix="万 · +12% 同比" /></Col>
          <Col xs={12} lg={6}><Statistic title="总成本" value={5500} suffix="万 · +8%" /></Col>
          <Col xs={12} lg={6}><Statistic title="净利润" value={1700} suffix="万 · +15%" /></Col>
          <Col xs={12} lg={6}><Statistic title="ROI" value={2.18} precision={2} /></Col>
        </Row>
      </Card>
      <Card size="small" title="按项目 ROI / 产品价值" style={{
      marginTop: 12
    }} extra={<Tag>演示数据 · 口径待财务定稿</Tag>}>
        <Table size="small" columns={cols} dataSource={rows} pagination={false} />
      </Card>
      <Row gutter={[12, 12]} style={{
      marginTop: 12
    }}>
        <Col xs={24} lg={12}>
          <Card size="small" title="营收 & 成本趋势" extra={<Tag>演示数据</Tag>}>
            <Chart option={{
            tooltip: {
              trigger: "axis"
            },
            legend: {
              top: 0
            },
            grid: {
              left: 60,
              right: 20,
              top: 34,
              bottom: 30
            },
            xAxis: {
              type: "category",
              data: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月"]
            },
            yAxis: {
              type: "value"
            },
            series: [{
              name: "营收",
              type: "line",
              data: [420, 460, 510, 560, 610, 660, 690, 720]
            }, {
              name: "成本",
              type: "line",
              data: [330, 350, 380, 420, 450, 500, 520, 550]
            }]
          }} height={260} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card size="small" title="成本结构" extra={<Tag>演示数据</Tag>}>
            <Chart option={{
            tooltip: {
              trigger: "item"
            },
            series: [{
              type: "pie",
              radius: ["40%", "65%"],
              data: [{
                name: "渠道分成",
                value: 45
              }, {
                name: "投放成本",
                value: 25
              }, {
                name: "人力",
                value: 18
              }, {
                name: "服务器",
                value: 12
              }]
            }]
          }} height={260} />
          </Card>
        </Col>
      </Row>
    </div>;
}
