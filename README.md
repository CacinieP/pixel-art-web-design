# Pixel-Art Web Design SOP

A reusable SOP that turns a brief into a pixel-art webpage where every
visible element is mutually consistent. Ship-ready design tokens, eight
component primitives, motion grammar, accessibility rules, and a validation
checklist.

## What's in the box

- [`SKILL.md`](./SKILL.md) — the full 12-step SOP. This is the entry point.
- [`references/bevel-system.md`](./references/bevel-system.md) — raised /
  pressed bevel primitives that make 2D boxes read as 3D without breaking
  the medium.
- [`references/palette-construction.md`](./references/palette-construction.md)
  — ramp anatomy, three preset palettes (warm agrarian / cinematic HD-2D /
  casual character), and a 32-color ceiling rule.

## What's *not* in the box

- No image assets. The SOP is language-only; sprites are produced or
  sourced by the consumer.
- No third-party attribution. The four calibration families referenced in
  `SKILL.md` Appendix A are described by their own characteristics and not
  by any external brand, URL, or filename.
- No runtime / framework dependency. The CSS tokens and component patterns
  are plain HTML + CSS; drop them into any stack.

## Six first principles

1. **Discretization** — every measurement is a multiple of one unit.
2. **Restriction** — a small palette commits each color.
3. **Indexing** — once picked, colors are referenced by index only.
4. **Stacking** — shading is band-limited, not continuous.
5. **Activation** — motion is a frame swap, never a tween.
6. **Objectivity** — icons read at 16×16 before any detail is added.

## License

MIT. Use, fork, redistribute.
