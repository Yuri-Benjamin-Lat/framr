import { FORMATS } from '../data/formats'

function FormatIcon({ layout }) {
  switch (layout) {
    case 'polaroid':
      return (
        <svg width="48" height="58" viewBox="0 0 48 58" fill="none">
          <rect x="4" y="4" width="40" height="36" fill="#d5cfc8" rx="2"/>
          <rect x="4" y="44" width="40" height="10" fill="#e8e3dc" rx="1"/>
        </svg>
      )
    case 'vertical-strip':
      return (
        <svg width="40" height="62" viewBox="0 0 40 62" fill="none">
          <rect x="2" y="2" width="36" height="17" fill="#d5cfc8" rx="2"/>
          <rect x="2" y="23" width="36" height="17" fill="#d5cfc8" rx="2"/>
          <rect x="2" y="44" width="36" height="17" fill="#d5cfc8" rx="2"/>
        </svg>
      )
    case 'landscape-sequence':
      return (
        <svg width="66" height="30" viewBox="0 0 66 30" fill="none">
          <rect x="2" y="2" width="18" height="26" fill="#d5cfc8" rx="2"/>
          <rect x="24" y="2" width="18" height="26" fill="#d5cfc8" rx="2"/>
          <rect x="46" y="2" width="18" height="26" fill="#d5cfc8" rx="2"/>
        </svg>
      )
    case 'modern-grid':
      return (
        <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
          <rect x="2" y="2" width="19" height="19" fill="#d5cfc8" rx="2"/>
          <rect x="25" y="2" width="19" height="19" fill="#d5cfc8" rx="2"/>
          <rect x="2" y="25" width="19" height="19" fill="#d5cfc8" rx="2"/>
          <rect x="25" y="25" width="19" height="19" fill="#d5cfc8" rx="2"/>
        </svg>
      )
    case 'mixed-narrative':
      return (
        <svg width="54" height="46" viewBox="0 0 54 46" fill="none">
          <rect x="2" y="2" width="28" height="42" fill="#d5cfc8" rx="2"/>
          <rect x="34" y="2" width="18" height="12" fill="#d5cfc8" rx="2"/>
          <rect x="34" y="17" width="18" height="12" fill="#d5cfc8" rx="2"/>
          <rect x="34" y="32" width="18" height="12" fill="#d5cfc8" rx="2"/>
        </svg>
      )
    default:
      return null
  }
}

export default function ChooseFormat({ format, onSelect, onNext }) {
  return (
    <div className="flex flex-col h-full p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#1a1614] mb-1">Choose a format</h1>
        <p className="text-[#7a6f68]">Select the layout for your photo strip</p>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1 content-start">
        {FORMATS.map(f => (
          <button
            key={f.id}
            onClick={() => onSelect(f)}
            className={`h-52 flex flex-col items-center justify-center gap-4 p-6 rounded-xl border-2 bg-white transition-all ${
              format.id === f.id
                ? 'border-[#8B3714] shadow-sm'
                : 'border-[#e5e0d8] hover:border-[#c5bfb8]'
            }`}
          >
            <div className="h-16 flex items-center justify-center">
              <FormatIcon layout={f.layout} />
            </div>
            <div className="text-center">
              <p className="font-medium text-[#1a1614] text-sm">{f.name}</p>
              <p className="text-xs text-[#7a6f68] mt-0.5">{f.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={onNext}
          className="bg-[#8B3714] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#732e10] transition-colors flex items-center gap-2"
        >
          Continue
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  )
}