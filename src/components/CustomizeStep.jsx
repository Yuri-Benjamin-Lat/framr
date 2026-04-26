import { FILTERS, FRAME_COLORS } from '../data/formats'

function PrintPreview({ format, photos, filter, frameColor }) {
  const fi = filter.css === 'none' ? undefined : filter.css
  const bg = frameColor.value
  const imgStyle = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
  const filterStyle = fi ? { filter: fi } : {}

  const shadow = '0 8px 32px rgba(0,0,0,0.15)'

  const slot = (src, w, h, i) => (
    <div key={i} style={{ width: w, height: h, overflow: 'hidden', ...filterStyle, flexShrink: 0 }}>
      <img src={src} alt="" style={imgStyle} />
    </div>
  )

  let preview = null
  switch (format.layout) {
    case 'polaroid':
      preview = (
        <div style={{ background: bg, padding: '16px 16px 52px', boxShadow: shadow, display: 'inline-block' }}>
          {slot(photos[0], 240, 240, 0)}
        </div>
      )
      break
    case 'vertical-strip':
      preview = (
        <div style={{ background: bg, padding: 12, display: 'inline-flex', flexDirection: 'column', gap: 6, boxShadow: shadow }}>
          {photos.map((p, i) => slot(p, 210, 140, i))}
        </div>
      )
      break
    case 'landscape-sequence':
      preview = (
        <div style={{ background: bg, padding: 12, display: 'inline-flex', flexDirection: 'row', gap: 6, boxShadow: shadow }}>
          {photos.map((p, i) => slot(p, 160, 120, i))}
        </div>
      )
      break
    case 'modern-grid':
      preview = (
        <div style={{ background: bg, padding: 12, display: 'inline-grid', gridTemplateColumns: '1fr 1fr', gap: 6, boxShadow: shadow }}>
          {photos.map((p, i) => slot(p, 160, 120, i))}
        </div>
      )
      break
    case 'mixed-narrative':
      preview = (
        <div style={{ background: bg, padding: 12, display: 'inline-flex', flexDirection: 'row', gap: 6, boxShadow: shadow }}>
          {slot(photos[0], 200, 210, 0)}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {photos.slice(1).map((p, i) => slot(p, 100, 64, i + 1))}
          </div>
        </div>
      )
      break
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-[#f5f0ea] p-8 overflow-auto">
      {preview}
    </div>
  )
}

export default function CustomizeStep({ format, photos, filter, frameColor, onFilterChange, onFrameColorChange, onNext, onBack }) {
  return (
    <div className="flex h-full">
      <PrintPreview format={format} photos={photos} filter={filter} frameColor={frameColor} />

      {/* Controls */}
      <div className="w-72 shrink-0 border-l border-[#e5e0d8] bg-white flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e5e0d8] shrink-0">
          <h2 className="font-semibold text-[#1a1614]">Customize</h2>
          <p className="text-sm text-[#7a6f68]">{format.name}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          {/* Filters */}
          <div>
            <p className="text-xs font-semibold text-[#7a6f68] uppercase tracking-wider mb-3">Filter</p>
            <div className="grid grid-cols-2 gap-2">
              {FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => onFilterChange(f)}
                  className={`rounded-lg overflow-hidden border-2 transition-all ${
                    filter.id === f.id ? 'border-[#8B3714]' : 'border-[#e5e0d8] hover:border-[#c5bfb8]'
                  }`}
                >
                  <div
                    style={{
                      height: 52,
                      background: '#2d3748',
                      filter: f.css === 'none' ? undefined : f.css,
                    }}
                  />
                  <p className={`text-xs py-1.5 text-center ${filter.id === f.id ? 'text-[#8B3714] font-medium' : 'text-[#7a6f68]'}`}>
                    {f.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Frame color */}
          <div>
            <p className="text-xs font-semibold text-[#7a6f68] uppercase tracking-wider mb-3">Frame Color</p>
            <div className="flex gap-2 flex-wrap">
              {FRAME_COLORS.map(fc => (
                <button
                  key={fc.id}
                  onClick={() => onFrameColorChange(fc)}
                  title={fc.label}
                  style={{ backgroundColor: fc.value }}
                  className={`w-9 h-9 rounded-full border-2 transition-all ${
                    frameColor.id === fc.id
                      ? 'border-[#8B3714] scale-110'
                      : 'border-[#e5e0d8] hover:border-[#c5bfb8]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 border-t border-[#e5e0d8] shrink-0 flex flex-col gap-2">
          <button
            onClick={onNext}
            className="w-full bg-[#8B3714] text-white py-2.5 rounded-lg font-medium hover:bg-[#732e10] transition-colors"
          >
            Continue →
          </button>
          <button
            onClick={onBack}
            className="w-full text-[#7a6f68] py-2 text-sm hover:text-[#1a1614] transition-colors"
          >
            ← Back to camera
          </button>
        </div>
      </div>
    </div>
  )
}