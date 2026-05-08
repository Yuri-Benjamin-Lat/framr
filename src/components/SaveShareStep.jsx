import { useEffect, useState } from 'react'
import { compositePhoto } from '../utils/canvas'

const PRIVACY_NOTE = "framr doesn't store, upload, or see your photos. All processing happens directly in your browser — nothing is sent to any server."

export default function SaveShareStep({ format, photos, filter, frameColor, onRestart, onBack }) {
  const [outputUrl, setOutputUrl] = useState(null)
  const [generating, setGenerating] = useState(true)

  useEffect(() => {
    compositePhoto({ photos, format, filter, frameColor }).then(url => {
      setOutputUrl(url)
      setGenerating(false)
    })
  }, [])

  function downloadPng() {
    const a = document.createElement('a')
    a.href = outputUrl
    a.download = `framr-${format.id}.png`
    a.click()
  }

  function downloadJpeg() {
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.width; c.height = img.height
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, c.width, c.height)
      ctx.drawImage(img, 0, 0)
      const a = document.createElement('a')
      a.href = c.toDataURL('image/jpeg', 0.92)
      a.download = `framr-${format.id}.jpg`
      a.click()
    }
    img.src = outputUrl
  }

  function print() {
    const win = window.open('', '_blank')
    win.document.write(`<html><head><title>framr</title><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#fff;}img{max-width:100%;max-height:100vh;object-fit:contain;}</style></head><body><img src="${outputUrl}" onload="window.print();window.close();" /></body></html>`)
    win.document.close()
  }

  async function share() {
    if (!navigator.share) return
    try {
      const blob = await (await fetch(outputUrl)).blob()
      const file = new File([blob], `framr-${format.id}.png`, { type: 'image/png' })
      await navigator.share({ files: [file], title: 'framr', text: `My ${format.name}` })
    } catch (_) {}
  }

  const btnBase = 'flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors text-sm w-full active:scale-[0.98]'
  const btnPrimary = `${btnBase} bg-[#8B3714] text-white hover:bg-[#732e10]`
  const btnSecondary = `${btnBase} border border-[#e5e0d8] dark:border-[#3d2f2b] bg-white dark:bg-[#2c2220] text-[#1a1614] dark:text-[#ede8e0] hover:bg-[#f5f0ea] dark:hover:bg-[#352825]`

  const iconDown = (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 bg-[#f5f0ea] dark:bg-[#191210]">
        <div className="w-8 h-8 border-2 border-[#8B3714] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#7a6f68] dark:text-[#8c7e78]">Compositing your print…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row md:h-full">

      {/* Preview */}
      <div className="flex-1 flex items-center justify-center bg-[#f5f0ea] dark:bg-[#191210] p-6 md:p-10 min-h-[40vh] md:min-h-0 md:overflow-auto">
        {outputUrl && (
          <img src={outputUrl} alt="Your print" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        )}
      </div>

      {/* Actions panel */}
      <div className="md:w-80 shrink-0 border-t md:border-t-0 md:border-l border-[#e5e0d8] dark:border-[#3d2f2b] bg-white dark:bg-[#221a18] flex flex-col md:overflow-y-auto">

        <div className="hidden md:flex h-16 px-6 border-b border-[#e5e0d8] dark:border-[#3d2f2b] items-center shrink-0">
          <div>
            <h2 className="font-semibold text-[#1a1614] dark:text-[#ede8e0] leading-none">Save &amp; Share</h2>
            <p className="text-xs text-[#7a6f68] dark:text-[#8c7e78] mt-0.5">Download or print</p>
          </div>
        </div>

        <div className="p-5 md:p-6 flex flex-col gap-5 md:gap-6">
          {/* Status */}
          <div className="flex items-center gap-3 p-4 bg-[#f5f0ea] dark:bg-[#2c2220] rounded-xl">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B3714" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <div>
              <p className="font-semibold text-[#1a1614] dark:text-[#ede8e0] text-sm leading-none mb-0.5">Your strip is ready</p>
              <p className="text-xs text-[#7a6f68] dark:text-[#8c7e78]">
                {format.name} · {format.photoCount} {format.photoCount === 1 ? 'photo' : 'photos'}
              </p>
            </div>
          </div>

          {/* Download */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-[#7a6f68] dark:text-[#8c7e78] uppercase tracking-wider">Download</p>
            <button onClick={downloadPng} className={btnPrimary}>{iconDown} Download PNG</button>
            <button onClick={downloadJpeg} className={btnSecondary}>{iconDown} Download JPEG</button>
          </div>

          {/* Other */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-[#7a6f68] dark:text-[#8c7e78] uppercase tracking-wider">Other</p>
            <button onClick={print} className={btnSecondary}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print
            </button>
            <button onClick={share} className={btnSecondary}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Share
            </button>
          </div>

          {/* Nav links */}
          <div className="flex flex-col gap-1 pt-1 border-t border-[#e5e0d8] dark:border-[#3d2f2b]">
            <button onClick={onBack} className="text-sm text-[#7a6f68] dark:text-[#8c7e78] hover:text-[#1a1614] dark:hover:text-[#ede8e0] transition-colors text-left py-1.5">
              ← Back to customize
            </button>
            <button onClick={onRestart} className="text-sm text-[#7a6f68] dark:text-[#8c7e78] hover:text-[#1a1614] dark:hover:text-[#ede8e0] transition-colors text-left py-1.5">
              ← Start a new strip
            </button>
          </div>

          {/* Privacy note */}
          <div className="pt-1 border-t border-[#e5e0d8] dark:border-[#3d2f2b] flex flex-col gap-1">
            <p className="text-[10px] text-[#b0a898] dark:text-[#5c4f4a] leading-relaxed">{PRIVACY_NOTE}</p>
            <p className="text-[10px] text-[#b0a898] dark:text-[#5c4f4a]">framr v1.0 · Created by Yuri L.</p>
          </div>
        </div>
      </div>
    </div>
  )
}