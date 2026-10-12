import { useEffect, useRef, useState } from "react";
import { Link, Route, Routes, useParams, useSearchParams } from "react-router-dom";
import { channelApi } from "./api";
import { money, number, percent, pointView } from "./format";
import { metricValue, normalizePayload } from "./contracts";
const unwrap = normalizePayload;
const today = () => new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Shanghai"
  }),
  start = () => today().slice(0, 8) + "01";
const anomalies = [["excluded_gs_reuse_count", "GS复用"], ["unmapped_channel_count", "待映射渠道"], ["unmapped_project_count", "待映射项目"], ["orphan_registration_count", "孤儿注册"], ["orphan_recharge_count", "孤儿充值"], ["unknown_point_version_count", "点位版本未知"]];
function useLoad(fn, deps) {
  const [s, set] = useState({
      loading: true
    }),
    seq = useRef(0),
    reload = () => set(x => ({
      ...x,
      retry: (x.retry || 0) + 1
    }));
  useEffect(() => {
    const id = ++seq.current,
      c = new AbortController();
    set(x => ({
      ...x,
      loading: true,
      error: null
    }));
    fn(c.signal).then(data => id === seq.current && set({
      data,
      loading: false
    })).catch(error => id === seq.current && set({
      error,
      loading: false
    }));
    return () => c.abort();
  }, [...deps, s.retry]);
  return [s, reload];
}
function Shell({
  children
}) {
  return <div className="shell">
      <header>
        <b>数据中台</b>
        <nav>
          核心看板 · 业务管理 · <span>商务</span> · 系统管理
        </nav>
        <i>渠道经营</i>
      </header>
      <aside>
        <strong>商务管理</strong>
        <a>渠道详情</a>
      </aside>
      <main>{children}</main>
    </div>;
}
function Load({
  s,
  retry
}) {
  if (s.loading) return <div className="state">
        <i className="spinner" />
        正在加载真实数据…
      </div>;
  if (!s.error) return null;
  const e = s.error,
    title = e.status === 401 ? "登录已过期" : e.status === 403 ? "无权访问（403）" : e.code === "TIMEOUT" ? "请求超时" : "数据加载失败";
  return <div className="state error">
      <b>{title}</b>
      <p>{e.message}</p>
      {e.status === 401 ? <a href="/login">重新登录</a> : <button onClick={retry}>重试</button>}
    </div>;
}
function Integrity({
  m = {}
}) {
  if (m.scope_status === "unconfigured") return <div className="notice warn">
        <b>数据范围未配置</b>当前账号返回空数据，请联系管理员配置范围。
      </div>;
  const a = anomalies.filter(([k]) => +m[k] > 0);
  return <>
      <div className={`notice ${m.partial ? "warn" : "ok"}`}>
        <b>{m.partial ? "PARTIAL · 部分数据已隔离" : "数据完整性正常"}</b>
        <span>更新时间：{m.data_updated_at || "--"}</span>
        {a.length > 0 && <span>{a.map(([k, n]) => `${n} ${number(m[k])}`).join("；")}</span>}
      </div>
      {+m.excluded_gs_reuse_count > 0 && <div className="notice info">
          GS复用已排除：{number(m.excluded_gs_reuse_count)} 条，流水{" "}
          {money(m.excluded_gs_reuse_revenue_amount)}。
        </div>}
    </>;
}
function Dates({
  p,
  set
}) {
  return <div className="dates">
      <label>
        开始日期
        <input type="date" value={p.date_from} onChange={e => set({
        ...p,
        date_from: e.target.value,
        page: 1
      })} />
      </label>
      <span>→</span>
      <label>
        结束日期
        <input type="date" value={p.date_to} onChange={e => set({
        ...p,
        date_to: e.target.value,
        page: 1
      })} />
      </label>
    </div>;
}
const Empty = () => <div className="empty">当前筛选范围暂无数据</div>;
function Kpis({
  s = {}
}) {
  return <div className="kpis">
      <article>
        <span>渠道归属方</span>
        <b>{number(s.channel_count)}</b>
      </article>
      <article>
        <span>渠道账号</span>
        <b>{number(s.account_count)}</b>
      </article>
      <article>
        <span>注册账号</span>
        <b>{number(s.registration_count)}</b>
      </article>
      <article>
        <span>渠道流水</span>
        <b>{money(s.revenue_amount)}</b>
      </article>
    </div>;
}
function Bars({
  rows = [],
  keyName,
  label
}) {
  const safe = Array.isArray(rows) ? rows : [];
  if (safe.some(x => x?.__sourceUnavailable)) return <div className="empty">
        <b>基准源暂不可用</b>
        <p>当前无法计算聚玩基准指数，其他渠道数据不受影响。</p>
      </div>;
  const max = Math.max(1, ...safe.map(x => metricValue(x, keyName)));
  return <div className="bars">
      {safe.length ? safe.map((x, i) => {
      const value = metricValue(x, keyName);
      return <div className="bar-row" key={x?.[label] || i}>
              <span>{x?.[label] || "--"}</span>
              <i>
                <b style={{
            width: `${Math.max(2, value / max * 100)}%`
          }} />
              </i>
              <em>
                {keyName.includes("amount") ? money(value) : number(value)}
              </em>
            </div>;
    }) : <Empty />}
    </div>;
}
function Donut({
  rows = [],
  metric = "registration_count"
}) {
  const safe = Array.isArray(rows) ? rows : [],
    total = safe.reduce((s, x) => s + metricValue(x, metric), 0),
    colors = ["#1677ff", "#36cfc9", "#9254de", "#fa8c16", "#52c41a"];
  let n = 0;
  const stops = safe.map((x, i) => {
    const a = n / Math.max(total, 1) * 100;
    n += metricValue(x, metric);
    return `${colors[i % 5]} ${a}% ${n / Math.max(total, 1) * 100}%`;
  }).join(",");
  return <div className="donut-wrap">
      <div className="donut" style={{
      background: total ? `conic-gradient(${stops})` : "#eef0f2"
    }}>
        <span>
          <b>{number(total)}</b>注册合计
        </span>
      </div>
      <div className="donut-labels" aria-label="渠道占比明细">
        {safe.map((x, i) => {
        const value = metricValue(x, metric);
        return <div className="donut-label" key={x.channel_id || i}>
              <i style={{
            background: colors[i % 5]
          }} />
              {x.channel_name || "--"}
              <b>{total ? percent(value / total) : "0%"}</b>
            </div>;
      })}
      </div>
    </div>;
}
function List() {
  const [q, setQ] = useSearchParams(),
    [metric, setMetric] = useState(q.get("metric") || "registration_count"),
    p = {
      date_from: q.get("date_from") || start(),
      date_to: q.get("date_to") || today(),
      search: q.get("search") || "",
      status: q.get("status") || "",
      page: +(q.get("page") || 1),
      page_size: 20,
      sort_by: q.get("sort_by") || "revenue_amount",
      sort_order: q.get("sort_order") || "desc"
    },
    set = x => setQ(Object.fromEntries(Object.entries(x).filter(([, v]) => v !== "")));
  const [s, retry] = useLoad(async signal => {
      const b = {
          date_from: p.date_from,
          date_to: p.date_to,
          timezone: "Asia/Shanghai"
        },
        [a, c, d] = await Promise.all([channelApi.channels({
          ...b,
          ...p
        }, {
          signal
        }), channelApi.share({
          ...b,
          metric
        }, {
          signal
        }), channelApi.benchmark({
          ...b,
          metric
        }, {
          signal
        })]);
      return {
        main: unwrap(a),
        share: unwrap(c),
        benchmark: unwrap(d)
      };
    }, [q.toString(), metric]),
    d = s.data;
  return <>
      <div className="page-head">
        <div>
          <h1>渠道经营列表</h1>
          <p>仅展示显式映射成功的正常渠道，聚玩作为独立基准。</p>
        </div>
      </div>
      <Load s={s} retry={retry} />
      {d && <>
          <Integrity m={d.main.meta} />
          <section className="toolbar">
            <input aria-label="搜索渠道" placeholder="搜索渠道或公司" value={p.search} onChange={e => set({
          ...p,
          search: e.target.value,
          page: 1
        })} />
            <select aria-label="数据状态" value={p.status} onChange={e => set({
          ...p,
          status: e.target.value,
          page: 1
        })}>
              <option value="">全部状态</option>
              <option value="NORMAL">正常</option>
              <option value="PARTIAL">部分数据</option>
              <option value="ANOMALOUS">异常</option>
            </select>
            <Dates p={p} set={set} />
          </section>
          <Kpis s={d.main.summary} />
          <section className="panel">
            <div className="panel-title">
              渠道经营列表 <small>点击渠道名称进入收益下钻</small>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>渠道</th>
                    <th>公司主体</th>
                    <th>项目数</th>
                    <th>账号数</th>
                    <th>注册账号</th>
                    <th>渠道流水</th>
                    <th>应结出流水</th>
                    <th>较上期</th>
                    <th>数据状态</th>
                  </tr>
                </thead>
                <tbody>
                  {d.main.rows.length ? d.main.rows.map(r => <tr key={r.channel_id}>
                        <td>
                          <Link to={`/channels/${encodeURIComponent(r.channel_id)}?date_from=${p.date_from}&date_to=${p.date_to}`}>
                            {r.channel_name}
                          </Link>
                        </td>
                        <td>{r.company_name || "--"}</td>
                        <td>{number(r.project_count)}</td>
                        <td>{number(r.account_count)}</td>
                        <td>{number(r.registration_count)}</td>
                        <td>{money(r.revenue_amount)}</td>
                        <td>{money(r.settlement_out_amount)}</td>
                        <td>{percent(r.period_change_rate)}</td>
                        <td>
                          <span className={`pill ${r.data_status === "PARTIAL" ? "warn" : ""}`}>
                            {r.data_status || "--"}
                          </span>
                        </td>
                      </tr>) : <tr>
                      <td colSpan="9">
                        <Empty />
                      </td>
                    </tr>}
                </tbody>
              </table>
            </div>
          </section>
          <div className="analysis">
            <section className="panel">
              <div className="panel-title metric-title">
                <span>渠道结构占比</span>
                <span className="metric-switch" role="group" aria-label="占比指标">
                  <button className={metric === "registration_count" ? "active" : ""} onClick={() => {
                setMetric("registration_count");
                set({
                  ...p,
                  metric: "registration_count"
                });
              }}>
                    注册账号
                  </button>
                  <button className={metric === "revenue_amount" ? "active" : ""} onClick={() => {
                setMetric("revenue_amount");
                set({
                  ...p,
                  metric: "revenue_amount"
                });
              }}>
                    渠道流水
                  </button>
                </span>
              </div>
              <Donut rows={d.share.rows} />
            </section>
            <section className="panel">
              <div className="panel-title metric-title">
                <span>聚玩基准指数 <small>聚玩 = 100%</small></span>
                <span className="metric-switch" role="group" aria-label="基准指标">
                  <button className={metric === "registration_count" ? "active" : ""} onClick={() => {
                setMetric("registration_count");
                set({
                  ...p,
                  metric: "registration_count"
                });
              }}>
                    注册账号
                  </button>
                  <button className={metric === "revenue_amount" ? "active" : ""} onClick={() => {
                setMetric("revenue_amount");
                set({
                  ...p,
                  metric: "revenue_amount"
                });
              }}>
                    渠道流水
                  </button>
                </span>
              </div>
              <Bars rows={d.benchmark.rows} keyName={metric === "revenue_amount" ? "revenue_amount" : "benchmark_index"} label="channel_name" />
            </section>
          </div>
        </>}
    </>;
}
function Detail() {
  const {
      id
    } = useParams(),
    [q, setQ] = useSearchParams(),
    p = {
      date_from: q.get("date_from") || start(),
      date_to: q.get("date_to") || today(),
      timezone: "Asia/Shanghai"
    };
  const [s, retry] = useLoad(async signal => {
      const [a, b] = await Promise.all([channelApi.trend(id, p, {
        signal
      }), channelApi.projects(id, {
        ...p,
        page: 1,
        page_size: 100,
        sort_by: "revenue_amount",
        sort_order: "desc"
      }, {
        signal
      })]);
      return {
        trend: unwrap(a),
        projects: unwrap(b)
      };
    }, [id, q.toString()]),
    d = s.data,
    summary = d?.projects.summary || {};
  return <>
      <div className="page-head">
        <div>
          <Link className="back" to={`/?${q}`}>
            ← 返回渠道列表
          </Link>
          <h1>{summary.channel_name || "渠道收益详情"}</h1>
          <p>{summary.company_name || "按业务日期展示真实经营数据"}</p>
        </div>
        <Dates p={p} set={setQ} />
      </div>
      <Load s={s} retry={retry} />
      {d && <>
          <Integrity m={d.projects.meta} />
          <Kpis s={summary} />
          <section className="panel">
            <div className="panel-title">渠道收益趋势</div>
            <Bars rows={d.trend.rows} keyName="revenue_amount" label="business_date" />
          </section>
          <section className="panel">
            <div className="panel-title">
              项目数据排行 <small>账号下钻在增量B交付</small>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>项目</th>
                    <th>方向</th>
                    <th>账号数</th>
                    <th>注册账号</th>
                    <th>渠道流水</th>
                    <th>接入点位</th>
                    <th>放出点位</th>
                    <th>点位差</th>
                    <th>应结出流水</th>
                    <th>数据状态</th>
                  </tr>
                </thead>
                <tbody>
                  {d.projects.rows.length ? d.projects.rows.map(r => {
                const v = pointView(r);
                return <tr key={[r.project_id, r.direction, r.point_version_id || "no-point-version", r.settlement_status || "no-settlement-status"].join(":")}>
                          <td><Link to={`/channels/${encodeURIComponent(id)}/projects/${encodeURIComponent(r.project_id)}?date_from=${p.date_from}&date_to=${p.date_to}`}>{r.project_name}</Link></td>
                          <td>
                            <span className={`pill ${r.direction === "FLAT" ? "flat" : ""}`}>
                              {v.label}
                            </span>
                          </td>
                          <td>{number(r.account_count)}</td>
                          <td>{number(r.registration_count)}</td>
                          <td>{money(r.revenue_amount)}</td>
                          <td>{percent(r.access_point)}</td>
                          <td>{percent(r.release_point)}</td>
                          <td>
                            <span className="point" tabIndex="0" title={v.tip}>
                              {v.value}
                            </span>
                          </td>
                          <td>{money(r.settlement_out_amount)}</td>
                          <td>{r.data_status || "--"}</td>
                        </tr>;
              }) : <tr>
                      <td colSpan="10">
                        <Empty />
                      </td>
                    </tr>}
                </tbody>
              </table>
            </div>
          </section>
        </>}
    </>;
}
function MetricCards({
  metrics = []
}) {
  return <div className="kpis promoter-kpis">
      {metrics.map(item => {
      const unavailable = item.metric_status === "SOURCE_NOT_AVAILABLE" || item.value == null;
      const isMoney = /amount|paid_amount|recharge_amount/.test(item.key || "");
      return <article key={item.key}>
            <span>{item.label}</span>
            <b>{unavailable ? "--" : isMoney ? money(item.value) : number(item.value)}</b>
            {unavailable && <small className="muted">数据源不可用</small>}
          </article>;
    })}
    </div>;
}
function ExportButton({
  kind,
  params
}) {
  const [state, setState] = useState("idle");
  const exportNow = async () => {
    setState("loading");
    try {
      const created = await channelApi.createExport({
        kind,
        ...params
      });
      const job = created?.data || created;
      if (!job?.job_id) throw new Error("导出任务创建失败");
      await channelApi.exportStatus(job.job_id);
      const blob = await channelApi.downloadExport(job.job_id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = job.filename || `channel-detail-${kind}.csv`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setState("done");
    } catch (error) {
      setState(error?.code === "TIMEOUT" ? "timeout" : "error");
    }
  };
  return <button className="export-button" onClick={exportNow} disabled={state === "loading"}>
      {state === "loading" ? "导出中…" : state === "done" ? "已导出" : state === "timeout" ? "导出超时" : state === "error" ? "导出失败" : "⇩ 导出"}
    </button>;
}
function Pager({
  data,
  onChange
}) {
  if (!data || data.total <= data.page_size) return null;
  const pages = Math.ceil(data.total / data.page_size);
  return <div className="pager">
      <button disabled={data.page <= 1} onClick={() => onChange(data.page - 1)}>上一页</button>
      <span>{data.page} / {pages}（共 {data.total} 条）</span>
      <button disabled={data.page >= pages} onClick={() => onChange(data.page + 1)}>下一页</button>
    </div>;
}
function ProjectDetail() {
  const {
      channelId,
      projectId
    } = useParams(),
    [q, setQ] = useSearchParams(),
    p = {
      date_from: q.get("date_from") || start(),
      date_to: q.get("date_to") || today(),
      page: +(q.get("page") || 1),
      page_size: 20,
      sort_by: q.get("sort_by") || "revenue_amount",
      sort_order: q.get("sort_order") || "desc"
    },
    set = next => setQ(Object.fromEntries(Object.entries(next).filter(([, value]) => value !== "")));
  const [s, retry] = useLoad(async signal => unwrap(await channelApi.accounts(channelId, projectId, p, {
      signal
    })), [channelId, projectId, q.toString()]),
    d = s.data,
    summary = d?.summary || {};
  const sort = field => set({
    ...p,
    sort_by: field,
    sort_order: p.sort_by === field && p.sort_order === "desc" ? "asc" : "desc",
    page: 1
  });
  return <>
      <div className="page-head">
        <div>
          <Link className="back" to={`/channels/${encodeURIComponent(channelId)}?date_from=${p.date_from}&date_to=${p.date_to}`}>← 返回渠道收益详情</Link>
          <h1>{projectId} · 渠道账号详情</h1>
          <p>仅展示当前渠道和项目范围内的渠道账号，账号唯一键包含平台、包体和项目。</p>
        </div>
        <Dates p={p} set={set} />
      </div>
      <Load s={s} retry={retry} />
      {d && <>
        <Integrity m={d.meta} />
        <div className="kpis">
          <article><span>渠道账号数</span><b>{number(summary.account_count)}</b></article>
          <article><span>注册账号</span><b>{number(summary.registration_count)}</b></article>
          <article><span>渠道流水</span><b>{money(summary.revenue_amount)}</b></article>
          <article><span>应结出流水</span><b>{money(summary.settlement_out_amount)}</b></article>
        </div>
        <section className="panel ranking-panel">
          <div className="panel-title metric-title"><span>渠道账号数据排行 <small>汇总=区间去重</small></span><ExportButton kind="accounts" params={{
            channel_id: channelId,
            project_id: projectId,
            date_from: p.date_from,
            date_to: p.date_to
          }} /></div>
          <div className="table-wrap"><table>
            <thead><tr><th>#</th><th><button className="sort-button" onClick={() => sort("promoter_account")}>渠道账号</button></th><th><button className="sort-button" onClick={() => sort("registration_count")}>注册账号</button></th><th><button className="sort-button" onClick={() => sort("revenue_amount")}>渠道流水</button></th><th>放出点位</th><th><button className="sort-button" onClick={() => sort("settlement_out_amount")}>应结出流水</button></th><th>ARPU</th><th>ARPPU</th></tr></thead>
            <tbody>{d.rows.length ? d.rows.map((row, index) => <tr key={`${row.promoter_id}-${row.package}`}>
              <td>{(d.page - 1) * d.page_size + index + 1}</td>
              <td><Link to={`/promoters/${encodeURIComponent(row.promoter_id)}?date_from=${p.date_from}&date_to=${p.date_to}&channel_id=${encodeURIComponent(channelId)}&project_id=${encodeURIComponent(projectId)}`}>{row.promoter_account}</Link></td>
              <td>{number(row.registration_count)}</td><td>{money(row.revenue_amount)}</td><td>{percent(row.release_point)}</td><td>{money(row.settlement_out_amount)}</td><td>{money(row.arpu)}</td><td>{money(row.arppu)}</td>
            </tr>) : <tr><td colSpan="8"><Empty /></td></tr>}</tbody>
          </table></div>
          <Pager data={d} onChange={page => set({
          ...p,
          page
        })} />
        </section>
      </>}
    </>;
}
function PromoterDetail() {
  const {
      promoterId
    } = useParams(),
    [q, setQ] = useSearchParams(),
    tab = q.get("tab") || "overview",
    p = {
      date_from: q.get("date_from") || start(),
      date_to: q.get("date_to") || today(),
      page: +(q.get("page") || 1),
      page_size: 20,
      channel_id: q.get("channel_id") || "",
      project_id: q.get("project_id") || ""
    },
    set = next => setQ(Object.fromEntries(Object.entries({
      ...next,
      channel_id: q.get("channel_id") || "",
      project_id: q.get("project_id") || ""
    }).filter(([, value]) => value !== "")));
  const [s, retry] = useLoad(async signal => {
      const [summary, trend, registrations, recharges] = await Promise.all([channelApi.promoterSummary(promoterId, p, {
        signal
      }), channelApi.promoterTrend(promoterId, p, {
        signal
      }), channelApi.registrations(promoterId, p, {
        signal
      }), channelApi.recharges(promoterId, p, {
        signal
      })]);
      return {
        summary: summary.data || {},
        summaryMeta: summary.meta || {},
        trend: unwrap(trend),
        registrations: unwrap(registrations),
        recharges: unwrap(recharges)
      };
    }, [promoterId, q.toString()]),
    d = s.data,
    summary = d?.summary || {},
    back = q.get("channel_id") && q.get("project_id") ? `/channels/${encodeURIComponent(q.get("channel_id"))}/projects/${encodeURIComponent(q.get("project_id"))}?date_from=${p.date_from}&date_to=${p.date_to}` : "/";
  const selectTab = value => {
    set({
      ...p,
      tab: value,
      page: 1
    });
  };
  const metrics = Array.isArray(summary.metrics) ? summary.metrics : [];
  return <>
      <div className="page-head"><div><Link className="back" to={back}>← 返回项目详情</Link><h1>{summary.promoter_account || promoterId} · 推广员详情</h1><p>{summary.project_name || "渠道账号真实经营数据"} · 渠道账号：{summary.promoter_account || promoterId}</p></div><Dates p={p} set={set} /></div>
      <Load s={s} retry={retry} />
      {d && <>
        <Integrity m={d.summaryMeta || d.registrations.meta} />
        <MetricCards metrics={metrics} />
        <div className="detail-tabs" role="tablist">
          {[['overview', '基础数据'], ['registrations', '注册明细'], ['recharges', '充值明细'], ['trend', '数据趋势']].map(([value, label]) => <button key={value} className={tab === value ? "active" : ""} onClick={() => selectTab(value)}>{label}</button>)}
        </div>
        {tab === "overview" && <section className="panel ranking-panel"><div className="panel-title"><span>基础数据报表</span><ExportButton kind="recharges" params={{
            promoter_id: promoterId,
            channel_id: p.channel_id,
            project_id: p.project_id,
            date_from: p.date_from,
            date_to: p.date_to
          }} /></div><div className="table-wrap"><table><thead><tr><th>日期</th><th>新账号</th><th>新付费数</th><th>新付费总额</th><th>新付费率</th><th>活跃</th><th>付费数</th><th>付费总额</th><th>付费率</th><th>ARPU</th><th>ARPPU</th></tr></thead><tbody>{d.trend.rows.length ? d.trend.rows.map(row => <tr key={row.date}><td>{row.date}</td><td>{number(row.new_account_count)}</td><td>{number(row.recharge_user_count)}</td><td>{money(row.new_recharge_amount)}</td><td>{percent(row.recharge_rate)}</td><td>--</td><td>{number(row.paid_count)}</td><td>{money(row.recharge_amount)}</td><td>{percent(row.recharge_rate)}</td><td>{money(row.recharge_amount && row.new_account_count ? Number(row.recharge_amount) / row.new_account_count : null)}</td><td>{money(row.recharge_amount && row.paid_count ? Number(row.recharge_amount) / row.paid_count : null)}</td></tr>) : <tr><td colSpan="11"><Empty /></td></tr>}</tbody></table></div></section>}
        {tab === "registrations" && <section className="panel ranking-panel"><div className="panel-title"><span>注册明细</span><ExportButton kind="registrations" params={{
            promoter_id: promoterId,
            channel_id: p.channel_id,
            project_id: p.project_id,
            date_from: p.date_from,
            date_to: p.date_to
          }} /></div><div className="table-wrap"><table><thead><tr><th>用户ID</th><th>用户名</th><th>推广账号</th><th>注册包体</th><th>服务器</th><th>注册时间</th><th>注册设备</th><th>数据来源</th></tr></thead><tbody>{d.registrations.rows.length ? d.registrations.rows.map((row, i) => <tr key={`${row.user_id}-${i}`}><td>{row.user_id}</td><td>{row.user_name}</td><td>{row.promoter_account}</td><td>{row.package}</td><td>{row.server}</td><td>{row.registered_at}</td><td>{row.device_type}</td><td>{row.source_platform}</td></tr>) : <tr><td colSpan="8"><Empty /></td></tr>}</tbody></table></div><Pager data={d.registrations} onChange={page => set({
          ...p,
          tab,
          page
        })} /></section>}
        {tab === "recharges" && <section className="panel ranking-panel"><div className="panel-title"><span>充值明细（一级平台口径）</span><ExportButton kind="recharges" params={{
            promoter_id: promoterId,
            channel_id: p.channel_id,
            project_id: p.project_id,
            date_from: p.date_from,
            date_to: p.date_to
          }} /></div><div className="table-wrap"><table><thead><tr><th>订单号</th><th>用户名</th><th>推广账号</th><th>服务器</th><th>角色名</th><th>实际支付</th><th>充值方式</th><th>支付时间</th><th>支付状态</th><th>数据来源</th></tr></thead><tbody>{d.recharges.rows.length ? d.recharges.rows.map((row, i) => <tr key={`${row.order_id}-${i}`}><td>{row.order_id}</td><td>{row.user_name}</td><td>{row.promoter_account}</td><td>{row.server}</td><td>{row.role_name}</td><td>{money(row.pay_amount)}</td><td>{row.payment_method}</td><td>{row.paid_at}</td><td><span className="pill">{row.payment_status}</span></td><td>{row.source_platform}</td></tr>) : <tr><td colSpan="10"><Empty /></td></tr>}</tbody></table></div><Pager data={d.recharges} onChange={page => set({
          ...p,
          tab,
          page
        })} /></section>}
        {tab === "trend" && <section className="panel"><div className="panel-title metric-title"><span>注册 / 充值趋势</span><span className="metric-switch"><button className={q.get("metric") !== "recharges" ? "active" : ""} onClick={() => set({
              ...p,
              tab: "trend",
              metric: "registrations"
            })}>注册账号</button><button className={q.get("metric") === "recharges" ? "active" : ""} onClick={() => set({
              ...p,
              tab: "trend",
              metric: "recharges"
            })}>充值流水</button></span></div><Bars rows={d.trend.rows} keyName={q.get("metric") === "recharges" ? "recharge_amount" : "registration_count"} label="date" /></section>}
      </>}
    </>;
}
export default function App() {
  return <Shell>
      <Routes>
        <Route path="/" element={<List />} />
        <Route path="/channels/:id" element={<Detail />} />
        <Route path="/channels/:channelId/projects/:projectId" element={<ProjectDetail />} />
        <Route path="/promoters/:promoterId" element={<PromoterDetail />} />
        <Route path="*" element={<div className="state error">
              <b>页面不存在</b>
              <p>
                <Link to="/">返回渠道列表</Link>
              </p>
            </div>} />
      </Routes>
    </Shell>;
}
