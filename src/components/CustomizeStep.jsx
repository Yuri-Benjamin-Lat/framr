import { useState, useRef } from 'react'
import { HexColorPicker } from 'react-colorful'
import { FILTERS, FRAME_COLORS, FRAME_STYLES } from '../data/formats'
import PrintPreview from './PrintPreview'

function StarPreview({ size = 28 }) {
  const cx = size / 2, cy = size / 2
  const outer = size * 0.45, inner = size * 0.19
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI) / 5 - Math.PI / 2
    const r = i % 2 === 0 ? outer : inner
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
  }).join(' ')
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <polygon points={pts} fill="#FFD700" />
    </svg>
  )
}

function StyleIcon({ id, active }) {
  const stroke = active ? '#8B3714' : '#7a6f68'
  const w = 44, h = 34, r = 6
  if (id === 'square')
    return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}><rect x="2" y="2" width={w-4} height={h-4} fill="none" stroke={stroke} strokeWidth="2"/></svg>
  if (id === 'rounded')
    return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}><rect x="2" y="2" width={w-4} height={h-4} rx={r} ry={r} fill="none" stroke={stroke} strokeWidth="2"/></svg>
  return null
}


export default function CustomizeStep({
  format, photos, filter, frameColor, frameStyle, layers, stickerOverflow,
  onFilterChange, onFrameColorChange, onFrameStyleChange, onPhotosChange, onLayersChange, onStickerOverflowChange,
  onNext, onBack,
}) {
  const [showBackModal, setShowBackModal] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [openSection, setOpenSection] = useState(null)
  const [dragLayerIdx, setDragLayerIdx] = useState(null)
  const [selectedLayerId, setSelectedLayerId] = useState(null)
  const [expandedLayerId, setExpandedLayerId] = useState(null)
  const [customPickerOpen, setCustomPickerOpen] = useState(false)
  const [customHex, setCustomHex] = useState('#8B3714')
  const importInputRef = useRef(null)

  function nextStickerName(type, currentLayers) {
    const prefix = type === 'star' ? 'Star' : 'Import'
    const used = currentLayers
      .filter(l => l.label?.startsWith(prefix + ' '))
      .map(l => parseInt(l.label.slice(prefix.length + 1), 10))
      .filter(n => Number.isInteger(n) && n > 0)
    let n = 1
    while (used.includes(n)) n++
    return `${prefix} ${n}`
  }

  function addSticker(type) {
    const label = nextStickerName(type, layers)
    onLayersChange([{ id: Date.now() + Math.random(), type, label, x: 0.5, y: 0.5, size: 1, rotation: 0 }, ...layers])
  }

  function handleImportFile(e) {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''
    const reader = new FileReader()
    reader.onload = ev => {
      const src = ev.target.result
      const img = new Image()
      img.onload = () => {
        const aspectRatio = img.width / img.height
        const label = nextStickerName('import', layers)
        onLayersChange(prev => [{ id: Date.now() + Math.random(), type: 'import', label, x: 0.5, y: 0.5, size: 1, rotation: 0, src, aspectRatio }, ...prev])
      }
      img.onerror = () => {}
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  function updateStickerSize(id, size) {
    onLayersChange(layers.map(l => l.id === id ? { ...l, size } : l))
  }

  function reorderLayer(from, to) {
    const next = [...layers]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onLayersChange(next)
  }

  function removeLayer(id) {
    onLayersChange(layers.filter(l => l.id !== id))
  }

  function handleCustomHex(val) {
    const clean = val.startsWith('#') ? val : '#' + val
    setCustomHex(clean)
    if (/^#[0-9a-fA-F]{6}$/.test(clean)) onFrameColorChange({ id: 'custom', label: 'Custom', value: clean })
  }

  const customizeControls = (
    <div className="flex flex-col gap-3">
      {format.photoCount > 1 && (
        <p className="text-xs text-[#7a6f68] dark:text-[#8c7e78]">Drag photos in the preview to reorder them.</p>
      )}
      <div className="border border-[#e5e0d8] dark:border-[#3d2f2b] rounded-xl overflow-hidden">
        <button
          onClick={() => setOpenSection(s => s === 'style' ? null : 'style')}
          className="w-full flex items-center px-4 py-3 bg-[#faf8f5] dark:bg-[#1e1714] hover:bg-[#f5f0ea] dark:hover:bg-[#251e1b] transition-colors"
        >
          <div className="flex items-center justify-between flex-1 mr-2">
            <span className="text-xs font-semibold text-[#7a6f68] dark:text-[#8c7e78] uppercase tracking-wider">Frame Style</span>
            <span className="text-xs text-[#8B3714] dark:text-[#c4643a]">{frameStyle.name}</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`text-[#7a6f68] dark:text-[#8c7e78] transition-transform ${openSection === 'style' ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6"/></svg>
        </button>
        {openSection === 'style' && (
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

      <div className="border border-[#e5e0d8] dark:border-[#3d2f2b] rounded-xl overflow-hidden">
        <button
          onClick={() => setOpenSection(s => s === 'frame' ? null : 'frame')}
          className="w-full flex items-center px-4 py-3 bg-[#faf8f5] dark:bg-[#1e1714] hover:bg-[#f5f0ea] dark:hover:bg-[#251e1b] transition-colors"
        >
          <div className="flex items-center justify-between flex-1 mr-2">
            <span className="text-xs font-semibold text-[#7a6f68] dark:text-[#8c7e78] uppercase tracking-wider">Frame Color</span>
            <span className="w-3 h-3 rounded-full border border-black/10 inline-block" style={{ backgroundColor: frameColor.value }} />
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`text-[#7a6f68] dark:text-[#8c7e78] transition-transform ${openSection === 'frame' ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6"/></svg>
        </button>
        {openSection === 'frame' && (
          <div className="p-3 border-t border-[#e5e0d8] dark:border-[#3d2f2b] flex flex-col gap-3">
            <div className="flex gap-2 flex-wrap">
              {FRAME_COLORS.map(fc => (
                <button
                  key={fc.id}
                  onClick={() => { onFrameColorChange(fc); setCustomPickerOpen(false) }}
                  title={fc.label}
                  style={{ backgroundColor: fc.value }}
                  className={`w-9 h-9 rounded-full border-2 transition-all ${
                    frameColor.id === fc.id ? 'border-[#8B3714] scale-110' : 'border-[#e5e0d8] dark:border-[#3d2f2b] hover:border-[#c5bfb8]'
                  }`}
                />
              ))}
              <button
                onClick={() => setCustomPickerOpen(o => !o)}
                title="Custom color"
                className={`w-9 h-9 rounded-full border-2 transition-all overflow-hidden ${
                  frameColor.id === 'custom' ? 'border-[#8B3714] scale-110' : 'border-[#e5e0d8] dark:border-[#3d2f2b] hover:border-[#c5bfb8]'
                }`}
                style={{ background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)' }}
              />
              {'EyeDropper' in window && (
                <button
                  onClick={() => {
                    new window.EyeDropper().open().then(r => {
                      setCustomHex(r.sRGBHex)
                      onFrameColorChange({ id: 'eyedropper', label: 'Custom', value: r.sRGBHex })
                    }).catch(() => {})
                  }}
                  title="Pick color from screen"
                  className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center bg-[#faf8f5] dark:bg-[#1e1714] ${
                    frameColor.id === 'eyedropper' ? 'border-[#8B3714] scale-110' : 'border-[#e5e0d8] dark:border-[#3d2f2b] hover:border-[#c5bfb8]'
                  }`}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7a6f68] dark:text-[#8c7e78]">
                    <path d="m2 22 1-1h3l9-9"/>
                    <path d="M3 21v-3l9-9"/>
                    <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8"/>
                  </svg>
                </button>
              )}
            </div>
            {customPickerOpen && (
              <div className="flex flex-col gap-2.5 pt-1">
                <HexColorPicker
                  color={frameColor.id === 'custom' || frameColor.id === 'eyedropper' ? frameColor.value : customHex}
                  onChange={val => { setCustomHex(val); onFrameColorChange({ id: 'custom', label: 'Custom', value: val }) }}
                />
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-md border border-[#e5e0d8] dark:border-[#3d2f2b] shrink-0" style={{ backgroundColor: frameColor.id === 'custom' || frameColor.id === 'eyedropper' ? frameColor.value : customHex }} />
                  <input
                    type="text"
                    value={(frameColor.id === 'custom' || frameColor.id === 'eyedropper' ? frameColor.value : customHex).toUpperCase()}
                    onChange={e => handleCustomHex(e.target.value)}
                    maxLength={7}
                    spellCheck={false}
                    className="flex-1 text-xs font-mono bg-[#f5f0ea] dark:bg-[#191210] border border-[#e5e0d8] dark:border-[#3d2f2b] rounded-lg px-2 py-1.5 text-[#1a1614] dark:text-[#ede8e0] focus:outline-none focus:border-[#8B3714] transition-colors"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border border-[#e5e0d8] dark:border-[#3d2f2b] rounded-xl overflow-hidden">
        <button
          onClick={() => setOpenSection(s => s === 'filter' ? null : 'filter')}
          className="w-full flex items-center px-4 py-3 bg-[#faf8f5] dark:bg-[#1e1714] hover:bg-[#f5f0ea] dark:hover:bg-[#251e1b] transition-colors"
        >
          <div className="flex items-center justify-between flex-1 mr-2">
            <span className="text-xs font-semibold text-[#7a6f68] dark:text-[#8c7e78] uppercase tracking-wider">Filter</span>
            <span className="text-xs text-[#8B3714] dark:text-[#c4643a]">{filter.name}</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`text-[#7a6f68] dark:text-[#8c7e78] transition-transform ${openSection === 'filter' ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6"/></svg>
        </button>
        {openSection === 'filter' && (
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
          onClick={() => setOpenSection(s => s === 'sticker' ? null : 'sticker')}
          className="w-full flex items-center px-4 py-3 bg-[#faf8f5] dark:bg-[#1e1714] hover:bg-[#f5f0ea] dark:hover:bg-[#251e1b] transition-colors"
        >
          <div className="flex items-center justify-between flex-1 mr-2">
            <span className="text-xs font-semibold text-[#7a6f68] dark:text-[#8c7e78] uppercase tracking-wider">Stickers</span>
            <span className="text-xs text-[#8B3714] dark:text-[#c4643a]">
              {layers.filter(l => l.type !== 'photo' && l.type !== 'frame').length > 0
                ? `${layers.filter(l => l.type !== 'photo' && l.type !== 'frame').length} placed`
                : 'None'}
            </span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`text-[#7a6f68] dark:text-[#8c7e78] transition-transform ${openSection === 'sticker' ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6"/></svg>
        </button>
        {openSection === 'sticker' && (
          <div className="border-t border-[#e5e0d8] dark:border-[#3d2f2b] flex flex-col">
            {/* Sticker picker */}
            <div className="p-3 flex flex-col gap-2">
              <p className="text-[10px] text-[#b0a898] dark:text-[#5c4f4a]">Tap to add · Drag in preview to reposition</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => importInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-1 w-16 aspect-square rounded-lg border-2 border-[#e5e0d8] dark:border-[#3d2f2b] hover:border-[#8B3714] dark:hover:border-[#8B3714] transition-all"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7a6f68] dark:text-[#8c7e78]">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span className="text-[10px] text-[#7a6f68] dark:text-[#8c7e78]">Import</span>
                </button>
                <button
                  onClick={() => addSticker('star')}
                  className="flex flex-col items-center justify-center gap-1 w-16 aspect-square rounded-lg border-2 border-[#e5e0d8] dark:border-[#3d2f2b] hover:border-[#8B3714] dark:hover:border-[#8B3714] transition-all"
                >
                  <StarPreview size={28} />
                  <span className="text-[10px] text-[#7a6f68] dark:text-[#8c7e78]">Star</span>
                </button>
                <input ref={importInputRef} type="file" accept="image/*" className="hidden" onChange={handleImportFile} />
              </div>
            </div>

            {/* Layer panel */}
            <div className="border-t border-[#e5e0d8] dark:border-[#3d2f2b] p-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-semibold text-[#7a6f68] dark:text-[#8c7e78] uppercase tracking-wider">Layers</p>
                <button
                  onClick={() => onStickerOverflowChange(!stickerOverflow)}
                  title={stickerOverflow ? 'Overflow on — stickers hang off edges' : 'Overflow off — stickers clipped to frame'}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-colors ${
                    stickerOverflow
                      ? 'bg-[#8B3714] text-white border-[#8B3714]'
                      : 'bg-transparent text-[#7a6f68] dark:text-[#8c7e78] border-[#d5cfc8] dark:border-[#4a3a36] hover:border-[#8B3714] hover:text-[#8B3714]'
                  }`}
                >
                  Overflow
                </button>
              </div>
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#d5cfc8] dark:[&::-webkit-scrollbar-thumb]:bg-[#3d2f2b] [&::-webkit-scrollbar-thumb]:rounded-full">
                {layers.map((layer, i) => {
                  const isSticker = layer.type !== 'photo' && layer.type !== 'frame'
                  const isExpanded = isSticker && expandedLayerId === layer.id
                  return (
                    <div key={layer.id} className="flex flex-col">
                      <div
                        draggable
                        onDragStart={() => setDragLayerIdx(i)}
                        onDragOver={e => e.preventDefault()}
                        onDrop={() => { if (dragLayerIdx !== null && dragLayerIdx !== i) reorderLayer(dragLayerIdx, i); setDragLayerIdx(null) }}
                        onDragEnd={() => setDragLayerIdx(null)}
                        onClick={() => isSticker ? setSelectedLayerId(layer.id) : setSelectedLayerId(null)}
                        className={`flex items-center gap-2 px-2 py-1.5 border transition-all cursor-pointer ${isExpanded ? 'rounded-t-lg' : 'rounded-lg'} ${
                          dragLayerIdx === i
                            ? 'opacity-40 border-[#e5e0d8] dark:border-[#3d2f2b]'
                            : isSticker && selectedLayerId === layer.id
                              ? 'border-[#8B3714] bg-[#fdf5f0] dark:bg-[#2a1a14]'
                              : 'border-[#e5e0d8] dark:border-[#3d2f2b] bg-[#faf8f5] dark:bg-[#1e1714] hover:border-[#c5bfb8] dark:hover:border-[#5a4a46]'
                        }`}
                      >
                        <svg width="10" height="14" viewBox="0 0 10 14" className="shrink-0 cursor-grab text-[#c5bfb8] dark:text-[#5a4a46]">
                          <circle cx="2.5" cy="2" r="1.3" fill="currentColor"/>
                          <circle cx="7.5" cy="2" r="1.3" fill="currentColor"/>
                          <circle cx="2.5" cy="7" r="1.3" fill="currentColor"/>
                          <circle cx="7.5" cy="7" r="1.3" fill="currentColor"/>
                          <circle cx="2.5" cy="12" r="1.3" fill="currentColor"/>
                          <circle cx="7.5" cy="12" r="1.3" fill="currentColor"/>
                        </svg>
                        <div className="shrink-0">
                          {layer.type === 'star' && <StarPreview size={18} />}
                          {layer.type === 'import' && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7a6f68] dark:text-[#8c7e78]">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                          )}
                          {layer.type === 'photo' && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7a6f68] dark:text-[#8c7e78]">
                              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                            </svg>
                          )}
                          {layer.type === 'frame' && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7a6f68] dark:text-[#8c7e78]">
                              <rect x="3" y="3" width="18" height="18" rx="1"/><rect x="7" y="7" width="10" height="10" rx="1"/>
                            </svg>
                          )}
                        </div>
                        <span className="flex-1 text-xs text-[#1a1614] dark:text-[#ede8e0] truncate">{layer.label}</span>
                        {isSticker && (
                          <button
                            onClick={e => { e.stopPropagation(); setExpandedLayerId(v => v === layer.id ? null : layer.id) }}
                            className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-[#b0a898] dark:text-[#5c4f4a] hover:text-[#7a6f68] dark:hover:text-[#8c7e78] transition-colors"
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6"/></svg>
                          </button>
                        )}
                        {isSticker && (
                          <button
                            onClick={e => { e.stopPropagation(); removeLayer(layer.id) }}
                            className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-[#b0a898] dark:text-[#5c4f4a] hover:text-[#c0392b] dark:hover:text-[#e06050] hover:bg-[#f5e8e6] dark:hover:bg-[#3a1f1f] transition-colors"
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                          </button>
                        )}
                      </div>
                      {isExpanded && (
                        <div className="px-3 py-2 border-l border-r border-b border-[#e5e0d8] dark:border-[#3d2f2b] rounded-b-lg bg-[#faf8f5] dark:bg-[#1e1714] flex items-center gap-2">
                          <span className="text-[10px] text-[#7a6f68] dark:text-[#8c7e78] shrink-0">Size</span>
                          <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.05"
                            value={layer.size ?? 1}
                            onChange={e => updateStickerSize(layer.id, parseFloat(e.target.value))}
                            className="flex-1 accent-[#8B3714]"
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
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

        <PrintPreview format={format} photos={photos} filter={filter} frameColor={frameColor} frameStyle={frameStyle} onPhotosChange={onPhotosChange} layers={layers} onLayersChange={onLayersChange} selectedLayerId={selectedLayerId} onSelectLayer={setSelectedLayerId} stickerOverflow={stickerOverflow} />

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
        <PrintPreview format={format} photos={photos} filter={filter} frameColor={frameColor} frameStyle={frameStyle} onPhotosChange={onPhotosChange} layers={layers} onLayersChange={onLayersChange} selectedLayerId={selectedLayerId} onSelectLayer={setSelectedLayerId} stickerOverflow={stickerOverflow} />

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