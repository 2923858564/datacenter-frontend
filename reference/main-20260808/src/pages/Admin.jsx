import React, { useState } from "react";
import { Card, Table, Tag, Select, Space, Button, message, Statistic, Row, Col } from "antd";
import { ADMIN_ROLES, AUDIT_DATA } from "../data.js";
const ROLE_COLS = [{
  title: "角色",
  dataIndex: "name"
}, {
  title: "描述",
  dataIndex: "desc"
}, {
  title: "用户",
  dataIndex: "users",
  align: "right"
}];
const AUDIT_COLS = [{
  title: "时间",
  dataIndex: "time"
}, {
  title: "用户",
  dataIndex: "user"
}, {
  title: "操作",
  dataIndex: "action"
}, {
  title: "模块",
  dataIndex: "module"
}, {
  title: "操作详情",
  dataIndex: "detail"
}, {
  title: "IP地址",
  dataIndex: "ip"
}, {
  title: "结果",
  dataIndex: "result",
  render: v => <Tag color={v === "成功" ? "green" : "red"}>{v}</Tag>
}];
export default function AdminPage({
  page
}) {
  const [userFilter, setUserFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  if (page === "roles") {
    return <Card size="small" title="角色权限配置" extra={<Space><Tag>演示数据</Tag><Button size="small" type="primary" onClick={() => message.info("新建角色为演示交互")}>新建</Button></Space>}>
        <div style={{
        fontWeight: 600,
        marginBottom: 8
      }}>角色列表</div>
        <Table size="small" columns={ROLE_COLS} dataSource={ADMIN_ROLES} pagination={false} rowKey="key" />
        <div style={{
        color: "#86909c",
        fontSize: 12,
        marginTop: 10
      }}>选择左侧角色以配置权限</div>
      </Card>;
  }
  if (page === "audit") {
    const data = AUDIT_DATA.filter(r => (userFilter === "all" || r.user.includes(userFilter)) && (actionFilter === "all" || r.action === actionFilter) && (moduleFilter === "all" || r.module === moduleFilter));
    const users = Array.from(new Set(AUDIT_DATA.map(r => r.user)));
    const actions = Array.from(new Set(AUDIT_DATA.map(r => r.action)));
    const modules = Array.from(new Set(AUDIT_DATA.map(r => r.module)));
    return <div>
        <Row gutter={[12, 12]}>
          <Col xs={12} lg={6}><Card size="small"><Statistic title="今日操作" value={25} suffix="条" /></Card></Col>
          <Col xs={12} lg={6}><Card size="small"><Statistic title="成功" value={22} suffix="条" valueStyle={{
              color: "#00b42a"
            }} /></Card></Col>
          <Col xs={12} lg={6}><Card size="small"><Statistic title="失败" value={2} suffix="条" valueStyle={{
              color: "#f53f3f"
            }} /></Card></Col>
          <Col xs={12} lg={6}><Card size="small"><Statistic title="活跃用户" value={19} suffix="人" /></Card></Col>
        </Row>
        <Card size="small" title="日志审计中心" style={{
        marginTop: 12
      }} extra={<Tag>记录谁、何时、看了什么；重点记录新增/删除/修改</Tag>}>
          <Space style={{
          marginBottom: 12
        }} wrap>
            <Select size="small" style={{
            width: 180
          }} value={userFilter} onChange={setUserFilter} options={[{
            value: "all",
            label: "全部用户"
          }, ...users.map(u => ({
            value: u,
            label: u
          }))]} />
            <Select size="small" style={{
            width: 140
          }} value={actionFilter} onChange={setActionFilter} options={[{
            value: "all",
            label: "全部操作"
          }, ...actions.map(a => ({
            value: a,
            label: a
          }))]} />
            <Select size="small" style={{
            width: 150
          }} value={moduleFilter} onChange={setModuleFilter} options={[{
            value: "all",
            label: "全部模块"
          }, ...modules.map(m => ({
            value: m,
            label: m
          }))]} />
            <span style={{
            color: "#86909c",
            fontSize: 12
          }}>共 {data.length} 条记录</span>
          </Space>
          <Table size="small" columns={AUDIT_COLS} dataSource={data} pagination={{
          pageSize: 15
        }} rowKey="key" scroll={{
          x: 1100
        }} />
        </Card>
      </div>;
  }
  return <Card size="small">
      <div style={{
      textAlign: "center",
      padding: "40px 0",
      color: "#86909c"
    }}>
        <div style={{
        fontWeight: 600,
        fontSize: 15,
        color: "#1f2329",
        marginBottom: 6
      }}>用户 & 权限管理</div>
        用户列表、RBAC 角色权限配置将在后续版本实现
      </div>
    </Card>;
}
