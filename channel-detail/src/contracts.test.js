import { describe, expect, it } from 'vitest';
import { metricValue, normalizePayload, sourceUnavailable } from './contracts';
describe('V9响应契约适配', () => {
  it.each(['items', 'rows', 'list'])('兼容 data.%s', key => {
    const value = normalizePayload({
      data: {
        [key]: [{
          channel_id: 'c1'
        }],
        summary: {
          channel_count: 1
        }
      },
      meta: {
        partial: false
      }
    });
    expect(value.rows).toHaveLength(1);
    expect(value.summary.channel_count).toBe(1);
    expect(value.meta.partial).toBe(false);
  });
  it('对象或缺字段安全降级为空', () => {
    expect(normalizePayload({
      data: {
        unexpected: true
      }
    }).rows).toEqual([]);
    expect(normalizePayload(null)).toMatchObject({
      rows: [],
      summary: {},
      meta: {}
    });
    expect(metricValue(null, 'registration_count')).toBe(0);
  });
  it('基准源不可用成为显式不可用态', () => {
    const value = normalizePayload({
      data: {
        status: 'SOURCE_NOT_AVAILABLE'
      }
    });
    expect(sourceUnavailable(value)).toBe(true);
    expect(value.rows[0]).toMatchObject({
      __sourceUnavailable: true,
      channel_name: '基准源暂不可用'
    });
  });
  it.each(['items', 'rows'])('识别真实 data.%s 行级 metric_status', key => {
    const response = {
      ok: true,
      data: {
        [key]: [{
          channel_id: 'self',
          channel_name: '聚玩',
          metric_status: 'SOURCE_NOT_AVAILABLE',
          benchmark_index: null
        }],
        summary: {}
      },
      meta: {
        partial: false
      }
    };
    const value = normalizePayload(response);
    expect(value.status).toBe('SOURCE_NOT_AVAILABLE');
    expect(sourceUnavailable(value)).toBe(true);
    expect(value.rows[0]).toMatchObject({
      __sourceUnavailable: true,
      channel_name: '基准源暂不可用'
    });
  });
  it('占比指标兼容metric字段和值别名', () => {
    expect(metricValue({
      value: '12'
    }, 'registration_count')).toBe(12);
    expect(metricValue({
      amount: '9.5'
    }, 'revenue_amount')).toBe(9.5);
  });
});
