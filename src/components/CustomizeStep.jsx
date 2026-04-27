import { useState } from 'react'
import { FILTERS, FRAME_COLORS } from '../data/formats'

function PrintPreview({ format, photos, filter, frameColor, onPhotosChange }) {
  const [dragIdx, setDragIdx] = useState(null)

  const fi = filter.css === 'none' ? undefined : filter.css
  const bg = frameColor.value
  const shadow = '0 8px 40px rgba(0,0,0,0.18)'
  const canDrag = photos.length > 1

  function handleDragStart(i) { setDragIdx(i) }
  function handleDrop(i) {
    if (dragIdx === null || dragIdx === i) { setDragIdx(null); return }
    const next = [...photos]
    ;[next[dragIdx], next[i]] = [next[i], next[dragIdx]]
    onPhotosChange(next)
    setDragIdx(null)
  }

  function slot(src, w, h, i) {
    return (
      <div
        key={i}
        draggable={canDrag}
        onDragStart={canDrag ? () => handleDragStart(i) : undefined}
        onDragOver={canDrag ? e => e.preventDefault() : undefined}
        onDrop={canDrag ? () => handleDrop(i) : undefined}
        style={{
          width: w, height: h,
          overflow: 'hidden',
          filter: fi,
          flexShrink: 0,
          cursor: canDrag ? 'grab' : 'default',
          opacity: dragIdx === i ? 0.45 : 1,
          transition: 'opacity 0.15s',
          outline: dragIdx !== null && dragIdx !== i ? '2px dashed rgba(139,55,20,0.4)' : 'none',
        }}
      >
        <img
          src={src}
          alt=""
          draggable={false}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', userSelect: 'none' }}
        />
      </div>
    )
  }

  let preview = null
  switch (format.layout) {
    case 'polaroid':
      preview = (
        <div style={{ background: bg, padding: '22px 22px 68px', boxShadow: shadow, display: 'inline-block' }}>
          {slot(photos[0], 340, 340, 0)}
        </div>
      )
      break
    case 'vertical-strip':
      preview = (
        <div style={{ background: bg, padding: 16, display: 'inline-flex', flexDirection: 'column', gap: 8, boxShadow: shadow }}>
          {photos.map((p, i) => slot(p, 300, 200, i))}
        </div>
      )
      break
    case 'landscape-sequence':
      preview = (
        <div style={{ background: bg, padding: 16, display: 'inline-flex', flexDirection: 'row', gap: 8, boxShadow: shadow }}>
          {photos.map((p, i) => slot(p, 210, 158, i))}
        </div>
      )
      break
    case 'modern-grid':
      preview = (
        <div style={{ background: bg, padding: 16, display: 'inline-grid', gridTemplateColumns: '1fr 1fr', gap: 8, boxShadow: shadow }}>
          {photos.map((p, i) => slot(p, 210, 158, i))}
        </div>
      )
      break
    case 'mixed-narrative': {
      const topW = 500
      const topH = Math.round(topW * 9 / 16)
      const gap = 8
      const bottomW = Math.round((topW - gap * 2) / 3)
      const bottomH = Math.round(bottomW * 3 / 4)
      preview = (
        <div style={{ background: bg, padding: 16, display: 'inline-flex', flexDirection: 'column', gap: 8, boxShadow: shadow }}>
          {slot(photos[0], topW, topH, 0)}
          <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
            {photos.slice(1).map((p, i) => slot(p, bottomW, bottomH, i + 1))}
          </div>
        </div>
      )
      break
    }
  }

  return (
    <div className="flex-1 flex items-start md:items-center justify-center bg-[#f5f0ea] p-6 md:p-8 overflow-auto">
      {preview}
    </div>
  )
}

export default function CustomizeStep({
  format, photos, filter, frameColor,
  onFilterChange, onFrameColorChange, onPhotosChange,
  onNext, onBack,
}) {
  const [showBackModal, setShowBackModal] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Shared filter + frame controls — rendered in both mobile sheet and desktop panel
  const customizeControls = (
    <div className="flex flex-col gap-6">
      {format.photoCount > 1 && (
        <p className="text-xs text-[#7a6f68]">Drag photos in the preview to reorder them.</p>
      )}

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
              <div style={{ height: 52, background: '#2d3748', filter: f.css === 'none' ? undefined : f.css }} />
              <p className={`text-xs py-1.5 text-center ${filter.id === f.id ? 'text-[#8B3714] font-medium' : 'text-[#7a6f68]'}`}>
                {f.name}
              </p>
            </button>
          ))}
        </div>
      </div>

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
                frameColor.id === fc.id ? 'border-[#8B3714] scale-110' : 'border-[#e5e0d8] hover:border-[#c5bfb8]'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-full relative">

      {/* ── Mobile layout (< md) ── */}
      <div className="flex flex-col h-full w-full md:hidden">

        {/* Mobile top bar */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-[#e5e0d8] bg-white shrink-0">
          <button
            onClick={() => setShowBackModal(true)}
            className="flex items-center gap-1.5 text-sm text-[#7a6f68] hover:text-[#1a1614] transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          <span className="font-medium text-[#1a1614] text-sm">{format.name}</span>
          <button
            onClick={onNext}
            className="bg-[#8B3714] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#732e10] transition-colors"
          >
            Continue →
          </button>
        </div>

        {/* Preview */}
        <PrintPreview
          format={format}
          photos={photos}
          filter={filter}
          frameColor={frameColor}
          onPhotosChange={onPhotosChange}
        />

        {/* Open sheet button */}
        <div className="shrink-0 bg-white border-t border-[#e5e0d8] px-4 py-3">
          <button
            onClick={() => setSheetOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#e5e0d8] text-[#1a1614] font-medium text-sm hover:border-[#8B3714] hover:text-[#8B3714] transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20V4M5 11l7-7 7 7"/>
            </svg>
            Filters &amp; Frame Color
          </button>
        </div>
      </div>

      {/* ── Desktop/tablet layout (md+) ── */}
      <div className="hidden md:flex h-full w-full">
        <PrintPreview
          format={format}
          photos={photos}
          filter={filter}
          frameColor={frameColor}
          onPhotosChange={onPhotosChange}
        />

        <div className="w-72 shrink-0 border-l border-[#e5e0d8] bg-white flex flex-col overflow-hidden">
          <div className="h-16 px-5 border-b border-[#e5e0d8] flex items-center shrink-0">
            <div>
              <h2 className="font-semibold text-[#1a1614] leading-none">Customize</h2>
              <p className="text-xs text-[#7a6f68] mt-0.5">{format.name}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {customizeControls}
          </div>

          <div className="p-5 border-t border-[#e5e0d8] shrink-0 flex flex-col gap-2">
            <button
              onClick={onNext}
              className="w-full bg-[#8B3714] text-white py-2.5 rounded-lg font-medium hover:bg-[#732e10] transition-colors"
            >
              Continue →
            </button>
            <button
              onClick={() => setShowBackModal(true)}
              className="w-full text-[#7a6f68] py-2 text-sm hover:text-[#1a1614] transition-colors"
            >
              ← Back to camera
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile bottom sheet ── */}
      {sheetOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheetOpen(false)} />
          <div className="relative bg-white rounded-t-2xl max-h-[78vh] flex flex-col">
            {/* Sheet handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#d5cfc8]" />
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-b border-[#e5e0d8]">
              <h2 className="font-semibold text-[#1a1614]">Customize</h2>
              <button
                onClick={() => setSheetOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f0ece6] text-[#7a6f68] hover:bg-[#e5e0d8] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {customizeControls}
            </div>

            <div className="p-4 border-t border-[#e5e0d8] flex gap-3">
              <button
                onClick={() => { setSheetOpen(false); setShowBackModal(true) }}
                className="flex-1 border border-[#e5e0d8] text-[#1a1614] py-2.5 rounded-lg font-medium text-sm hover:bg-[#f5f0ea] transition-colors"
              >
                ← Camera
              </button>
              <button
                onClick={() => { setSheetOpen(false); onNext() }}
                className="flex-1 bg-[#8B3714] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#732e10] transition-colors"
              >
                Continue →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Back confirmation modal ── */}
      {showBackModal && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-semibold text-[#1a1614] text-lg mb-2">Go back to camera?</h3>
            <p className="text-sm text-[#7a6f68] mb-6">
              Your captured photos will be cleared and you'll need to retake them from scratch.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBackModal(false)}
                className="flex-1 border border-[#e5e0d8] text-[#1a1614] py-2.5 rounded-lg font-medium hover:bg-[#f5f0ea] transition-colors text-sm"
              >
                Stay here
              </button>
              <button
                onClick={() => { setShowBackModal(false); onBack() }}
                className="flex-1 bg-[#8B3714] text-white py-2.5 rounded-lg font-medium hover:bg-[#732e10] transition-colors text-sm"
              >
                Yes, go back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}