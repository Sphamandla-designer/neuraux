# Home FIX: conversation design specification

Prototype: `dist/Home_FIX_Mobile.html`. This document describes the prototype as it stands after fixes F01–F20 and testing-readiness items T01–T06. It does not describe features the prototype does not have.

String ids in this document (for example `m_greeting`) refer to the `COPY` table in `src/template.html` and to `docs/copy-deck.csv`. The isiZulu and Afrikaans strings are drafts that need native review.

## 1. Summary

**Problem.** Insurance-panel plumbers replace burst electric geysers. Home FIX needs proof that each replacement was done properly before it approves the job and pays. Today that proof is uneven: photos are blurry, the serial number label is unreadable, compliance items are missing, and installers do not know what "good" looks like.

**Users.** The installer (a plumber, here "Sipho") sends the evidence. A Home FIX reviewer decides. A support agent ("Thandi") helps when the installer is stuck or when the reviewer cannot approve from the photos.

**Channel.** A WhatsApp Business conversation. The prototype imitates a generic chat app; it is not WhatsApp.

**Languages.** English, isiZulu and Afrikaans. The installer chooses in the first message and can switch at any time.

**What the AI does.** Two automated checks: a photo quality check (is the photo clear enough, does it show what was asked) and a serial number reading (OCR). The AI can accept a photo or ask for another one. It never rejects a job, never blocks the installer, and never approves payment.

**What people do.** The installer confirms or corrects what the AI read. A reviewer makes every approval decision. An agent takes over in the chat when asked, or when the reviewer cannot approve.

**Evidence collected (6 items).** 1 before photo, 1 serial number label photo, 4 compliance photos: pressure control valve (PCV), installation overview, drip tray and overflow, electrical isolator. Plus the serial number value, confirmed or typed by the installer.

## 2. Users and context

| Person | Role in the conversation | What they need |
|---|---|---|
| Installer (Sipho) | Sends photos, confirms the serial number, submits | Short steps, clear photo guidance, a way out when stuck, to know when they will be paid |
| Reviewer (Home FIX specialist) | Sees the evidence and the AI results; approves, asks for a retake or refers to an agent | Clear photos, the serial value with its source (read or typed), reason codes for anything unusual |
| Support agent (Thandi) | Replies in the same chat; finishes jobs the reviewer could not approve | The job reference, where the installer is in the flow, what has been sent |
| Customer (M. Khumalo) | Not in the conversation | A safe, compliant installation |

**Site conditions in South Africa that shape the design**

- **Roof spaces and geyser cupboards.** Cramped, hot and dark. Installers often hold a torch or a ladder with one hand. Guidance says "Use your phone torch if it's dark" and gives a distance (15–20 cm) rather than abstract advice.
- **Low light and glare.** Serial labels are often metallic or behind a plastic sleeve. Glare is the most likely failure, so the serial step has its own retake guidance and a "Type it in instead" way out.
- **Poor signal.** Roof spaces and townhouse complexes often drop signal. The flow tolerates a dropped upload without scaring the installer (F08).
- **Load-shedding.** Routers and towers can go down. Progress is saved after every step; the installer can come back.
- **Data cost.** Prepaid data is expensive. The flow asks for each photo once, explains failures in text, and avoids sending images back to the installer apart from one optional example.
- **Two sittings.** The before photo is taken on arrival. The serial label belongs to the new geyser, so it can only be photographed hours later, after installation (F04).

**Trade vocabulary** kept in English in every language because installers use it: geyser (isiZulu loan word i-geyser), PCV, drip tray, overflow, isolator, serial. Afrikaans uses the common trade words geiser, drukbeheerklep, drupbak, oorloop, isolator, reeksnommer.

## 3. Assistant persona and voice

**Name.** The assistant has no personal name. It speaks as "Home FIX verification" (`m_greeting`), and its AI checks appear under "Home FIX AI · automated check". People in the conversation have names (Thandi). This keeps the line between the automated assistant and a person clear.

**Disclosure.** The AI card header always says "automated check". The in-review card says "A real person makes the final decision, not an automated system." The support agent introduces herself by name in a bold first line.

**Tone.** Plain, respectful and practical. Short sentences. It explains what to do, not how the system works. It treats failures as normal ("No problem — this happens often.").

| Do | Don't |
|---|---|
| Name the next action: "Tap Installation done." | Say "Please proceed to the next step." |
| Give a concrete fix: "Stand 15–20 cm back and use your torch." | Say "Image quality insufficient." |
| Use the installer's name at the start and at outcomes | Use the name in every message |
| Say who decides and when: "A real person makes the final decision." | Imply the AI approves or rejects |
| Keep trade terms installers use (geyser, PCV, isolator) | Translate trade terms into words nobody uses on site |
| Admit limits: "Sorry, I didn't catch that." | Pretend to understand free text |

**Formatting rules**

- One idea per message; no message longer than three short sentences.
- Cards carry structured information (fields, checklists, guidance). Text bubbles carry conversation.
- 24-hour times (13:18). Dates as "18 Jun 2026" (isiZulu "18 Juni 2026", Afrikaans "18 Jun. 2026").
- UK spelling. "Geyser" and "torch", not "water heater" and "flashlight".
- Quoted keywords use curly quotes: type “person”.

**Emoji policy.** Only ✅ at the start of an accepted AI result. No other emoji. The original 🔒 banner was removed (F17).

## 4. Language system

**Selection.** The welcome screen has a language switcher, and `#lang=xx` in the link preselects it. The first chat messages (greeting and language question) appear in that language. The first message then offers three reply buttons: English, isiZulu, Afrikaans, each with a subtitle in its own language (`lang_*`, `lang_*_sub`). Everything from "Start job" onwards appears in the chosen language (F02).

**Typed choice.** At the language question, typing "English", "isiZulu", "Zulu" or "Afrikaans" (any case, accents ignored) also chooses.

**Switching.** Typing a language keyword at any point shows the language buttons again. Choosing one switches immediately, confirms in the new language (`m_lang_changed`) and re-sends the current step's quick replies in the new language. Progress is kept. Earlier messages stay in the language they were sent in, as in a real chat.

**Keywords.** Recognised in every language at every point. Matching ignores case, accents and punctuation, and the whole message must be the keyword.

| Intent | English | isiZulu | Afrikaans | Response |
|---|---|---|---|---|
| Help | help | usizo | hulp | One line describing the current step, plus the person and language keywords (`m_help` + `step_*`) |
| Person | person | umuntu | persoon | In-chat handover to Thandi (section 11) |
| Language | language | ulimi | taal | Language buttons (`m_lang_q`) |

**Never fall back to English.** Every string id has en, zu and af. `tools/check.js` fails the build if any is missing, and `t()` logs an error and shows `[id]` rather than English if a string is ever missing at runtime.

**Not translated.** Home FIX, Home FIX AI, the job reference (HF-2026-DBN-04821), the serial number, POPIA, names (Sipho, Thandi, M. Khumalo), places (Durban, KZN), file names on sample photos, and the AI badge "AI".

**Numbers and dates.** 24-hour time in all languages. Dates: "18 Jun 2026" (en), "18 Juni 2026" (zu), "18 Jun. 2026" (af). Ranges use an en dash: 15–20 cm, 07:00–19:00.

**Character limits.** Reply button labels: 20 characters in every language (WhatsApp limit). The build check enforces this for every `btn_*` string and for every label a beat shows; the tests also check every quick-reply state reached in 12 full runs. Translations were shortened to fit (for example Afrikaans "Gesels met Thandi" for "Chat to Thandi now"). Labels are never visually truncated.

**Native review.** All isiZulu and Afrikaans strings except the six language names are marked `needs_native_review = yes` in `docs/copy-deck.csv`. Process: a first-language speaker who knows the trade reviews the CSV, edits the `zu`/`af` columns, and the strings are copied back into `COPY`. Re-run `tools/pack.py`; the build check confirms nothing is missing and every label still fits.

## 5. Flow map

<!-- FLOW -->

## 6. Beat inventory

A beat is one turn of the assistant: the messages it sends and the quick replies it then shows. Progress is the evidence count shown in the strip under the header (0–6). Times are the simulated clock.

| Beat id | Purpose | Bot messages (string ids) | Card | Quick replies → destination | Typed input accepted | Progress | Time |
|---|---|---|---|---|---|---|---|
| `entry` | Greet, ask for language | `chip_today`, `m_greeting`, `m_lang_q` | — | `lang_en`, `lang_zu`, `lang_af` → `start` | Language names; keywords | 0 | 09:30 |
| `start` | Confirm language, privacy notice, job count | `m_hi`, `m_popia`, `m_jobs` | — | `btn_start` → `summary`; `btn_resume` → resume (F05); `btn_privacy` → `m_privacy_tap` | Keywords | 0 | 09:31 |
| `summary` | Show the job | summary card (`card_summary_title`, `f_reference`, `f_customer`, `f_region`, `f_installation`, `v_installation`, `sum_progress_note`), `m_ready` | Summary | `btn_begin` → `before` | Keywords | 0 | 09:32 |
| `before` | Ask for the before photo | `m_before_intro`, guidance card (`g_before_title`, `g_before_sub`, `h_what`, `i_whole`, `i_area`, `h_tips`, `i_light`, `i_back`, `i_lens`, `ph_good_example`, `ph_too_close`, `badge_good`, `badge_avoid`, `g_before_footer`) | Guidance | `btn_upload_photo` → camera → photo check → `before_retake` or `before_ok`; `btn_need_help` → `m_need_help` | Photo; keywords | 0 | 09:33 |
| `before_retake` | Photo too blurry | AI card (`ai_photo_check`, `ui_ai_auto`, `ai_blurry`, `ai_blurry_note`) | AI | `btn_retake` → camera → photo check; `btn_support` → handover | Photo; keywords | 0 | 09:34 |
| `before_ok` | Photo accepted | AI card (`ai_photo_check`, `ai_before_ok`, `ai_reviewer_later`), `m_one_of_six` | AI | none; continues to `install` | — | 1 | 09:35 |
| `install` | Installation happens off-chat (F04) | `m_install` | — | `btn_install_done` → `serial` | Keywords | 1 | 09:35 |
| `serial` | Ask for the serial label, hours later | `chip_later` (before the reply bubble), `m_serial_intro`, guidance card (`g_serial_title`, `badge_important`, `g_serial_sub`, `h_what`, `i_only_label`, `h_close`, `i_15_20`, `i_fill`, `h_lighting`, `i_torch`, `ph_serial_label`, `ph_glare`, `g_serial_footer`) | Guidance | `btn_upload_serial` → camera → serial reading → `serial_retake` or `serial_ok`; `btn_view_example` → example photo (`ph_example_serial`, `m_example_caption`) | Photo; keywords | 1 | 13:10 |
| `serial_retake` | Label unreadable (glare) | AI card (`ai_reading`, `ai_glare`, `r_glare`, `r_hidden`, `ai_glare_note`) | AI | `btn_retake` → camera; `btn_type_in` → `serial_type` (F14) | Photo; keywords | 1 | 13:11 |
| `serial_ok` | Serial read | AI card (`ai_reading`, `ai_serial_ok`, `ai_field_serial` = KWH-8842-ZA-117, `ai_reviewer_too`) | AI | none; continues to `serial_confirm` | — | 2 | 13:12 |
| `serial_confirm` | Installer confirms the reading (F13) | `m_serial_check` | — | `btn_yes_correct` → `compliance`; `btn_no_fix` → `serial_type` | Keywords | 2 | 13:12 |
| `serial_type` | Installer types the serial | `m_serial_type`; after the reply `m_serial_saved` | — | none | Any text (not a keyword) → saved trimmed, spaces collapsed, upper case → `compliance` | 1 if never read, else 2 | 13:13 |
| `compliance` | Ask for the 4 compliance photos (F06) | `m_compliance_intro`, checklist card (`c_title`, `c_pcv`, `c_pcv_sub`, `c_overview`, `c_overview_sub`, `c_drip`, `c_drip_sub`, `c_isolator`, `c_isolator_sub`, `c_note`) | Checklist | `btn_upload_photos` → gallery (multiple) → fewer than 4: `m_partial`, stay; 4 in total: signal drop → `offline`. `btn_skip` → `m_skip` + `btn_continue` → `reminder` | Photos; keywords | 2 | 13:14 |
| `reminder` | Ask again after a skip (F07) | `m_reminder` | — | `btn_upload_photos` (only) | Photos; keywords | 2 | 13:15 |
| `offline` | Photos arrived after the signal came back (F08) | status card (`s_came_through`, `s_came_body`, `f_completed` = `v_6of6_items`, `f_photos_received` = `v_4of4`, `s_came_note`) | Status (wait) | `btn_submit` → `submitted` | Keywords | 6 | 13:16 |
| `submitted` | Submitted, then in review (F09) | status card (`s_ok`, `s_ok_body`, `f_reference`, `f_submitted` = `v_date_submit`, `f_items` = `v_6complete`, `s_ok_note`), `m_thanks_team`, status card (`s_review`, `s_review_body`, `f_est` = `v_2h`, `f_reviewed_by` = `v_specialist`, `s_review_note`) | Status (good), status (wait) | `btn_support` → handover. The review outcome follows about 6 s later | Keywords | 6 | 13:18 |
| `approved` | Outcome: approved | `m_good_news`, status card (`s_approved`, `s_approved_body`, `f_reference`, `f_completed` = `v_date_approved`, `f_items` = `v_6verified`, `s_approved_note`) | Status (good) | `btn_close_job` → session ends, results card | Keywords | 6 | 14:52 |
| `retake` | Outcome: one item needs a retake | `m_almost`, status card (`s_retake`, `s_retake_body`, `f_item` = `g_serial_title`, `f_reason` = `v_glare_reason`, `s_retake_guide`) | Status (warn) | `btn_retake_now` → camera → AI card (`ai_photo_check`, `ai_retake_ok`), `m_sent_reviewer` → `approved` after about 4 s (F18); `btn_later` → `m_later_one`; `btn_support` → handover | Photo; keywords | 5 | 14:40 (retake reply 14:44) |
| `rejected` | Outcome: needs assistance (F16) | `m_patience`, status card (`s_agent_finish`, `s_agent_body`, `f_reason` = `v_mismatch`, `f_who` = `v_thandi`, `f_when` = `v_before15`, `s_agent_note`) | Status (bad) | `btn_chat_thandi` → handover; after the hand-back the session ends | Keywords | 6 | 14:35 |

Global replies available at any beat through typing: help, person and language keywords (section 4), and repair (section 10).

## 7. Message inventory

Generated from the `COPY` table by `tools/check.js`; identical to `docs/copy-deck.csv`. Character counts are Unicode code points. Limit is the WhatsApp limit for the element (20 for reply buttons) or a working limit for card parts.

<!-- INVENTORY -->

## 8. Component mapping to WhatsApp

How each prototype element would be built on the WhatsApp Business Platform (Cloud API).

| Prototype element | WhatsApp component | Notes |
|---|---|---|
| Quick replies | Interactive **reply buttons** | Maximum 3 per message, label maximum 20 characters. The prototype enforces both (F20). Buttons attach to the last message of a beat. Icons and the chevron are prototype styling; WhatsApp shows plain labels. |
| Language choice | Reply buttons | Three buttons: English, isiZulu, Afrikaans. WhatsApp buttons have no subtitle, so the subtitles ("Qhubeka ngesiZulu") move into the message body as three short lines. |
| Guidance card | Image with caption | A pre-rendered card image per language (the example tiles need visuals), with a short caption that repeats the key instruction for screen readers and for when images do not load. |
| Summary card | Formatted text | Field list as text lines with *bold* labels. The progress bar becomes "0 of 6 items done". Text is cheaper on data than an image and is searchable. |
| Checklist card | Formatted text | Four lines with "•" bullets and the sub-line after a dash. A tick per item can be shown as ✅ when received. |
| AI card | Formatted text | First line "Home FIX AI · automated check". Result line starting with ✅ when accepted. Reasons as bullets. The serial value on its own line in *bold*. No confidence values (F12). |
| Status card | Formatted text, or an image with caption for the final outcomes | Title in *bold*, fields as lines. The tone colour has no WhatsApp equivalent; the title words carry the meaning. |
| Photo upload | The installer sends **media** (image) | The camera and gallery are the WhatsApp attach sheet. Several photos sent at once arrive as separate messages; the bot counts them (`m_partial`). |
| Example photo | Image message | Sent only when the installer taps "View example". |
| Typed input | Text message | Serial correction, agent replies, keywords. |
| "Later today" date chip | None | WhatsApp shows its own date separators. The time gap is visible in the message times. |
| Clock and blue ticks | WhatsApp's own delivery states | Not controlled by the business. The prototype imitates them to show the signal drop (F08). |
| Header status ("online", "typing…", "Connecting…") | WhatsApp's own | Business accounts can send a typing indicator; "Connecting…" is the phone's own state. |
| Progress strip | None | No WhatsApp equivalent. Progress is said in text at key points: "That's 1 of 6 evidence items captured." and the 6-of-6 fields in the status cards. |
| First message | Pre-approved **Utility template** | A business may only start a conversation with an approved template, and only with installers who have opted in to WhatsApp messages from Home FIX (opt-in collected at panel registration, with the purpose stated). Proposed template: greeting + language question with three quick-reply buttons. |
| In-chat agent (Thandi) | Same number, agent inbox | The agent replies from the business number through an inbox tool. The bot pauses while the agent owns the chat. |
| Privacy notice | Call-to-action URL button | "Privacy notice" opens the notice on the Home FIX site. In the prototype it only says it is not part of the prototype. |

**The 24-hour service window.** After the installer's last message, the business can send free-form messages for 24 hours. Outside that window only templates are allowed.

| Later message | Usually inside the window? | What is needed |
|---|---|---|
| Serial step after installation (about 3.5 hours later) | Yes, if the installer taps Installation done | Nothing; it is a reply. A reminder sent by Home FIX more than 24 hours after the last message would need a template. |
| Review outcome (approved, retake, needs assistance) | Usually, since reviews take about 2 hours | A Utility template for each outcome, used when the review finishes more than 24 hours after the installer's last message (for example jobs submitted late on Saturday and reviewed on Monday). |
| Agent follow-up "Today before 15:00" | Depends on timing | A template if outside the window. |

## 9. AI checks

The prototype scripts the AI results; it does not analyse images. Confidence values exist in the data and in the facilitator panel only (F12).

| Check | Input | Outcomes | Confidence in the prototype | Installer sees | Reviewer sees |
|---|---|---|---|---|---|
| Photo quality: before photo | One image | Accept, or ask again | 41 for a retake, 96 for accepted | Retake: AI card with plain reason and encouragement. Accept: ✅ line and "A Home FIX reviewer can still check this later." | The photo, the result, the confidence, attempt number |
| Serial reading (OCR) | One image of the label | Read (value), or ask again | 41 for a retake, 98 for a read | Retake: reasons (glare, hidden characters). Read: ✅ and the value; then asked to confirm (F13) | The photo, the value, whether it was confirmed, corrected or typed |
| Compliance photos | 1–4 images | Accepted when all 4 have arrived | 96 | Count of photos received; the status card after the signal drop | All four photos |
| Retake photo (after reviewer request) | One image | Accepted | 98 | ✅ line, then "Thanks. Sent to the reviewer." | The new photo |

**Thresholds (working values, to be calibrated in the pilot).** Accept at about 96 for photo quality and 98 for serial reading; ask again at about 41 or below. Values between need calibration with real photos before any production threshold is set.

**Retake limits.** The AI never traps the installer in a loop. The before-photo retake beat always offers Contact support. The serial retake beat always offers Type it in instead. A facilitator can force more retakes, but each retake still shows those ways out.

**Rules**

1. The AI accepts or asks again. It never rejects a job, blocks the installer or approves payment.
2. The installer never sees confidence numbers or bars.
3. Every value the AI extracts (the serial number) is confirmed by the installer before it is saved.
4. A typed serial is saved as typed and flagged for the reviewer to compare with the photo.
5. A person makes every approval decision; the in-review card says so.
6. The AI card always says "automated check".

## 10. Errors and recovery

| Situation | Trigger | Response | String ids | Maximum repeats |
|---|---|---|---|---|
| Blurry before photo | Photo check result "retake" | AI card with reason and encouragement; Retake photo, Contact support | `ai_blurry`, `ai_blurry_note` | No limit; Contact support is always on the beat |
| Glare on serial label | Serial reading result "retake" | AI card with reasons; Retake photo, Type it in instead | `ai_glare`, `r_glare`, `r_hidden`, `ai_glare_note` | No limit; Type it in instead is always on the beat |
| Misread serial | Installer taps No, fix it | Asks the installer to type the serial; saves it; tells them a reviewer will compare | `m_serial_type`, `m_serial_saved` | Once per tap |
| Skipped compliance photos | Skip for later | Acknowledges, then a Continue reply leads to the reminder; submission needs all 4 | `m_skip`, `m_reminder` | Reminder each time Continue is tapped |
| Some compliance photos | Fewer than 4 received | Says how many arrived and how many are left | `m_partial` | Until 4 have arrived |
| Signal drop while sending | Scripted on the 4th compliance photo, or the facilitator's Go offline | Outgoing bubble shows a clock, header "Connecting…", no bot message. When back: ticks turn blue, then the bot replies | `ui_connecting`, `s_came_through`, `s_came_body` | Once per drop |
| Unrecognised text (first) | Text that is not a keyword, a language name at the language question, or an expected serial | "Sorry, I didn't catch that." + one-line step description; same quick replies | `m_repair`, `step_*` | 1 |
| Unrecognised text (second in a row) | As above | Same, plus "If you're stuck, tap Contact support." and a Contact support button (or "type “person”" when the beat already has 3 buttons) | `m_repair`, `m_repair2_btn` or `m_repair2_kw` | 1 |
| Unrecognised text (third in a row) | As above | No third repair: hands over to a person | `s_connecting`, `m_agent_hi` | — |
| Help keyword | help / usizo / hulp | One-line step description + keywords; same quick replies | `m_help`, `step_*` | Any |
| Person keyword | person / umuntu / persoon | Handover (section 11) | — | Any |
| Language keyword | language / ulimi / taal | Language buttons; after choosing, confirmation and the step's quick replies in the new language | `m_lang_q`, `m_lang_changed` | Any |
| Resume with no saved job | Resume previous job | "You don't have a job in progress. Tap Start job to begin." Start button stays | `m_resume_none` | Any |
| Photo picker cancelled | Installer closes the camera or gallery | Nothing happens; the same buttons stay | — | — |
| Page refreshed or phone locked | Reload | Conversation restored at the same beat and language; photos come back as a placeholder labelled "photo" | `ui_photo` | — |

A successful action (a quick reply, a photo, an expected text) resets the repair count.

## 11. Human handover

**Triggers.** Contact support (on the before-photo retake beat, the in-review beat, the retake outcome, and offered after two repairs); the person keyword in any language; a third unrecognised message in a row; Chat to Thandi now on the needs-assistance outcome.

**What happens.**

1. A status card: "Connecting you to our team". Body: "A Home FIX agent will reply here, usually within 5 minutes (Mon–Sat, 07:00–19:00). Your progress is saved." Fields: reference and hours. No phone number (F15).
2. About 1.5 s later, Thandi replies in the chat, with her name as a bold first line: "Hi Sipho, Thandi here. I can see your job. How can I help?"
3. Quick replies are hidden. The installer types their reply.
4. Thandi: "Thanks. I'm handing you back to the assistant."
5. The flow continues where it was, with the same quick replies. On the needs-assistance path, the session ends after the hand-back and the results card appears.

While the agent owns the chat, the assistant sends nothing else; a review outcome that falls due waits until the hand-back.

**What the agent should see (for the production build).** The job reference, the current beat, the evidence received with the AI results and confidence values, whether the serial was confirmed or typed, the last five messages, and why the handover started (button, keyword, repair limit or reviewer referral).

**Service hours.** Mon–Sat, 07:00–19:00, stated in the card. The prototype does not simulate out-of-hours behaviour (open question).

## 12. Review outcomes

The facilitator chooses the outcome (default Approved). It arrives about 6 seconds after submission, standing in for "most reviews finish within 2 hours".

**Approved (14:52).** "Good news, Sipho — your review is complete." Status card "Installation approved": "Your evidence met all requirements. The job is complete." Reference, completed 18 Jun 2026, 14:52, 6 of 6 verified, "Thank you for your work today." Close job ends the session.

**Needs a retake (14:40).** "Almost there — one item needs another look." Status card "One item needs a retake": the reviewer needs a clearer view of one item; Item: Serial number label; Reason: Part of the serial is hidden by glare; guide: "Stand 15–20 cm back and use your torch to avoid glare. Everything else is approved and saved." Retake now opens the camera; the new photo is added at the end of the chat, the AI accepts it, "Thanks. Sent to the reviewer.", and about 4 seconds later the Approved outcome follows (F18). Continue later: "Saved. We'll remind you to finish this one item." Contact support: handover.

**Needs assistance (14:35).** "Thanks for your patience, Sipho." Status card "A Home FIX agent will finish this with you": "The reviewer couldn't approve the job from the photos alone." Reason: The serial number doesn't match the geyser on the order; Who: Thandi, Home FIX team; When: Today before 15:00; "Your job stays open and nothing you sent is lost." Chat to Thandi now starts the handover.

## 13. Privacy and POPIA

**Product notice.** After the greeting: "We use your photos and job details only to verify this job, in line with POPIA." A Privacy notice button would open the full notice (in the prototype it says it is not part of the prototype).

**Data minimisation.** The flow asks only for what verification needs: six photos and the serial number. It does not ask for the installer's ID number, location or customer details. The job details come from Home FIX's own system.

**Retention.** How long photos and job records are kept is an open question for Home FIX (section 18). The prototype makes no claim about it.

**Research session privacy (T01, T05)**

- Consent screen before the chat: what is recorded (taps, typed messages, timings) and what is not (photos, name, phone number), and "Please don't type personal information."
- Photos stay on the participant's phone. They are held in memory as object URLs, never uploaded, never stored in localStorage, never in the results. After a refresh they come back as a placeholder.
- Results contain the participant code (not a name), events and typed text. They leave the phone only if the participant downloads, copies or sends them.
- No analytics, no network requests after load, except the optional results POST when `RESULTS_ENDPOINT` is set.
- Participants can stop at any time; the facilitator's Reset session clears everything stored on the device.

## 14. Accessibility

- Quick replies, send, language and results buttons are real `<button>` elements with at least 44 × 44 px tap targets; quick replies are 52 px high.
- The chat log is `role="log"` with `aria-live="polite"`; the header status (online, typing…, Connecting…) is a live region.
- One `h1` per screen (the welcome title or the business name).
- The page `lang` attribute follows the chosen language (en-ZA, zu-ZA, af-ZA), so screen readers use the right voice.
- All chat text is at least 11 px (F19); message text is 14.5 px.
- Visible focus outlines on buttons and inputs; everything works with a keyboard (Enter sends a typed message).
- Photos have an accessible name ("Your photo" or the placeholder label).
- Animation is switched off when the phone asks for reduced motion.
- Works from 320 px wide with no horizontal scroll.
- Known gap: some original greys are below WCAG AA contrast (card timestamps #aab0b4 on white, about 2.2:1). They were kept because the brief says not to change colours (open question).

## 15. Measures for the pilot

Definitions only. No targets are set until a baseline exists.

| Measure | Definition | Source in the results file |
|---|---|---|
| Task completion | Share of sessions that reach `session_end` | `session_end` event |
| Time to submit | Time from `consent` to the `beat_enter` of `submitted` | event `ms` |
| Time per beat | Time between consecutive `beat_enter` events | event `ms`, `beat` |
| Before-photo attempts | Number of `photo_sent` with check `before` | `photo_sent.detail.check` |
| Serial attempts | Number of `photo_sent` with check `serial` | as above |
| Serial typed | Sessions that reach `serial_type` | `beat_enter` |
| Serial corrected | Sessions where No, fix it was tapped after a correct reading | `quick_reply` id `btn_no_fix` |
| Skip rate | Sessions with `btn_skip` | `quick_reply` |
| Repair rate | `repair` events per session, and per beat | `repair` |
| Handover rate | Sessions with `support_open`, by trigger beat | `support_open.detail.from` |
| Keyword use | `text_sent` with a keyword, by keyword and language | `text_sent.detail.keyword` |
| Language switches | `language` events after the first choice | `language.detail.via` |
| Real vs sample photos | Share of `photo_sent` with source `real` | `photo_sent.detail.source` |
| Ease | Single Ease Question, 1–7 | `answers.ease_1_to_7` |
| Hardest part | Free text, coded by theme | `answers.hardest` |

## 16. Test cases

Automated tests are in `tests/run.js`; results in `qa/qa-report.md`. "Lang" = language under test.

| Id | Steps | Expected result | Lang |
|---|---|---|---|
| TC-01 | Open the link; tick nothing; tap Start | Start stays disabled | en |
| TC-02 | Open with `#p=P07` | Participant code shows P07 | en |
| TC-03 | Welcome: tap isiZulu | Welcome text in isiZulu | zu |
| TC-04 | Consent; Start | Date chip, greeting with Sipho's name, language question, 3 language buttons with subtitles | en |
| TC-05 | Tap Afrikaans | Next buttons "Begin werk", "Hervat vorige werk", "Privaatheidskennis" | af |
| TC-06 | Start beat: tap Privacy notice | "Opens our privacy notice. Not part of this prototype." | en |
| TC-07 | Start beat: tap Resume previous job (fresh session) | "You don't have a job in progress. Tap Start job to begin." Start stays | en |
| TC-08 | With a saved job, return to Start and tap Resume | Saved chat restored; "Welcome back. You were on: <step>." | en |
| TC-09 | Before: tap Upload photo, pick a photo | Real photo in the bubble, 200 × 144 | en |
| TC-10 | Before: cancel the picker | Nothing changes | en |
| TC-11 | First before photo | AI card "a little blurry"; Retake photo, Contact support; no % | en |
| TC-12 | Second before photo | ✅ accepted; "1 of 6"; installation message; Installation done | zu |
| TC-13 | Tap Installation done | "Later today" chip, then the reply at 13:10, then serial guidance | en |
| TC-14 | First serial photo | Glare card; Retake photo, Type it in instead | af |
| TC-15 | Second serial photo | ✅ read KWH-8842-ZA-117; confirmation question; Yes, correct / No, fix it | en |
| TC-16 | Tap No, fix it; type " kwh-8842-za-111 " | "Saved as KWH-8842-ZA-111"; continues to compliance | en |
| TC-17 | Serial retake: tap Type it in instead | Typing prompt | zu |
| TC-18 | Compliance beat | One checklist with sub-lines, "(PCV)", note "Send all four together, or one at a time." | en |
| TC-19 | Send 1 compliance photo | "Got 1 of 4. Send the other 3 when you're ready." | en |
| TC-20 | Send 4 compliance photos at once | 2 × 2 grid in one bubble; clock; "Connecting…"; no bot message for 3 s | en |
| TC-21 | Wait for recovery | Blue ticks; "online"; "Your photos came through"; 6 of 6 items; 4 of 4 | af |
| TC-22 | Skip for later → Continue | "Before you submit, I still need the 4 compliance photos." Only Upload photos | en |
| TC-23 | Tap Submit evidence | Submitted card and In review card in one beat; only Contact support; new note about payment | zu |
| TC-24 | Wait (outcome Approved) | Approved card at 14:52; Close job | en |
| TC-25 | Tap Close job | Results card with 1–7 and free text | af |
| TC-26 | Results: Download JSON and CSV | Files download; CSV opens in Excel with correct characters | en |
| TC-27 | Results: Copy results | "Copied." or the select-all box | en |
| TC-28 | Outcome Needs a retake: Retake now, pick a photo | New exchange at the end; "Thanks. Sent to the reviewer."; Approved follows | zu |
| TC-29 | Outcome Needs assistance | Reason, who, when; Chat to Thandi now | af |
| TC-30 | Chat to Thandi now; type a reply | Thandi hands back; session ends; results card | en |
| TC-31 | Before retake: Contact support; type a reply | Connecting card; Thandi bold name; hand-back; Retake photo + Contact support return | en |
| TC-32 | Type "usizo" on the serial beat | One-line serial step description in isiZulu; same buttons | zu |
| TC-33 | Type "TAAL" | Language buttons; choose isiZulu; confirmation; serial buttons in isiZulu | af |
| TC-34 | Type "persoon" | Handover to Thandi | af |
| TC-35 | Type "blah" twice | First: repair. Second: repair + Contact support button | en |
| TC-36 | Type a third unrecognised message | Handover, not a third repair | en |
| TC-37 | Refresh at serial confirm, retake outcome and serial typing | Same beat, language, messages and buttons | zu |
| TC-38 | Refresh after sending a real photo | Placeholder labelled "photo" | en |
| TC-39 | Open without `#facilitator` | No F tab, no drawer | en |
| TC-40 | Open with `#facilitator`; wrong PIN; then 2468 | Wrong PIN refused; drawer opens with defaults Approved and Retake | en |
| TC-41 | Facilitator: Go offline; tap a reply | Clock on the bubble, "Connecting…", no reply until Back online | en |
| TC-42 | Every beat at 320, 375, 390, 430 px | No horizontal scroll; all buttons at least 44 px | en |
| TC-43 | After choosing isiZulu or Afrikaans, complete the job | No English string from COPY in the chat | zu, af |

## 17. Decision log

Choices made where the brief was silent.

| # | Decision | Why |
|---|---|---|
| D01 | All work is in `projects/home-fix/` inside the NeuraUX repository; the uploaded file at the repo root is untouched. | Keeps the website files separate. |
| D02 | Removed the `<link rel="preconnect" href="https://fonts.googleapis.com">` from the template. | It opens a network connection; the fonts are already embedded. No visual change. |
| D03 | The greeting and language question appear in the welcome-screen language (default English, or `#lang`). | The language is not known yet in the chat; the welcome screen already asked. |
| D04 | The POPIA line is in the second beat, after "Great — let's get started.", in the chosen language. Privacy notice is the third reply on that beat. | The first beat already has 3 language buttons (WhatsApp maximum). The notice still comes before any data is asked for. |
| D05 | Accepted photo beats (`before_ok`, `serial_ok`) continue automatically to the next beat instead of showing Continue. | Removes taps that carry no decision; F04 and F13 each add a beat right after them. |
| D06 | Added Submit evidence as the reply on the signal-drop beat. | F08 removes Retry upload and Continue later; the installer needs a way to submit, and an explicit submit makes F07's rule ("can't submit with items missing") meaningful. |
| D07 | The "Your photos came through" card keeps the original "wait" tone (clock icon) and its original note. | The brief says to keep the existing card and change only the title, body and fields. See open question Q02. |
| D08 | Skip for later answers with the original message and one Continue reply, which leads to the reminder. | F07 needs a path from skipping to the moment before submission. |
| D09 | Compliance photos can arrive in several sends; the bot says how many it has. The 4th photo triggers the scripted signal drop. | Supports the note "Send all four together, or one at a time." |
| D10 | A typed serial is trimmed, inner spaces collapsed to one, and upper-cased. No format check. | The brief says accept after trimming and uppercasing. |
| D11 | A third unrecognised message in a row starts the handover. | "Never a third repair" needs a defined next step; a person is the safest one. |
| D12 | On beats that already show 3 buttons, the second repair tells the installer to type “person” instead of adding a fourth button. | Keeps the 3-button limit (F20). |
| D13 | Typing a language name at the language question chooses that language. | Installers often type instead of tapping. |
| D14 | The outcome arrives about 6 s after submission; times jump from 13:18 to 14:35–14:52. No extra date chip. | Keeps unmoderated sessions short; the times show the wait. |
| D15 | Outcome times: needs assistance 14:35 (before "Today before 15:00"), retake 14:40 (retake reply 14:44), approved 14:52. | Times must agree with the copy and move forward. |
| D16 | The retake-outcome photo is always accepted. | The brief specifies accepted; no facilitator control was asked for. |
| D17 | Close job ends the session and shows the results card; it no longer restarts the chat. Needs assistance ends after Thandi's hand-back. | A restart would wipe a participant's session. |
| D18 | The participant code is optional. | A participant without a code can still take part; the session id is always recorded. |
| D19 | Typed text is included in the results (`text_sent.detail.text`). | The consent screen says typed messages are recorded; the research needs them. |
| D20 | The facilitator drawer is English only and not in COPY. | It is for the moderator, not participants. |
| D21 | The emoji, attach and camera icons in the input bar stay decorative and are hidden from screen readers. | Photo actions come from the quick replies (T01); making the 20 px icons buttons would break the 44 px rule. |
| D22 | The send button has a 44 px tap area around the unchanged 42 px circle. The text field is 16 px text scaled to look 14 px. | T06 tap targets; 16 px stops iPhone from zooming into the field. |
| D23 | Labels inside striped photo placeholders and the GOOD/AVOID badges are translated. | They are user-facing text (F01). |
| D24 | A saved job is kept separately from the session. In a fresh session there is none, so Resume says so. The restore path can be reached after a facilitator jump back to Start. | F05 needs both paths to be real. |
| D25 | Need help, View example, Privacy notice, Skip for later, Contact support and Continue later do not show an outgoing bubble. | Same as the original helper buttons. |
| D26 | After the hand-back, the quick replies that were showing come back. | F15: "continues where it was, with the same quick replies". |
| D27 | Language button labels and subtitles stay in their own language in every UI language and are not marked for native review. | They are not translations. |
| D28 | Welcome Start and results buttons are research controls, not WhatsApp reply buttons; the 20-character limit is not applied. | They are outside the chat simulation. |
| D29 | Dates are localised: "18 Juni 2026" (zu), "18 Jun. 2026" (af). | Natural date forms in each language. |
| D30 | F19 also raised the AI card's "AI" badge (9 → 11 px) and its sub-line (10.5 → 11 px). | They are in the chat area. |
| D31 | A real compliance send takes up to the number of photos still needed; extra photos are ignored. | The step needs exactly 4. |
| D32 | Results CSV has one row per event plus two answer rows (`answer_ease`, `answer_hardest`), with a UTF-8 BOM. | Opens correctly in Excel with isiZulu and Afrikaans text. |

## 18. Open questions

| # | Question | Owner |
|---|---|---|
| Q01 | Native review of all 215 isiZulu and 215 Afrikaans strings, including trade terms. | Home FIX / NeuraUX, with first-language reviewers |
| Q02 | Should "Your photos came through" use the green "good" tone (tick) instead of the blue clock? The clock suggests waiting. | Design |
| Q03 | Some original greys fail WCAG AA contrast (card timestamps, field labels). Darken them? | Design |
| Q04 | How long are photos, serial values and chat logs kept, and where are they stored? (POPIA retention) | Home FIX legal / information officer |
| Q05 | Template text, category and language versions for the first message and the three outcomes, for Meta approval. | Home FIX |
| Q06 | Out-of-hours handover: what should happen after 19:00 and on Sundays? | Home FIX operations |
| Q07 | Should an unmoderated link be able to set the outcome (for example `#outcome=retake`)? Not built; outcomes need facilitator mode today. | Research |
| Q08 | Where should results go: download/copy only, or a form service via `RESULTS_ENDPOINT`? | Research |
| Q09 | Real confidence thresholds for photo quality and OCR, after calibration with real site photos. | Home FIX / AI vendor |
| Q10 | Can the reviewer request a retake of items other than the serial label? The prototype only scripts the serial. | Home FIX operations |

## 19. Changelog: original → this version

| Id | Change |
|---|---|
| F01 | All user-facing text moved into one `COPY` table with en, zu and af; `localizedEn` sub-line removed; missing strings fail the build. |
| F02 | The first message asks for the language; Start job follows in the chosen language. |
| F03 | South African English review: UK spelling, 24-hour times, "(PCV)" added. |
| F04 | New installation beat with Installation done; "Later today" chip; later times from 13:10. |
| F05 | Resume previous job restores a saved job or says there is none. |
| F06 | The two compliance checklists merged into one, with the new note. |
| F07 | Skipped compliance photos are asked for again before submission. |
| F08 | Realistic signal drop: clock, "Connecting…", no bot message while offline, then "Your photos came through" with consistent fields. |
| F09 | Submitted and In review merged; Finish and Exit removed; new payment note. |
| F10 | Reference HF-2026-DBN-04821; date 18 Jun 2026. |
| F11 | Greeting uses Sipho's name. |
| F12 | Confidence numbers and bars removed for the installer; ✅ on accepted results; values kept for the facilitator. |
| F13 | Serial confirmation beat and typed correction. |
| F14 | Type it in instead on the serial retake beat. |
| F15 | Contact support is an in-chat handover to Thandi; no phone number. |
| F16 | Needs-assistance outcome states reason, who and when; Chat to Thandi now. |
| F17 | Fake security banner removed; POPIA message and Privacy notice added. |
| F18 | Retake outcome appends a new photo exchange, then Approved. |
| F19 | All chat text at least 11 px. |
| F20 | Reply labels at most 20 characters and at most 3 per beat, checked at build and in tests. |
| T01 | Real photos from the camera or gallery, shown in the bubble; sample-photo link; photos stay on the device. |
| T02 | Working text input; keywords in 3 languages; repair with a limit. |
| T03 | Facilitator drawer behind `#facilitator` and a PIN. |
| T04 | State saved and restored on refresh. |
| T05 | Welcome and consent screen; event log; results card with download, copy and optional POST. |
| T06 | Full-screen on phones 320–430 px; 44 px targets; no network after load; settings in the URL hash. |
