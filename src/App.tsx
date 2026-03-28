import { useEffect, useRef, useState } from 'react'
import init, { compute_dotplot } from './wasm/pkg/dna_scout_wasm.js'
import { DotPlot } from './components/DotPlot'
import { SequenceInput } from './components/SequenceInput'

const DEMO_A = 'ACGTACGTACGT'
const DEMO_B = 'ACGTTTTTACGT'

function Slider({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (n: number) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'monospace', fontSize: 13 }}>
      <span style={{ color: '#888', width: 80 }}>{label}</span>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: 120, accentColor: '#1ec878' }}
      />
      <span style={{ color: '#fff', width: 24 }}>{value}</span>
    </div>
  )
}

export default function App() {
  const [ready, setReady] = useState(false)
  const [seqA, setSeqA] = useState(DEMO_A)
  const [seqB, setSeqB] = useState(DEMO_B)
  const [window_, setWindow] = useState(4)
  const [threshold, setThreshold] = useState(3)
  const [matrix, setMatrix] = useState<Uint8Array>(new Uint8Array())
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { init().then(() => setReady(true)) }, [])

  useEffect(() => {
    if (!ready || !seqA || !seqB) return
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => {
      setMatrix(compute_dotplot(seqA, seqB, window_, Math.min(threshold, window_)))
    }, 150)
  }, [ready, seqA, seqB, window_, threshold])

  // clamp threshold when window shrinks
  const clampedThreshold = Math.min(threshold, window_)

  return (
    <div style={{
      fontFamily: 'monospace',
      padding: '24px 32px',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      maxWidth: 680,
      margin: '0 auto',
    }}>
      <h2 style={{ margin: 0, fontSize: 20, letterSpacing: 1 }}>dna-scout</h2>

      {/* sequence inputs */}
      <div style={{ display: 'flex', gap: 12 }}>
        <SequenceInput label="Sequence A" value={seqA} onChange={setSeqA} />
        <SequenceInput label="Sequence B" value={seqB} onChange={setSeqB} />
      </div>

      {/* sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Slider label="window" value={window_} min={1} max={50} onChange={setWindow} />
        <Slider label="threshold" value={clampedThreshold} min={1} max={window_} onChange={setThreshold} />
      </div>

      {/* plot */}
      {matrix.length > 0
        ? <DotPlot matrix={matrix} seqA={seqA} seqB={seqB} />
        : <div style={{ color: '#555', fontSize: 13 }}>{ready ? 'enter sequences above' : 'loading wasm…'}</div>
      }

      <div style={{ color: '#555', fontSize: 12 }}>scroll to zoom · drag to pan · hover for details</div>
    </div>
  )
}
