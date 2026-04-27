import { useEffect, useState } from 'react'

export default function SplashScreen({ onDone }) {
  const [exiting, setExiting] = useState(false)
  const [lensFlash, setLensFlash] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setLensFlash(true), 1700)
    const t2 = setTimeout(() => setExiting(true),   2100)
    const t3 = setTimeout(onDone,                   2700)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div
      onClick={onDone}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden ${
        exiting ? 'splash-exiting' : ''
      }`}
      style={{ background: 'radial-gradient(ellipse at center, #2a1208 0%, #110a07 70%)' }}
    >
      {/* Logo */}
      <div className="splash-logo flex flex-col items-center gap-6 relative z-10">
        <div className="relative flex items-center justify-center">

          {/* Ambient glow behind icon */}
          <div
            className="absolute w-32 h-32 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(139,55,20,0.22) 0%, transparent 70%)' }}
          />

          <svg
            width="72" height="72"
            viewBox="0 0 24 24" fill="none"
            stroke="#8B3714" strokeWidth="1.25"
            strokeLinecap="round" strokeLinejoin="round"
          >
            {/* Camera body */}
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>

            {/* Lens — fills white on flash */}
            <circle
              cx="12" cy="13" r="4"
              className={lensFlash ? 'lens-flash-fill' : ''}
            />

            {/* Expanding glow ring */}
            {lensFlash && (
              <circle
                cx="12" cy="13" r="5"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
                className="lens-glow-ring"
              />
            )}

            {/*
              4-pointed star sparkles at diagonal corners of the lens.
              Each polygon is a star centered at its position:
              outer radius 0.9, inner radius 0.36
              All share transform-origin at lens center (12,13)
              so they fly outward when scaled.
            */}
            {lensFlash && (
              <>
                {/* Top-right */}
                <polygon
                  points="16.1,8.0 16.35,8.65 17.0,8.9 16.35,9.15 16.1,9.8 15.85,9.15 15.2,8.9 15.85,8.65"
                  fill="white" stroke="none"
                  className="lens-sparkle"
                />
                {/* Top-left */}
                <polygon
                  points="7.9,8.0 8.15,8.65 8.8,8.9 8.15,9.15 7.9,9.8 7.65,9.15 7.0,8.9 7.65,8.65"
                  fill="white" stroke="none"
                  className="lens-sparkle"
                />
                {/* Bottom-left */}
                <polygon
                  points="7.9,16.2 8.15,16.85 8.8,17.1 8.15,17.35 7.9,18.0 7.65,17.35 7.0,17.1 7.65,16.85"
                  fill="white" stroke="none"
                  className="lens-sparkle"
                />
                {/* Bottom-right */}
                <polygon
                  points="16.1,16.2 16.35,16.85 17.0,17.1 16.35,17.35 16.1,18.0 15.85,17.35 15.2,17.1 15.85,16.85"
                  fill="white" stroke="none"
                  className="lens-sparkle"
                />
              </>
            )}
          </svg>
        </div>

        {/* Wordmark */}
        <span
          className="text-5xl md:text-6xl font-bold font-display"
          style={{ color: '#f5f0ea', letterSpacing: '-0.02em' }}
        >
          framr
        </span>
      </div>

      {/* Tagline */}
      <p
        className="splash-tagline mt-5 text-xs md:text-sm uppercase tracking-[0.22em] relative z-10"
        style={{ color: '#7a5040' }}
      >
        your instant photobooth
      </p>

      {/* Skip hint */}
      <p className="splash-hint absolute bottom-8 text-xs" style={{ color: '#3d2015' }}>
        tap to skip
      </p>
    </div>
  )
}