# Home FIX prototype

A WhatsApp-style research prototype. A plumber ("Sipho") sends evidence that an electric geyser replacement was done properly: a before photo, the serial number label and four compliance photos. A Home FIX reviewer then approves the job, asks for a retake, or hands it to an agent.

It is a prototype for user testing. It is not WhatsApp and Home FIX is not a real company.

## The file to share

`dist/Home_FIX_Mobile.html` is the prototype. It is one self-contained file. React, the runtime and the Roboto fonts are embedded, so it works from disk or any static host, and needs no internet after it loads.

## Open it

- **On a laptop:** double-click `dist/Home_FIX_Mobile.html`. It opens in your browser.
- **On a phone:** host it (below) and open the link. You can also send the file to the phone and open it in Chrome or Safari, but a link is easier for participants.

## Host it free on GitHub Pages

This repository already deploys to GitHub Pages through `.github/workflows/deploy-pages.yml`. Anything committed to `main` is published. To publish the prototype:

1. Merge the branch that contains `projects/home-fix/` into `main`.
2. In GitHub, open **Actions** and wait for the deploy workflow to finish (a green tick).
3. The prototype is then at `https://sphamandla-designer.github.io/neuraux/projects/home-fix/dist/Home_FIX_Mobile.html`.
   If a custom domain is set under **Settings → Pages**, replace the start of the address with it, for example `https://www.neuraux.co.za/projects/home-fix/dist/Home_FIX_Mobile.html`.
4. Open the link on your own phone and run the checklist in the test guide before you share it.

To host it on its own instead:

1. Create a new public repository on GitHub, for example `homefix-prototype`.
2. Upload `dist/Home_FIX_Mobile.html` and rename it `index.html`.
3. Open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
4. After a minute the site is at `https://<your-username>.github.io/homefix-prototype/`.

## Link formats

Settings go in the part of the link after `#`. Separate them with `&`. Query strings (`?`) are not read.

| Link ending | What it does |
|---|---|
| *(nothing)* | Welcome screen in English |
| `#lang=zu` | Welcome screen and chat start in isiZulu (`en`, `zu`, `af`) |
| `#p=P07` | Fills in participant code P07 |
| `#lang=af&p=P11` | Afrikaans, participant P11 |
| `#facilitator` | Shows the facilitator tab (PIN `2468`) |

Participants can still choose another language in the chat.

## Facilitator mode

Open the link with `#facilitator` (you can add `&lang=zu` and so on). A small **F** tab appears on the left edge. Tap it and enter PIN `2468`. The drawer has:

- **Outcome after review:** Approved (default), Needs a retake or Needs assistance. The outcome arrives about 6 seconds after the participant submits. **Send outcome now** sends it straight away.
- **AI result for the next attempt:** Pass or Retake, for the before photo and the serial number label. By default the first attempt asks for a retake and the next one passes.
- **Signal:** Go offline / Back online. While offline, the participant's messages show a clock and the assistant sends nothing.
- **Jump to a beat:** every beat and outcome, numbered.
- **AI confidence:** the scripted confidence for each AI check. The participant never sees these.
- **Event log:** the latest events, newest first.
- **Reset session:** clears everything on this device and returns to the welcome screen.

Without `#facilitator` there is no tab, no drawer and nothing about it in the page.

## Results

When the session ends (the participant taps **Close job**, or finishes the chat with Thandi), a results card appears in the chat. It asks "How easy was this?" (1–7) and "What was hardest?". The participant can then:

- **Download results (JSON)** and **Download results (CSV)**, or
- **Copy results**, then paste them into a message to you. If the phone blocks copying, the results appear in a box to select and copy by hand.

To have results posted to a server instead, set `RESULTS_ENDPOINT` at the top of the component in `src/template.html` to an HTTPS URL that accepts a JSON `POST`, then rebuild. A **Send results** button then appears. It is empty (off) by default.

Results contain taps, typed messages and timings. They never contain photos, names or phone numbers. Photos stay on the participant's phone and are never uploaded or stored.

## Progress and refresh

Progress is saved on the phone after every step. If the page is refreshed or the phone locks, it comes back at the same point. Photos are not saved; after a refresh they show as a placeholder labelled "photo". If the phone blocks storage, the prototype still works but cannot restore.

## Working on it

The prototype is a self-unpacking bundle. Only the page template changes; the runtime, React and fonts stay as they are.

```
original/Home_FIX_Mobile.html   the uploaded file, never modified
src/template.html               the page template: markup, COPY table and logic (edit this)
src/runtime.js                  the runtime, extracted read-only for reference
tools/unpack.py                 extracts src/ from original/
tools/check.js                  build check: translations, button limits; writes docs/copy-deck.csv
tools/pack.py                   runs the check, then writes dist/Home_FIX_Mobile.html
tests/run.js                    Playwright test suite
tests/baseline.js               screenshots every beat into qa/before or qa/after
dist/Home_FIX_Mobile.html       the built prototype to share
docs/                           conversation design spec, copy deck, test guide
qa/                             screenshots and the QA report
```

Rebuild and test:

```
python3 projects/home-fix/tools/pack.py
node projects/home-fix/tests/run.js
```

The build stops if any string is missing in English, isiZulu or Afrikaans, or if a quick-reply label is longer than 20 characters.

All isiZulu and Afrikaans text needs review by native speakers before testing with participants. See `docs/copy-deck.csv`.
