import { useEffect, useRef, useState } from 'react'

interface Props {
  matrix: Uint8Array
  seqA: string
  seqB: string
}

export function DotPlot({ matrix, seqA, seqB }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<{ i: number; j: number } | null>(null)

  // pan/zoom state
  const transform = useRef({ x: 0, y: 0, scale: 1 })
  const drag = useRef<{ startX: number; startY: number; tx: number; ty: number } | null>(null)

  const lenA = seqA.length
  const lenB = seqB.length

  // paint whenever matrix/dimensions change
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !matrix.length) return
    const ctx = canvas.getContext('2d')!

    const img = ctx.createImageData(lenB, lenA)
    for (let i = 0; i < lenA; i++) {
      for (let j = 0; j < lenB; j++) {
        const hit = matrix[i * lenB + j]
        const px = (i * lenB + j) * 4
        if (hit) {
          img.data[px] = 30; img.data[px+1] = 200; img.data[px+2] = 120 // green dot
        } else {
          img.data[px] = 18; img.data[px+1] = 18; img.data[px+2] = 24   // dark bg
        }
        img.data[px + 3] = 255
      }
    }
    ctx.putImageData(img, 0, 0)
  }, [matrix, lenA, lenB])

  // CSS transform for zoom/pan (applied to the canvas wrapper)
  const { x, y, scale } = transform.current

  function onWheel(e: React.WheelEvent) {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15
    transform.current.scale = Math.min(50, Math.max(0.5, transform.current.scale * factor))
    forceRepaint()
  }

  function onPointerDown(e: React.PointerEvent) {
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      tx: transform.current.x,
      ty: transform.current.y,
    }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (drag.current) {
      transform.current.x = drag.current.tx + (e.clientX - drag.current.startX)
      transform.current.y = drag.current.ty + (e.clientY - drag.current.startY)
      forceRepaint()
    }

    // hover: map screen coords → matrix cell
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const j = Math.floor((e.clientX - rect.left) / (rect.width / lenB))
    const i = Math.floor((e.clientY - rect.top) / (rect.height / lenA))
    if (i >= 0 && i < lenA && j >= 0 && j < lenB) {
      setHover({ i, j })
    }
  }

  function onPointerUp() { drag.current = null }

  // cheap repaint trigger
  const [, setTick] = useState(0)
  function forceRepaint() { setTick(t => t + 1) }

  const t = transform.current

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        ref={containerRef}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          overflow: 'hidden',
          width: 600,
          height: 600,
          background: '#121218',
          borderRadius: 8,
          cursor: drag.current ? 'grabbing' : 'crosshair',
          position: 'relative',
        }}
      >
        <div style={{
          position: 'absolute',
          transformOrigin: '0 0',
          transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})`,
          imageRendering: 'pixelated',
        }}>
          <canvas ref={canvasRef} width={lenB} height={lenA} />
        </div>
      </div>

      {hover && (
        <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#aaa' }}>
          A[{hover.i}]: <span style={{ color: '#fff' }}>{seqA.slice(hover.i, hover.i + 8)}</span>
          {'  '}
          B[{hover.j}]: <span style={{ color: '#fff' }}>{seqB.slice(hover.j, hover.j + 8)}</span>
          {'  '}
          {matrix[hover.i * lenB + hover.j] ? <span style={{ color: '#1ec878' }}>● match</span> : <span style={{ color: '#555' }}>○ no match</span>}
        </div>
      )}
    </div>
  )
}
