export const money = v => v == null ? '--' : new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2
  }).format(Number(v)),
  number = v => v == null ? '--' : new Intl.NumberFormat('zh-CN').format(Number(v)),
  percent = v => v == null ? '--' : `${(Number(v) * (Math.abs(Number(v)) <= 1 ? 100 : 1)).toFixed(2).replace(/\.00$/, '')}%`;
export function pointView(r) {
  if (r.direction === 'FLAT') return {
    value: '0%',
    tip: `${percent(r.access_point)} - ${percent(r.access_point)} = 0%`,
    label: '平放'
  };
  if (r.point_diff == null) return {
    value: '--',
    tip: '点位版本或项目映射不完整',
    label: r.direction
  };
  return {
    value: percent(r.point_diff),
    tip: `${percent(r.access_point)} - ${percent(r.release_point)} = ${percent(r.point_diff)}`,
    label: r.direction === 'OUT' ? '放出' : '接入'
  };
}
