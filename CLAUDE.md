# NeuraUX website: project context for Claude Code

Read this file in full before changing anything in this repo. It is the source of truth for who NeuraUX is, what it sells, how the site should look and sound, and what must never be invented.

Last updated: 7 October 2026.

---

## 1. The business in one paragraph

NeuraUX is an AI UX and conversation design consultancy based in Gauteng, South Africa. It audits and designs AI assistants (chatbots, virtual assistants, AI features) for law firms and fintechs, so they answer clearly, fail gracefully, and stay compliant. It does not build AI. It designs how AI behaves, and works alongside the client's developers or a build agency. It also works white-label for AI automation agencies that build bots but have no conversation designer.

- **Founder:** Sphamandla, Product Designer and AI UX Strategist. NeuraUX is currently a founder-led consultancy.
- **Email:** hello@neuraux.co.za
- **Domain:** www.neuraux.co.za (hosted on GitHub Pages for now)
- **Location line:** Gauteng, South Africa. Works with clients across South Africa, remotely.
- **Stage:** launching Q4 2026. No paying clients, case studies or testimonials yet.

## 2. Positioning

**Positioning statement:** For South African law firms and fintechs whose AI assistants users don't fully trust, NeuraUX is the specialist AI experience consultancy that diagnoses and designs how their AI behaves, with compliance designed in from the first flow. Unlike agencies that build bots or generalist UX studios, NeuraUX focuses only on the experience layer of AI in regulated, high-stakes conversations.

**Tagline:** AI experiences people actually trust.

**Core belief:** trust is won or lost in the moments AI goes wrong: when it doesn't understand, doesn't know, or shouldn't answer. NeuraUX designs for those moments.

**Primary audiences**

1. **Law firms:** client intake, FAQ and policy questions, matter status, document requests. Biggest worries are giving legal advice by accident, confidentiality, and POPIA.
2. **Fintechs and financial services:** onboarding, account queries, product questions. Biggest worries are financial advice boundaries, POPIA and consent, and trust at moments involving money.
3. **AI automation agencies and software studios (partners):** they build AI products for clients but lack conversation design skills. NeuraUX works for them under their brand.

**Buyers to write for:** heads of digital, innovation or client experience; operations partners at law firms; product owners at fintechs; agency founders. They are cautious, time-poor, and allergic to AI hype.

## 3. How NeuraUX differs from South African alternatives

Use this to shape copy and decisions. **Do not name competitors on the website, and do not make comparative claims like "the only" or "the first",** since none of these have been verified.

| Alternative a buyer might use | What they typically do | Where NeuraUX is different |
| --- | --- | --- |
| Generalist digital and UX agencies | Websites, apps and UI design; AI is a side offering | Specialises only in AI experiences and conversation design, including edge cases, failure and handoff |
| Large consultancies | Broad AI transformation programmes; long, expensive engagements | Fixed-scope, fixed-price work in weeks, starting at R18,500, accessible to mid-sized firms |
| Chatbot platform vendors | Sell and configure their own platform; design is secondary | Platform-neutral. Recommends what's right for the client, with no platform to sell |
| AI automation agencies | Build bots and workflows quickly; weak on UX and tone | Designs the experience layer, and partners with these agencies rather than competing |
| Freelance designers | Variable; rarely regulated-industry experience | A defined method (six-dimension scorecard), compliance-aware design, and documented deliverables |

**The four real differentiators (safe to use on the site):**

1. **Regulated-industry focus:** advice boundaries, disclosure and POPIA designed in, not bolted on.
2. **Product design first:** AI designed as part of the whole experience, not a chat window bolted on.
3. **Fixed scope, fixed price:** published prices, defined deliverables, short timelines.
4. **Transparent about AI:** NeuraUX says exactly how it uses AI, and every deliverable is human-reviewed.

## 4. Services: what's on sale now

Only these three services appear on the site. All prices are in ZAR, excluding VAT.

### AI Experience Audit (entry service)

- **Price:** R18,500 fixed, 50% on signing and 50% on delivery. **Duration:** 2 weeks. **Scope:** one AI experience, one channel.
- **Reviews:** up to 200 anonymised conversations; up to 15 core tasks walked through end to end; trust and transparency (AI disclosure, confidence, sources, human handoff); failures and recovery; tone and brand voice; compliance-sensitive moments (advice boundaries, POPIA, disclaimers).
- **Deliverables:** a report with findings ranked by severity, each with evidence and a fix; a scorecard across six dimensions; a prioritised fix list separating quick wins from structural changes; a recorded readout.
- **Out of scope:** redesign, user testing with real participants, technical fixes, prompt engineering.

### Conversation Design Blueprint

- **Price:** Core (1 use case, 4 weeks) R45,000; Extended (2 use cases, 5 weeks) R55,000; Full (3 use cases, 6 weeks) R65,000. Payment 40/30/30.
- **Designs:** assistant persona and voice; conversation architecture and detailed flows, including edge cases; trust patterns (disclosure, uncertainty, sources, advice boundaries, POPIA consent); human handoff; 15–25 sample dialogues per use case; a developer handover pack.
- **Includes:** internal walkthrough testing with 3–5 staff, one revision round, a 90-minute handover, and 2 weeks of email support.
- **Out of scope:** building or integrating the assistant, model selection, final production prompts.
- **Audit credit:** the Audit fee is credited in full toward a Blueprint signed within 30 days of the readout.

### White-label partnership for agencies

- **Day rate:** R7,500 (2-day minimum). Fixed project quotes based on the day rate. Retained capacity: 4 days per month for R28,000.
- **Do not show prices on the site.** They're shared on the partner call.
- **Terms:** NeuraUX works under the agency's brand, never contacts the agency's clients directly, and doesn't poach clients or staff. Work may be described anonymously in NeuraUX's portfolio unless the agency objects.

### The six Audit dimensions (used on the homepage)

Clarity, Trust, Recovery, Efficiency, Tone, Compliance safety. Each is scored 1–5, for a total out of 30.

### Not on the site yet (do not add)

Workflow UX (R65k–120k) and monthly Advisory (R14,500) exist internally but are deliberately hidden until NeuraUX has delivered case studies. Do not add them, and do not add "coming soon" sections.

## 5. Site map

| Page | File | Status |
| --- | --- | --- |
| Home | `index.html` | Built |
| Services | `services.html` | To build from section 8 copy |
| For Agencies | `agencies.html` | To build from section 8 copy |
| How We Work | `how-we-work.html` | To build from section 8 copy |
| Contact | `contact.html` | To build from section 8 copy |
| Privacy Policy | `privacy.html` | Required before launch (POPIA). Needs founder review |

When the other pages exist, update the homepage navigation and buttons from `#anchors` to those pages.

## 6. Brand and visual design rules

**Direction:** monochrome, editorial, restrained. Black, charcoal, grey, silver and white. This **replaces** an earlier dark brand with cyan accents and Syne/DM Sans/Space Mono, which must not be used anywhere.

**Colour tokens** (defined as CSS variables in `index.html`; reuse them, don't add colours):

| Token | Hex | Use |
| --- | --- | --- |
| `--black` | #000000 | Page background |
| `--charcoal` | #1C1C1E | Raised sections, footer |
| `--line` | #2C2C2E | Hairline borders on black |
| `--grey-500` | #8E8E93 | Small supporting text |
| `--grey-300` | #AEAEB2 | Body text on dark |
| `--white` | #F5F5F7 | Primary text, solid buttons |
| `--silver` | #C7CBD1 | Prices, and the agency band only |
| `--silver-deep` | #9EA3AA | Rule above problem points |

**Type:** Inter only (Google Fonts, weights 400/500/600), with `font-feature-settings: 'ss01','cv11'` switched on. Headlines are weight 500 with tight negative tracking (−0.04 to −0.055em). Body is 17px at 1.6 line height. Keep line lengths under about 80 characters.

**Layout:** a max width of 1280px, generous vertical spacing, and hairline dividers instead of cards. Left-aligned, except where noted. Pill-shaped buttons (border-radius 999px). Solid white is the primary action; an outlined button is secondary.

**The one bold element:** the silver agency band. Keep everything else quiet. Don't add a second highlight.

**Avoid (these make the site look AI-generated):**

- Colouring or bolding a single word in a headline
- ALL-CAPS eyebrow labels above headings
- Numbered markers (01, 02) on anything that isn't a real sequence (the process steps are the only numbered list)
- "Word — fragment" labels and strings joined with middle dots
- Identical rounded cards with soft shadows, gradient washes, glows or glassmorphism
- Monospace fonts, emoji, arrows appended to buttons
- Fade-and-slide animations on every section; if motion is added, use at most one deliberate moment
- Stock photos of robots, brains, circuits or handshakes
- Fake chat UIs, invented dashboards or fake metrics

**Imagery:** typographic for now. A real founder photo goes on How We Work. A sample Audit excerpt can be added once it exists.

## 7. Voice and copy rules

- Plain, direct and calm. Serious, never hype. Write for a cautious legal or finance buyer.
- Short sentences, active voice, sentence case. Specific nouns over adjectives.
- Say what things do. Buttons say exactly what happens ("Book an Audit", "Email us to book an Audit").
- Use "AI assistant" or "AI experience", not "bot", in client-facing copy (agencies can see "bot").
- South African English spelling (organisation, prioritise) and rand formatting (R18,500).
- Always say "excluding VAT" near prices.

**Never invent:** client names, logos, testimonials, case studies, statistics, team members, years in business, awards or certifications. If something is missing, leave a visible placeholder in square brackets, e.g. `[Founder photo]`, and list it in section 10.

**Words to avoid:** revolutionary, cutting-edge, unlock, leverage, seamless, game-changer, supercharge, "harness the power of AI".

## 8. Copy for the pages still to build

### Services page

- **Intro heading:** Diagnose first. Then design it right.
- **Intro:** Most clients start with an Audit to find out what's really happening, then move to a Blueprint to fix it properly. You can also start with a Blueprint if you're building something new.
- **Audit tagline:** Know exactly what's failing your users, and what to fix first.
- **Blueprint tagline:** A build-ready design for an AI assistant your team can implement directly.
- **Body:** use the scope, deliverables and pricing table from section 4.
- **FAQ:**
  - *Do you build the assistant?* No. We design it, and your team or agency builds it. We can recommend build partners.
  - *Which platforms do you work with?* Our designs are platform-agnostic and work with any LLM or chatbot platform.
  - *Do you need access to our systems?* Only test access to the AI experience, and anonymised transcripts for Audits.
  - *Are prices fixed?* Yes. Scope and price are agreed in writing before we start. All prices exclude VAT.

### For Agencies page

- **Headline:** You build the AI. We make it feel right.
- **Subhead:** NeuraUX is the conversation design team your agency doesn't have to hire. We work white-label, under your brand, inside your projects.
- **Problem heading:** Working bots still lose clients.
- **Problem body:** Your team can build a technically solid assistant. Then the client tests it and finds it robotic, confusing, or awkward when things go wrong. Adoption stalls and renewals get harder. A full-time conversation designer rarely makes sense at agency volume.
- **What we do:** conversation flows and edge cases; persona and voice; pre-handover reviews; handoff and recovery design; developer-ready specs and sample dialogues; joining client workshops as part of your team.
- **How it works (numbered):** 1. Partner call. 2. NDA and terms. 3. First project: a 2-day review of a bot you're about to hand over. 4. Ongoing: book days as needed, or reserve monthly capacity.
- **Commitments:** your brand and your client relationship; no poaching of clients or staff; confidential by default, with POPIA-aligned data handling.
- **Call to action:** Bring a current project to the call. In 30 minutes, we'll show you where conversation design would change the outcome. [Book a partner call]
- No prices on this page.

### How We Work page

- **Heading:** Clear scope. Human judgment. Careful with your data.
- **Process (numbered):** 1. Discovery call (30 minutes, free). 2. Proposal: a written scope, timeline and fixed price, usually within 2 working days. 3. Kickoff: access, data handling, and one point of contact. 4. The work: regular check-ins, plus a midpoint review on Blueprints. 5. Readout and handover, with the recording yours to keep. 6. Support: two weeks of email support after every Blueprint.
- **Principles:** Design for the moment things go wrong. Be honest about what AI can't do. Treat compliance as a design material. Use evidence over opinion.
- **How we use AI:** We use AI tools to speed up analysis and drafting, such as sorting transcripts, spotting patterns, and generating first drafts. AI does not make design decisions or sign off on work. Every deliverable is reviewed and approved by a senior designer, and NeuraUX is fully accountable for everything we deliver. If your policies restrict AI use, tell us at kickoff and we'll agree in writing which parts of the work stay AI-free.
- **Data protection:** business-tier AI tools only, never used to train models on client data; anonymised transcripts only, with no unredacted personal information; project files deleted 90 days after close; personal information handled in line with POPIA; NDAs signed on request.
- **About:** `[Founder paragraph and photo, written by Sphamandla]`

### Contact page

- **Heading:** Let's look at your AI experience.
- **Body:** Book a free 30-minute call, or send us a note. We reply within one working day.
- **Fields:** Name, Work email, Company, "I'm interested in" (AI Experience Audit / Conversation Design Blueprint / Agency partnership / Not sure yet), and "What are you running or planning?" (optional).
- **Privacy note under the form:** We use your details only to respond to your enquiry. See our Privacy Policy.

## 9. Technical rules

- Plain static HTML and CSS, with no framework and no build step, so GitHub Pages serves it directly. Vanilla JavaScript only if truly needed.
- Each page is self-contained. Copy the shared `:root` tokens and base styles; if repetition becomes painful, move them into a shared `styles.css`.
- **Forms:** GitHub Pages has no backend. Until a form service is chosen (e.g. Formspree), contact actions use `mailto:hello@neuraux.co.za`. Don't add a form that silently goes nowhere.
- **Custom domain:** add a `CNAME` file containing `www.neuraux.co.za` once DNS is pointed at GitHub Pages.
- **Accessibility:** semantic HTML, one `h1` per page, a skip link, visible `:focus-visible` outlines, colour contrast of at least 4.5:1 for body text, touch targets of at least 44px, `prefers-reduced-motion` respected, and a working layout down to 360px wide.
- **SEO:** a unique `<title>` and meta description per page (below), Open Graph tags, `lang="en-ZA"`. Add `sitemap.xml` and `robots.txt` when all pages exist.
- **Performance:** no heavy libraries, compressed images with width and height set, fonts loaded with `display=swap`.
- **No tracking or analytics** until the Privacy Policy covers them.

| Page | Title tag | Meta description |
| --- | --- | --- |
| Home | NeuraUX \| AI UX & Conversation Design, South Africa | We audit and design AI assistants for law firms and fintechs that users trust and that stay compliant. |
| Services | AI Experience Audit & Conversation Design \| NeuraUX | Fixed-price AI experience audits from R18,500 and build-ready conversation design blueprints. |
| For Agencies | White-label Conversation Design for Agencies \| NeuraUX | Your on-demand conversation design team, working under your brand inside your AI projects. |
| How We Work | How We Work \| NeuraUX | Our process, how we use AI, and how we protect your data under POPIA. |
| Contact | Contact \| NeuraUX | Book a free 30-minute call about your AI assistant or chatbot. |

## 10. Open items: placeholders to fill, never invent

- [ ] Registered company name and registration number (footer)
- [ ] Founder paragraph and photo (How We Work)
- [ ] Calendar booking link (Contact and all "Book" buttons)
- [ ] Form service choice (Contact)
- [ ] Privacy Policy text, to be reviewed by the founder, ideally with legal input
- [ ] Sample Audit report (PDF) to link from the Services page once it exists
- [ ] Pilot pricing decision: a R9,500 founding-client Audit for 2 clients vs full price. **Do not show a pilot price on the site unless told to.**
- [ ] LinkedIn URL for the footer

## 11. How to work in this repo

- Change only what you're asked. Keep copy exactly as written in this file unless asked to edit it.
- Before adding any section, check it against the "Avoid" list in section 6.
- When unsure about a fact, ask. Don't fill the gap.
- Keep this file updated when services, prices or the brand change.
