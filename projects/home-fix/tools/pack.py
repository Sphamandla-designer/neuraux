#!/usr/bin/env python3
"""Write src/template.html back into a copy of the original bundle.

Usage: python3 tools/pack.py
Reads original/Home_FIX_Mobile.html and src/template.html.
Writes dist/Home_FIX_Mobile.html. The manifest (runtime, React, fonts) is untouched.
"""
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    # Fail the build on missing translations or broken button limits (F01, F20).
    if subprocess.call(["node", os.path.join(ROOT, "tools", "check.js")]) != 0:
        sys.exit("build check failed; nothing written")
    orig = open(os.path.join(ROOT, "original", "Home_FIX_Mobile.html"), encoding="utf-8").read()
    template = open(os.path.join(ROOT, "src", "template.html"), encoding="utf-8").read()
    encoded = json.dumps(template, ensure_ascii=False)
    # Never let the JSON string close the outer <script> tag early.
    encoded = encoded.replace("</", "<\\u002F")
    pat = re.compile(r'(<script type="__bundler/template">\n)(.*?)(\n  </script>)', re.S)
    if len(pat.findall(orig)) != 1:
        sys.exit("expected exactly one __bundler/template block")
    out = pat.sub(lambda m: m.group(1) + encoded + m.group(3), orig)
    if "<title>Bundled Page</title>" not in out:
        sys.exit("outer <title> not found")
    out = out.replace("<title>Bundled Page</title>", "<title>Home FIX prototype</title>", 1)
    # Round-trip check: the packed template must decode to exactly the source.
    back = json.loads(pat.search(out).group(2))
    if back != template:
        sys.exit("round-trip mismatch")
    os.makedirs(os.path.join(ROOT, "dist"), exist_ok=True)
    dest = os.path.join(ROOT, "dist", "Home_FIX_Mobile.html")
    open(dest, "w", encoding="utf-8").write(out)
    print("dist/Home_FIX_Mobile.html", len(out.encode("utf-8")), "bytes")


if __name__ == "__main__":
    main()
