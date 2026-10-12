import React, { useMemo } from "react";
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, message } from "antd";
import Chart from "../components/Chart.jsx";
import { PRODUCTS, CHANNEL_DETAIL, CHANNEL_REVENUE, CONTRACTS } from "../data.js";
const exportMock = () => message.info("导出为演示交互，接入真实数据后可用（Excel/CSV）");
function StatRow({
  items
}) {
  return <Row gutter={[12, 12]}>
      {items.map(it => <Col xs={12} lg={6} key={it.title}>
          <Card size="small">
            <Statistic title={it.title} value={it.value} suffix={it.suffix || ""} valueStyle={it.color ? {
          color: it.color
        } : undefined} />
          </Card>
        </Col>)}
    </Row>;
}
export default function ChannelPage({
  page
}) {
  const pcols = useMemo(() => PRODUCTS, []);
  if (page === "products") {
    return <div>
        <StatRow items={[{
        title: "产品总数",
        value: 6,
        suffix: "个"
      }, {
        title: "已引入",
        value: 3,
        suffix: "个"
      }, {
        title: "S/A 级产品",
        value: 4,
        suffix: "个"
      }, {
        title: "平均分成点位",
        value: 30.0,
        suffix: "%"
      }]} />
        <Card size="small" title="产品列表" style={{
        marginTop: 12
      }} extra={<Space><span style={{
          color: "#86909c",
          fontSize: 12
        }}>产品库管理 · 商务引入评估</span><Button size="small" onClick={exportMock}>导出</Button></Space>}>
          <Table size="small" rowKey="key" dataSource={pcols} pagination={false} scroll={{
          x: 1100
        }} columns={[{
          title: "渠道",
          dataIndex: "channel"
        }, {
          title: "产品名称",
          dataIndex: "name"
        }, {
          title: "版号名称",
          dataIndex: "version"
        }, {
          title: "版本类型",
          dataIndex: "type",
          render: v => v.map(t => <Tag key={t} style={{
            marginRight: 4
          }}>{t}</Tag>)
        }, {
          title: "合作方",
          dataIndex: "partner"
        }, {
          title: "联系人",
          dataIndex: "contact"
        }, {
          title: "分成点位",
          dataIndex: "point"
        }, {
          title: "引入状态",
          dataIndex: "status",
          render: v => <Tag color={v === "已引入" ? "green" : v === "测试中" ? "orange" : "blue"}>{v}</Tag>
        }, {
          title: "商务推荐值",
          dataIndex: "score",
          render: v => {
            const [g, sc] = v.split(" ");
            return <><Tag color={g === "S" ? "gold" : g === "A" ? "green" : g === "B" ? "blue" : "default"}>{g}</Tag> <span style={{
                color: "#86909c"
              }}>{sc}</span></>;
          }
        }]} />
        </Card>
      </div>;
  }
  if (page === "channel-detail") {
    return <div>
        <StatRow items={[{
        title: "渠道总数",
        value: 28,
        suffix: "个"
      }, {
        title: "优质渠道",
        value: 18,
        suffix: "个"
      }, {
        title: "风险渠道",
        value: 2,
        suffix: "个",
        color: "#f53f3f"
      }]} />
        <Card size="small" title="渠道列表" style={{
        marginTop: 12
      }} extra={<Tag>演示数据 · 结算/毛利口径待确认</Tag>}>
          <Table size="small" rowKey="key" dataSource={CHANNEL_DETAIL} pagination={false} columns={[{
          title: "渠道",
          dataIndex: "channel"
        }, {
          title: "项目",
          dataIndex: "project"
        }, {
          title: "月注册",
          dataIndex: "reg",
          align: "right",
          render: v => v.toLocaleString()
        }, {
          title: "月流水(万)",
          dataIndex: "flow",
          align: "right"
        }, {
          title: "ROI",
          dataIndex: "roi",
          align: "right",
          render: v => v == null ? "--" : v.toFixed(1)
        }, {
          title: "状态",
          dataIndex: "status",
          render: v => <Tag color={v === "优质" ? "green" : "blue"}>{v}</Tag>
        }]} />
        </Card>
        <Card size="small" title="渠道流水对比" style={{
        marginTop: 12
      }} extra={<Tag>演示数据</Tag>}>
          <Chart option={{
          tooltip: {},
          grid: {
            left: 60,
            right: 20,
            top: 30,
            bottom: 30
          },
          xAxis: {
            type: "category",
            data: CHANNEL_DETAIL.map(r => r.channel)
          },
          yAxis: {
            type: "value"
          },
          series: [{
            type: "bar",
            data: CHANNEL_DETAIL.map(r => r.flow),
            itemStyle: {
              color: "#1677ff"
            }
          }]
        }} height={250} />
        </Card>
      </div>;
  }
  if (page === "channel-revenue") {
    return <div>
        <StatRow items={[{
        title: "月总流水",
        value: 1090,
        suffix: "万 (+8%)"
      }, {
        title: "月总成本",
        value: 640,
        suffix: "万"
      }, {
        title: "月净利润",
        value: 450,
        suffix: "万 (+12%)"
      }, {
        title: "待结算",
        value: 3,
        suffix: "笔"
      }]} />
        <Card size="small" title="收益趋势" style={{
        marginTop: 12
      }} extra={<Tag>演示数据 · 财务口径待定稿</Tag>}>
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
            data: ["2月", "3月", "4月", "5月", "6月", "7月"]
          },
          yAxis: {
            type: "value"
          },
          series: [{
            name: "流水",
            type: "line",
            data: [820, 860, 910, 960, 1030, 1090]
          }, {
            name: "成本",
            type: "line",
            data: [520, 540, 570, 590, 620, 640]
          }]
        }} height={250} />
        </Card>
        <Card size="small" title="渠道收益明细" style={{
        marginTop: 12
      }} extra={<Tag>演示数据</Tag>}>
          <Table size="small" rowKey="key" dataSource={CHANNEL_REVENUE} pagination={false} columns={[{
          title: "渠道",
          dataIndex: "channel"
        }, {
          title: "月份",
          dataIndex: "month"
        }, {
          title: "流水(万)",
          dataIndex: "flow",
          align: "right"
        }, {
          title: "成本(万)",
          dataIndex: "cost",
          align: "right"
        }, {
          title: "利润(万)",
          dataIndex: "profit",
          align: "right",
          render: v => "¥" + v + "万"
        }, {
          title: "状态",
          dataIndex: "status",
          render: v => <Tag color={v === "已结算" ? "green" : v === "待结算" ? "orange" : "red"}>{v}</Tag>
        }]} />
        </Card>
      </div>;
  }
  if (page === "channel-contract") {
    return <div>
        <StatRow items={[{
        title: "合同总数",
        value: 28,
        suffix: "份"
      }, {
        title: "生效中",
        value: 22,
        suffix: "份"
      }, {
        title: "即将到期",
        value: 3,
        suffix: "份",
        color: "#ff7d00"
      }, {
        title: "已过期",
        value: 3,
        suffix: "份",
        color: "#f53f3f"
      }]} />
        <Card size="small" title="合同列表" style={{
        marginTop: 12
      }} extra={<Space><span style={{
          color: "#86909c",
          fontSize: 12
        }}>渠道合同管理与到期追踪</span><Button size="small" type="primary" onClick={() => message.info("新增合同为演示交互")}>新增合同</Button></Space>}>
          <Table size="small" rowKey="key" dataSource={CONTRACTS} pagination={false} columns={[{
          title: "渠道",
          dataIndex: "channel"
        }, {
          title: "合同编号",
          dataIndex: "no"
        }, {
          title: "签署日期",
          dataIndex: "sign"
        }, {
          title: "到期日期",
          dataIndex: "due"
        }, {
          title: "金额(万)",
          dataIndex: "amount",
          align: "right"
        }, {
          title: "状态",
          dataIndex: "status",
          render: v => <Tag color={v === "生效中" ? "green" : v === "即将到期" ? "orange" : "red"}>{v}</Tag>
        }, {
          title: "操作",
          render: () => <a onClick={() => message.info("查看合同详情为演示交互")}>查看</a>
        }]} />
        </Card>
      </div>;
  }
  return null;
}
