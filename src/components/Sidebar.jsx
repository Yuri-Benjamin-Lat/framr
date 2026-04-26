const STEPS = [
  { num: 1, label: 'Choose Format', sub: 'Pick a layout' },
  { num: 2, label: 'Camera', sub: 'Take your shots' },
  { num: 3, label: 'Customize', sub: 'Filter & frame' },
  { num: 4, label: 'Save & Share', sub: 'Download or print' },
]

export default function Sidebar({ step }) {
  return (
    <aside className="w-64 shrink-0 bg-white border-r border-[#e5e0d8] flex flex-col">
      <div className="h-16 px-6 border-b border-[#e5e0d8] flex items-center gap-2 shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B3714" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
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
                  {done
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : s.num}
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
  )
}