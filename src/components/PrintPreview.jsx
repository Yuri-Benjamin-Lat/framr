import { useState, useRef, useEffect } from 'react'

const STICKER_SIZE = 48

function StarSvg({ size }) {
  const cx = size / 2, cy = size / 2
  const outer = size * 0.45, inner = size * 0.19
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI) / 5 - Math.PI / 2
    const r = i % 2 === 0 ? outer : inner
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
  }).join(' ')
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <polygon points={pts} fill="#FFD700" />
    </svg>
  )
}

function frameClipStyle(styleId, overflow) {
  const s = styleId === 'rounded' ? { borderRadius: '5%' } : {}
  if (!overflow) s.overflow = 'hidden'
  return s
}

function getPreviewSlots(format) {
  switch (format.layout) {
    case 'polaroid':
      return { w: 384, h: 430, slots: [{ x: 22, y: 22, w: 340, h: 340 }] }
    case 'vertical-strip': {
      const ph = 200, gap = 8
      return { w: 332, h: 682, slots: [0,1,2].map(i => ({ x: 16, y: 16 + i*(ph+gap), w: 300, h: ph })) }
    }
    case 'landscape-sequence': {
      const pw = 210, gap = 8
      return { w: 678, h: 206, slots: [0,1,2].map(i => ({ x: 16 + i*(pw+gap), y: 16, w: pw, h: 158 })) }
    }
    case 'modern-grid': {
      const pw = 210, ph = 158, gap = 8
      return { w: 460, h: 390, slots: [0,1,2,3].map(i => ({ x: 16 + (i%2)*(pw+gap), y: 16 + Math.floor(i/2)*(ph+gap), w: pw, h: ph })) }
    }
    case 'mixed-narrative': {
      const topW = 500, gap = 8
      const topH = Math.round(topW * 9/16)
      const bottomW = Math.round((topW - gap*2) / 3)
      const bottomH = Math.round(bottomW * 3/4)
      const bottomY = 16 + topH + gap
      return {
        w: 532, h: 16 + topH + gap + bottomH + 50,
        slots: [
          { x: 16, y: 16, w: topW, h: topH },
          ...[0,1,2].map(i => ({ x: 16 + i*(bottomW+gap), y: bottomY, w: bottomW, h: bottomH }))
        ]
      }
    }
    default:
      return { w: 0, h: 0, slots: [] }
  }
}

export default function PrintPreview({ format, photos, filter, frameColor, frameStyle, onPhotosChange, layers = [], onLayersChange, selectedLayerId = null, onSelectLayer, stickerOverflow = false }) {
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
  const frameRef = useRef(null)
  const dragStickerRef = useRef(null)
  const isClickRef = useRef(false)

  const fi = filter.css === 'none' ? undefined : filter.css
  const bg = frameColor.value
  const shadow = '0 8px 40px rgba(0,0,0,0.18)'
  const canDrag = photos.length > 1
  const stickers = layers.filter(l => l.type !== 'photo' && l.type !== 'frame')
  const { w: fW, h: fH, slots: fSlots } = getPreviewSlots(format)

  function getZIndex(id) {
    const idx = layers.findIndex(l => l.id === id)
    return idx === -1 ? 1 : (layers.length - idx) * 10
  }

  function frameOverlay() {
    const isRounded = frameStyle?.id === 'rounded'
    const r = isRounded ? Math.round(Math.min(fW, fH) * 0.05) : 0
    const outer = r > 0
      ? `M ${r},0 H ${fW-r} A ${r},${r} 0 0 1 ${fW},${r} V ${fH-r} A ${r},${r} 0 0 1 ${fW-r},${fH} H ${r} A ${r},${r} 0 0 1 0,${fH-r} V ${r} A ${r},${r} 0 0 1 ${r},0 Z`
      : `M 0,0 H ${fW} V ${fH} H 0 Z`
    const holes = fSlots.map(s => `M ${s.x},${s.y} H ${s.x+s.w} V ${s.y+s.h} H ${s.x} Z`).join(' ')
    return (
      <svg
        key="frame-overlay"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: getZIndex('frame'), pointerEvents: 'none' }}
        viewBox={`0 0 ${fW} ${fH}`}
        preserveAspectRatio="none"
      >
        <path fillRule="evenodd" fill={bg} d={`${outer} ${holes}`} />
      </svg>
    )
  }

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
    isClickRef.current = true
    setPanning(true)
  }

  function handlePointerMove(e) {
    if (!panStart.current) return
    isClickRef.current = false
    pushTransform(scaleRef.current, clampOff(e.clientX - panStart.current.x, e.clientY - panStart.current.y, scaleRef.current))
  }

  function handlePointerUp() {
    if (isClickRef.current) onSelectLayer?.(null)
    panStart.current = null
    isClickRef.current = false
    setPanning(false)
  }

  function resetZoom() { pushTransform(1, { x: 0, y: 0 }) }

  function handleStickerPointerDown(e, sticker) {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    onSelectLayer?.(sticker.id)
    const rect = frameRef.current.getBoundingClientRect()
    const s = scaleRef.current
    const fw = frameRef.current.offsetWidth
    const fh = frameRef.current.offsetHeight
    const half = Math.round((sticker.size ?? 1) * STICKER_SIZE) / 2
    dragStickerRef.current = {
      id: sticker.id,
      dx: (e.clientX - rect.left) / s - sticker.x * fw,
      dy: (e.clientY - rect.top) / s - sticker.y * fh,
      half,
    }
  }

  function handleStickerPointerMove(e) {
    if (!dragStickerRef.current) return
    const rect = frameRef.current.getBoundingClientRect()
    const s = scaleRef.current
    const fw = frameRef.current.offsetWidth
    const fh = frameRef.current.offsetHeight
    const half = dragStickerRef.current.half
    const cx = Math.min(Math.max((e.clientX - rect.left) / s - dragStickerRef.current.dx, -(half - 1)), fw + half - 1)
    const cy = Math.min(Math.max((e.clientY - rect.top) / s - dragStickerRef.current.dy, -(half - 1)), fh + half - 1)
    onLayersChange(layers.map(l => l.id === dragStickerRef.current.id ? { ...l, x: cx / fw, y: cy / fh } : l))
  }

  function handleStickerPointerUp() { dragStickerRef.current = null }

  function stickerLayer() {
    if (!stickers.length) return null
    return stickers.map(sticker => {
      const sz = Math.round((sticker.size ?? 1) * STICKER_SIZE)
      return (
        <div
          key={sticker.id}
          style={{
            position: 'absolute',
            left: `calc(${sticker.x * 100}% - ${sz / 2}px)`,
            top: `calc(${sticker.y * 100}% - ${sz / 2}px)`,
            width: sz,
            height: sz,
            cursor: 'move',
            zIndex: getZIndex(sticker.id),
            userSelect: 'none',
            touchAction: 'none',
          }}
          onPointerDown={e => handleStickerPointerDown(e, sticker)}
          onPointerMove={handleStickerPointerMove}
          onPointerUp={handleStickerPointerUp}
          onPointerCancel={handleStickerPointerUp}
        >
          <StarSvg size={sz} />
        </div>
      )
    })
  }

  function selectionIndicator() {
    if (!selectedLayerId) return null
    const sticker = stickers.find(s => s.id === selectedLayerId)
    if (!sticker) return null
    const size = Math.round((sticker.size ?? 1) * STICKER_SIZE)
    return (
      <div
        key="sel"
        style={{
          position: 'absolute',
          left: `calc(${sticker.x * 100}% - ${size / 2}px)`,
          top: `calc(${sticker.y * 100}% - ${size / 2}px)`,
          width: size,
          height: size,
          border: '1px dashed #8B3714',
          borderRadius: 2,
          zIndex: 9999,
          cursor: 'move',
          boxSizing: 'border-box',
          pointerEvents: 'all',
        }}
        onPointerDown={e => handleStickerPointerDown(e, sticker)}
        onPointerMove={handleStickerPointerMove}
        onPointerUp={handleStickerPointerUp}
        onPointerCancel={handleStickerPointerUp}
      />
    )
  }

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
          position: 'relative', zIndex: getZIndex('photo'),
          opacity: dragIdx === i ? 0.45 : 1,
          transition: 'opacity 0.15s',
          outline: dragIdx !== null && dragIdx !== i ? '2px dashed rgba(139,55,20,0.4)' : 'none',
        }}
      >
        <img src={src} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', userSelect: 'none' }} />
      </div>
    )
  }

  const clip = frameClipStyle(frameStyle.id, stickerOverflow)
  let preview = null
  switch (format.layout) {
    case 'polaroid':
      preview = <div ref={frameRef} style={{ background: bg, padding: '22px 22px 68px', boxShadow: shadow, display: 'inline-block', position: 'relative', ...clip }}>{slot(photos[0], 340, 340, 0)}{frameOverlay()}{stickerLayer()}{selectionIndicator()}</div>
      break
    case 'vertical-strip':
      preview = <div ref={frameRef} style={{ background: bg, padding: '16px 16px 50px', display: 'inline-flex', flexDirection: 'column', gap: 8, boxShadow: shadow, position: 'relative', ...clip }}>{photos.map((p, i) => slot(p, 300, 200, i))}{frameOverlay()}{stickerLayer()}{selectionIndicator()}</div>
      break
    case 'landscape-sequence':
      preview = <div ref={frameRef} style={{ background: bg, padding: '16px 16px 32px', display: 'inline-flex', flexDirection: 'row', gap: 8, boxShadow: shadow, position: 'relative', ...clip }}>{photos.map((p, i) => slot(p, 210, 158, i))}{frameOverlay()}{stickerLayer()}{selectionIndicator()}</div>
      break
    case 'modern-grid':
      preview = <div ref={frameRef} style={{ background: bg, padding: '16px 16px 50px', display: 'inline-grid', gridTemplateColumns: '1fr 1fr', gap: 8, boxShadow: shadow, position: 'relative', ...clip }}>{photos.map((p, i) => slot(p, 210, 158, i))}{frameOverlay()}{stickerLayer()}{selectionIndicator()}</div>
      break
    case 'mixed-narrative': {
      const topW = 500, topH = Math.round(topW * 9 / 16), gap = 8
      const bottomW = Math.round((topW - gap * 2) / 3), bottomH = Math.round(bottomW * 3 / 4)
      preview = (
        <div ref={frameRef} style={{ background: bg, padding: '16px 16px 50px', display: 'inline-flex', flexDirection: 'column', gap: 8, boxShadow: shadow, position: 'relative', ...clip }}>
          {slot(photos[0], topW, topH, 0)}
          <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>{photos.slice(1).map((p, i) => slot(p, bottomW, bottomH, i + 1))}</div>
          {frameOverlay()}
          {stickerLayer()}
          {selectionIndicator()}
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
          <span className="text-[10px] bg-[#ede5db] dark:bg-[#2c2220] text-[#7a6f68] dark:text-[#8c7e78] px-2 py-1 rounded-full">
            {scale >= 1 ? Math.round(scale * 100) : Math.round((scale - 1) * 100)}%
          </span>
          <button onPointerDown={e => e.stopPropagation()} onClick={resetZoom} className="text-[10px] bg-[#ede5db] dark:bg-[#2c2220] hover:bg-[#e0d5c8] dark:hover:bg-[#352825] text-[#7a6f68] dark:text-[#8c7e78] px-2 py-1 rounded-full transition-colors">Reset</button>
        </div>
      )}
    </div>
  )
}
