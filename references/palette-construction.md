# Palette Construction Reference

A ramp is the atomic unit of a pixel-art palette. Every principled palette
is a small set of ramps plus one shared grey.

## Anatomy of a ramp

A 4-step ramp:

```
ramp-1  lightest  — sky / hair highlight / UI glow
ramp-2  base      — main fill
ramp-3  shadow    — fold / underside
ramp-4  deepest   — outline / silhouette (darker than the fills)
```

A 5-step ramp adds a specular highlight lighter than ramp-1.

## Four-step neutral ramp (shared by all)

```
ink        #1a1a2e   outline
ink-soft   #3a3a55   dark detail
paper      #f4f1e8   base background
paper-soft #e8e2d0   secondary fill
```

## Building a palette

1. Choose the page's maximum shading-band count within the family's range.
   Simple materials may use fewer bands than the budget allows.
2. Decide the scene's *mood* (warm / cool / mixed).
3. Pick one ramp per material (skin, grass, stone, sky, UI accent).
4. All ramps share the same four-step neutral ramp.
5. Aim for 8–24 unique opaque colors; richer family presets may use up to
   32. Count a reused color once, even when several tokens refer to it.
   Shadows also reuse the palette; avoid translucent overlays that introduce
   additional blended colors.

## Keeping the palette small

Reuse ramps in different *roles* rather than inventing new colors. If the
palette is approaching 32, reuse or simplify ramps before adding colors.
Document any user-requested exception to the ceiling in the deliverable README.

## Sample palette: "Family B · warm agrarian"

A 27-color starting palette for cozy / hand-drawn / tile-grid work.
The 28 listed entries share `#a06b3a` between wood and skin.

```
grey:    #1a1a2e #3a3a55 #f4f1e8 #e8e2d0
sky:     #a8d5e8 #6cb4d8 #3589b8 #1f5f8a
grass:   #8fce6b #5fa73e #2f6b22 #1a3a10
wood:    #d8a26e #a06b3a #653718 #3a1f0a
skin:    #f4d0a8 #d6a574 #a06b3a #4a2a14
accent:  #e85a4f #c93f3f #8a2424 #4a0a0a
gold:    #f7c948 #c89a2a #7d5f15 #3a2a05
total:   27 unique colors
```

Choose a smaller subset when targeting the usual 8–24-color budget.

## Sample palette: "Family C · cinematic HD-2D"

A 24-color palette for dramatic 3-point-lit work. Cooler greys, deeper
blacks, a magenta glow ramp for spell effects.

```
grey:    #13131f #2a2a3a #d8c8a8 #b8a888
sky:     #5a4a6a #3a2a4a #1f1530 #0a0815
gold:    #f7c948 #c89a2a #7d5f15 #3a2a05
accent:  #c93f3f #8a2424 #4a0a0a #200404
glow:    #ff8aff #c84ac8 #6a2a8a #2a0a4a
earth:   #8a6a4a #5a4020 #2a1a08 #100a04
total:   24
```

## Sample palette: "Family A · casual character"

A 16-color palette for single-character / MV-style art. Two mostly-pastel
ramps plus a sky ramp.

```
grey:    #1a1a2e #3a3a55 #f4f1e8 #e8e2d0
paper:   #f8c8c8 #f4a8a8 #d07070 #a04040
accent:  #5fa8c8 #3589b8 #1f5f8a #0a3050
skin:    #f4d0a8 #d6a574 #a06b3a #4a2a14
total:   16
```

## Sample palette: "Family D · modern soft"

A 20-color palette for product / app work. Reduced saturation, slight
warmth, mint greens, and a coral accent ramp.

```
grey:    #1f1f2e #3a3a4a #f0e8d8 #e0d4c0
sky:     #b8d8e8 #88b8c8 #5888a0 #305868
mint:    #c8e8d4 #94c8a8 #5a9878 #2a5840
accent:  #f0a08e #d87870 #a04030 #501a10
gold:    #f7c948 #c89a2a #7d5f15 #3a2a05
total:   20
```
