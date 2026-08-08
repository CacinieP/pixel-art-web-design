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
    inset  2px  2px 0 0 var(--paper-soft),
    inset -2px -2px 0 0 var(--ink),
                  4px 4px 0 0 var(--shadow);
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
    inset  2px  2px 0 0 var(--ink),
    inset -2px -2px 0 0 var(--paper-soft),
                  2px 2px 0 0 var(--shadow);
}
```

## Rules

- Always 2px bevel offset (must equal `--unit / 2`).
- Always 4px drop shadow (must equal `--unit`).
- Never use `border-radius` to soften the bevel.
- Never use `transition` between raised and pressed.
- The shadow stays the same color (`--shadow`); never pure black.

## Inset vs outset

For a *window* (raised frame on top of paper bg), use raised.
For a *pill* (UI affordance sitting on a colored bg), use raised.
For a *button that has been clicked*, use pressed.

The bevel is the entire vocabulary. Do not invent a third state.
