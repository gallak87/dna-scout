import { useEffect, useState } from 'react'
import init, { compute_dotplot } from './wasm/pkg/dna_scout_wasm.js'

function App() {
  const [result, setResult] = useState<string>('loading wasm...')

  useEffect(() => {
    async function smokeTest() {
      await init()

      const seqA = 'ACGTACGTACGT'
      const seqB = 'ACGTTTTTACGT'
      const window = 4
      const threshold = 3

      const matrix = compute_dotplot(seqA, seqB, window, threshold)

      console.log('compute_dotplot output:', matrix)
      console.log('length:', matrix.length, '(expected', seqA.length * seqB.length, ')')

      // pretty-print as a grid
      const rows = []
      for (let i = 0; i < seqA.length; i++) {
        let row = ''
        for (let j = 0; j < seqB.length; j++) {
          row += matrix[i * seqB.length + j] ? '█' : '·'
        }
        rows.push(row)
      }

      setResult(rows.join('\n'))
    }

    smokeTest().catch((e) => setResult(`error: ${e}`))
  }, [])

  return (
    <div style={{ fontFamily: 'monospace', padding: 32 }}>
      <h2>dna-scout — WASM smoke test</h2>
      <p>seqA: ACGTACGTACGT</p>
      <p>seqB: ACGTTTTTACGT</p>
      <p>window=4, threshold=3</p>
      <pre style={{ fontSize: 20, lineHeight: 1.2 }}>{result}</pre>
    </div>
  )
}

export default App
