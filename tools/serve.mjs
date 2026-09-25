#!/usr/bin/env node
/**
 * Serves site/ — locally and on Render.
 *
 *   node tools/serve.mjs            http://localhost:3000
 *   PORT=8080 node tools/serve.mjs
 *
 * If SITE_PASSWORD is set, every request needs HTTP basic auth: any user name
 * (or exactly SITE_USER, when that is set) with that password. Without it the
 * site is open, which is what you want on your own machine.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = path.resolve("site");
const PORT = Number(process.env.PORT) || 3000;
const USER = process.env.SITE_USER || "";
const PASSWORD = process.env.SITE_PASSWORD || "";

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8",
};

const same = (a, b) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

function authorised(req) {
  if (!PASSWORD) return true;
  const m = /^Basic (.+)$/.exec(req.headers.authorization || "");
  if (!m) return false;
  const decoded = Buffer.from(m[1], "base64").toString();
  const i = decoded.indexOf(":");
  const user = decoded.slice(0, i), pass = decoded.slice(i + 1);
  return same(pass, PASSWORD) && (!USER || same(user, USER));
}

/** URL path → file inside ROOT, with /foo/ → /foo/index.html and /foo → /foo/index.html. */
function resolve(urlPath) {
  let p;
  try { p = decodeURIComponent(urlPath.split("?")[0]); } catch { return null; }
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) return null;
  for (const f of [file, path.join(file, "index.html"), file + ".html"]) {
    try { if (fs.statSync(f).isFile()) return f; } catch {}
  }
  return null;
}

http.createServer((req, res) => {
  if (req.url === "/healthz") { res.writeHead(200).end("ok"); return; }
  if (!authorised(req)) {
    res.writeHead(401, { "WWW-Authenticate": 'Basic realm="I Wonder blueprint", charset="UTF-8"' }).end("Password required");
    return;
  }
  const file = resolve(req.url);
  // /foo → /foo/ so relative things and the nav's aria-current stay consistent
  if (file && file.endsWith("index.html") && !req.url.split("?")[0].endsWith("/") && !req.url.includes(".html")) {
    res.writeHead(301, { Location: req.url.replace(/(\?|$)/, "/$1") }).end();
    return;
  }
  if (!file) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" })
      .end('<!doctype html><meta charset="utf-8"><title>Not found</title><p style="font-family:sans-serif;padding:40px">Not found. <a href="/">Back to the blueprint</a></p>');
    return;
  }
  const type = TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
  res.writeHead(200, {
    "Content-Type": type,
    "Cache-Control": type.startsWith("text/html") ? "no-cache" : "public, max-age=3600",
    "X-Robots-Tag": "noindex",
  });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`I Wonder blueprint on http://localhost:${PORT}${PASSWORD ? " (password protected)" : ""}`);
});
