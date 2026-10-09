# Home FIX case study: outline

Written before the build. Sources are in `projects/home-fix/` unless stated. Line-level sources are in `claims-log.md`.

## Headline options

1. **Helping plumbers prove a geyser job in five minutes, with a person making every final call.** (the brief's default)
   Caution: "five minutes" comes from the prototype's own message ("It should take about 5 minutes", `m_jobs`). Nobody has timed it. As a headline it reads as a measured result.
2. **Helping plumbers prove a geyser job from the roof space, with a person making every final call.** *(used on the page)*
   Keeps the brief's structure, swaps the untested time claim for the site condition the design is built around.
3. **A WhatsApp assistant that checks the evidence and leaves every approval to a person.**
   Plainest statement of the governance point, for buyers who care most about AI boundaries.

Subhead (all options): A trilingual WhatsApp assistant for insurance job verification.

## Section plan

Every section opens with one sentence that states its point.

### 1. Cover and summary
- **Message:** this is a concept project that shows how we design an AI conversation end to end: flow, copy, AI rules, prototype and test plan.
- **Evidence:** concept label; at-a-glance facts (role, channel, three languages, deliverables that exist in the folder); hero screenshot of the serial-number confirmation; link to the live prototype.

### 2. Problem and context
- **Message:** the evidence has to be right first time, from a hot, dark roof space, on a poor signal, in the installer's language.
- **Evidence:** spec §1 problem and users; spec §2 site conditions; spec §1 "what the AI does / what people do" as the four design goals. Problem causes are marked "Assumption, to be tested" because no research exists yet.

### 3. Conversation architecture
- **Message:** the flow is designed around the job, not the form: two sittings, a check at each photo, and a way out at every step.
- **Evidence:** Mermaid flow from spec §5 rendered to SVG with a text alternative; stage table from spec §6 and §10; the two-sitting design (spec §2, F04); language system (spec §4) with one message in three languages from `copy-deck.csv` (`m_serial_check`, marked for native review); worked example of the serial step from the copy deck.

### 4. The designed experience
- **Message:** each screen exists to solve one installer problem.
- **Evidence:** 8 screenshots across 5 scenarios, each with user problem, design decision, intended effect (spec §3, §9, §10, decision log). Live prototype embed below.

### 5. AI rules and human review
- **Message:** the AI checks; a person decides.
- **Evidence:** spec §9 rules and thresholds (labelled starting values), §11 handover, §12 outcomes with three outcome screenshots; client decisions from spec §18 open questions.

### 6. Testing and iteration
- **Message:** we reviewed the first version against a written brief, fixed 20 problems, and proved the fixes with automated tests before any participant sees it.
- **Evidence:** four before/after pairs (language, two sittings, confidence numbers, phone-number support) from `original/` and `dist/`; QA report (52 of 52 tests). No `research/` folder exists, so testing is a plan from `docs/test-guide.md` and spec §15, labelled "Proposed".

### 7. Next steps and call to action
- **Message:** the design is ready to test; the open decisions belong to the client.
- **Evidence:** deliverables list; what still needs validation (spec §18, QA "Not verified"); one learning from the iteration. CTA to the Conversation Design Blueprint, no prices.
