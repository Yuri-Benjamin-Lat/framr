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
  { id: 'original', name: 'Original', css: 'none' },
  { id: 'bw', name: 'B&W', css: 'grayscale(100%)' },
  { id: 'sepia', name: 'Sepia', css: 'sepia(80%)' },
  { id: 'vintage', name: 'Vintage', css: 'sepia(40%) contrast(0.9) brightness(1.1) saturate(0.8)' },
  { id: 'hi-contrast', name: 'Hi Contrast', css: 'contrast(1.6) brightness(0.85)' },
  { id: 'cool', name: 'Cool', css: 'hue-rotate(200deg) saturate(0.9) brightness(1.05)' },
  { id: 'warm', name: 'Warm', css: 'sepia(30%) saturate(1.5) brightness(1.05)' },
  { id: 'vivid', name: 'Vivid', css: 'saturate(2) contrast(1.15)' },
]

export const FRAME_COLORS = [
  { id: 'white', label: 'White', value: '#ffffff' },
  { id: 'black', label: 'Black', value: '#1a1a1a' },
  { id: 'cream', label: 'Cream', value: '#f5f0e0' },
  { id: 'pink', label: 'Pink', value: '#f7c5c2' },
  { id: 'sky', label: 'Sky', value: '#c5dff0' },
  { id: 'navy', label: 'Navy', value: '#2a3560' },
]