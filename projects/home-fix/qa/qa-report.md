# QA report: Home FIX prototype

Build: `dist/Home_FIX_Mobile.html`. Automated run: 2026-10-09T19:00:19.007Z (Chromium via Playwright, 390×844 unless stated; one full run at 1280×800).

**Result: 52 of 52 automated tests passed.** Full log: `qa/test-output.txt`; machine-readable: `qa/test-results.json`.

## Part 7 checklist

| Check | Result | Evidence |
|---|---|---|
| The original file in `original/` is byte-identical to the uploaded one | pass | P7-01: sha256 f696f7e7570a46b3a85303b647dfab3dc494704851b7104b5d4e984c2f55f731 |
| `dist/Home_FIX_Mobile.html` opens offline with no console errors | pass | P7-02: context offline; 0 console errors; 0 network requests |
| Full happy path in en, zu and af, and each of the three outcomes in each language (12 runs) | pass | P7-03: completed to results card; P7-03: completed to results card; n/a; 0 errors; 0 network requests; P7-03: completed to results card; 0 English strings; 0 errors; 0 network requests; … 12 tests |
| After choosing zu or af, no English string from COPY appears in the chat | pass | P7-03: completed to results card; n/a; 0 errors; 0 network requests; P7-03: completed to results card; 0 English strings; 0 errors; 0 network requests; P7-03: completed to results card; 0 English strings; 0 errors; 0 network requests; … 9 tests |
| Every string id has all three languages (build fails otherwise) | pass | P7-05: build check ok: 221 string ids x 3 languages; 215 zu and 215 af strings need native review; docs/copy-deck.csv written |
| Every quick-reply label ≤ 20 characters; no beat shows more than 3 | pass | P7-06: no violations across every quick-reply state reached in the 12 full runs |
| No percentage or confidence bar in participant mode | pass | F12: no "%" or "confidence" in participant mode; 2 ✅ results |
| Unrecognised text twice → Contact support offered; never a third repair | pass | T02: repair 1, repair 2 adds Contact support, third unrecognised message goes to a person (2 repairs total) |
| Refresh at 3 different beats restores the same state | pass | T04: serial_confirm:true, retake_outcome:true, serial_type:true |
| Photo upload with `setInputFiles`; the sample-photo link works (used for every photo in the 3 happy-path runs) | pass | P7-03: completed to results card; n/a; 0 errors; 0 network requests; P7-03: completed to results card; 0 English strings; 0 errors; 0 network requests; P7-03: completed to results card; 0 English strings; 0 errors; 0 network requests; … 4 tests |
| Results download as JSON and CSV that match the schema | pass | T05: 12 events; JSON + CSV (BOM, schema header); clipboard copy |
| No horizontal scroll at 320, 375, 390 and 430 px | pass | T06: 320px ok, 375px ok, 390px ok, 430px ok |
| No network requests after load | pass | P7-02: context offline; 0 console errors; 0 network requests; P7-03: completed to results card; n/a; 0 errors; 0 network requests; P7-03: completed to results card; 0 English strings; 0 errors; 0 network requests; … 4 tests |
| Each F-fix and T-item has at least one test naming its id | pass | all 26 ids named |
| Design unchanged apart from the fix areas (screenshots `qa/before/` vs `qa/after/`) | pass (reviewed) | See "Design comparison" below |

## All automated tests

| Test | Result | Time | Detail |
|---|---|---|---|
| P7-01 original/ is byte-identical to the uploaded file | pass | 0.0 s | sha256 f696f7e7570a46b3a85303b647dfab3dc494704851b7104b5d4e984c2f55f731 |
| P7-02 dist opens offline with no console errors | pass | 2.2 s | context offline; 0 console errors; 0 network requests |
| P7-03 outcome "approved" completes in en (facilitator-set, real photos) | pass | 24.8 s | completed to results card |
| P7-03 happy path completes in en (default script, sample photos) + P7-04 no English after choosing en | pass | 27.8 s | completed to results card; n/a; 0 errors; 0 network requests |
| P7-03 happy path completes in af (default script, sample photos) + P7-04 no English after choosing af | pass | 27.9 s | completed to results card; 0 English strings; 0 errors; 0 network requests |
| P7-03 happy path completes in zu (default script, sample photos) + P7-04 no English after choosing zu | pass | 27.9 s | completed to results card; 0 English strings; 0 errors; 0 network requests |
| P7-03 outcome "approved" completes in zu (facilitator-set, real photos) | pass | 24.9 s | completed to results card |
| P7-03 outcome "rejected" completes in en (facilitator-set, real photos) | pass | 28.6 s | completed to results card |
| P7-03 outcome "retake" completes in en (facilitator-set, real photos) | pass | 31.1 s | completed to results card |
| P7-03 outcome "retake" completes in zu (facilitator-set, real photos) | pass | 31.1 s | completed to results card |
| P7-03 outcome "approved" completes in af (facilitator-set, real photos) | pass | 25.2 s | completed to results card |
| P7-05 F01 every string id has en, zu and af (build check) | pass | 0.1 s | build check ok: 221 string ids x 3 languages; 215 zu and 215 af strings need native review; docs/copy-deck.csv written |
| P7-03 outcome "rejected" completes in zu (facilitator-set, real photos) | pass | 29.0 s | completed to results card |
| F01 no localizedEn sub-line; status/placeholder translated | pass | 3.3 s | placeholder, status and progress label in isiZulu |
| F02 language is asked first; Start job comes after, in that language | pass | 3.3 s | opening offers en/zu/af with subtitles; Start job shows as "Begin werk" after choosing Afrikaans |
| F03 South African English: PCV, UK spelling, 24-hour times | pass | 0.8 s | 0 US spellings; "(PCV)" shown; 29 times all 24-hour |
| P7-03 outcome "rejected" completes in af (facilitator-set, real photos) | pass | 29.0 s | completed to results card |
| F06 one compliance checklist with the new note | pass | 0.8 s | 1 checklist, sub-lines kept, new note, Upload photos + Skip for later |
| P7-03 outcome "retake" completes in af (facilitator-set, real photos) | pass | 31.0 s | completed to results card |
| F05 Resume previous job: none, then restore with "Welcome back" | pass | 5.5 s | no-job reply keeps Start job; saved job restored at the serial retake beat |
| F09 submitted and in review merged; no Finish or Exit; new note | pass | 2.2 s | one beat with both cards; only Contact support |
| F10 reference HF-2026 and date 18 Jun 2026 everywhere | pass | 0.8 s | HF-2026-DBN-04821, 18 Jun 2026; no HF-2024 or 16 Jun in source |
| F08 realistic signal drop: clock, Connecting…, silence, then ticks and status card | pass | 5.2 s | clock + "Connecting…" + no bot message for 2 s; then ticks, online, "Your photos came through", 6 of 6 / 4 of 4 |
| F04 two sittings: installation beat, "Later today" chip, serial from 13:10 | pass | 10.5 s | chip "Later today" then "Installation done 13:10"; before photo 09:34–09:35 |
| F11 greeting uses the name | pass | 2.0 s | first message: "Good morning, Sipho. This is Home FIX verification." |
| F07 Skip for later comes back before submission | pass | 7.7 s | skip → Continue → reminder; submit only after 4 of 4 |
| F14 serial retake offers Type it in instead | pass | 3.0 s | Retake photo / Type it in instead → typing path |
| F12 confidence values appear in the facilitator panel only | pass | 4.0 s | Before photo #1: retake (confidence 41) / Before photo #2: pass (confidence 96) |
| F16 needs-assistance outcome says why and who | pass | 0.9 s | title, body, reason, who, when, note and "Chat to Thandi now" |
| F13 serial confirmation and typed correction | pass | 5.6 s | confirm beat shown; typed value trimmed and uppercased; flow continues to compliance |
| F15 Contact support is an in-chat handover to Thandi | pass | 4.7 s | status card + Thandi bold name; participant types; hand-back restores Retake photo + Contact support |
| F17 no fake security banner; POPIA message; Privacy notice reply | pass | 4.0 s | banner gone; POPIA line after greeting; Privacy notice answers |
| T01 real photo, 2x2 grid for multiple, cancel does nothing, sample link | pass | 2.0 s | capture=environment (before, serial), multiple (compliance); 200×144 bubble; 2×2 grid; cancel = no-op; no blob URL in storage |
| F18 retake outcome appends a new exchange, then Approved | pass | 6.6 s | transcript kept (39 items) and 5 appended; approved follows |
| F19 no text below 11px in the chat area | pass | 7.3 s | every text node in the chat is 11px or larger |
| T02 keywords in en at a waiting beat return to the same beat | pass | 5.4 s | help/language/person: help line, language switch to af with the serial buttons re-sent, handover |
| T02 keywords in zu at a waiting beat return to the same beat | pass | 5.4 s | usizo/ulimi/umuntu: help line, language switch to af with the serial buttons re-sent, handover |
| T02 unrecognised text: repair, repair + Contact support, then never a third repair | pass | 3.0 s | repair 1, repair 2 adds Contact support, third unrecognised message goes to a person (2 repairs total) |
| F12 no confidence number or bar for the installer; ✅ on accepted photos | pass | 20.8 s | no "%" or "confidence" in participant mode; 2 ✅ results |
| T02 keywords in af at a waiting beat return to the same beat | pass | 5.4 s | hulp/taal/persoon: help line, language switch to zu with the serial buttons re-sent, handover |
| T03 facilitator drawer: hidden without #facilitator, PIN, controls, reset | pass | 4.4 s | no trace without #facilitator; PIN 2468; defaults Approved / Retake-then-pass; 19 jump items; offline toggle; log; reset to welcome |
| T03 facilitator offline: bot waits, outgoing bubble shows clock until back online | pass | 3.9 s | no bot message for 2 s while offline; delivered after Back online |
| T05 welcome: consent gates Start; #p prefill; language switcher | pass | 0.7 s | Start disabled until ticked; P07 prefilled; welcome switches to isiZulu |
| T04 real photos come back as a "photo" placeholder after refresh | pass | 2.6 s | photo restored as the striped placeholder labelled "photo" |
| T05 copy falls back to select-all when the clipboard is unavailable | pass | 1.2 s | textarea with the results shown and selected |
| T04 refresh restores beat, language, messages and outcome at 3 beats | pass | 6.4 s | serial_confirm:true, retake_outcome:true, serial_type:true |
| T04 works when localStorage is unavailable | pass | 4.6 s | flow runs with storage throwing; 0 console errors |
| T06 hash settings: #lang, #p, #facilitator (hash only) | pass | 0.6 s | #lang=af&p=P11 applied; no query-string reads in source |
| T05 results: JSON and CSV downloads match the schema; copy and fallback | pass | 4.9 s | 12 events; JSON + CSV (BOM, schema header); clipboard copy |
| T06 desktop 1280x800 full run | pass | 27.6 s | completed at 1280×800; 0 errors; no overflow |
| T06 no horizontal scroll at 320/375/390/430; tap targets >= 44px | pass | 32.2 s | 320px ok, 375px ok, 390px ok, 430px ok |
| P7-06 F20 every quick-reply label <= 20 chars and <= 3 per beat (seen in all runs) | pass | 0.0 s | no violations across every quick-reply state reached in the 12 full runs |

## Design comparison

`tests/baseline.js` captured every beat and outcome of the original into `qa/before/`. `tests/after.js` captured the updated build into `qa/after/` and wrote side-by-side images to `qa/compare/` (before on the left).

"Frame" is the header, progress strip and input bar (top 86 px and bottom 52 px), which no fix was meant to change. It is pixel-identical in every pair except where the header shows "typing…" or the progress count differs at the moment of capture.

| Before | After | Pixels changed | Frame changed | Intended differences (fix ids) |
|---|---|---|---|---|
| 00-entry | 00-entry | 25.8% | 0% | F02 language buttons in the first beat; F11 greeting with the name; F17 security banner removed; F19 timestamps 11 px |
| 01-language | 01-start | 35.9% | 0% | F02 Start job after the language; F17 POPIA line and Privacy notice button |
| 02-summary | 02-summary | 26% | 0% | F10 HF-2026 reference; F02 message order; F19 timestamps |
| 03-before | 03-before | 44.5% | 0% | T01 sample-photo link; F19 badge, heading and example-label sizes |
| 04-before_retake | 04-before_retake | 47.4% | 0% | T01 sample-photo link; F19 sizes |
| 05-before_ok | 05-before_ok | 45.6% | 0.31% | F12 ✅ and no confidence bar; F04 installation message replaces Continue (typing dots: the next beat is arriving) |
| 06-serial | 07-serial | 43.9% | 0% | F04 'Later today' chip and 13:10 times; F19 badge size |
| 07-serial_retake | 08-serial_retake | 40.2% | 0% | F12 confidence bar removed; F14 Type it in instead replaces Contact support; T01 sample link |
| 08-serial_ok | 09-serial_ok | 44.2% | 0.3% | F12 ✅, bar removed; F13 new note and confirmation beat (typing dots) |
| 09-compliance | 12-compliance | 43.4% | 0% | F06 single checklist with new note; F03 '(PCV)'; Upload photos / Skip for later replace Continue; T01 sample link |
| 10-upload | 12-compliance | 44.4% | 0% | F06 second checklist removed (merged into compliance) |
| 11-offline | 14-offline | 55.2% | 0.59% | F08 no 'Connection lost' chip or offline message; new title, body and fields; Submit evidence (D06) |
| 12-submitted | 15-submitted | 28.1% | 0.02% | F09 submitted and in review in one beat; Finish removed; F10 date and reference |
| 13-review | 15-submitted | 41.3% | 0% | F09 Exit removed; new note |
| outcome-approved | 16-outcome-approved | 2.4% | 0% | F10 reference and date |
| outcome-retake | 17-outcome-retake | 49.5% | 0.03% | F18 earlier transcript shows the merged beats; T01 sample link |
| outcome-rejected | 18-outcome-rejected | 19% | 0% | F16 new title, body, fields, note and Chat to Thandi now; F15 no phone number |

Every pair was also reviewed by eye. Cards, bubbles, colours, fonts, radii, shadows, quick-reply buttons and the input bar match the original. The only style edits outside the listed fixes are invisible: a 44 px tap area around the unchanged 42 px send circle (T06), and the text field set at 16 px and scaled to look 14 px so iPhones do not zoom (D22).

## Failures found during development, and fixes

| Found | Cause | Fix |
|---|---|---|
| First run: 13 of 52 tests failed | Tests set files on the hidden input without tapping the upload button first, so the app did not know which step the photo was for | Tests now tap the button and answer the real file chooser. The app also falls back to the current photo step if the picker state is lost |
| `<img src="{{ th.url }}">` fetched a literal URL before React bound it (console error, network request) | The template is parsed as HTML before binding | Real photos render as CSS background images in the same 200×144 frame |
| Input bar 1 px lower than the original in every screenshot | The 44 px send button grew the bar | Negative margin keeps the 42 px layout; frame difference now 0% |
| Facilitator jump showed `serial.jpg` for the second serial photo | Reconstruction used attempt 1 | Accepted-photo beats use attempt 2 (`serial-2.jpg`, `before-2.jpg`) as in the original |
| Facilitator F tab covered chat content | Positioned mid-screen | Moved over the decorative back arrow in the header |
| Build check rejected the results buttons (over 20 characters) | They were classed as reply buttons | Reclassed as research controls; the limit applies to WhatsApp reply buttons only (D28) |
| Test bugs: participant-mode trace check read the page's source script; one results test waited for the wrong button | Test code | Fixed the tests; the app was unchanged |

## Checked by reading

- **South African English.** Read every English string in `docs/copy-deck.csv`. UK spelling throughout; "geyser" and "torch" kept; 24-hour times; "(PCV)" added at first use; rand and dates not needed beyond 18 Jun 2026. The automated F03 test also scans for common US spellings and checks every time shown. No slang. Wording already correct was not changed.
- **Two-sitting timeline.** Read the transcript from start to the outcome: before photo 09:33–09:35, the installation message telling the installer to come back, the "Later today" chip directly above the 13:10 "Installation done" reply, then the serial and compliance steps 13:10–13:18 and the outcome 14:35–14:52. Times only move forward.
- **Facilitator drawer invisible without `#facilitator`.** Confirmed in the template that the tab and drawer sit inside `sc-if facMode`, which is false unless the hash has `facilitator`; the T03 test checks the rendered page has no tab, no drawer and no "Facilitator" text.
- **Translations.** isiZulu and Afrikaans were drafted for natural, plain register with trade terms as loan words. They are not final: every one is marked for native review.

## Not verified

- Real devices: the suite ran in desktop Chromium with phone-sized viewports. iOS Safari and Chrome on Android, opened from a link inside WhatsApp, were not tested here. Run the test guide's pre-session check on both before sharing.
- Real camera capture: `capture="environment"` was checked as an attribute; opening the rear camera needs a real phone.
- Screen readers: semantics were checked in the markup, not with VoiceOver or TalkBack.
- The optional results POST: `RESULTS_ENDPOINT` is empty, so the Send results button and the POST were not exercised.
