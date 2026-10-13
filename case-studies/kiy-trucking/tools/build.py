#!/usr/bin/env python3
"""Assemble case-studies/kiy-trucking/index.html.

Takes the site's shared head, header and footer from about.html (so they stay identical),
re-points relative links for this folder, and inserts src/main.html.

    python3 case-studies/kiy-trucking/tools/build.py
"""
import html as H
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
CASE = os.path.dirname(HERE)
REPO = os.path.dirname(os.path.dirname(CASE))
BASE = "https://sphamandla-designer.github.io/neuraux/"
URL = BASE + "case-studies/kiy-trucking/"
TITLE = "KIY Trucking: corporate website design and development | NeuraUX"
DESC = ("Case study: a corporate WordPress website for KIY Trucking, a South African transport and "
        "logistics company, taken from design through implementation.")


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
          f'{{"@type":"ListItem","position":3,"name":"KIY Trucking","item":"{URL}"}}]}},'
          f'{{"@type":"Article","@id":"{URL}","url":"{URL}","headline":"{TITLE}","description":"{DESC}",'
          f'"inLanguage":"en-ZA","publisher":{{"@id":"{BASE}#org"}}}}]}}\n</script>\n')

    header = repath(header).replace(' aria-current="page"', "")
    footer = repath(footer)
    main = open(os.path.join(CASE, "src", "main.html"), encoding="utf-8").read()
    page = head + ld + "</head>\n" + header + main + "\n\n" + footer
    open(os.path.join(CASE, "index.html"), "w", encoding="utf-8").write(page)
    print("wrote case-studies/kiy-trucking/index.html")



if __name__ == "__main__":
    main()
