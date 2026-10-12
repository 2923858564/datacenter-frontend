export const TOKEN_KEY = 'dc_token',
  USER_KEY = 'dc_user';
export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
export async function request(path, {
  timeout = 15000,
  signal,
  ...options
} = {}) {
  const c = new AbortController(),
    abort = () => c.abort();
  signal?.addEventListener('abort', abort, {
    once: true
  });
  const timer = setTimeout(abort, timeout),
    headers = {
      Accept: 'application/json',
      ...(options.body ? {
        'Content-Type': 'application/json'
      } : {}),
      ...options.headers
    },
    token = sessionStorage.getItem(TOKEN_KEY);
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(path, {
        ...options,
        headers,
        signal: c.signal
      }),
      body = await res.json().catch(() => ({}));
    if (res.status === 401) {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
      window.dispatchEvent(new Event('channel-auth-expired'));
      throw new ApiError(body.detail || '登录已过期', 401);
    }
    if (!res.ok) throw new ApiError(body.detail || body.message || `请求失败（${res.status}）`, res.status, body.code);
    return body;
  } catch (e) {
    if (e.name === 'AbortError') throw new ApiError('请求超时，请稍后重试', 408, 'TIMEOUT');
    throw e;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}
const qs = p => {
    const s = new URLSearchParams();
    Object.entries(p || {}).forEach(([k, v]) => v !== '' && v != null && s.set(k, String(v)));
    return s.size ? `?${s}` : '';
  },
  get = (p, q, o) => request(p + qs(q), o);
export async function downloadFile(path, {
  timeout = 15000,
  signal
} = {}) {
  const c = new AbortController(),
    abort = () => c.abort();
  signal?.addEventListener('abort', abort, {
    once: true
  });
  const timer = setTimeout(abort, timeout),
    token = sessionStorage.getItem(TOKEN_KEY);
  try {
    const r = await fetch(path, {
      headers: {
        Accept: 'text/csv',
        ...(token ? {
          Authorization: `Bearer ${token}`
        } : {})
      },
      signal: c.signal
    });
    if (r.status === 401) {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
      throw new ApiError('登录已过期', 401);
    }
    if (!r.ok) throw new ApiError(`下载失败（${r.status}）`, r.status);
    return await r.blob();
  } catch (e) {
    if (e.name === 'AbortError') throw new ApiError('请求超时，请稍后重试', 408, 'TIMEOUT');
    throw e;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}
export const channelApi = {
  channels: (p, o) => get('/api/v1/channel-detail-v9/channels', p, o),
  share: (p, o) => get('/api/v1/channel-detail-v9/charts/channel-share', p, o),
  benchmark: (p, o) => get('/api/v1/channel-detail-v9/charts/benchmark', p, o),
  trend: (id, p, o) => get(`/api/v1/channel-detail-v9/channels/${encodeURIComponent(id)}/trend`, p, o),
  projects: (id, p, o) => get(`/api/v1/channel-detail-v9/channels/${encodeURIComponent(id)}/projects`, p, o),
  accounts: (channelId, projectId, p, o) => get(`/api/v1/channel-detail-v9/channels/${encodeURIComponent(channelId)}/projects/${encodeURIComponent(projectId)}/accounts`, p, o),
  promoterSummary: (id, p, o) => get(`/api/v1/channel-detail-v9/promoters/${encodeURIComponent(id)}/summary`, p, o),
  promoterTrend: (id, p, o) => get(`/api/v1/channel-detail-v9/promoters/${encodeURIComponent(id)}/trend`, p, o),
  registrations: (id, p, o) => get(`/api/v1/channel-detail-v9/promoters/${encodeURIComponent(id)}/registrations`, p, o),
  recharges: (id, p, o) => get(`/api/v1/channel-detail-v9/promoters/${encodeURIComponent(id)}/recharges`, p, o),
  createExport: (body, o) => request('/api/v1/channel-detail-v9/exports', {
    method: 'POST',
    body: JSON.stringify(body),
    ...(o || {})
  }),
  exportStatus: (id, p, o) => get(`/api/v1/channel-detail-v9/exports/${encodeURIComponent(id)}`, p, o),
  downloadExport: (id, o) => downloadFile(`/api/v1/channel-detail-v9/exports/${encodeURIComponent(id)}?download=true`, o)
};
