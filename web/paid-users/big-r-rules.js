(function () {
  "use strict";

  const STORAGE_KEY = "big-r-coverage-demo-config-v1";
  const state = { recharge: [], active: [], combinations: [] };
  let rowSequence = 1;
  let hasAttemptedSave = false;

  const initialRules = {
    recharge: [
      { project: "演示项目 A", startDays: "0", endDays: "29", threshold: "3000" },
      { project: "演示项目 A", startDays: "30", endDays: "89", threshold: "8000" },
      { project: "演示项目 B", startDays: "0", endDays: "", threshold: "5000" }
    ],
    active: [
      { project: "演示项目 A", cycle: "开服首周活动（示例）", metric: "活动登录天数", threshold: "5", unit: "天" },
      { project: "演示项目 B", cycle: "赛季期间（示例）", metric: "活动累计在线时长", threshold: "8", unit: "小时" }
    ],
    combinations: [
      { project: "演示项目 A", mode: "both" },
      { project: "演示项目 B", mode: "either" }
    ]
  };

  const elements = {
    rechargeRows: document.getElementById("rechargeRows"),
    activeRows: document.getElementById("activeRows"),
    combinationRows: document.getElementById("combinationRows"),
    rechargeCount: document.getElementById("rechargeCount"),
    activeCount: document.getElementById("activeCount"),
    combinationCount: document.getElementById("combinationCount"),
    saveStatus: document.getElementById("saveStatus"),
    saveButton: document.getElementById("saveButton"),
    resetButton: document.getElementById("resetButton")
  };

  function makeRow(type, values) {
    return { id: type + "-" + rowSequence++, ...values };
  }

  function copyInitialRules() {
    state.recharge = initialRules.recharge.map(function (row) { return makeRow("recharge", row); });
    state.active = initialRules.active.map(function (row) { return makeRow("active", row); });
    state.combinations = initialRules.combinations.map(function (row) { return makeRow("combination", row); });
  }

  function loadSavedRules() {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return false;
      const parsed = JSON.parse(saved);
      if (!parsed || !Array.isArray(parsed.recharge) || !Array.isArray(parsed.active) || !Array.isArray(parsed.combinations)) return false;
      state.recharge = parsed.recharge.map(function (row) { return makeRow("recharge", row); });
      state.active = parsed.active.map(function (row) { return makeRow("active", row); });
      state.combinations = parsed.combinations.map(function (row) { return makeRow("combination", row); });
      return true;
    } catch (error) {
      return false;
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }

  function inputField(row, field, label, type, placeholder, attributes) {
    const value = escapeHtml(row[field]);
    const attrs = attributes || "";
    return '<div class="field"><input type="' + type + '" data-field="' + field + '" aria-label="' + label + '" value="' + value + '" placeholder="' + escapeHtml(placeholder || "") + '"' + attrs + '><span class="field-error" data-error-for="' + field + '" aria-live="polite"></span></div>';
  }

  function renderRechargeRow(row, index) {
    return '<tr data-id="' + escapeHtml(row.id) + '">' +
      '<td>' + inputField(row, "project", "项目", "text", "输入项目名称", " maxlength=80") + '</td>' +
      '<td><div class="input-pair">' + inputField(row, "startDays", "开服后天数起", "number", "起始天数", " min=0 step=1 inputmode=numeric") +
      '<span class="range-separator" aria-hidden="true">至</span>' + inputField(row, "endDays", "开服后天数止，留空表示不限", "number", "不限", " min=0 step=1 inputmode=numeric") + '</div><p class="field-note">留空结束天数表示无上限</p></td>' +
      '<td><div class="threshold-input"><span class="currency" aria-hidden="true">¥</span>' + inputField(row, "threshold", "累计充值门槛，元", "number", "输入金额", " min=0 step=0.01 inputmode=decimal") + '</div></td>' +
      '<td class="action-cell"><button class="btn btn-link" type="button" data-action="delete" data-table="recharge" data-id="' + escapeHtml(row.id) + '" aria-label="删除第' + (index + 1) + '条充值规则">删除</button></td>' +
      '</tr>';
  }

  function renderActiveRow(row, index) {
    return '<tr data-id="' + escapeHtml(row.id) + '">' +
      '<td>' + inputField(row, "project", "游戏或项目", "text", "输入游戏 / 项目", " maxlength=80") + '</td>' +
      '<td>' + inputField(row, "cycle", "活动周期", "text", "如：赛季期间", " maxlength=100") + '</td>' +
      '<td>' + inputField(row, "metric", "活跃指标名称", "text", "如：累计登录天数", " maxlength=100") + '</td>' +
      '<td>' + inputField(row, "threshold", "活跃门槛值", "number", "输入门槛", " min=0 step=any inputmode=decimal") + '</td>' +
      '<td>' + inputField(row, "unit", "门槛单位", "text", "如：天 / 小时", " maxlength=24") + '</td>' +
      '<td class="action-cell"><button class="btn btn-link" type="button" data-action="delete" data-table="active" data-id="' + escapeHtml(row.id) + '" aria-label="删除第' + (index + 1) + '条活跃规则">删除</button></td>' +
      '</tr>';
  }

  function renderCombinationRow(row) {
    const project = escapeHtml(row.project);
    const bothSelected = row.mode === "both" ? " selected" : "";
    const eitherSelected = row.mode === "either" ? " selected" : "";
    const meaning = row.mode === "either" ? "充值或活跃条件满足一项即可" : "充值与活跃条件都满足";
    return '<tr data-id="' + escapeHtml(row.id) + '">' +
      '<td><span class="linked-project">' + project + '</span></td>' +
      '<td><div class="field"><select data-field="mode" aria-label="' + project + '的大R用户条件组合">' +
      '<option value="both"' + bothSelected + '>同时满足充值与活跃</option>' +
      '<option value="either"' + eitherSelected + '>满足任一条件</option>' +
      '</select></div></td>' +
      '<td><span class="mode-meaning">' + meaning + '</span></td>' +
      '</tr>';
  }

  function renderTable(type) {
    const rows = state[type];
    const body = type === "recharge" ? elements.rechargeRows : elements.activeRows;
    const count = type === "recharge" ? elements.rechargeCount : elements.activeCount;
    count.textContent = rows.length + " 条规则";
    if (rows.length === 0) {
      body.innerHTML = '<tr><td class="empty-cell" colspan="' + (type === "recharge" ? 4 : 6) + '">暂无规则，点击“新增规则”添加一条。</td></tr>';
    } else {
      body.innerHTML = rows.map(type === "recharge" ? renderRechargeRow : renderActiveRow).join("");
    }
  }

  function renderCombinationTable() {
    elements.combinationCount.textContent = state.combinations.length + " 个项目";
    if (state.combinations.length === 0) {
      elements.combinationRows.innerHTML = '<tr><td class="empty-cell" colspan="3">充值规则中添加项目后，可在此配置组合方式。</td></tr>';
    } else {
      elements.combinationRows.innerHTML = state.combinations.map(renderCombinationRow).join("");
    }
  }

  function renderAll() {
    renderTable("recharge");
    renderTable("active");
    renderCombinationTable();
    if (hasAttemptedSave) validateAndShow("recharge");
    if (hasAttemptedSave) validateAndShow("active");
  }

  function readTable(type) {
    const body = type === "recharge" ? elements.rechargeRows : elements.activeRows;
    return Array.from(body.querySelectorAll("tr[data-id]")).map(function (row) {
      const result = { id: row.dataset.id };
      row.querySelectorAll("input[data-field]").forEach(function (input) {
        result[input.dataset.field] = input.value;
      });
      return result;
    });
  }

  function readCombinationTable() {
    return Array.from(elements.combinationRows.querySelectorAll("tr[data-id]")).map(function (row) {
      const select = row.querySelector('select[data-field="mode"]');
      return { id: row.dataset.id, project: row.querySelector(".linked-project").textContent, mode: select.value };
    });
  }

  function projectKey(project) {
    return project.trim().toLocaleLowerCase();
  }

  function syncCombinationsFromRecharge() {
    readAllTables();
    const modes = new Map(state.combinations.map(function (row) { return [projectKey(row.project), row.mode]; }));
    const projects = new Map();
    state.recharge.forEach(function (row) {
      const project = row.project.trim();
      if (project && !projects.has(projectKey(project))) projects.set(projectKey(project), project);
    });
    state.combinations = Array.from(projects.entries()).map(function (entry) {
      return makeRow("combination", { project: entry[1], mode: modes.get(entry[0]) || "both" });
    });
    renderCombinationTable();
  }

  function readAllTables() {
    state.recharge = readTable("recharge");
    state.active = readTable("active");
    state.combinations = readCombinationTable();
  }

  function addBlankRow(type) {
    readAllTables();
    const row = type === "recharge"
      ? { project: "", startDays: "", endDays: "", threshold: "" }
      : { project: "", cycle: "", metric: "", threshold: "", unit: "" };
    state[type].push(makeRow(type, row));
    renderTable(type);
    if (type === "recharge") syncCombinationsFromRecharge();
    if (hasAttemptedSave) validateAndShow(type);
  }

  function deleteRow(type, id) {
    readAllTables();
    state[type] = state[type].filter(function (row) { return row.id !== id; });
    renderTable(type);
    if (type === "recharge") syncCombinationsFromRecharge();
    if (hasAttemptedSave) validateAndShow(type);
    elements.saveStatus.textContent = "规则行已删除，保存后会写入当前浏览器。";
    elements.saveStatus.className = "save-status";
  }

  function validateNumber(value, label, allowBlank) {
    if (value.trim() === "") return allowBlank ? "" : "请输入" + label + "。";
    const number = Number(value);
    if (!Number.isFinite(number)) return label + "需为有效数字。";
    if (number < 0) return label + "不能为负数。";
    return "";
  }

  function validateRecharge(rows) {
    const issues = rows.map(function (row) {
      const errors = {};
      if (!row.project.trim()) errors.project = "请输入项目名称。";
      const startError = validateNumber(row.startDays || "", "开始天数", false);
      const endError = validateNumber(row.endDays || "", "结束天数", true);
      const thresholdError = validateNumber(row.threshold || "", "累计充值门槛", false);
      if (startError) errors.startDays = startError;
      else if (!Number.isInteger(Number(row.startDays))) errors.startDays = "开始天数需为整数。";
      if (endError) errors.endDays = endError;
      else if (row.endDays.trim() !== "" && !Number.isInteger(Number(row.endDays))) errors.endDays = "结束天数需为整数。";
      if (!startError && !endError && row.endDays.trim() !== "" && Number(row.endDays) < Number(row.startDays)) {
        errors.endDays = "结束天数需大于或等于开始天数。";
      }
      if (thresholdError) errors.threshold = thresholdError;
      return errors;
    });

    rows.forEach(function (row, index) {
      const errors = issues[index];
      if (errors.project || errors.startDays || errors.endDays) return;
      const start = Number(row.startDays);
      const end = row.endDays.trim() === "" ? Infinity : Number(row.endDays);
      rows.forEach(function (other, otherIndex) {
        if (otherIndex <= index || row.project.trim().toLocaleLowerCase() !== other.project.trim().toLocaleLowerCase()) return;
        const otherErrors = issues[otherIndex];
        if (otherErrors.project || otherErrors.startDays || otherErrors.endDays) return;
        const otherStart = Number(other.startDays);
        const otherEnd = other.endDays.trim() === "" ? Infinity : Number(other.endDays);
        if (Math.max(start, otherStart) <= Math.min(end, otherEnd)) {
          const message = "与第" + (otherIndex + 1) + "条规则的开服时长区间重叠。";
          errors.startDays = message;
          otherErrors.startDays = "与第" + (index + 1) + "条规则的开服时长区间重叠。";
        }
      });
    });
    return issues;
  }

  function validateActive(rows) {
    return rows.map(function (row) {
      const errors = {};
      if (!row.project.trim()) errors.project = "请输入游戏或项目名称。";
      if (!row.cycle.trim()) errors.cycle = "请输入活动周期。";
      if (!row.metric.trim()) errors.metric = "请输入活跃指标名称。";
      if (!row.unit.trim()) errors.unit = "请输入门槛单位。";
      const thresholdError = validateNumber(row.threshold || "", "活跃门槛", false);
      if (thresholdError) errors.threshold = thresholdError;
      return errors;
    });
  }

  function validateAndShow(type) {
    const rows = readTable(type);
    const errors = type === "recharge" ? validateRecharge(rows) : validateActive(rows);
    const body = type === "recharge" ? elements.rechargeRows : elements.activeRows;
    let firstInvalid = null;

    Array.from(body.querySelectorAll("tr[data-id]")).forEach(function (row, index) {
      const rowErrors = errors[index] || {};
      row.querySelectorAll("input[data-field]").forEach(function (input) {
        const field = input.dataset.field;
        const message = rowErrors[field] || "";
        input.classList.toggle("is-invalid", Boolean(message));
        input.setAttribute("aria-invalid", message ? "true" : "false");
        const errorSlot = row.querySelector('[data-error-for="' + field + '"]');
        if (errorSlot) errorSlot.textContent = message;
        if (message && !firstInvalid) firstInvalid = input;
      });
    });
    return { valid: !firstInvalid, firstInvalid: firstInvalid };
  }

  function formatTime(value) {
    return new Intl.DateTimeFormat("zh-CN", { hour12: false, month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(value);
  }

  function saveConfiguration() {
    hasAttemptedSave = true;
    readAllTables();
    const rechargeResult = validateAndShow("recharge");
    const activeResult = validateAndShow("active");
    const invalid = rechargeResult.firstInvalid || activeResult.firstInvalid;
    if (invalid) {
      elements.saveStatus.textContent = "请按表格提示补全必填项、修正负门槛或重叠区间后再保存。";
      elements.saveStatus.className = "save-status error";
      invalid.focus();
      return;
    }

    const payload = {
      recharge: state.recharge.map(function (row) { const copy = { ...row }; delete copy.id; return copy; }),
      active: state.active.map(function (row) { const copy = { ...row }; delete copy.id; return copy; }),
      combinations: state.combinations.map(function (row) { const copy = { ...row }; delete copy.id; return copy; }),
      savedAt: new Date().toISOString()
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      elements.saveStatus.textContent = "已保存到当前浏览器 · " + formatTime(new Date(payload.savedAt));
      elements.saveStatus.className = "save-status success";
    } catch (error) {
      elements.saveStatus.textContent = "当前浏览器无法保存示例配置。";
      elements.saveStatus.className = "save-status error";
    }
  }

  function resetConfiguration() {
    window.localStorage.removeItem(STORAGE_KEY);
    copyInitialRules();
    hasAttemptedSave = false;
    renderAll();
    elements.saveStatus.textContent = "已恢复初始示例；尚未保存。";
    elements.saveStatus.className = "save-status";
  }

  document.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const type = button.dataset.table;
    if (button.dataset.action === "add") addBlankRow(type);
    if (button.dataset.action === "delete") deleteRow(type, button.dataset.id);
  });

  document.addEventListener("input", function (event) {
    if (!event.target.matches("input[data-field]")) return;
    const row = event.target.closest("tr[data-id]");
    const section = event.target.closest(".rule-card");
    if (!row || !section) return;
    if (event.target.dataset.field === "project" && section.querySelector("tbody").id === "rechargeRows") syncCombinationsFromRecharge();
    if (hasAttemptedSave) validateAndShow(section.querySelector("tbody").id === "rechargeRows" ? "recharge" : "active");
    elements.saveStatus.textContent = "有未保存的修改。";
    elements.saveStatus.className = "save-status";
  });

  document.addEventListener("change", function (event) {
    if (!event.target.matches('select[data-field="mode"]')) return;
    const meaning = event.target.closest("tr").querySelector(".mode-meaning");
    meaning.textContent = event.target.value === "either" ? "充值或活跃条件满足一项即可" : "充值与活跃条件都满足";
    elements.saveStatus.textContent = "有未保存的修改。";
    elements.saveStatus.className = "save-status";
  });

  elements.saveButton.addEventListener("click", saveConfiguration);
  elements.resetButton.addEventListener("click", resetConfiguration);

  if (loadSavedRules()) {
    elements.saveStatus.textContent = "已载入当前浏览器保存的演示配置。";
    elements.saveStatus.className = "save-status success";
  } else {
    copyInitialRules();
  }
  renderAll();
}());
