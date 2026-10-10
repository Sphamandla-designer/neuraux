#!/usr/bin/env python3
"""Assemble case-studies/index.html, the case studies listing page.

Takes the site's shared head, header and footer from about.html (so they stay identical),
re-points relative links for this folder, marks "Case Studies" as the current nav item,
and inserts case-studies/src/index.main.html.

    python3 case-studies/tools/build_index.py
"""
import html as H
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
CS = os.path.dirname(HERE)
REPO = os.path.dirname(CS)
BASE = "https://sphamandla-designer.github.io/neuraux/"
URL = BASE + "case-studies/"
TITLE = "Case Studies | AI Conversation Design | NeuraUX"
DESC = ("How NeuraUX designs AI conversations end to end: flows, copy, AI rules, prototypes and test plans. "
        "Concept projects, clearly labelled, until client work can be published.")
PREFIX = "../"


def repath(fragment):
    """Point root-relative site links (about.html, ./, css/...) one folder up."""
    def fix(m):
        attr, q, val = m.group(1), m.group(2), m.group(3)
        if re.match(r"^(https?:|mailto:|tel:|#|data:|/|\.\./)", val):
            return m.group(0)
        if val == "case-studies/":
            return f"{attr}={q}./{q}"
        val = PREFIX if val in ("./", "") else PREFIX + val
        return f"{attr}={q}{val}{q}"
    return re.sub(r'\b(href|src)=(["\'])([^"\']*)\2', fix, fragment)


def main():
    about = open(os.path.join(REPO, "about.html"), encoding="utf-8").read()
    head = about[:about.index('<script type="application/ld+json">')]
    header = about[about.index("<body>"):about.index('<main id="main">')]
    footer = about[about.index('<footer class="ftr">'):]

    head = re.sub(r"<title>.*?</title>", f"<title>{H.escape(TITLE)}</title>", head)
    head = re.sub(r'(<meta name="description" content=")[^"]*', lambda m: m.group(1) + H.escape(DESC), head)
    head = re.sub(r'(<link rel="canonical" href=")[^"]*', lambda m: m.group(1) + URL, head)
    head = re.sub(r'(<meta property="og:url" content=")[^"]*', lambda m: m.group(1) + URL, head)
    for prop in ("og:title", "twitter:title"):
        head = re.sub(rf'(<meta (?:property|name)="{prop}" content=")[^"]*', lambda m: m.group(1) + H.escape(TITLE), head)
    for prop in ("og:description", "twitter:description"):
        head = re.sub(rf'(<meta (?:property|name)="{prop}" content=")[^"]*', lambda m: m.group(1) + H.escape(DESC), head)
    head = repath(head)
    head = head.replace(f'<link rel="stylesheet" href="{PREFIX}css/site.css">',
                        f'<link rel="stylesheet" href="{PREFIX}css/site.css">\n<link rel="stylesheet" href="case-studies.css">')
    ld = ('<script type="application/ld+json">\n'
          '{"@context":"https://schema.org","@graph":['
          '{"@type":"BreadcrumbList","itemListElement":['
          f'{{"@type":"ListItem","position":1,"name":"Home","item":"{BASE}"}},'
          f'{{"@type":"ListItem","position":2,"name":"Case studies","item":"{URL}"}}]}},'
          f'{{"@type":"CollectionPage","@id":"{URL}","url":"{URL}","name":"{TITLE}","description":"{DESC}","inLanguage":"en-ZA",'
          f'"publisher":{{"@id":"{BASE}#org"}},'
          f'"hasPart":[{{"@type":"Article","name":"Home FIX concept: trilingual WhatsApp job verification","url":"{URL}home-fix/"}}]}}]}}\n'
          '</script>\n')

    header = repath(header).replace(' aria-current="page"', "")
    header = header.replace('<a href="./">Case Studies</a>', '<a href="./" aria-current="page">Case Studies</a>')
    footer = repath(footer)
    main = open(os.path.join(CS, "src", "index.main.html"), encoding="utf-8").read()
    page = head + ld + "</head>\n" + header + main + "\n\n" + footer
    open(os.path.join(CS, "index.html"), "w", encoding="utf-8").write(page)
    print("wrote case-studies/index.html")


if __name__ == "__main__":
    main()
