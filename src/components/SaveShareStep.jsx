import { useEffect, useState } from 'react'
import { compositePhoto } from '../utils/canvas'

export default function SaveShareStep({ format, photos, filter, frameColor, onRestart }) {
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
      c.width = img.width
      c.height = img.height
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
    win.document.write(`
      <html>
        <head>
          <title>Framr — ${format.name}</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
            img { max-width: 100%; max-height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body><img src="${outputUrl}" onload="window.print();window.close();" /></body>
      </html>
    `)
    win.document.close()
  }

  async function share() {
    if (!navigator.share) return
    try {
      const blob = await (await fetch(outputUrl)).blob()
      const file = new File([blob], `framr-${format.id}.png`, { type: 'image/png' })
      await navigator.share({ files: [file], title: 'Framr', text: `My ${format.name}` })
    } catch (_) {}
  }

  const iconDown = (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      {generating ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#8B3714] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#7a6f68]">Compositing your print…</p>
        </div>
      ) : (
        <>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#8B3714" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>

          <div className="text-center">
            <h1 className="text-2xl font-semibold text-[#1a1614] mb-1">Your strip is ready</h1>
            <p className="text-sm text-[#7a6f68]">
              {format.name} · {format.photoCount} {format.photoCount === 1 ? 'photo' : 'photos'}
            </p>
          </div>

          {outputUrl && (
            <div className="max-h-56 overflow-hidden rounded-lg shadow-lg">
              <img src={outputUrl} alt="Your print" className="h-full w-auto object-contain" />
            </div>
          )}

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <div className="flex gap-3">
              <button
                onClick={downloadPng}
                className="flex-1 bg-[#8B3714] text-white py-3 rounded-lg font-medium hover:bg-[#732e10] transition-colors flex items-center justify-center gap-2"
              >
                {iconDown} Download PNG
              </button>
              <button
                onClick={downloadJpeg}
                className="flex-1 border border-[#e5e0d8] bg-white text-[#1a1614] py-3 rounded-lg font-medium hover:bg-[#f5f0ea] transition-colors flex items-center justify-center gap-2"
              >
                {iconDown} Download JPEG
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={print}
                className="flex-1 border border-[#e5e0d8] bg-white text-[#1a1614] py-3 rounded-lg font-medium hover:bg-[#f5f0ea] transition-colors flex items-center justify-center gap-2"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"/>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                  <rect x="6" y="14" width="12" height="8"/>
                </svg>
                Print
              </button>
              <button
                onClick={share}
                className="flex-1 border border-[#e5e0d8] bg-white text-[#1a1614] py-3 rounded-lg font-medium hover:bg-[#f5f0ea] transition-colors flex items-center justify-center gap-2"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Share
              </button>
            </div>
          </div>

          <button onClick={onRestart} className="text-sm text-[#7a6f68] hover:text-[#1a1614] transition-colors">
            ← Start a new strip
          </button>
        </>
      )}
    </div>
  )
}