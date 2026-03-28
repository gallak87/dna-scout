# dna-scout

Interactive DNA sequence dot plot visualizer. Compare two DNA sequences and see their similarity patterns rendered as a 2D bitmap — powered by Rust/WASM for the compute and Canvas for the rendering.

## What is a dot plot?

A dot plot places a dot at grid position `[i, j]` when position `i` in sequence A is similar to position `j` in sequence B. The patterns that emerge reveal biological structure:

| Pattern | What it means |
|---|---|
| Main diagonal | The sequences are identical / highly similar |
| Off-diagonal parallel lines | Repeated regions (the same subsequence appears multiple times) |
| Blocks off the diagonal | Tandem repeats |
| Anti-diagonal lines | Palindromic sequences (reverse-complement matches) |
| Broken diagonal | Mutations between two variants of the same gene |

Sequences are compared using a **sliding window** to reduce noise: instead of matching single bases (which would produce a lot of random dots for A/T/C/G), a dot is placed only when at least `threshold` out of `window` consecutive bases match.

## Stack

- **Vite + React 19 + TypeScript** — UI
- **Rust → WASM** (via wasm-pack + wasm-bindgen) — O(n²) dot matrix computation
- **Canvas `putImageData`** — bitmap rendering (fast; no per-dot draw calls)

## Architecture

```
src/
  wasm/                   # Rust crate — compiled to WASM via wasm-pack
    src/lib.rs            # compute_dotplot(seq_a, seq_b, window, threshold) → Uint8Array
  components/
    SequenceInput.tsx     # two textarea inputs + window/threshold sliders
    DotPlot.tsx           # Canvas renderer — paints the Uint8Array
    HoverInfo.tsx         # tooltip: which positions are under the cursor
  App.tsx
vite.config.ts            # wasm-plugin + top-level-await configured
```

### Core function

```rust
compute_dotplot(seq_a, seq_b, window, threshold) -> Uint8Array
```

Returns a flat row-major byte array of length `len_a × len_b`. Value `255` = match, `0` = no match. Passed from WASM to JS as a view into WASM memory (no copy).

## Build phases

### Phase 1 — WASM core (scaffolded)
- [x] Vite + React + TS scaffold
- [x] Rust crate with `compute_dotplot` implementation
- [x] vite-plugin-wasm configured
- [ ] `wasm-pack build` wired into dev/build scripts
- [ ] Smoke test: call `compute_dotplot` from the browser

### Phase 2 — Canvas renderer
- [ ] `DotPlot.tsx` — allocate `ImageData`, write WASM output into RGBA buffer, call `putImageData`
- [ ] Zoom (scale the canvas transform) and pan (pointer drag)
- [ ] Axis labels (sequence position ticks)

### Phase 3 — React UI
- [ ] `SequenceInput.tsx` — two textareas, validate ACGT-only input
- [ ] Window size slider (1–50) and threshold slider (1–window)
- [ ] Recompute on change (debounced — don't thrash WASM on every keystroke)
- [ ] `HoverInfo.tsx` — show `i`, `j`, and the local subsequences on hover

### Phase 4 — Nice-to-haves
- [ ] Load sequences from FASTA files (drag-and-drop or file picker)
- [ ] Color by match quality (0–255 gradient instead of binary)
- [ ] Self-compare mode (same sequence on both axes — great for finding internal repeats)
- [ ] Web worker offload for sequences > ~50k bp

## What can you actually learn from this?

### Your maternal lineage haplogroup
Mitochondrial DNA is inherited unchanged from your mother, her mother, and so on. There are ~26 major haplogroups (L, H, U, J...) defined by specific variant positions in chrM. If you download your 23andMe raw data, extract your chrM sequence, and compare it against the reference (NC_012920.1, included in `src/demo/`) — every break in the main diagonal is a personal variant. The *pattern* of breaks maps to your haplogroup. You'd be seeing your deep maternal ancestry as broken diagonals.

### The D-loop — forensic DNA's favorite region
Self-compare chrM against itself. The genome will produce a solid main diagonal, but the **D-loop** (positions ~16024–576, the "control region") contains hypervariable tandem repeats — you'd see a distinctive blocky cluster there. This region is also what forensic DNA testing uses.

### Human vs Neanderthal — evolution as a visual
We have the Neanderthal mitochondrial genome sequenced from ancient bones. Compare it to modern human chrM and you get a mostly solid diagonal (~98% similar) with scattered breaks — the density of breaks encodes evolutionary distance. We diverged from Neanderthal chrM ~500k years ago. Add chimp and you can immediately see it's further away.

### Virus genome structure — SARS-CoV-2
Compare the COVID-19 genome (~30k bp) to itself. Coronaviruses have a frameshifting pseudoknot and internal repeat elements that show up as off-diagonal lines — functional structures the virus uses to replicate. You're seeing genome architecture directly.

### Ideas for making it more useful
- Click a dot → show the two subsequences side by side with mismatches highlighted
- Colored bands on axes marking known gene regions (D-loop, COX1, ND genes, etc.)
- Export differing positions as a list → paste into a haplogroup lookup tool
- Compare your 23andMe chrM extract to the reference for a personal "where do I differ" view

## Getting started

```bash
# Install JS deps
npm install

# Build the WASM module (requires Rust + wasm-pack)
cd src/wasm && wasm-pack build --target web --out-dir ../../public/wasm
cd ../..

# Start dev server
npm run dev
```

Install wasm-pack if needed: `cargo install wasm-pack`

## Performance notes

- The naive O(n²·W) algorithm is fine up to ~5k bp sequences in WASM
- For longer sequences, tile the computation and stream results to the canvas
- Never use `fillRect` in a loop to render — always `putImageData` on a pre-allocated buffer
