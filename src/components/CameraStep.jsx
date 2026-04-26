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
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#e5e0d8] bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-[#7a6f68] hover:text-[#1a1614] transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
            <span className="text-[#d5cfc8] select-none">|</span>
            <h2 className="font-medium text-[#1a1614]">Camera</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto / Manual toggle */}
            <button
              onClick={() => setAutoShoot(a => !a)}
              title={autoShoot
                ? 'Auto: one click captures all photos in sequence'
                : 'Manual: click Shoot once per photo'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                autoShoot
                  ? 'bg-[#8B3714] text-white border-[#8B3714]'
                  : 'bg-white text-[#7a6f68] border-[#d5cfc8] hover:border-[#8B3714] hover:text-[#8B3714]'
              }`}
            >
              {autoShoot ? (
                <>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
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

            <span className="text-[#d5cfc8] select-none">|</span>

            {/* Timer */}
            <span className="text-sm text-[#7a6f68]">Timer</span>
            {[3, 5, 10].map(t => (
              <button
                key={t}
                onClick={() => setTimerDuration(t)}
                className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                  timerDuration === t
                    ? 'bg-[#8B3714] text-white'
                    : 'bg-[#f0ece6] text-[#7a6f68] hover:bg-[#e5e0d8]'
                }`}
              >
                {t}s
              </button>
            ))}
          </div>
        </div>

        {/* Viewfinder */}
        <div className="flex-1 flex items-center justify-center px-8 py-4 bg-[#f5f0ea]">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? '[transform:scaleX(-1)]' : ''}`}
            />

            {!flashing && ready && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
                  backgroundSize: '33.33% 33.33%',
                }}
              />
            )}

            {!flashing && (
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
                <span className="text-white text-8xl font-bold drop-shadow-lg select-none">{countdown}</span>
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

        {/* Bottom controls */}
        <div className="flex items-end justify-center gap-8 pb-5 shrink-0">
          {allDone ? (
            <button
              onClick={onNext}
              className="bg-[#8B3714] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#732e10] transition-colors"
            >
              Continue to Customize →
            </button>
          ) : (
            <>
              {/* Flip camera — left of shoot button */}
              <button
                onClick={flipCamera}
                className="w-12 h-12 mb-1 rounded-full border-2 border-[#d5cfc8] bg-white flex items-center justify-center text-[#7a6f68] hover:border-[#8B3714] hover:text-[#8B3714] transition-colors"
                title="Flip camera"
              >
                <FlipIcon />
              </button>

              {/* Shoot */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={shoot}
                  disabled={!ready || countdown !== null}
                  className="w-16 h-16 rounded-full border-4 border-[#8B3714] bg-white flex items-center justify-center hover:bg-[#f5f0ea] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="w-9 h-9 rounded-full bg-[#8B3714]" />
                </button>
                <span className="text-sm text-[#7a6f68]">Shoot</span>
              </div>

              {/* Spacer for visual symmetry */}
              <div className="w-12 mb-1" />
            </>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="w-52 shrink-0 border-l border-[#e5e0d8] bg-white flex flex-col">
        <div className="h-16 px-4 border-b border-[#e5e0d8] flex items-center justify-between shrink-0">
          <span className="text-xs font-semibold text-[#7a6f68] uppercase tracking-wider">Captured</span>
          <span className="text-xs font-semibold text-[#8B3714]">{photos.length} of {totalShots}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {Array.from({ length: totalShots }).map((_, i) => {
            const photo = photos[i]
            return (
              <div key={i} className="relative aspect-video rounded-md overflow-hidden bg-[#f0ece6] border border-[#e5e0d8]">
                {photo ? (
                  <>
                    <img src={photo} alt={`Shot ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => retake(i)}
                      title="Remove"
                      className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white text-xs leading-none hover:bg-black/70 transition-colors"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-1 left-1.5">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8B3714" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xs text-[#7a6f68]">Shot {i + 1}</span>
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