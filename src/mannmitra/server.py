"""Zero-dependency HTTP server: JSON API + static frontend. Run: python -m mello.server"""
import argparse
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from . import screening
from .agents import MelloPipeline
from .config import FRONTEND_DIR
from .insights import InsightsStore

MAX_BODY = 20_000
MIME = {".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json"}


class Handler(BaseHTTPRequestHandler):
    pipeline = None
    store = None

    def _send(self, code, body, ctype="application/json; charset=utf-8"):
        data = body if isinstance(body, bytes) else json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        url = urlparse(self.path)
        if url.path == "/api/health":
            return self._send(200, {"status": "ok"})
        if url.path == "/api/questions":
            try:
                return self._send(200, screening.load_questions(parse_qs(url.query).get("lang", ["en"])[0]))
            except ValueError as e:
                return self._send(400, {"error": str(e)})
        if url.path == "/api/insights":
            return self._send(200, self.store.aggregate())
        self._static(url.path)

    def do_POST(self):
        if urlparse(self.path).path != "/api/checkin":
            return self._send(404, {"error": "not found"})
        try:
            length = int(self.headers.get("Content-Length", 0))
            if length <= 0 or length > MAX_BODY:
                raise ValueError("body missing or too large")
            body = json.loads(self.rfile.read(length))
            result = self.pipeline.run(body.get("lang", "en"), body.get("answers"), body.get("free_text", ""))
            self._send(200, result)
        except (ValueError, TypeError, json.JSONDecodeError) as e:
            self._send(400, {"error": str(e)})

    def _static(self, path):
        rel = "index.html" if path in ("", "/") else path.lstrip("/")
        root = FRONTEND_DIR.resolve()
        target = (root / rel).resolve()
        if root not in target.parents and target != root or not target.is_file():
            return self._send(404, {"error": "not found"})
        self._send(200, target.read_bytes(), MIME.get(target.suffix, "application/octet-stream"))

    def log_message(self, fmt, *args):  # privacy: log method and path only, never bodies
        print("%s %s" % (self.command, self.path))


def make_server(host="127.0.0.1", port=8000, pipeline=None, store=None):
    store = store if store is not None else InsightsStore()
    handler = type("BoundHandler", (Handler,), {"pipeline": pipeline or MelloPipeline(store=store), "store": store})
    return ThreadingHTTPServer((host, port), handler)


def main():
    ap = argparse.ArgumentParser(description="Mello server")
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--port", type=int, default=8000)
    args = ap.parse_args()
    srv = make_server(args.host, args.port)
    print(f"Mello running at http://{args.host}:{args.port}  (Ctrl+C to stop)")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
