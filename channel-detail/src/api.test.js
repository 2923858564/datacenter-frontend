import { beforeEach, describe, expect, it, vi } from 'vitest';
import { request } from './api';
beforeEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});
describe('认证语义', () => {
  it('401清理登录态', async () => {
    sessionStorage.setItem('dc_token', 't');
    sessionStorage.setItem('dc_user', '{}');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', {
      status: 401
    })));
    await expect(request('/x')).rejects.toMatchObject({
      status: 401
    });
    expect(sessionStorage.getItem('dc_token')).toBeNull();
  });
  it('403保留登录态', async () => {
    sessionStorage.setItem('dc_token', 't');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', {
      status: 403
    })));
    await expect(request('/x')).rejects.toMatchObject({
      status: 403
    });
    expect(sessionStorage.getItem('dc_token')).toBe('t');
  });
});
