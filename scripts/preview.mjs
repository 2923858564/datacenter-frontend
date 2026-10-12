import http from "node:http";
import https from "node:https";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const consoleDist = path.join(root, "system-console", "dist");
const mainDist = path.join(root, "main-app", "dist");
const target = process.env.DC_API_TARGET ? new URL(process.env.DC_API_TARGET) : null;
if (target && (!['http:', 'https:'].includes(target.protocol) || target.username || target.password)) {
  throw new Error("DC_API_TARGET must be an HTTP(S) URL without embedded credentials");
}
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2' };
function json(res, status, detail) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ detail }));
}
async function existing(base, relative) {
  const candidate = path.resolve(base, relative);
  if (!candidate.startsWith(base + path.sep)) return null;
  try { return (await stat(candidate)).isFile() ? candidate : null; } catch { return null; }
}
const server = http.createServer(async (req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { return json(res, 400, 'Invalid URL'); }
  if (pathname.startsWith('/api/')) {
    if (!target) return json(res, 503, '测试后端未配置；请通过环境变量 DC_API_TARGET 指定已授权的测试后端');
    const upstreamUrl = new URL(req.url, target);
    const upstream = (target.protocol === 'https:' ? https : http).request(upstreamUrl, {
      method: req.method, headers: { ...req.headers, host: target.host }, timeout: 15000,
    }, response => { res.writeHead(response.statusCode, response.headers); response.pipe(res); });
    upstream.on('timeout', () => upstream.destroy());
    upstream.on('error', () => { if (!res.headersSent) json(res, 502, '测试后端不可达'); else res.destroy(); });
    req.pipe(upstream);
    return;
  }
  if (!['GET', 'HEAD'].includes(req.method)) return json(res, 405, 'Method not allowed');
  const isConsole = pathname === '/system.html' || pathname === '/login' || pathname === '/admin' || pathname.startsWith('/admin/');
  let file = isConsole ? await existing(consoleDist, 'system.html') : null;
  if (isConsole && !file) return json(res, 503, '请先执行 npm run build');
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  file ||= await existing(consoleDist, relative);
  file ||= await existing(mainDist, relative);
  if (!file && !path.extname(pathname)) file = await existing(mainDist, 'index.html');
  if (!file) return json(res, 404, 'Resource not found');
  res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  if (req.method === 'HEAD') return res.end();
  createReadStream(file).on('error', () => res.destroy()).pipe(res);
});
server.listen(Number(process.env.PORT || 8401), '127.0.0.1', () => {
  console.log(`Frontend preview: http://127.0.0.1:${server.address().port}/`);
  console.log(target ? 'Test backend proxy configured' : 'Test backend absent; API requests return JSON 503');
});
