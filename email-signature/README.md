# CMaxx WiFi Solutions — Email Signature

Production-ready HTML email signature for **Sihle Mahlangu, Director**, built
to match `reference/email-signature-reference.png` exactly.

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | The signature (table-based, inline-CSS, email-safe) |
| `assets/cmaxx-animated.gif` | Animated CMaxx logo — middle section (7 frames, loops) |
| `assets/cmaxx-logo.png` | Static CMaxx logo — left identity block |
| `assets/icon-phone.png` / `icon-email.png` / `icon-website.png` / `icon-location.png` | Orange contact icons — right column |
| `assets/stripe-left.png` / `stripe-right.png` | Diagonal stripe bands (cut 1:1 from the reference so the diagonals render identically in every email client) |
| `reference/email-signature-reference.png` | Source-of-truth design (1280 × 288 @2x) |

## Dimensions

Rendered size is **640 × 144 px** — half the 2x reference — with every image
displayed at half its natural pixel size so it stays sharp on retina screens.

## Image hosting

`index.html` references the GitHub Pages deployment of this repo:

```
https://sphamandla-designer.github.io/neuraux/email-signature/assets/
```

These URLs go live once this folder is merged to `main` (the Pages workflow
deploys the whole repo). Until then you can preview by swapping the base URL
for the branch's raw URL, or by replacing it with `assets/` and opening the
file locally.

## Installing the signature

1. Make sure the assets are live (merged to `main`).
2. Open `index.html` in a browser.
3. Select all (Ctrl/Cmd + A) and copy.
4. Paste into your mail client's signature editor (Gmail: Settings →
   Signature; Outlook: Options → Mail → Signatures; Apple Mail: Settings →
   Signatures), or paste the `<table>` markup directly into any editor that
   accepts raw HTML.

The layout uses only nested tables, inline styles, explicit widths/heights and
`<img>` tags — no flexbox, grid, web-font loading or scripts — so it holds
together in Outlook, Gmail, and Apple Mail. The font stack falls back
Poppins → Segoe UI → Helvetica → Arial.
