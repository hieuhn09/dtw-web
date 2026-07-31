#!/usr/bin/env node
/**
 * Zero-dependency local server for the AI Leaderboard demo.
 *
 *   node demos/serve-ai-leaderboard.mjs
 *
 * Serves the demos/ folder and proxies /api/* to the LLM Stats API so the
 * browser never hits CORS (their API only allows preflight from
 * http://localhost:3000 and their own domains). Binds 127.0.0.1 only.
 */
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const UPSTREAM = "https://api.llm-stats.com/stats/v1";
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname.startsWith("/api/")) {
    const target = UPSTREAM + url.pathname.slice("/api".length) + url.search;
    try {
      const upstream = await fetch(target, {
        headers: { authorization: req.headers.authorization || "" },
      });
      const body = Buffer.from(await upstream.arrayBuffer());
      const headers = { "content-type": upstream.headers.get("content-type") || "application/json" };
      const retryAfter = upstream.headers.get("retry-after");
      if (retryAfter) headers["retry-after"] = retryAfter;
      res.writeHead(upstream.status, headers);
      res.end(body);
    } catch (e) {
      res.writeHead(502, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: { code: "proxy_error", message: "Upstream request failed: " + e.message } }));
    }
    return;
  }

  const pathname = url.pathname === "/" ? "/ai-leaderboard-demo.html" : url.pathname;
  const file = normalize(join(ROOT, decodeURIComponent(pathname)));
  if (!file.startsWith(ROOT + sep) && file !== ROOT + "ai-leaderboard-demo.html") {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  try {
    const data = await readFile(file);
    res.writeHead(200, { "content-type": MIME[extname(file).toLowerCase()] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});

const CANDIDATES = [3000, 4173, 0]; // 3000 first: the only port the API also allows directly
function listen(i) {
  const port = CANDIDATES[i];
  const onError = (e) => {
    if (e.code === "EADDRINUSE" && i < CANDIDATES.length - 1) {
      console.log(`Port ${port} is busy, trying the next one (live data still works via the /api proxy).`);
      listen(i + 1);
    } else {
      console.error("Could not start server:", e.message);
      process.exit(1);
    }
  };
  server.once("error", onError);
  server.listen(port, "127.0.0.1", () => {
    server.off("error", onError);
    const actual = server.address().port;
    console.log(`\n  AI Leaderboard demo  ->  http://localhost:${actual}/`);
    console.log(`  LLM Stats API proxied at /api. Press Ctrl+C to stop.\n`);
  });
}
listen(0);
