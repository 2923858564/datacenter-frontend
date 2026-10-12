(function () {
  'use strict';

  var API = (window.__REUSE_API_BASE__ || '/api/v1').replace(/\/$/, '');
  var PAGE_SIZE = 10;
  var DIMENSIONS = { '项目维度': 'project', '部门维度': 'department', '员工维度': 'employee' };
  var DIMENSION_TITLES = { project: '项目', department: '部门', employee: '员工' };
  var PERIODS = { '今日': 'today', '昨日': 'yesterday', '本周': 'week', '上周': 'lastWeek',
                  '本月': 'month', '上月': 'lastMonth', '历史累计': 'total' };
  var PERIOD_TITLES = { today: '今日', yesterday: '昨日', week: '本周', lastWeek: '上周',
                        month: '本月', lastMonth: '上月', last30: '最近30天', last90: '最近90天',
                        custom: '自定义', total: '历史累计' };
  var COLUMNS = ['玩家账号', '角色名', '区服', '游戏名称', '充值金额', '最后充值时间', '最后登录时间'];
  var state = { rows: [], page: 1, title: '', subtitle: '', loading: false };
  var authHeader = '';
  var overlay = null;

  function rememberAuth(headers) {
    try {
      if (!headers) return;
      if (typeof headers.get === 'function') {
        var value = headers.get('Authorization');
        if (value) authHeader = value;
        return;
      }
      Object.keys(headers).forEach(function (key) {
        if (key.toLowerCase() === 'authorization' && headers[key]) authHeader = headers[key];
      });
    } catch (_) { /* ignore */ }
  }

  var originalFetch = window.fetch;
  if (originalFetch) {
    window.fetch = function (input, init) {
      try {
        if (init && init.headers) rememberAuth(init.headers);
        if (input && typeof input !== 'string' && input.headers) rememberAuth(input.headers);
      } catch (_) { /* ignore */ }
      return originalFetch.apply(this, arguments);
    };
  }
  var originalOpen = XMLHttpRequest.prototype.open;
  var originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__detailHeaders = arguments[4];
    return originalOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function () {
    rememberAuth(this.__detailHeaders);
    return originalSend.apply(this, arguments);
  };

  try {
    var stored = window.localStorage.getItem('dc_token') || window.sessionStorage.getItem('dc_token');
    if (stored && !authHeader) authHeader = 'Bearer ' + stored;
  } catch (_) { /* ignore */ }

  function readDimension(panel) {
    var active = panel.querySelector('.bar-tab.active');
    var label = active ? active.textContent.trim() : '';
    return DIMENSIONS[label] || 'project';
  }

  function readPeriod(panel) {
    if (window.__REUSE_BACKLOG_RANGE__) return window.__REUSE_BACKLOG_RANGE__.period;
    var block = panel.closest('.panel-block') || panel.parentElement;
    var button = block ? block.querySelector('.date-filter .date-btn') : null;
    var label = button ? button.textContent.replace('▾', '').trim() : '';
    return PERIODS[label] || 'today';
  }

  function readRow(row, dimension) {
    var label = row.querySelector('.bar-label');
    var dept = row.querySelector('.bar-dept');
    var deptText = dept ? dept.textContent.trim() : '';
    var text = label ? label.textContent.trim() : '';
    var name = deptText && text.indexOf(deptText) === 0 ? text.slice(deptText.length).trim() : text;
    return { name: name, dept: deptText, dimension: dimension };
  }

  function formatMoney(value) {
    var number = Number(value) || 0;
    return '¥' + number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function escapeCell(value) {
    var text = value === null || value === undefined ? '' : String(value);
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function buildOverlay() {
    if (overlay) return overlay;
    var style = document.createElement('style');
    style.textContent = [
      '.dc-bl-row{cursor:pointer}',
      '.dc-bl-row:hover .bar-fill{filter:brightness(1.08)}',
      '.dc-bl-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:2000;display:flex;align-items:center;justify-content:center}',
      '.dc-bl-dialog{background:#fff;border-radius:8px;width:min(920px,94vw);max-height:82vh;display:flex;flex-direction:column;box-shadow:0 12px 32px rgba(0,0,0,.2);font-size:13px;color:#1f2329}',
      '.dc-bl-head{padding:14px 20px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;justify-content:space-between}',
      '.dc-bl-title{font-size:15px;font-weight:600}',
      '.dc-bl-sub{font-size:12px;color:#8a9099;margin-top:2px}',
      '.dc-bl-close{border:none;background:transparent;font-size:18px;line-height:1;cursor:pointer;color:#8a9099}',
      '.dc-bl-body{padding:10px 20px 4px;overflow:auto}',
      '.dc-bl-table{width:100%;border-collapse:collapse}',
      '.dc-bl-table th{text-align:left;font-weight:600;color:#1f2329;background:#fafafa;padding:8px 10px;border-bottom:1px solid #f0f0f0;position:sticky;top:0}',
      '.dc-bl-table td{padding:8px 10px;border-bottom:1px solid #f5f5f5;white-space:nowrap}',
      '.dc-bl-money{text-align:right;font-variant-numeric:tabular-nums}',
      '.dc-bl-foot{padding:12px 20px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid #f0f0f0}',
      '.dc-bl-pager button{margin-left:6px;height:28px;padding:0 10px;border:1px solid #d9d9d9;border-radius:4px;background:#fff;cursor:pointer}',
      '.dc-bl-pager button:disabled{color:#c3c6cc;cursor:not-allowed}',
      '.dc-bl-export{height:28px;padding:0 12px;border:1px solid #165dff;border-radius:4px;background:#165dff;color:#fff;cursor:pointer}',
      '.dc-bl-empty{padding:32px 0;text-align:center;color:#8a9099}'
    ].join('\n');
    document.head.appendChild(style);

    overlay = document.createElement('div');
    overlay.className = 'dc-bl-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML =
      '<div class="dc-bl-dialog">' +
      '  <div class="dc-bl-head">' +
      '    <div><div class="dc-bl-title"></div><div class="dc-bl-sub"></div></div>' +
      '    <button class="dc-bl-close" type="button" aria-label="关闭">×</button>' +
      '  </div>' +
      '  <div class="dc-bl-body"><div class="dc-bl-content"></div></div>' +
      '  <div class="dc-bl-foot">' +
      '    <div class="dc-bl-pager"><span class="dc-bl-pageinfo"></span>' +
      '      <button type="button" data-page="prev">上一页</button>' +
      '      <button type="button" data-page="next">下一页</button></div>' +
      '    <button type="button" class="dc-bl-export">导出</button>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.querySelector('.dc-bl-close').addEventListener('click', close);
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) close();
    });
    overlay.querySelector('[data-page="prev"]').addEventListener('click', function () {
      if (state.page > 1) { state.page -= 1; render(); }
    });
    overlay.querySelector('[data-page="next"]').addEventListener('click', function () {
      if (state.page * PAGE_SIZE < state.rows.length) { state.page += 1; render(); }
    });
    overlay.querySelector('.dc-bl-export').addEventListener('click', exportCsv);
    return overlay;
  }

  function close() {
    if (overlay) overlay.style.display = 'none';
  }

  function render() {
    if (!overlay) return;
    var content = overlay.querySelector('.dc-bl-content');
    var pageInfo = overlay.querySelector('.dc-bl-pageinfo');
    overlay.querySelector('.dc-bl-title').textContent = state.title;
    overlay.querySelector('.dc-bl-sub').textContent = state.subtitle;

    if (state.loading) {
      content.innerHTML = '<div class="dc-bl-empty">加载中…</div>';
      pageInfo.textContent = '';
      setPager(true, true);
      return;
    }
    if (!state.rows.length) {
      content.innerHTML = '<div class="dc-bl-empty">该分组在当前区间内没有待复用玩家</div>';
      pageInfo.textContent = '';
      setPager(true, true);
      return;
    }
    var start = (state.page - 1) * PAGE_SIZE;
    var pageRows = state.rows.slice(start, start + PAGE_SIZE);
    var html = '<table class="dc-bl-table"><thead><tr>';
    COLUMNS.forEach(function (title) { html += '<th>' + title + '</th>'; });
    html += '</tr></thead><tbody>';
    pageRows.forEach(function (row) {
      html += '<tr>' +
        '<td>' + escapeCell(row.uid) + '</td>' +
        '<td>' + escapeCell(row.roleName) + '</td>' +
        '<td>' + escapeCell(row.serverName) + '</td>' +
        '<td>' + escapeCell(row.gameName) + '</td>' +
        '<td class="dc-bl-money">' + escapeCell(formatMoney(row.payMoney)) + '</td>' +
        '<td>' + escapeCell(row.payTime || '—') + '</td>' +
        '<td>' + escapeCell(row.lastLoginTime || '—') + '</td>' +
        '</tr>';
    });
    html += '</tbody></table>';
    content.innerHTML = html;
    var totalPages = Math.max(1, Math.ceil(state.rows.length / PAGE_SIZE));
    pageInfo.textContent = '共 ' + state.rows.length + ' 条 · 第 ' + state.page + '/' + totalPages + ' 页';
    setPager(state.page <= 1, state.page >= totalPages);
  }

  function setPager(prevDisabled, nextDisabled) {
    if (!overlay) return;
    overlay.querySelector('[data-page="prev"]').disabled = !!prevDisabled;
    overlay.querySelector('[data-page="next"]').disabled = !!nextDisabled;
  }

  function quote(value) {
    var text = value === null || value === undefined ? '' : String(value);
    if (/^[=+\-@]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }

  function exportCsv() {
    if (!state.rows.length) return;
    var lines = [COLUMNS.map(quote).join(',')];
    state.rows.forEach(function (row) {
      lines.push([row.uid, row.roleName, row.serverName, row.gameName,
                  Number(row.payMoney || 0).toFixed(2), row.payTime || '', row.lastLoginTime || ''].map(quote).join(','));
    });
    var blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = (state.title || '待复用玩家明细').replace(/[\\/:*?"<>|]/g, '_') + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  function openDetail(dimension, period, row) {
    buildOverlay();
    var scope = (row.dept ? row.dept + ' · ' : '') + row.name;
    state.rows = [];
    state.page = 1;
    state.loading = true;
    state.title = DIMENSION_TITLES[dimension] + ' · ' + scope + ' — 待复用玩家明细';
    state.subtitle = '区间：' + (PERIOD_TITLES[period] || period);
    overlay.style.display = 'flex';
    render();

    var params = new URLSearchParams({ dimension: dimension, name: row.name, period: period });
    var range = window.__REUSE_BACKLOG_RANGE__;
    if (range && range.period === 'custom') {
      params.set('startDate', range.startDate);
      params.set('endDate', range.endDate);
    }
    var options = { headers: {} };
    if (authHeader) options.headers.Authorization = authHeader;
    window.fetch(API + '/reuse/dashboard/backlog-players?' + params.toString(), options)
      .then(function (response) { return response.json(); })
      .then(function (payload) {
        var data = payload && payload.data ? payload.data : payload;
        var players = (data && data.players) || (Array.isArray(data) ? data : []);
        state.rows = players;
        state.loading = false;
        var total = (data && data.total) || players.length;
        state.subtitle = '区间：' + (PERIOD_TITLES[period] || period) + ' · 共 ' + total + ' 人' +
          (total > players.length ? '（展示前 ' + players.length + ' 条）' : '');
        render();
      })
      .catch(function () {
        state.loading = false;
        state.rows = [];
        state.subtitle = '区间：' + (PERIOD_TITLES[period] || period);
        render();
        var content = overlay.querySelector('.dc-bl-content');
        content.innerHTML = '<div class="dc-bl-empty">明细加载失败，请稍后重试</div>';
      });
  }

  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    var row = target.closest('.bar-row');
    if (!row) return;
    var panel = row.closest('.backlog-bar');
    if (!panel) return;
    var dimension = readDimension(panel);
    var period = readPeriod(panel);
    var payload = readRow(row, dimension);
    if (!payload.name) return;
    openDetail(dimension, period, payload);
  }, true);

  document.addEventListener('mouseover', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    var row = target.closest('.backlog-bar .bar-row');
    if (row) row.classList.add('dc-bl-row');
  }, true);
})();
