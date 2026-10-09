# Home FIX case study: page copy

Generated from `src/main.html` by `tools/build.py`. Edit the copy in `src/main.html`, then rebuild. Alt text is listed at the end.

- Home
- Home FIX concept

Concept project. Home FIX is a fictional company; the people and job details are invented.

# Helping plumbers prove a geyser job from the roof space, with a person making every final call.

A trilingual WhatsApp assistant for insurance job verification.

We designed how the assistant asks for evidence, checks it and hands over to people. Then we built a working prototype and the specification a team would need to build it.

- **Role:** NeuraUX: conversation design, product design and prototype

- **Channel:** WhatsApp

- **Languages:** English, isiZulu and Afrikaans

- **Deliverables:** Prototype, conversation design spec, copy deck and test kit

Try the prototype (opens in a new tab)
Read the specification

*Caption: The installer confirms the serial number before it is saved.*

## The evidence has to be right the first time.

An insurer can only approve and pay for a geyser replacement once it has proof the work was done properly.

When a geyser bursts, a plumber on an insurance panel replaces it. Before Home FIX approves the job and pays, it needs six pieces of evidence: a photo of the geyser before, the new geyser's serial number label, and four compliance photos. It also needs the serial number itself.

In this concept, that evidence is uneven. Photos are blurry, serial labels are unreadable, compliance items are missing, and installers don't know what a usable photo looks like. Assumption, to be tested.

### Who is involved

-

### Installer

Sends the photos, confirms the serial number and submits the job.

-

### Reviewer

A Home FIX specialist who approves the job, asks for a retake or refers it to an agent.

-

### Support agent

Replies in the same chat when the installer is stuck, and finishes jobs the reviewer can't approve.

-

### Customer

Not in the conversation, but depends on a safe, compliant installation.

### South African conditions

- Geysers sit in roof spaces and cupboards that are cramped, hot and dark, often with one hand free.

- Serial labels are metallic or behind plastic, so glare is the most likely failure.

- Signal drops and load-shedding take towers down, so progress is saved after every step.

- Data costs money, so each photo is asked for once and failures are explained in text.

- Installers may prefer English, isiZulu or Afrikaans.

These conditions come from desk work, not field research. Assumption, to be tested.

### What the design had to achieve

- Collect all six evidence items and a serial number the installer has confirmed.

- Let the AI accept a photo or ask for another, and never reject a job or approve payment.

- Leave every approval decision to a person.

- Work in English, isiZulu and Afrikaans, with a person reachable in the same chat.

## The conversation follows the job.

The assistant asks for each piece of evidence at the moment it exists, checks it, and keeps a way out open at every step.

*Caption: The flow from the specification: beats, branches and the three review outcomes. Open the diagram full size*

**Read the flow as a list**

- Welcome and consent, then a greeting and the language question.

- Start: the privacy line and the job. Privacy notice and Resume previous job answer in place.

- Job summary, then the before photo with a guidance card.

- AI photo check: pass, or retake with Contact support available.

- Installation happens off-chat. The installer taps Installation done, later the same day.

- Serial label photo. AI reading: read, or retake with Type it in instead.

- The installer confirms the reading, or types the number. Either way it is saved.

- Four compliance photos, in one send or several. Skip for later brings a reminder before submission.

- If the signal drops, nothing is sent until it is back. Then Submit evidence.

- Submitted and in review. A person decides: approved, retake, or needs assistance.

- Retake: one new photo, then approved. Needs assistance: Thandi in the chat.

- From any step, Contact support, the word "person", or a third unclear message brings in Thandi, who hands back to the same step.

### Two sittings, not one form

A geyser replacement happens in two sittings, so the conversation does too. The before photo is taken on arrival. The assistant then says "Go ahead with the installation" and waits for one tap, Installation done. The serial label belongs to the new geyser, so it is asked for only after that tap, hours later. Until then the job is paused, with progress saved.

### One language, chosen once

The installer chooses English, isiZulu or Afrikaans in the first message, and every later message, button and error follows that choice. Typing "language", "ulimi" or "taal" brings the choice back without losing progress. "Help", "usizo" or "hulp" explains the current step, and "person", "umuntu" or "persoon" brings in a person. Every button label fits WhatsApp's 20-character limit in all three languages, and the build fails if one doesn't.

The serial number confirmation in three languages

| Language | Message |

| English | Please check the serial number: KWH-8842-ZA-117. Is that right? |

| isiZulu | Sicela uhlole inombolo ye-serial: KWH-8842-ZA-117. Ingabe ilungile? |

| Afrikaans | Kontroleer asseblief die reeksnommer: KWH-8842-ZA-117. Is dit reg? |

Translations pending first-language review.

### Each stage at a glance

| Stage | Starts when | Collects | Decision points | Validation and recovery | Can end |

| Start | The first message arrives | Language | Which language; start or resume | Unclear text gets a one-line repair | Continues |

| Before photo | Begin verification | One photo of the whole geyser and the area around it | AI photo check: pass or ask again | Blurry photos get a plain reason and a retake, with Contact support beside it | Continues, or escalated |

| Installation | The before photo is accepted | Nothing; one button | None | Progress is saved | Paused until Installation done |

| Serial number | Installation done | A label photo and the serial number | AI reading: read or ask again; installer: Yes, correct or No, fix it | Glare gets a retake or Type it in instead; a typed number is saved and flagged for the reviewer | Continues, or escalated |

| Compliance | The serial number is saved | Four photos: PCV, overview, drip tray and overflow, isolator | Have all four arrived? | Partial sends are counted; a skip brings a reminder before submission; a dropped signal holds every reply | Paused, or continues |

| Review | Submit evidence | Nothing new | A person: approve, retake or needs assistance | A retake adds one photo exchange; needs assistance opens a chat with Thandi | Complete, or escalated |

### Worked example: the serial label with glare

The serial step carries most of the risk, so it has the most recovery built in. This is the exchange as the copy deck words it, with one tick and one dash left out.

Assistant"This next one matters most: the serial number label." A guidance card follows: only the label, about 15–20 cm away, the phone torch if it's dark.

InstallerSends a photo of the label.

AI check"I can see the label, but I can't read every character clearly yet." Reasons: glare across part of the label; a few characters are hidden. Buttons: Retake photo, Type it in instead.

InstallerSends a second photo.

AI check"Got it, serial number captured." Serial number: KWH-8842-ZA-117. "A Home FIX reviewer checks this too."

Assistant"Please check the serial number: KWH-8842-ZA-117. Is that right?" Buttons: Yes, correct, and No, fix it.

InstallerNo, fix it.

Assistant"Please type the serial number exactly as it is on the label."

Installerkwh-8842-za-111

Assistant"Thanks. Saved as KWH-8842-ZA-111. A reviewer will compare it with the photo."

Three decisions sit in that exchange. The AI names the reason in words an installer can act on. There is always a way out, so a bad label never traps anyone. And nothing the AI reads is saved until the installer agrees.

## Each screen answers one problem.

Every screen below exists because an installer has a specific problem at that moment.

### Starting verification

- **User problem:** The installer may prefer isiZulu or Afrikaans, and needs to know why a business wants their photos before sending any.

- **Design decision:** Ask for the language in the first message, greet the installer by name, and state the privacy purpose before asking for anything.

- **Intended effect:** Everything after the first tap reads in the installer's language, and the purpose of the photos is clear from the start.

### Collecting and confirming information

- **User problem:** Installers don't know what a usable photo looks like, and an AI reading of a serial label can be wrong.

- **Design decision:** A guidance card with what to show, how close to stand, and one good and one bad example. The AI's reading comes back as a yes-or-no question.

- **Intended effect:** Fewer retakes, and no serial number saved without the installer's say-so.

### Handling missing or invalid information

- **User problem:** The label is unreadable, or the AI read it wrong. Some compliance photos can't be taken yet.

- **Design decision:** Let the installer type the number, save it in capitals and say exactly what was saved. Photos can be skipped, but the assistant asks for them again before anything is submitted.

- **Intended effect:** The job keeps moving, the reviewer knows which values were typed, and nothing is submitted with items missing.

### Recovering from an error

- **User problem:** Photos come out blurry in low light, and the signal drops in the middle of an upload.

- **Design decision:** Name the problem plainly and keep Contact support beside the retake. On a dropped signal, show the clock on the photos and say nothing until the connection is back, because a business chat can't reach a phone that's offline.

- **Intended effect:** Failures read as normal and fixable, and the chat never shows something a real phone couldn't.

### Completing or escalating

- **User problem:** After submitting, the installer wants to know who decides and when they'll be paid.

- **Design decision:** One confirmation with the reference and time, then an in-review card that says a person decides and that payment follows approval.

- **Intended effect:** A clear next step, with no impression that the AI approved the job.

### Play through a job

Interactive prototype. Tap the buttons to play through a job.

Open the prototype full screen

## The AI checks. A person decides.

Six plain rules set what the AI is allowed to do, and what it must leave to people.

-

### The AI may accept a photo or ask again. It never rejects; a person decides.

**Controls:** the photo check and the serial reading. **Why it matters:** a job and a payment never stop on a model's judgement alone.

-

### Confidence scores route the conversation and go to the reviewer. The installer never sees them.

**Controls:** whether the next step is a retake or the next item. **Why it matters:** a percentage doesn't tell someone in a roof space what to do next; a plain reason does.

-

### Every extracted value is confirmed by the installer.

**Controls:** the serial number, read or typed. **Why it matters:** the person who can see the label has the final word on what it says.

-

### There's always a way out of a retake loop.

**Controls:** Contact support on the before-photo retake, Type it in instead on the serial retake, and a person after two unclear messages in a row. **Why it matters:** nobody gets stuck with a bad label or a dark roof.

-

### Help means a person inside the same chat, not a phone number.

**Controls:** Contact support and the word "person". Thandi replies in the chat, then hands back to the same step. **Why it matters:** the installer never has to leave the job to get help.

-

### If a job isn't approved, the installer is told why, who will help and by when.

**Controls:** the needs-assistance outcome: the reason, Thandi from the Home FIX team, today before 15:00. **Why it matters:** silence after a failed review is where trust goes.

### Confidence thresholds

| Check | Accept at about | Ask again at about |

| Photo quality | 96 | 41 or below |

| Serial reading | 98 | 41 or below |

Starting values, to be calibrated in a pilot. Values in between need real site photos before any production threshold is set. In the prototype, results are scripted.

### Three review outcomes

*Caption: Approved*

*Caption: Needs a retake*

*Caption: Needs assistance*

### Decisions a real client would need to approve

- How long photos, serial numbers and chat logs are kept, and where.

- The confidence thresholds, once calibrated on real site photos.

- Service hours, and what happens after 19:00 and on Sundays.

- The payment wording: "Payment is processed once the job is approved."

- The wording of the first message and the review outcomes, as WhatsApp templates.

## Fixed before anyone tests it.

We reviewed the first version against a written brief, fixed 20 problems, and checked every fix with automated tests before any participant sees it.

### The language that slipped back to English

*Caption: Before*

*Caption: After*

**Problem:** choosing isiZulu or Afrikaans changed the greeting and little else. **Fix:** every string now comes from one table in three languages, and a missing translation stops the build.

### The four-minute installation

*Caption: Before*

*Caption: After*

**Problem:** the before photo came at 09:33 and the new geyser's serial label at 09:37, four minutes apart. **Fix:** an installation step with one button, and the serial step starts later the same day.

### Confidence percentages on the installer's screen

*Caption: Before*

*Caption: After*

**Problem:** the installer saw "Read confidence 41%" and "98%". **Fix:** a plain result in words; the numbers move to the facilitator view, which stands in for the reviewer's.

### Support that sent people to a phone line

*Caption: Before (placeholder number covered)*

*Caption: After*

**Problem:** help meant leaving the chat for a phone call, with no reason given. **Fix:** Thandi replies in the same chat, and the referral says why, who and when.

The updated prototype passes 52 of 52 automated checks. They include full runs in all three languages, every review outcome, phones from 320 px wide, and a scan for English left on screen after choosing isiZulu or Afrikaans. It has not yet been tried on real phones.

### Testing plan

No participant sessions have run yet. This is the plan from the test kit.

-

### Who

Plumbers and installers using their own phones, in the language they prefer, each with a participant code.

-

### How

Moderated sessions of about 20 minutes. The participant thinks aloud while the moderator sets the review outcome from the facilitator view.

-

### Tasks

Complete a job from arrival to submission. Get a job approved after a retake request. Get help when stuck on the serial label.

-

### Measures Proposed

Task completion, time to submit, retakes per photo, repairs, handovers to a person, serial corrections, and ease on a 1 to 7 scale.

Download the conversation design spec

## Ready to test, with decisions left to the client.

The design is complete enough to put in front of installers; what remains is evidence and sign-off.

-

### Delivered

A working prototype in three languages, a conversation design specification, a copy deck of 221 strings, a moderator guide and a QA report.

-

### Still to validate

First-language review of every isiZulu and Afrikaans string. Real iPhones and Android phones, opened from WhatsApp. Thresholds on real site photos. Whether installers trust the AI result and the review wording.

-

### What we learned

Most of the first version's problems were invisible in an English walkthrough on a good connection. They showed up when we followed the job the way an installer lives it: in isiZulu, on a dropped signal, with hours between photos.

## Designing or rebuilding an AI conversation?

The Conversation Design Blueprint gives your team the flow, copy, AI rules and handover pack to build it right, tested in walkthroughs with your staff.

This concept went further than a Blueprint: the working prototype and test kit are not part of its standard scope.

Talk to NeuraUX
Discuss a Blueprint
Or email hello@neuraux.co.za

## Alt text

- The assistant shows the serial number it read, KWH-8842-ZA-117, then asks: Please check the serial number: KWH-8842-ZA-117. Is that right? Two buttons follow: Yes, correct and No, fix it.
- Flow diagram of the Home FIX conversation. A text version follows.
- Good morning, Sipho. This is Home FIX verification. Which language would you like to continue in? You can change this at any time. Three buttons: English, isiZulu and Afrikaans, each with a subtitle in its own language.
- The chat in Afrikaans after choosing Afrikaans: the privacy line, the job count, then the Werkopsomming card with reference HF-2026-DBN-04821, customer M. Khumalo, region Durban, KZN, and the button Begin verifikasie.
- First, a photo of the geyser as it is now. A Before photo card lists what to show (the entire geyser, the area around it) and photo tips (good lighting, step back slightly, keep the lens clear), with a good example and a too-close example. Buttons: Upload photo and Need help.
- In isiZulu, the AI shows the serial number KWH-8842-ZA-117, then asks the installer to check it. Buttons: Yebo, ilungile (Yes, correct) and Cha, yilungise (No, fix it).
- The installer taps No, fix it. The assistant asks them to type the serial number exactly as it is on the label. They type kwh-8842-za-111 and the assistant replies: Thanks. Saved as KWH-8842-ZA-111. A reviewer will compare it with the photo.
- Photo check: This one came out a little blurry, so it may be hard to verify. No problem, this happens often. A clearer shot will help your job get approved faster. Buttons: Retake photo and Contact support.
- The header reads Connecting. The installer's four compliance photos show a clock instead of delivery ticks, and the assistant has sent nothing since.
- Evidence submitted successfully, with reference HF-2026-DBN-04821, submitted 18 Jun 2026 at 13:18, 6 of 6 complete. Then an In review card: A real person makes the final decision, not an automated system. Payment is processed once the job is approved. Button: Contact support.
- Good news, Sipho, your review is complete. Installation approved: your evidence met all requirements. The job is complete. Completed 18 Jun 2026 at 14:52, 6 of 6 verified. Button: Close job.
- One item needs a retake. Item: serial number label. Reason: part of the serial is hidden by glare. Stand 15 to 20 cm back and use your torch to avoid glare. Everything else is approved and saved. Buttons: Retake now, Continue later, Contact support.
- A Home FIX agent will finish this with you. The reviewer couldn't approve the job from the photos alone. Reason: the serial number doesn't match the geyser on the order. Who: Thandi, Home FIX team. When: today before 15:00. Button: Chat to Thandi now.
- First version: after choosing isiZulu, the assistant says Kuhle, masiqale, but the Job summary card and the next message are in English.
- Updated version in isiZulu: the privacy line, the job count, the Isifinyezo somsebenzi card and the button Qala ukuqinisekisa are all in isiZulu.
- First version: the before photo is captured at 09:35 and the assistant asks for the new geyser's serial label at 09:37.
- Updated version: at 09:35 the assistant says Before photo saved. Go ahead with the installation. A Later today divider follows, then the installer's Installation done at 13:10 and the serial label request.
- First version: the AI cards show Read confidence 41 percent in an orange bar, then Read confidence 98 percent in a green bar.
- Updated version: the AI cards give the reason in words and a tick with the serial number, with no percentage or bar, followed by the request to check the serial number.
- First version: Additional assistance is required. The card lists a support phone number, covered here, and hours, and says an agent can complete the checks over the phone.
- Updated version: A Home FIX agent will finish this with you, with the reason, who (Thandi, Home FIX team) and when (today before 15:00), and the button Chat to Thandi now.
