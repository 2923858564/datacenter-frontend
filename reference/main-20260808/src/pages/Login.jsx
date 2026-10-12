import React, { useState } from "react";
import { Button, Card, Form, Input, Alert, Typography } from "antd";
import { useProto } from "../store.jsx";
const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
export default function Login() {
  const {
    login
  } = useProto();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const onFinish = async values => {
    setLoading(true);
    setError("");
    try {
      await login(values.username, values.password);
    } catch (e) {
      setError(e.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };
  return <div className="login-wrap">
      <Card className="login-card">
        <div className="login-head">
          <img src="./logo.png" alt="logo" style={{
          height: 42
        }} />
          <Typography.Title level={4} style={{
          margin: "10px 0 2px"
        }}>
            聚玩经营数据中台
          </Typography.Title>
          <Typography.Text type="secondary">登录后按角色权限访问对应看板</Typography.Text>
        </div>
        {error && <Alert type="error" showIcon message={error} style={{
        marginBottom: 12
      }} />}
        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item name="username" label="账号" rules={[{
          required: true,
          message: "请输入登录账号"
        }]}>
            <Input size="large" placeholder="登录账号" autoFocus />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{
          required: true,
          message: "请输入密码"
        }]}>
            <Input.Password size="large" placeholder="密码" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={loading}>
            登 录
          </Button>
        </Form>
        {isLocal && <div className="login-hint">
            本地演示账号：admin / admin123（系统管理员）、kefu01 / Juwan@123（客服）
          </div>}
      </Card>
    </div>;
}
