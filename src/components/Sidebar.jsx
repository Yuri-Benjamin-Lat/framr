const STEPS = [
  { num: 1, label: 'Choose Format', sub: 'Pick a layout',       short: 'Format'   },
  { num: 2, label: 'Camera',        sub: 'Take your shots',     short: 'Camera'   },
  { num: 3, label: 'Customize',     sub: 'Filter & frame',      short: 'Edit'     },
  { num: 4, label: 'Save & Share',  sub: 'Download or print',   short: 'Save'     },
]

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function Logo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B3714" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  )
}

export default function Sidebar({ step }) {
  return (
    <>
      {/* ── Desktop: full sidebar (lg+) ── */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-white border-r border-[#e5e0d8] flex-col">
        <div className="h-16 px-6 border-b border-[#e5e0d8] flex items-center gap-2 shrink-0">
          <Logo />
          <span className="font-semibold text-[#1a1614] text-lg tracking-tight">Framr</span>
        </div>
        <nav className="p-6 flex flex-col">
          {STEPS.map((s, i) => {
            const done = step > s.num
            const active = step === s.num
            return (
              <div key={s.num} className="flex gap-3 items-start">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 transition-colors ${
                    done || active ? 'bg-[#8B3714] text-white' : 'border-2 border-[#d5cfc8] text-[#7a6f68]'
                  }`}>
                    {done ? <CheckIcon /> : s.num}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-px min-h-[28px] flex-1 mt-1 mb-1 ${done ? 'bg-[#8B3714]' : 'bg-[#e5e0d8]'}`} />
                  )}
                </div>
                <div className={`pt-1 ${i < STEPS.length - 1 ? 'pb-7' : ''}`}>
                  <p className={`text-sm font-medium leading-none ${active ? 'text-[#1a1614]' : 'text-[#7a6f68]'}`}>
                    {s.label}
                  </p>
                  {active && (
                    <p className="text-xs text-[#8B3714] mt-1.5">{s.sub}</p>
                  )}
                </div>
              </div>
            )
          })}
        </nav>
      </aside>

      {/* ── Tablet: icon rail (md–lg) ── */}
      <aside className="hidden md:flex lg:hidden w-16 shrink-0 bg-white border-r border-[#e5e0d8] flex-col">
        <div className="h-16 border-b border-[#e5e0d8] flex items-center justify-center shrink-0">
          <Logo />
        </div>
        <nav className="flex flex-col items-center py-6 gap-4">
          {STEPS.map((s) => {
            const done = step > s.num
            const active = step === s.num
            return (
              <div key={s.num} className="flex flex-col items-center gap-1">
                <div
                  title={s.label}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    done || active ? 'bg-[#8B3714] text-white' : 'border-2 border-[#d5cfc8] text-[#7a6f68]'
                  }`}
                >
                  {done ? <CheckIcon /> : s.num}
                </div>
                <span className={`text-[9px] leading-none text-center ${active ? 'text-[#8B3714] font-semibold' : 'text-[#b0a898]'}`}>
                  {s.short}
                </span>
              </div>
            )
          })}
        </nav>
      </aside>

      {/* ── Mobile: bottom tab bar (< md) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e5e0d8] flex safe-bottom">
        {STEPS.map((s) => {
          const done = step > s.num
          const active = step === s.num
          return (
            <div key={s.num} className="flex-1 flex flex-col items-center justify-center py-2 gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                done || active ? 'bg-[#8B3714] text-white' : 'border border-[#d5cfc8] text-[#b0a898]'
              }`}>
                {done ? <CheckIcon /> : s.num}
              </div>
              <span className={`text-[10px] leading-none ${active ? 'text-[#8B3714] font-semibold' : 'text-[#b0a898]'}`}>
                {s.short}
              </span>
            </div>
          )
        })}
      </nav>
    </>
  )
}