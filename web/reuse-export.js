(function () {
  'use strict';

  const state = {
    backlog: { project: [], dept: [], staff: [] },
    sankey: [],
    success: [],
  };

  function unwrap(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    if (payload && payload.data && Array.isArray(payload.data.data)) return payload.data.data;
    return [];
  }

  function capture(url, payload) {
    let parsedUrl;
    try {
      parsedUrl = new URL(url, window.location.href);
    } catch (_) {
      return;
    }

    const rows = unwrap(payload);
    const path = parsedUrl.pathname;
    if (path.endsWith('/reuse/dashboard/backlog')) {
      const dimension = parsedUrl.searchParams.get('dimension') || 'project';
      if (Object.prototype.hasOwnProperty.call(state.backlog, dimension)) {
        state.backlog[dimension] = rows;
      }
    } else if (path.endsWith('/reuse/dashboard/sankey')) {
      state.sankey = rows;
    } else if (path.endsWith('/reuse/dashboard/success-rank')) {
      state.success = rows;
    }
  }

  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__reuseExportUrl = String(url);
    return originalOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function () {
    if (this.__reuseExportUrl) {
      this.addEventListener('load', () => {
        try {
          const payload = typeof this.response === 'object' && this.response !== null
            ? this.response
            : JSON.parse(this.responseText || 'null');
          capture(this.responseURL || this.__reuseExportUrl, payload);
        } catch (_) {
          // Non-JSON responses are unrelated to the export datasets.
        }
      }, { once: true });
    }
    return originalSend.apply(this, arguments);
  };

  const originalFetch = window.fetch;
  if (originalFetch) {
    window.fetch = async function (input) {
      const response = await originalFetch.apply(this, arguments);
      const url = typeof input === 'string' ? input : input.url;
      try {
        capture(url, await response.clone().json());
      } catch (_) {
        // Non-JSON responses are unrelated to the export datasets.
      }
      return response;
    };
  }

  function safeCell(value) {
    let text = value === null || value === undefined ? '' : String(value);
    if (/^[=+\-@]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }

  function downloadCsv(filename, headers, rows) {
    if (!rows.length) {
      window.alert('暂无可导出数据');
      return;
    }
    const lines = [headers.map(safeCell).join(',')];
    rows.forEach(row => lines.push(row.map(safeCell).join(',')));
    const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function activeBacklogDimension(panel) {
    const active = Array.from(panel.querySelectorAll('*')).find(node =>
      node.classList && node.classList.contains('active') && /^(\u9879\u76ee|\u90e8\u95e8|\u5458\u5de5)\u7ef4\u5ea6$/.test((node.textContent || '').trim())
    );
    const label = active ? active.textContent.trim() : '项目维度';
    if (label.startsWith('部门')) return { key: 'dept', label: '部门' };
    if (label.startsWith('员工')) return { key: 'staff', label: '员工' };
    return { key: 'project', label: '项目' };
  }

  function exportBacklog(panel) {
    const dimension = activeBacklogDimension(panel);
    const rows = state.backlog[dimension.key].map(item => [dimension.label, item.name || '', Number(item.count) || 0]);
    downloadCsv(`项目待复用数据-${dimension.label}维度.csv`, ['维度', '名称', '待复用人数'], rows);
  }

  function exportSankey() {
    const rows = state.sankey.map(item => [
      item.source || '', item.target || '', Number(item.count) || 0, Number(item.revenue) || 0,
    ]);
    downloadCsv('用户复用轨迹.csv', ['原项目', '目标项目', '复用人数', '复用流水'], rows);
  }

  function exportSuccess() {
    const rows = state.success.map((item, index) => [
      index + 1,
      item.gsName || item.name || '',
      item.deptName || item.dept || '',
      Number(item.users || item.convertedUsers) || 0,
      Number(item.revenue) || 0,
    ]);
    downloadCsv('成功复用数据.csv', ['排名', '复用人员', '部门', '成功复用人数', '复用流水'], rows);
  }

  function makeButton(panel, type) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'reuse-export-button';
    button.textContent = '导出';
    button.style.cssText = [
      'height:28px', 'padding:0 12px', 'border:1px solid #165dff', 'border-radius:4px',
      'background:#165dff', 'color:#fff', 'font-size:12px', 'line-height:26px',
      'cursor:pointer', 'white-space:nowrap',
    ].join(';');
    button.addEventListener('click', event => {
      event.stopPropagation();
      if (type === 'backlog') exportBacklog(panel);
      else if (type === 'sankey') exportSankey();
      else exportSuccess();
    });
    return button;
  }

  function findPanel(title) {
    const titleNode = Array.from(document.querySelectorAll('.panel-title')).find(node =>
      (node.textContent || '').includes(title)
    );
    return titleNode ? { panel: titleNode.closest('.panel-block'), titleNode } : null;
  }

  function attachButton(title, type) {
    const found = findPanel(title);
    const panel = found && found.panel;
    if (!panel || panel.querySelector(`.reuse-export-button[data-export="${type}"]`)) return;
    const controls = panel.querySelector(':scope > div[style*="position: absolute"], :scope > div[style*="position:absolute"]');
    if (!controls) return;
    controls.style.display = 'flex';
    controls.style.alignItems = 'center';
    controls.style.gap = '6px';
    const button = makeButton(panel, type);
    button.dataset.export = type;
    controls.insertBefore(button, controls.firstChild);
  }

  function attachButtons() {
    attachButton('项目待复用数据', 'backlog');
    attachButton('用户复用轨迹', 'sankey');
    attachButton('成功复用数据', 'success');
  }

  const observer = new MutationObserver(attachButtons);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('DOMContentLoaded', attachButtons);
})();
