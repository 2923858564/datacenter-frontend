(function () {
  'use strict';

  var API = (window.__REUSE_API_BASE__ || '/api/v1').replace(/\/$/, '');
  var BLOCK_ID = 'dc-reuse-other-block';
  var authHeader = '';
  var cancelled = false;
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
    this.__otherHeaders = arguments[4];
    return originalOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function () {
    rememberAuth(this.__otherHeaders);
    return originalSend.apply(this, arguments);
  };
  try {
    var stored = window.localStorage.getItem('dc_token') || window.sessionStorage.getItem('dc_token');
    if (stored && !authHeader) authHeader = 'Bearer ' + stored;
  } catch (_) {/* ignore */}
  function style() {
    if (document.getElementById(BLOCK_ID + '-style')) return;
    var node = document.createElement('style');
    node.id = BLOCK_ID + '-style';
    node.textContent = ['#' + BLOCK_ID + '{margin:12px 16px 0;padding:14px 16px;background:#fff;border:1px solid #dfe8f3;border-radius:10px;box-shadow:0 1px 3px rgba(16,24,42,.05);font-family:inherit}', '#' + BLOCK_ID + ' .dc-other-head{display:flex;align-items:center;justify-content:space-between;gap:12px}', '#' + BLOCK_ID + ' .dc-other-title{font-size:15px;font-weight:700;color:#16365f}', '#' + BLOCK_ID + ' .dc-other-sub{color:#98a2b3;font-size:11px}', '#' + BLOCK_ID + ' .dc-other-row{display:flex;gap:12px;margin-top:12px;flex-wrap:wrap}', '#' + BLOCK_ID + ' .dc-other-card{flex:1 1 150px;min-width:130px;padding:10px 12px;border:1px solid #e5edf7;border-radius:8px;background:#f8fbff}', '#' + BLOCK_ID + ' .dc-other-card span{display:block;color:#667085;font-size:12px}', '#' + BLOCK_ID + ' .dc-other-card strong{display:block;margin-top:6px;font-size:22px;color:#16365f}', '#' + BLOCK_ID + ' .dc-other-card.is-other strong{color:#b54708}', '#' + BLOCK_ID + ' .dc-other-list{margin-top:10px;color:#667085;font-size:12px;line-height:20px}', '#' + BLOCK_ID + ' .dc-other-error{color:#b42318;font-size:12px}'].join('');
    document.head.appendChild(node);
  }
  function markup(data) {
    var date = data.date || '';
    var other = data.other || 0;
    var total = data.total || 0;
    var inside = data.inProject || 0;
    var details = (data.otherPackages || []).map(function (item) {
      return '<div>' + escapeHtml(item.name) + '：' + item.count + ' 个账号</div>';
    }).join('');
    return '<div class="dc-other-head"><div><div class="dc-other-title">其它（非系统内项目）</div>' + '<div class="dc-other-sub">口径：当天总额注册数 ' + escapeHtml(date) + ' · 与首页新账号数同源</div></div>' + '<div class="dc-other-sub">总额 = 项目内 + 其它</div></div>' + '<div class="dc-other-row">' + '<div class="dc-other-card"><span>当天总额注册数</span><strong>' + total + '</strong></div>' + '<div class="dc-other-card"><span>属于项目册项目</span><strong>' + inside + '</strong></div>' + '<div class="dc-other-card is-other"><span>其它</span><strong>' + other + '</strong></div>' + '</div>' + (details ? '<div class="dc-other-list"><div>其它构成（当日，按账号数）：</div>' + details + '</div>' : '') + '<div class="dc-other-list">当日其它占比：' + (total ? Math.round(other / total * 1000) / 10 : 0) + '%</div>';
  }
  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }
  function findAnchor() {
    var nodes = document.querySelectorAll('div');
    for (var index = 0; index < nodes.length; index += 1) {
      var node = nodes[index];
      if (node.id === BLOCK_ID) continue;
      var text = node.textContent || '';
      if (text.indexOf('新增可复用数') === -1) continue;
      if (node.getBoundingClientRect().height > 240) continue;
      if (node.children.length < 2) continue;
      return node;
    }
    return null;
  }
  function mount(data) {
    style();
    var existing = document.getElementById(BLOCK_ID);
    if (existing) existing.remove();
    var block = document.createElement('section');
    block.id = BLOCK_ID;
    block.innerHTML = markup(data);
    var anchor = findAnchor();
    if (anchor && anchor.parentElement) {
      var row = anchor;
      while (row.parentElement && row.parentElement.children.length === 1 && row.parentElement !== document.body) {
        row = row.parentElement;
      }
      row.parentElement.insertBefore(block, row.nextSibling);
    } else {
      block.style.position = 'fixed';
      block.style.right = '16px';
      block.style.top = '72px';
      block.style.width = '340px';
      block.style.zIndex = '9999';
      document.body.appendChild(block);
    }
  }
  function fail(message) {
    style();
    var block = document.getElementById(BLOCK_ID) || document.createElement('section');
    block.id = BLOCK_ID;
    block.innerHTML = '<div class="dc-other-head"><div class="dc-other-title">其它（非系统内项目）</div></div>' + '<div class="dc-other-error">读取失败：' + escapeHtml(message) + '</div>';
    if (!block.parentElement) document.body.appendChild(block);
  }
  function load() {
    if (cancelled) return;
    var options = {
      cache: 'no-store',
      headers: {}
    };
    if (authHeader) options.headers.Authorization = authHeader;
    window.fetch(API + '/reuse/dashboard/other-registrations', options).then(function (response) {
      return response.json().catch(function () {
        return {};
      }).then(function (body) {
        if (!response.ok || body.code !== 0) throw new Error(body && body.message || 'HTTP ' + response.status);
        return body.data || {};
      });
    }).then(function (data) {
      mount(data);
    }).catch(function (error) {
      fail(error.message || String(error));
    });
  }
  var tries = 0;
  var timer = setInterval(function () {
    tries += 1;
    if (findAnchor() || tries > 60) {
      clearInterval(timer);
      load();
    }
  }, 500);
  window.addEventListener('beforeunload', function () {
    cancelled = true;
    clearInterval(timer);
  });
})();
