# Handoff: PerSongify — Editorial Direction

## Overview
PerSongify is a "song from an image" product. The user uploads a photograph; the system reads its mood / palette / weight and composes an original song in response. This handoff documents **Variant A — Editorial**, an editorial-magazine treatment of the three-screen pipeline:

1. **Upload** — pick an image, optionally steer mood / genre / vocals / tempo
2. **Loading** — show progress while the song is composed
3. **Results** — play the song, read its lyrics and the model's writeup of the image

---

## About the design files
The HTML files in this folder (`PerSongify.html`, `variant-a.jsx`, `shared.jsx`) are **design references created in HTML**. They are prototypes that show the intended look and behavior — not production code to copy directly.

Your job is to **recreate these screens in our app's existing environment** using the codebase's established patterns, components, and styling system. If there's no existing environment yet, choose a stack that fits the project (React + Tailwind / Vite is a reasonable default) and implement there.

The HTML uses inline-style React with theme objects; treat it as a spec, not a starting point.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, copy, and interactions are all locked in. Recreate the UI as closely as possible to the prototype, using your codebase's component library and design tokens where they map. Where the codebase doesn't have a token yet (e.g. specific serif size), introduce one — match the values exactly.

---

## Theme system

Three themes are supported — `dark` (default), `light`, `sepia`. Each is a flat object of named colors. Implement as CSS variables on a `data-theme` attribute, or whatever your app already uses for theming.

| Token       | dark               | light             | sepia              |
|-------------|--------------------|-------------------|--------------------|
| bg          | `#0d0d0e`          | `#f4f1ea`         | `#1a1612`          |
| surface     | `#161617`          | `#ffffff`         | `#221d18`          |
| border      | `rgba(255,255,255,.09)` | `rgba(0,0,0,.10)` | `rgba(232,209,170,.12)` |
| text        | `#ece8df`          | `#171615`         | `#e8d1aa`          |
| muted       | `#8a857c`          | `#6b6660`         | `#a08a6e`          |
| accent      | `#ece8df`          | `#171615`         | `#e8d1aa`          |
| accentText  | `#0d0d0e`          | `#f4f1ea`         | `#1a1612`          |
| subtle      | `rgba(255,255,255,.03)` | `rgba(0,0,0,.04)` | `rgba(232,209,170,.04)` |

Notes
- `accent` is a *foreground* color on Editorial (the design uses tonal contrast, not a hue accent).
- `accentText` is the inverse fill that pairs with the accent (used on primary buttons).
- `subtle` is a faint tint for inset surfaces (dropzone, active nav pill).

---

## Typography

Two Google Fonts. Load both, all weights below.

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
```

| Role | Family | Weight | Notes |
|------|--------|--------|-------|
| Display / headlines / italic accents | **Playfair Display**, serif | 400 / 500, italics used for emphasis words | letter-spacing `-0.02em` on all display sizes |
| Body / UI / labels / nav / buttons | **IBM Plex Sans**, system-ui, sans-serif | 300 / 400 / 500 | base size 14px, line-height 1.55 |
| Numbers (BPM, durations, file sizes) | IBM Plex Sans | — | `font-variant-numeric: tabular-nums` |

**Eyebrow / label style** (used everywhere — section labels, nav, "01" markers):
- IBM Plex Sans, 11px, `text-transform: uppercase`, `letter-spacing: .16em`–`.24em` (tighter for nav items, looser for hero eyebrows)
- color = `muted`

---

## Global layout (every screen)

```
┌────────────────────────────────────────────────────────────┐
│  Header: padding 20px 32px, border-bottom 1px              │
│  ┌──────────────┐    ┌────────────────┐    ┌─────────────┐ │
│  │ Per[Songify] │    │ upload loading │    │ Iss. 04 · …│ │
│  │  serif logo  │    │      results   │    │   eyebrow   │ │
│  └──────────────┘    └────────────────┘    └─────────────┘ │
├────────────────────────────────────────────────────────────┤
│  Main: padding 40px 56px 48px, overflow auto               │
│                                                            │
│                    [screen content]                        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

- Root: `display: flex; flex-direction: column`, theme `bg` background, theme `text` color.
- **Logo**: `Per` regular + `Songify` italic, Playfair Display 22px / 500, letter-spacing `-0.02em`.
- **Nav**: 3 pills (`upload`, `loading`, `results`). Active pill = `subtle` background, `text` color. Inactive = transparent, `muted` color. Padding `6px 10px`, radius 999.
- **Issue tag** (right): `Iss. 04 · 2026` in eyebrow style.
- Each main column maxes out around 760–880px and is `margin: 0 auto`.

---

## Screen 1 — Upload

### Hero block (centered, max-width 760)
- Eyebrow: `An image · A song` — 11px / .24em / uppercase / muted, `margin-bottom: 18`.
- H1: Playfair Display 56 / 400 / line-height 1.05 / letter-spacing `-0.02em`.
  Copy: `Compose music\nfrom <em>any photograph</em>.` (literal `<br>` between the two lines; the words "any photograph" are italic).
- Sub: 15px, color `muted`, max-width 460. Copy: `Upload an image. We'll read its mood, palette and weight — then write you an original song.`
- Block `margin-bottom: 36`.

### Dropzone / Selected-image card
Container: `subtle` background, `1px solid border`, radius 4, `margin-bottom: 28`.

**Two states:**

**Empty** (no image):
- `padding: 64px 32px`, centered.
- Title: Playfair Display 26, italic — `Drop an image`.
- Subtext: 13px / muted — `JPG · PNG · WEBP  ·  up to 12 MB`.
- Whole card click target opens file picker.

**Filled** (after upload, also the default in the prototype with sample image):
- `min-height: 240`, flex row, no padding on container.
- Left: 240px wide image, full height, `object-fit: cover`, black background behind.
- Right: flex column, `padding: 24px 28px`, `justify-content: space-between`.
  - Top:
    - Eyebrow `Selected image`
    - Filename — Playfair Display 22 / 500. Sample copy: `amber-hour.jpg`.
    - Meta — 12px / muted / tabular-nums. Sample copy: `2.3 MB · 4032 × 3024`.
  - Bottom row (`gap: 10`):
    - **Replace** — ghost button (transparent bg, `1px border`, muted text, padding `8px 14px`, radius 999, 12px). Resets to empty state.
    - **Compose →** — primary button (`accent` bg, `accentText` color, no border, padding `10px 20px`, radius 999, 13px / 500). Advances to loading.

### Direction (controls panel)
Title row: `Direction` (Playfair 18 italic) + ` · optional` (uppercase eyebrow style, normal weight). Margin-bottom 4. Then a top border on the table.

A 4-row table, each row:
- `display: grid; grid-template-columns: 120px 1fr; gap: 16; padding: 14px 0; border-bottom: 1px solid border`.
- Left cell: eyebrow label (`Mood`, `Genre`, `Vocals`, `Tempo`).
- Right cell: chip group OR slider (Tempo).

**Chip** (used for Mood, Genre, Vocals):
- `padding: 5px 12px`, radius 999, font 12.
- Inactive: `1px solid border`, transparent bg, `text` color.
- Active: `1px solid text`, `text` background, `bg` color (i.e. inverted).
- Single-select within each row.

**Tempo row:**
- `<input type=range min=60 max=160>`, full width, `accent-color: text`.
- Right of slider: value in Playfair Display 18 + `BPM` in eyebrow style. Width 64px right-aligned. Tabular numerals.

### Option lists
```
Moods:  Wistful, Bright, Tense, Dreamy, Driving, Hushed
Genres: Indie folk, Synthwave, Hip-hop, Lo-fi, Ambient, Soul, Post-rock, Jazz
Vocals: Female, Male, Duet, Instrumental
Tempo:  60–160 BPM, default 86
Default selection: Wistful / Indie folk / Female / 86 BPM
```

---

## Screen 2 — Loading

Two-column grid (`1fr 1fr`, gap 48, max-width 760, vertically centered).

**Left column — image preview:**
- Square (`aspect-ratio: 1`), `border-radius: 4`, black background.
- Image fills it, `object-fit: cover`, `filter: brightness(.7)` (dimmed while processing).

**Right column — status:**
- Eyebrow `Now composing` (.24em).
- H2: Playfair 38 / 400 / line-height 1.1 — `A song is taking shape.`
- Sub: 14px / muted — `Usually 60–90 seconds. {genre} · {mood lowercased} · {tempo} bpm.`
- Margin-bottom 32.

**Step list** (3 rows, top + bottom border per row):
Grid `32px 1fr auto`, `padding: 14px 0`, `gap: ?`. Inactive rows have `opacity: 0.4`.
- Col 1: Playfair italic 18 muted — `01`, `02`, `03` (zero-padded).
- Col 2: 14px label (the step's text — see below).
- Col 3: status, eyebrow style:
  - Done → `✓ Done`
  - Active → `Working…` with the ellipsis blinking (CSS `steps(4)` keyframes 1.4s)
  - Pending → `Queued`

**Steps:**
```js
[
  { id: 'reading',   label: 'Reading the image',  duration: 1800 },
  { id: 'analyzing', label: 'Analyzing palette',  duration: 2200 },
  { id: 'composing', label: 'Composing the song', duration: 2400 },
]
```
Total ~6.4s in the prototype; in production, derive from your real pipeline events.

---

## Screen 3 — Results

Max-width 880, centered.

### Hero (2-col grid, `1.1fr 1fr`, gap 32, margin-bottom 28)

**Left:** square album image (aspect-ratio 1, radius 4, black bg, `object-fit: cover`).

**Right:** flex column, `justify-content: space-between`.

Top half:
- Eyebrow `An original composition` (.24em).
- H1: Playfair 52 / 400 / line-height 1.02. Title where the **second word is italic** (e.g. `Amber *Hour*`).
- Meta row: 13px / muted, `gap: 16`, separator `·`. Fields: genre · mood · tempo BPM (tabular) · key.

Bottom half — **Player**:
- Top row: 56×56 round play button + scrub bar.
  - Play: `1px solid text`, `text` background, `bg` icon color. Toggles `▶` / `❚❚`.
  - Scrub: 2px tall track, `border` color. Filled portion = `text`. Round 8px thumb at the head, also `text`.
  - Click anywhere on the track to seek.
  - Below scrub: `0:42 / 2:34` time pair, tabular numerals, 11px muted, `justify-content: space-between`.
- Bottom row (`gap: 8`):
  - **↓ Download MP3** — ghost button, flex 1.
  - **Copy share link** — ghost button, flex 1. On click: change text to `✓ Link copied` for 1.6s.

### Tabs strip
Border-top + border-bottom container, `padding: 12px 0`, `margin-bottom: 18`.
Two tabs, `gap: 24`. Each = Playfair 18 italic, padding-bottom 2, 1px bottom border (transparent or `text` when active).
- `The Lyrics`
- `On the image`

### Lyrics tab
- 2-column layout: `column-count: 2; column-gap: 40`.
- Playfair Display 19 / 400 / line-height 1.65, `white-space: pre-wrap`.
- Render as `<pre>` so newlines from the lyrics string survive.

### About tab
- Body: 16 / 1.7, `text` color, max-width 620.
- **Drop cap**: first character floated left, Playfair 44 / 500 / line-height .9, margin-right 8, margin-top 4.

### Footer
Centered `← Try another image` link button: 12px / `.18em` / uppercase / muted, transparent.
Resets play state and routes back to upload.

### Sample result (placeholder content for the prototype)
```js
const SAMPLE_RESULT = {
  title: 'Amber Hour',
  duration: 154,            // seconds (2:34)
  genre: 'Indie folk',
  mood: 'Wistful',
  tempo: 86,
  key: 'A minor',
  lyrics: '<full lyrics string with \\n line breaks — see shared.jsx>',
  description: '<2–3 paragraph image writeup — see shared.jsx>',
};
```
Pull the real strings from `shared.jsx` (search for `SAMPLE_RESULT`).

---

## Interactions & state

### Routing
A single `screen` state — `'upload' | 'loading' | 'results'`. The header nav switches it directly (this is also useful for QA — keep it). The user-driven path:

```
upload  --[click Compose →]--> loading
loading --[pipeline done]----> results
results --[Try another image]-> upload (reset playing=false, playT=0)
```

### Pipeline timer
While `screen === 'loading'`, walk through the 3 steps in order using each step's `duration`. When the last finishes, set screen to `results`. In production, drive this off real backend events instead of fixed timers.

### Player
- `playing` boolean.
- `playT` seconds (0 → duration). When `playing`, advance via `requestAnimationFrame` (real impl: bind to `<audio>` element's `timeupdate`).
- Scrub-bar click sets `playT = (clickX / width) * duration`.
- When `playT >= duration`, loop back to 0 (prototype only — real player should pause at end).

### Copy share link
Show `✓ Link copied` for 1600ms, then revert to `Copy share link`. Use `navigator.clipboard.writeText()` with the canonical share URL.

---

## Design tokens summary

```
spacing scale used:    4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64
radii:                 2 (artboards), 4 (image cards), 999 (pills/buttons), 50% (play btn)
borders:               1px theme.border throughout
shadows:               none (editorial — the design relies on borders, not depth)
type sizes:            11, 12, 13, 14, 15, 16, 18, 19, 22, 26, 38, 52, 56
font-weights:          400 (display), 500 (filename, drop cap, button label)
letter-spacing:        -0.02em (display), .16em (nav, meta), .18em (status), .24em (hero eyebrow)
line-height:           .9 (drop cap), 1.02 (results h1), 1.05 (upload h1), 1.1 (loading h2),
                       1.55 (body), 1.65 (lyrics), 1.7 (about prose)
```

---

## Assets

The prototype uses an **inlined SVG placeholder** as `SAMPLE_IMAGE` (a dim purple/amber abstract gradient — search `SAMPLE_IMAGE` in `shared.jsx`). Replace with the user's actual uploaded image. There are **no icons** beyond Unicode glyphs:
- Play `▶` / pause `❚❚`
- Download arrow `↓`
- Right arrow `→`
- Left arrow `←`
- Check `✓`

Feel free to swap these for your icon library if you have one — just keep them small (12–16px) and inline with the text baseline.

---

## Files in this bundle
- `PerSongify.html` — full prototype, runnable standalone (open in a browser). All three screens of Variant A live here, plus theme tweak controls.
- `variant-a.jsx` — extracted React source for Variant A (`VariantA`, `UploadA`, `ControlsA`, `LoadingA`, `ResultsA`). Inline-style React, no build step.
- `shared.jsx` — sample data, theme objects, fake pipeline + playhead hooks, formatting helpers. Re-used by every variant.

---

## Implementation checklist

- [ ] Wire up the 3 themes as CSS variables on the app shell, default `dark`.
- [ ] Load Playfair Display + IBM Plex Sans.
- [ ] Build the page shell (header with logo + nav + issue tag, scrollable main).
- [ ] Upload screen: hero copy, dropzone (empty + filled states), Direction controls panel.
- [ ] File-picker hookup + drag-and-drop on the dropzone.
- [ ] Loading screen: dimmed image + step list, driven by real pipeline events.
- [ ] Results screen: hero, player (audio element wired up), tabs, lyrics columns, about drop cap, reset link.
- [ ] Copy-link toast (1.6s timeout).
- [ ] Tabular numerals on every numeric value.
- [ ] Italic-emphasis treatment on display titles (one word italicized).
