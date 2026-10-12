import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert, AutoComplete, Button, Card, Empty, Form, Input, InputNumber, Modal, Popconfirm, Segmented, Select,
  Space, Spin, Tag, Typography, message,
} from "antd";
import { api } from "../api.js";

const { Text, Title } = Typography;
const TYPE_OPTIONS = [
  { value: "juwan", label: "聚玩" },
  { value: "channel", label: "渠道" },
];

function FilterList({
  items, selectedId, onSelect, renderMeta, onEdit, onDelete, onModeChange,
  modeSavingId, emptyText,
}) {
  if (!items.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />;
  return (
    <div style={{ overflow: "auto", maxHeight: "calc(100vh - 300px)", paddingRight: 4 }}>
      {items.map((item) => {
        const label = item.short_name || item.project || item.account;
        const itemType = item.short_name ? "渠道" : item.project ? "项目" : "账号";
        const active = item.id === selectedId;
        return (
          <div
            key={item.id}
            onClick={() => onSelect(item.id)}
            style={{
              padding: "9px 10px", marginBottom: 6, borderRadius: 8, cursor: "pointer",
              border: `1px solid ${active ? "#91caff" : "#f0f0f0"}`,
              background: active ? "#e6f4ff" : "#fff",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: active ? 600 : 400, overflowWrap: "anywhere" }}>{label}</div>
                <div style={{ color: "#86909c", fontSize: 12, marginTop: 4 }}>{renderMeta(item)}</div>
              </div>
              <Space wrap size={0} onClick={(event) => event.stopPropagation()}>
                {item.project && onModeChange && (
                  <Segmented
                    size="small"
                    options={[{ value: "full", label: "整包" }, { value: "split", label: "分包" }]}
                    value={item.package_mode || "full"}
                    disabled={modeSavingId === item.id}
                    onChange={(mode) => onModeChange(item, mode)}
                  />
                )}
                <Button type="link" size="small" onClick={() => onEdit(item)}>编辑</Button>
                <Popconfirm
                  title={`确定删除${itemType}“${label}”？`}
                  description={item.short_name ? "渠道下的项目、账号和包体配置将一并移除。" : item.project ? "项目下的账号将一并从配置页移除。" : undefined}
                  onConfirm={() => onDelete(item)}
                >
                  <Button type="link" size="small" danger>删除</Button>
                </Popconfirm>
              </Space>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function PackageConfig() {
  const [scopeType, setScopeType] = useState("juwan");
  const [channels, setChannels] = useState([]);
  const [channelSearch, setChannelSearch] = useState("");
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [channelLoading, setChannelLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalResults, setGlobalResults] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [modeSavingId, setModeSavingId] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [packageOptions, setPackageOptions] = useState([]);
  const [accountSearch, setAccountSearch] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [accountLoading, setAccountLoading] = useState(false);
  const [draftPackages, setDraftPackages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [peopleOptions, setPeopleOptions] = useState([]);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectEditing, setProjectEditing] = useState(null);
  const [projectSaving, setProjectSaving] = useState(false);
  const [projectPackages, setProjectPackages] = useState([]);
  const [projectCatalogOptions, setProjectCatalogOptions] = useState([]);
  const [packageCatalogOptions, setPackageCatalogOptions] = useState([]);
  const [packageLoading, setPackageLoading] = useState(false);
  const [projectForm] = Form.useForm();
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [packageEditing, setPackageEditing] = useState(null);
  const [packageSaving, setPackageSaving] = useState(false);
  const [packageForm] = Form.useForm();
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountEditing, setAccountEditing] = useState(null);
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountForm] = Form.useForm();
  const [channelModalOpen, setChannelModalOpen] = useState(false);
  const [channelEditing, setChannelEditing] = useState(null);
  const [channelSaving, setChannelSaving] = useState(false);
  const [channelForm] = Form.useForm();
  const contextRef = useRef(null);
  contextRef.current = { scopeType, selectedChannelId, selectedProjectId, selectedAccountId };
  const channelRequestRef = useRef(0);
  const projectRequestRef = useRef(0);
  const accountRequestRef = useRef(0);
  const packageRequestRef = useRef(0);
  const catalogRequestRef = useRef(0);

  useEffect(() => () => {
    channelRequestRef.current += 1;
    projectRequestRef.current += 1;
    accountRequestRef.current += 1;
    packageRequestRef.current += 1;
    catalogRequestRef.current += 1;
  }, []);

  const selectedChannel = channels.find((item) => item.id === selectedChannelId);
  const selectedProject = projects.find((item) => item.id === selectedProjectId);
  const currentAccount = accounts.find((item) => item.id === selectedAccountId);

  const loadChannels = async (preferredId = null) => {
    const requestId = ++channelRequestRef.current;
    setChannelLoading(true);
    try {
      const rows = await api.packageConfigChannels();
      if (requestId !== channelRequestRef.current || contextRef.current.scopeType !== "channel") return;
      setChannels(rows);
      const nextId = rows.some((row) => row.id === preferredId) ? preferredId : rows[0]?.id ?? null;
      setSelectedChannelId(nextId);
    } catch (e) {
      if (requestId === channelRequestRef.current && contextRef.current.scopeType === "channel") message.error(e.message);
    } finally {
      if (requestId === channelRequestRef.current) setChannelLoading(false);
    }
  };

  const loadProjects = async (preferredId = null, channelId = selectedChannelId) => {
    if (scopeType !== contextRef.current.scopeType ||
      (scopeType === "channel" && channelId !== contextRef.current.selectedChannelId)) return;
    const requestId = ++projectRequestRef.current;
    const isCurrent = () => requestId === projectRequestRef.current && scopeType === contextRef.current.scopeType &&
      (scopeType !== "channel" || channelId === contextRef.current.selectedChannelId);
    setProjectLoading(true);
    try {
      const rows = scopeType === "channel"
        ? (channelId ? await api.packageConfigChannelProjects(channelId) : [])
        : await api.packageConfigProjects(scopeType);
      if (!isCurrent()) return;
      setProjects(rows);
      const nextId = rows.some((row) => row.id === preferredId) ? preferredId : rows[0]?.id ?? null;
      setSelectedProjectId(nextId);
    } catch (e) {
      if (isCurrent()) message.error(e.message);
    } finally {
      if (isCurrent()) setProjectLoading(false);
    }
  };

  useEffect(() => {
    api.packageConfigPeople()
      .then((rows) => setPeopleOptions(rows.map((value) => ({ value, label: value }))))
      .catch((e) => message.error(e.message));
  }, []);

  useEffect(() => {
    channelRequestRef.current += 1;
    projectRequestRef.current += 1;
    accountRequestRef.current += 1;
    setSelectedChannelId(null);
    setSelectedProjectId(null);
    setSelectedAccountId(null);
    setAccounts([]);
    setProjects([]);
    setPackageOptions([]);
    setDraftPackages([]);
    setChannelSearch("");
    setProjectSearch("");
    setAccountSearch("");
    if (scopeType === "channel") loadChannels();
    else loadProjects();
  }, [scopeType]);

  useEffect(() => {
    if (scopeType !== "channel") return;
    projectRequestRef.current += 1;
    accountRequestRef.current += 1;
    setSelectedProjectId(null);
    setSelectedAccountId(null);
    setAccounts([]);
    setProjects([]);
    setPackageOptions([]);
    loadProjects(null, selectedChannelId);
  }, [selectedChannelId, scopeType]);

  useEffect(() => {
    const keyword = globalSearch.trim();
    if (!keyword) {
      setGlobalResults([]);
      setGlobalLoading(false);
      return undefined;
    }
    let active = true;
    setGlobalLoading(true);
    const timer = window.setTimeout(() => {
      const request = scopeType === "channel"
        ? api.searchPackageConfigChannels(keyword)
        : api.searchPackageConfig(scopeType, keyword);
      request
        .then((rows) => {
          if (!active) return;
          setGlobalResults(rows);
          const first = rows.find((row) => row.account_id) || rows[0];
          if (scopeType === "channel") setSelectedChannelId(first?.channel_id ?? null);
          setSelectedProjectId(first?.project_id ?? null);
        })
        .catch((e) => active && message.error(e.message))
        .finally(() => active && setGlobalLoading(false));
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [globalSearch, scopeType]);

  useEffect(() => {
    const requestId = ++accountRequestRef.current;
    let active = true;
    if (!selectedProjectId) {
      setAccounts([]);
      setPackageOptions([]);
      setAccountLoading(false);
      setSelectedAccountId(null);
      return;
    }
    setAccountLoading(true);
    setAccounts([]);
    setPackageOptions([]);
    setSelectedAccountId(null);
    const request = scopeType === "channel"
      ? api.packageConfigChannelAccounts(selectedProjectId)
      : api.packageConfigAccounts(selectedProjectId);
    request
      .then((data) => {
        if (!active || requestId !== accountRequestRef.current) return;
        setAccounts(data.accounts);
        setPackageOptions(data.package_options.map((value) => ({ value, label: value })));
        setSelectedAccountId(data.accounts[0]?.id ?? null);
      })
      .catch((e) => active && requestId === accountRequestRef.current && message.error(e.message))
      .finally(() => active && requestId === accountRequestRef.current && setAccountLoading(false));
    return () => { active = false; };
  }, [selectedProjectId, scopeType]);

  useEffect(() => {
    setDraftPackages(currentAccount?.packages || []);
  }, [currentAccount]);

  useEffect(() => {
    if (!globalSearch.trim()) return;
    const target = globalResults.find((row) =>
      row.project_id === selectedProjectId && row.account_id &&
      accounts.some((account) => account.id === row.account_id)
    );
    if (target) setSelectedAccountId(target.account_id);
  }, [accounts, globalResults, globalSearch, selectedProjectId]);

  useEffect(() => {
    if (scopeType !== "channel" || !globalSearch.trim()) return;
    const target = globalResults.find((row) =>
      row.channel_id === selectedChannelId && row.project_id &&
      projects.some((project) => project.id === row.project_id)
    );
    if (target) setSelectedProjectId(target.project_id);
  }, [projects, globalResults, globalSearch, selectedChannelId, scopeType]);

  const filteredChannels = useMemo(() => {
    const globalKeyword = globalSearch.trim();
    const globalChannelIds = new Set(globalResults.map((row) => row.channel_id));
    const globallyMatched = globalKeyword
      ? channels.filter((item) => globalChannelIds.has(item.id))
      : channels;
    const keyword = channelSearch.trim().toLowerCase();
    return keyword ? globallyMatched.filter((item) =>
      item.short_name.toLowerCase().includes(keyword) || item.company_name.toLowerCase().includes(keyword)
    ) : globallyMatched;
  }, [channels, channelSearch, globalSearch, globalResults]);

  const filteredProjects = useMemo(() => {
    const globalKeyword = globalSearch.trim();
    const globalProjectIds = new Set(globalResults
      .filter((row) => scopeType !== "channel" || row.channel_id === selectedChannelId)
      .map((row) => row.project_id));
    const globallyMatched = globalKeyword
      ? projects.filter((item) => globalProjectIds.has(item.id))
      : projects;
    const keyword = projectSearch.trim().toLowerCase();
    return keyword
      ? globallyMatched.filter((item) => item.project.toLowerCase().includes(keyword))
      : globallyMatched;
  }, [projects, projectSearch, globalSearch, globalResults, selectedChannelId, scopeType]);

  const filteredAccounts = useMemo(() => {
    const globalKeyword = globalSearch.trim();
    const globalAccountIds = new Set(globalResults
      .filter((row) => row.project_id === selectedProjectId && row.account_id)
      .map((row) => row.account_id));
    const wholeProjectMatched = projects.some((item) => item.id === selectedProjectId &&
      item.project.toLowerCase().includes(globalKeyword.toLowerCase())) ||
      globalResults.some((row) => row.project_id === selectedProjectId && !row.account_id);
    const globallyMatched = globalKeyword
      ? accounts.filter((item) => wholeProjectMatched || globalAccountIds.has(item.id))
      : accounts;
    const keyword = accountSearch.trim().toLowerCase();
    return keyword ? globallyMatched.filter((item) =>
      item.account.toLowerCase().includes(keyword) || (item.promoter_name || "").toLowerCase().includes(keyword)
    ) : globallyMatched;
  }, [accounts, accountSearch, globalSearch, globalResults, selectedProjectId, projects]);

  const changed = currentAccount && JSON.stringify([...draftPackages].sort()) !==
    JSON.stringify([...(currentAccount.packages || [])].sort());

  const loadProjectPackages = async (projectId) => {
    const requestId = ++packageRequestRef.current;
    if (!projectId) {
      setProjectPackages([]);
      setPackageLoading(false);
      return;
    }
    setProjectPackages([]);
    setPackageLoading(true);
    try {
      const rows = scopeType === "channel"
        ? await api.packageConfigChannelPackages(projectId)
        : await api.packageConfigPackages(projectId);
      if (requestId === packageRequestRef.current) setProjectPackages(rows);
    } catch (e) {
      if (requestId === packageRequestRef.current) message.error(e.message);
    } finally {
      if (requestId === packageRequestRef.current) setPackageLoading(false);
    }
  };

  const searchProjectCatalog = async (keyword) => {
    const requestId = ++catalogRequestRef.current;
    try {
      const rows = await api.packageConfigProjectCatalog(keyword);
      if (requestId === catalogRequestRef.current) setProjectCatalogOptions(rows.map((item) => ({
        value: item.name, label: `${item.name} · ${item.source_label}`,
      })));
    } catch (e) {
      if (requestId === catalogRequestRef.current) message.error(e.message);
    }
  };

  const openProjectModal = (project = null) => {
    setProjectEditing(project);
    projectForm.setFieldsValue({
      name: project?.project || "",
      cube_project_name: project?.cube_project_name || "",
      direction: project?.direction || "IN",
      point_ratio: project?.point_ratio == null
        ? (project?.settlement_point == null ? undefined : project.settlement_point * 100)
        : project.point_ratio * 100,
      point_diff: project?.point_diff == null ? undefined : project.point_diff * 100,
    });
    loadProjectPackages(project?.id);
    searchProjectCatalog("");
    setProjectModalOpen(true);
  };

  const saveProject = async () => {
    const values = await projectForm.validateFields();
    setProjectSaving(true);
    try {
      const channelBody = {
        name: values.name,
        channel_id: selectedChannelId,
        direction: values.direction,
        point_ratio: values.point_ratio / 100,
        point_diff: values.point_diff == null ? null : values.point_diff / 100,
        packages: projectPackages.map((item) => item.name),
      };
      const saved = scopeType === "channel"
        ? (projectEditing
          ? await api.updatePackageChannelProject(projectEditing.id, channelBody)
          : await api.createPackageChannelProject(channelBody))
        : (projectEditing
          ? await api.updatePackageProject(projectEditing.id, {
              name: values.name, scope_type: scopeType,
              cube_project_name: values.cube_project_name || "",
            })
          : await api.createPackageProject({
              name: values.name, scope_type: scopeType,
              cube_project_name: values.cube_project_name || "",
              packages: projectPackages.map((item) => item.name),
            }));
      setProjectModalOpen(false);
      await loadProjects(saved.id);
      message.success(projectEditing ? "项目已更新" : "项目已新增");
    } catch (e) {
      message.error(e.message);
    } finally {
      setProjectSaving(false);
    }
  };

  const deleteProject = async (project) => {
    try {
      if (scopeType === "channel") await api.deletePackageChannelProject(project.id);
      else await api.deletePackageProject(project.id);
      await loadProjects();
      message.success("项目已删除");
    } catch (e) {
      message.error(e.message);
    }
  };

  const applyProjectMode = async (project, mode) => {
    setModeSavingId(project.id);
    try {
      if (scopeType === "channel") await api.updatePackageChannelProjectMode(project.id, mode);
      else await api.updatePackageProjectMode(project.id, mode);
      if (scopeType !== contextRef.current.scopeType) return;
      setProjects((rows) => rows.map((row) => row.id === project.id
        ? { ...row, package_mode: mode }
        : row));
      if (selectedProjectId === project.id) await reloadAccounts(selectedAccountId);
      message.success(mode === "full" ? "已切换为整包，所有账号已全选包体" : "已切换为分包，可逐账号调整包体");
    } catch (e) {
      message.error(e.message);
    } finally {
      setModeSavingId(null);
    }
  };

  const changeProjectMode = (project, mode) => {
    if (mode === project.package_mode) return;
    if (mode === "full") {
      Modal.confirm({
        title: `将“${project.project}”切换为整包？`,
        content: "该项目下所有推广账号将自动勾选全部包体。",
        okText: "切换为整包",
        cancelText: "取消",
        onOk: () => applyProjectMode(project, mode),
      });
      return;
    }
    applyProjectMode(project, mode);
  };

  const restoreDefault = async () => {
    if (!selectedProject) return;
    setModeSavingId(selectedProject.id);
    try {
      if (scopeType === "channel") await api.restorePackageChannelProjectDefault(selectedProject.id);
      else await api.restorePackageProjectDefault(selectedProject.id);
      if (scopeType !== contextRef.current.scopeType) return;
      setProjects((rows) => rows.map((row) => row.id === selectedProject.id
        ? { ...row, package_mode: "full" }
        : row));
      await reloadAccounts(selectedAccountId);
      message.success("已恢复默认整包配置");
    } catch (e) {
      message.error(e.message);
    } finally {
      setModeSavingId(null);
    }
  };

  const openPackageModal = (item = null) => {
    setPackageEditing(item);
    packageForm.setFieldsValue({ name: item?.name || "" });
    const projectName = String(projectForm.getFieldValue("name") || projectEditing?.project || "").trim();
    setPackageCatalogOptions([]);
    if (projectName) {
      api.packageConfigPackageCatalog(projectName)
        .then((rows) => setPackageCatalogOptions(rows
          .filter((row) => !projectPackages.some((current) => current.id !== item?.id && current.name === row.name))
          .map((row) => ({ value: row.name, label: `${row.name} · ${row.source_label}` }))))
        .catch((e) => message.error(e.message));
    }
    setPackageModalOpen(true);
  };

  const savePackage = async () => {
    const values = await packageForm.validateFields();
    const name = values.name.trim();
    setPackageSaving(true);
    try {
      if (!projectEditing) {
        const duplicate = projectPackages.some((item) => item.id !== packageEditing?.id && item.name === name);
        if (duplicate) throw new Error("包体名称已存在");
        setProjectPackages((items) => packageEditing
          ? items.map((item) => item.id === packageEditing.id ? { ...item, name } : item)
          : [...items, { id: `draft-${Date.now()}`, name, account_count: 0 }]);
        setPackageModalOpen(false);
        message.success(packageEditing ? "包体已更新" : "包体已加入项目");
        return;
      }
      if (packageEditing) {
        if (scopeType === "channel") await api.updatePackageChannelItem(packageEditing.id, { name });
        else await api.updatePackageItem(packageEditing.id, { name });
      } else {
        if (scopeType === "channel") await api.createPackageChannelItem({ channel_project_id: projectEditing.id, name });
        else await api.createPackageItem({ project_id: projectEditing.id, name });
      }
      setPackageModalOpen(false);
      await loadProjectPackages(projectEditing.id);
      if (selectedProjectId === projectEditing.id) await reloadAccounts(selectedAccountId);
      await loadProjects(projectEditing.id);
      message.success(packageEditing ? "包体已更新" : "包体已新增");
    } catch (e) {
      message.error(e.message);
    } finally {
      setPackageSaving(false);
    }
  };

  const deletePackage = async (item) => {
    try {
      if (!projectEditing) {
        setProjectPackages((items) => items.filter((row) => row.id !== item.id));
        message.success("包体已从项目中移除");
        return;
      }
      if (scopeType === "channel") await api.deletePackageChannelItem(item.id);
      else await api.deletePackageItem(item.id);
      await loadProjectPackages(projectEditing.id);
      if (selectedProjectId === projectEditing.id) await reloadAccounts(selectedAccountId);
      await loadProjects(projectEditing.id);
      message.success("包体已停用并从账号配置中移除");
    } catch (e) {
      message.error(e.message);
    }
  };

  const openAccountModal = (account = null) => {
    setAccountEditing(account);
    accountForm.setFieldsValue({
      name: account?.account || "",
      promoter_name: account?.promoter_name || undefined,
      packages: account?.packages || [],
    });
    setAccountModalOpen(true);
  };

  const reloadAccounts = async (preferredId = null) => {
    if (!selectedProjectId || scopeType !== contextRef.current.scopeType ||
      selectedProjectId !== contextRef.current.selectedProjectId) return;
    const requestId = ++accountRequestRef.current;
    const isCurrent = () => requestId === accountRequestRef.current && scopeType === contextRef.current.scopeType &&
      selectedProjectId === contextRef.current.selectedProjectId;
    setAccountLoading(true);
    try {
      const data = scopeType === "channel"
        ? await api.packageConfigChannelAccounts(selectedProjectId)
        : await api.packageConfigAccounts(selectedProjectId);
      if (!isCurrent()) return;
      setAccounts(data.accounts);
      setPackageOptions(data.package_options.map((value) => ({ value, label: value })));
      setSelectedAccountId(data.accounts.some((row) => row.id === preferredId) ? preferredId : data.accounts[0]?.id ?? null);
    } finally {
      if (isCurrent()) setAccountLoading(false);
    }
  };

  const saveAccount = async () => {
    const values = await accountForm.validateFields();
    setAccountSaving(true);
    try {
      const common = { name: values.name, promoter_name: values.promoter_name, packages: values.packages || [] };
      const saved = scopeType === "channel"
        ? (accountEditing
          ? await api.updatePackageChannelAccount(accountEditing.id, common)
          : await api.createPackageChannelAccount({ ...common, channel_project_id: selectedProjectId }))
        : (accountEditing
          ? await api.updatePackageAccount(accountEditing.id, common)
          : await api.createPackageAccount({ ...common, project_id: selectedProjectId }));
      setAccountModalOpen(false);
      await reloadAccounts(saved.id);
      await loadProjects(selectedProjectId);
      message.success(accountEditing ? "推广账号已更新" : "推广账号已新增");
    } catch (e) {
      message.error(e.message);
    } finally {
      setAccountSaving(false);
    }
  };

  const deleteAccount = async (account) => {
    try {
      if (scopeType === "channel") await api.deletePackageChannelAccount(account.id);
      else await api.deletePackageAccount(account.id);
      await reloadAccounts();
      await loadProjects(selectedProjectId);
      message.success("推广账号已删除");
    } catch (e) {
      message.error(e.message);
    }
  };

  const savePackages = async () => {
    if (!currentAccount) return;
    setSaving(true);
    try {
      const updater = scopeType === "channel" ? api.updatePackageChannelAccount : api.updatePackageAccount;
      const saved = await updater(currentAccount.id, {
        name: currentAccount.account,
        promoter_name: currentAccount.promoter_name || "",
        packages: draftPackages,
      });
      if (scopeType !== contextRef.current.scopeType || selectedProjectId !== contextRef.current.selectedProjectId ||
        currentAccount.id !== contextRef.current.selectedAccountId) return;
      setAccounts((rows) => rows.map((row) => row.id === currentAccount.id ? { ...row, ...saved } : row));
      message.success("包体配置已保存");
    } catch (e) {
      message.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const openChannelModal = (channel = null) => {
    setChannelEditing(channel);
    channelForm.setFieldsValue({
      short_name: channel?.short_name || "",
      company_name: channel?.company_name || "",
    });
    setChannelModalOpen(true);
  };

  const saveChannel = async () => {
    const values = await channelForm.validateFields();
    setChannelSaving(true);
    try {
      const saved = channelEditing
        ? await api.updatePackageChannel(channelEditing.id, values)
        : await api.createPackageChannel(values);
      setChannelModalOpen(false);
      await loadChannels(saved.id);
      message.success(channelEditing ? "渠道已更新" : "渠道已新增");
    } catch (e) {
      message.error(e.message);
    } finally {
      setChannelSaving(false);
    }
  };

  const deleteChannel = async (channel) => {
    try {
      await api.deletePackageChannel(channel.id);
      await loadChannels();
      message.success("渠道已删除");
    } catch (e) {
      message.error(e.message);
    }
  };

  const syncConfig = async () => {
    setSyncing(true);
    try {
      const data = await api.syncPackageConfig();
      message.success(`同步完成：项目 ${data.projects} 个、推广账号 ${data.accounts} 个、包体 ${data.packages} 条（飞书记录 ${data.records} 行）`);
      window.location.reload();
    } catch (error) {
      message.error(error.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card size="small" title="包体配置">
      <Alert
        type="info" showIcon
        message={scopeType === "channel"
          ? "按类型 → 渠道 → 项目 → 推广账号 → 包体逐层配置"
          : "按类型 → 项目 → 推广账号 → 包体逐层配置"}
        description={scopeType === "channel"
          ? "渠道档案管理简称与主体公司；渠道项目独立配置接入/放出类型及结算放出点位。"
          : "聚玩项目、账号与包体配置保持独立。"}
        style={{ marginBottom: 12 }}
      />
      <Input.Search allowClear value={globalSearch} loading={globalLoading}
        placeholder={scopeType === "channel" ? "全局搜索渠道、主体公司、项目、推广账号或推广员姓名" : "全局搜索项目、推广账号或推广员姓名"}
        onChange={(e) => setGlobalSearch(e.target.value)}
        style={{ marginBottom: 12 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <Text strong>0. 选择类型</Text>
        <Segmented options={TYPE_OPTIONS} value={scopeType} onChange={setScopeType}
          disabled={projectModalOpen || accountModalOpen || channelModalOpen || saving || modeSavingId !== null} />
        <Button type="dashed" loading={syncing} onClick={syncConfig}
          disabled={projectModalOpen || accountModalOpen || channelModalOpen || saving || modeSavingId !== null}
          title="从飞书「SDK后台账号收录」表同步项目与包体配置">自动同步</Button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 12, alignItems: "start" }}>
        {scopeType === "channel" && (
          <Card size="small" title={`1. 选择渠道（${filteredChannels.length}）`}
            extra={<Button type="primary" size="small" onClick={() => openChannelModal()}>新增渠道</Button>}
            styles={{ body: { padding: 12 } }}>
            <Input allowClear value={channelSearch} placeholder="搜索渠道简称或主体公司"
              onChange={(e) => setChannelSearch(e.target.value)} style={{ marginBottom: 10 }} />
            {channelLoading ? <div style={{ textAlign: "center", padding: 40 }}><Spin /></div> : (
              <FilterList items={filteredChannels} selectedId={selectedChannelId} onSelect={setSelectedChannelId}
                onEdit={openChannelModal} onDelete={deleteChannel} emptyText="无匹配渠道"
                renderMeta={(item) => `${item.company_name} · ${item.project_count} 个项目`} />
            )}
          </Card>
        )}
        <Card size="small" title={`${scopeType === "channel" ? "2" : "1"}. 选择项目（${filteredProjects.length}）`}
          extra={<Button type="primary" size="small" disabled={scopeType === "channel" && !selectedChannel}
            onClick={() => openProjectModal()}>新增项目</Button>}
          styles={{ body: { padding: 12 } }}>
          <Input allowClear value={projectSearch} placeholder="搜索项目"
            onChange={(e) => setProjectSearch(e.target.value)} style={{ marginBottom: 10 }} />
          {projectLoading ? <div style={{ textAlign: "center", padding: 40 }}><Spin /></div> : (
            <FilterList items={filteredProjects} selectedId={selectedProjectId} onSelect={setSelectedProjectId}
              onEdit={openProjectModal} onDelete={deleteProject} onModeChange={changeProjectMode}
              modeSavingId={modeSavingId} emptyText="无匹配项目"
              renderMeta={(item) => scopeType === "channel"
                ? `${item.direction === "OUT" ? "放出" : item.direction === "FLAT" ? "平放" : "接入"} · 点位 ${item.point_ratio == null ? "--" : `${(item.point_ratio * 100).toFixed(2).replace(/\.00$/, "")}%`} · 点位差 ${item.point_diff == null ? "--" : `${(item.point_diff * 100).toFixed(2).replace(/\.00$/, "")}%`} · ${item.account_count} 个账号 · ${item.package_count} 个包体 · ${item.package_mode === "split" ? "分包" : "整包"}`
                : `${item.account_count} 个账号 · ${item.package_count} 个包体 · ${item.package_mode === "split" ? "分包" : "整包"}`} />
          )}
        </Card>

        <Card size="small" title={`${scopeType === "channel" ? "3" : "2"}. 选择推广账号（${filteredAccounts.length}）`}
          extra={<Button type="primary" size="small" disabled={!selectedProject} onClick={() => openAccountModal()}>新增账号</Button>}
          styles={{ body: { padding: 12 } }}>
          <Input allowClear value={accountSearch} placeholder="搜索推广账号或推广员姓名"
            onChange={(e) => setAccountSearch(e.target.value)} style={{ marginBottom: 10 }} />
          {accountLoading ? <div style={{ textAlign: "center", padding: 40 }}><Spin /></div> : (
            <FilterList items={filteredAccounts} selectedId={selectedAccountId} onSelect={setSelectedAccountId}
              onEdit={openAccountModal} onDelete={deleteAccount} emptyText="该项目暂无推广账号"
              renderMeta={(item) => `推广员：${item.promoter_name || "未绑定"} · ${item.packages.length} 个包体${item.customized ? " · 已编辑" : " · 现有数据"}`} />
          )}
        </Card>

        <Card size="small" title={`${scopeType === "channel" ? "4" : "3"}. 配置包体`}
          style={{ minWidth: 0 }} styles={{ body: { padding: 20, minWidth: 0, overflowWrap: "anywhere" } }}>
          {!currentAccount ? <Empty description="请先选择推广账号" /> : (
            <>
              <Text type="secondary">{scopeType === "channel" ? "当前类型 / 渠道 / 项目" : "当前类型 / 项目"}</Text>
              <Title level={5} style={{ margin: "4px 0 16px" }}>
                {scopeType === "juwan" ? "聚玩" : `渠道 / ${selectedChannel?.short_name}`} / {selectedProject?.project}
              </Title>
              <Text type="secondary">推广账号</Text>
              <div style={{ margin: "4px 0 16px" }}>
                <Tag color="blue" style={{ fontSize: 14, padding: "3px 10px", maxWidth: "100%", whiteSpace: "normal", overflowWrap: "anywhere" }}>{currentAccount.account}</Tag>
                <Tag color={currentAccount.promoter_name ? "purple" : "red"}
                  style={{ maxWidth: "100%", whiteSpace: "normal", overflowWrap: "anywhere" }}>
                  推广员：{currentAccount.promoter_name || "未绑定"}
                </Tag>
                <Tag color={currentAccount.customized ? "green" : "default"}>
                  {currentAccount.customized ? "已编辑" : "现有数据"}
                </Tag>
                <Tag color={selectedProject?.package_mode === "split" ? "orange" : "green"}>
                  {selectedProject?.package_mode === "split" ? "分包" : "整包"}
                </Tag>
              </div>
              <Text strong>该账号可用包体</Text>
              <Select mode="multiple" allowClear showSearch value={draftPackages}
                options={packageOptions} onChange={setDraftPackages}
                disabled={selectedProject?.package_mode !== "split"}
                placeholder="选择该项目下的包体" style={{ width: "100%", minWidth: 0, maxWidth: "100%", marginTop: 8 }}
                maxTagCount="responsive" />
              <div style={{ color: "#86909c", fontSize: 12, marginTop: 8 }}>
                {selectedProject?.package_mode === "split"
                  ? `已选 ${draftPackages.length} 个，可选范围受当前类型与项目限制。`
                  : `整包模式已自动选择该项目全部 ${packageOptions.length} 个包体。`}
              </div>
              {currentAccount.updated_at && currentAccount.updated_by && (
                <div style={{ color: "#86909c", fontSize: 12, marginTop: 16 }}>
                  最后保存：{currentAccount.updated_at.replace("T", " ")} · {currentAccount.updated_by}
                </div>
              )}
              <Space wrap style={{ marginTop: 20 }}>
                <Button type="primary" loading={saving}
                  disabled={selectedProject?.package_mode !== "split" || !changed}
                  onClick={savePackages}>保存配置</Button>
                <Button disabled={selectedProject?.package_mode !== "split" || !changed}
                  onClick={() => setDraftPackages(currentAccount.packages || [])}>取消未保存修改</Button>
                <Popconfirm
                  title={`恢复“${selectedProject?.project}”的默认整包配置？`}
                  description="该项目下所有推广账号将重新勾选全部包体。"
                  onConfirm={restoreDefault}
                >
                  <Button disabled={selectedProject?.package_mode !== "split" || modeSavingId === selectedProject?.id}>
                    恢复默认值
                  </Button>
                </Popconfirm>
              </Space>
            </>
          )}
        </Card>
      </div>

      <Modal title={channelEditing ? "编辑渠道" : "新增渠道"} open={channelModalOpen}
        okText="保存渠道" cancelText="取消" onOk={saveChannel} confirmLoading={channelSaving}
        onCancel={() => setChannelModalOpen(false)}>
        <Form form={channelForm} layout="vertical">
          <Form.Item label="渠道简称" name="short_name" rules={[{ required: true, message: "请输入渠道简称" }]}>
            <Input maxLength={100} placeholder="例如：壹玩" />
          </Form.Item>
          <Form.Item label="主体公司" name="company_name" rules={[{ required: true, message: "请输入主体公司" }]}>
            <Input maxLength={200} placeholder="输入渠道签约主体公司全称" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={projectEditing ? "编辑项目" : "新增项目"} open={projectModalOpen} width={720}
        okText="保存项目" cancelText="取消"
        onOk={saveProject} confirmLoading={projectSaving} onCancel={() => setProjectModalOpen(false)}>
        <Form form={projectForm} layout="vertical">
          <Form.Item label="项目类型"><Tag color={scopeType === "juwan" ? "blue" : "orange"}>{scopeType === "juwan" ? "聚玩" : "渠道"}</Tag></Form.Item>
          {scopeType === "channel" && (
            <>
              <Form.Item label="所属渠道"><Tag color="orange">{selectedChannel?.short_name}</Tag></Form.Item>
              <Form.Item label="接入/放出类型" name="direction" rules={[{ required: true, message: "请选择接入、放出或平放类型" }]}>
                <Segmented options={[{ value: "IN", label: "接入" }, { value: "OUT", label: "放出" }, { value: "FLAT", label: "平放" }]} />
              </Form.Item>
              <Form.Item label="点位" name="point_ratio"
                rules={[{ required: true, message: "请输入点位" }]}>
                <InputNumber min={0} max={100} precision={2} addonAfter="%" style={{ width: "100%" }}
                  placeholder="输入 0 至 100" />
              </Form.Item>
              <Form.Item label="点位差" name="point_diff">
                <InputNumber min={-100} max={100} precision={2} addonAfter="%" style={{ width: "100%" }}
                  placeholder="选填，输入 -100 至 100" />
              </Form.Item>
            </>
          )}
          <Form.Item label="项目名称" name="name" rules={[{ required: true, message: "请输入项目名称" }]}>
            <AutoComplete options={projectCatalogOptions}
              filterOption={(input, option) => String(option?.value || "").toLowerCase().includes(input.toLowerCase())}
              onSearch={searchProjectCatalog}
              placeholder="搜索选择系统项目，或输入新项目" />
          </Form.Item>
          <Form.Item label="99魔方项目名" name="cube_project_name"
            tooltip="用来关联两个数据网站的项目名：填 99魔方（源站）里对应的项目名">
            <Input placeholder="选填，填写该项目在 99魔方 对应的项目名" />
          </Form.Item>
        </Form>
        <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <Text strong>项目包体（{projectPackages.length}）</Text>
              <Button type="primary" size="small" onClick={() => openPackageModal()}>新增包体</Button>
            </div>
            {packageLoading ? <div style={{ textAlign: "center", padding: 20 }}><Spin /></div> : (
              <div style={{ maxHeight: 260, overflow: "auto" }}>
                {!projectPackages.length ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="该项目暂无包体" /> :
                  projectPackages.map((item) => (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderBottom: "1px solid #f5f5f5" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ wordBreak: "break-all" }}>{item.name}</div>
                        <div style={{ color: "#86909c", fontSize: 12 }}>
                          {projectEditing ? `已绑定 ${item.account_count} 个推广账号` : "保存项目后生效"}
                        </div>
                      </div>
                      <Button type="link" size="small" onClick={() => openPackageModal(item)}>编辑</Button>
                      <Popconfirm title={`${projectEditing ? "确定停用" : "确定移除"}包体“${item.name}”？`}
                        description={projectEditing ? "停用后会同时从该项目所有推广账号的可用包体中移除。" : "从待创建项目中移除。"}
                        onConfirm={() => deletePackage(item)}>
                        <Button type="link" size="small" danger>删除</Button>
                      </Popconfirm>
                    </div>
                  ))}
              </div>
            )}
          </div>
      </Modal>

      <Modal title={packageEditing ? "编辑包体" : "新增包体"} open={packageModalOpen}
        okText="保存" cancelText="取消" onOk={savePackage} confirmLoading={packageSaving}
        onCancel={() => setPackageModalOpen(false)}>
        <Form form={packageForm} layout="vertical">
          <Form.Item label="包体名称" name="name" rules={[{ required: true, message: "请输入包体名称" }]}>
            <AutoComplete options={packageCatalogOptions}
              filterOption={(input, option) => String(option?.value || "").toLowerCase().includes(input.toLowerCase())}
              placeholder={packageCatalogOptions.length ? "搜索选择该项目已有包体，或输入新包体" : "输入新包体名称"} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={accountEditing ? "编辑推广账号" : "新增推广账号"} open={accountModalOpen}
        okText="保存" cancelText="取消"
        onOk={saveAccount} confirmLoading={accountSaving} onCancel={() => setAccountModalOpen(false)}>
        <Form form={accountForm} layout="vertical">
          <Form.Item label="所属项目"><Tag color="blue">{selectedProject?.project}</Tag></Form.Item>
          <Form.Item label="推广账号" name="name" rules={[{ required: true, message: "请输入推广账号" }]}>
            <Input maxLength={200} placeholder="输入推广账号" />
          </Form.Item>
          <Form.Item label="推广员姓名" name="promoter_name" rules={[{ required: true, message: "请选择推广员姓名" }]}>
            <Select allowClear showSearch optionFilterProp="label" options={peopleOptions} placeholder="选择人员档案中的推广员" />
          </Form.Item>
          <Form.Item label="包体" name="packages">
            <Select mode="multiple" allowClear showSearch options={packageOptions}
              disabled={selectedProject?.package_mode !== "split"}
              placeholder={selectedProject?.package_mode === "split" ? "选择包体" : "整包模式自动选择全部包体"}
              maxTagCount="responsive" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
