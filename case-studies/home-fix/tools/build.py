#!/usr/bin/env python3
"""Assemble case-studies/home-fix/index.html.

Takes the site's shared head, header and footer from about.html (so they stay identical),
re-points relative links for this folder, and inserts src/main.html.
Also writes content/case-study-copy.md (all visible page copy, for editing).

    python3 case-studies/home-fix/tools/build.py
"""
import html as H
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
CASE = os.path.dirname(HERE)
REPO = os.path.dirname(os.path.dirname(CASE))
BASE = "https://sphamandla-designer.github.io/neuraux/"
URL = BASE + "case-studies/home-fix/"
TITLE = "Home FIX concept: trilingual WhatsApp job verification | NeuraUX"
DESC = ("Concept case study: a WhatsApp assistant in English, isiZulu and Afrikaans that helps plumbers send "
        "geyser job evidence, while a person makes every approval decision.")


def repath(fragment):
    """Point root-relative site links (about.html, ./, css/...) two folders up."""
    def fix(m):
        attr, q, val = m.group(1), m.group(2), m.group(3)
        if re.match(r"^(https?:|mailto:|tel:|#|data:|/|\.\./)", val):
            return m.group(0)
        if val == "case-studies/":
            return f'{attr}={q}../{q}'
        val = "../../" if val in ("./", "") else "../../" + val
        return f'{attr}={q}{val}{q}'
    return re.sub(r'\b(href|src)=(["\'])([^"\']*)\2', fix, fragment)


def main():
    about = open(os.path.join(REPO, "about.html"), encoding="utf-8").read()
    head = about[:about.index("<script type=\"application/ld+json\">")]
    body_open = about.index("<body>")
    header = about[body_open:about.index("<main id=\"main\">")]
    footer = about[about.index("<footer class=\"ftr\">"):]

    # Head: same fonts, styles and scripts; page-specific title, description, canonical and OG.
    head = re.sub(r"<title>.*?</title>", f"<title>{H.escape(TITLE)}</title>", head)
    head = re.sub(r'(<meta name="description" content=")[^"]*', lambda m: m.group(1) + H.escape(DESC), head)
    head = re.sub(r'(<link rel="canonical" href=")[^"]*', lambda m: m.group(1) + URL, head)
    head = re.sub(r'(<meta property="og:url" content=")[^"]*', lambda m: m.group(1) + URL, head)
    head = head.replace('<meta property="og:type" content="website">', '<meta property="og:type" content="article">')
    for prop in ("og:title", "twitter:title"):
        head = re.sub(rf'(<meta (?:property|name)="{prop}" content=")[^"]*', lambda m: m.group(1) + H.escape(TITLE), head)
    for prop in ("og:description", "twitter:description"):
        head = re.sub(rf'(<meta (?:property|name)="{prop}" content=")[^"]*', lambda m: m.group(1) + H.escape(DESC), head)
    head = repath(head)
    head = head.replace('<link rel="stylesheet" href="../../css/site.css">',
                        '<link rel="stylesheet" href="../../css/site.css">\n<link rel="stylesheet" href="case-study.css">')
    ld = ('<script type="application/ld+json">\n'
          '{"@context":"https://schema.org","@graph":['
          '{"@type":"BreadcrumbList","itemListElement":['
          f'{{"@type":"ListItem","position":1,"name":"Home","item":"{BASE}"}},'
          f'{{"@type":"ListItem","position":2,"name":"Case studies","item":"{BASE}case-studies/"}},'
          f'{{"@type":"ListItem","position":3,"name":"Home FIX concept","item":"{URL}"}}]}},'
          f'{{"@type":"Article","@id":"{URL}","url":"{URL}","headline":"{TITLE}","description":"{DESC}",'
          f'"inLanguage":"en-ZA","author":{{"@id":"{BASE}#org"}},"publisher":{{"@id":"{BASE}#org"}},'
          f'"image":"{URL}assets/screens/serial-confirmation.png"}}]}}\n</script>\n')

    header = repath(header).replace(' aria-current="page"', "")
    footer = repath(footer)
    main = open(os.path.join(CASE, "src", "main.html"), encoding="utf-8").read()
    page = head + ld + "</head>\n" + header + main + "\n\n" + footer
    open(os.path.join(CASE, "index.html"), "w", encoding="utf-8").write(page)

    write_copy(main)
    print("wrote case-studies/home-fix/index.html and content/case-study-copy.md")


def write_copy(main):
    """All visible copy in reading order, as Markdown. Alt text is listed separately."""
    s = re.sub(r"<!--.*?-->", "", main, flags=re.S)
    alts = re.findall(r'<img [^>]*alt="([^"]*)"', s)
    s = re.sub(r"<(script|style)\b.*?</\1>", "", s, flags=re.S)
    s = re.sub(r"<h1[^>]*>(.*?)</h1>", lambda m: "\n\n# " + m.group(1) + "\n\n", s, flags=re.S)
    s = re.sub(r"<h2[^>]*>(.*?)</h2>", lambda m: "\n\n## " + m.group(1) + "\n\n", s, flags=re.S)
    s = re.sub(r"<h3[^>]*>(.*?)</h3>", lambda m: "\n\n### " + m.group(1) + "\n\n", s, flags=re.S)
    s = re.sub(r"<summary[^>]*>(.*?)</summary>", lambda m: "\n\n**" + m.group(1) + "**\n\n", s, flags=re.S)
    s = re.sub(r"<(strong)>(.*?)</\1>", r"**\2**", s)
    s = re.sub(r"<li[^>]*>", "\n- ", s)
    s = re.sub(r"<dt[^>]*>(.*?)</dt>", lambda m: "\n- **" + m.group(1) + ":** ", s, flags=re.S)
    s = re.sub(r"<tr[^>]*>", "\n| ", s)
    s = re.sub(r"</t[hd]>", " | ", s)
    s = re.sub(r"<figcaption[^>]*>(.*?)</figcaption>", lambda m: "\n\n*Caption: " + m.group(1) + "*\n\n", s, flags=re.S)
    s = re.sub(r"</(p|div|section|article|ul|ol|table|figure|dl)>", "\n\n", s)
    s = re.sub(r"<[^>]+>", "", s)
    s = H.unescape(s)
    s = "\n".join(line.strip() for line in s.splitlines())
    s = re.sub(r"\n{3,}", "\n\n", s).strip()
    out = ("# Home FIX case study: page copy\n\nGenerated from `src/main.html` by `tools/build.py`. "
           "Edit the copy in `src/main.html`, then rebuild. Alt text is listed at the end.\n\n" + s +
           "\n\n## Alt text\n\n" + "\n".join("- " + H.unescape(a) for a in alts) + "\n")
    open(os.path.join(CASE, "content", "case-study-copy.md"), "w", encoding="utf-8").write(out)


if __name__ == "__main__":
    main()
