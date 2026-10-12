/* Recharge-only mount point for /integration. Loaded after the existing auth gate. */
(function () {
  const endpoint = '/api/v1/recharge-sdk2025';
  const columns = [['source_label', '来源'], ['order_no', '平台订单号'], ['cp_order_no', '游戏订单号'], ['small_uid', '小号 ID'], ['user_name', '玩家用户名'], ['role_id', '角色 ID'], ['role_name', '角色名'], ['game_name', '游戏／包体'], ['server_name', '区服'], ['member_id', '推广员 ID'], ['member_name', '推广员账号'], ['order_amount', '订单金额'], ['pay_amount', '实付金额'], ['order_time', '下单时间'], ['pay_time', '支付时间'], ['pay_status', '支付状态'], ['refund_status', '退款状态'], ['project', '归属项目（映射）'], ['platform', '平台'], ['channel', '归属渠道（映射）']];
  const filters = [['project', '项目名'], ['package', '归属包体（映射）'], ['promoter', '推广员'], ['promoter_account', '配置推广账号'], ['platform', '平台'], ['channel', '渠道'], ['date_from', '开始日期'], ['date_to', '结束日期'], ['user_name', '游戏账号'], ['server_name', '区服'], ['role_name', '角色名'], ['role_id', '角色 ID'], ['small_uid', '小号 ID'], ['order_no', '订单号']];
  const storageKey = 'dc-data-detail-field-config:recharge';
  const catalog = [...columns.map(([key, label]) => ({
    id: 'table:' + key,
    key,
    label
  })), ...filters.map(([key, label]) => ({
    id: 'filter:' + key,
    key,
    label
  }))];
  const h = (tag, attrs = {}, children = []) => {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'text') node.textContent = value;else if (key === 'class') node.className = value;else node.setAttribute(key, value);
    }
    for (const child of children) node.append(child);
    return node;
  };
  const today = () => new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Shanghai'
  }).format(new Date());
  const display = value => value === null || value === undefined || value === '' ? '—' : String(value);
  const money = value => value === null || value === undefined || value === '' ? '—' : `¥${Number(value).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
  const showFullText = node => {
    node.style.whiteSpace = 'nowrap';
    node.style.maxWidth = 'none';
    node.style.overflow = 'visible';
    node.style.textOverflow = 'clip';
  };
  async function request(url) {
    const response = await fetch(url, {
      credentials: 'same-origin',
      cache: 'no-store'
    });
    const body = await response.json();
    if (!response.ok || !body.ok) throw new Error(body.detail || '充值记录加载失败');
    return body;
  }
  function mountRechargeSdk2025(root) {
    root.classList.add('dc-dd-page');
    let page = 1,
      pageSize = 20,
      applied = null,
      meta = {},
      rows = [],
      options = {},
      generation = 0,
      draftVisible = [];
    let visible;
    try {
      visible = JSON.parse(localStorage.getItem(storageKey));
    } catch {}
    if (!Array.isArray(visible) || !visible.length) visible = columns.map(([key]) => 'table:' + key);
    const valid = new Set(catalog.map(item => item.id));
    visible = visible.filter(key => valid.has(key));
    if (!visible.length) visible = columns.map(([key]) => 'table:' + key);
    const heading = h('div', {
      class: 'dc-dd-heading'
    }, [h('div', {}, [h('h1', {
      text: '充值记录'
    }), h('p', {
      text: 'SDK2025 原始订单与旧历史补录'
    })])]);
    const form = h('form', {
      class: 'dc-dd-filter'
    });
    const grid = h('div', {
        class: 'dc-dd-grid'
      }),
      actions = h('div', {
        class: 'dc-dd-actions'
      });
    const controls = {},
      choices = {};
    for (const [key, label] of filters) {
      if (key === 'date_from' || key === 'date_to') continue;
      const input = key === 'channel' ? h('select') : h('input', {
        type: key.startsWith('date_') ? 'date' : 'search'
      });
      input.name = key;
      if (key === 'channel') {
        input.append(h('option', {
          value: '',
          text: '全部'
        }), h('option', {
          value: '__juwan__',
          text: '聚玩'
        }));
        input.value = '__juwan__';
      }
      if (['project', 'package', 'promoter', 'promoter_account', 'platform'].includes(key)) {
        const list = h('datalist', {
          id: 'dc-sdk25-' + key
        });
        input.setAttribute('list', list.id);
        choices[key] = list;
      }
      if (key === 'project') input.placeholder = '全部项目';
      if (key === 'package') input.placeholder = '多个包体用逗号分隔';
      controls[key] = input;
      grid.append(h('label', {
        class: 'dc-dd-field'
      }, [h('span', {
        text: label
      }), input, choices[key] || document.createTextNode('')]));
    }
    controls.date_from = h('input', {
      type: 'hidden'
    });
    controls.date_to = h('input', {
      type: 'hidden'
    });
    const dateHost = h('div', {
      class: 'dc-sdk2025-date-picker'
    });
    grid.append(h('label', {
      class: 'dc-dd-field dc-dd-date-range'
    }, [h('span', {
      text: '日期范围'
    }), dateHost, controls.date_from, controls.date_to]));
    controls.date_from.value = today();
    controls.date_to.value = today();
    const search = h('button', {
      type: 'submit',
      text: '查询'
    });
    const reset = h('button', {
      type: 'button',
      text: '重置'
    });
    const exportButton = h('button', {
      type: 'button',
      text: '导出'
    });
    const configButton = h('button', {
      type: 'button',
      text: '字段配置'
    });
    exportButton.disabled = true;
    search.className = 'dc-dd-primary';
    actions.append(configButton, search, reset, exportButton);
    form.append(grid, actions);
    const summary = h('div', {
      class: 'dc-dd-summary'
    });
    const coverage = h('p', {
      class: 'dc-dd-coverage'
    });
    const error = h('p', {
      role: 'alert'
    });
    const table = h('table', {
        class: 'dc-dd-table'
      }),
      head = h('thead'),
      body = h('tbody');
    table.style.width = 'max-content';
    table.style.minWidth = '100%';
    table.style.tableLayout = 'auto';
    table.append(head, body);
    const previous = h('button', {
        type: 'button',
        text: '上一页'
      }),
      next = h('button', {
        type: 'button',
        text: '下一页'
      });
    const paging = h('span'),
      size = h('select'),
      jump = h('input', {
        type: 'number',
        min: '1'
      }),
      jumpButton = h('button', {
        type: 'button',
        text: '跳转'
      });
    for (const amount of [20, 50, 100]) size.append(h('option', {
      value: String(amount),
      text: String(amount) + ' 条/页'
    }));
    const fields = h('div', {
        class: 'dc-dd-modal-mask'
      }),
      dialog = h('div', {
        class: 'dc-dd-field-config',
        role: 'dialog',
        'aria-modal': 'true'
      }),
      fieldList = h('div', {
        class: 'dc-dd-field-config-list'
      });
    fields.style.display = 'none';
    const closeFields = () => {
      fields.style.display = 'none';
    };
    const closeButton = h('button', {
      type: 'button',
      class: 'dc-dd-modal-close',
      text: '×',
      'aria-label': '关闭字段配置'
    });
    closeButton.addEventListener('click', closeFields);
    const fieldActions = h('div', {
      class: 'dc-dd-field-config-actions'
    });
    const resetFields = h('button', {
        type: 'button',
        text: '恢复默认'
      }),
      cancelFields = h('button', {
        type: 'button',
        text: '取消'
      }),
      applyFields = h('button', {
        type: 'button',
        class: 'dc-dd-primary',
        text: '应用配置'
      });
    fieldActions.append(resetFields, cancelFields, applyFields);
    dialog.append(h('div', {
      class: 'dc-dd-field-config-heading'
    }, [h('h2', {
      text: '表格字段配置'
    }), closeButton]), fieldList, fieldActions);
    fields.append(dialog);
    const tableWrap = h('div', {
      class: 'dc-dd-table-wrap'
    }, [table]);
    tableWrap.style.overflowX = 'auto';
    const tableCard = h('section', {
      class: 'dc-dd-table-card'
    }, [tableWrap, h('div', {
      class: 'dc-dd-pagination'
    }, [size, paging, previous, next, h('label', {
      class: 'dc-dd-page-jump'
    }, [jump]), jumpButton])]);
    error.className = 'dc-dd-error';
    error.hidden = true;
    root.replaceChildren(heading, form, summary, coverage, error, tableCard, fields);
    const datePicker = window.dcSdk2025DatePicker(dateHost, {
      from: controls.date_from.value,
      to: controls.date_to.value,
      onChange: (from, to) => {
        controls.date_from.value = from;
        controls.date_to.value = to;
      }
    });
    function query() {
      const params = new URLSearchParams();
      for (const [key] of filters) {
        if (key === 'package') controls[key].value.split(/[,，]/).map(v => v.trim()).filter(Boolean).forEach(v => params.append(key, v));else if (key === 'channel') {
          const value = controls.channel.value;
          if (value === '__juwan__') params.set('business_type', 'juwan');else if (value.startsWith('channel:')) {
            params.set('business_type', 'channel');
            params.set('channel', value.slice(8));
          }
        } else if (controls[key].value) params.append(key, controls[key].value);
      }
      return params;
    }
    function render() {
      const selected = visible.map(id => catalog.find(field => field.id === id)).filter(Boolean);
      head.replaceChildren(h('tr', {}, selected.map(field => {
        const th = h('th', {
          text: field.label,
          title: '拖动调整字段顺序'
        });
        showFullText(th);
        th.draggable = true;
        th.addEventListener('dragstart', event => event.dataTransfer.setData('text/plain', field.id));
        th.addEventListener('dragover', event => event.preventDefault());
        th.addEventListener('drop', event => {
          event.preventDefault();
          const from = visible.indexOf(event.dataTransfer.getData('text/plain')),
            to = visible.indexOf(field.id);
          if (from < 0 || to < 0 || from === to) return;
          visible.splice(to, 0, visible.splice(from, 1)[0]);
          localStorage.setItem(storageKey, JSON.stringify(visible));
          render();
        });
        return th;
      })));
      body.replaceChildren(...rows.map(row => h('tr', {}, selected.map(field => {
        const amount = ['order_amount', 'pay_amount'].includes(field.key);
        const value = field.key === 'date_from' || field.key === 'date_to' ? row.event_time?.slice(0, 10) : row[field.key];
        const td = h('td', {
          text: amount ? money(value) : display(value)
        });
        showFullText(td);
        if (amount) td.style.color = '#c62828';
        return td;
      }))));
      paging.textContent = `第 ${page} 页${meta.total == null ? '' : ` · 共 ${Number(meta.total).toLocaleString('zh-CN')} 行`}`;
      previous.disabled = page === 1;
      next.disabled = !meta.has_more;
      if (meta.recharge_count != null || meta.total_order_amount != null) {
        const cards = [['充值笔数', Number(meta.recharge_count ?? 0).toLocaleString('zh-CN'), false], ['总付费金额', money(meta.total_order_amount ?? 0), true]];
        summary.replaceChildren(...cards.map(([label, value, isMoney]) => {
          const strong = h('strong', {
            text: value
          });
          if (isMoney) strong.style.color = '#c62828';
          return h('div', {}, [h('span', {
            text: label
          }), strong]);
        }));
        coverage.textContent = (meta.source_shape === 'raw' || meta.source_shape === 'observed_raw' ? `SDK2025 源接口逐行记录 · 范围 ${meta.coverage_day}` : meta.source_shape === 'mixed_observed_unique' ? `逐行记录 ${meta.observed_rows} 条；过渡期另补 ${meta.unique_fallback_rows} 条唯一订单，其原始重复行不可还原 · 范围 ${meta.coverage_day}` : `SDK2025 滚动库按订单号保存唯一记录，重复的接口原始行不可在此库还原 · 范围 ${meta.coverage_day}`) + ' · 金额沿用源值，单位待核对；角色 ID 仅来自订单，不代表全部角色历史。';
      }
    }
    async function load() {
      if (!applied) return;
      error.textContent = '';
      error.hidden = true;
      search.disabled = true;
      summary.replaceChildren();
      coverage.textContent = '';
      const current = ++generation;
      try {
        const params = new URLSearchParams(applied);
        params.set('page', String(page));
        params.set('page_size', String(pageSize));
        params.set('part', 'rows');
        const first = await request(endpoint + '/records?' + params);
        if (current !== generation) return;
        rows = first.data || [];
        meta = {
          ...first.meta,
          total: null
        };
        render();
        search.disabled = false;
        params.set('part', 'summary');
        request(endpoint + '/records?' + params).then(result => {
          if (current === generation) {
            meta = {
              ...meta,
              ...result.meta
            };
            render();
          }
        }).catch(e => {
          if (current === generation) {
            error.textContent = '数据已显示，统计加载失败：' + e.message;
            error.hidden = false;
          }
        });
      } catch (e) {
        if (current === generation) {
          error.textContent = e.message;
          error.hidden = false;
          search.disabled = false;
        }
      }
    }
    function fillChoices(key, items) {
      if (key === 'channel') {
        const current = controls.channel.value;
        const channels = items || [];
        controls.channel.replaceChildren(h('option', {
          value: '',
          text: '全部'
        }), h('option', {
          value: '__juwan__',
          text: '聚玩'
        }), ...channels.map(item => h('option', {
          value: 'channel:' + item,
          text: item
        })));
        controls.channel.value = current === '' || current === '__juwan__' || channels.some(item => 'channel:' + item === current) ? current : '__juwan__';
        return;
      }
      choices[key].replaceChildren(...(items || []).map(item => h('option', {
        value: item
      })));
    }
    request('/api/v1/data-detail/options?event_type=recharge').then(result => {
      options = result.data || {};
      for (const [key, source] of Object.entries({
        project: 'projects',
        package: 'packages',
        promoter: 'promoters',
        promoter_account: 'promoter_account_options',
        platform: 'platforms',
        channel: 'channels'
      })) fillChoices(key, options[source]);
    }).catch(e => {
      error.textContent = e.message;
      error.hidden = false;
    });
    controls.project.addEventListener('change', () => {
      const allowed = controls.project.value ? options.project_packages?.[controls.project.value] || [] : options.packages || [];
      fillChoices('package', allowed);
      if (controls.project.value) controls.package.value = controls.package.value.split(/[,，]/).map(v => v.trim()).filter(v => allowed.includes(v)).join('，');
    });
    controls.promoter.addEventListener('change', () => {
      const allowed = controls.promoter.value ? options.promoter_accounts?.[controls.promoter.value] || [] : options.promoter_account_options || [];
      fillChoices('promoter_account', allowed);
      if (controls.promoter.value && !allowed.includes(controls.promoter_account.value)) controls.promoter_account.value = '';
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      page = 1;
      applied = query();
      exportButton.disabled = false;
      size.disabled = false;
      jump.disabled = false;
      jumpButton.disabled = false;
      load();
    });
    reset.addEventListener('click', () => {
      form.reset();
      controls.channel.value = '__juwan__';
      controls.date_from.value = today();
      controls.date_to.value = today();
      datePicker.setValue(controls.date_from.value, controls.date_to.value);
      page = 1;
      applied = null;
      generation++;
      rows = [];
      meta = {};
      jump.value = '';
      search.disabled = false;
      exportButton.disabled = true;
      size.disabled = true;
      jump.disabled = true;
      jumpButton.disabled = true;
      error.textContent = '';
      error.hidden = true;
      summary.replaceChildren();
      coverage.textContent = '';
      render();
    });
    previous.addEventListener('click', () => {
      if (page > 1) {
        page--;
        load();
      }
    });
    next.addEventListener('click', () => {
      if (meta.has_more) {
        page++;
        load();
      }
    });
    size.addEventListener('change', () => {
      pageSize = Number(size.value);
      page = 1;
      load();
    });
    jumpButton.addEventListener('click', () => {
      const target = Math.trunc(Number(jump.value));
      if (target > 0 && (!Number.isFinite(meta.total) || target <= Math.ceil(meta.total / pageSize))) {
        page = target;
        load();
      }
    });
    exportButton.addEventListener('click', async () => {
      exportButton.disabled = true;
      error.textContent = '';
      error.hidden = true;
      try {
        const response = await fetch(endpoint + '/export?' + new URLSearchParams(applied), {
          credentials: 'same-origin'
        });
        if (!response.ok) {
          const body = await response.json();
          throw new Error(body.detail || '导出失败');
        }
        const url = URL.createObjectURL(await response.blob()),
          link = h('a', {
            href: url,
            download: '充值记录.csv'
          });
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 0);
      } catch (e) {
        error.textContent = e.message;
        error.hidden = false;
      } finally {
        exportButton.disabled = false;
      }
    });
    function renderFieldList() {
      fieldList.replaceChildren(...catalog.map(({
        id,
        label
      }) => {
        const checkbox = h('input', {
          type: 'checkbox'
        });
        checkbox.checked = draftVisible.includes(id);
        checkbox.addEventListener('change', () => {
          draftVisible = checkbox.checked ? [...draftVisible, id] : draftVisible.filter(item => item !== id);
          if (!draftVisible.length) {
            draftVisible = [id];
            checkbox.checked = true;
          }
        });
        return h('label', {
          class: 'dc-dd-field-config-item'
        }, [checkbox, h('span', {
          text: label
        })]);
      }));
    }
    configButton.addEventListener('click', () => {
      draftVisible = visible.slice();
      renderFieldList();
      fields.style.display = 'flex';
    });
    resetFields.addEventListener('click', () => {
      draftVisible = columns.map(([key]) => 'table:' + key);
      renderFieldList();
    });
    cancelFields.addEventListener('click', closeFields);
    applyFields.addEventListener('click', () => {
      visible = draftVisible.slice();
      localStorage.setItem(storageKey, JSON.stringify(visible));
      render();
      closeFields();
    });
    fields.addEventListener('click', event => {
      if (event.target === fields) closeFields();
    });
    size.disabled = true;
    jump.disabled = true;
    jumpButton.disabled = true;
    render();
    return () => datePicker.destroy();
  }
  window.mountRechargeSdk2025 = mountRechargeSdk2025;
})();
