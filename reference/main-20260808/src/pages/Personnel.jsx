import React, { useState } from "react";
import { Card, Row, Col, Statistic, Table, Select, Tag } from "antd";
import { PERSONNEL } from "../data.js";
export default function PersonnelPage() {
  const [group, setGroup] = useState("all");
  const rows = PERSONNEL.filter(r => group === "all" || r.group === group);
  const groups = Array.from(new Set(PERSONNEL.map(r => r.group)));
  return <div>
      <Row gutter={[12, 12]}>
        <Col xs={12} lg={6}><Card size="small"><Statistic title="总人数" value={23} suffix="人" /></Card></Col>
        <Col xs={12} lg={6}><Card size="small"><Statistic title="在职" value={21} suffix="人" valueStyle={{
            color: "#00b42a"
          }} /></Card></Col>
        <Col xs={12} lg={6}><Card size="small"><Statistic title="离职" value={2} suffix="人" valueStyle={{
            color: "#86909c"
          }} /></Card></Col>
        <Col xs={12} lg={6}><Card size="small"><Statistic title="全部组" value={groups.length} suffix="个" /></Card></Col>
      </Row>
      <Card size="small" title="人员档案" style={{
      marginTop: 12
    }} extra={<Select size="small" style={{
      width: 140
    }} value={group} onChange={setGroup} options={[{
      value: "all",
      label: "全部组"
    }, ...groups.map(g => ({
      value: g,
      label: g
    }))]} />}>
        <Table size="small" rowKey="key" dataSource={rows} pagination={{
        pageSize: 15,
        showSizeChanger: false
      }} columns={[{
        title: "组名",
        dataIndex: "group"
      }, {
        title: "成员",
        dataIndex: "name"
      }, {
        title: "花名",
        dataIndex: "nickname"
      }, {
        title: "在职状态",
        dataIndex: "status",
        render: v => <Tag color={v === "在职" ? "green" : "default"}>{v}</Tag>
      }, {
        title: "团队",
        dataIndex: "team"
      }, {
        title: "入职时间",
        dataIndex: "join"
      }]} />
      </Card>
    </div>;
}
