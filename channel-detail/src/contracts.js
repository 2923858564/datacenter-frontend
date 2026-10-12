export function normalizePayload(response) {
  const e = response && typeof response === 'object' ? response : {},
    d = e.data,
    c = d && typeof d === 'object' && !Array.isArray(d) ? d : {},
    candidate = Array.isArray(d) ? d : c.items ?? c.rows ?? c.list,
    meta = objectOrEmpty(e.meta ?? c.meta),
    status = c.status ?? e.status ?? e.code ?? null,
    rows = Array.isArray(candidate) ? candidate.filter(row => row && typeof row === 'object') : [],
    unavailable = sourceUnavailable({
      status,
      meta
    }) || rows.some(row => row.metric_status === 'SOURCE_NOT_AVAILABLE');
  return {
    rows: unavailable ? [{
      channel_name: '基准源暂不可用',
      benchmark_index: 0,
      __sourceUnavailable: true
    }] : rows,
    summary: objectOrEmpty(c.summary ?? e.summary),
    meta,
    status: unavailable ? 'SOURCE_NOT_AVAILABLE' : status
  };
}
export function objectOrEmpty(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}
export function metricValue(row, metric) {
  if (!row || typeof row !== 'object') return 0;
  const aliases = metric === 'revenue_amount' ? ['revenue_amount', 'amount', 'value'] : [metric, 'registration_count', 'count', 'value'],
    found = aliases.find(key => Number.isFinite(Number(row[key])));
  return found ? Number(row[found]) : 0;
}
export function sourceUnavailable(payload) {
  return payload?.status === 'SOURCE_NOT_AVAILABLE' || payload?.meta?.source_status === 'SOURCE_NOT_AVAILABLE' || payload?.meta?.benchmark_status === 'SOURCE_NOT_AVAILABLE';
}
