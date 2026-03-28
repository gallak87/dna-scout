import { useEffect, useState } from 'react'
import init, { compute_dotplot } from './wasm/pkg/dna_scout_wasm.js'
import { DotPlot } from './components/DotPlot'

const SEQ_A = 'ACGTACGTACGT'
const SEQ_B = 'ACGTTTTTACGT'
const WINDOW = 4
const THRESHOLD = 3

function App() {
  const [matrix, setMatrix] = useState<Uint8Array>(new Uint8Array())

  useEffect(() => {
    init().then(() => {
      setMatrix(compute_dotplot(SEQ_A, SEQ_B, WINDOW, THRESHOLD))
    })
  }, [])

  return (
    <div style={{ fontFamily: 'monospace', padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ margin: 0 }}>dna-scout</h2>
      <div style={{ color: '#888', fontSize: 13 }}>
        seqA: {SEQ_A} &nbsp;|&nbsp; seqB: {SEQ_B} &nbsp;|&nbsp; window={WINDOW} threshold={THRESHOLD}
      </div>
      {matrix.length > 0 && (
        <DotPlot matrix={matrix} seqA={SEQ_A} seqB={SEQ_B} />
      )}
      <div style={{ color: '#555', fontSize: 12 }}>scroll to zoom · drag to pan · hover for details</div>
    </div>
  )
}

export default App
