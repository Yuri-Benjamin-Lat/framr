import { useEffect, useRef, useState } from 'react'
import { useCamera } from '../hooks/useCamera'

export default function CameraStep({ format, photos, onPhotosChange, onNext, onBack }) {
  const { videoRef, ready, error, facingMode, start, stop, capture, flipCamera } = useCamera()
  const [timerDuration, setTimerDuration] = useState(3)
  const [countdown, setCountdown] = useState(null)
  const [flashing, setFlashing] = useState(false)
  const [autoShoot, setAutoShoot] = useState(true)
  const countdownRef = useRef(null)

  const totalShots = format.photoCount
  const allDone = photos.length >= totalShots
  const currentShot = photos.length
  const sideCropPct = (() => {
    const { layout } = format
    if (layout === 'polaroid') return 21.875
    if (layout === 'modern-grid') return 21.875
    if (layout === 'vertical-strip') return 5.74
    if (layout === 'landscape-sequence') return 8.09
    if (layout === 'mixed-narrative') return currentShot === 0 ? 0 : 12.5
    return 0
  })()

  useEffect(() => {
    start('user')
    return () => {
      stop()
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  function runCapture(taken, auto, duration) {
    let count = duration
    setCountdown(count)
    countdownRef.current = setInterval(() => {
      count -= 1
      if (count <= 0) {
        clearInterval(countdownRef.current)
        setCountdown(null)
        setFlashing(true)
        setTimeout(() => setFlashing(false), 150)
        const dataUrl = capture()
        if (dataUrl) {
          const newCount = taken + 1
          onPhotosChange(prev => [...prev, dataUrl])
          if (auto && newCount < totalShots) {
            setTimeout(() => runCapture(newCount, auto, duration), 800)
          }
        }
      } else {
        setCountdown(count)
      }
    }, 1000)
  }

  function shoot() {
    if (countdown !== null || allDone) return
    runCapture(photos.length, autoShoot, timerDuration)
  }

  function retake(index) {
    if (countdownRef.current) clearInterval(countdownRef.current)
    setCountdown(null)
    onPhotosChange(prev => prev.filter((_, i) => i !== index))
  }

  const FlipIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 4v6h6M23 20v-6h-6"/>
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
    </svg>
  )

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <div className="h-14 md:h-16 flex items-center justify-between px-3 md:px-6 border-b border-[#e5e0d8] dark:border-[#3d2f2b] bg-white dark:bg-[#221a18] shrink-0 gap-2">
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <button
              onClick={onBack}
              className="flex items-center gap-1 md:gap-1.5 text-sm text-[#7a6f68] dark:text-[#8c7e78] hover:text-[#1a1614] dark:hover:text-[#ede8e0] transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span className="hidden sm:inline">Back</span>
            </button>
            <span className="text-[#d5cfc8] dark:text-[#4a3a36] select-none hidden sm:inline">|</span>
            <h2 className="font-medium text-[#1a1614] dark:text-[#ede8e0] text-sm md:text-base">Camera</h2>
          </div>

          <div className="flex items-center gap-1.5 md:gap-3">
            {/* Auto / Manual toggle */}
            <button
              onClick={() => setAutoShoot(a => !a)}
              title={autoShoot ? 'Auto: captures all shots in sequence' : 'Manual: one shot per tap'}
              className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                autoShoot
                  ? 'bg-[#8B3714] text-white border-[#8B3714]'
                  : 'bg-white dark:bg-[#221a18] text-[#7a6f68] dark:text-[#8c7e78] border-[#d5cfc8] dark:border-[#4a3a36] hover:border-[#8B3714] hover:text-[#8B3714]'
              }`}
            >
              {autoShoot ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="9" width="11" height="9" rx="1.5" strokeOpacity="0.35"/>
                    <rect x="5.5" y="6" width="11" height="9" rx="1.5" strokeOpacity="0.65"/>
                    <rect x="9" y="3" width="11" height="9" rx="1.5"/>
                  </svg>
                  Auto
                </>
              ) : (
                <>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>
                  </svg>
                  Manual
                </>
              )}
            </button>

            <span className="text-[#d5cfc8] dark:text-[#4a3a36] select-none hidden sm:inline">|</span>
            <span className="text-sm text-[#7a6f68] dark:text-[#8c7e78] hidden sm:block">Timer</span>

            {[3, 5, 10].map(t => (
              <button
                key={t}
                onClick={() => setTimerDuration(t)}
                className={`w-8 h-8 rounded-full text-xs md:text-sm font-medium transition-colors ${
                  timerDuration === t
                    ? 'bg-[#8B3714] text-white'
                    : 'bg-[#f0ece6] dark:bg-[#2c2220] text-[#7a6f68] dark:text-[#8c7e78] hover:bg-[#e5e0d8] dark:hover:bg-[#352825]'
                }`}
              >
                {t}s
              </button>
            ))}
          </div>
        </div>

        {/* Viewfinder */}
        <div className="flex-1 flex items-center justify-center px-3 py-2 md:px-8 md:py-4 bg-[#f5f0ea] dark:bg-[#191210]">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay playsInline muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? '[transform:scaleX(-1)]' : ''}`}
            />
            {!flashing && ready && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
                  backgroundSize: '33.33% 33.33%',
                }}
              />
            )}
            {!flashing && sideCropPct > 0 && (
              <>
                <div className="absolute left-0 top-0 bottom-0 bg-black/50 pointer-events-none" style={{ width: `${sideCropPct}%` }} />
                <div className="absolute right-0 top-0 bottom-0 bg-black/50 pointer-events-none" style={{ width: `${sideCropPct}%` }} />
                <div className="absolute inset-y-3 pointer-events-none" style={{ left: `${sideCropPct}%`, right: `${sideCropPct}%` }}>
                  <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#8B3714]" />
                  <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[#8B3714]" />
                  <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[#8B3714]" />
                  <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#8B3714]" />
                </div>
              </>
            )}
            {!flashing && sideCropPct === 0 && (
              <>
                <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#8B3714] pointer-events-none" />
                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#8B3714] pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#8B3714] pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#8B3714] pointer-events-none" />
              </>
            )}
            {flashing && <div className="absolute inset-0 bg-white" />}
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <span className="text-white text-7xl md:text-8xl font-bold drop-shadow-lg select-none">{countdown}</span>
              </div>
            )}
            {!ready && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white/50 text-sm font-mono tracking-widest">[ camera feed ]</p>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-6">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile thumbnail strip */}
        <div className="md:hidden shrink-0 bg-[#f5f0ea] dark:bg-[#191210] border-t border-[#e5e0d8] dark:border-[#3d2f2b] px-3 py-2 flex items-center gap-2 overflow-x-auto">
          {Array.from({ length: totalShots }).map((_, i) => {
            const photo = photos[i]
            return (
              <div key={i} className="relative w-16 h-12 shrink-0 rounded-md overflow-hidden bg-[#e5e0d8] dark:bg-[#2c2220] border border-[#d5cfc8] dark:border-[#3d2f2b]">
                {photo ? (
                  <>
                    <img src={photo} alt={`Shot ${i + 1}`} className="w-full h-full object-cover" />
                    <button onClick={() => retake(i)} className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/50 rounded-full text-white text-[10px] flex items-center justify-center hover:bg-black/70">×</button>
                    <div className="absolute bottom-0.5 left-1">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#8B3714" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[10px] text-[#7a6f68] dark:text-[#8c7e78]">{i + 1}</span>
                  </div>
                )}
              </div>
            )
          })}
          <span className="text-xs text-[#7a6f68] dark:text-[#8c7e78] shrink-0 ml-1">{photos.length}/{totalShots}</span>
        </div>

        {/* Bottom controls */}
        <div className="flex items-center justify-center gap-8 py-4 md:pb-5 shrink-0 bg-[#f5f0ea] dark:bg-[#191210]">
          {allDone ? (
            <button onClick={onNext} className="bg-[#8B3714] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#732e10] transition-colors">
              Continue to Customize →
            </button>
          ) : (
            <>
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={flipCamera}
                  className="w-12 h-12 rounded-full border-2 border-[#d5cfc8] dark:border-[#4a3a36] bg-white dark:bg-[#221a18] flex items-center justify-center text-[#7a6f68] dark:text-[#8c7e78] hover:border-[#8B3714] hover:text-[#8B3714] transition-colors"
                  title="Flip camera"
                >
                  <FlipIcon />
                </button>
                <span className="text-sm opacity-0 select-none" aria-hidden="true">·</span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={shoot}
                  disabled={!ready || countdown !== null}
                  className="w-16 h-16 rounded-full border-4 border-[#8B3714] bg-white dark:bg-[#221a18] flex items-center justify-center hover:bg-[#f5f0ea] dark:hover:bg-[#2c2220] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="w-9 h-9 rounded-full bg-[#8B3714]" />
                </button>
                <span className="text-sm text-[#7a6f68] dark:text-[#8c7e78]">Shoot</span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-12" />
                <span className="text-sm opacity-0 select-none" aria-hidden="true">·</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right panel — tablet/desktop only */}
      <div className="hidden md:flex w-52 shrink-0 border-l border-[#e5e0d8] dark:border-[#3d2f2b] bg-white dark:bg-[#221a18] flex-col">
        <div className="h-16 px-4 border-b border-[#e5e0d8] dark:border-[#3d2f2b] flex items-center justify-between shrink-0">
          <span className="text-xs font-semibold text-[#7a6f68] dark:text-[#8c7e78] uppercase tracking-wider">Captured</span>
          <span className="text-xs font-semibold text-[#8B3714] dark:text-[#c4643a]">{photos.length} of {totalShots}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {Array.from({ length: totalShots }).map((_, i) => {
            const photo = photos[i]
            return (
              <div key={i} className="relative aspect-video rounded-md overflow-hidden bg-[#f0ece6] dark:bg-[#2c2220] border border-[#e5e0d8] dark:border-[#3d2f2b]">
                {photo ? (
                  <>
                    <img src={photo} alt={`Shot ${i + 1}`} className="w-full h-full object-cover" />
                    <button onClick={() => retake(i)} className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white text-xs leading-none hover:bg-black/70 transition-colors">×</button>
                    <div className="absolute bottom-1 left-1.5">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8B3714" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xs text-[#7a6f68] dark:text-[#8c7e78]">Shot {i + 1}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}