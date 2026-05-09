import { useState, useRef, useEffect } from 'react'

function frameClipStyle(styleId) {
  if (styleId === 'rounded') return { borderRadius: '5%' }
  return {}
}

export default function PrintPreview({ format, photos, filter, frameColor, frameStyle, onPhotosChange }) {
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
          <span className="text-[10px] bg-[#ede5db] dark:bg-[#2c2220] text-[#7a6f68] dark:text-[#8c7e78] px-2 py-1 rounded-full">
            {scale >= 1 ? Math.round(scale * 100) : Math.round((scale - 1) * 100)}%
          </span>
          <button onPointerDown={e => e.stopPropagation()} onClick={resetZoom} className="text-[10px] bg-[#ede5db] dark:bg-[#2c2220] hover:bg-[#e0d5c8] dark:hover:bg-[#352825] text-[#7a6f68] dark:text-[#8c7e78] px-2 py-1 rounded-full transition-colors">Reset</button>
        </div>
      )}
    </div>
  )
}
