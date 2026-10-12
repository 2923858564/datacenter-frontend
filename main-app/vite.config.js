import { defineConfig } from "vite";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const root = fileURLToPath(new URL("./", import.meta.url));
async function files(dir, prefix = "") {
  const result = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    if (["node_modules", "dist", ".git"].includes(item.name)) continue;
    const relative = path.posix.join(prefix, item.name);
    if (item.isDirectory()) result.push(...await files(path.join(dir, item.name), relative));
    else result.push(relative);
  }
  return result;
}
const sourceRoots = [
  ["src/extensions", ""], ["src/modules", "assets/"], ["src/styles", "assets/"], ["static", ""],
];

export default defineConfig({
  publicDir: false,
  plugins: [{
    name: "independent-page-resources",
    resolveId(id) {
      if (!id.startsWith("/") || id.startsWith("/src/")) return;
      const [pathname, query] = id.split("?");
      const directory = path.join(root, "src/extensions");
      const source = path.resolve(directory, pathname.slice(1));
      if (source.startsWith(directory + path.sep) && existsSync(source)) {
        return source + (query ? "?" + query : "");
      }
    },
    async configureServer(server) {
      const resources = new Map();
      for (const [directory, prefix] of sourceRoots) {
        for (const file of await files(path.join(root, directory))) {
          resources.set("/" + prefix + file, path.join(root, directory, file));
        }
      }
      resources.set("/risk-control-prototype-source.js", path.join(root, "src/extensions/risk-control-prototype.js"));
      server.middlewares.use(async (req, res, next) => {
        const pathname = (req.url || "").split("?")[0];
        if (pathname.startsWith("/api/") && !process.env.DC_API_TARGET) {
          res.statusCode = 503;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          return res.end(JSON.stringify({ detail: "测试后端未配置" }));
        }
        const source = resources.get(pathname);
        if (!source) return next();
        const types = { ".js": "application/javascript", ".css": "text/css", ".png": "image/png" };
        res.setHeader("Content-Type", types[path.extname(source)] || "application/octet-stream");
        res.end(await readFile(source));
      });
    },
    async generateBundle(_options, bundle) {
      this.emitFile({ type: "asset", fileName: "risk-control-prototype-source.js", source: await readFile(path.join(root, "src/extensions/risk-control-prototype.js")) });
      for (const [directory, prefix] of sourceRoots) {
        for (const file of await files(path.join(root, directory))) {
          if (!bundle[prefix + file]) this.emitFile({ type: "asset", fileName: prefix + file, source: await readFile(path.join(root, directory, file)) });
        }
      }
    },
  }],
  server: {
    host: "127.0.0.1", port: 8402,
    proxy: process.env.DC_API_TARGET ? {
      "/api/": { target: process.env.DC_API_TARGET, changeOrigin: true },
    } : undefined,
  },
  build: {
    rollupOptions: {
      external: id => id.startsWith("/") && !id.startsWith("/src/") && /\.js(?:\?|$)/.test(id) && !id.startsWith(root),
      input: Object.fromEntries((await files(root)).filter(file => file.endsWith(".html") && !file.startsWith("node_modules/") && !file.startsWith("dist/") && !file.startsWith("static/")).map(file => [file.replace(/\.html$/, ""), path.join(root, file)])),
    },
  },
});
