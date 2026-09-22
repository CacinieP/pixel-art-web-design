# Bevel System Reference

The pixel-art bevel is what makes a 2D box read as a 3D object without
breaking the medium. Two-state only: **raised** (default) and **pressed**.

## Raised (default)

```
┌──────────┐  ← inset white/light inner edge
│          │
│  button  │
│          │
└──────────┘  ← outer dark border
```

CSS:
```css
.bevel-raised {
  box-shadow:
    var(--bevel-raised),
    var(--shadow-raised) var(--shadow-raised) 0 0 var(--shadow);
}
```

## Pressed (active)

```
┌──────────┐  ← inset dark inner edge
│          │
│  button  │
│          │
└──────────┘  ← outer dark border
```

CSS:
```css
.bevel-pressed {
  box-shadow:
    var(--bevel-pressed),
    var(--shadow-pressed) var(--shadow-pressed) 0 0 var(--shadow);
}
```

## Rules

- Use the tokens defined in `SKILL.md` §3; these classes do not redefine them.
- Bevel offset = two detail pixels (2px with the default `--pixel: 1px`).
- Raised shadow offset = one layout unit; pressed offset = half a layout
  unit (4px and 2px with the default `--unit: 4px`). Both have zero blur.
- An active button moves down/right by `--press-offset` (raised minus
  pressed shadow offset, default 2px). This keeps its shadow anchored.
- Never use `border-radius` to soften the bevel.
- Never use `transition` between raised and pressed.
- The shadow stays the same opaque palette color (`--shadow`, alias of
  `--ink-soft` by default).

## Inset vs outset

For a *window* (raised frame on top of paper bg), use raised.
For a *pill* (UI affordance sitting on a colored bg), use raised.
For a *button that has been clicked*, use pressed.

These are the two depth states. Hover and focus may change the outline
without introducing another bevel state.
