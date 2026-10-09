#!/usr/bin/env python3
"""Build docs/conversation-design-spec.md and .html from docs/src/conversation-design-spec.src.md.

- Section 5 gets the Mermaid flow (markdown) and an inline SVG (HTML).
- Section 7 is generated from docs/copy-deck.csv, so it always matches the copy deck.
Run tools/pack.py first (it writes the copy deck). Needs the `markdown` package.
"""
import csv, html, io, os

import markdown

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(ROOT, "docs")

MERMAID = """```mermaid
flowchart TD
  W[Welcome and consent] --> E[entry: greeting and language question]
  E -->|English / isiZulu / Afrikaans| S[start: POPIA line, 1 job today]
  S -->|Privacy notice| S
  S -->|Resume previous job| R{saved job?}
  R -->|no| S
  R -->|yes| X[saved beat restored]
  S -->|Start job| SUM[summary: job card]
  SUM -->|Begin verification| B[before: guidance card]
  B -->|photo| AQ{AI photo check}
  AQ -->|retake| BR[before_retake]
  BR -->|Retake photo| AQ
  AQ -->|pass| BO[before_ok] --> I[install: off-chat]
  I -->|Installation done - later today| SE[serial: guidance card]
  SE -->|photo| OCR{AI serial reading}
  OCR -->|retake| SR[serial_retake]
  SR -->|Retake photo| OCR
  SR -->|Type it in instead| ST[serial_type]
  OCR -->|read| SO[serial_ok] --> SC[serial_confirm]
  SC -->|No, fix it| ST
  ST -->|typed serial saved| C
  SC -->|Yes, correct| C[compliance: 4 photos]
  C -->|fewer than 4| C
  C -->|Skip for later, Continue| RM[reminder] -->|photos| C
  C -->|4 of 4| D[signal drop: clock, Connecting...] --> O[offline: photos came through]
  O -->|Submit evidence| SUB[submitted + in review]
  SUB -->|about 6 s; reviewer decides| OUT{outcome}
  OUT --> AP[approved]
  OUT --> RT[retake]
  OUT --> RJ[needs assistance]
  RT -->|Retake now, photo accepted| AP
  RJ -->|Chat to Thandi now| TH[Thandi in chat]
  AP -->|Close job| RES[results card]
  TH -->|hand-back| RES
  ANY[[Any beat: Contact support, person keyword or 3rd unrecognised message]] --> HO[Thandi in chat] -->|hand-back| BACK[same beat, same buttons]
```"""


def svg_flow():
    """A hand-placed flow diagram, printable and readable on a phone (it scales)."""
    W = 700
    out = []
    add = out.append
    boxes = {}

    def box(key, cx, y, w, lines, kind="beat"):
        h = 16 + 15 * len(lines)
        fill, stroke, dash = {
            "beat": ("#FFFFFF", "#0F766E", ""),
            "ai": ("#F2F6F5", "#134E48", ' stroke-dasharray="4 3"'),
            "good": ("#E7F7EC", "#1B7F4B", ""),
            "warn": ("#FBF3E0", "#B26B00", ""),
            "bad": ("#F1EFEC", "#57534E", ""),
            "wait": ("#ECF1F8", "#2E5AAC", ""),
            "side": ("#F7F4EF", "#8A9299", ""),
            "research": ("#EFEDE8", "#667781", ""),
        }[kind]
        x = cx - w / 2
        add(f'<rect x="{x:.0f}" y="{y}" width="{w}" height="{h}" rx="9" fill="{fill}" stroke="{stroke}" stroke-width="1.4"{dash}/>')
        for i, t in enumerate(lines):
            weight = ' font-weight="600"' if i == 0 else ""
            add(f'<text x="{cx}" y="{y + 20 + 15 * i}" text-anchor="middle" font-size="12"{weight} fill="#1F2A30">{html.escape(t)}</text>')
        boxes[key] = (cx, y, w, h)

    def v(a, b, label=None, dx=0):
        ax, ay, aw, ah = boxes[a]
        bx, by, bw, bh = boxes[b]
        x = ax + dx
        add(f'<line x1="{x}" y1="{ay + ah}" x2="{x}" y2="{by - 2}" stroke="#3B4A54" stroke-width="1.3" marker-end="url(#arr)"/>')
        if label:
            add(f'<text x="{x + 7}" y="{(ay + ah + by) / 2 + 4:.0f}" font-size="11" fill="#5C6B72">{html.escape(label)}</text>')

    def path(d, label=None, lx=0, ly=0, anchor="start"):
        add(f'<path d="{d}" fill="none" stroke="#3B4A54" stroke-width="1.3" marker-end="url(#arr)"/>')
        if label:
            add(f'<text x="{lx}" y="{ly}" text-anchor="{anchor}" font-size="11" fill="#5C6B72">{html.escape(label)}</text>')

    C, L, R = 330, 105, 575
    y = 14
    rows = [
        ("W", ["Welcome and consent", "language, code, consent"], "research"),
        ("E", ["entry", "greeting, language question"], "beat"),
        ("S", ["start", "POPIA line, 1 job today"], "beat"),
        ("SUM", ["summary", "job card"], "beat"),
        ("B", ["before", "guidance card"], "beat"),
        ("AQ", ["AI photo check", "pass or retake"], "ai"),
        ("BO", ["before_ok", "1 of 6"], "beat"),
        ("I", ["install", "installation off-chat"], "beat"),
        ("SE", ["serial", "later today, 13:10"], "beat"),
        ("OCR", ["AI serial reading", "read or retake"], "ai"),
        ("SO", ["serial_ok + serial_confirm", "Is that right?"], "beat"),
        ("C", ["compliance", "4 photos, any order"], "beat"),
        ("D", ["signal drop", "clock, Connecting…, silence"], "wait"),
        ("O", ["offline", "Your photos came through"], "wait"),
        ("SUB", ["submitted + in review", "a person decides"], "good"),
    ]
    gap = 26
    for key, lines, kind in rows:
        box(key, C, y, 210, lines, kind)
        y += 16 + 15 * len(lines) + gap
    for a, b, lab in [("W", "E", "Start"), ("E", "S", "English / isiZulu / Afrikaans"), ("S", "SUM", "Start job"), ("SUM", "B", "Begin verification"),
                      ("B", "AQ", "photo"), ("AQ", "BO", "pass"), ("BO", "I", None), ("I", "SE", "Installation done"), ("SE", "OCR", "photo"),
                      ("OCR", "SO", "read"), ("SO", "C", "Yes, correct"), ("C", "D", "4 of 4"), ("D", "O", "after 3 s"), ("O", "SUB", "Submit evidence")]:
        v(a, b, lab)

    # Left: retakes
    ax, ay, aw, ah = boxes["AQ"]
    box("BR", L, ay, 150, ["before_retake", "Retake / Contact support"], "warn")
    path(f"M{ax - aw / 2} {ay + 14} H{L + 75 + 2}", "retake", ax - aw / 2 - 6, ay + 10, "end")
    path(f"M{L} {ay + boxes['BR'][3]} V{ay + boxes['BR'][3] + 12} H{ax - aw / 2 + 20} V{ay + ah + 2}", None)
    add(f'<text x="{L - 60}" y="{ay + boxes["BR"][3] + 26}" font-size="11" fill="#5C6B72">Retake photo</text>')
    ox, oy, ow, oh = boxes["OCR"]
    box("SR", L, oy, 150, ["serial_retake", "Retake / Type it in"], "warn")
    path(f"M{ox - ow / 2} {oy + 14} H{L + 75 + 2}", "retake", ox - ow / 2 - 6, oy + 10, "end")
    path(f"M{L - 30} {oy + boxes['SR'][3]} V{oy + boxes['SR'][3] + 14} H{ox - ow / 2 + 20} V{oy + oh + 2}", None)
    add(f'<text x="{L - 72}" y="{oy + boxes["SR"][3] + 28}" font-size="11" fill="#5C6B72">Retake photo</text>')

    # Right: typed serial, reminder, resume/privacy
    sx, sy, sw, sh = boxes["SO"]
    box("ST", R, sy + 4, 160, ["serial_type", "typed, saved, compared"], "beat")
    path(f"M{sx + sw / 2} {sy + 20} H{R - 80 - 2}", "No, fix it", sx + sw / 2 + 8, sy + 15)
    srx, sry, srw, srh = boxes["SR"]
    path(f"M{L + 40} {sry + srh} V{sry + srh + 30} H{R} V{sy + 2}", "Type it in instead", L + 46, sry + srh + 26)
    cx_, cy_, cw_, ch_ = boxes["C"]
    path(f"M{R} {sy + 4 + boxes['ST'][3]} V{cy_ + 14} H{cx_ + cw_ / 2 + 2}", "saved", R + 6, cy_ + 2)
    box("RM", R, cy_ + 34, 170, ["reminder", "Upload photos → 4 of 4"], "warn")
    path(f"M{cx_ + cw_ / 2} {cy_ + 34} H{R - 80 - 2}", None)
    add(f'<text x="{cx_ + cw_ / 2 + 6}" y="{cy_ + 48}" font-size="11" fill="#5C6B72">Skip, Continue</text>')
    ssx, ssy, ssw, ssh = boxes["S"]
    box("RS", R, ssy, 170, ["Privacy notice / Resume", "reply, or restore saved job"], "side")
    path(f"M{ssx + ssw / 2} {ssy + 22} H{R - 85 - 2}", None)

    # Handover, applies everywhere
    bx_, by_, bw_, bh_ = boxes["BO"]
    box("HO", R, by_ - 30, 190, ["Any beat", "Contact support, “person”,", "or 3rd unrecognised message", "→ Thandi in chat → same beat"], "side")

    # Outcomes
    sbx, sby, sbw, sbh = boxes["SUB"]
    y = sby + sbh + 50
    box("AP", 120, y, 170, ["approved", "Close job"], "good")
    box("RT", C, y, 170, ["retake", "Retake now"], "warn")
    box("RJ", 540, y, 170, ["needs assistance", "Chat to Thandi now"], "bad")
    for k, x in [("AP", 120), ("RT", C), ("RJ", 540)]:
        path(f"M{C} {sby + sbh} V{sby + sbh + 22} H{x} V{y - 2}", None)
    add(f'<text x="{C + 8}" y="{sby + sbh + 16}" font-size="11" fill="#5C6B72">about 6 s, outcome set by the facilitator</text>')
    ry = y + boxes["RT"][3]
    path(f"M{C} {ry} V{ry + 20} H{120 + 40} V{y + boxes['AP'][3] + 2}", "photo accepted → approved", C + 6, ry + 16)
    y2 = ry + 50
    box("TH", 540, y2, 170, ["Thandi in chat", "participant types"], "side")
    path(f"M540 {ry} V{y2 - 2}", None)
    y3 = y2 + boxes["TH"][3] + 36
    box("RES", C, y3, 210, ["Results card", "ease 1–7, hardest, download/copy"], "research")
    path(f"M120 {y + boxes['AP'][3]} V{y3 + 18} H{C - 105 - 2}", "Close job", 126, y3 + 6)
    path(f"M540 {y2 + boxes['TH'][3]} V{y3 + 18} H{C + 105 + 2}", "hand-back", 546, y3 + 6)
    H = y3 + boxes["RES"][3] + 16
    head = (f'<svg class="flow" viewBox="0 0 {W} {H}" width="100%" role="img" aria-labelledby="flow-title" xmlns="http://www.w3.org/2000/svg" '
            f'font-family="Roboto, system-ui, sans-serif"><title id="flow-title">Home FIX flow: beats, branches and outcomes</title>'
            '<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
            '<path d="M0 0L10 5L0 10z" fill="#3B4A54"/></marker></defs>')
    return head + "".join(out) + "</svg>"


def inventory():
    with open(os.path.join(DOCS, "copy-deck.csv"), encoding="utf-8-sig", newline="") as f:
        rows = list(csv.reader(f))
    head, body = rows[0], rows[1:]

    def cell(s):
        return s.replace("|", "\\|").replace("\n", " ")

    md = io.StringIO()
    md.write("| " + " | ".join(head) + " |\n")
    md.write("|" + "---|" * len(head) + "\n")
    for r in body:
        md.write("| " + " | ".join(cell(c) for c in r) + " |\n")
    return md.getvalue(), len(body)


CSS = """
:root{--ink:#1F2A30;--muted:#5C6B72;--line:#E7E0D5;--paper:#FFFFFF;--tint:#F7F4EF;--brand:#075E54;--accent:#0F766E;}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.55 Roboto,system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:980px;margin:0 auto;padding:16px 16px 48px}
h1{font-size:26px;line-height:1.2;margin:8px 0 12px;color:var(--brand)}
h2{font-size:20px;margin:36px 0 10px;padding-top:12px;border-top:1px solid var(--line);color:var(--brand)}
h3{font-size:17px;margin:22px 0 8px}
p,li{max-width:75ch}
code{font-family:"Roboto Mono",ui-monospace,monospace;font-size:.86em;background:var(--tint);padding:1px 4px;border-radius:4px}
pre{background:var(--tint);padding:12px;border-radius:8px;overflow:auto;font-size:13px}
pre code{background:none;padding:0}
.table-wrap{overflow-x:auto;margin:10px 0 18px;border:1px solid var(--line);border-radius:8px}
table{border-collapse:collapse;width:100%;font-size:14px}
th,td{text-align:left;vertical-align:top;padding:7px 9px;border-bottom:1px solid var(--line)}
th{background:var(--tint);font-weight:600;position:sticky;top:0}
.inventory table{font-size:12.5px}
.inventory td:nth-child(n+4):nth-child(-n+6){min-width:180px}
nav.toc{background:var(--tint);border-radius:8px;padding:10px 16px;margin:12px 0}
nav.toc ol{margin:6px 0;padding-left:22px;columns:2;column-gap:24px}
nav.toc a{color:var(--accent)}
svg.flow{max-width:700px;display:block;margin:10px auto;height:auto}
details{margin:10px 0}
summary{cursor:pointer;color:var(--accent);min-height:44px;display:flex;align-items:center}
a{color:var(--accent)}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
@media (max-width:600px){nav.toc ol{columns:1} h1{font-size:22px}}
@media print{
  body{font-size:11pt} main{max-width:none;padding:0}
  h2{break-before:auto;break-after:avoid} table,svg,pre{break-inside:avoid}
  .table-wrap{overflow:visible;border:0} th{position:static}
  details{display:block} details>summary{display:none} nav.toc{display:none}
  a{color:inherit;text-decoration:none}
}
"""


def main():
    src = open(os.path.join(DOCS, "src", "conversation-design-spec.src.md"), encoding="utf-8").read()
    inv_md, n = inventory()
    md_out = src.replace("<!-- FLOW -->", MERMAID).replace("<!-- INVENTORY -->", inv_md)
    with open(os.path.join(DOCS, "conversation-design-spec.md"), "w", encoding="utf-8") as f:
        f.write(md_out)

    flow_html = ("<!--FLOWSVG-->\n\n<details><summary>Mermaid source of the same diagram</summary>\n\n" + MERMAID + "\n\n</details>")
    html_src = src.replace("<!-- FLOW -->", flow_html).replace("<!-- INVENTORY -->", "<!--INV-START-->\n\n" + inv_md + "\n<!--INV-END-->")
    body = markdown.markdown(html_src, extensions=["tables", "fenced_code", "toc"], output_format="html5")
    body = body.replace("<!--FLOWSVG-->", svg_flow())
    body = body.replace("<table>", '<div class="table-wrap"><table>').replace("</table>", "</table></div>")
    body = body.replace("<!--INV-START-->", '<div class="inventory">').replace("<!--INV-END-->", "</div>")
    # Table of contents from h2 headings
    import re
    heads = re.findall(r'<h2 id="([^"]+)">(.*?)</h2>', body)
    toc = '<nav class="toc" aria-label="Contents"><strong>Contents</strong><ol>' + "".join(
        f'<li><a href="#{i}">{re.sub(r"^[0-9]+\. ", "", t)}</a></li>' for i, t in heads) + "</ol></nav>"
    body = body.replace("</h1>", "</h1>" + toc, 1)
    page = ('<!doctype html><html lang="en-ZA"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width, initial-scale=1">'
            '<title>Home FIX conversation design spec</title>'
            '<meta name="description" content="Conversation design specification for the Home FIX geyser verification prototype.">'
            f"<style>{CSS}</style></head><body><main>{body}</main></body></html>")
    with open(os.path.join(DOCS, "conversation-design-spec.html"), "w", encoding="utf-8") as f:
        f.write(page)
    print(f"spec written: {n} strings in the inventory; md {len(md_out)} chars; html {len(page)} chars")


if __name__ == "__main__":
    main()
