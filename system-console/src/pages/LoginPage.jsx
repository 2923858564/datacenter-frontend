import React, { useState } from "react";
import { Button, Form, Input } from "antd";
import { useProto } from "../store.jsx";
import "./LoginPage.css";

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.2 20v-1.2a6.8 6.8 0 0 1 13.6 0V20z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="4.7" y="10" width="14.6" height="10" rx="1.8" />
      <path d="M8 10V7.2a4 4 0 0 1 8 0V10M12 14v2.4" />
      <circle cx="12" cy="14" r=".65" />
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useProto();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onFinish = async (values) => {
    setLoading(true);
    setError("");
    try {
      await login(values.username, values.password);
      location.href = "/";
    } catch (e) {
      setError(e.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <header className="login-brand" aria-label="聚玩经营数据中台">
        <img src="/login-art/juwan-c2.png" alt="聚玩" />
        <span className="login-brand-divider" aria-hidden="true" />
        <span className="login-brand-name">经营数据中台</span>
      </header>

      <div className="login-content">
        <section className="login-intro" aria-labelledby="login-product-title">
          <h1 id="login-product-title">聚玩经营数据中台</h1>
          <p>数据驱动经营 · 智能赋能决策</p>
        </section>

        <section className="login-card" aria-labelledby="login-title">
          <h2 id="login-title">账号登录</h2>
          <p className="login-card-caption">账号由管理员创建并分配</p>

          {error && <div className="login-error" role="alert">{error}</div>}

          <Form form={form} layout="vertical" size="large" onFinish={onFinish}>
            <Form.Item name="username" rules={[{ required: true, message: "请输入账号" }]}>
              <Input
                className="login-input"
                prefix={<AccountIcon />}
                placeholder="请输入账号"
                autoComplete="username"
              />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: "请输入密码" }]}>
              <Input.Password
                className="login-input"
                prefix={<LockIcon />}
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </Form.Item>
            <Form.Item className="login-submit-item">
              <Button type="primary" htmlType="submit" block loading={loading}>
                登录
              </Button>
            </Form.Item>
          </Form>

          <p className="login-help">没有账号？请联系系统管理员申请开通</p>
        </section>
      </div>

      <footer className="login-footer">
        <span aria-hidden="true" />
        <span>聚玩经营数据中台</span>
        <span aria-hidden="true" />
      </footer>
    </main>
  );
}
