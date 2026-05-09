import { useState, useRef, useEffect } from 'react'
import { FILTERS, FRAME_COLORS, FRAME_STYLES } from '../data/formats'

function StyleIcon({ id, active }) {
  const stroke = active ? '#8B3714' : '#7a6f68'
  const w = 44, h = 34, r = 6
  if (id === 'square')
    return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}><rect x="2" y="2" width={w-4} height={h-4} fill="none" stroke={stroke} strokeWidth="2"/></svg>
  if (id === 'rounded')
    return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}><rect x="2" y="2" width={w-4} height={h-4} rx={r} ry={r} fill="none" stroke={stroke} strokeWidth="2"/></svg>
  return null
}

function frameClipStyle(styleId) {
  if (styleId === 'rounded') return { borderRadius: '5%' }
  return {}
}

function PrintPreview({ format, photos, filter, frameColor, frameStyle, onPhotosChange }) {
  const [dragIdx, setDragIdx] = useState(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [panning, setPanning] = useState(false)
  const containerRef = useRef(null)
  const contentRef = useRef(null)
  const scaleRef = useRef(1)
  const offsetRef = useRef({ x: 0, y: 0 })
  const panStart = useRef(null)
  const pinchRef = useRef(null)

  const fi = filter.css === 'none' ? undefined : filter.css
  const bg = frameColor.value
  const shadow = '0 8px 40px rgba(0,0,0,0.18)'
  const canDrag = photos.length > 1

  function pushTransform(s, o) {
    scaleRef.current = s
    offsetRef.current = o
    setScale(s)
    setOffset(o)
  }

  function maxOff(s) {
    const c = containerRef.current, e = contentRef.current
    if (!c || !e) return { x: 0, y: 0 }
    return {
      x: Math.abs(e.offsetWidth * s - c.offsetWidth) / 2,
      y: Math.abs(e.offsetHeight * s - c.offsetHeight) / 2,
    }
  }

  function clampOff(x, y, s) {
    const m = maxOff(s)
    return { x: Math.min(Math.max(x, -m.x), m.x), y: Math.min(Math.max(y, -m.y), m.y) }
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function onWheel(e) {
      e.preventDefault()
      const next = Math.min(Math.max(scaleRef.current * (e.deltaY < 0 ? 1.05 : 1 / 1.05), 0.25), 4)
      pushTransform(next, clampOff(offsetRef.current.x, offsetRef.current.y, next))
    }

    function onTouchStart(e) {
      if (e.touches.length === 2) {
        pinchRef.current = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
      }
    }

    function onTouchMove(e) {
      if (e.touches.length !== 2 || pinchRef.current === null) return
      e.preventDefault()
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
      const next = Math.min(Math.max(scaleRef.current * (dist / pinchRef.current), 0.25), 4)
      pinchRef.current = dist
      pushTransform(next, clampOff(offsetRef.current.x, offsetRef.current.y, next))
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  function handlePointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId)
    panStart.current = { x: e.clientX - offsetRef.current.x, y: e.clientY - offsetRef.current.y }
    setPanning(true)
  }

  function handlePointerMove(e) {
    if (!panStart.current) return
    pushTransform(scaleRef.current, clampOff(e.clientX - panStart.current.x, e.clientY - panStart.current.y, scaleRef.current))
  }

  function handlePointerUp() { panStart.current = null; setPanning(false) }

  function resetZoom() { pushTransform(1, { x: 0, y: 0 }) }

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
        draggable={canDrag && scale === 1}
        onDragStart={canDrag && scale === 1 ? () => handleDragStart(i) : undefined}
        onDragOver={canDrag && scale === 1 ? e => e.preventDefault() : undefined}
        onDrop={canDrag && scale === 1 ? () => handleDrop(i) : undefined}
        style={{
          width: w, height: h, overflow: 'hidden', filter: fi, flexShrink: 0,
          opacity: dragIdx === i ? 0.45 : 1,
          transition: 'opacity 0.15s',
          outline: dragIdx !== null && dragIdx !== i ? '2px dashed rgba(139,55,20,0.4)' : 'none',
        }}
      >
        <img src={src} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', userSelect: 'none' }} />
      </div>
    )
  }

  const clip = frameClipStyle(frameStyle.id)
  let preview = null
  switch (format.layout) {
    case 'polaroid':
      preview = <div style={{ background: bg, padding: '22px 22px 68px', boxShadow: shadow, display: 'inline-block', ...clip }}>{slot(photos[0], 340, 340, 0)}</div>
      break
    case 'vertical-strip':
      preview = <div style={{ background: bg, padding: '16px 16px 50px', display: 'inline-flex', flexDirection: 'column', gap: 8, boxShadow: shadow, ...clip }}>{photos.map((p, i) => slot(p, 300, 200, i))}</div>
      break
    case 'landscape-sequence':
      preview = <div style={{ background: bg, padding: '16px 16px 32px', display: 'inline-flex', flexDirection: 'row', gap: 8, boxShadow: shadow, ...clip }}>{photos.map((p, i) => slot(p, 210, 158, i))}</div>
      break
    case 'modern-grid':
      preview = <div style={{ background: bg, padding: '16px 16px 50px', display: 'inline-grid', gridTemplateColumns: '1fr 1fr', gap: 8, boxShadow: shadow, ...clip }}>{photos.map((p, i) => slot(p, 210, 158, i))}</div>
      break
    case 'mixed-narrative': {
      const topW = 500, topH = Math.round(topW * 9 / 16), gap = 8
      const bottomW = Math.round((topW - gap * 2) / 3), bottomH = Math.round(bottomW * 3 / 4)
      preview = (
        <div style={{ background: bg, padding: '16px 16px 50px', display: 'inline-flex', flexDirection: 'column', gap: 8, boxShadow: shadow, ...clip }}>
          {slot(photos[0], topW, topH, 0)}
          <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>{photos.slice(1).map((p, i) => slot(p, bottomW, bottomH, i + 1))}</div>
        </div>
      )
      break
    }
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center bg-[#f5f0ea] dark:bg-[#191210] overflow-hidden relative select-none"
      style={{ cursor: panning ? 'grabbing' : 'grab' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        ref={contentRef}
        style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, transformOrigin: 'center center', willChange: 'transform' }}
      >
        {preview}
      </div>
      {scale !== 1 && (
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 pointer-events-auto">
          <span className="text-[10px] bg-black/30 text-white px-2 py-1 rounded-full">
            {scale >= 1 ? Math.round(scale * 100) : Math.round((scale - 1) * 100)}%
          </span>
          <button onPointerDown={e => e.stopPropagation()} onClick={resetZoom} className="text-[10px] bg-black/30 hover:bg-black/50 text-white px-2 py-1 rounded-full transition-colors">Reset</button>
        </div>
      )}
    </div>
  )
}

export default function CustomizeStep({
  format, photos, filter, frameColor, frameStyle,
  onFilterChange, onFrameColorChange, onFrameStyleChange, onPhotosChange,
  onNext, onBack,
}) {
  const [showBackModal, setShowBackModal] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [frameOpen, setFrameOpen] = useState(false)
  const [styleOpen, setStyleOpen] = useState(false)

  const customizeControls = (
    <div className="flex flex-col gap-3">
      {format.photoCount > 1 && (
        <p className="text-xs text-[#7a6f68] dark:text-[#8c7e78]">Drag photos in the preview to reorder them.</p>
      )}
      <div className="border border-[#e5e0d8] dark:border-[#3d2f2b] rounded-xl overflow-hidden">
        <button
          onClick={() => setFilterOpen(o => !o)}
          className="w-full flex items-center px-4 py-3 bg-[#faf8f5] dark:bg-[#1e1714] hover:bg-[#f5f0ea] dark:hover:bg-[#251e1b] transition-colors"
        >
          <div className="flex items-center justify-between flex-1 mr-2">
            <span className="text-xs font-semibold text-[#7a6f68] dark:text-[#8c7e78] uppercase tracking-wider">Filter</span>
            <span className="text-xs text-[#8B3714] dark:text-[#c4643a]">{filter.name}</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`text-[#7a6f68] dark:text-[#8c7e78] transition-transform ${filterOpen ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6"/></svg>
        </button>
        {filterOpen && (
          <div className="p-3 border-t border-[#e5e0d8] dark:border-[#3d2f2b] grid grid-cols-2 gap-2">
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => onFilterChange(f)}
                className={`rounded-lg overflow-hidden border-2 transition-all ${
                  filter.id === f.id
                    ? 'border-[#8B3714]'
                    : 'border-[#e5e0d8] dark:border-[#3d2f2b] hover:border-[#c5bfb8] dark:hover:border-[#5a4a46]'
                }`}
              >
                <div style={{ height: 52, background: '#2d3748', filter: f.css === 'none' ? undefined : f.css }} />
                <p className={`text-xs py-1.5 text-center bg-white dark:bg-[#221a18] ${filter.id === f.id ? 'text-[#8B3714] dark:text-[#c4643a] font-medium' : 'text-[#7a6f68] dark:text-[#8c7e78]'}`}>
                  {f.name}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border border-[#e5e0d8] dark:border-[#3d2f2b] rounded-xl overflow-hidden">
        <button
          onClick={() => setFrameOpen(o => !o)}
          className="w-full flex items-center px-4 py-3 bg-[#faf8f5] dark:bg-[#1e1714] hover:bg-[#f5f0ea] dark:hover:bg-[#251e1b] transition-colors"
        >
          <div className="flex items-center justify-between flex-1 mr-2">
            <span className="text-xs font-semibold text-[#7a6f68] dark:text-[#8c7e78] uppercase tracking-wider">Frame Color</span>
            <span className="w-3 h-3 rounded-full border border-black/10 inline-block" style={{ backgroundColor: frameColor.value }} />
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`text-[#7a6f68] dark:text-[#8c7e78] transition-transform ${frameOpen ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6"/></svg>
        </button>
        {frameOpen && (
          <div className="p-3 border-t border-[#e5e0d8] dark:border-[#3d2f2b] flex gap-2 flex-wrap">
            {FRAME_COLORS.map(fc => (
              <button
                key={fc.id}
                onClick={() => onFrameColorChange(fc)}
                title={fc.label}
                style={{ backgroundColor: fc.value }}
                className={`w-9 h-9 rounded-full border-2 transition-all ${
                  frameColor.id === fc.id ? 'border-[#8B3714] scale-110' : 'border-[#e5e0d8] dark:border-[#3d2f2b] hover:border-[#c5bfb8]'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="border border-[#e5e0d8] dark:border-[#3d2f2b] rounded-xl overflow-hidden">
        <button
          onClick={() => setStyleOpen(o => !o)}
          className="w-full flex items-center px-4 py-3 bg-[#faf8f5] dark:bg-[#1e1714] hover:bg-[#f5f0ea] dark:hover:bg-[#251e1b] transition-colors"
        >
          <div className="flex items-center justify-between flex-1 mr-2">
            <span className="text-xs font-semibold text-[#7a6f68] dark:text-[#8c7e78] uppercase tracking-wider">Frame Style</span>
            <span className="text-xs text-[#8B3714] dark:text-[#c4643a]">{frameStyle.name}</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`text-[#7a6f68] dark:text-[#8c7e78] transition-transform ${styleOpen ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6"/></svg>
        </button>
        {styleOpen && (
          <div className="p-3 border-t border-[#e5e0d8] dark:border-[#3d2f2b] grid grid-cols-2 gap-2">
            {FRAME_STYLES.map(fs => (
              <button
                key={fs.id}
                onClick={() => onFrameStyleChange(fs)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
                  frameStyle.id === fs.id
                    ? 'border-[#8B3714] bg-[#fdf5f0] dark:bg-[#2a1a14]'
                    : 'border-[#e5e0d8] dark:border-[#3d2f2b] hover:border-[#c5bfb8] dark:hover:border-[#5a4a46]'
                }`}
              >
                <StyleIcon id={fs.id} active={frameStyle.id === fs.id} />
                <span className={`text-xs ${frameStyle.id === fs.id ? 'text-[#8B3714] dark:text-[#c4643a] font-medium' : 'text-[#7a6f68] dark:text-[#8c7e78]'}`}>{fs.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-full relative">

      {/* ── Mobile layout ── */}
      <div className="flex flex-col h-full w-full md:hidden">
        <div className="h-14 flex items-center justify-between px-4 border-b border-[#e5e0d8] dark:border-[#3d2f2b] bg-white dark:bg-[#221a18] shrink-0">
          <button onClick={() => setShowBackModal(true)} className="flex items-center gap-1.5 text-sm text-[#7a6f68] dark:text-[#8c7e78] hover:text-[#1a1614] dark:hover:text-[#ede8e0] transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </button>
          <span className="font-medium text-[#1a1614] dark:text-[#ede8e0] text-sm">{format.name}</span>
          <button onClick={onNext} className="bg-[#8B3714] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#732e10] transition-colors">
            Continue →
          </button>
        </div>

        <PrintPreview format={format} photos={photos} filter={filter} frameColor={frameColor} frameStyle={frameStyle} onPhotosChange={onPhotosChange} />

        <div className="shrink-0 bg-white dark:bg-[#221a18] border-t border-[#e5e0d8] dark:border-[#3d2f2b] px-4 py-3">
          <button
            onClick={() => setSheetOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#e5e0d8] dark:border-[#3d2f2b] text-[#1a1614] dark:text-[#ede8e0] font-medium text-sm hover:border-[#8B3714] hover:text-[#8B3714] dark:hover:border-[#8B3714] dark:hover:text-[#c4643a] transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V4M5 11l7-7 7 7"/></svg>
            Filters &amp; Frame
          </button>
        </div>
      </div>

      {/* ── Desktop/tablet layout ── */}
      <div className="hidden md:flex h-full w-full">
        <PrintPreview format={format} photos={photos} filter={filter} frameColor={frameColor} frameStyle={frameStyle} onPhotosChange={onPhotosChange} />

        <div className="w-72 shrink-0 border-l border-[#e5e0d8] dark:border-[#3d2f2b] bg-white dark:bg-[#221a18] flex flex-col overflow-hidden">
          <div className="h-16 px-5 border-b border-[#e5e0d8] dark:border-[#3d2f2b] flex items-center shrink-0">
            <div>
              <h2 className="font-semibold text-[#1a1614] dark:text-[#ede8e0] leading-none">Customize</h2>
              <p className="text-xs text-[#7a6f68] dark:text-[#8c7e78] mt-0.5">{format.name}</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2.5 pb-2.5 pt-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#d5cfc8] dark:[&::-webkit-scrollbar-thumb]:bg-[#3d2f2b] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-[#8B3714] dark:[&::-webkit-scrollbar-thumb]:hover:bg-[#8B3714]">{customizeControls}</div>
          <div className="p-5 border-t border-[#e5e0d8] dark:border-[#3d2f2b] shrink-0 flex flex-col gap-2">
            <button onClick={onNext} className="w-full bg-[#8B3714] text-white py-2.5 rounded-lg font-medium hover:bg-[#732e10] transition-colors">
              Continue →
            </button>
            <button onClick={() => setShowBackModal(true)} className="w-full text-[#7a6f68] dark:text-[#8c7e78] py-2 text-sm hover:text-[#1a1614] dark:hover:text-[#ede8e0] transition-colors">
              ← Back to camera
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile bottom sheet ── */}
      {sheetOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheetOpen(false)} />
          <div className="relative bg-white dark:bg-[#221a18] rounded-t-2xl max-h-[78vh] flex flex-col">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#d5cfc8] dark:bg-[#4a3a36]" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#e5e0d8] dark:border-[#3d2f2b]">
              <h2 className="font-semibold text-[#1a1614] dark:text-[#ede8e0]">Customize</h2>
              <button onClick={() => setSheetOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f0ece6] dark:bg-[#2c2220] text-[#7a6f68] dark:text-[#8c7e78] hover:bg-[#e5e0d8] dark:hover:bg-[#352825] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-2.5 pb-2.5 pt-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#d5cfc8] dark:[&::-webkit-scrollbar-thumb]:bg-[#3d2f2b] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-[#8B3714] dark:[&::-webkit-scrollbar-thumb]:hover:bg-[#8B3714]">{customizeControls}</div>
            <div className="p-4 border-t border-[#e5e0d8] dark:border-[#3d2f2b] flex gap-3">
              <button onClick={() => { setSheetOpen(false); setShowBackModal(true) }} className="flex-1 border border-[#e5e0d8] dark:border-[#3d2f2b] text-[#1a1614] dark:text-[#ede8e0] py-2.5 rounded-lg font-medium text-sm hover:bg-[#f5f0ea] dark:hover:bg-[#2c2220] transition-colors">
                ← Camera
              </button>
              <button onClick={() => { setSheetOpen(false); onNext() }} className="flex-1 bg-[#8B3714] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#732e10] transition-colors">
                Continue →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Back confirmation modal ── */}
      {showBackModal && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#221a18] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-semibold text-[#1a1614] dark:text-[#ede8e0] text-lg mb-2">Go back to camera?</h3>
            <p className="text-sm text-[#7a6f68] dark:text-[#8c7e78] mb-6">Your captured photos will be cleared and you'll need to retake them from scratch.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowBackModal(false)} className="flex-1 border border-[#e5e0d8] dark:border-[#3d2f2b] text-[#1a1614] dark:text-[#ede8e0] py-2.5 rounded-lg font-medium hover:bg-[#f5f0ea] dark:hover:bg-[#2c2220] transition-colors text-sm">
                Stay here
              </button>
              <button onClick={() => { setShowBackModal(false); onBack() }} className="flex-1 bg-[#8B3714] text-white py-2.5 rounded-lg font-medium hover:bg-[#732e10] transition-colors text-sm">
                Yes, go back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}