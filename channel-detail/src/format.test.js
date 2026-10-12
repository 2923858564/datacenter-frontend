import { describe, expect, it } from 'vitest';
import { pointView } from './format';
describe('点位方向', () => {
  it('FLAT标准化为0%', () => expect(pointView({
    direction: 'FLAT',
    access_point: .76,
    point_diff: null
  })).toEqual({
    value: '0%',
    tip: '76% - 76% = 0%',
    label: '平放'
  }));
  it('未知点位不伪造', () => expect(pointView({
    direction: 'OUT',
    point_diff: null
  }).value).toBe('--'));
});
