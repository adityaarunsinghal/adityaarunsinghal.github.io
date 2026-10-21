"""Serve generated files with the same custom-404 routing used by GitHub Pages."""

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--directory", default="dist")
parser.add_argument("--port", type=int, default=4174)
parser.add_argument("--quiet", action="store_true")
args = parser.parse_args()
directory = Path(args.directory).resolve()
if not (directory / "index.html").is_file():
    parser.error("Build the website before starting the static preview.")


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, format, *values):
        if not args.quiet:
            super().log_message(format, *values)

    def send_head(self):
        # GitHub Pages is case-sensitive; macOS development filesystems often
        # are not. Check actual entry names so legacy-case tests exercise 404s.
        target = Path(self.translate_path(self.path))
        parent = directory
        for part in target.relative_to(directory).parts:
            if not parent.is_dir() or part not in {entry.name for entry in parent.iterdir()}:
                self.send_error(404)
                return None
            parent = parent / part
        return super().send_head()

    def send_error(self, code, message=None, explain=None):
        not_found = directory / "404.html"
        if code == 404 and not_found.is_file():
            content = not_found.read_bytes()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(content)
        else:
            super().send_error(code, message, explain)


print(f"Static preview: http://127.0.0.1:{args.port}/", flush=True)
ThreadingHTTPServer(
    ("127.0.0.1", args.port), partial(Handler, directory=str(directory))
).serve_forever()
