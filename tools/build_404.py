#!/usr/bin/env python3
"""Assemble 404.html, the page GitHub Pages serves for any missing path.

Takes the shared head, header and footer from about.html (so they stay identical) and adds:
- <base href="/neuraux/"> so links and styles resolve from any missing path on the project site.
  A one-line script resets it to "/" off github.io (local preview, or once the custom domain is live).
- noindex, and no canonical or social tags.
- a fix so in-page links (the skip link) stay on the current page despite the base.

    python3 tools/build_404.py
"""
import os
import re

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TITLE = "Page not found | NeuraUX"
DESC = "The page you asked for doesn't exist or has moved."

MAIN = '''<main id="main">
  <div class="page-scene scene scene--crescent">
  <section class="page-hero wrap al-center" aria-labelledby="page-title">
    <h1 class="h-hero" id="page-title"><span class="ln">Page not found.</span></h1>
    <p class="lead">The page you asked for doesn't exist or has moved. Check the address, or start again from the homepage.</p>
    <div class="actions actions--stack">
      <a class="btn btn--solid btn--lg" href="./">Back to the homepage</a>
      <a class="btn btn--line btn--lg" href="services.html">See services and pricing</a>
    </div>
    <p class="meta" style="margin-top:20px">Looking for something specific? Email <a class="link" href="mailto:hello@neuraux.co.za">hello@neuraux.co.za</a>.</p>
  </section>
  </div>
</main>

'''

HASH_FIX = ("<script>document.querySelectorAll('a[href^=\"#\"]').forEach(function (a) "
            "{ a.setAttribute('href', location.pathname + a.getAttribute('href')); });</script>\n")


def main():
    about = open(os.path.join(REPO, "about.html"), encoding="utf-8").read()
    head = about[:about.index('<script type="application/ld+json">')]
    header = about[about.index("<body>"):about.index('<main id="main">')]
    footer = about[about.index('<footer class="ftr">'):]

    head = re.sub(r"<title>.*?</title>", f"<title>{TITLE}</title>", head)
    head = re.sub(r'(<meta name="description" content=")[^"]*', lambda m: m.group(1) + DESC, head)
    head = re.sub(r'<link rel="canonical"[^>]*>\n', "", head)
    head = re.sub(r'<meta (?:property|name)="(?:og|twitter):[^"]*" content="[^"]*">\n', "", head)
    head = head.replace('<meta charset="utf-8">',
                        '<meta charset="utf-8">\n<base href="/neuraux/">\n'
                        "<script>if (!location.hostname.endsWith('github.io')) document.querySelector('base').href = '/';</script>\n"
                        '<meta name="robots" content="noindex">', 1)
    header = header.replace(' aria-current="page"', "")
    footer = footer.replace("</body>", HASH_FIX + "</body>")
    open(os.path.join(REPO, "404.html"), "w", encoding="utf-8").write(head + "</head>\n" + header + MAIN + footer)
    print("wrote 404.html")


if __name__ == "__main__":
    main()
