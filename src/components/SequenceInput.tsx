import { useState } from 'react'

interface Props {
  label: string
  value: string
  onChange: (val: string) => void
}

export function SequenceInput({ label, value, onChange }: Props) {
  const [error, setError] = useState('')

  function handle(raw: string) {
    const upper = raw.toUpperCase().replace(/\s/g, '')
    const invalid = upper.replace(/[ACGT]/g, '')
    setError(invalid.length ? `invalid characters: ${[...new Set(invalid)].join(' ')}` : '')
    onChange(upper)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
      <label style={{ fontSize: 12, color: '#888', fontFamily: 'monospace' }}>
        {label} <span style={{ color: '#555' }}>({value.length} bp)</span>
      </label>
      <textarea
        value={value}
        onChange={e => handle(e.target.value)}
        spellCheck={false}
        rows={4}
        style={{
          fontFamily: 'monospace',
          fontSize: 12,
          background: '#0e0e14',
          color: error ? '#f87171' : '#e2e8f0',
          border: `1px solid ${error ? '#7f1d1d' : '#2a2a3a'}`,
          borderRadius: 6,
          padding: '8px 10px',
          resize: 'vertical',
          outline: 'none',
        }}
      />
      {error && <span style={{ fontSize: 11, color: '#f87171', fontFamily: 'monospace' }}>{error}</span>}
    </div>
  )
}
