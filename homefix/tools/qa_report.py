#!/usr/bin/env python3
"""Write qa/qa-report.md from qa/test-results.json and qa/compare/summary.json."""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QA = os.path.join(ROOT, "qa")

INTENDED = {
    "00-entry": "F02 language buttons in the first beat; F11 greeting with the name; F17 security banner removed; F19 timestamps 11 px",
    "01-language": "F02 Start job after the language; F17 POPIA line and Privacy notice button",
    "02-summary": "F10 HF-2026 reference; F02 message order; F19 timestamps",
    "03-before": "T01 sample-photo link; F19 badge, heading and example-label sizes",
    "04-before_retake": "T01 sample-photo link; F19 sizes",
    "05-before_ok": "F12 ✅ and no confidence bar; F04 installation message replaces Continue (typing dots: the next beat is arriving)",
    "06-serial": "F04 'Later today' chip and 13:10 times; F19 badge size",
    "07-serial_retake": "F12 confidence bar removed; F14 Type it in instead replaces Contact support; T01 sample link",
    "08-serial_ok": "F12 ✅, bar removed; F13 new note and confirmation beat (typing dots)",
    "09-compliance": "F06 single checklist with new note; F03 '(PCV)'; Upload photos / Skip for later replace Continue; T01 sample link",
    "10-upload": "F06 second checklist removed (merged into compliance)",
    "11-offline": "F08 no 'Connection lost' chip or offline message; new title, body and fields; Submit evidence (D06)",
    "12-submitted": "F09 submitted and in review in one beat; Finish removed; F10 date and reference",
    "13-review": "F09 Exit removed; new note",
    "outcome-approved": "F10 reference and date",
    "outcome-retake": "F18 earlier transcript shows the merged beats; T01 sample link",
    "outcome-rejected": "F16 new title, body, fields, note and Chat to Thandi now; F15 no phone number",
}


def main():
    res = json.load(open(os.path.join(QA, "test-results.json")))
    cmp_rows = json.load(open(os.path.join(QA, "compare", "summary.json")))
    out = []
    w = out.append
    w("# QA report: Home FIX prototype")
    w("")
    w(f"Build: `dist/Home_FIX_Mobile.html`. Automated run: {res['run']} (Chromium via Playwright, 390×844 unless stated; one full run at 1280×800).")
    w("")
    w(f"**Result: {res['passed']} of {res['total']} automated tests passed.** Full log: `qa/test-output.txt`; machine-readable: `qa/test-results.json`.")
    w("")
    w("## Part 7 checklist")
    w("")
    names = [r["name"] for r in res["results"]]

    def status(pattern):
        rs = [r for r in res["results"] if re.search(pattern, r["name"])]
        if not rs:
            return "not run", []
        return ("pass" if all(r["pass"] for r in rs) else "FAIL"), rs

    checks = [
        ("The original file in `original/` is byte-identical to the uploaded one", r"^P7-01"),
        ("`dist/Home_FIX_Mobile.html` opens offline with no console errors", r"^P7-02"),
        ("Full happy path in en, zu and af, and each of the three outcomes in each language (12 runs)", r"^P7-03"),
        ("After choosing zu or af, no English string from COPY appears in the chat", r"P7-04|outcome .* in (zu|af)"),
        ("Every string id has all three languages (build fails otherwise)", r"^P7-05"),
        ("Every quick-reply label ≤ 20 characters; no beat shows more than 3", r"^P7-06"),
        ("No percentage or confidence bar in participant mode", r"^F12 no confidence"),
        ("Unrecognised text twice → Contact support offered; never a third repair", r"^T02 unrecognised"),
        ("Refresh at 3 different beats restores the same state", r"^T04 refresh"),
        ("Photo upload with `setInputFiles`; the sample-photo link works (used for every photo in the 3 happy-path runs)", r"^T01|^P7-03 happy"),
        ("Results download as JSON and CSV that match the schema", r"^T05 results"),
        ("No horizontal scroll at 320, 375, 390 and 430 px", r"^T06 no horizontal"),
        ("No network requests after load", r"^P7-02|^P7-03 happy"),
    ]
    w("| Check | Result | Evidence |")
    w("|---|---|---|")
    for label, pat in checks:
        st, rs = status(pat)
        ev = "; ".join(f"{r['name'].split(' ')[0]}: {r['detail']}" for r in rs[:3])
        if len(rs) > 3:
            ev += f"; … {len(rs)} tests"
        w(f"| {label} | {st} | {ev} |")
    ids = [f"F{n:02d}" for n in range(1, 21)] + [f"T{n:02d}" for n in range(1, 7)]
    missing = [i for i in ids if not any(re.search(r"\b" + i + r"\b", n) for n in names)]
    w(f"| Each F-fix and T-item has at least one test naming its id | {'pass' if not missing else 'FAIL'} | {'all 26 ids named' if not missing else 'missing: ' + ', '.join(missing)} |")
    w("| Design unchanged apart from the fix areas (screenshots `qa/before/` vs `qa/after/`) | pass (reviewed) | See \"Design comparison\" below |")
    w("")
    w("## All automated tests")
    w("")
    w("| Test | Result | Time | Detail |")
    w("|---|---|---|---|")
    for r in res["results"]:
        w(f"| {r['name']} | {'pass' if r['pass'] else 'FAIL'} | {r['ms'] / 1000:.1f} s | {r['detail'].replace('|', '/')} |")
    w("")
    w("## Design comparison")
    w("")
    w("`tests/baseline.js` captured every beat and outcome of the original into `qa/before/`. `tests/after.js` captured the updated build into `qa/after/` and wrote side-by-side images to `qa/compare/` (before on the left).")
    w("")
    w("\"Frame\" is the header, progress strip and input bar (top 86 px and bottom 52 px), which no fix was meant to change. It is pixel-identical in every pair except where the header shows \"typing…\" or the progress count differs at the moment of capture.")
    w("")
    w("| Before | After | Pixels changed | Frame changed | Intended differences (fix ids) |")
    w("|---|---|---|---|---|")
    for r in cmp_rows:
        w(f"| {r['before']} | {r['after']} | {r['changedPixelsPct']}% | {r['frameChangedPct']}% | {INTENDED.get(r['before'], '')} |")
    w("")
    w("Every pair was also reviewed by eye. Cards, bubbles, colours, fonts, radii, shadows, quick-reply buttons and the input bar match the original. The only style edits outside the listed fixes are invisible: a 44 px tap area around the unchanged 42 px send circle (T06), and the text field set at 16 px and scaled to look 14 px so iPhones do not zoom (D22).")
    w("")
    w("## Failures found during development, and fixes")
    w("")
    w("| Found | Cause | Fix |")
    w("|---|---|---|")
    w("| First run: 13 of 52 tests failed | Tests set files on the hidden input without tapping the upload button first, so the app did not know which step the photo was for | Tests now tap the button and answer the real file chooser. The app also falls back to the current photo step if the picker state is lost |")
    w("| `<img src=\"{{ th.url }}\">` fetched a literal URL before React bound it (console error, network request) | The template is parsed as HTML before binding | Real photos render as CSS background images in the same 200×144 frame |")
    w("| Input bar 1 px lower than the original in every screenshot | The 44 px send button grew the bar | Negative margin keeps the 42 px layout; frame difference now 0% |")
    w("| Facilitator jump showed `serial.jpg` for the second serial photo | Reconstruction used attempt 1 | Accepted-photo beats use attempt 2 (`serial-2.jpg`, `before-2.jpg`) as in the original |")
    w("| Facilitator F tab covered chat content | Positioned mid-screen | Moved over the decorative back arrow in the header |")
    w("| Build check rejected the results buttons (over 20 characters) | They were classed as reply buttons | Reclassed as research controls; the limit applies to WhatsApp reply buttons only (D28) |")
    w("| Test bugs: participant-mode trace check read the page's source script; one results test waited for the wrong button | Test code | Fixed the tests; the app was unchanged |")
    w("")
    w("## Checked by reading")
    w("")
    w("- **South African English.** Read every English string in `docs/copy-deck.csv`. UK spelling throughout; \"geyser\" and \"torch\" kept; 24-hour times; \"(PCV)\" added at first use; rand and dates not needed beyond 18 Jun 2026. The automated F03 test also scans for common US spellings and checks every time shown. No slang. Wording already correct was not changed.")
    w("- **Two-sitting timeline.** Read the transcript from start to the outcome: before photo 09:33–09:35, the installation message telling the installer to come back, the \"Later today\" chip directly above the 13:10 \"Installation done\" reply, then the serial and compliance steps 13:10–13:18 and the outcome 14:35–14:52. Times only move forward.")
    w("- **Facilitator drawer invisible without `#facilitator`.** Confirmed in the template that the tab and drawer sit inside `sc-if facMode`, which is false unless the hash has `facilitator`; the T03 test checks the rendered page has no tab, no drawer and no \"Facilitator\" text.")
    w("- **Translations.** isiZulu and Afrikaans were drafted for natural, plain register with trade terms as loan words. They are not final: every one is marked for native review.")
    w("")
    w("## Not verified")
    w("")
    w("- Real devices: the suite ran in desktop Chromium with phone-sized viewports. iOS Safari and Chrome on Android, opened from a link inside WhatsApp, were not tested here. Run the test guide's pre-session check on both before sharing.")
    w("- Real camera capture: `capture=\"environment\"` was checked as an attribute; opening the rear camera needs a real phone.")
    w("- Screen readers: semantics were checked in the markup, not with VoiceOver or TalkBack.")
    w("- The optional results POST: `RESULTS_ENDPOINT` is empty, so the Send results button and the POST were not exercised.")
    open(os.path.join(QA, "qa-report.md"), "w", encoding="utf-8").write("\n".join(out) + "\n")
    print("qa/qa-report.md written;", "missing ids:", missing)


if __name__ == "__main__":
    main()
