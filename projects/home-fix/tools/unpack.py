#!/usr/bin/env python3
"""Extract the editable template and the read-only runtime from the bundle.

Usage: python3 tools/unpack.py [original/Home_FIX_Mobile.html]
Writes src/template.html and src/runtime.js.
"""
import base64, gzip, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RUNTIME_UUID = "34469d35-4869-4a60-8983-856511024ed4"


def block(html, kind):
    m = re.search(r'<script type="__bundler/' + kind + r'">\n(.*?)\n  </script>', html, re.S)
    if not m:
        sys.exit("missing __bundler/" + kind)
    return m.group(1)


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "original", "Home_FIX_Mobile.html")
    html = open(src, encoding="utf-8").read()
    manifest = json.loads(block(html, "manifest"))
    entry = manifest[RUNTIME_UUID]
    data = base64.b64decode(entry["data"])
    if entry.get("compressed"):
        data = gzip.decompress(data)
    os.makedirs(os.path.join(ROOT, "src"), exist_ok=True)
    open(os.path.join(ROOT, "src", "runtime.js"), "wb").write(data)
    template = json.loads(block(html, "template"))
    open(os.path.join(ROOT, "src", "template.html"), "w", encoding="utf-8").write(template)
    print("src/template.html", len(template), "chars; src/runtime.js", len(data), "bytes")


if __name__ == "__main__":
    main()
