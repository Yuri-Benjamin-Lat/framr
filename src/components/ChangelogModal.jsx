import { useState } from 'react'

const V1_RELEASES = [
  {
    version: 'V1.0.1',
    date: 'May 2025',
    features: [
      'Improved layouts and spacing on mobile and tablet screens',
      'Introduced this changelog, accessible from the footer',
      'Square crop guide overlay on the camera for Polaroid Snap and Modern Grid — sides dim so you know exactly where to frame',
    ],
  },
  {
    version: 'V1.0.0',
    date: 'April 2026',
    description: 'framr is a browser-based instant photo booth — no app to download, no account needed, and nothing ever leaves your device. Open it, pick a layout, and start shooting.',
    features: [
      '5 layouts: Polaroid Snap, Vertical Strip, Landscape Sequence, Modern Grid, and Mixed Narrative',
      'Live camera capture with auto-shoot mode, countdown timer, and front/back flip',
      'Filter presets and frame color customization',
      'Drag-to-reorder photos before saving',
      'Download as PNG or JPEG, print, or share directly from your phone',
      'Fully responsive — works on mobile, tablet, and desktop',
      'Dark mode with a warm darkroom palette, remembered across sessions',
      'Privacy-first: everything runs in your browser, nothing is uploaded',
    ],
  },
]

function ArrowIcon({ direction }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {direction === 'right' ? <path d="M5 12h14M12 5l7 7-7 7"/> : <path d="M19 12H5M12 19l-7-7 7-7"/>}
    </svg>
  )
}

export default function ChangelogModal({ onClose }) {
  const [major, setMajor] = useState('v1')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#f5f0ea] dark:bg-[#1e1614] rounded-2xl shadow-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e0d8] dark:border-[#3d2f2b]">
          <div>
            <h2 className="font-semibold text-[#1a1614] dark:text-[#ede8e0] text-base">Changelog</h2>
            <p className="text-xs text-[#7a6f68] dark:text-[#8c7e78] mt-0.5">What's new in framr</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[#7a6f68] dark:text-[#8c7e78] hover:bg-[#e5e0d8] dark:hover:bg-[#3d2f2b] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Log */}
        <div className="overflow-y-auto h-[60vh] px-5 py-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#d5cfc8] dark:[&::-webkit-scrollbar-thumb]:bg-[#3d2f2b] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-[#8B3714] dark:[&::-webkit-scrollbar-thumb]:hover:bg-[#8B3714]">

          {major === 'v1' && (
            <div className="space-y-4">
              {V1_RELEASES.map((release, idx) => (
                <div key={release.version}>
                  {/* Version row */}
                  <div className="grid grid-cols-3 items-center mb-3">
                    <div />
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="font-semibold text-[#1a1614] dark:text-[#ede8e0] text-sm">{release.version}</span>
                      <span className="text-xs text-[#b0a898] dark:text-[#5c4f4a]">{release.date}</span>
                    </div>
                    <div className="flex justify-end">
                      {idx === 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-[#d5cfc8] dark:text-[#3d2f2b] cursor-not-allowed select-none">
                          V2.0.0 <ArrowIcon direction="right" />
                        </span>
                      )}
                    </div>
                  </div>

                  {release.description && <p className="text-xs text-[#4a3f3a] dark:text-[#c8bdb8] leading-relaxed mb-4">{release.description}</p>}

                  <div className="space-y-1.5">
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-[#8B3714]/10 text-[#8B3714] dark:bg-[#8B3714]/20 dark:text-[#c4714a] mb-1">
                      Features
                    </span>
                    <ul className="space-y-2">
                      {release.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-[#8B3714]/40 dark:bg-[#c4714a]/40 shrink-0" />
                          <span className="text-xs text-[#4a3f3a] dark:text-[#c8bdb8] leading-relaxed">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {idx < V1_RELEASES.length - 1 && (
                    <div className="mt-4 border-t border-[#e5e0d8] dark:border-[#3d2f2b]" />
                  )}
                </div>
              ))}
            </div>
          )}

          {major === 'v2' && (
            <div>
              <div className="grid grid-cols-3 items-center mb-3">
                <div className="flex justify-start">
                  <button
                    onClick={() => setMajor('v1')}
                    className="flex items-center gap-1 text-[10px] text-[#b0a898] dark:text-[#5c4f4a] hover:text-[#8B3714] dark:hover:text-[#c4714a] transition-colors"
                  >
                    <ArrowIcon direction="left" /> V1.x
                  </button>
                </div>
                <div className="flex justify-center">
                  <span className="font-semibold text-[#1a1614] dark:text-[#ede8e0] text-sm">V2.0.0</span>
                </div>
                <div />
              </div>

              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <span className="text-2xl">🚧</span>
                <p className="text-xs text-[#b0a898] dark:text-[#5c4f4a]">Nothing here yet — check back soon.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
