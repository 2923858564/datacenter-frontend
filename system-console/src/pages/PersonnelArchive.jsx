import React from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  message,
} from "antd";
import { api } from "../api.js";

const EXPORT_COLUMNS = [
  { title: "组名", dataIndex: "group" },
  { title: "成员", dataIndex: "name" },
  { title: "花名", dataIndex: "alias" },
  { title: "在职状态", dataIndex: "status" },
  { title: "团队", dataIndex: "team" },
  { title: "入职时间", dataIndex: "joinDate" },
];

function formatJoinDate(value) {
  if (!value) return "-";
  if (typeof value === "number") {
    const date = new Date((value - 25569) * 86400 * 1000);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }
  return String(value).slice(0, 10);
}

function sortValue(value) {
  if (value == null || value === "--") return { empty: true, num: null, text: "" };
  const text = String(value).trim();
  if (!text) return { empty: true, num: null, text: "" };
  const cleaned = text.replace(/[¥￥,%\s]/g, "");
  if (/^[-+]?(?:\d+\.?\d*|\.\d+)$/.test(cleaned)) {
    const num = Number(cleaned);
    if (Number.isFinite(num)) return { empty: false, num, text };
  }
  return { empty: false, num: null, text };
}

function sortBy(key) {
  return (left, right) => {
    const a = sortValue(left?.[key]);
    const b = sortValue(right?.[key]);
    if (a.empty !== b.empty) return a.empty ? -1 : 1;
    if (a.num !== null && b.num !== null) return a.num - b.num;
    return (a.num === null ? a.text : String(a.num)).localeCompare(
      b.num === null ? b.text : String(b.num),
      "zh-CN",
      { numeric: true, sensitivity: "base" },
    );
  };
}

async function downloadExcel(rows) {
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Sheet1");
  const header = sheet.addRow(EXPORT_COLUMNS.map((column) => column.title));
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF409EFF" } };
  header.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
  header.alignment = { horizontal: "center" };
  header.height = 28;
  rows.forEach((row) => {
    sheet.addRow(EXPORT_COLUMNS.map((column) => {
      const value = row[column.dataIndex];
      return column.dataIndex === "joinDate" ? formatJoinDate(value) : value ?? "";
    }));
  });
  EXPORT_COLUMNS.forEach((column, index) => {
    let width = column.title.length;
    rows.forEach((row) => {
      const value = row[column.dataIndex];
      width = Math.max(width, String(value ?? "").length);
    });
    sheet.getColumn(index + 1).width = Math.min(Math.max(width * 2 + 4, 10), 40);
  });
  const buffer = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "人员档案.xlsx";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function displayError(error, fallback) {
  const text = error?.message || "";
  if (text === "无权限执行该操作" || /403|无权限/.test(text)) {
    return "403：无权访问人员档案，请联系管理员分配“人员档案”权限。";
  }
  return text || fallback;
}

export default function PersonnelArchive() {
  const [rows, setRows] = React.useState([]);
  const [keyword, setKeyword] = React.useState("");
  const [group, setGroup] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [loading, setLoading] = React.useState(true);
  const [loaded, setLoaded] = React.useState(false);
  const [loadError, setLoadError] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const [modal, setModal] = React.useState(null);
  const [form] = Form.useForm();

  const load = React.useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await api.personnelArchive();
      if (!Array.isArray(data)) throw new Error("人员档案接口返回格式异常，请重试。");
      setRows(data);
      setLoaded(true);
    } catch (error) {
      setLoadError(displayError(error, "人员档案加载失败，请重试。"));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const groups = React.useMemo(
    () => [...new Set(rows.map((row) => row.group).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-CN")),
    [rows],
  );
  const filtered = React.useMemo(
    () => rows.filter((row) =>
      (group === "all" || row.group === group) &&
      (status === "all" || row.status === status) &&
      (!keyword || (row.name || "").includes(keyword) || (row.alias || "").includes(keyword))),
    [rows, group, status, keyword],
  );

  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({ status: "在职" });
    setModal({ mode: "create" });
  };
  const openEdit = (row) => {
    form.setFieldsValue({ ...row, joinDate: row.joinDate || "" });
    setModal({ mode: "edit", row });
  };
  const closeModal = () => {
    if (!saving) setModal(null);
  };

  const submit = async (values) => {
    setSaving(true);
    try {
      const body = { ...values, joinDate: values.joinDate || null };
      if (modal.mode === "edit") {
        await api.updatePersonnelArchive(modal.row.id, body);
        message.success("人员档案已更新");
      } else {
        await api.createPersonnelArchive(body);
        message.success("人员档案已新增");
      }
      setModal(null);
      await load();
    } catch (error) {
      message.error(displayError(error, "保存失败，请重试。"));
    } finally {
      setSaving(false);
    }
  };

  const remove = (row) => {
    Modal.confirm({
      title: "确认删除人员档案？",
      content: "删除后该人员将不再参与人员主数据和业绩归属，请确认已核对。",
      okText: "删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: async () => {
        try {
          await api.deletePersonnelArchive(row.id);
          message.success("人员档案已删除");
          await load();
        } catch (error) {
          message.error(displayError(error, "删除失败，请重试。"));
          throw error;
        }
      },
    });
  };

  const exportRows = filtered.map((row) => ({ ...row, joinDate: formatJoinDate(row.joinDate) }));
  const exportData = async () => {
    setExporting(true);
    try {
      await downloadExcel(exportRows);
    } catch (error) {
      message.error(error?.message || "导出失败，请重试。");
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    { title: "组名", dataIndex: "group", key: "group", width: 100, sorter: sortBy("group"), render: (value) => value ? <Tag>{value}</Tag> : "-" },
    { title: "成员", dataIndex: "name", key: "name", width: 100, sorter: sortBy("name"), render: (value) => <span style={{ fontWeight: 500 }}>{value || "-"}</span> },
    { title: "职级", dataIndex: "rank", key: "rank", width: 70, sorter: sortBy("rank") },
    { title: "花名", dataIndex: "alias", key: "alias", width: 120, sorter: sortBy("alias"), render: (value) => value ? <span style={{ color: "#722ed1", fontWeight: 500 }}>{value}</span> : <span style={{ color: "#bfbfbf" }}>-</span> },
    { title: "在职状态", dataIndex: "status", key: "status", width: 90, sorter: sortBy("status"), render: (value) => <Tag color={value === "在职" ? "green" : "red"}>{value || "-"}</Tag> },
    { title: "团队", dataIndex: "team", key: "team", width: 105, sorter: sortBy("team"), render: (value) => value ? <Tag>{value}</Tag> : <span style={{ color: "#bfbfbf" }}>-</span> },
    { title: "入职时间", dataIndex: "joinDate", key: "joinDate", width: 110, sorter: sortBy("joinDate"), render: formatJoinDate },
    {
      title: "操作",
      key: "actions",
      fixed: "right",
      width: 130,
      render: (_, row) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => openEdit(row)}>编辑</Button>
          <Button type="link" danger size="small" onClick={() => remove(row)}>删除</Button>
        </Space>
      ),
    },
  ];

  if (!loaded && loading) {
    return <div style={{ display: "flex", justifyContent: "center", padding: 72 }}><Spin size="large" tip="正在加载人员档案" /></div>;
  }

  if (loadError) {
    return (
      <Alert
        type="error"
        showIcon
        message="人员档案加载失败"
        description={loadError}
        action={<Button size="small" onClick={load} loading={loading}>重试</Button>}
      />
    );
  }

  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }} wrap>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>人员档案</h2>
        <Button type="primary" onClick={openCreate}>新增人员</Button>
      </Space>
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}><Card><Statistic title="总人数" value={rows.length} suffix="人" /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card><Statistic title="在职" value={rows.filter((row) => row.status === "在职").length} suffix="人" /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card><Statistic title="离职" value={rows.filter((row) => row.status === "离职").length} suffix="人" /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card><Statistic title="小组数" value={groups.length} suffix="个" /></Card></Col>
      </Row>
      <Card styles={{ body: { padding: "16px 20px" } }}>
        <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 12 }} wrap>
          <Space wrap>
            <Input
              placeholder="搜索姓名/花名..."
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              value={group}
              onChange={setGroup}
              style={{ width: 110 }}
              options={[{ label: "全部组", value: "all" }, ...groups.map((value) => ({ label: value, value }))]}
            />
            <Select
              value={status}
              onChange={setStatus}
              style={{ width: 100 }}
              options={[
                { label: "全部状态", value: "all" },
                { label: "在职", value: "在职" },
                { label: "离职", value: "离职" },
              ]}
            />
          </Space>
          <Space wrap>
            <span style={{ color: "#86909c", fontSize: 12 }}>共 {filtered.length} 人</span>
            <Button title="导出 Excel（.xlsx）" disabled={loading} loading={exporting} onClick={exportData}>导出</Button>
          </Space>
        </Space>
        <Table
          size="small"
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 900 }}
          pagination={{
            defaultPageSize: 15,
            pageSizeOptions: [10, 15, 20, 50, 100],
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 人`,
          }}
        />
      </Card>
      <Modal
        title={modal?.mode === "edit" ? "编辑人员档案" : "新增人员档案"}
        open={Boolean(modal)}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={saving}
        destroyOnClose
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item label="姓名" name="name" rules={[{ required: true, message: "请输入姓名" }]}>
            <Input disabled={modal?.mode === "edit"} placeholder="请输入姓名" />
          </Form.Item>
          <Row gutter={16}>
            <Col flex="auto"><Form.Item label="组名" name="group" rules={[{ required: true, message: "请输入组名" }]}><Input placeholder="请输入组名" /></Form.Item></Col>
            <Col flex="150px"><Form.Item label="职级" name="rank"><Input placeholder="如 P5" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col flex="auto"><Form.Item label="花名" name="alias"><Input placeholder="可选" /></Form.Item></Col>
            <Col flex="150px"><Form.Item label="在职状态" name="status"><Select options={[{ label: "在职", value: "在职" }, { label: "离职", value: "离职" }]} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col flex="auto"><Form.Item label="团队" name="team"><Input placeholder="可选" /></Form.Item></Col>
            <Col flex="180px"><Form.Item label="入职时间" name="joinDate"><Input placeholder="YYYY-MM-DD" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
