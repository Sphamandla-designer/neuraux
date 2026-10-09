# Home FIX prototype: moderator guide

One page for running a session. About 20 minutes with a participant, plus 5 minutes to set up.

## Before the session

1. Open the participant link on your own phone and run one full job. Check it loads, the camera opens, and the results card appears at the end.
2. Choose the participant code (P01, P02 …) and the language the participant prefers.
3. For a moderated session, open the facilitator link on a second device or the same phone, and set the outcome you want to test.
4. Remind the participant to bring a charged smartphone. Photos are optional; they can use the sample-photo link instead.

## Links to share

Replace `BASE` with the hosted address, for example
`https://sphamandla-designer.github.io/neuraux/homefix/dist/Home_FIX_Mobile.html`.

| Who | Link |
|---|---|
| English participant | `BASE#lang=en&p=P01` |
| isiZulu participant | `BASE#lang=zu&p=P02` |
| Afrikaans participant | `BASE#lang=af&p=P03` |
| Moderator (you) | `BASE#facilitator&lang=en&p=P01` (PIN 2468) |

Change the `p=` code for each participant. The participant can still change the language in the chat.

To test a retake or a referral, run the session with the facilitator link on the participant's phone (the F tab sits over the back arrow in the header; ask them not to tap it), or set the outcome on your device and hand it over.

## Intro script (2 minutes)

> Thanks for helping us. We're testing an idea for how plumbers could send job evidence through a chat, like WhatsApp. This is a prototype: it isn't WhatsApp and Home FIX isn't a real company. We're testing the chat, not you. There are no wrong answers. If something is confusing, that's exactly what we need to know.
>
> Please think out loud as you go: what you're looking at, what you expect, what surprises you. I may stay quiet so I don't steer you.
>
> Please don't type any personal information. Photos stay on your phone; we don't receive them.

**isiZulu:** Siyabonga ngokusisiza. Sihlola indlela uplamba angathumela ngayo ubufakazi bomsebenzi ngengxoxo efana ne-WhatsApp. Lena yi-prototype: akuyona i-WhatsApp, futhi i-Home FIX akuyona inkampani yangempela. Sihlola ingxoxo, hhayi wena. Sicela usho ngezwi eliphezulu lokho okucabangayo. Sicela ungabhali imininingwane yakho siqu. *(needs native review)*

**Afrikaans:** Dankie dat jy ons help. Ons toets 'n idee vir hoe loodgieters werkbewyse deur 'n klets soos WhatsApp kan stuur. Dit is 'n prototipe: dit is nie WhatsApp nie en Home FIX is nie 'n regte maatskappy nie. Ons toets die klets, nie vir jou nie. Dink asseblief hardop terwyl jy werk. Moet asseblief nie persoonlike inligting tik nie. *(needs native review)*

## Consent

The participant reads the welcome screen, ticks the box and taps Start. Ask: "Is anything on that screen unclear?" They can stop at any time; if they do, use Reset session on the facilitator drawer.

## Tasks

Say each task once. Don't name buttons.

| # | Task (say this) | Setup | Success means |
|---|---|---|---|
| 1 | "You're Sipho. You've been sent to replace a burst geyser. Use the chat to send what Home FIX needs, from arrival to the end of the job." | Outcome: Approved | Reaches the results card. Takes the before photo, taps Installation done, handles the blurry photo and the serial glare without help, confirms the serial, sends the 4 compliance photos, submits. |
| 2 | "The reviewer has looked at your job. Do what's needed to get it approved." | Outcome: Needs a retake | Retakes the serial label photo from the retake message and sees Approved. |
| 3 | "You're stuck on the serial label and want to talk to someone at Home FIX." | Any outcome; start from the serial step | Reaches Thandi through Contact support, Type it in instead, or by typing "person" / "umuntu" / "persoon", and gets back to the same step. |

Optional extra for task 3: set **Needs assistance** and ask "What happens next with this job, and who will help you?"

## Probes (use sparingly, after a task)

- "What did you expect to happen when you tapped that?"
- "What does this message mean to you?" (point at the AI card)
- "Who decides whether your job is approved?"
- "When would you get paid?"
- "What would you do here if you were in a dark roof space?"
- "How did you know the photos had been received?"
- "Was there anything you wanted to type instead of tap?"

## Debrief (3 minutes)

1. "How easy was that overall?" (they also answer 1–7 on the results card)
2. "What was hardest?"
3. "How does this compare with how you send job evidence today?"
4. "Is there anything you'd change before you'd use it on a real job?"
5. For isiZulu and Afrikaans participants: "Did any words sound strange or unclear?" Note the exact words.

## Collect the results

At the end the participant sees the results card. Ask them to:

1. Answer the two questions on the card.
2. Tap **Copy results** and paste into a WhatsApp message or email to you, **or** tap **Download results (CSV)** and send you the file.

If you set `RESULTS_ENDPOINT` (see README), a **Send results** button sends them directly.

Results have taps, typed messages and timings, the participant code and the answers. No photos, names or phone numbers.

Keep your own notes per beat: errors, hesitations (more than 5 seconds), repairs ("Sorry, I didn't catch that"), and quotes. File them with the participant code.
