const STEPS = [
  { num: 1, label: 'Choose Format', sub: 'Pick a layout',     short: 'Format' },
  { num: 2, label: 'Camera',        sub: 'Take your shots',   short: 'Camera' },
  { num: 3, label: 'Customize',     sub: 'Filter & frame',    short: 'Edit'   },
  { num: 4, label: 'Save & Share',  sub: 'Download or print', short: 'Save'   },
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

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

const PRIVACY_NOTE = "framr doesn't store, upload, or see your photos. All processing happens directly in your browser — nothing is sent to any server."

export default function Sidebar({ step, isDark, toggleDark }) {
  function ThemeBtn({ extraClass = '' }) {
    return (
      <button
        onClick={toggleDark}
        className={`w-8 h-8 rounded-full flex items-center justify-center bg-[#ede5db] dark:bg-[#2c2220] text-[#7a6f68] dark:text-[#8c7e78] hover:bg-[#e0d5c8] dark:hover:bg-[#352825] transition-colors ${extraClass}`}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>
    )
  }

  return (
    <>
      {/* ── Desktop: full sidebar (lg+) ── */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-white dark:bg-[#1a1210] border-r border-[#e5e0d8] dark:border-[#3d2f2b] flex-col">
        <div className="h-16 px-6 border-b border-[#e5e0d8] dark:border-[#3d2f2b] flex items-center gap-2 shrink-0">
          <Logo />
          <span className="font-display font-semibold text-[#1a1614] dark:text-[#ede8e0] text-xl tracking-tight">framr</span>
          <ThemeBtn extraClass="ml-auto" />
        </div>
        <nav className="p-6 flex flex-col">
          {STEPS.map((s, i) => {
            const done = step > s.num
            const active = step === s.num
            return (
              <div key={s.num} className="flex gap-3 items-start">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 transition-colors ${
                    done || active ? 'bg-[#8B3714] text-white' : 'border-2 border-[#d5cfc8] dark:border-[#3d2f2b] text-[#7a6f68] dark:text-[#5c4f4a]'
                  }`}>
                    {done ? <CheckIcon /> : s.num}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-px min-h-[28px] flex-1 mt-1 mb-1 ${done ? 'bg-[#8B3714]' : 'bg-[#e5e0d8] dark:bg-[#3d2f2b]'}`} />
                  )}
                </div>
                <div className={`pt-1 ${i < STEPS.length - 1 ? 'pb-7' : ''}`}>
                  <p className={`text-sm font-medium leading-none ${active ? 'text-[#1a1614] dark:text-[#ede8e0]' : 'text-[#7a6f68] dark:text-[#5c4f4a]'}`}>
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
        <div className="mt-auto p-5 border-t border-[#e5e0d8] dark:border-[#3d2f2b]">
          <p className="text-[10px] text-[#b0a898] dark:text-[#5c4f4a] leading-relaxed">{PRIVACY_NOTE}</p>
        </div>
      </aside>

      {/* ── Tablet: icon rail (md–lg) ── */}
      <aside className="hidden md:flex lg:hidden w-16 shrink-0 bg-white dark:bg-[#1a1210] border-r border-[#e5e0d8] dark:border-[#3d2f2b] flex-col">
        <div className="h-16 border-b border-[#e5e0d8] dark:border-[#3d2f2b] flex items-center justify-center shrink-0">
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
                    done || active ? 'bg-[#8B3714] text-white' : 'border-2 border-[#d5cfc8] dark:border-[#3d2f2b] text-[#7a6f68] dark:text-[#5c4f4a]'
                  }`}
                >
                  {done ? <CheckIcon /> : s.num}
                </div>
                <span className={`text-[9px] leading-none text-center ${active ? 'text-[#8B3714] font-semibold' : 'text-[#b0a898] dark:text-[#5c4f4a]'}`}>
                  {s.short}
                </span>
              </div>
            )
          })}
        </nav>
        <div className="mt-auto pb-5 flex justify-center">
          <ThemeBtn />
        </div>
      </aside>

      {/* ── Mobile: bottom tab bar (< md) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#1a1210] border-t border-[#e5e0d8] dark:border-[#3d2f2b] flex items-stretch safe-bottom">
        {STEPS.map((s) => {
          const done = step > s.num
          const active = step === s.num
          return (
            <div key={s.num} className="flex-1 flex flex-col items-center justify-center py-2 gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                done || active ? 'bg-[#8B3714] text-white' : 'border border-[#d5cfc8] dark:border-[#3d2f2b] text-[#b0a898] dark:text-[#5c4f4a]'
              }`}>
                {done ? <CheckIcon /> : s.num}
              </div>
              <span className={`text-[10px] leading-none ${active ? 'text-[#8B3714] font-semibold' : 'text-[#b0a898] dark:text-[#5c4f4a]'}`}>
                {s.short}
              </span>
            </div>
          )
        })}

        {/* Theme toggle as 5th item */}
        <div className="w-12 flex flex-col items-center justify-center py-2 gap-1 border-l border-[#e5e0d8] dark:border-[#3d2f2b]">
          <button
            onClick={toggleDark}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#7a6f68] dark:text-[#8c7e78] hover:bg-[#f5f0ea] dark:hover:bg-[#2c2220] transition-colors"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
          <span className="text-[10px] leading-none text-[#b0a898] dark:text-[#5c4f4a]">Theme</span>
        </div>
      </nav>
    </>
  )
}