# Claims log

Every factual claim on `case-studies/home-fix/index.html`, and where it comes from.

Paths are relative to `projects/home-fix/` unless they start with `case-studies/`.

- **Spec** means `docs/conversation-design-spec.md`.
- **Deck** means `docs/copy-deck.csv`.
- **Screen** means `case-studies/home-fix/assets/screens/<name>`, captured from the prototype by `tools/screenshots.mjs`.

Line numbers are as of this build. Rationale lines ("why it matters", "intended effect") are NeuraUX design reasoning, not facts. They are marked **Rationale**, and each one points to the decision it explains.

## 1. Cover and summary

| Claim on the page | Source |
|---|---|
| (No concept label on the page, at the founder's request.) Home FIX is not presented as a client anywhere on the page | README.md line 5 ("Home FIX is not a real company"); the prototype's welcome screen `w_proto` (Deck line 199) still says so |
| Helping plumbers prove a geyser job from the roof space | Spec line 9 (plumbers replace geysers, prove the work); Spec line 34 (roof spaces) |
| A person makes every final call | Spec line 19 ("A reviewer makes every approval decision"); Spec line 446 |
| Trilingual WhatsApp assistant for insurance job verification | Spec lines 9, 13 (channel), 15 (three languages) |
| We designed how the assistant asks, checks and hands over; built a working prototype and the specification | `dist/Home_FIX_Mobile.html`; Spec line 3; Spec §11 Human handover (line 471 onwards) |
| Role: conversation design, product design and prototype | The work in `projects/home-fix/` (spec, copy deck, prototype) |
| Channel: WhatsApp | Spec line 13 |
| Languages: English, isiZulu and Afrikaans | Spec line 15 |
| Deliverables: prototype, spec, copy deck, test kit | `dist/`, `docs/conversation-design-spec.*`, `docs/copy-deck.csv`, `docs/test-guide.md` |
| Hero: the installer confirms the serial number before it is saved | Screen `serial-confirmation`; Spec line 444; Deck line 97 |

## 2. Problem and context

| Claim | Source |
|---|---|
| A plumber on an insurance panel replaces burst geysers | Spec line 9 |
| Home FIX needs proof before it approves and pays | Spec line 9 |
| Six evidence items: before photo, serial label, four compliance photos; plus the serial number | Spec line 21 |
| Photos blurry, labels unreadable, items missing, installers unsure what "good" looks like. Marked **Assumption, to be tested** | Spec line 9 (stated as the concept's problem; no research exists) |
| Installer, reviewer, support agent, customer roles | Spec lines 27–30 |
| Roof spaces cramped, hot, dark, one hand | Spec line 34 |
| Labels metallic or behind plastic; glare most likely failure | Spec line 35 |
| Signal drops; load-shedding; progress saved after every step | Spec lines 36–37 |
| Data costs money; each photo asked for once; failures explained in text | Spec line 38 |
| Installers may prefer English, isiZulu or Afrikaans | Spec line 15 (three languages, chosen by the installer). The preference itself is an assumption. |
| Conditions from desk work, not field research. **Assumption, to be tested** | No `research/` folder exists; the spec cites no field research |
| Design goals: six items plus a confirmed serial; AI accepts or asks again, never rejects or approves payment; a person approves; three languages with a person in the same chat | Spec lines 17, 19, 21, 15; Spec line 444 |

## 3. Conversation architecture

| Claim | Source |
|---|---|
| Flow diagram | `case-studies/home-fix/assets/diagrams/flow.svg`, rendered by `tools/diagram.mjs` from the Mermaid block in Spec §5 |
| Text version of the flow (12 steps) | Spec §5 Mermaid source; Spec §6 beat inventory (lines 142–160) |
| Two sittings; before photo on arrival; serial label only exists after installation | Spec line 39; Spec line 661 (F04) |
| "Go ahead with the installation"; Installation done button | `m_install` (Deck line 73); `btn_install_done` (Deck line 74) |
| Job paused, progress saved | `m_install` "Your progress is saved." (Deck line 73); Spec line 148 |
| Language chosen in the first message; everything later follows it | Spec lines 72–74 |
| language / ulimi / taal; help / usizo / hulp; person / umuntu / persoon | Spec lines 76, 82–84 |
| Choice comes back without losing progress | Spec line 76 |
| Every button label within 20 characters in all languages; build fails otherwise | Spec line 92; `tools/check.js`; Spec line 86 |
| Serial confirmation in three languages | `m_serial_check` (Deck line 97: en, zu, af columns) |
| Translations pending first-language review | Deck column `needs_native_review` = yes (Deck line 97) |
| Stage table: triggers, items collected, decisions, recovery, end states | Spec §6 rows `entry`–`rejected` (lines 142–160); Spec §10 (lines 450–465) |
| Unclear text gets a one-line repair | Spec §10 (repair rows) |
| Blurry photo: plain reason, retake, Contact support beside it | Spec line 146; `ai_blurry` (Deck line 66) |
| Glare: retake or Type it in instead; typed number saved and flagged | Spec lines 150, 153, 445 |
| Four compliance photos: PCV, overview, drip tray and overflow, isolator | Spec line 154; `c_title` and items (Deck lines 103–111) |
| Partial sends counted; skip brings a reminder; dropped signal holds replies | Spec lines 456–458 |
| A person decides: approve, retake, needs assistance | Spec lines 157–160; Spec §12 |
| Retake adds one photo exchange; needs assistance opens a chat with Thandi | Spec line 159 (F18); Spec line 160 |
| Worked example, every quoted line | Deck lines 75 (`m_serial_intro`), 78/80/83 (card items), 89–91 (`ai_glare`, `r_glare`, `r_hidden`), 93 (`btn_type_in`), 94 (`ai_serial_ok`), 96 (`ai_reviewer_too`), 97 (`m_serial_check`), 100 (`m_serial_type`), 101 (`m_serial_saved`). "Got it — serial number captured" is shown without its ✅ and dash, and the page says so. The typed value matches Screen `serial-typed-correction`. |
| "Three decisions sit in that exchange" | **Rationale**, from Spec lines 438 and 444 and F14 (line 671) |

## 4. The designed experience

| Claim | Source |
|---|---|
| Starting: language in the first message, greeting by name, privacy purpose before asking for anything | Screen `language-choice`, Screen `job-summary-af`; Deck lines 31, 32, 34; Spec line 501; D04 in the spec decision log |
| Collecting: guidance card with what to show, how close, a good and a bad example | Screen `before-photo-guidance`; Spec line 145 |
| AI reading returned as a yes-or-no question | Screen `serial-confirmation-zu`; Spec line 152 |
| Missing or invalid: typed number saved in capitals, stated back | Screen `serial-typed-correction`; Spec line 153; Deck line 101 |
| Skipped photos asked for again before submission | Spec line 456; F07 (Spec line 664) |
| Recovering: blurry photo named plainly, Contact support beside the retake | Screen `blurry-photo-retake`; Deck lines 66–67, 69 |
| Dropped signal: clock on the photos, nothing sent until back; a business chat can't reach an offline phone | Screen `signal-drop-connecting`; Spec line 458; F08 (Spec line 665) |
| Completing: reference and time; in-review card; "A real person makes the final decision…"; payment after approval | Screen `submitted-in-review`; Deck lines 127, 130, 141 |
| Every "User problem" and "Intended effect" line | **Rationale**, matching Spec §2 (lines 34–39) and the fixes cited. Effects are intended, not measured. |
| Interactive prototype embed | `dist/Home_FIX_Mobile.html` (unchanged) |

## 5. AI rules and human review

| Claim | Source |
|---|---|
| AI accepts or asks again; never rejects; a person decides | Spec lines 17, 442, 446 |
| Confidence never shown to the installer; held for the reviewer | Spec lines 427, 443; F12 (Spec line 669) |
| Confidence routes the next step (retake or next item) | Spec §9 table (the check result decides the beat) |
| Every extracted value confirmed by the installer | Spec line 444 |
| Way out of retake loops: Contact support, Type it in instead, a person after two unclear messages | Spec lines 438, 461 |
| Help is a person in the same chat; Thandi hands back to the same step; no phone number | Spec lines 473–485; F15 (Spec line 672); `s_connecting_body` (Deck line 172) |
| Not approved: why, who, by when (Thandi, today before 15:00) | Spec line 497; Deck lines 162–168; F16 (Spec line 673) |
| Thresholds: accept about 96 (photo) and 98 (serial); ask again at about 41 or below; starting values; in-between values need real photos | Spec line 436 |
| In the prototype, results are scripted | Spec line 427 |
| Three outcomes | Screens `outcome-approved`, `outcome-retake`, `outcome-needs-assistance`; Spec §12 |
| Client decisions: retention | Spec line 646 (Q04) |
| Client decisions: thresholds | Spec line 651 (Q09) |
| Client decisions: service hours after 19:00 and Sundays | Spec line 648 (Q06); hours in Deck line 172 |
| Client decisions: payment wording | `s_review_note` (Deck line 141). Including it as a client decision is **Rationale**: it is a promise about payment. |
| Client decisions: template wording | Spec line 647 (Q05); Spec line 413 |
| Each "Why it matters" line | **Rationale** |

## 6. Testing and iteration

| Claim | Source |
|---|---|
| First version reviewed against a written brief; 20 problems fixed | Spec §19 changelog F01–F20 (lines 658–677) |
| Every fix checked with automated tests | `qa/qa-report.md` line 5 and the checklist row "Each F-fix and T-item has at least one test naming its id" |
| Language slipped back to English; after: one table, missing translation stops the build | Screen `before-language-zu` (captured from `original/Home_FIX_Mobile.html`) vs Screen `job-summary-zu`; F01 (Spec line 658) |
| Before photo at 09:33, serial label at 09:37 | Screen `before-serial-0937`; `qa/before/03-before.png` (09:33) and `qa/before/06-serial.png` (09:37) |
| After: installation step, serial later the same day | Screen `after-serial-later-today`; F04 (Spec line 661) |
| Before: "Read confidence 41%" and "98%" | Screen `before-serial-confidence`; `qa/before/07-serial_retake.png`, `qa/before/08-serial_ok.png` |
| After: plain result; numbers in the facilitator view | Screen `after-serial-no-confidence`; F12 (Spec line 669) |
| Before: support meant a phone call, no reason given | Screen `before-referral-phone` (placeholder number covered before capture); `qa/before/outcome-rejected.png` |
| After: Thandi in the same chat; why, who and when | Screen `outcome-needs-assistance`; F15/F16 (Spec lines 672–673) |
| 52 of 52 automated checks; three languages, every outcome, 320 px, English scan | `qa/qa-report.md` lines 5 and 9–25 |
| Not yet tried on real phones | `qa/qa-report.md` lines 131–133 |
| No participant sessions have run | No `research/` folder exists |
| Who: own phones, preferred language, participant code | `docs/test-guide.md` lines 7–10 and the links table |
| How: moderated, about 20 minutes, think aloud, moderator sets the outcome | `docs/test-guide.md` lines 3, 26, 32 |
| Tasks: complete a job, retake, get help | `docs/test-guide.md` task table (from line 44) |
| Measures, labelled **Proposed** | Spec §15 lines 534–547 |

## 7. Next steps and call to action

| Claim | Source |
|---|---|
| Delivered: prototype in three languages, spec, copy deck of 221 strings, moderator guide, QA report | `dist/`; `docs/`; Deck has 221 string rows (222 lines including the header); `qa/qa-report.md` |
| Still to validate: native review | Spec line 643 (Q01) |
| Still to validate: real phones | `qa/qa-report.md` line 133 |
| Still to validate: thresholds on real photos | Spec line 651 (Q09) |
| Still to validate: whether installers trust the wording | **Rationale**: the research question behind the test plan |
| What we learned | **Rationale**: reflection on F01, F04 and F08 (Spec lines 658, 661, 665) |
| Blueprint gives the flow, copy, AI rules and handover pack, tested in walkthroughs with staff | Root `CLAUDE.md` §4, Conversation Design Blueprint (designs, handover pack, walkthrough testing with 3–5 staff) |
| Prototype and test kit not part of the Blueprint's standard scope | Root `CLAUDE.md` §5, "Do not promise prototypes or a separate validation service" |
| hello@neuraux.co.za | Root `CLAUDE.md` §1 |
