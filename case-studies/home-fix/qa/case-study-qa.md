# QA: Home FIX case study page

Page: `case-studies/home-fix/index.html`, built by `tools/build.py` from `src/main.html`. Checked on 9 October 2026; layout and labelling re-checked on 10 October 2026 against a local server (`python3 -m http.server 8765` from the repo root) in Chromium.

Automated results: `qa/check-results.json`, from `tools/check.mjs`. Full-page screenshots: `qa/page-390-part*.webp` and `qa/page-1280-part1.webp`.

## Results

| Check | Result | Evidence |
|---|---|---|
| Every claim has a source in `content/claims-log.md` | pass (by hand) | Each section's claims are listed with the spec, copy deck, QA report or screenshot they come from. Design reasoning is marked "Rationale". |
| No "Santam", "Home Assist", other insurer names, phone numbers | pass | 12 insurer and client names searched in the page HTML; no phone-number patterns in the text or alt text. The original prototype's placeholder number is covered in the one "before" screenshot that showed it. |
| Every percentage sourced or labelled "Proposed" | pass | Three mentions, all the first version's "Read confidence 41%" and "98%", in text and alt text. Source: `before-serial-confidence` and `qa/before/`. No result percentages anywhere. |
| No concept labelling (founder's request, 10 Oct 2026) | pass | The word "concept" doesn't appear in the page text. |
| Consistent section alignment and spacing | pass | All 6 content sections are left-aligned on one edge (16 px at 390, 51 px at 1280), with the same header-to-content gap (40 px and 64 px). |
| Word count 1,800–2,400 (excluding alt text and captions) | pass | 2,355 words (captions, the flow's text version, alt text and screen-reader-only text excluded). Counted text: `qa/page-text.txt`. |
| All links work: prototype, spec download, mailto | pass | 78 internal links, images and mailto links checked, all return 200 and every anchor exists. The external LinkedIn link in the shared footer could not be reached from the sandbox and was skipped. |
| No horizontal scroll at 320, 375, 390, 768, 1280 | pass | All five fit. The stage table scrolls inside its own labelled box on narrow screens. |
| Full-page screenshots at 390 and 1280, looked at | pass | Reviewed both. See fixes below. |
| Lighthouse accessibility ≥ 95, SEO ≥ 95 | pass | Mobile: accessibility 100, SEO 100 (performance 86, best practices 96). Desktop: accessibility 100, SEO 100 (performance 100, best practices 96). Lighthouse 12.8.2. Fonts from Fontshare and Google Fonts were blocked by the sandbox's network, as for every site page, which lowers performance and best practices here. |
| axe: no serious issues | pass | axe-core 4.10.3: no violations of any impact, after scrolling so the revealed content is in its final state. |
| Heading order | pass | One h1, 51 headings, no skipped levels. |
| Images under 200 KB, meaningful alt text, width/height set | pass | 21 images (42 files, WebP plus PNG fallback); largest 95 KB. Every image has width and height, and alt text that says what the messages say. |
| Prototype embed on desktop; full-screen button on mobile | pass | Desktop: the iframe loads `projects/home-fix/dist/Home_FIX_Mobile.html`, and consent, Start and the language buttons work inside it. At 390 px the iframe is hidden and the button opens the prototype full screen. |
| No banned words | pass | None of the brief's list or the site's list, in the copy or the alt text. No em dashes in the page copy. |

## Failures found and fixed

| Found | Fix |
|---|---|
| Mobile: screenshots one per row, each the full screen width, making the page 25,700 px tall | `auto-fit` with a fixed 260 px track maximum gave one column. Now flexible tracks capped by the container: two-up on phones, page 21,800 px. |
| 320 px: 3 px horizontal scroll | The "Download the conversation design spec" button can't wrap (site buttons are `nowrap`). Now uses the site's stacking action group on narrow screens. |
| The problem section's `al-right` flipped its columns, putting the body text before its heading | Re-sequenced section alignment (left, centre, right, left, right, centre, left, centre). It still alternates as CLAUDE.md requires. |
| "After" screenshot for the two-sitting fix didn't show the "Later today" divider | The capture script now scrolls the divider into view. |
| The worked example said "word for word" but drops a ✅ and a dash from one AI line | The intro now says one tick and one dash are left out. |
| The flow diagram didn't load as an `<img>` | Mermaid writes `width="100%"` with no height; `tools/diagram.mjs` now sets the intrinsic size from the viewBox. |
| One flow label ("Skip for later, Continue") collided with the next one | Shortened in the spec's Mermaid source (`projects/home-fix/tools/build_docs.py`), then re-rendered. |

## Not checked

- Real phones. The checks used Chromium with phone-sized viewports.
- The page with the real web fonts. The sandbox blocks the font CDNs, so the screenshots use the fallback fonts.
- Live hosting on GitHub Pages. Paths are relative and were tested on a local server with the repo root as the site root, which matches the Pages deployment.
