export const FORMATS = [
  {
    id: 'polaroid',
    name: 'Polaroid Snap',
    description: '1 photo',
    photoCount: 1,
    layout: 'polaroid',
  },
  {
    id: 'vertical-strip',
    name: 'Vertical Filmstrip',
    description: '3 photos stacked',
    photoCount: 3,
    layout: 'vertical-strip',
  },
  {
    id: 'landscape-sequence',
    name: 'Landscape Sequence',
    description: '3 photos side-by-side',
    photoCount: 3,
    layout: 'landscape-sequence',
  },
  {
    id: 'modern-grid',
    name: 'Modern Grid',
    description: '4 photos, 2×2',
    photoCount: 4,
    layout: 'modern-grid',
  },
  {
    id: 'mixed-narrative',
    name: 'Mixed Narrative',
    description: '1 large + 3 small',
    photoCount: 4,
    layout: 'mixed-narrative',
  },
]

export const FILTERS = [
  { id: 'original',     name: 'Original',     css: 'none' },
  { id: 'hi-contrast',  name: 'Hi Contrast',  css: 'contrast(1.6) brightness(0.85)' },
  { id: 'noir',         name: 'Noir',         css: 'grayscale(100%) contrast(1.25) brightness(0.88)' },
  { id: 'kodak',        name: 'Kodak',        css: 'sepia(18%) contrast(0.92) brightness(1.08) saturate(1.35)' },
  { id: 'fuji',         name: 'Fuji',         css: 'contrast(0.94) brightness(1.06) saturate(0.88) hue-rotate(12deg)' },
  { id: 'golden-hour',  name: 'Golden Hour',  css: 'sepia(42%) saturate(1.6) brightness(1.08) contrast(0.94) hue-rotate(-12deg)' },
  { id: 'faded',        name: 'Faded',        css: 'contrast(0.76) brightness(1.18) saturate(0.65)' },
  { id: 'matte',        name: 'Matte',        css: 'contrast(0.82) brightness(1.06) saturate(0.42)' },
  { id: 'chrome',       name: 'Chrome',       css: 'contrast(1.35) brightness(0.88) saturate(0.72) hue-rotate(192deg)' },
  { id: 'vivid',        name: 'Vivid',        css: 'saturate(2) contrast(1.15)' },
]

export const FRAME_STYLES = [
  { id: 'square',  name: 'Square' },
  { id: 'rounded', name: 'Rounded' },
]

export const FRAME_COLORS = [
  { id: 'warm-white',       label: 'Warm White',       value: '#FFFEF9' },
  { id: 'antique-white',    label: 'Antique White',    value: '#F4F0E8' },
  { id: 'jet-black',        label: 'Jet Black',        value: '#1A1A1A' },
  { id: 'ebony',            label: 'Ebony',            value: '#2E2E2E' },
  { id: 'soft-black',       label: 'Soft Black',       value: '#4A4540' },
  { id: 'antique-gold',     label: 'Antique Gold',     value: '#C8A850' },
  { id: 'polished-silver',  label: 'Polished Silver',  value: '#B8B8B8' },
  { id: 'burnished-bronze', label: 'Burnished Bronze', value: '#8C6440' },
  { id: 'patina-copper',    label: 'Patina Copper',    value: '#6A9A8A' },
  { id: 'brushed-pewter',   label: 'Brushed Pewter',   value: '#9098A0' },
  { id: 'pale-oak',         label: 'Pale Oak',         value: '#E8C99A' },
  { id: 'honey-pine',       label: 'Honey Pine',       value: '#C89A62' },
  { id: 'warm-walnut',      label: 'Warm Walnut',      value: '#9A6A40' },
  { id: 'dark-mahogany',    label: 'Dark Mahogany',    value: '#5A3820' },
  { id: 'espresso',         label: 'Espresso',         value: '#3A2818' },
  { id: 'sapphire-blue',    label: 'Sapphire Blue',    value: '#1B6FA8' },
  { id: 'forest-emerald',   label: 'Forest Emerald',   value: '#2E8B4A' },
  { id: 'crimson-red',      label: 'Crimson Red',      value: '#B84030' },
  { id: 'amethyst-purple',  label: 'Amethyst Purple',  value: '#7A3B8C' },
  { id: 'amber-ochre',      label: 'Amber Ochre',      value: '#C87820' },
]