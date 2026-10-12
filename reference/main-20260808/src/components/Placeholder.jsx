import React from "react";
import { Empty, Tag } from "antd";
export default function Placeholder({
  title,
  desc
}) {
  return <div style={{
    background: "#fff",
    borderRadius: 8,
    padding: "48px 20px",
    textAlign: "center",
    border: "1px dashed #d9d9d9"
  }}>
      <Empty description={null} />
      <div style={{
      fontWeight: 600,
      fontSize: 15,
      marginBottom: 6
    }}>{title}</div>
      <div style={{
      color: "#86909c",
      marginBottom: 10
    }}>{desc}</div>
      <Tag color="blue">规划中 · 二期</Tag>
    </div>;
}
