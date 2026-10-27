/* Server pengembangan full-stack tanpa dependensi:
   - Port 8080: melayani file statis repo (portal).
   - Semua request /api/* di-proxy ke API Express (default http://127.0.0.1:3000)
     sehingga frontend memanggil /api lalu terhubung ke backend di satu asal.

   Pemakaian:
     node scripts/dev.mjs            # API di 127.0.0.1:3000, static di 8080
   Variabel lingkungan opsional:
     STATIC_PORT=8080  API_ORIGIN=http://127.0.0.1:3000  BIND=127.0.0.1
*/
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STATIC_PORT = Number(process.env.STATIC_PORT || 8080);
const API_ORIGIN = process.env.API_ORIGIN || "http://127.0.0.1:3000";
const BIND = process.env.BIND || "127.0.0.1";
const API_PREFIX = "/api";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".map": "application/json",
};

function serveError(res, code, text) {
  if (!res.headersSent) {
    res.writeHead(code, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
  }
  res.end(text);
}

function serveStatic(req, res) {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
  } catch {
    return serveError(res, 400, "URL tidak valid");
  }
  if (urlPath.endsWith("/")) urlPath += "index.html";
  const full = path.resolve(ROOT, "." + urlPath);
  if (!full.startsWith(ROOT + path.sep) && full !== ROOT) {
    return serveError(res, 403, "Ditolak");
  }
  fs.stat(full, (err, st) => {
    if (err || !st.isFile()) {
      return serveError(res, 404, "Not found: " + urlPath);
    }
    const type = MIME[path.extname(full).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type, "Content-Length": st.size, "Cache-Control": "no-store" });
    const stream = fs.createReadStream(full);
    stream.on("error", () => serveError(res, 500, "Gagal membaca file"));
    stream.pipe(res);
  });
}

function proxyApi(req, res) {
  const apiURL = new URL(req.url, API_ORIGIN);
  const headers = { ...req.headers, host: apiURL.host };
  delete headers["accept-encoding"];
  const upstream = http.request(
    apiURL,
    { method: req.method, headers, timeout: 15000 },
    (upRes) => {
      const out = [];
      const setCookie = upRes.headers["set-cookie"];
      if (setCookie) {
        delete upRes.headers["set-cookie"];
        out.push(["set-cookie", setCookie]);
      }
      res.writeHead(upRes.statusCode || 502, upRes.headers, out);
      upRes.pipe(res);
    }
  );
  upstream.on("timeout", () => {
    upstream.destroy(new Error("Upstream timeout"));
  });
  upstream.on("error", (e) => {
    serveError(
      res,
      502,
      "Proxy /api gagal — backend API belum hidup di " + API_ORIGIN + "\n(" + e.message + ")\n" +
        "Jalankan: cd api && npm start"
    );
  });
  req.pipe(upstream);
}

const server = http.createServer((req, res) => {
  if (req.url === API_PREFIX || req.url.startsWith(API_PREFIX + "/") ||
      req.url.startsWith(API_PREFIX + "?")) {
    return proxyApi(req, res);
  }
  return serveStatic(req, res);
});

server.listen(STATIC_PORT, BIND, () => {
  console.log(
    "[dev] statis  → http://%s:%d/  (akar repo: %s)\n[dev] /api    → %s",
    BIND === "0.0.0.0" ? "localhost" : BIND,
    STATIC_PORT,
    ROOT,
    API_ORIGIN
  );
});

function shutdown() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 2000).unref();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
