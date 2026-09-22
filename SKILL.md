---
name: pixel-art-web-design
description: Design a pixel-art (像素风) webpage end-to-end from a brief — derive a tile grid, restricted palette, shading rules, typography, motion grammar, and component library that are internally consistent. Use whenever the user says "像素风", "pixel art", "8-bit", "16-bit", "retro game UI", "GameBoy 风", "GB风", "HF-2D", "HD-2D", "dot art", "sprite 风", "Y2K 像素", "复古游戏风" or asks to redesign a webpage / app / 落地页 / UI 组件 in a pixel style.
---

# Pixel-Art Web Design SOP

A repeatable pipeline that turns a brief into a pixel-art webpage whose every
visible element is mutually consistent. The pipeline is built from first
principles extracted across four archival archetypes used as calibration
families, not as sources to copy from.

When the user invokes this skill, work the steps in order. Do not skip steps
even if the brief feels small — small briefs are where the DNA matters most.

---

## 0 · Inputs the SOP expects

Ask only the questions that change the answer. Two are mandatory:

1. **Subject** — what is the page for? (product / portfolio / blog / 落地页 /
   game UI / app shell / dashboard)
2. **Archetype** — which of the four families, or the user's own reference
   board? Pick the closest, then push the sliders in Step 2.

Optional but cheap to ask:

3. **Output target** — single static HTML page, multi-page site, React app,
   Tailwind-based, or pure CSS variables / SVG sprite sheet.
4. **Constraint** — accessibility (must remain WCAG-AA), must work on mobile,
   must reuse an existing design system, must satisfy a brand book.

If the user provides screenshots / a mood board, route through Step 1 first
to extract their palette and grid before answering any of the above.

---

## 1 · Aesthetic first principles (the DNA)

The four calibration families differ in production cost and target
resolution, but every harmonious pixel composition satisfies the same six
constraints. These are the *first principles*; every downstream decision
derives from them.

### 1.1 Discretization (网格化)
- Use two compatible grids: a **layout unit** (`--unit`, default 4px) for
  spacing and component sizing, and a **detail pixel** (`--pixel`, default
  1px) for borders, bevels, letter-spacing, and text line boxes.
- Choose one layout unit: **2px, 4px, or 8px**. The detail pixel must divide
  both the unit and half the unit into integers; 1px works for all three.
- Layout gaps and padding use whole layout units. Fine details and box
  edges use whole detail pixels; they need not be whole layout units.
  Component dimensions below assume the default grids; adapt fine details
  through their tokens when changing `--pixel`.
- Sprite pixels use one shared integer render scale (§1.3). Responsive
  containers may change width, but avoid fractional sprite scaling.
- *Why this is a principle:* the moment two elements sit on different grids,
  the eye reads the seam. Pixel art's clarity comes from the whole frame
  obeying one lattice.

### 1.2 Restriction (色板约束)
- Aim for **8–24 unique palette colors**, including outlines, sky, and UI
  chrome; richer families may use up to 32. Count unique color values,
  not token names: aliases of the same color consume one entry.
- Palette construction is **ramps**, not gradients. A ramp is typically 3–5
  light-to-dark variants of one hue, including an outline where used. Build
  one ramp per logical material (skin, grass, stone, sky, UI accent), then
  use a subset if the page's shading budget is smaller.
- Shared neutrals (outline, paper, ink) come from a *single* four-step neutral
  ramp. The same four neutrals can appear in every material ramp.
- *Why this is a principle:* a small palette forces the eye to find identity in
  shape and grouping instead of color noise. A 16-color scene reads because
  every color is *committed*.

### 1.3 Indexing (调色索引/家族色)
- Once a palette is fixed, it is **referenced by index**, never re-picked.
- LOD commitment: each archetype commits to a pixel density and never
  crosses it. *Family A* uses 32–64px character art scalerendered to 4×.
  *Family B* uses 16×16 tiles rendered at 4×. *Family C* uses 32×32 sprites
  rendered at 6–8×. *Family D* uses 32×32 sprites rendered at 1×.
- *Why this is a principle:* mixing LODs is the single most common reason
  pixel UIs look "off" — a 32×32 sprite next to a 320×400 hero image forces
  the eye to re-bin the scene.

### 1.4 Stacking (shading as discrete bands)
- Shading is **band-limited**, not continuous. Use 2–5 bands according to
  the chosen budget, not 256. Order palette ramps from light to dark:
  `specular → highlight → base → shade → shadow`, omitting unused steps.
- Choose a maximum shading-band count for the page within the family's
  range. Simple objects may use fewer bands; no object exceeds that budget.
- Where an outline is used, keep it at least as dark as the object's deepest
  fill. Outline-free styles use silhouette contrast instead.
- *Why this is a principle:* continuous gradients instantly betray the pixel
  medium. Bands read as a deliberate artistic choice.

### 1.5 Activation (motion discipline)
- Pixel scenes animate by **sprite-cycle**, not by tween:
  - Walk cycle: 2 or 4 frames at 8fps; choose per character and keep consistent.
  - Idle: 2 frames at 1–2 fps, sometimes called "breathing".
  - UI hover: 1 frame, instantaneously (no transition).
  - Pressed: 1 frame, also instantaneous.
- Camera motion is **lerp-on-integer-frame** — the camera always rests on a
  grid coordinate between moves.
- Flowers / flames / water shimmer: 2–3 frame sprite swaps at 4–6fps.
- *Why this is a principle:* smooth motion reads as web-native UI, not as
  pixel art. The medium's contract is "frames, not tweens".

### 1.6 Objectivity (iconography as silhouette)
- Every icon must read at **16×16** before any detail is added.
- The silhouette is built from the outline ramp only. Interior color is
  applied second.
- One icon = one concept. No icons that combine label + symbol + accent.
- *Why this is a principle:* pixel-art iconography is a *survival* skill;
  if it doesn't read at 16², the higher resolution doesn't fix it.

---

## 2 · Pick the archetype family, then push the sliders

The four families are not styles to choose between — they are *base specs*
the user pushes toward a target. Identify the closest base, then tune
the four sliders below.

| Family | Sprite (px) | Shading bands | Palette | Vibe |
|---|---|---|---|---|
| **A · character MV**       | 32–64 (scalerendered) | 2–3 | 12–16 | character, scene, monochrome wash |
| **B · agrarian tile**      | 16×16 tile, 4× render | 3–4 | 16–28 | agrarian, warm, hand-drawn |
| **C · cinematic HD-2D**    | 32×32, 6–8× render    | 4–5 | 24–32 | cinematic, oil-lit, NPR |
| **D · modern soft**        | 32×32, 1× render      | 4   | 20–28 | modern, soft-saturation, atmospheric |

### Sliders to talk through with the user

1. **Shading depth** — number of bands (2 = A / GB, 4 = C).
2. **Outline strength** — 0 (no outline, NPR) → 100 (strongest contrast in
   the chosen palette). Default 70; deep indigo is the default outline.
3. **Animation budget** — 0 (static), 1 (cursor blink only), 4 (full sprite
   cycles), 8 (animated background).
4. **Light source** — fixed 45° top-left (default), 45° top-right (East),
   bottom (underlighting), cinematic (3-point).

Pick defaults for sliders the user has no opinion on. Do not ask.

---

## 3 · Concrete output tokens (CSS variables)

Generate these tokens *first*, in this order. The order matters: each token
constrains the ones below it.

```css
:root {
  /* 1. Compatible layout and detail grids */
  --unit: 4px;          /* 2 / 4 / 8 — pick one */
  --pixel: 1px;         /* divides --unit and --unit / 2 */

  /* 2. Grid dimensions — every component snaps to these */
  --tile: 32px;                             /* source sprite cell size */
  --gutter: calc(var(--unit) * 2);            /* 8px */
  --rhythm: calc(var(--unit) * 4);            /* 16px — paragraph gap */

  /* 3. Palette — restricted, indexed, ramp-built */
  --ink:        #1a1a2e;   /* outline */
  --ink-soft:   #3a3a55;
  --paper:      #f4f1e8;   /* bg */
  --paper-soft: #e8e2d0;
  --sky-1:      #a8d5e8;   /* lightest ramp step */
  --sky-2:      #6cb4d8;
  --sky-3:      #3589b8;
  --sky-4:      #1f5f8a;   /* deepest */
  --accent-1:   #e85a4f;   /* ramp: peach → coral → wine */
  --accent-2:   #c93f3f;
  --accent-3:   #8a2424;
  --gold-1:     #f7c948;   /* gold / sparkle */
  --gold-2:     #c89a2a;
  --gold-3:     #7d5f15;
  --grass-1:    #8fce6b;
  --grass-2:    #5fa73e;
  --grass-3:    #2f6b22;
  --shadow:     var(--ink-soft); /* opaque palette alias; no extra color */

  /* 4. Typography — pixel font, integer line-heights */
  --font-pixel: 'Press Start 2P', 'VT323', 'Pixelify Sans', monospace;
  --fs-h1:  calc(var(--unit) * 8);  /* 32 */
  --fs-h2:  calc(var(--unit) * 5);  /* 20 */
  --fs-body:calc(var(--unit) * 3);  /* 12 */
  --lh-tight: 1;     /* headings */
  --lh-body:  1.5;

  /* 5. Detail geometry; shadows have zero blur */
  --bw-thin: var(--pixel);
  --bw-thick: calc(var(--pixel) * 2);
  --bevel-offset: calc(var(--pixel) * 2);
  --shadow-raised: var(--unit);
  --shadow-pressed: calc(var(--unit) / 2);
  --press-offset: calc(var(--shadow-raised) - var(--shadow-pressed));
  --bevel-raised:
    inset var(--bevel-offset) var(--bevel-offset) 0 0 var(--paper-soft),
    inset calc(-1 * var(--bevel-offset)) calc(-1 * var(--bevel-offset)) 0 0 var(--ink);
  --bevel-pressed:
    inset var(--bevel-offset) var(--bevel-offset) 0 0 var(--ink),
    inset calc(-1 * var(--bevel-offset)) calc(-1 * var(--bevel-offset)) 0 0 var(--paper-soft);

  /* 6. Sprite scale — render scale (LOD commitment) */
  --sprite-scale: 4;   /* generic 32px example; family B uses --tile: 16px */
  --sprite-size: calc(var(--tile) * var(--sprite-scale)); /* 128px */
}
```

### Mandatory defaults if any of the above is missing

- `--unit` must be chosen first. **Pick 4px by default** for web.
- `--ink:#1a1a2e` (deep indigo) gives outlines a softer, drawn appearance.
- `--paper` must be warm (`#f4f1e8`) unless the brief explicitly says cool.
- Accent ratios: sky/ramp = 4, accent/ramp = 3, gold/ramp = 3, grass/ramp = 3.
- Total palette ceiling: **32 unique opaque colors including shadow colors**.
  Reuse tokens for shadows; translucent overlays create extra blended colors.
  See `references/palette-construction.md` for counts and family presets.

---

## 4 · Component library (HTML + CSS scaffolding)

Build with these eight primitives. Every component is a single block inside
the grid. Every component respects the bevel convention (see
`references/bevel-system.md`).

### 4.1 SpriteFrame
```html
<figure class="sprite-frame">
  <img src="hero.png" alt="" width="128" height="128"
       style="image-rendering: pixelated;">
  <figcaption>Hero, 32×32 sprite rendered at 4×</figcaption>
</figure>
```
```css
.sprite-frame { display: inline-block; background: var(--sky-1);
  border: var(--bw-thick) solid var(--ink);
  padding: var(--gutter); box-shadow: var(--bevel-pressed); }
.sprite-frame img { width: var(--sprite-size); height: var(--sprite-size);
  image-rendering: crisp-edges;
  image-rendering: pixelated; }
```
`image-rendering: pixelated` is **non-negotiable** for any sprite asset.

### 4.2 Panel (the box primitive)
- Outer = `--bw-thin` outline in `--ink`.
- Inner = `--bevel-raised` (light upper-left, dark lower-right).
- Drop shadow = `--shadow-raised` down/right, color `--shadow`, zero blur.

### 4.3 Button (clickable Panel)
- 3 visual states, none of them transition:
  - **Rest**: `--bevel-raised` with `--shadow-raised` drop-shadow offset.
  - **Hover / focus-visible**: outline shifts to `--accent-1`; keep raised.
  - **Active**: `--bevel-pressed`, move down/right by `--press-offset`, and
    reduce the drop-shadow offset to `--shadow-pressed`.
- No CSS `transition` on bevel — instant flips only.

### 4.4 ProgressBar
- 8px high, width in layout units, `--bw-thin` outline. Six fill steps
  toggle classes; choose an interior width divisible by six detail pixels.

### 4.5 DialogBox (modal)
- 100% width on mobile, 480px on desktop, `--bw-thin` outline and raised shadow,
  positioned below a 32×32 talking-head sprite.
- Mandatory NPC head: top-left of the box, 32×32 sprite.

### 4.6 InventorySlot
- 32×32 cell, 1px outline, optional "selected" border in `--accent-1`.
- Items always center on grid integer (offset 0,0 or 8,8).

### 4.7 HudBar (top-left hearts / top-right currency)
- 8×8 icon, 1px gap, repeated N times.
- Distribute icon groups to fill available space; never stretch the icons
  themselves or change their shared integer scale.

### 4.8 WindowChrome (title bar + resize affordance)
- 16px title bar with `── 标题 ──` formatting using solid `--gold-1` text.
  Optional gold shading uses discrete palette bands, never smooth gradients.
- Close button: 8×8 red square, 1px outline, hover = light to dark.

---

## 5 · Typography & content rules

- **One font family** for the whole page. Do not mix a pixel font with a
  body sans. If the body must be more readable, use a *pixel-duplicate* font
  such as *VT323* (readable) or *Pixelify Sans* (modern).
- All headings: `letter-spacing: 0; line-height: 1; text-transform: none`.
- Buttons: `text-transform: uppercase; letter-spacing: calc(var(--unit) / 2)`.
- Body copy: max width `60ch`, paragraph gap `var(--rhythm)`.
- Numbers always monospace tabular alignment; never proportional figures
  in HUDs.
- Color choices: prefer 1 ink + 1 paper + 1 accent per text block. Reusing
  an existing accent costs no extra palette entry; count each new color once.

---

## 6 · Motion grammar

Allowed only:
1. **Frame swap** (`steps(1)` or discrete class toggle).
2. **2- or 4-frame walk cycle** at 8fps; **2-frame idle** at 1–2fps.
3. **2- or 3-frame flower / flame / water shimmer** at 4–6fps.
4. **Cursor blink** at 1.5fps.
5. **Slide / fade** only as a single discrete state change; never `ease`.

Forbidden:
- `transition-duration` > 0 between inset / scale / opacity.
- `transform: scale()` on hover (use border-color swap instead).
- Continuous `animation-timing-function: linear` on UI elements.

Sprite sheet layout:
```
+------+------+------+------+
| 00   | 01   | 02   | 03   |   ← walk cycle
+------+------+------+------+
| 10   | 11   |      |      |   ← 2-frame idle; remaining cells unused
+------+------+------+------+
```
Each source cell is exactly `--tile × --tile` pixels. A 32×32 source cell
displayed at 4× occupies 128×128 CSS pixels; the source sheet stays unscaled.
For a two-frame walk, use only the first two cells of its row.

---

## 7 · Accessibility & responsive

- Ramps help select contrasting pairs but do not guarantee accessibility;
  measure each text/background pairing against the thresholds in §8.
- All hover-equivalent states must have a focus equivalent.
- Cursor must be a visible pixel cursor (1px outline, 5×5 box) — never
  `cursor: default`.
- Mobile: integer scale-down; never re-tile at half pixel offsets.
- Reduce-motion: disable sprite cycles, freeze at frame 0, replace cursors
  with static equivalents.

---

## 8 · Validation checklist (run before delivery)

Run through these in order. Every item must pass unless the user's brief
explicitly requires a documented exception (§11).

- [ ] Layout spacing uses whole `--unit` increments; fine details and text
      line boxes use whole `--pixel` increments. Sprite scale is an integer.
- [ ] Total palette ≤ 32 unique opaque colors; ≤ 8 ramps; one shared
      four-step neutral ramp. Token aliases count once.
- [ ] Every sprite uses `image-rendering: pixelated` (or `crisp-edges`).
- [ ] All sprites render at the same scale (no mixed LODs).
- [ ] Buttons use raised bevels at rest and pressed bevels while active;
      shadows use the matching offset token and zero blur.
- [ ] No `transition-duration` longer than 0 between visual states.
- [ ] Every animation is a discrete frame swap, never a tween.
- [ ] Body text contrast ≥ 4.5:1; large text ≥ 3:1.
- [ ] Hover state has a focus equivalent.
- [ ] `_trash` artifacts are not present (use `trash` only).

---

## 9 · Deliverable shape

The output of this SOP is a single folder:

```
my-pixel-site/
├── index.html          # uses the tokens from §3
├── tokens.css          # the variables from §3
├── components.css      # the eight primitives from §4
├── sprites/            # PNG source sheets; integer scaling happens in CSS
│   ├── hero-sheet.png
│   └── buttons-sheet.png
├── fonts/              # pixel font(s) used
└── README.md           # the archetype family picked, the four sliders, the palette
```

`README.md` must record: archetype family, the four slider values, layout and
detail grids, palette swatches and unique count, source tile size, sprite
scale, and any deviations from the defaults and why.

---

## 10 · Working with user assets

If the user brings a Y2KDiary / pixel-art asset folder (e.g.
`Pictures/y2k-diary-assets/`), the SOP respects the existing decisions:

- Their existing icon files override `4.1 SpriteFrame`.
- Their `textures/*.png` sheets become the source of truth for bevels.
- Their `references/` JSON / JPEG boards are the new archetype picker.
- Never re-generate stripes / dot patterns that already exist on disk.

---

## 11 · Anti-patterns

Avoid these by default to preserve the pixel-art grammar. If the user
explicitly chooses an exception, explain the visual tradeoff and record it
in the deliverable README; the user's brief takes precedence.

1. **Gradient fills** (any continuous color tool).
2. **Drop shadows with blur** > 0px (use solid shadows with the raised or
   pressed offset token).
3. **Border-radius** > 0 on anything other than sprite content (corners
   must be 0 or a step).
4. **Mixing pixel font with a system font** — pick one family.
5. **Anti-aliased icon sets** imported into a pixel page.
6. **Vector icons at fractional scales** — crisp SVG sprites are allowed
   at integer coordinates and integer scales (Appendix B).
7. **CSS transitions on opacity** for hover/active states — they read as
   web-native, not pixel.
8. **Smooth glossy panel shading** — simple raised/pressed pixel bevels
   are the supported depth cue.
9. **Photography as accent** — photography belongs in a full-photo style.
   Mixed-media disables the pixel grammar.

---

## 12 · When the brief is *not* pixel art

If the user wants:
- **Y2K without pixel grid** → use the `taste` skill; this SOP ends.
- **Retro 90s web (Mosaic / table layouts)** → use the `taste` skill.
- **Flat modern web** → use the `taste` skill.
- **3D / VR / AR** → use the `taste` skill.

The pixel-art medium is a *contract with the eye*. If the user only wants
"retro vibes" without committing to the grid, the result will be a forgery
and the SOP should not be applied.

---

## Appendix A · Calibration families (for choosing a base)

Four families are used internally to calibrate the grid / banding / palette
ceilings documented in §2. They are referenced here only as *families* —
the SOP does not ship any image assets, source URLs, or attribution for
them. When picking a family for a brief, choose by description, not by
brand.

- **A · character MV** — Vocaloid-pipeline character art, 2-tone shading,
  dot-noise clouds. Reach for this when the brief is a single character,
  MV, or emotional scene.
- **B · agrarian tile** — 16×16 tile, 4-tone shading, uniform outline.
  Reach for this when the brief is a farm / town / cozy commercial UI.
- **C · cinematic HD-2D** — 32×32 sprite, 5-tone, dynamic 3-point light.
  Reach for this when the brief is dramatic / narrative / cinematic.
- **D · modern soft** — 32×32, 4-tone, soft saturation, atmospheric bloom.
  Reach for this when the brief is modern web / product / app shell.

## Appendix B · Why this SOP works on the web

The web is a hostile medium for pixel art: sub-pixel rendering, fractional
scaling, high DPI displays, font hinting. The SOP survives because:

1. `image-rendering: pixelated` disables browser bilinear when the user
   allows it. Always set it.
2. CSS `pixel` units snap to device pixels at integer scales.
3. `crisp-edges` is the fallback for browsers that ignore `pixelated`.
4. SVG can be used in place of bitmap sprites but only with `shape-rendering:
   crispEdges` and only at integer coordinates.
5. Variable fonts can keep pixel hints by using `font-smooth: never` and
   `font-variant-ligatures: none`.
