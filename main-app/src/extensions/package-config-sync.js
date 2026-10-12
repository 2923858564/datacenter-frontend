(function () {
  'use strict';

  var API = '/api/v1';
  var BUTTON_ID = 'dc-pkg-sync-button';
  var authHeader = '';
  var running = false;
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
    } catch (_) {/* ignore */}
  }
  var originalFetch = window.fetch;
  if (originalFetch) {
    window.fetch = function (input, init) {
      try {
        if (init && init.headers) rememberAuth(init.headers);
        if (input && typeof input !== 'string' && input.headers) rememberAuth(input.headers);
      } catch (_) {/* ignore */}
      return originalFetch.apply(this, arguments);
    };
  }
  var originalOpen = XMLHttpRequest.prototype.open;
  var originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__pkgSyncHeaders = arguments[4];
    return originalOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function () {
    rememberAuth(this.__pkgSyncHeaders);
    return originalSend.apply(this, arguments);
  };
  try {
    var stored = window.localStorage.getItem('dc_token') || window.sessionStorage.getItem('dc_token');
    if (stored && !authHeader) authHeader = 'Bearer ' + stored;
  } catch (_) {/* ignore */}
  function findAnchor() {
    var nodes = document.querySelectorAll('div');
    for (var index = 0; index < nodes.length; index += 1) {
      var node = nodes[index];
      if (node.id === BUTTON_ID) continue;
      var text = (node.textContent || '').trim();
      if (text.indexOf('选择类型') === -1) continue;
      if (text.length > 60) continue;
      if (node.getBoundingClientRect().height > 90) continue;
      return node;
    }
    return null;
  }
  function ensureButton() {
    if (document.getElementById(BUTTON_ID)) return true;
    var anchor = findAnchor();
    if (!anchor) return false;
    var button = document.createElement('button');
    button.id = BUTTON_ID;
    button.type = 'button';
    button.textContent = '自动同步';
    button.title = '从飞书「SDK后台账号收录」表同步项目与包体配置';
    button.style.cssText = ['margin-left:12px', 'height:32px', 'padding:0 16px', 'border:1px dashed #165dff', 'border-radius:4px', 'background:#f2f7ff', 'color:#165dff', 'font-size:13px', 'line-height:30px', 'cursor:pointer', 'white-space:nowrap'].join(';');
    button.addEventListener('click', run);
    if (anchor.tagName === 'DIV' && anchor.style && anchor.style.display === 'flex') {
      anchor.appendChild(button);
    } else {
      anchor.parentElement ? anchor.parentElement.appendChild(button) : anchor.appendChild(button);
    }
    return true;
  }
  function report(message, ok) {
    var button = document.getElementById(BUTTON_ID);
    if (button) {
      button.textContent = ok ? '同步完成' : '同步失败';
      button.style.borderStyle = 'solid';
      setTimeout(function () {
        button.textContent = '自动同步';
        button.style.borderStyle = 'dashed';
      }, 4000);
    }
    window.alert(message);
  }
  function run() {
    if (running) return;
    running = true;
    var button = document.getElementById(BUTTON_ID);
    if (button) {
      button.textContent = '同步中…';
      button.disabled = true;
    }
    var options = {
      method: 'POST',
      headers: {}
    };
    if (authHeader) options.headers.Authorization = authHeader;
    window.fetch(API + '/system/package-config/sync-feishu', options).then(function (response) {
      return response.json().catch(function () {
        return {};
      }).then(function (body) {
        return {
          status: response.status,
          body: body
        };
      });
    }).then(function (result) {
      var data = result.body && result.body.data ? result.body.data : {};
      if (result.status !== 200 || !data) {
        throw new Error(result.body && (result.body.detail || result.body.message) || 'HTTP ' + result.status);
      }
      report('同步完成：项目 ' + data.projects + ' 个、推广账号 ' + data.accounts + ' 个、包体 ' + data.packages + ' 条（飞书记录 ' + data.records + ' 行）。\n' + '页面将刷新以显示最新配置。', true);
      setTimeout(function () {
        window.location.reload();
      }, 800);
    }).catch(function (error) {
      report('同步失败：' + (error && error.message ? error.message : error), false);
    }).then(function () {
      running = false;
      if (button) {
        button.disabled = false;
        button.textContent = '自动同步';
      }
    });
  }
  var timer = setInterval(function () {
    if (ensureButton()) clearInterval(timer);
  }, 800);
})();
